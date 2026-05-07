import { useEffect, useState, useCallback } from "react";
import PageLayout from "@/components/PageLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/hooks/use-family";
import { Plus, Link2, Trash2, User, TreeDeciduous } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Member {
  id: string;
  user_id: string;
  display_name: string;
  birth_year: number | null;
  relationship: string | null;
  avatar_url: string | null;
}

interface Relationship {
  id: string;
  parent_member_id: string;
  child_member_id: string;
}

interface TreeNode {
  member: Member;
  children: TreeNode[];
}

const FamilyTree = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { family, loading: familyLoading } = useFamily();
  const [members, setMembers] = useState<Member[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [parentId, setParentId] = useState("");
  const [childId, setChildId] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberStories, setMemberStories] = useState<{ id: string; title: string; year: number | null; decade: string | null }[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);

  const openMemberProfile = useCallback(async (member: Member) => {
    setSelectedMember(member);
    setStoriesLoading(true);
    const { data } = await supabase
      .from("stories")
      .select("id, title, year, decade")
      .eq("family_id", family!.familyId)
      .eq("author_id", member.user_id)
      .order("year", { ascending: false, nullsFirst: false });
    setMemberStories(data || []);
    setStoriesLoading(false);
  }, [family]);

  const loadData = useCallback(async () => {
    if (!family) return;

    const [{ data: membersData }, { data: relsData }] = await Promise.all([
      supabase
        .from("family_members")
        .select("id, user_id, display_name, birth_year, relationship, avatar_url")
        .eq("family_id", family.familyId),
      supabase
        .from("family_relationships")
        .select("id, parent_member_id, child_member_id")
        .eq("family_id", family.familyId),
    ]);

    setMembers(membersData || []);
    setRelationships(relsData || []);
    setLoading(false);
  }, [family]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build tree structure
  const buildTree = (): { roots: TreeNode[]; unconnected: Member[] } => {
    const childIds = new Set(relationships.map((r) => r.child_member_id));
    const parentIds = new Set(relationships.map((r) => r.parent_member_id));

    // Members that are parents but not children = roots
    // Members with no connections = unconnected
    const connectedIds = new Set([...childIds, ...parentIds]);

    const buildNode = (memberId: string, visited: Set<string>): TreeNode | null => {
      if (visited.has(memberId)) return null;
      visited.add(memberId);

      const member = members.find((m) => m.id === memberId);
      if (!member) return null;

      const childRels = relationships.filter((r) => r.parent_member_id === memberId);
      const children: TreeNode[] = [];
      for (const rel of childRels) {
        const node = buildNode(rel.child_member_id, visited);
        if (node) children.push(node);
      }

      // Sort children by birth year
      children.sort((a, b) => (a.member.birth_year || 9999) - (b.member.birth_year || 9999));

      return { member, children };
    };

    const roots: TreeNode[] = [];
    const visited = new Set<string>();

    // Find root members (parents that aren't children of anyone)
    for (const pid of parentIds) {
      if (!childIds.has(pid)) {
        const node = buildNode(pid, visited);
        if (node) roots.push(node);
      }
    }

    // Handle cycles — remaining connected members
    for (const mid of connectedIds) {
      if (!visited.has(mid)) {
        const node = buildNode(mid, visited);
        if (node) roots.push(node);
      }
    }

    roots.sort((a, b) => (a.member.birth_year || 9999) - (b.member.birth_year || 9999));

    const unconnected = members.filter((m) => !connectedIds.has(m.id));

    return { roots, unconnected };
  };

  const handleAddRelationship = async () => {
    if (!parentId || !childId || parentId === childId || !family) {
      toast.error("Please select two different members");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("family_relationships").insert({
      family_id: family.familyId,
      parent_member_id: parentId,
      child_member_id: childId,
    });

    if (error) {
      toast.error(error.message.includes("duplicate") ? "This connection already exists" : "Failed to add connection");
    } else {
      toast.success("Connection added!");
      setShowAddDialog(false);
      setParentId("");
      setChildId("");
      await loadData();
    }
    setSaving(false);
  };

  const handleDeleteRelationship = async (relId: string) => {
    const { error } = await supabase
      .from("family_relationships")
      .delete()
      .eq("id", relId);

    if (error) {
      toast.error("Failed to remove connection");
    } else {
      toast.success("Connection removed");
      await loadData();
    }
  };

  const getMemberName = (id: string) =>
    members.find((m) => m.id === id)?.display_name || "Unknown";

  if (familyLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground text-lg">Loading family tree…</p>
        </div>
      </PageLayout>
    );
  }

  const { roots, unconnected } = buildTree();
  const hasConnections = relationships.length > 0;

  return (
    <PageLayout>
      <div className="pb-12">
      <PageHeader
        title="Family Tree"
        actions={
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Link2 className="w-4 h-4 mr-1.5" />
            Connect
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto px-5 mt-8">
        {members.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <TreeDeciduous className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">
              No members yet. Invite family to start building your tree.
            </p>
          </div>
        ) : !hasConnections ? (
          /* No connections yet — show flat grid with prompt */
          <div className="space-y-6">
            <div className="roots-card text-center py-6 space-y-2">
              <Link2 className="w-8 h-8 mx-auto text-primary/60" />
              <p className="text-foreground font-semibold">Connect your family</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Tap "Connect" above to link parent and child to start building your tree.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {members.map((m) => (
                <MemberCard key={m.id} member={m} onClick={openMemberProfile} />
              ))}
            </div>
          </div>
        ) : (
          /* Tree visualization */
          <div className="space-y-8">
            {/* Connected tree */}
            <div className="overflow-x-auto pb-4">
              <div className="flex flex-col items-center gap-0 min-w-fit">
                {roots.map((root) => (
                  <TreeBranch
                    key={root.member.id}
                    node={root}
                    relationships={relationships}
                    getMemberName={getMemberName}
                    onDeleteRel={handleDeleteRelationship}
                    onMemberClick={openMemberProfile}
                    isRoot
                  />
                ))}
              </div>
            </div>

            {/* Unconnected members */}
            {unconnected.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Not yet connected
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {unconnected.map((m) => (
                    <MemberCard key={m.id} member={m} onClick={openMemberProfile} />
                  ))}
                </div>
              </div>
            )}

            {/* Connections list */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Connections
              </p>
              {relationships.map((rel) => (
                <div
                  key={rel.id}
                  className="roots-card flex items-center justify-between py-2 px-4"
                >
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{getMemberName(rel.parent_member_id)}</span>
                    <span className="text-muted-foreground mx-2">→</span>
                    <span className="font-semibold">{getMemberName(rel.child_member_id)}</span>
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteRelationship(rel.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add connection dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Connect Family Members</DialogTitle>
            <DialogDescription>
              Choose a parent and child to link them in the tree.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Parent</label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent…" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.display_name}
                      {m.birth_year ? ` (b. ${m.birth_year})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Child</label>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select child…" />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter((m) => m.id !== parentId)
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.display_name}
                        {m.birth_year ? ` (b. ${m.birth_year})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleAddRelationship}
              disabled={!parentId || !childId || saving}
            >
              {saving ? "Saving…" : "Add Connection"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </PageLayout>
  );
};

/* ── Tree branch (recursive) ── */
const TreeBranch = ({
  node,
  relationships,
  getMemberName,
  onDeleteRel,
  onMemberClick,
  isRoot,
}: {
  node: TreeNode;
  relationships: Relationship[];
  getMemberName: (id: string) => string;
  onDeleteRel: (id: string) => void;
  onMemberClick: (m: Member) => void;
  isRoot?: boolean;
}) => {
  return (
    <div className="flex flex-col items-center">
      <MemberCard member={node.member} highlight={isRoot} onClick={onMemberClick} />
      {node.children.length > 0 && (
        <>
          <div className="w-0.5 h-6 bg-primary/30" />
          {node.children.length > 1 && (
            <div
              className="h-0.5 bg-primary/30"
              style={{
                width: `${Math.max((node.children.length - 1) * 140, 60)}px`,
              }}
            />
          )}
          <div className="flex gap-4 items-start">
            {node.children.map((child) => (
              <div key={child.member.id} className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-primary/30" />
                <TreeBranch
                  node={child}
                  relationships={relationships}
                  getMemberName={getMemberName}
                  onDeleteRel={onDeleteRel}
                  onMemberClick={onMemberClick}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ── Member card ── */
const MemberCard = ({
  member,
  highlight,
  onClick,
}: {
  member: Member;
  highlight?: boolean;
  onClick?: (m: Member) => void;
}) => {
  const Wrapper: any = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick ? () => onClick(member) : undefined}
      className={`roots-card flex flex-col items-center text-center py-4 px-5 min-w-[120px] transition-shadow ${
        highlight ? "ring-2 ring-primary/40 shadow-md" : ""
      } ${onClick ? "hover:shadow-md hover:border-primary/40 cursor-pointer w-full" : ""}`}
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.display_name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <User className="w-6 h-6 text-primary" />
        )}
      </div>
      <p className="font-semibold text-foreground text-sm">{member.display_name}</p>
      {member.relationship && (
        <p className="text-xs text-muted-foreground mt-0.5">{member.relationship}</p>
      )}
      {member.birth_year && (
        <p className="text-xs text-muted-foreground">b. {member.birth_year}</p>
      )}
    </Wrapper>
  );
};

export default FamilyTree;
