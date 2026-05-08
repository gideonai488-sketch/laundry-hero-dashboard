# GEO ROUTING — how merchants receive jobs (and how riders are dispatched)

This is the rule the **merchant app**, **customer app**, and **rider app**
must agree on. The merchant frontend already writes `country_code`, `city`,
and `area` on signup → onboarding. The backend agent must enforce that the
broadcast / bid / dispatch flows respect those three fields.

## Golden rule

> **A merchant must ONLY see jobs from customers in the same**
> `country_code` **+** `city` **(and ideally same `area`).**
> A rider must ONLY see handoff bids from merchants in the same
> `country_code` + `city`.

No cross-city / cross-country jobs. Ever.

## Required columns (already in SCHEMA.md — confirm they exist)

| Table | Columns | Notes |
|---|---|---|
| `profiles` | `country_code text`, `city text`, `area text` | copied from `auth.users.user_metadata` by `handle_new_user` trigger |
| `merchants` | `country_code text NOT NULL`, `city text NOT NULL`, `area text`, `lat numeric`, `lng numeric` | written by onboarding form |
| `hw_orders` | `country_code text NOT NULL`, `city text NOT NULL`, `area text`, `currency text NOT NULL`, `amount_local numeric` | every order MUST be tagged at insert time by the customer app |
| `riders` | `country_code text NOT NULL`, `city text NOT NULL`, `area text`, `lat numeric`, `lng numeric`, `is_online bool` | rider app writes location heartbeat |

Indexes:
```sql
CREATE INDEX IF NOT EXISTS hw_orders_geo_idx
  ON public.hw_orders (country_code, city, status);
CREATE INDEX IF NOT EXISTS merchants_geo_idx
  ON public.merchants (country_code, city);
CREATE INDEX IF NOT EXISTS riders_geo_idx
  ON public.riders (country_code, city, is_online);
```

## RLS — incoming jobs feed (merchant side)

The merchant app subscribes to `hw_orders` filtered by status =
`broadcast`. RLS MUST restrict the row set to the merchant's geography:

```sql
CREATE POLICY "merchants see local broadcast orders"
ON public.hw_orders FOR SELECT TO authenticated
USING (
  status = 'broadcast'
  AND EXISTS (
    SELECT 1 FROM public.merchants m
    WHERE m.user_id = auth.uid()
      AND m.country_code = hw_orders.country_code
      AND m.city         = hw_orders.city
  )
);
```

> The frontend query in `src/lib/queries.ts` already does
> `.eq('status','broadcast')` and trusts RLS to scope by city. **Do not
> remove this policy** — without it, every merchant in the world sees every
> order.

## Rider dispatch (`broadcast-rider-bids` edge function)

When a merchant flips an order to `ready_for_rider`, the function MUST:

1. Read `country_code`, `city`, `area`, `lat`, `lng` from the merchant.
2. Select riders WHERE `is_online = true` AND `country_code = merchant.country_code` AND `city = merchant.city`.
3. Order by `ST_Distance(point(lng,lat), point(rider.lng,rider.lat))` ASC, take the nearest 10.
4. Insert one `rider_bid_request` row per rider (or push-fan-out via `send-push`).
5. Never page riders in another city.

## Customer-side order insert

The customer app must populate `country_code`, `city`, `area`, and
`currency` on every `hw_orders` insert from the customer's profile. If
those are NULL, the merchant feed will silently miss the order. Add a
NOT NULL + CHECK constraint to fail loudly:

```sql
ALTER TABLE public.hw_orders
  ALTER COLUMN country_code SET NOT NULL,
  ALTER COLUMN city         SET NOT NULL,
  ALTER COLUMN currency     SET NOT NULL;
```

## Smoke test (add to TODO.md)

- [ ] Customer in Accra creates an order → merchant in Accra sees it live, merchant in Lagos does NOT.
- [ ] Merchant flips to `ready_for_rider` → only Accra riders get the bid request.
- [ ] Currency on the order matches the customer's country (GHS for Ghana, etc.).
