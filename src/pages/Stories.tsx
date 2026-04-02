import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/hooks/use-family";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Loading stories...</p>
      </div>
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
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b px-5 py-5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">Home</span>
          </button>
          <h1 className="text-xl font-display font-bold text-foreground">
            Family Stories
          </h1>
          <div className="w-16" />
        </div>
      </div>

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
              style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Stories;
