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
    if (!authHeader) {
      return json({ error: "Missing auth" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the calling user
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Check admin role
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return json({ error: "Forbidden: admin only" }, 403);
    }

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = body.action ?? "list";

    if (action === "list") {
      const { data: usersList, error } =
        await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (error) return json({ error: error.message }, 500);

      const userIds = usersList.users.map((u) => u.id);
      const [{ data: members }, { data: roles }, { data: stories }] = await Promise.all([
        admin.from("family_members").select("user_id, display_name, family_id, role").in("user_id", userIds),
        admin.from("user_roles").select("user_id, role").in("user_id", userIds),
        admin.from("stories").select("author_id").in("author_id", userIds),
      ]);

      const storyCount: Record<string, number> = {};
      stories?.forEach((s) => { storyCount[s.author_id] = (storyCount[s.author_id] ?? 0) + 1; });

      const enriched = usersList.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        banned_until: (u as any).banned_until ?? null,
        email_confirmed_at: u.email_confirmed_at,
        memberships: members?.filter((m) => m.user_id === u.id) ?? [],
        platform_roles: roles?.filter((r) => r.user_id === u.id).map((r) => r.role) ?? [],
        story_count: storyCount[u.id] ?? 0,
      }));

      return json({ users: enriched });
    }

    if (action === "reset_password") {
      const { email } = body;
      if (!email) return json({ error: "email required" }, 400);
      const { error } = await admin.auth.resetPasswordForEmail(email, {
        redirectTo: body.redirectTo,
      });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === "delete_user") {
      const { user_id } = body;
      if (!user_id) return json({ error: "user_id required" }, 400);
      if (user_id === userData.user.id) return json({ error: "Cannot delete yourself" }, 400);
      const { error } = await admin.auth.admin.deleteUser(user_id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === "set_ban") {
      const { user_id, ban } = body;
      if (!user_id) return json({ error: "user_id required" }, 400);
      const { error } = await admin.auth.admin.updateUserById(user_id, {
        ban_duration: ban ? "876000h" : "none",
      } as any);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === "set_admin") {
      const { user_id, make_admin } = body;
      if (!user_id) return json({ error: "user_id required" }, 400);
      if (make_admin) {
        const { error } = await admin.from("user_roles").insert({ user_id, role: "admin" });
        if (error && !error.message.includes("duplicate")) return json({ error: error.message }, 500);
      } else {
        if (user_id === userData.user.id) return json({ error: "Cannot remove your own admin role" }, 400);
        const { error } = await admin.from("user_roles").delete().eq("user_id", user_id).eq("role", "admin");
        if (error) return json({ error: error.message }, 500);
      }
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
