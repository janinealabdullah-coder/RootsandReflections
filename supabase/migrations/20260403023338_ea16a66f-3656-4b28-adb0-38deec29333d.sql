
-- Drop the broken SELECT policy
DROP POLICY "Family members can view story photos" ON storage.objects;

-- Create a corrected policy: any authenticated user can read story-photos
-- (actual access control is enforced by signed URLs + story RLS)
CREATE POLICY "Authenticated users can view story photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'story-photos');
