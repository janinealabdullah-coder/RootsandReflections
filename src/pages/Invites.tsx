import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/hooks/use-family";
import { Copy, Plus, Trash2, Loader2, Link2, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InviteCode {
  id: string;
  code: string;
  created_at: string;
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
  created_by: string;
}

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "ROOTS-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const Invites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { family, loading: familyLoading } = useFamily();

  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [maxUses, setMaxUses] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");

  const loadInvites = async () => {
    if (!family) return;
    const { data } = await supabase
      .from("invite_codes")
      .select("*")
      .eq("family_id", family.familyId)
      .order("created_at", { ascending: false });

    setInvites(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (family) loadInvites();
  }, [family]);

  const handleCreate = async () => {
    if (!family || !user) return;
    setCreating(true);

    const code = generateCode();
    const expiresAt = expiresInDays
      ? new Date(Date.now() + parseInt(expiresInDays) * 86400000).toISOString()
      : null;

    const { error } = await supabase.from("invite_codes").insert({
      code,
      family_id: family.familyId,
      created_by: user.id,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt,
    });

    if (error) {
      toast.error("Failed to create invite");
    } else {
      toast.success("Invite code created!");
      setShowCreate(false);
      setMaxUses("");
      setExpiresInDays("");
      await loadInvites();
    }
    setCreating(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from("invite_codes")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast.error("Failed to revoke invite");
    } else {
      toast.success("Invite revoked");
      setInvites((prev) => prev.filter((i) => i.id !== deleteId));
    }
    setDeleteId(null);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const isExpired = (invite: InviteCode) => {
    if (!invite.expires_at) return false;
    return new Date(invite.expires_at) < new Date();
  };

  const isMaxed = (invite: InviteCode) => {
    if (!invite.max_uses) return false;
    return invite.use_count >= invite.max_uses;
  };

  if (familyLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="pb-12">
      <PageHeader
        title="Invite Links"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Invite
          </Button>
        }
      />

      <div className="max-w-lg mx-auto px-5 mt-6 space-y-4">
        {invites.length === 0 ? (
          <div className="text-center py-16">
            <Link2 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-lg">No invite codes yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create one to invite family members
            </p>
          </div>
        ) : (
          invites.map((invite) => {
            const expired = isExpired(invite);
            const maxed = isMaxed(invite);
            const inactive = expired || maxed;

            return (
              <Card
                key={invite.id}
                className={`p-4 space-y-3 ${inactive ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-mono font-bold text-foreground tracking-wider">
                      {invite.code}
                    </code>
                    {inactive && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        {expired ? "Expired" : "Limit reached"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyCode(invite.code)}
                      aria-label="Copy code"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(invite.id)}
                      aria-label="Revoke invite"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {invite.use_count}
                    {invite.max_uses ? ` / ${invite.max_uses}` : ""} uses
                  </span>
                  <span>
                    Created {format(new Date(invite.created_at), "MMM d, yyyy")}
                  </span>
                  {invite.expires_at && (
                    <span>
                      {expired ? "Expired" : "Expires"}{" "}
                      {format(new Date(invite.expires_at), "MMM d")}
                    </span>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Invite Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Uses (optional)</Label>
              <Input
                id="maxUses"
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires">Expires After (days, optional)</Label>
              <Input
                id="expires"
                type="number"
                min={1}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder="Never"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={creating} className="w-full">
              {creating ? "Creating…" : "Generate Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this invite?</AlertDialogTitle>
            <AlertDialogDescription>
              Anyone with this code will no longer be able to join your family. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Revoke</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Invites;
