
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  family_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'capsule_unlocked',
  title text NOT NULL,
  body text,
  related_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Allow service role inserts (edge function uses service role)
-- No authenticated INSERT policy needed since edge function uses service_role

-- Index for fast lookups
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, is_read) WHERE is_read = false;

-- Allow capsules to be updated (for unlocking)
CREATE POLICY "Service can unlock capsules"
  ON public.memory_capsules FOR UPDATE TO authenticated
  USING (is_family_member(auth.uid(), family_id) AND auth.uid() = author_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
