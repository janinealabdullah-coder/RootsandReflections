import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFamily } from "@/hooks/use-family";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import PageLayout from "@/components/PageLayout";
import ThemeToggle from "@/components/ThemeToggle";
import HamburgerMenu from "@/components/HamburgerMenu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Plus, LogIn, LogOut } from "lucide-react";
import logoLight from "@/assets/logo-light.jpeg";
import logoDark from "@/assets/logo-dark.jpeg";

const FamilySelect = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { signOut } = useAuth();
  const { families, switchFamily, loading } = useFamily();
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (!loading && families.length === 0) {
      navigate("/create-family");
    }
  }, [loading, families, navigate]);

  const handleSelect = (familyId: string) => {
    switchFamily(familyId);
    navigate("/home");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground text-lg">Loading your families...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-card border-b px-5 py-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HamburgerMenu />
              <img
                src={theme === "dark" ? logoDark : logoLight}
                alt="Roots & Reflections"
                className="h-9 w-9 rounded-lg object-cover"
              />
              <h1 className="text-xl font-display font-bold text-foreground">
                Your Families
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLogout(true)}
                aria-label="Log out"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Family list */}
        <div className="roots-container mt-8 space-y-4 flex-1">
          <p className="text-muted-foreground text-center mb-6">
            Choose a family group to view
          </p>

          {families.map((f, i) => (
            <button
              key={f.familyId}
              onClick={() => handleSelect(f.familyId)}
              className="roots-card w-full flex items-center gap-5 text-left hover:shadow-md transition-shadow animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <Users className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-foreground truncate">
                  {f.familyName}
                </p>
                <p className="text-muted-foreground text-sm">
                  {f.members.length} member{f.members.length !== 1 ? "s" : ""}
                </p>
              </div>
            </button>
          ))}

          {/* Actions */}
          <div className="pt-4 flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate("/create-family")}
            >
              <Plus className="w-4 h-4" />
              Create a New Family
            </Button>
            <Button
              variant="ghost"
              className="w-full gap-2"
              onClick={() => navigate("/join-family")}
            >
              <LogIn className="w-4 h-4" />
              Join with Invite Code
            </Button>
          </div>
        </div>
      </div>

      {/* Logout confirmation */}
      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Log Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default FamilySelect;
