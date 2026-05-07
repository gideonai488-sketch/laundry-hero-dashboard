# Edge functions the merchant app calls

All deployed via Supabase Edge Functions. Verify CORS allows the
merchant origin and the Capacitor `capacitor://localhost` scheme.

| Name | When called | Body | Returns |
|---|---|---|---|
| `register-merchant-subaccount` | Onboarding & Settings → bank link | `{ merchant_id, bank_code, account_number }` | `{ subaccount_code, account_name }` — also writes to `merchants.paystack_subaccount_code` |
| `broadcast-rider-bids` | Merchant marks order `ready_for_rider` | `{ order_id }` | `{ ok: true }` — fans out to nearby riders |
| `request-payout` | Wallet → Withdraw | `{ merchant_id, amount, currency }` | `{ payout_id, status }` — inserts a `payouts` row, calls Paystack Transfers |
| `send-push` | Server-side notification fan-out | `{ user_id, kind, title, body, data }` | `{ delivered: n }` — already in `supabase/functions/send-push` |
| `delete-account` | Settings → delete account (replaces in-app server fn) | header `Authorization: Bearer <jwt>` | `{ success: true }` — uses service role to drop user + cascades |

Required secrets (Supabase → Project Settings → Edge Functions):
- `PAYSTACK_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (auto-injected)
- `EXPO_ACCESS_TOKEN` (for push), `FCM_SERVER_KEY`, `APNS_*` as needed
