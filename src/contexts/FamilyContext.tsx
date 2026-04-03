import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FamilyContext {
  familyId: string;
  familyName: string;
  members: { id: string; user_id: string; display_name: string }[];
}

interface FamilyContextType {
  family: FamilyContext | null;
  families: FamilyContext[];
  switchFamily: (familyId: string) => void;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ACTIVE_FAMILY_KEY = "roots-active-family";

const FamilyCtx = createContext<FamilyContextType>({
  family: null,
  families: [],
  switchFamily: () => {},
  loading: true,
  refresh: async () => {},
});

export const useFamilyContext = () => useContext(FamilyCtx);

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [families, setFamilies] = useState<FamilyContext[]>([]);
  const [activeFamilyId, setActiveFamilyId] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_FAMILY_KEY)
  );
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setFamilies([]);
      setLoading(false);
      return;
    }

    const { data: memberships } = await supabase
      .from("family_members")
      .select("family_id, families(id, name)")
      .eq("user_id", user.id);

    if (!memberships || memberships.length === 0) {
      setFamilies([]);
      setLoading(false);
      return;
    }

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

    const storedId = localStorage.getItem(ACTIVE_FAMILY_KEY);
    const valid = familyContexts.find((f) => f.familyId === storedId);
    if (!valid && familyContexts.length > 0) {
      setActiveFamilyId(familyContexts[0].familyId);
      localStorage.setItem(ACTIVE_FAMILY_KEY, familyContexts[0].familyId);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const switchFamily = useCallback((familyId: string) => {
    setActiveFamilyId(familyId);
    localStorage.setItem(ACTIVE_FAMILY_KEY, familyId);
  }, []);

  const family = families.find((f) => f.familyId === activeFamilyId) || families[0] || null;

  return (
    <FamilyCtx.Provider value={{ family, families, switchFamily, loading, refresh: load }}>
      {children}
    </FamilyCtx.Provider>
  );
};
