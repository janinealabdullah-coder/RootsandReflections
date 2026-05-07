import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-is-admin";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Home,
  BookOpen,
  TreeDeciduous,
  Clock,
  Mail,
  Link2,
  Settings,
  UserCircle,
  Users,
  Shield,
  LogOut,
} from "lucide-react";
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

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: BookOpen, label: "Stories", path: "/stories" },
  { icon: TreeDeciduous, label: "Family Tree", path: "/tree" },
  { icon: Clock, label: "Timeline", path: "/timeline" },
  { icon: Mail, label: "Memory Capsule", path: "/capsule" },
  { icon: Link2, label: "Invite Links", path: "/invites" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: UserCircle, label: "Profile", path: "/profile" },
  { icon: Users, label: "Switch Family", path: "/family-select" },
];

const HamburgerMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const handleNav = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-5 pt-5 pb-3 border-b">
            <SheetTitle className="text-lg font-display">Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col py-2">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/60 ${
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {isAdmin && (
              <button
                onClick={() => handleNav("/admin")}
                className={`flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/60 ${
                  location.pathname === "/admin"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground"
                }`}
              >
                <Shield className="w-5 h-5 shrink-0" />
                <span>Admin</span>
              </button>
            )}

            <div className="border-t my-2" />

            <button
              onClick={() => {
                setOpen(false);
                setShowLogout(true);
              }}
              className="flex items-center gap-3 px-5 py-3 text-left text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Log Out</span>
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HamburgerMenu;
