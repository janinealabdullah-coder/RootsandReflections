import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/hooks/use-family";
import { Lock, Unlock, Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { format, isPast, parseISO } from "date-fns";
import CapsuleForm from "@/components/CapsuleForm";

interface Capsule {
  id: string;
  message: string;
  unlock_date: string;
  is_unlocked: boolean;
  author_id: string;
  recipient_ids: string[];
  created_at: string;
}

const Capsules = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { family, loading: familyLoading } = useFamily();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadCapsules = async () => {
    if (!family) return;
    const { data } = await supabase
      .from("memory_capsules")
      .select("*")
      .eq("family_id", family.familyId)
      .order("unlock_date", { ascending: true });
    setCapsules(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (family) loadCapsules();
  }, [family]);

  if (familyLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Loading capsules…</p>
      </div>
    );
  }

  if (showForm && family && user) {
    return (
      <CapsuleForm
        familyId={family.familyId}
        members={family.members}
        userId={user.id}
        onBack={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          loadCapsules();
        }}
      />
    );
  }

  const getMemberName = (userId: string) => {
    const m = family?.members.find((m) => m.user_id === userId);
    return m?.display_name || "Someone";
  };

  const isUnlockable = (dateStr: string) => isPast(parseISO(dateStr));

  return (
    <div className="min-h-screen bg-background pb-8">
      <PageHeader title="Memory Capsules" />

      <div className="roots-container mt-6 space-y-4">
        <Button onClick={() => setShowForm(true)} size="lg" className="w-full">
          <Plus className="w-5 h-5 mr-2" />
          Seal a New Capsule
        </Button>

        {capsules.length === 0 && (
          <div className="roots-card text-center py-10">
            <Lock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-lg">No capsules yet.</p>
            <p className="text-muted-foreground">Write a message for the future!</p>
          </div>
        )}

        {capsules.map((capsule) => {
          const unlockable = isUnlockable(capsule.unlock_date);
          const isAuthor = capsule.author_id === user?.id;
          const isRecipient = user ? capsule.recipient_ids.includes(user.id) : false;
          const canRead = unlockable && (isAuthor || isRecipient);

          return (
            <div key={capsule.id} className="roots-card space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {unlockable ? (
                    <Unlock className="w-6 h-6 text-accent" />
                  ) : (
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">
                      {unlockable ? "Unlocked" : "Sealed"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {unlockable ? "Opened " : "Opens "}
                      {format(parseISO(capsule.unlock_date), "PPP")}
                    </p>
                  </div>
                </div>
                {isAuthor && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    You wrote this
                  </span>
                )}
              </div>

              {canRead ? (
                <div className="bg-background rounded-xl p-4 border">
                  <p className="text-foreground whitespace-pre-wrap">{capsule.message}</p>
                </div>
              ) : unlockable ? (
                <p className="text-muted-foreground italic">
                  This capsule is for other family members.
                </p>
              ) : (
                <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                  <p className="text-muted-foreground">
                    This message is sealed until {format(parseISO(capsule.unlock_date), "PPP")}.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground">From {getMemberName(capsule.author_id)} · To </span>
                {capsule.recipient_ids.map((rid) => (
                  <span key={rid} className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                    {getMemberName(rid)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Capsules;
