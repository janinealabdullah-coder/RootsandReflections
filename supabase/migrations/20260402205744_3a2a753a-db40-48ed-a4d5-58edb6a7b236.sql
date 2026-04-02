
-- Allow family creators to update their family (e.g. rename)
CREATE POLICY "Creators can update their families"
ON public.families
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Allow admins to remove members from the family
CREATE POLICY "Admins can delete family members"
ON public.family_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.families
    WHERE families.id = family_members.family_id
    AND families.created_by = auth.uid()
  )
);
