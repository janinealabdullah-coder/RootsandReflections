import { ReactNode } from "react";
import bgTree from "@/assets/bg-tree.jpeg";

interface PageLayoutProps {
  children: ReactNode;
  withBackground?: boolean;
  className?: string;
  overlayOpacity?: "light" | "normal";
}

const PageLayout = ({ children, withBackground = true, className = "", overlayOpacity = "normal" }: PageLayoutProps) => {
  const overlayClass = overlayOpacity === "light"
    ? "fixed inset-0 bg-background/15 dark:bg-background/25"
    : "fixed inset-0 bg-background/45 dark:bg-background/55";

  return (
    <div className={`min-h-screen relative ${className}`}>
      {withBackground && (
        <>
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bgTree})` }}
          />
          <div className={overlayClass} />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default PageLayout;
