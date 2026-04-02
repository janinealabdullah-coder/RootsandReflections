import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FamilyContext {
  familyId: string;
  familyName: string;
  members: { id: string; user_id: string; display_name: string }[];
}

export const useFamily = () => {
  const { user } = useAuth();
  const [family, setFamily] = useState<FamilyContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data: membership } = await supabase
        .from("family_members")
        .select("family_id, families(id, name)")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        setLoading(false);
        return;
      }

      const fam = membership.families as any;

      const { data: members } = await supabase
        .from("family_members")
        .select("id, user_id, display_name")
        .eq("family_id", fam.id);

      setFamily({
        familyId: fam.id,
        familyName: fam.name,
        members: members || [],
      });
      setLoading(false);
    };

    load();
  }, [user]);

  return { family, loading };
};
