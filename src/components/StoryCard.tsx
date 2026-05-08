import { CSSProperties, useState } from "react";
import { Lock, Globe, Users, Calendar, Heart, Flag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Story {
  id: string;
  title: string;
  content: string;
  year: number | null;
  decade: string | null;
  privacy: string;
  photo_urls: string[] | null;
  tagged_members: string[] | null;
  author_id: string;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  display_name: string;
}

interface LikeData {
  count: number;
  likedByMe: boolean;
}

const privacyIcons = {
  "family-only": { icon: Users, label: "Family only" },
  private: { icon: Lock, label: "Private" },
  shareable: { icon: Globe, label: "Shareable" },
};

const StoryCard = ({
  story,
  members,
  isAuthor,
  style,
  likeData,
  onToggleLike,
}: {
  story: Story;
  members: Member[];
  isAuthor: boolean;
  style?: CSSProperties;
  likeData?: LikeData;
  onToggleLike?: () => void;
}) => {
  const { user } = useAuth();
  const [flagOpen, setFlagOpen] = useState(false);
  const [reason, setReason] = useState("This story is inaccurate");
  const [submitting, setSubmitting] = useState(false);

  const privacyInfo =
    privacyIcons[story.privacy as keyof typeof privacyIcons] ||
    privacyIcons["family-only"];
  const PrivacyIcon = privacyInfo.icon;

  const taggedNames = (story.tagged_members || [])
    .map((uid) => members.find((m) => m.user_id === uid)?.display_name)
    .filter(Boolean);

  const authorName =
    members.find((m) => m.user_id === story.author_id)?.display_name || "Unknown";
  const myName =
    members.find((m) => m.user_id === user?.id)?.display_name || "A family member";

  const timeLabel = story.year
    ? String(story.year)
    : story.decade
    ? story.decade
    : null;

  const showRequestRemoval = !!user && user.id !== story.author_id;

  const handleSubmitFlag = async () => {
    setSubmitting(true);
    try {
      const { data: storyRow, error: storyErr } = await supabase
        .from("stories")
        .select("family_id")
        .eq("id", story.id)
        .single();
      if (storyErr || !storyRow) throw storyErr || new Error("Story not found");

      const { data: famRow, error: famErr } = await supabase
        .from("families")
        .select("created_by")
        .eq("id", storyRow.family_id)
        .single();
      if (famErr || !famRow) throw famErr || new Error("Family not found");

      const { error: rpcErr } = await supabase.rpc("create_notification", {
        _user_id: famRow.created_by,
        _family_id: storyRow.family_id,
        _type: "story_flag",
        _title: `${myName} requested removal of a story`,
        _body: `Story: "${story.title}"\nReason: ${reason}`,
        _related_id: story.id,
      });
      if (rpcErr) throw rpcErr;

      toast.success("Your request has been sent to the family admin.");
      setFlagOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Could not send request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="roots-card space-y-3 animate-fade-up" style={style}>
      {/* Photos */}
      {story.photo_urls && story.photo_urls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto -mx-2 px-2 pb-2">
          {story.photo_urls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Photo ${i + 1} for ${story.title}`}
              loading="lazy"
              className="w-32 h-24 object-cover rounded-xl shrink-0 border"
            />
          ))}
        </div>
      )}

      {/* Title & content */}
      <h3 className="text-lg font-display font-bold text-foreground">
        {story.title}
      </h3>
      <p className="text-foreground leading-relaxed line-clamp-4">
        {story.content}
      </p>

      {/* Tags */}
      {taggedNames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {taggedNames.map((name) => (
            <span
              key={name}
              className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Like button + Meta row */}
      <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
        <div className="flex items-center gap-3">
          <span>
            By <strong className="text-foreground">{authorName}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Like button */}
          {onToggleLike && (
            <button
              onClick={onToggleLike}
              className={`flex items-center gap-1 transition-colors ${
                likeData?.likedByMe
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-red-400"
              }`}
              aria-label={likeData?.likedByMe ? "Unlike" : "Like"}
            >
              <Heart
                className={`w-4 h-4 ${likeData?.likedByMe ? "fill-current" : ""}`}
              />
              {(likeData?.count || 0) > 0 && (
                <span className="text-xs font-medium">{likeData?.count}</span>
              )}
            </button>
          )}
          {timeLabel && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {timeLabel}
            </span>
          )}
          <span className="flex items-center gap-1" title={privacyInfo.label}>
            <PrivacyIcon className="w-3.5 h-3.5" />
            {privacyInfo.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
