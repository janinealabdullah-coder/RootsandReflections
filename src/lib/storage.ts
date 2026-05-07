import { supabase } from "@/integrations/supabase/client";

/**
 * Convert stored photo URLs (public or path-based) into signed URLs
 * for the now-private story-photos bucket.
 */
export async function getSignedPhotoUrls(photoUrls: string[] | null): Promise<string[]> {
  if (!photoUrls || photoUrls.length === 0) return [];

  const paths = photoUrls.map((url) => {
    // Extract the storage path from a full public URL
    const marker = "/object/public/story-photos/";
    const idx = url.indexOf(marker);
    if (idx !== -1) return url.slice(idx + marker.length);
    // If it's already just a path, return as-is
    return url;
  });

  const { data, error } = await supabase.storage
    .from("story-photos")
    .createSignedUrls(paths, 3600); // 1 hour

  if (error || !data) return [];
  return data.map((d) => d.signedUrl).filter(Boolean);
}

/**
 * Resolve photo_urls for an array of stories, replacing public URLs with signed ones.
 */
export async function resolveStoryPhotos<T extends { photo_urls: string[] | null }>(
  stories: T[]
): Promise<T[]> {
  const withPhotos = stories.filter((s) => s.photo_urls && s.photo_urls.length > 0);
  if (withPhotos.length === 0) return stories;

  const resolved = await Promise.all(
    stories.map(async (story) => {
      if (!story.photo_urls || story.photo_urls.length === 0) return story;
      const signedUrls = await getSignedPhotoUrls(story.photo_urls);
      return { ...story, photo_urls: signedUrls.length > 0 ? signedUrls : story.photo_urls };
    })
  );
  return resolved;
}

/**
 * Get a signed URL for a single audio file from the story-audio bucket.
 */
export async function getSignedAudioUrl(audioUrl: string | null): Promise<string | null> {
  if (!audioUrl) return null;
  const marker = "/object/public/story-audio/";
  const idx = audioUrl.indexOf(marker);
  const path = idx !== -1 ? audioUrl.slice(idx + marker.length) : audioUrl;
  const { data, error } = await supabase.storage
    .from("story-audio")
    .createSignedUrl(path, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}
