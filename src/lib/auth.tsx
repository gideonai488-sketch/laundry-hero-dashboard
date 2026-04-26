import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, type AppRole } from "./supabase";

/**
 * Real `merchants` columns in the shared backend
 * (NOT `hw_merchants`):
 *   id, owner_id, business_name, email, phone, address, city, country_code,
 *   lat, lng, online, paystack_subaccount_code, kyc_status, joined_at,
 *   plus a few stat columns (rating, total_orders, ...).
 *
 * We deliberately do NOT gate on `kyc_status` — the spec says treat all
 * merchants as verified for now.
 */
export interface MerchantRow {
  id: string;
  owner_id: string;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country_code: string | null;
  lat: number | null;
  lng: number | null;
  online: boolean | null;
  paystack_subaccount_code: string | null;
  joined_at?: string | null;
}

interface AuthCtx {
  loading: boolean;
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  merchant: MerchantRow | null;
  isMerchant: boolean;
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
    setRoles(((rolesRes.data ?? []) as { role: AppRole }[]).map((r) => r.role));
    setMerchant((merchantRes.data as MerchantRow | null) ?? null);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
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
