import { CSSProperties } from "react";
import { Lock, Globe, Users, Calendar } from "lucide-react";

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
}: {
  story: Story;
  members: Member[];
  isAuthor: boolean;
  style?: CSSProperties;
}) => {
  const privacyInfo =
    privacyIcons[story.privacy as keyof typeof privacyIcons] ||
    privacyIcons["family-only"];
  const PrivacyIcon = privacyInfo.icon;

  const taggedNames = (story.tagged_members || [])
    .map((uid) => members.find((m) => m.user_id === uid)?.display_name)
    .filter(Boolean);

  const authorName =
    members.find((m) => m.user_id === story.author_id)?.display_name || "Unknown";

  const timeLabel = story.year
    ? String(story.year)
    : story.decade
    ? story.decade
    : null;

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

      {/* Meta row */}
      <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
        <span>
          By <strong className="text-foreground">{authorName}</strong>
        </span>
        <div className="flex items-center gap-3">
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
