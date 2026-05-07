# Backend TODO — tick top-to-bottom

## Auth
- [ ] Enable **Phone provider** (Twilio or MessageBird) in Supabase Auth.
- [ ] Disable **Google** provider (frontend no longer uses it).
- [ ] Turn on **HIBP password check**.

## Schema (run migrations from SCHEMA.md)
- [ ] `app_role` + `user_roles` + `has_role()`
- [ ] `profiles` + `handle_new_user` trigger (copies country/city/area)
- [ ] `merchants` (with country_code/city/area/paystack_subaccount_code)
- [ ] `hw_orders` ALTERs (country_code, city, area, currency, amount_local, delivered_at, customer_confirmed_at)
- [ ] `chats` + `messages` RLS + triggers (BACKEND_TODO.md §1–§2)
- [ ] `disputes` ALTERs + RLS (BACKEND_TODO.md §3)
- [ ] `hw_order_status_events` table + trigger (BACKEND_TODO.md §4)
- [ ] `payouts` table + RLS
- [ ] `notifications` table + RLS
- [ ] `push_tokens` table + RLS

## Realtime
- [ ] `ALTER PUBLICATION supabase_realtime ADD TABLE ...` (REALTIME.md)
- [ ] `REPLICA IDENTITY FULL` on every realtime table

## Edge functions (EDGE_FUNCTIONS.md)
- [ ] Deploy `register-merchant-subaccount`
- [ ] Deploy `broadcast-rider-bids`
- [ ] Deploy `request-payout`
- [ ] Deploy/verify `send-push`
- [ ] Deploy `delete-account` (replaces the in-app server fn)
- [ ] Add secrets: `PAYSTACK_SECRET_KEY`, push provider keys

## Smoke test (must all pass before sign-off)
- [ ] Signup with a Ghana phone → SMS arrives → OTP verifies → onboarding loads
- [ ] Onboarding submit creates `merchants` row with country_code='GH'
- [ ] Insert a broadcast order in DB → merchant sees it live (no refresh)
- [ ] Place bid → customer accepts → chat row auto-created → both sides chat
- [ ] Mark delivered → status event recorded → wallet "this week" updates
- [ ] Withdraw → `payouts` row inserted with status `pending`
- [ ] Bell icon shows unread; tapping a notification opens the right screen
- [ ] Delete account from Settings → user + merchant + roles + profile gone
