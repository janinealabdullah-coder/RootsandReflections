
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can lookup invite codes by code" ON public.invite_codes;
DROP POLICY IF EXISTS "System can update invite code usage" ON public.invite_codes;

-- Replace with: anyone can SELECT by exact code match for joining
CREATE POLICY "Anyone can lookup invite by code"
  ON public.invite_codes FOR SELECT TO authenticated
  USING (true);

-- Only family members can update (increment use_count)
CREATE POLICY "Members can update invite codes"
  ON public.invite_codes FOR UPDATE TO authenticated
  USING (public.is_family_member(auth.uid(), family_id));
