import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import InstallAppCard from "@/components/InstallAppCard";

const CreateFamily = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<"info" | "profile" | "invite">("info");
  const [familyName, setFamilyName] = useState("");
  const [userName, setUserName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const inviteLink = inviteCode
    ? `${window.location.origin}/join-family?code=${inviteCode}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateFamily = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Create family
      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert({ name: familyName, created_by: user.id })
        .select()
        .single();

      if (familyError) throw familyError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from("family_members")
        .insert({
          family_id: family.id,
          user_id: user.id,
          display_name: userName,
          birth_year: birthYear ? parseInt(birthYear) : null,
          role: "admin",
        });

      if (memberError) throw memberError;

      // Generate invite code
      const code =
        "ROOTS-" +
        Math.random().toString(36).substring(2, 8).toUpperCase();

      const { error: inviteError } = await supabase
        .from("invite_codes")
        .insert({
          family_id: family.id,
          code,
          created_by: user.id,
        });

      if (inviteError) throw inviteError;

      setInviteCode(code);
      setStep("invite");
    } catch (error: any) {
      toast({
        title: "Error creating family",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="roots-container py-6">
        <button
          onClick={() => {
            if (step === "info") navigate("/");
            else if (step === "profile") setStep("info");
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base">Back</span>
        </button>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {["info", "profile", "invite"].map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= ["info", "profile", "invite"].indexOf(step)
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === "info" && (
          <div className="animate-fade-up space-y-8">
            {/* Welcome onboarding card */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                👋 Welcome to Roots!
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You're about to create a private space for your family to share
                stories, memories, and stay connected across generations.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 pt-1">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">1.</span>
                  <span><strong className="text-foreground">Name your family</strong> — pick a name everyone will recognise.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">2.</span>
                  <span><strong className="text-foreground">Set up your profile</strong> — tell your family who you are.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">3.</span>
                  <span><strong className="text-foreground">Invite members</strong> — share a link so they can join.</span>
                </li>
              </ul>
            </div>

            <div>
              <h1 className="roots-heading-2">Name Your Family</h1>
              <p className="roots-body-large mt-2">
                This is how your family group will appear to members.
              </p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="familyName" className="text-base font-semibold">
                Family Name
              </Label>
              <Input
                id="familyName"
                placeholder="e.g., The Johnsons"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="h-14 text-lg px-4"
              />
            </div>
            <Button
              size="xl"
              className="w-full"
              disabled={!familyName.trim()}
              onClick={() => setStep("profile")}
            >
              Continue
            </Button>
          </div>
        )}

        {step === "profile" && (
          <div className="animate-fade-up space-y-8">
            <div>
              <h1 className="roots-heading-2">Your Profile</h1>
              <p className="roots-body-large mt-2">
                Tell your family a bit about yourself.
              </p>
            </div>
            <div className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="userName" className="text-base font-semibold">
                  Your Name
                </Label>
                <Input
                  id="userName"
                  placeholder="e.g., Margaret"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="h-14 text-lg px-4"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="birthYear" className="text-base font-semibold">
                  Birth Year
                </Label>
                <Input
                  id="birthYear"
                  placeholder="e.g., 1958"
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="h-14 text-lg px-4"
                />
              </div>
            </div>
            <Button
              size="xl"
              className="w-full"
              disabled={!userName.trim() || loading}
              onClick={handleCreateFamily}
            >
              {loading ? "Creating..." : "Create Family"}
            </Button>
          </div>
        )}

        {step === "invite" && (
          <div className="animate-fade-up space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-secondary" />
              </div>
              <h1 className="roots-heading-2">Invite Your Family</h1>
              <p className="roots-body-large mt-2">
                Share this link so your family members can join{" "}
                <strong className="text-foreground">{familyName}</strong>.
              </p>
            </div>

            <div className="roots-card space-y-4">
              <Label className="text-base font-semibold">Invite Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={inviteLink}
                  className="h-14 text-base px-4 bg-muted"
                />
                <Button
                  size="icon"
                  variant={copied ? "warm" : "outline"}
                  className="h-14 w-14 shrink-0"
                  onClick={handleCopy}
                  aria-label="Copy invite link"
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Only people with this link can join your family group.
              </p>
              <p className="text-sm text-muted-foreground border-t pt-3">
                Beta families are limited to 10 members. Upgrade options coming soon.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                size="xl"
                className="w-full"
                onClick={() => navigate("/home")}
              >
                Go to Family Home
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={() => navigate("/home")}
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateFamily;
