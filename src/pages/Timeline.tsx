import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/hooks/use-family";
import { ArrowLeft, BookOpen, Calendar, ChevronRight, Lock, Globe, Users, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Story {
  id: string;
  title: string;
  content: string;
  year: number | null;
  decade: string | null;
  photo_urls: string[] | null;
  tagged_members: string[] | null;
  privacy: string;
  author_id: string;
  created_at: string;
}

const DECADE_ORDER = [
  "2020s", "2010s", "2000s", "1990s", "1980s",
  "1970s", "1960s", "1950s", "1940s", "1930s",
  "1920s", "Earlier",
];

const privacyLabels: Record<string, { icon: typeof Users; label: string }> = {
  "family-only": { icon: Users, label: "Family only" },
  private: { icon: Lock, label: "Private" },
  shareable: { icon: Globe, label: "Shareable" },
};

const Timeline = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { family, loading: familyLoading } = useFamily();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    if (!family) return;

    const load = async () => {
      const { data } = await supabase
        .from("stories")
        .select("id, title, content, year, decade, photo_urls, author_id, created_at")
        .eq("family_id", family.familyId)
        .order("year", { ascending: false, nullsFirst: false });

      setStories(data || []);

      const lookup: Record<string, string> = {};
      family.members.forEach((m) => {
        lookup[m.user_id] = m.display_name;
      });
      setMembers(lookup);
      setLoading(false);
    };

    load();
  }, [family]);

  // Filter stories
  const filtered = useMemo(() => {
    let result = stories;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q)
      );
    }
    if (authorFilter) {
      result = result.filter((s) => s.author_id === authorFilter);
    }
    return result;
  }, [stories, search, authorFilter]);

  // Group filtered stories by decade
  const grouped: Record<string, Story[]> = {};
  filtered.forEach((story) => {
    const dec = story.decade || (story.year ? `${Math.floor(story.year / 10) * 10}s` : "Undated");
    if (!grouped[dec]) grouped[dec] = [];
    grouped[dec].push(story);
  });

  // Sort decades
  const sortedDecades = Object.keys(grouped).sort((a, b) => {
    const ai = DECADE_ORDER.indexOf(a);
    const bi = DECADE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a < b ? 1 : -1;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  if (familyLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Loading timeline…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="bg-card border-b px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">Timeline</h1>
            <p className="text-sm text-muted-foreground">Stories through the decades</p>
          </div>
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="max-w-lg mx-auto px-5 mt-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search stories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Author filter pills */}
        {Object.keys(members).length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setAuthorFilter(null)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                !authorFilter
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              All
            </button>
            {Object.entries(members).map(([userId, name]) => (
              <button
                key={userId}
                onClick={() => setAuthorFilter(authorFilter === userId ? null : userId)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  authorFilter === userId
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {(search || authorFilter) && (
          <p className="text-xs text-muted-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      <div className="max-w-lg mx-auto px-5 mt-6">
        {sortedDecades.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">
              No stories yet. Share a memory to start your family timeline.
            </p>
            <Button variant="outline" onClick={() => navigate("/stories")}>
              Share a Story
            </Button>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />

            {sortedDecades.map((decade, di) => (
              <div key={decade} className="mb-10 last:mb-0">
                {/* Decade label */}
                <div className="relative flex items-center gap-4 mb-4">
                  <div className="relative z-10 w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-md">
                    <span className="text-primary-foreground text-xs font-bold">
                      {decade.replace("s", "").slice(-2) || "?"}
                    </span>
                  </div>
                  <h2 className="text-lg font-display font-bold text-foreground">{decade}</h2>
                  <span className="text-sm text-muted-foreground">
                    {grouped[decade].length} stor{grouped[decade].length !== 1 ? "ies" : "y"}
                  </span>
                </div>

                {/* Stories in this decade */}
                <div className="ml-[18px] pl-8 border-l-0 space-y-3">
                  {grouped[decade].map((story, si) => (
                    <div
                      key={story.id}
                      className="roots-card relative animate-fade-up"
                      style={{ animationDelay: `${(di * 0.1) + (si * 0.05)}s`, opacity: 0 }}
                    >
                      {/* Connector dot */}
                      <div className="absolute -left-[calc(2rem+5px)] top-5 w-2.5 h-2.5 rounded-full bg-muted-foreground/30 border-2 border-background" />

                      {/* Photo thumbnail */}
                      {story.photo_urls && story.photo_urls.length > 0 && (
                        <div className="mb-3 -mx-1 -mt-1 rounded-lg overflow-hidden h-32">
                          <img
                            src={story.photo_urls[0]}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground truncate">{story.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {story.content}
                          </p>
                        </div>
                        {story.year && (
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                            {story.year}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{members[story.author_id] || "Unknown"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
