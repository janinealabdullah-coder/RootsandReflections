import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/hooks/use-family";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Save, Crown, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import InstallAppCard from "@/components/InstallAppCard";

interface Member {
  id: string;
  user_id: string;
  display_name: string;
  role: string;
  relationship: string | null;
  joined_at: string;
}

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { family: activeFamily, loading: familyLoading } = useFamily();

  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isAdmin = user?.id === createdBy;

  useEffect(() => {
    if (!user || familyLoading) return;

    if (!activeFamily) {
      navigate("/");
      return;
    }

    const load = async () => {
      // Get created_by for admin check
      const { data: famData } = await supabase
        .from("families")
        .select("id, name, created_by")
        .eq("id", activeFamily.familyId)
        .single();

      if (!famData) {
        navigate("/");
        return;
      }

      setFamilyId(famData.id);
      setFamilyName(famData.name);
      setOriginalName(famData.name);
      setCreatedBy(famData.created_by);

      const { data: mems } = await supabase
        .from("family_members")
        .select("id, user_id, display_name, role, relationship, joined_at")
        .eq("family_id", famData.id)
        .order("joined_at", { ascending: true });

      setMembers(mems || []);
      setLoading(false);
    };

    load();
  }, [user, activeFamily, familyLoading, navigate]);

  const handleRename = async () => {
    if (!familyId || !familyName.trim() || familyName === originalName) return;
    setSaving(true);

    const { error } = await supabase
      .from("families")
      .update({ name: familyName.trim() })
      .eq("id", familyId);

    setSaving(false);

    if (error) {
      toast({ title: "Error", description: "Could not rename family.", variant: "destructive" });
    } else {
      setOriginalName(familyName.trim());
      toast({ title: "Family renamed", description: `Your family is now "${familyName.trim()}".` });
    }
  };

  const handleRemoveMember = async (member: Member) => {
    if (member.user_id === createdBy) {
      toast({ title: "Cannot remove", description: "The family creator cannot be removed.", variant: "destructive" });
      return;
    }

    const confirmed = window.confirm(`Remove ${member.display_name} from the family? This cannot be undone.`);
    if (!confirmed) return;

    setRemovingId(member.id);

    const { error } = await supabase
      .from("family_members")
      .delete()
      .eq("id", member.id);

    setRemovingId(null);

    if (error) {
      toast({ title: "Error", description: "Could not remove member.", variant: "destructive" });
    } else {
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast({ title: "Member removed", description: `${member.display_name} has been removed.` });
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <PageHeader title="Settings" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader title="Settings" />
      <div className="roots-container mt-6 space-y-8 pb-10">
        <InstallAppCard />

        {!isAdmin && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-lg">
              Only the family admin can manage family settings.
            </p>
            <Button variant="outline" onClick={() => navigate("/home")}>
              Back to Home
            </Button>
          </div>
        )}

        {isAdmin && (
          <>
            {/* Rename Family */}
            <section className="roots-card space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold text-foreground">Family Name</h2>
              </div>
              <div className="space-y-2">
            <Label htmlFor="family-name">Name</Label>
            <Input
              id="family-name"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Enter family name"
            />
          </div>
          <Button
            onClick={handleRename}
            disabled={saving || !familyName.trim() || familyName === originalName}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Name"}
          </Button>
        </section>

        {/* Manage Members */}
        <section className="roots-card space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-bold text-foreground">
              Members ({members.length})
            </h2>
          </div>

          <div className="divide-y divide-border">
            {members.map((member) => {
              const isSelf = member.user_id === user?.id;
              const isCreator = member.user_id === createdBy;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      {member.display_name}
                      {isCreator && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Admin
                        </span>
                      )}
                      {isSelf && !isCreator && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.relationship || "Member"}
                    </p>
                  </div>

                  {!isCreator && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member)}
                      disabled={removingId === member.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Remove ${member.display_name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Settings;
