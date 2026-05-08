import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const searchParams = new URLSearchParams(window.location.search);
  const nextUrl = searchParams.get("next") || "/family-select";


  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: "Check your email",
        description: "We sent you a password reset link.",
      });
      setIsForgotPassword(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          navigate(nextUrl);
        } else {
          toast({
            title: "Check your email",
            description: "We sent you a confirmation link to get started.",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate(nextUrl);
      }
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

  if (isForgotPassword) {
    return (
      <PageLayout overlayOpacity="light">
        <div className="min-h-screen flex items-center justify-center px-5">
          <div className="w-full max-w-sm space-y-8 animate-fade-up bg-background/60 dark:bg-background/40 backdrop-blur-md rounded-2xl p-8">
            <div className="text-center">
              <h1 className="roots-heading-2">Reset Password</h1>
              <p className="roots-body-large mt-2">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 text-lg px-4"
                />
              </div>

              <Button size="xl" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-base text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout overlayOpacity="light">
      <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-8 animate-fade-up bg-background/60 dark:bg-background/40 backdrop-blur-md rounded-2xl p-8">
        <div className="text-center">
          <h1 className="roots-heading-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="roots-body-large mt-2">
            {isSignUp
              ? "Join your family's story."
              : "Sign in to continue your family's story."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-base font-semibold">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 text-lg px-4"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-base font-semibold">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-14 text-lg px-4 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {isSignUp && (
              <p className="text-sm text-muted-foreground">
                Must be at least 6 characters with a mix of letters, numbers, and symbols.
              </p>
            )}
          </div>

          {isSignUp && (
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 rounded border-input accent-primary cursor-pointer"
              />
              <span className="text-base text-foreground leading-snug">
                I confirm that I am 13 years of age or older.
              </span>
            </label>
          )}

          <Button size="xl" className="w-full" disabled={loading || (isSignUp && !ageConfirmed)}>
            {loading
              ? "Please wait..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </Button>
        </form>


        {!isSignUp && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsForgotPassword(true)}
              className="text-base text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Forgot your password?
            </button>
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-base text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
      </div>
    </PageLayout>
  );
};

export default Auth;
