-- 1. Fix family_members role escalation: restrict updatable columns
DROP POLICY "Members can update their own membership" ON public.family_members;

CREATE POLICY "Members can update their own profile info"
ON public.family_members FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a trigger to prevent role changes by non-admins
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If role is being changed, verify the current user is a family admin
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_id = OLD.family_id
        AND user_id = auth.uid()
        AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Only family admins can change member roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_role_escalation
BEFORE UPDATE ON public.family_members
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_self_escalation();

-- 2. Fix notification spoofing: remove client INSERT policy
DROP POLICY "Members can create notifications" ON public.notifications;

-- Create a SECURITY DEFINER function for system-only notification creation
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _family_id uuid,
  _type text,
  _title text,
  _body text DEFAULT NULL,
  _related_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, family_id, type, title, body, related_id)
  VALUES (_user_id, _family_id, _type, _title, _body, _related_id)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- 3. Fix invite code tampering: restrict to creator only
DROP POLICY "Members can update invite codes" ON public.invite_codes;

CREATE POLICY "Creators can update their own invite codes"
ON public.invite_codes FOR UPDATE
USING (
  is_family_member(auth.uid(), family_id)
  AND created_by = auth.uid()
);

-- 4. Fix story photos storage bypass: remove overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view story photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view story photos" ON storage.objects;