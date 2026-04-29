/**
 * Paystack public (publishable) key — safe to expose in browser code.
 * Used for Paystack Inline checkout. Secret-key operations (list banks,
 * resolve account, create subaccount) are proxied through the shared
 * backend's Edge Functions, which hold the SK.
 */
export const PAYSTACK_PUBLIC_KEY =
  "pk_live_671fccd651daf066804466572cfd0b7c47df2471";

import { supabase, SUPABASE_URL } from "./supabase";

const FN_BASE = `${SUPABASE_URL}/functions/v1`;

async function authedFetch(path: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${FN_BASE}${path}`, { ...init, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || json?.message || `Request failed (${res.status})`);
  }
  return json;
}

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
  // Paystack's bank list is public and CORS-enabled, so avoid the secret-key
  // Edge Function here. This prevents a broken auth helper in that function
  // from blocking the payout setup sheet.
  const res = await fetch(
    `https://api.paystack.co/bank?country=${encodeURIComponent(country)}`,
    { headers: { Accept: "application/json" } }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Couldn't load banks (${res.status})`);
  }
  // Common shapes: { data: [...] } or { banks: [...] } or [...]
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
  const data = await authedFetch(`/paystack-resolve-account`, {
    method: "POST",
    body: JSON.stringify({ account_number, bank_code }),
  });
  const r = data?.data ?? data;
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
}): Promise<CreatedSubaccount> {
  const data = await authedFetch(`/paystack-create-subaccount`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  const r = data?.data ?? data;
  if (!r?.subaccount_code) {
    throw new Error("Subaccount creation failed. Try again.");
  }
  return r;
}
