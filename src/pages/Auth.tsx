import { useState } from "react";
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
  const searchParams = new URLSearchParams(window.location.search);
  const nextUrl = searchParams.get("next") || "/home";


  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({
          title: "Apple sign-in failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }
      if (result.redirected) return;
      navigate(nextUrl);
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAppleLoading(false);
    }
  };

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
            {loading
              ? "Please wait..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-sm text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>


        <Button
          variant="outline"
          size="xl"
          className="w-full"
          onClick={handleAppleSignIn}
          disabled={appleLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          {appleLoading ? "Please wait..." : "Continue with Apple"}
        </Button>

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
