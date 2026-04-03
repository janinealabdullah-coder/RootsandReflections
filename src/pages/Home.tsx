import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/hooks/use-family";
import { BookOpen, TreeDeciduous, Clock, Mail, LogOut, UserCircle, Link2, Settings } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import logoLight from "@/assets/logo-light.jpeg";
import logoDark from "@/assets/logo-dark.jpeg";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/NotificationBell";
import FamilySwitcher from "@/components/FamilySwitcher";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  {
    icon: Link2,
    label: "Invite Links",
    description: "Manage family invite codes",
    path: "/invites",
    color: "bg-muted text-muted-foreground",
  },
  {
    icon: Settings,
    label: "Settings",
    description: "Rename family & manage members",
    path: "/settings",
    color: "bg-muted text-muted-foreground",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const { family, loading: familyLoading } = useFamily();
  const [memberCount, setMemberCount] = useState(0);
  const [storyCount, setStoryCount] = useState(0);
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    if (!family) {
      if (!familyLoading) {
        navigate("/create-family");
      }
      setCountsLoading(false);
      return;
    }

    const loadCounts = async () => {
      setCountsLoading(true);
      const [{ count: members }, { count: stories }] = await Promise.all([
        supabase
          .from("family_members")
          .select("*", { count: "exact", head: true })
          .eq("family_id", family.familyId),
        supabase
          .from("stories")
          .select("*", { count: "exact", head: true })
          .eq("family_id", family.familyId),
      ]);
      setMemberCount(members || 0);
      setStoryCount(stories || 0);
      setCountsLoading(false);
    };

    loadCounts();
  }, [family, familyLoading, navigate]);

  if (familyLoading || countsLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground text-lg">Loading your family...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="pb-8">
      <div className="bg-card border-b px-5 py-6">
        <div className="max-w-lg mx-auto flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={theme === "dark" ? logoDark : logoLight}
              alt="Roots & Reflections"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <div>
              <p className="text-sm text-muted-foreground">Welcome back to</p>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {family?.familyName}
              </h1>
              <p className="text-muted-foreground mt-1">
                {memberCount} member{memberCount !== 1 ? "s" : ""} · {storyCount}{" "}
                stor{storyCount !== 1 ? "ies" : "y"}
              </p>
              <FamilySwitcher />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              aria-label="Edit profile"
            >
              <UserCircle className="w-5 h-5" />
            </Button>
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
    </PageLayout>
  );
};

export default Home;
