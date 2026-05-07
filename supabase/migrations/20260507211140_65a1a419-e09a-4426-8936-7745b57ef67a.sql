
-- Add audio support to stories and capsules
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS audio_url text;
ALTER TABLE public.memory_capsules ADD COLUMN IF NOT EXISTS audio_url text;

-- Create story-audio bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-audio', 'story-audio', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for story-audio (mirrors story-photos pattern)
CREATE POLICY "Authenticated users can view story audio"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'story-audio');

CREATE POLICY "Users can upload their own story audio"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'story-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own story audio"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'story-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update join_family to notify family creator
CREATE OR REPLACE FUNCTION public.join_family(_invite_code text, _display_name text, _birth_year integer DEFAULT NULL::integer, _relationship text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _family_id uuid;
  _member_id uuid;
  _family_name text;
  _creator_id uuid;
BEGIN
  SELECT ic.family_id INTO _family_id
  FROM public.invite_codes ic
  WHERE ic.code = upper(trim(_invite_code))
    AND (ic.expires_at IS NULL OR ic.expires_at > now())
    AND (ic.max_uses IS NULL OR ic.use_count < ic.max_uses);

  IF _family_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = _family_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Already a member of this family';
  END IF;

  INSERT INTO public.family_members (family_id, user_id, display_name, birth_year, relationship, role)
  VALUES (_family_id, auth.uid(), _display_name, _birth_year, _relationship, 'member')
  RETURNING id INTO _member_id;

  UPDATE public.invite_codes
  SET use_count = use_count + 1
  WHERE code = upper(trim(_invite_code));

  -- Notify the family creator/admin
  SELECT f.created_by, f.name INTO _creator_id, _family_name
  FROM public.families f WHERE f.id = _family_id;

  IF _creator_id IS NOT NULL AND _creator_id <> auth.uid() THEN
    INSERT INTO public.notifications (user_id, family_id, type, title, body, related_id)
    VALUES (
      _creator_id,
      _family_id,
      'member_joined',
      _display_name || ' joined ' || _family_name,
      'A new family member has joined your family.',
      _member_id
    );
  END IF;

  RETURN _member_id;
END;
$function$;
