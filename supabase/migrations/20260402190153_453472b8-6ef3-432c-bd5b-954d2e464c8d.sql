
-- Timestamp updater function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===================== FAMILIES =====================
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- ===================== FAMILY MEMBERS (profiles) =====================
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  birth_year INTEGER,
  relationship TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- ===================== INVITE CODES =====================
CREATE TABLE public.invite_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- ===================== STORIES =====================
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  year INTEGER,
  decade TEXT,
  privacy TEXT NOT NULL DEFAULT 'family-only' CHECK (privacy IN ('family-only', 'private', 'shareable')),
  tagged_members UUID[] DEFAULT '{}',
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- ===================== MEMORY CAPSULES =====================
CREATE TABLE public.memory_capsules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  unlock_date DATE NOT NULL,
  recipient_ids UUID[] NOT NULL DEFAULT '{}',
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.memory_capsules ENABLE ROW LEVEL SECURITY;

-- ===================== HELPER FUNCTION =====================
-- Check if a user is a member of a family (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = _user_id AND family_id = _family_id
  )
$$;

-- ===================== RLS POLICIES =====================

-- Families: members can view their families
CREATE POLICY "Members can view their families"
  ON public.families FOR SELECT TO authenticated
  USING (public.is_family_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create families"
  ON public.families FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Family Members: members can view co-members
CREATE POLICY "Members can view family members"
  ON public.family_members FOR SELECT TO authenticated
  USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Authenticated users can join families"
  ON public.family_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can update their own membership"
  ON public.family_members FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Invite Codes: members can view, creators can create
CREATE POLICY "Members can view invite codes"
  ON public.invite_codes FOR SELECT TO authenticated
  USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Members can create invite codes"
  ON public.invite_codes FOR INSERT TO authenticated
  WITH CHECK (public.is_family_member(auth.uid(), family_id));

-- Anyone authenticated can look up an invite code by code value (to join)
CREATE POLICY "Anyone can lookup invite codes by code"
  ON public.invite_codes FOR SELECT TO authenticated
  USING (true);

-- Update invite code use_count
CREATE POLICY "System can update invite code usage"
  ON public.invite_codes FOR UPDATE TO authenticated
  USING (true);

-- Stories: family members can CRUD
CREATE POLICY "Members can view family stories"
  ON public.stories FOR SELECT TO authenticated
  USING (
    (privacy = 'family-only' AND public.is_family_member(auth.uid(), family_id))
    OR (privacy = 'private' AND auth.uid() = author_id)
    OR privacy = 'shareable'
  );

CREATE POLICY "Members can create stories"
  ON public.stories FOR INSERT TO authenticated
  WITH CHECK (public.is_family_member(auth.uid(), family_id) AND auth.uid() = author_id);

CREATE POLICY "Authors can update their stories"
  ON public.stories FOR UPDATE TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their stories"
  ON public.stories FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

-- Memory Capsules
CREATE POLICY "Members can view unlocked capsules"
  ON public.memory_capsules FOR SELECT TO authenticated
  USING (
    public.is_family_member(auth.uid(), family_id)
    AND (is_unlocked = true OR auth.uid() = author_id)
  );

CREATE POLICY "Members can create capsules"
  ON public.memory_capsules FOR INSERT TO authenticated
  WITH CHECK (public.is_family_member(auth.uid(), family_id) AND auth.uid() = author_id);

-- ===================== TRIGGERS =====================
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== STORAGE =====================
INSERT INTO storage.buckets (id, name, public) VALUES ('story-photos', 'story-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Anyone can view story photos"
  ON storage.objects FOR SELECT USING (bucket_id = 'story-photos');

CREATE POLICY "Authenticated users can upload story photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'story-photos');

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
