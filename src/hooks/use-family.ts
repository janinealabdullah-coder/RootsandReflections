import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FamilyContext {
  familyId: string;
  familyName: string;
  members: { id: string; user_id: string; display_name: string }[];
}

const ACTIVE_FAMILY_KEY = "roots-active-family";

export const useFamily = () => {
  const { user } = useAuth();
  const [families, setFamilies] = useState<FamilyContext[]>([]);
  const [activeFamilyId, setActiveFamilyId] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_FAMILY_KEY)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      // Get all family memberships for this user
      const { data: memberships } = await supabase
        .from("family_members")
        .select("family_id, families(id, name)")
        .eq("user_id", user.id);

      if (!memberships || memberships.length === 0) {
        setFamilies([]);
        setLoading(false);
        return;
      }

      // Load members for each family in parallel
      const familyContexts = await Promise.all(
        memberships.map(async (m) => {
          const fam = m.families as any;
          const { data: members } = await supabase
            .from("family_members")
            .select("id, user_id, display_name")
            .eq("family_id", fam.id);

          return {
            familyId: fam.id,
            familyName: fam.name,
            members: members || [],
          };
        })
      );

      setFamilies(familyContexts);

      // If no active family stored, or stored one is invalid, default to first
      const storedId = localStorage.getItem(ACTIVE_FAMILY_KEY);
      const valid = familyContexts.find((f) => f.familyId === storedId);
      if (!valid && familyContexts.length > 0) {
        setActiveFamilyId(familyContexts[0].familyId);
        localStorage.setItem(ACTIVE_FAMILY_KEY, familyContexts[0].familyId);
      }

      setLoading(false);
    };

    load();
  }, [user]);

  const switchFamily = useCallback((familyId: string) => {
    setActiveFamilyId(familyId);
    localStorage.setItem(ACTIVE_FAMILY_KEY, familyId);
  }, []);

  const family = families.find((f) => f.familyId === activeFamilyId) || families[0] || null;

  return { family, families, switchFamily, loading };
};
