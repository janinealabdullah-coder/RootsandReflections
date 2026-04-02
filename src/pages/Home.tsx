import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, TreeDeciduous, Clock, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/NotificationBell";

const features = [
  {
    icon: BookOpen,
    label: "Share a Story",
    description: "Write about a family memory",
    path: "/stories",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: TreeDeciduous,
    label: "Family Tree",
    description: "See how everyone connects",
    path: "/tree",
    color: "bg-secondary/20 text-secondary",
  },
  {
    icon: Clock,
    label: "Timeline",
    description: "Browse memories by decade",
    path: "/timeline",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: Mail,
    label: "Memory Capsule",
    description: "Write a message for the future",
    path: "/capsule",
    color: "bg-destructive/10 text-destructive",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [family, setFamily] = useState<{ id: string; name: string } | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [storyCount, setStoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadFamily = async () => {
      // Get user's family membership
      const { data: membership } = await supabase
        .from("family_members")
        .select("family_id, families(id, name)")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        navigate("/");
        return;
      }

      const fam = membership.families as any;
      setFamily({ id: fam.id, name: fam.name });

      // Get counts
      const [{ count: members }, { count: stories }] = await Promise.all([
        supabase
          .from("family_members")
          .select("*", { count: "exact", head: true })
          .eq("family_id", fam.id),
        supabase
          .from("stories")
          .select("*", { count: "exact", head: true })
          .eq("family_id", fam.id),
      ]);

      setMemberCount(members || 0);
      setStoryCount(stories || 0);
      setLoading(false);
    };

    loadFamily();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Loading your family...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-card border-b px-5 py-6">
        <div className="max-w-lg mx-auto flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back to</p>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {family?.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {memberCount} member{memberCount !== 1 ? "s" : ""} · {storyCount}{" "}
              stor{storyCount !== 1 ? "ies" : "y"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="roots-container mt-6 space-y-4">
        {features.map((feature, i) => (
          <button
            key={feature.label}
            onClick={() => navigate(feature.path)}
            className="roots-card w-full flex items-center gap-5 text-left hover:shadow-md transition-shadow animate-fade-up"
            style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
          >
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${feature.color}`}
            >
              <feature.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {feature.label}
              </p>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
