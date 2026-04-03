import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LikeData {
  count: number;
  likedByMe: boolean;
}

export const useStoryLikes = (familyId: string | undefined) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<Record<string, LikeData>>({});

  const loadLikes = useCallback(async () => {
    if (!familyId || !user) return;

    const { data } = await supabase
      .from("story_likes")
      .select("story_id, user_id")
      .eq("family_id", familyId);

    if (!data) return;

    const map: Record<string, LikeData> = {};
    data.forEach((like) => {
      if (!map[like.story_id]) {
        map[like.story_id] = { count: 0, likedByMe: false };
      }
      map[like.story_id].count++;
      if (like.user_id === user.id) {
        map[like.story_id].likedByMe = true;
      }
    });
    setLikes(map);
  }, [familyId, user]);

  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  const toggleLike = async (storyId: string, storyAuthorId: string, storyTitle: string) => {
    if (!user || !familyId) return;

    const current = likes[storyId] || { count: 0, likedByMe: false };

    if (current.likedByMe) {
      // Unlike
      setLikes((prev) => ({
        ...prev,
        [storyId]: { count: current.count - 1, likedByMe: false },
      }));
      await supabase
        .from("story_likes")
        .delete()
        .eq("story_id", storyId)
        .eq("user_id", user.id);
    } else {
      // Like
      setLikes((prev) => ({
        ...prev,
        [storyId]: { count: current.count + 1, likedByMe: true },
      }));
      await supabase.from("story_likes").insert({
        story_id: storyId,
        user_id: user.id,
        family_id: familyId,
      });

      // Send notification to story author (if not self)
      if (storyAuthorId !== user.id) {
        // Get liker's name
        const { data: member } = await supabase
          .from("family_members")
          .select("display_name")
          .eq("user_id", user.id)
          .eq("family_id", familyId)
          .maybeSingle();

        const likerName = member?.display_name || "Someone";

        await supabase.rpc("create_notification", {
          _user_id: storyAuthorId,
          _family_id: familyId,
          _type: "story_liked",
          _title: `${likerName} loved your story`,
          _body: `"${storyTitle}"`,
          _related_id: storyId,
        });
      }
    }
  };

  const getLikes = (storyId: string): LikeData => {
    return likes[storyId] || { count: 0, likedByMe: false };
  };

  return { getLikes, toggleLike };
};
