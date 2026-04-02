import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Camera,
  X,
  Lock,
  Globe,
  Users,
  Check,
} from "lucide-react";

interface Member {
  id: string;
  user_id: string;
  display_name: string;
}

const DECADES = [
  "1920s", "1930s", "1940s", "1950s", "1960s",
  "1970s", "1980s", "1990s", "2000s", "2010s", "2020s",
];

const PRIVACY_OPTIONS = [
  { value: "family-only", label: "Family Only", icon: Users, desc: "Visible to family members" },
  { value: "private", label: "Private", icon: Lock, desc: "Only you can see this" },
  { value: "shareable", label: "Shareable", icon: Globe, desc: "Anyone with the link" },
];

const StoryForm = ({
  familyId,
  members,
  userId,
  onBack,
  onSuccess,
}: {
  familyId: string;
  members: Member[];
  userId: string;
  onBack: () => void;
  onSuccess: () => void;
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [year, setYear] = useState("");
  const [decade, setDecade] = useState("");
  const [privacy, setPrivacy] = useState("family-only");
  const [taggedIds, setTaggedIds] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast({ title: "Too many photos", description: "You can add up to 5 photos.", variant: "destructive" });
      return;
    }
    setPhotos((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (userIdToTag: string) => {
    setTaggedIds((prev) =>
      prev.includes(userIdToTag)
        ? prev.filter((id) => id !== userIdToTag)
        : [...prev, userIdToTag]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Missing fields", description: "Please add a title and your story.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const ext = photo.name.split(".").pop();
        const path = `${familyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("story-photos")
          .upload(path, photo);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("story-photos")
          .getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
      }

      const { error } = await supabase.from("stories").insert({
        family_id: familyId,
        author_id: userId,
        title: title.trim(),
        content: content.trim(),
        year: year ? parseInt(year) : null,
        decade: decade || null,
        privacy,
        tagged_members: taggedIds.length > 0 ? taggedIds : [],
        photo_urls: photoUrls.length > 0 ? photoUrls : [],
      });

      if (error) throw error;
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error saving story", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b px-5 py-5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">Cancel</span>
          </button>
          <h1 className="text-xl font-display font-bold text-foreground">
            New Story
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="roots-container mt-6 space-y-6">
        {/* Title */}
        <div className="space-y-3">
          <Label htmlFor="title" className="text-base font-semibold">
            Title
          </Label>
          <Input
            id="title"
            placeholder="Give your memory a name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-14 text-lg px-4"
          />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <Label htmlFor="content" className="text-base font-semibold">
            Your Story
          </Label>
          <Textarea
            id="content"
            placeholder="Tell us about this memory... What happened? Who was there? How did it feel?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[180px] text-base px-4 py-3 resize-none"
          />
        </div>

        {/* Photos */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Photos <span className="font-normal text-muted-foreground">(optional, up to 5)</span>
          </Label>
          <div className="flex gap-3 flex-wrap">
            {photoPreviews.map((preview, i) => (
              <div key={i} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-xl border"
                />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  aria-label="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <Camera className="w-6 h-6" />
                <span className="text-xs mt-1">Add</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>

        {/* Tag Family Members */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Tag Family Members <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {members.map((member) => {
              const isTagged = taggedIds.includes(member.user_id);
              return (
                <button
                  key={member.id}
                  onClick={() => toggleTag(member.user_id)}
                  className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isTagged
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isTagged && <Check className="w-3.5 h-3.5" />}
                  {member.display_name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Year or Decade */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            When did this happen? <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <div className="space-y-3">
            <Input
              placeholder="Exact year, e.g., 1987"
              type="number"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                if (e.target.value) setDecade("");
              }}
              className="h-14 text-lg px-4"
            />
            <p className="text-sm text-muted-foreground text-center">or pick a decade</p>
            <div className="flex flex-wrap gap-2">
              {DECADES.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDecade(decade === d ? "" : d);
                    if (decade !== d) setYear("");
                  }}
                  className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-colors ${
                    decade === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Who can see this?</Label>
          <div className="space-y-2">
            {PRIVACY_OPTIONS.map((option) => {
              const isSelected = privacy === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setPrivacy(option.value)}
                  className={`w-full roots-card flex items-center gap-4 text-left transition-all ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : "hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <option.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-primary ml-auto shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <Button
          size="xl"
          className="w-full"
          disabled={!title.trim() || !content.trim() || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Saving..." : "Share Story"}
        </Button>
      </div>
    </div>
  );
};

export default StoryForm;
