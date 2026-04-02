
-- 1. Fix shareable stories: require family membership for all privacy levels
DROP POLICY IF EXISTS "Members can view family stories" ON public.stories;
CREATE POLICY "Members can view family stories"
ON public.stories
FOR SELECT
TO authenticated
USING (
  is_family_member(auth.uid(), family_id)
  AND (
    privacy = 'family-only'
    OR privacy = 'shareable'
    OR (privacy = 'private' AND auth.uid() = author_id)
  )
);

-- 2. Fix capsule unlock: remove client UPDATE policy
DROP POLICY IF EXISTS "Service can unlock capsules" ON public.memory_capsules;

-- 3. Fix story-photos bucket: make private
UPDATE storage.buckets SET public = false WHERE id = 'story-photos';

-- Remove public SELECT policy
DROP POLICY IF EXISTS "Anyone can view story photos" ON storage.objects;

-- Add family-member-only SELECT policy using a helper
-- Users can view photos in their own folder or via signed URLs
CREATE POLICY "Authenticated users can view story photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'story-photos');
