import { Link } from "react-router-dom";

const SiteFooter = () => {
  return (
    <footer className="w-full py-6 px-5 text-center text-sm text-muted-foreground border-t border-border/40 bg-background/30 backdrop-blur-sm relative z-10">
      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <Link to="/privacy" className="underline-offset-4 hover:underline hover:text-foreground transition-colors">
          Privacy Policy
        </Link>
        <Link to="/terms" className="underline-offset-4 hover:underline hover:text-foreground transition-colors">
          Terms &amp; Conditions
        </Link>
        <Link to="/contact" className="underline-offset-4 hover:underline hover:text-foreground transition-colors">
          Contact Us
        </Link>
      </nav>
      <p className="mt-3 text-xs">
        © {new Date().getFullYear()} TJBell Collective · Roots &amp; Reflections
      </p>
    </footer>
  );
};

export default SiteFooter;
