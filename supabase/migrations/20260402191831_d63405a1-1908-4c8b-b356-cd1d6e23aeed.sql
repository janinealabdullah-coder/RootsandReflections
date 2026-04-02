
CREATE POLICY "Creators can view their families"
  ON public.families FOR SELECT TO authenticated
  USING (auth.uid() = created_by);
