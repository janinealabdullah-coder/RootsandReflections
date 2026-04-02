import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, Copy, Check } from "lucide-react";

const CreateFamily = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"info" | "profile" | "invite">("info");
  const [familyName, setFamilyName] = useState("");
  const [userName, setUserName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [copied, setCopied] = useState(false);

  const inviteCode = "ROOTS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const inviteLink = `${window.location.origin}/join-family?code=${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="roots-container py-6">
        {/* Header */}
        <button
          onClick={() => {
            if (step === "info") navigate("/");
            else if (step === "profile") setStep("info");
            else if (step === "invite") setStep("profile");
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
              disabled={!userName.trim()}
              onClick={() => setStep("invite")}
            >
              Continue
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

            {/* Invite link card */}
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
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Only people with this link can join your family group.
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
