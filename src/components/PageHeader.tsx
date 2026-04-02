import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import logoLight from "@/assets/logo-light.jpeg";
import logoDark from "@/assets/logo-dark.jpeg";

interface PageHeaderProps {
  title: string;
  backTo?: string;
  actions?: React.ReactNode;
}

const PageHeader = ({ title, backTo = "/home", actions }: PageHeaderProps) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className="bg-card border-b px-5 py-4">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(backTo)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="Roots & Reflections"
            className="h-8 w-8 rounded object-cover"
          />
          <h1 className="text-xl font-display font-bold text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {actions}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
