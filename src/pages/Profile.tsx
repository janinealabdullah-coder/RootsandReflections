import { useEffect, useState, useRef } from "react";
import PageLayout from "@/components/PageLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/hooks/use-family";
import { Camera, Loader2, User } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
      </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
