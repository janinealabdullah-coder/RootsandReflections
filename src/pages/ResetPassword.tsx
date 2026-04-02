import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts recovery token in the URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    } else {
      // Listen for auth state change from the recovery link
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });
      navigate("/home");
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center px-5">
          <p className="roots-body-large">Verifying your reset link…</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout overlayOpacity="light">
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="w-full max-w-sm space-y-8 animate-fade-up bg-background/60 dark:bg-background/40 backdrop-blur-md rounded-2xl p-8">
          <div className="text-center">
            <h1 className="roots-heading-2">Set New Password</h1>
            <p className="roots-body-large mt-2">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-semibold">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-14 text-lg px-4"
              />
            </div>

            <Button size="xl" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResetPassword;
