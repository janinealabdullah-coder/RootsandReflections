import { useEffect, useState } from "react";
import { getSignedAudioUrl } from "@/lib/storage";

const StoryAudioPlayer = ({ audioUrl }: { audioUrl: string }) => {
  const [signed, setSigned] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSignedAudioUrl(audioUrl).then((url) => {
      if (active) setSigned(url);
    });
    return () => {
      active = false;
    };
  }, [audioUrl]);

  if (!signed) {
    return (
      <p className="text-sm text-muted-foreground">Loading audio…</p>
    );
  }

  return (
    <div className="roots-card py-3">
      <audio src={signed} controls className="w-full h-10" />
    </div>
  );
};

export default StoryAudioPlayer;
