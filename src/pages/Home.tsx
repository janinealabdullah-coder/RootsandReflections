import { useNavigate } from "react-router-dom";
import { BookOpen, TreeDeciduous, Clock, Mail } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b px-5 py-6">
        <div className="max-w-lg mx-auto">
          <p className="text-sm text-muted-foreground">Welcome back to</p>
          <h1 className="text-2xl font-display font-bold text-foreground">
            The Johnsons
          </h1>
          <p className="text-muted-foreground mt-1">3 members · 0 stories</p>
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
