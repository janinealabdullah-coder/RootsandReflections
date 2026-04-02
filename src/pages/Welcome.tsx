import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import heroTree from "@/assets/hero-tree.jpg";
import logo from "@/assets/logo.jpeg";

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect logged-in users straight to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleStart = () => {
    if (user) {
      navigate("/create-family");
    } else {
      navigate("/auth?next=/create-family");
    }
  };

  const handleJoin = () => {
    if (user) {
      navigate("/join-family");
    } else {
      navigate("/auth?next=/join-family");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Image — willow tree */}
      <div className="relative w-full h-[40rem] md:h-[44rem] overflow-hidden">
        <img
          src={heroTree}
          alt="A serene willow tree by water at twilight with fireflies"
          className="w-full h-full object-cover object-top"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 80%, hsl(var(--background)) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="roots-container flex-1 flex flex-col -mt-12 relative z-10">
        <div className="text-center space-y-4 animate-fade-up">
          {/* Logo */}
          <img
            src={logo}
            alt="Roots & Reflections logo"
            className="w-24 h-24 mx-auto rounded-2xl shadow-md object-cover"
          />
          <h1 className="roots-heading-1">
            Roots &<br />
            Reflections
          </h1>
          <p className="roots-body-large max-w-sm mx-auto">
            Preserve your family's stories, memories, and connections — together.
          </p>
        </div>

        <div
          className="mt-10 space-y-4 animate-fade-up"
          style={{ animationDelay: "0.2s", opacity: 0 }}
        >
          <Button size="xl" className="w-full" onClick={handleStart}>
            Start Your Family
          </Button>
          <Button variant="outline" size="xl" className="w-full" onClick={handleJoin}>
            Join a Family
          </Button>
          <Button variant="ghost" size="default" className="w-full" onClick={() => navigate(user ? "/home" : "/auth")}>
            {user ? "Go to Dashboard" : "Already have an account? Log in"}
          </Button>
        </div>

        <div
          className="mt-8 text-center animate-fade-up"
          style={{ animationDelay: "0.4s", opacity: 0 }}
        >
          <p className="text-muted-foreground text-base">
            Your stories stay private — only your family can see them.
          </p>
        </div>

        <div
          className="mt-auto pb-8 pt-10 animate-fade-up"
          style={{ animationDelay: "0.6s", opacity: 0 }}
        >
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: "📖", label: "Stories" },
              { icon: "🌳", label: "Family Tree" },
              { icon: "💌", label: "Time Capsules" },
            ].map((item) => (
              <div
                key={item.label}
                className="roots-card flex flex-col items-center gap-2 py-4"
              >
                <span className="text-3xl" role="img" aria-label={item.label}>
                  {item.icon}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
