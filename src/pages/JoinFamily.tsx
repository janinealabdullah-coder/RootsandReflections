import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JoinFamily = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("code") || "";

  const [step, setStep] = useState<"code" | "profile" | "success">(
    codeFromUrl ? "profile" : "code"
  );
  const [inviteCode, setInviteCode] = useState(codeFromUrl);
  const [userName, setUserName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [relationship, setRelationship] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [loading, setLoading] = useState(false);

  const lookupCode = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("invite_codes")
        .select("family_id, families(name)")
        .eq("code", inviteCode.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          title: "Invalid code",
          description: "We couldn't find a family with that invite code.",
          variant: "destructive",
        });
        return;
      }

      setFamilyId(data.family_id);
      setFamilyName((data.families as any)?.name || "Your Family");
      setStep("profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If arriving with code from URL, auto-lookup
  const [lookedUp, setLookedUp] = useState(false);
  if (codeFromUrl && !lookedUp && step === "profile" && !familyId) {
    setLookedUp(true);
    // Need to look up the code
    (async () => {
      const { data } = await supabase
        .from("invite_codes")
        .select("family_id, families(name)")
        .eq("code", codeFromUrl.toUpperCase())
        .maybeSingle();
      if (data) {
        setFamilyId(data.family_id);
        setFamilyName((data.families as any)?.name || "Your Family");
      } else {
        setStep("code");
      }
    })();
  }

  const handleJoin = async () => {
    if (!user || !familyId) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("family_members").insert({
        family_id: familyId,
        user_id: user.id,
        display_name: userName,
        birth_year: birthYear ? parseInt(birthYear) : null,
        relationship,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already a member",
            description: "You're already part of this family!",
          });
          navigate("/home");
          return;
        }
        throw error;
      }

      setStep("success");
    } catch (error: any) {
      toast({
        title: "Error joining family",
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
        {step !== "success" && (
          <button
            onClick={() => {
              if (step === "code") navigate("/");
              else if (step === "profile") setStep("code");
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">Back</span>
          </button>
        )}

        {step === "code" && (
          <div className="animate-fade-up space-y-8">
            <div>
              <h1 className="roots-heading-2">Join Your Family</h1>
              <p className="roots-body-large mt-2">
                Enter the invite code your family member shared with you.
              </p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="inviteCode" className="text-base font-semibold">
                Invite Code
              </Label>
              <Input
                id="inviteCode"
                placeholder="e.g., ROOTS-A1B2C3"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="h-14 text-lg px-4 uppercase tracking-wider"
              />
            </div>
            <Button
              size="xl"
              className="w-full"
              disabled={!inviteCode.trim() || loading}
              onClick={lookupCode}
            >
              {loading ? "Looking up..." : "Find My Family"}
            </Button>
          </div>
        )}

        {step === "profile" && (
          <div className="animate-fade-up space-y-8">
            {familyName && (
              <div className="roots-card text-center py-5">
                <p className="text-sm text-muted-foreground">You're joining</p>
                <p className="text-xl font-display font-bold text-foreground mt-1">
                  {familyName}
                </p>
              </div>
            )}
            <div>
              <h1 className="roots-heading-2">About You</h1>
              <p className="roots-body-large mt-2">
                Help your family recognize you.
              </p>
            </div>
            <div className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="userName" className="text-base font-semibold">
                  Your Name
                </Label>
                <Input
                  id="userName"
                  placeholder="e.g., James"
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
                  placeholder="e.g., 1985"
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="h-14 text-lg px-4"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="relationship" className="text-base font-semibold">
                  Relationship
                </Label>
                <Input
                  id="relationship"
                  placeholder="e.g., Grandson, Niece, Cousin"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="h-14 text-lg px-4"
                />
              </div>
            </div>
            <Button
              size="xl"
              className="w-full"
              disabled={!userName.trim() || loading}
              onClick={handleJoin}
            >
              {loading ? "Joining..." : "Join Family"}
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="animate-fade-up flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center">
              <Heart className="w-12 h-12 text-accent" />
            </div>
            <h1 className="roots-heading-2">Welcome to {familyName}!</h1>
            <p className="roots-body-large max-w-xs">
              You're now part of the family. Start sharing your stories and
              memories.
            </p>
            <Button
              size="xl"
              className="w-full max-w-sm"
              onClick={() => navigate("/home")}
            >
              Enter Family Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinFamily;
