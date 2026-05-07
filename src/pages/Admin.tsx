import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-is-admin";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2, Shield, ShieldOff, KeyRound, Ban, Trash2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type AdminUser = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  email_confirmed_at: string | null;
  memberships: { display_name: string; family_id: string; role: string }[];
  platform_roles: string[];
  story_count: number;
};

const Admin = () => {
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "list" },
    });
    if (error) {
      toast({ title: "Failed to load users", description: error.message, variant: "destructive" });
    } else {
      setUsers(data.users ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const call = async (body: Record<string, unknown>, successMsg: string) => {
    const { data, error } = await supabase.functions.invoke("admin-users", { body });
    if (error || (data as any)?.error) {
      toast({
        title: "Action failed",
        description: error?.message ?? (data as any)?.error,
        variant: "destructive",
      });
      return false;
    }
    toast({ title: successMsg });
    return true;
  };

  const onResetPassword = async (u: AdminUser) => {
    if (!u.email) return;
    setBusyId(u.id);
    await call(
      { action: "reset_password", email: u.email, redirectTo: `${window.location.origin}/reset-password` },
      "Password reset email sent"
    );
    setBusyId(null);
  };

  const onToggleBan = async (u: AdminUser) => {
    setBusyId(u.id);
    const banned = !!u.banned_until && new Date(u.banned_until) > new Date();
    if (await call({ action: "set_ban", user_id: u.id, ban: !banned }, banned ? "User unbanned" : "User banned")) {
      await fetchUsers();
    }
    setBusyId(null);
  };

  const onToggleAdmin = async (u: AdminUser) => {
    setBusyId(u.id);
    const isUserAdmin = u.platform_roles.includes("admin");
    if (await call({ action: "set_admin", user_id: u.id, make_admin: !isUserAdmin }, "Role updated")) {
      await fetchUsers();
    }
    setBusyId(null);
  };

  const onDelete = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    if (await call({ action: "delete_user", user_id: confirmDelete.id }, "User deleted")) {
      await fetchUsers();
    }
    setConfirmDelete(null);
    setBusyId(null);
  };

  if (roleLoading) {
    return (
      <PageLayout title="Admin">
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" /></div>
      </PageLayout>
    );
  }
  if (!isAdmin) return <Navigate to="/home" replace />;

  const filtered = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.email?.toLowerCase().includes(q) ||
      u.memberships.some((m) => m.display_name.toLowerCase().includes(q))
    );
  });

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString() : "—");

  return (
    <PageLayout title="Admin · Users">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            Manage all users on the platform. {users.length} total.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Search email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-72"
            />
            <Button variant="outline" size="icon" onClick={fetchUsers} aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <div className="rounded-md border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Families</TableHead>
                  <TableHead>Stories</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last sign-in</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => {
                  const isBanned = !!u.banned_until && new Date(u.banned_until) > new Date();
                  const userIsAdmin = u.platform_roles.includes("admin");
                  const isSelf = u.id === user?.id;
                  const busy = busyId === u.id;
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium">{u.email ?? "(no email)"}</div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {userIsAdmin && <Badge variant="default">Admin</Badge>}
                          {isBanned && <Badge variant="destructive">Banned</Badge>}
                          {!u.email_confirmed_at && <Badge variant="outline">Unverified</Badge>}
                          {isSelf && <Badge variant="secondary">You</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {u.memberships.length === 0 ? (
                          <span className="text-muted-foreground">None</span>
                        ) : (
                          u.memberships.map((m) => m.display_name).join(", ")
                        )}
                      </TableCell>
                      <TableCell>{u.story_count}</TableCell>
                      <TableCell className="text-sm">{fmt(u.created_at)}</TableCell>
                      <TableCell className="text-sm">{fmt(u.last_sign_in_at)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="inline-flex gap-1">
                          <Button size="icon" variant="ghost" disabled={busy || !u.email}
                            onClick={() => onResetPassword(u)} title="Send password reset">
                            <KeyRound className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" disabled={busy || isSelf}
                            onClick={() => onToggleAdmin(u)}
                            title={userIsAdmin ? "Remove admin" : "Make admin"}>
                            {userIsAdmin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" disabled={busy || isSelf}
                            onClick={() => onToggleBan(u)}
                            title={isBanned ? "Unban" : "Ban"}>
                            <Ban className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" disabled={busy || isSelf}
                            onClick={() => setConfirmDelete(u)} title="Delete user">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No users match.
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <strong>{confirmDelete?.email}</strong> and all of
              their account data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Admin;
