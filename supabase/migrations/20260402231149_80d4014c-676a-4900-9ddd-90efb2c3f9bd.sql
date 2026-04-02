
-- 1. Fix invite_codes: remove the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can lookup invite by code" ON public.invite_codes;

-- Create a security definer function for safe code lookup
CREATE OR REPLACE FUNCTION public.lookup_invite_code(_code text)
RETURNS TABLE (family_id uuid, family_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ic.family_id, f.name as family_name
  FROM public.invite_codes ic
  JOIN public.families f ON f.id = ic.family_id
  WHERE ic.code = _code
    AND (ic.expires_at IS NULL OR ic.expires_at > now())
    AND (ic.max_uses IS NULL OR ic.use_count < ic.max_uses)
  LIMIT 1;
$$;

-- 2. Fix story-photos storage: drop the permissive INSERT policy and add ownership check
DROP POLICY IF EXISTS "Authenticated users can upload story photos" ON storage.objects;
CREATE POLICY "Users can upload story photos to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'story-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Fix realtime: remove notifications from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;

-- 4. Fix memory_capsules: scope unlocked capsules to recipients + author
DROP POLICY IF EXISTS "Members can view unlocked capsules" ON public.memory_capsules;
CREATE POLICY "Members can view their capsules"
ON public.memory_capsules
FOR SELECT
TO authenticated
USING (
  is_family_member(auth.uid(), family_id)
  AND (
    auth.uid() = author_id
    OR (is_unlocked = true AND auth.uid() = ANY(recipient_ids))
  )
);
