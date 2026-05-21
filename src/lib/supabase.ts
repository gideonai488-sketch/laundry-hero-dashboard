import { createClient } from "@supabase/supabase-js";

/**
 * Shared Supabase client for the Highest Wash Merchant app.
 *
 * This connects to the SAME Supabase project used by the customer and rider
 * apps, so merchants, dispatch_offers, hw_orders, chats, etc. are all live
 * across the three frontends.
 *
 * Project ref: jxilnjudduetykuxiehp
 * Config is read from VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars.
 */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "hw-merchant-auth",
  },
});

export type AppRole = "customer" | "rider" | "merchant" | "admin" | "support";
