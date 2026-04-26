# Highest Wash — Merchant App backend asks

The Merchant frontend is now wired to the bid-marketplace model from
`MERCHANT_APP_PROMPT.md`. To finish enabling everything, please confirm /
deploy the following on the shared backend (project `eqbogpvabcsngspphjte`).

## 1. Schema confirmations
- **`merchants`** must include: `id, owner_id, business_name, phone, address,
  lat, lng, online (bool), paystack_subaccount_code, country_code`.
  The frontend treats every merchant as verified (no `is_verified` gate).
- **`hw_orders`** uses `merchant_status` ('pending' for the broadcast pool +
  `merchant_id IS NULL`) and `delivery_status` for stage transitions:
  `merchant_accepted → picked_up_by_rider → washing → ready_for_rider →
  out_for_delivery → delivered`.
- **`hw_merchant_bids`**: `id, order_id, merchant_id, amount, status,
  message, created_at, expires_at`. The merchant inserts directly.
- **`hw_order_items`**: `id, order_id, qty, description, weight_kg`.

## 2. RLS
- Merchants must be able to: SELECT broadcast `hw_orders`
  (`merchant_status='pending' AND merchant_id IS NULL`), SELECT their own
  rows where `merchant_id = me.id`, INSERT into `hw_merchant_bids` for
  themselves, UPDATE their own bid (`status = 'withdrawn'`), UPDATE
  `hw_orders.delivery_status` only for orders where they are the merchant.
- Merchants need SELECT on `profiles` rows of customers tied to their orders
  (used to display the customer first name / phone on order detail).
- INSERT into `user_roles` for own user with `role='merchant'` should be
  allowed during onboarding (or grant via trigger if you prefer).

## 3. Edge functions
| When | Function | Body |
|---|---|---|
| Merchant marks `ready_for_rider` | `broadcast-rider-bids` | `{ order_id }` |
| Onboarding / Settings → bank setup | `register-merchant-subaccount` | `{ merchant_id, bank_code, account_number }` |

The frontend already calls both via `supabase.functions.invoke(...)` and
gracefully degrades (warns + toasts "coming soon") when they're not deployed.

## 4. Realtime
The app subscribes to:
- `hw_orders` filtered by `merchant_status=eq.pending` (broadcast pool)
- `hw_orders` filtered by `merchant_id=eq.<myMerchantId>` (my orders)
- `hw_merchant_bids` UPDATEs filtered by `merchant_id=eq.<myMerchantId>`
  (used to toast on bid acceptance)

Please make sure `Realtime` is enabled on `hw_orders` and `hw_merchant_bids`.

## 5. Nice-to-have (not blocking)
- Add `actual_weight_kg` to `hw_orders` so merchants can reconcile weight
  after washing.
- Add `eta_minutes` to `hw_merchant_bids` so we can pass ETA without
  shoving it into `message`.
- Add a `chats`/`messages` pair scoped to `(customer_id, merchant_id,
  order_id)` if you want in-app chat (currently we surface tel: + sms:
  links only).
