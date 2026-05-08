import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing auth" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const userId = userData.user.id;
    const userEmail = userData.user.email;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "export_data") {
      // GDPR / CCPA: provide all user data in machine-readable form
      const [
        { data: authUser },
        { data: memberships },
        { data: stories },
        { data: capsulesAuthored },
        { data: likes },
        { data: notifications },
        { data: relationships },
        { data: invites },
      ] = await Promise.all([
        admin.auth.admin.getUserById(userId),
        admin.from("family_members").select("*").eq("user_id", userId),
        admin.from("stories").select("*").eq("author_id", userId),
        admin.from("memory_capsules").select("*").eq("author_id", userId),
        admin.from("story_likes").select("*").eq("user_id", userId),
        admin.from("notifications").select("*").eq("user_id", userId),
        admin.from("family_relationships").select("*"),
        admin.from("invite_codes").select("*").eq("created_by", userId),
      ]);

      const memberIds = (memberships ?? []).map((m: any) => m.id);
      const myRelationships = (relationships ?? []).filter(
        (r: any) =>
          memberIds.includes(r.parent_member_id) ||
          memberIds.includes(r.child_member_id)
      );

      return json({
        exported_at: new Date().toISOString(),
        account: {
          id: userId,
          email: userEmail,
          created_at: authUser?.user?.created_at,
        },
        family_memberships: memberships ?? [],
        stories: stories ?? [],
        memory_capsules: capsulesAuthored ?? [],
        story_likes: likes ?? [],
        notifications: notifications ?? [],
        family_relationships: myRelationships,
        invite_codes: invites ?? [],
      });
    }

    if (action === "delete_account") {
      // Require explicit confirmation phrase to prevent accidents
      if (body.confirm !== "DELETE") {
        return json({ error: "Confirmation phrase required" }, 400);
      }

      // 1. Get all family memberships for this user
      const { data: memberships } = await admin
        .from("family_members")
        .select("id, family_id, role")
        .eq("user_id", userId);

      // 2. For families where user is sole admin, transfer or clean up
      for (const m of memberships ?? []) {
        if (m.role !== "admin") continue;
        const { data: otherAdmins } = await admin
          .from("family_members")
          .select("id")
          .eq("family_id", m.family_id)
          .eq("role", "admin")
          .neq("user_id", userId);

        if (!otherAdmins || otherAdmins.length === 0) {
          // Promote oldest other member to admin
          const { data: nextMember } = await admin
            .from("family_members")
            .select("id")
            .eq("family_id", m.family_id)
            .neq("user_id", userId)
            .order("joined_at", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (nextMember) {
            await admin
              .from("family_members")
              .update({ role: "admin" })
              .eq("id", nextMember.id);
            // Reassign family ownership
            await admin
              .from("families")
              .update({ created_by: (await admin.from("family_members").select("user_id").eq("id", nextMember.id).single()).data?.user_id })
              .eq("id", m.family_id);
          }
        }
      }

      // 3. Delete user-owned content
      await admin.from("story_likes").delete().eq("user_id", userId);
      await admin.from("notifications").delete().eq("user_id", userId);
      await admin.from("memory_capsules").delete().eq("author_id", userId);
      await admin.from("stories").delete().eq("author_id", userId);
      await admin.from("invite_codes").delete().eq("created_by", userId);

      // 4. Delete relationships referencing this user's member rows
      const memberIds = (memberships ?? []).map((m) => m.id);
      if (memberIds.length > 0) {
        await admin
          .from("family_relationships")
          .delete()
          .or(
            `parent_member_id.in.(${memberIds.join(",")}),child_member_id.in.(${memberIds.join(",")})`
          );
      }

      // 5. Remove family memberships
      await admin.from("family_members").delete().eq("user_id", userId);

      // 6. Remove platform roles
      await admin.from("user_roles").delete().eq("user_id", userId);

      // 7. Delete avatar + storage objects under user folder
      for (const bucket of ["avatars", "story-photos", "story-audio"]) {
        const { data: files } = await admin.storage
          .from(bucket)
          .list(userId, { limit: 1000 });
        if (files && files.length > 0) {
          await admin.storage
            .from(bucket)
            .remove(files.map((f) => `${userId}/${f.name}`));
        }
      }

      // 8. Finally delete the auth user
      const { error: delErr } = await admin.auth.admin.deleteUser(userId);
      if (delErr) return json({ error: delErr.message }, 500);

      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
