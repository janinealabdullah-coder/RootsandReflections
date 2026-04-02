import { ReactNode } from "react";
import bgTree from "@/assets/bg-tree.jpeg";

interface PageLayoutProps {
  children: ReactNode;
  withBackground?: boolean;
  className?: string;
}

const PageLayout = ({ children, withBackground = true, className = "" }: PageLayoutProps) => {
  return (
    <div className={`min-h-screen relative ${className}`}>
      {withBackground && (
        <>
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bgTree})` }}
          />
          <div className="fixed inset-0 bg-background/85 dark:bg-background/90" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default PageLayout;
