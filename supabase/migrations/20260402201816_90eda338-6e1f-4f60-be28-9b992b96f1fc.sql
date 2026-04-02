
CREATE POLICY "Members can delete invite codes"
ON public.invite_codes
FOR DELETE
TO authenticated
USING (is_family_member(auth.uid(), family_id));
