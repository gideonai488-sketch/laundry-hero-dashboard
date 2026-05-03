/**
 * Paystack public (publishable) key — safe to expose in browser code.
 * Used for Paystack Inline checkout. All secret-key operations live in
 * Supabase Edge Functions (managed by the backend agent), so the browser
 * only ever calls those functions — never Paystack's secret API directly.
 */
export const PAYSTACK_PUBLIC_KEY =
  "pk_live_671fccd651daf066804466572cfd0b7c47df2471";

import { supabase } from "./supabase";

export interface PaystackBank {
  id: number;
  name: string;
  code: string;
  currency?: string;
  type?: string;
  country?: string;
  active?: boolean;
}

export async function listBanks(country = "ghana"): Promise<PaystackBank[]> {
  // Paystack's bank list is public and CORS-enabled.
  const res = await fetch(
    `https://api.paystack.co/bank?country=${encodeURIComponent(country)}`,
    { headers: { Accept: "application/json" } }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Couldn't load banks (${res.status})`);
  }
  const banks = data?.data ?? data?.banks ?? data;
  return Array.isArray(banks) ? banks : [];
}

export interface ResolvedAccount {
  account_number: string;
  account_name: string;
  bank_id?: number;
}

export async function resolveAccount(
  account_number: string,
  bank_code: string
): Promise<ResolvedAccount> {
  const { data, error } = await supabase.functions.invoke("resolve-bank-account", {
    body: { account_number, bank_code },
  });
  if (error) throw new Error(error.message ?? "Couldn't verify that account.");
  const r = (data as any)?.data ?? data;
  if (!r?.account_name) {
    throw new Error("Couldn't verify that account. Double-check the number.");
  }
  return r;
}

export interface CreatedSubaccount {
  subaccount_code: string;
  account_number?: string;
  account_name?: string;
  bank_name?: string;
}

export async function createSubaccount(input: {
  business_name: string;
  bank_code: string;
  account_number: string;
  percentage_charge?: number;
  primary_contact_email?: string;
  primary_contact_name?: string;
  primary_contact_phone?: string;
  merchant_id?: string;
}): Promise<CreatedSubaccount> {
  const { data, error } = await supabase.functions.invoke(
    "register-merchant-subaccount",
    { body: input }
  );
  if (error) throw new Error(error.message ?? "Subaccount creation failed.");
  const r = (data as any)?.data ?? data;
  if (!r?.subaccount_code) {
    throw new Error("Subaccount creation failed. Try again.");
  }
  return r;
}
