import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallAppCard = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect if already installed (standalone display mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast({ title: "App installed", description: "Roots & Reflections is now on your home screen." });
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        toast({ title: "Installing...", description: "The app is being added to your home screen." });
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSHelp((s) => !s);
    } else {
      setShowIOSHelp((s) => !s);
    }
  };

  return (
    <section className="roots-card space-y-4">
      <div className="flex items-center gap-2">
        <Smartphone className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-display font-bold text-foreground">
          Add App to Home Screen
        </h2>
      </div>

      {isInstalled ? (
        <p className="text-base text-muted-foreground flex items-center gap-2">
          <Check className="w-5 h-5 text-primary" />
          The app is already installed on this device.
        </p>
      ) : (
        <>
          <p className="text-base text-foreground">
            Install Roots &amp; Reflections on your phone or tablet for a faster, full-screen experience — just like a regular app.
          </p>

          <Button onClick={handleInstall} className="gap-2" size="lg">
            <Download className="w-5 h-5" />
            {deferredPrompt ? "Install App" : "Show Install Steps"}
          </Button>

          {showIOSHelp && isIOS && (
            <div className="mt-3 rounded-lg bg-muted/60 p-4 text-base space-y-2">
              <p className="font-semibold text-foreground">On iPhone or iPad (Safari):</p>
              <ol className="list-decimal list-inside space-y-1 text-foreground">
                <li>Tap the <strong>Share</strong> button at the bottom of Safari.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong> in the top-right corner.</li>
              </ol>
            </div>
          )}

          {showIOSHelp && !isIOS && !deferredPrompt && (
            <div className="mt-3 rounded-lg bg-muted/60 p-4 text-base space-y-2">
              <p className="font-semibold text-foreground">On Android (Chrome):</p>
              <ol className="list-decimal list-inside space-y-1 text-foreground">
                <li>Tap the <strong>three-dot menu</strong> in the top-right of Chrome.</li>
                <li>Tap <strong>Install app</strong> or <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Install</strong> to confirm.</li>
              </ol>
              <p className="text-sm text-muted-foreground pt-2">
                If you don't see this option, your browser may not support installation, or the app may already be installed.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default InstallAppCard;
