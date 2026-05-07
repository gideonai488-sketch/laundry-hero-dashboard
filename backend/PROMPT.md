# BACKEND AGENT — PROMPT (read me first)

You are the backend agent for **Highest Wash**, a 3-app marketplace
(customer · rider · merchant) running on a single Supabase project
(`eqbogpvabcsngspphjte`). The **merchant frontend is feature-complete**
and shipping. Your job is to make every table, RLS policy, trigger, edge
function, and realtime publication match what this frontend expects.

## Product in one paragraph
Customers post laundry orders → merchants in the same city see them live
and **bid** (price + ETA) → customer accepts a bid → merchant fulfils
(washes, then hands off to a rider for delivery) → payment settles via
Paystack subaccount → merchant withdraws to a linked bank.

## Markets we now support (signup country selector)
Ghana, Morocco, Qatar, Saudi Arabia, Egypt, Malaysia, Finland, Dubai
(UAE), Australia, USA, Canada, Philippines, Kuwait, Mexico, South Africa,
Côte d'Ivoire, UK, Switzerland. The frontend stores `country_code`,
`city`, `area` in `auth.users.user_metadata` on signup — the
`merchants.country_code` / `city` / `area` columns must accept the same
values (see SCHEMA.md).

## Auth (NEW — important)
- Sign up = **phone + SMS OTP** (`supabase.auth.signUp({ phone })` then
  `verifyOtp({ type: "sms" })`). Configure Twilio (or MessageBird) under
  **Auth → Providers → Phone**. Without that, signup will 400.
- Login = email + password (legacy users) — keep working.
- **Google sign-in is removed** — no need to keep that provider on.
- Enable **Password HIBP check** (Auth → Email).

## Currency
Frontend computes display currency client-side from
`merchants.country_code` (see `src/lib/locale.tsx`). Backend just needs
to **store the country/city/area** so other apps can show the same FX.

## Hard rules
1. Never store roles on `profiles` or `merchants`. Use `public.user_roles`
   + `public.has_role(uid, app_role)` SECURITY DEFINER (already in repo).
2. Every new table needs RLS. Default to deny.
3. Every table the merchant app subscribes to (REALTIME.md) MUST be on
   `supabase_realtime` publication AND have `REPLICA IDENTITY FULL`.
4. No service-role key in client code. Edge functions only.
5. After each migration, run a smoke test against the merchant preview
   URL and confirm: signup OTP → onboarding → see incoming jobs → bid →
   chat → mark delivered → see payout → withdraw.

Then walk down `TODO.md` top-to-bottom. Don't stop until every item is
✅.
