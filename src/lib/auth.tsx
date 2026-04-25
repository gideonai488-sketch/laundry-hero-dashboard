import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, type AppRole } from "./supabase";

/**
 * Real schema (introspected): `merchants` columns are
 *   id, owner_id, business_name, email, phone, address, city, country_code,
 *   lat, lng, rating, total_reviews, total_orders, on_time_pct,
 *   acceptance_rate, capacity_per_day, current_load, online, kyc_status, joined_at
 *
 * (No `country`, no `is_online`, no `created_at`, no `rating_avg`.)
 */
export interface MerchantRow {
  id: string;
  owner_id: string;
  business_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country_code: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  total_reviews: number | null;
  total_orders: number | null;
  on_time_pct: number | null;
  acceptance_rate: number | null;
  capacity_per_day: number | null;
  current_load: number | null;
  online: boolean | null;
  kyc_status: "pending" | "in_review" | "verified" | "rejected" | null;
  joined_at: string;
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
