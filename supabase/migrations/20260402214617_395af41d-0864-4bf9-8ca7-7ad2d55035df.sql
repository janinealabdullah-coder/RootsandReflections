
-- Create story_likes table
CREATE TABLE public.story_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Enable RLS
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;

-- Family members can view likes
CREATE POLICY "Members can view family likes"
  ON public.story_likes
  FOR SELECT
  TO authenticated
  USING (public.is_family_member(auth.uid(), family_id));

-- Users can insert their own likes
CREATE POLICY "Users can like stories"
  ON public.story_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_family_member(auth.uid(), family_id));

-- Users can unlike (delete their own likes)
CREATE POLICY "Users can unlike stories"
  ON public.story_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated family members to insert notifications
CREATE POLICY "Members can create notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_family_member(auth.uid(), family_id));
