
-- Table to store parent-child relationships between family members
CREATE TABLE public.family_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  parent_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  child_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (parent_member_id, child_member_id)
);

-- Enable RLS
ALTER TABLE public.family_relationships ENABLE ROW LEVEL SECURITY;

-- Family members can view relationships in their family
CREATE POLICY "Members can view family relationships"
ON public.family_relationships
FOR SELECT
TO authenticated
USING (is_family_member(auth.uid(), family_id));

-- Family members can create relationships in their family
CREATE POLICY "Members can create family relationships"
ON public.family_relationships
FOR INSERT
TO authenticated
WITH CHECK (is_family_member(auth.uid(), family_id));

-- Family members can delete relationships in their family
CREATE POLICY "Members can delete family relationships"
ON public.family_relationships
FOR DELETE
TO authenticated
USING (is_family_member(auth.uid(), family_id));
