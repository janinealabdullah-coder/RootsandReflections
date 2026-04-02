import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Lock, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Member {
  id: string;
  user_id: string;
  display_name: string;
}

interface CapsuleFormProps {
  familyId: string;
  members: Member[];
  userId: string;
  onBack: () => void;
  onSuccess: () => void;
}

const CapsuleForm = ({ familyId, members, userId, onBack, onSuccess }: CapsuleFormProps) => {
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState<Date>();
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleRecipient = (userId: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please write a message for your capsule.");
      return;
    }
    if (!unlockDate) {
      toast.error("Please choose a future unlock date.");
      return;
    }
    if (selectedRecipients.length === 0) {
      toast.error("Please select at least one recipient.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("memory_capsules").insert({
      family_id: familyId,
      author_id: userId,
      message: message.trim(),
      unlock_date: format(unlockDate, "yyyy-MM-dd"),
      recipient_ids: selectedRecipients,
    });

    if (error) {
      toast.error("Could not save capsule. Please try again.");
      setSubmitting(false);
      return;
    }

    toast.success("Memory capsule sealed! It will unlock on " + format(unlockDate, "PPP") + ".");
    onSuccess();
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="roots-container py-6 space-y-6 animate-fade-up">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span>Back to capsules</span>
      </button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="roots-heading-2">Seal a Memory Capsule</h2>
          <p className="text-muted-foreground">Write a message for the future</p>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Your Message</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write something meaningful for your loved ones to read in the future…"
          className="min-h-[160px] text-base"
        />
      </div>

      {/* Unlock Date */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Unlock Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-12 text-base",
                !unlockDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-5 w-5" />
              {unlockDate ? format(unlockDate, "PPP") : "Pick a future date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={unlockDate}
              onSelect={setUnlockDate}
              disabled={(date) => date < tomorrow}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        <p className="text-sm text-muted-foreground">
          The capsule stays locked until this date arrives.
        </p>
      </div>

      {/* Recipients */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">Recipients</label>
        <p className="text-sm text-muted-foreground">Who should receive this capsule when it unlocks?</p>
        <div className="flex flex-wrap gap-2">
          {members.map((member) => {
            const selected = selectedRecipients.includes(member.user_id);
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleRecipient(member.user_id)}
                className={cn(
                  "px-4 py-2 rounded-full text-base font-medium border-2 transition-all",
                  selected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:border-primary/50"
                )}
              >
                {member.display_name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={submitting}
        size="lg"
        className="w-full"
      >
        <Send className="w-5 h-5 mr-2" />
        {submitting ? "Sealing…" : "Seal This Capsule"}
      </Button>
    </div>
  );
};

export default CapsuleForm;
