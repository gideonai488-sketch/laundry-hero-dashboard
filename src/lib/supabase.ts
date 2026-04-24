import { createClient } from "@supabase/supabase-js";

/**
 * Shared Supabase client for the Highest Wash Merchant app.
 *
 * This connects to the SAME Supabase project used by the customer and rider
 * apps, so merchants, dispatch_offers, hw_orders, chats, etc. are all live
 * across the three frontends.
 *
 * Project ref: eqbogpvabcsngspphjte
 */
export const SUPABASE_URL = "https://eqbogpvabcsngspphjte.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYm9ncHZhYmNzbmdzcHBoanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NjcxMjMsImV4cCI6MjA5MjM0MzEyM30.EN5bPu66_y5xN1i_EKxMbFKJoKb9jAmuIBxGUTRSMPk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "hw-merchant-auth",
  },
});

export type AppRole = "customer" | "rider" | "merchant" | "admin" | "support";
