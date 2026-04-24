import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, type AppRole } from "./supabase";

export interface MerchantRow {
  id: string;
  owner_id: string;
  business_name: string;
  city: string | null;
  country: string | null;
  phone: string | null;
  kyc_status: "pending" | "in_review" | "verified" | "rejected" | null;
  is_online: boolean | null;
  rating_avg: number | null;
  created_at: string;
}

interface AuthCtx {
  loading: boolean;
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  merchant: MerchantRow | null;
  isMerchant: boolean;
  isVerified: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [merchant, setMerchant] = useState<MerchantRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRolesAndMerchant = async (uid: string | undefined) => {
    if (!uid) {
      setRoles([]);
      setMerchant(null);
      return;
    }
    const [rolesRes, merchantRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("merchants").select("*").eq("owner_id", uid).maybeSingle(),
    ]);
    setRoles((rolesRes.data ?? []).map((r: { role: AppRole }) => r.role));
    setMerchant((merchantRes.data as MerchantRow | null) ?? null);
  };

  useEffect(() => {
    // Subscribe FIRST per Supabase guidance, then read existing session.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      // Defer DB calls so they don't run inside the auth callback.
      setTimeout(() => {
        loadRolesAndMerchant(sess?.user?.id).finally(() => setLoading(false));
      }, 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadRolesAndMerchant(data.session?.user?.id).finally(() => setLoading(false));
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      roles,
      merchant,
      isMerchant: roles.includes("merchant") || roles.includes("admin"),
      isVerified: merchant?.kyc_status === "verified",
      refresh: () => loadRolesAndMerchant(session?.user?.id),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [loading, session, roles, merchant]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
