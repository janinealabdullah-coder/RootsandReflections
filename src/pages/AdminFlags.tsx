import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-is-admin";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";

type FlagNotification = {
  id: string;
  title: string;
  body: string | null;
  related_id: string | null;
  family_id: string;
  created_at: string;
  is_read: boolean;
};

const REASONS = [
  "This story is inaccurate",
  "This story is private and I did not consent",
  "Other",
];

const parseReason = (body: string | null): string => {
  if (!body) return "Unknown";
  const m = body.match(/Reason:\s*(.+)$/m);
  return m ? m[1].trim() : "Unknown";
};

const parseStoryTitle = (body: string | null): string => {
  if (!body) return "(untitled)";
  const m = body.match(/Story:\s*"([^"]+)"/);
  return m ? m[1] : "(untitled)";
};

const AdminFlags = () => {
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [flags, setFlags] = useState<FlagNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchFlags = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("id,title,body,related_id,family_id,created_at,is_read")
      .eq("type", "story_flag")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load flags", description: error.message, variant: "destructive" });
    } else {
      setFlags(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchFlags();
  }, [isAdmin]);

  const resolve = async (id: string, action: "resolved" | "approved") => {
    setBusyId(id);
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (error) {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: action === "approved" ? "Marked as approved" : "Marked as resolved" });
      await fetchFlags();
    }
    setBusyId(null);
  };

  const visible = useMemo(
    () => flags.filter((f) => (showResolved ? f.is_read : !f.is_read)),
    [flags, showResolved]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, FlagNotification[]>();
    for (const r of REASONS) map.set(r, []);
    for (const f of visible) {
      const reason = parseReason(f.body);
      const key = REASONS.includes(reason) ? reason : "Other";
      map.get(key)!.push(f);
    }
    return map;
  }, [visible]);

  if (roleLoading) {
    return (
      <PageLayout>
        <PageHeader title="Flagged Stories" />
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" /></div>
      </PageLayout>
    );
  }
  if (!isAdmin) return <Navigate to="/home" replace />;

  const openCount = flags.filter((f) => !f.is_read).length;

  return (
    <PageLayout>
      <PageHeader title="Admin · Flagged Stories" />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            {openCount} open {openCount === 1 ? "report" : "reports"} across the platform.
          </p>
          <div className="flex gap-2">
            <Button
              variant={showResolved ? "outline" : "default"}
              size="sm"
              onClick={() => setShowResolved(false)}
            >
              Open
            </Button>
            <Button
              variant={showResolved ? "default" : "outline"}
              size="sm"
              onClick={() => setShowResolved(true)}
            >
              Resolved
            </Button>
            <Button variant="outline" size="icon" onClick={fetchFlags} aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : visible.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {showResolved ? "No resolved reports yet." : "No open reports. All clear!"}
            </CardContent>
          </Card>
        ) : (
          REASONS.map((reason) => {
            const items = grouped.get(reason) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={reason} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-display font-semibold">{reason}</h2>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <div className="space-y-3">
                  {items.map((f) => {
                    const busy = busyId === f.id;
                    return (
                      <Card key={f.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{parseStoryTitle(f.body)}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">{f.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Reported {new Date(f.created_at).toLocaleString()}
                          </p>
                          {!showResolved && (
                            <div className="flex gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => resolve(f.id, "approved")}
                              >
                                <ShieldCheck className="w-4 h-4" />
                                Approve story
                              </Button>
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() => resolve(f.id, "resolved")}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Mark resolved
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </PageLayout>
  );
};

export default AdminFlags;
