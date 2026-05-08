import { useEffect, useState, useRef } from "react";
import PageLayout from "@/components/PageLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/hooks/use-family";
import { Camera, Loader2, User, Download, Trash2, ShieldAlert } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { family } = useFamily();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthYear, setBirthYear] = useState<string>("");
  const [relationship, setRelationship] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("account-management", {
        body: { action: "export_data" },
      });
      if (error) throw error;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Your data has been downloaded.");
    } catch (e: any) {
      toast.error(e.message || "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("account-management", {
        body: { action: "delete_account", confirm: "DELETE" },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Your account and data have been deleted.");
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (e: any) {
      toast.error(e.message || "Failed to delete account");
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const query = supabase
        .from("family_members")
        .select("id, display_name, birth_year, relationship, avatar_url")
        .eq("user_id", user.id);

      // Scope to active family if available
      if (family) {
        query.eq("family_id", family.familyId);
      }

      const { data } = await query.limit(1).maybeSingle();

      if (data) {
        setMemberId(data.id);
        setDisplayName(data.display_name);
        setBirthYear(data.birth_year?.toString() || "");
        setRelationship(data.relationship || "");
        setAvatarUrl(data.avatar_url);
      }
      setLoading(false);
    };

    load();
  }, [user, family]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload photo");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    setAvatarUrl(newUrl);

    // Save avatar URL to profile
    await supabase
      .from("family_members")
      .update({ avatar_url: newUrl })
      .eq("id", memberId);

    toast.success("Photo updated!");
    setUploading(false);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("family_members")
      .update({
        display_name: displayName.trim(),
        birth_year: birthYear ? parseInt(birthYear) : null,
        relationship: relationship.trim() || null,
      })
      .eq("id", memberId);

    if (error) {
      toast.error("Failed to save changes");
    } else {
      toast.success("Profile updated!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground text-lg">Loading profile…</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="pb-12">
      <PageHeader title="Edit Profile" />

      <div className="max-w-lg mx-auto px-5 mt-8 space-y-8">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-primary" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <p className="text-sm text-muted-foreground">Tap the camera to change your photo</p>
        </div>

        {/* Form fields */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Margaret"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthYear">Birth Year</Label>
            <Input
              id="birthYear"
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="e.g., 1958"
              min={1900}
              max={new Date().getFullYear()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g., Grandmother, Father, Cousin"
            />
            <p className="text-xs text-muted-foreground">
              How are you connected to the family?
            </p>
          </div>
        </div>

        <Button
          className="w-full"
          size="xl"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>

        {/* Privacy & Account — GDPR / CCPA / App Store compliance */}
        <div className="mt-12 pt-8 border-t border-border space-y-6">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Your Data & Privacy
            </h2>
            <p className="text-base text-muted-foreground">
              You have the right to download a copy of your data or delete your account at any time.
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={handleExportData}
            disabled={exporting}
          >
            <Download className="w-5 h-5" />
            {exporting ? "Preparing your data…" : "Download My Data"}
          </Button>

          <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-5 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-bold text-foreground">Delete Account</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete your account and all your stories, photos, capsules, and likes.
                  This cannot be undone.
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="lg"
              className="w-full gap-2"
              onClick={() => {
                setConfirmText("");
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="w-5 h-5" />
              Delete My Account
            </Button>
          </div>
        </div>
      </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                This will permanently delete your account, your stories, photos, audio recordings,
                memory capsules, and likes. Family members you invited will remain.
              </span>
              <span className="block font-semibold text-foreground pt-2">
                Type <span className="font-mono">DELETE</span> below to confirm.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="h-12 text-base"
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              disabled={deleting || confirmText !== "DELETE"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete Forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Profile;
