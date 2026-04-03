
-- 1. Fix family join bypass: replace INSERT policy with RPC-based join
DROP POLICY "Authenticated users can join families" ON public.family_members;

-- Create secure join function that validates invite codes
CREATE OR REPLACE FUNCTION public.join_family(
  _invite_code text,
  _display_name text,
  _birth_year integer DEFAULT NULL,
  _relationship text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _family_id uuid;
  _member_id uuid;
BEGIN
  -- Validate invite code
  SELECT ic.family_id INTO _family_id
  FROM public.invite_codes ic
  WHERE ic.code = upper(trim(_invite_code))
    AND (ic.expires_at IS NULL OR ic.expires_at > now())
    AND (ic.max_uses IS NULL OR ic.use_count < ic.max_uses);

  IF _family_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = _family_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Already a member of this family';
  END IF;

  -- Insert member with forced 'member' role
  INSERT INTO public.family_members (family_id, user_id, display_name, birth_year, relationship, role)
  VALUES (_family_id, auth.uid(), _display_name, _birth_year, _relationship, 'member')
  RETURNING id INTO _member_id;

  -- Increment invite code use count
  UPDATE public.invite_codes
  SET use_count = use_count + 1
  WHERE code = upper(trim(_invite_code));

  RETURN _member_id;
END;
$$;

-- Keep a restricted INSERT policy for family creators only (they create themselves as admin when creating a family)
CREATE POLICY "Creators can add themselves to new families"
ON public.family_members FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'member'
  AND EXISTS (
    SELECT 1 FROM public.families WHERE id = family_id AND created_by = auth.uid()
  )
);

-- 2. Fix policy scoping: re-scope UPDATE policies to authenticated
DROP POLICY "Members can update their own profile info" ON public.family_members;
CREATE POLICY "Members can update their own profile info"
ON public.family_members FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY "Creators can update their own invite codes" ON public.invite_codes;
CREATE POLICY "Creators can update their own invite codes"
ON public.invite_codes FOR UPDATE
TO authenticated
USING (is_family_member(auth.uid(), family_id) AND created_by = auth.uid());

-- 3. Fix avatar upload path bypass
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;

-- Find and replace the INSERT policy for avatars bucket
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd = 'INSERT'
    AND qual IS NULL
    AND (with_check::text LIKE '%avatars%' AND with_check::text NOT LIKE '%foldername%')
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4. Fix story photos: add SELECT and DELETE policies
CREATE POLICY "Family members can view story photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'story-photos'
  AND is_family_member(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY "Users can delete their own story photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'story-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
