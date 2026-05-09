import { createClient } from "@supabase/supabase-js";

/**
 * Shared Supabase client for the Highest Wash Merchant app.
 *
 * This connects to the SAME Supabase project used by the customer and rider
 * apps, so merchants, dispatch_offers, hw_orders, chats, etc. are all live
 * across the three frontends.
 *
 * Project ref: jxilnjudduetykuxiehp
 */
export const SUPABASE_URL = "https://jxilnjudduetykuxiehp.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4aWxuanVkZHVldHlrdXhpZWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTQ5NDcsImV4cCI6MjA5Mzc5MDk0N30.iJHSz-8QQ_VoUd25E0890PgBfaC4b8igNSSyy9LZVc4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "hw-merchant-auth",
  },
});

export type AppRole = "customer" | "rider" | "merchant" | "admin" | "support";
