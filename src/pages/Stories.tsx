import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/hooks/use-family";
import { useStoryLikes } from "@/hooks/use-story-likes";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StoryCard from "@/components/StoryCard";
import StoryForm from "@/components/StoryForm";

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

const Stories = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { family, loading: familyLoading } = useFamily();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { getLikes, toggleLike } = useStoryLikes(family?.familyId);

  const loadStories = async () => {
    if (!family) return;
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .eq("family_id", family.familyId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading stories", description: error.message, variant: "destructive" });
    } else {
      setStories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (family) loadStories();
  }, [family]);

  if (familyLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground text-lg">Loading stories...</p>
        </div>
      </PageLayout>
    );
  }

  if (showForm) {
    return (
      <StoryForm
        familyId={family!.familyId}
        members={family!.members}
        userId={user!.id}
        onBack={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          loadStories();
          toast({ title: "Story shared!", description: "Your memory has been saved." });
        }}
      />
    );
  }

  return (
    <PageLayout>
      <div className="pb-8">
      <PageHeader title="Family Stories" />

      <div className="roots-container mt-6 space-y-4">
        <Button
          size="lg"
          className="w-full gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-5 h-5" />
          Share a New Story
        </Button>

        {stories.length === 0 ? (
          <div className="roots-card text-center py-12 space-y-3">
            <span className="text-4xl">📖</span>
            <p className="roots-heading-2 text-xl">No stories yet</p>
            <p className="roots-body-large text-base">
              Be the first to share a family memory.
            </p>
          </div>
        ) : (
          stories.map((story, i) => (
            <StoryCard
              key={story.id}
              story={story}
              members={family!.members}
              isAuthor={story.author_id === user!.id}
              likeData={getLikes(story.id)}
              onToggleLike={() => toggleLike(story.id, story.author_id, story.title)}
              style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
            />
          ))
        )}
      </div>
      </div>
    </PageLayout>
  );
};

export default Stories;
