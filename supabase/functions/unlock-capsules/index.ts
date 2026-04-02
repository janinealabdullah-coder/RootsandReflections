import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find capsules that should be unlocked
    const today = new Date().toISOString().split("T")[0];

    const { data: capsules, error: fetchError } = await supabase
      .from("memory_capsules")
      .select("id, message, author_id, recipient_ids, family_id, unlock_date")
      .eq("is_unlocked", false)
      .lte("unlock_date", today);

    if (fetchError) {
      throw fetchError;
    }

    if (!capsules || capsules.length === 0) {
      return new Response(JSON.stringify({ unlocked: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let unlockedCount = 0;

    for (const capsule of capsules) {
      // Mark as unlocked
      const { error: updateError } = await supabase
        .from("memory_capsules")
        .update({ is_unlocked: true })
        .eq("id", capsule.id);

      if (updateError) {
        console.error(`Failed to unlock capsule ${capsule.id}:`, updateError);
        continue;
      }

      // Get author name
      const { data: author } = await supabase
        .from("family_members")
        .select("display_name")
        .eq("user_id", capsule.author_id)
        .eq("family_id", capsule.family_id)
        .maybeSingle();

      const authorName = author?.display_name || "A family member";

      // Create notifications for each recipient
      const notifications = capsule.recipient_ids.map((recipientId: string) => ({
        user_id: recipientId,
        family_id: capsule.family_id,
        type: "capsule_unlocked",
        title: "A Memory Capsule has been unlocked! 💌",
        body: `${authorName} sealed a message for you, and today it's ready to read.`,
        related_id: capsule.id,
      }));

      if (notifications.length > 0) {
        const { error: notifError } = await supabase
          .from("notifications")
          .insert(notifications);

        if (notifError) {
          console.error(`Failed to create notifications for capsule ${capsule.id}:`, notifError);
        }
      }

      unlockedCount++;
    }

    return new Response(
      JSON.stringify({ unlocked: unlockedCount, total: capsules.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error unlocking capsules:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
