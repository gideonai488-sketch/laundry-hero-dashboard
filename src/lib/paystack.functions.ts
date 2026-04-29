import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SUPABASE_URL = "https://eqbogpvabcsngspphjte.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYm9ncHZhYmNzbmdzcHBoanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NjcxMjMsImV4cCI6MjA5MjM0MzEyM30.EN5bPu66_y5xN1i_EKxMbFKJoKb9jAmuIBxGUTRSMPk";

const AuthedInput = z.object({ accessToken: z.string().min(20) });

async function requireUser(accessToken: string) {
  const userClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data: { user }, error } = await userClient.auth.getUser(accessToken);
  if (error || !user) throw new Error("Unauthorized. Please sign in again.");
  return { user, userClient };
}

function requirePaystackSecret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Paystack payouts are not configured yet.");
  return key;
}

async function readPaystackError(res: Response) {
  const payload = await res.json().catch(() => ({}));
  return payload?.message || payload?.error || `Paystack request failed (${res.status})`;
}

export const resolvePaystackAccount = createServerFn({ method: "POST" })
  .inputValidator((data) => AuthedInput.extend({
    account_number: z.string().min(6).max(20),
    bank_code: z.string().min(1).max(30),
  }).parse(data))
  .handler(async ({ data }) => {
    await requireUser(data.accessToken);
    const secretKey = requirePaystackSecret();
    const url = new URL("https://api.paystack.co/bank/resolve");
    url.searchParams.set("account_number", data.account_number);
    url.searchParams.set("bank_code", data.bank_code);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${secretKey}`, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(await readPaystackError(res));
    const payload = await res.json();
    return payload?.data ?? payload;
  });

export const createPaystackSubaccount = createServerFn({ method: "POST" })
  .inputValidator((data) => AuthedInput.extend({
    business_name: z.string().min(1).max(120),
    bank_code: z.string().min(1).max(30),
    account_number: z.string().min(6).max(20),
    percentage_charge: z.number().min(0).max(100).optional(),
    primary_contact_email: z.string().email().optional(),
    primary_contact_name: z.string().min(1).max(120).optional(),
    primary_contact_phone: z.string().min(4).max(30).optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { user, userClient } = await requireUser(data.accessToken);
    const secretKey = requirePaystackSecret();
    const res = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        business_name: data.business_name,
        settlement_bank: data.bank_code,
        account_number: data.account_number,
        percentage_charge: data.percentage_charge ?? 0,
        primary_contact_email: data.primary_contact_email,
        primary_contact_name: data.primary_contact_name,
        primary_contact_phone: data.primary_contact_phone,
      }),
    });
    if (!res.ok) throw new Error(await readPaystackError(res));
    const payload = await res.json();
    const subaccount = payload?.data ?? payload;
    if (subaccount?.subaccount_code) {
      await userClient
        .from("merchants")
        .update({ paystack_subaccount_code: subaccount.subaccount_code })
        .eq("owner_id", user.id);
    }
    return subaccount;
  });