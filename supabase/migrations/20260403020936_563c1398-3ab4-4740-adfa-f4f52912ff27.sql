
-- Fix: allow family creators to insert themselves as admin
DROP POLICY "Creators can add themselves to new families" ON public.family_members;

CREATE POLICY "Creators can add themselves to new families"
ON public.family_members FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.families WHERE id = family_id AND created_by = auth.uid()
  )
);
