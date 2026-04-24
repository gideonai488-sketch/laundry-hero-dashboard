# Backend TODO — what the merchant app needs from your backend agents

The merchant frontend is now wired live to your Supabase project
(`eqbogpvabcsngspphjte`). Auth, KYC gating, dispatch offers, orders, AI insights,
services, staff, inventory, payouts, and notifications all read/write real tables.

Below is the exact list of things the **frontend depends on** that your backend
agents still need to build/deploy for full production behavior.

---

## 1. Tables the frontend already queries (must exist with these columns)

If your schema differs, either add the missing columns or tell me the real names so
I can update `src/lib/queries.ts`.

### `merchants`
- `id uuid pk`, `owner_id uuid (auth.users)`, `business_name text`, `city text`,
  `country text`, `phone text`, `kyc_status text` ('pending' | 'in_review' |
  'verified' | 'rejected'), `is_online bool`, `rating_avg numeric`, `created_at timestamptz`

### `user_roles`  (already in your handoff)
- `user_id uuid`, `role app_role`

### `hw_orders`
- `id uuid pk`, `merchant_id uuid`, `customer_id uuid`, `customer_name text`,
  `service_summary text`, `item_count int`, `total_usd numeric`, `total_local numeric`,
  `local_currency text`, `pickup_address text`, `distance_km numeric`,
  `status text` (pending | ai_dispatching | accepted | pickup | washing | ready |
  out_for_delivery | delivered | cancelled), `notes text`, `rider_id uuid`,
  `created_at timestamptz`

### `dispatch_offers`
- `id uuid pk`, `order_id uuid`, `recipient_id uuid`, `recipient_type text`
  ('merchant' | 'rider'), `expires_at timestamptz`, `decision text`
  ('pending' | 'accepted' | 'declined' | 'expired'), `decided_at timestamptz`,
  `ai_confidence int`, `ai_reason text`, `trust_summary text`,
  `payload jsonb` (must contain: `customer_name`, `service`, `amount_local`,
  `distance`, `rider_name`, `rider_eta`), `created_at timestamptz`

### `services`
- `id`, `merchant_id`, `name`, `description`, `price_usd`, `duration_hours`,
  `ai_pricing_enabled bool`, `active bool`

### `staff`
- `id`, `merchant_id`, `full_name`, `role`, `phone`, `active bool`

### `inventory_items`
- `id`, `merchant_id`, `name`, `unit`, `quantity numeric`, `reorder_threshold numeric`,
  `auto_reorder bool`

### `ai_insights`
- `id`, `merchant_id`, `kind` (pricing | demand | anomaly | dispute | reorder | schedule),
  `title`, `body`, `status` (open | accepted | dismissed), `payload jsonb`, `created_at`

### `hw_payouts`
- `id`, `merchant_id`, `amount_usd`, `amount_local`, `local_currency`, `status`
  (pending | processing | paid | failed), `destination text`, `paid_at`, `created_at`

### `hw_notifications`
- `id`, `user_id`, `type`, `title`, `body`, `read_at`, `created_at`

---

## 2. RLS policies the frontend assumes

Per your handoff RLS is enabled. Concretely the merchant app needs:

- `merchants`: SELECT/UPDATE where `owner_id = auth.uid()`
- `hw_orders`, `dispatch_offers`, `services`, `staff`, `inventory_items`,
  `ai_insights`, `hw_payouts`: SELECT/UPDATE where `merchant_id` belongs to
  `auth.uid()` (use a `has_merchant(uid, merchant_id)` security-definer helper)
- `hw_notifications`: SELECT/UPDATE where `user_id = auth.uid()`
- `user_roles`: SELECT where `user_id = auth.uid()`
- New signups insert into `merchants` themselves — confirm INSERT policy allows
  `with check (owner_id = auth.uid())`.

---

## 3. Realtime publications

Add these tables to the `supabase_realtime` publication:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE
  public.dispatch_offers,
  public.hw_orders,
  public.hw_notifications,
  public.messages;
```

(The frontend already subscribes to `merchant:{id}:dispatch`,
`merchant:{id}:orders`, and `user:{id}:notifications`.)

---

## 4. Role grant (BLOCKER for new merchants)

After signup the user has NO `merchant` role, so the KYC gate also blocks them.
Either:

- **Option A (recommended):** add a DB trigger on `merchants` insert that also
  inserts `('user_id', 'merchant')` into `user_roles`. Or:
- **Option B:** deploy the `become-merchant` edge function from your handoff.

Until one of these exists, every new signup will see "Awaiting role grant".

---

## 5. Edge functions still TODO (frontend will start calling them once deployed)

| Function | Called from |
|---|---|
| `ai-dispatch` | (writes `dispatch_offers` — frontend just listens) |
| `dispatch-respond` | currently the FE updates `dispatch_offers.decision` directly; switch to this fn when it exists for atomic order state advance |
| `voice-process` | `VoiceCommandBar` — currently mocked, will `supabase.functions.invoke('voice-process', ...)` |
| `ai-pricing`, `ai-demand-forecast`, `ai-anomaly-detector`, `ai-dispute-resolver`, `ai-scorecard-weekly`, `ai-supplies-reorder` | These insert into `ai_insights`; FE just renders |
| `stripe-create-intent`, `stripe-webhook` | Bank/payouts screen |
| `payout-processor` (cron) | populates `hw_payouts` |
| `notifications-digest` (cron) | populates `hw_notifications` AI groups |

---

## 6. Storage buckets (not yet used by FE but needed for KYC + chat photos)

- `avatars` — public
- `kyc-documents` — private, owner-only
- `order-photos` — private, scoped to order parties
- `voice-recordings` — private, owner + admin

---

## 7. Screens that are STILL on mock data (intentional)

These are pure UI screens that don't yet have a clear table mapping — leaving
them on mock until you confirm. Easy to wire in a follow-up:

- `app.order.$orderId` (order detail + lifecycle) — needs `order_status_history`
  + `hw_order_items` queries
- `app.chat` + `app.message.$chatId` — needs `chats` + `messages` queries
- `app.earnings`, `app.reports`, `app.bank`, `app.reviews`, `app.customers`,
  `app.promotions`, `app.kyc`, `app.scorecard`, `app.scheduling`, `app.supplies`,
  `app.ai-pricing`, `app.ai-guard`, `app.notifications`, `app.voice-history`,
  `app.profile`, `app.settings`

Tell me when (4) is unblocked and I'll wire the rest in one pass.

---

## TL;DR for the backend agent

1. Confirm the column names in section 1 (or send me a diff).
2. Add the realtime publication line.
3. Either trigger or edge fn to grant `merchant` role on signup.
4. Verify RLS lets a merchant SELECT/UPDATE their own rows.
5. Build the edge functions in section 5 when ready.
