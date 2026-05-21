# Highest Wash — Merchant App backend asks

The Merchant frontend now ships with a chat module, an order job-history
timeline, and an in-app dispute submission flow. Most of it works against
the existing tables, but a few additions are needed to make it bulletproof.

## ✅ Already shipped (no backend change needed)
- Bid marketplace (`hw_orders`, `hw_merchant_bids`, `hw_order_items`).
- Wallet with today/yesterday/this-week/this-month + bank linkage card.

## ⚠️ Architecture note — customer app chat vs chats table
The **customer app** queries `messages` directly via `order_id` — it does **not**
go through the `chats` table at all. The merchant app uses `chats` (chat_id-based).

Current RLS on `messages` covers both patterns (order_id-based SELECT and
chat_id-based INSERT/UPDATE), so both apps work.

**If the backend ever tightens `messages` RLS to require `chat_id`-based checks
only**, the customer app's chat screen will break silently. At that point:
1. Notify the merchant-app team — no merchant-side change needed (we already use chat_id).
2. The customer app must be updated to query `chats` first, then `messages` via `chat_id`.

## 🆕 Needed for the new features

### 1. Chats + messages RLS
Tables `chats` and `messages` already exist:
- `chats(id, order_id, customer_id, merchant_id, rider_id, last_message_at)`
- `messages(id, chat_id, sender_id, body, sent_at, read_at)`

A merchant must be able to:
- SELECT/INSERT/UPDATE on `chats` where `merchant_id = me.id`
- SELECT on `messages` where `chat_id` belongs to a chat with
  `merchant_id = me.id`
- INSERT on `messages` where `sender_id = auth.uid()` AND the chat's
  `merchant_id = me.id`
- UPDATE on `messages.read_at` for messages in their chats where
  `sender_id != auth.uid()`

### 2. Auto-create chat when a bid is accepted
Right now the merchant frontend tries to `INSERT` a chat row after a bid is
won. Replace that with a backend trigger:

```sql
CREATE OR REPLACE FUNCTION public.create_chat_on_bid_accept()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_customer uuid;
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    SELECT customer_id INTO v_customer FROM public.hw_orders WHERE id = NEW.order_id;
    INSERT INTO public.chats (order_id, customer_id, merchant_id, last_message_at)
    VALUES (NEW.order_id, v_customer, NEW.merchant_id, now())
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_create_chat_on_bid_accept
AFTER UPDATE ON public.hw_merchant_bids
FOR EACH ROW EXECUTE FUNCTION public.create_chat_on_bid_accept();
```

Also auto-bump `chats.last_message_at` on every new message:

```sql
CREATE OR REPLACE FUNCTION public.touch_chat_last_message()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.chats SET last_message_at = NEW.sent_at WHERE id = NEW.chat_id;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_touch_chat_last_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.touch_chat_last_message();
```

Enable Realtime on `chats` and `messages` (the merchant app subscribes to both).

### 3. `disputes` columns + RLS
The `disputes` table currently has only:
`id, order_id, reason, status, created_at, resolved_at`.

Please add:
```sql
ALTER TABLE public.disputes
  ADD COLUMN IF NOT EXISTS raised_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS raised_by_role text,        -- 'merchant' | 'customer' | 'rider'
  ADD COLUMN IF NOT EXISTS category text,              -- e.g. 'wrong_items','damage','no_show','payment'
  ADD COLUMN IF NOT EXISTS evidence_urls text[],
  ADD COLUMN IF NOT EXISTS resolution text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
```

A merchant must be able to:
- INSERT a dispute on any order where `merchant_id = me.id` (set
  `raised_by = auth.uid()`, `raised_by_role = 'merchant'`)
- SELECT disputes on those orders

### 4. NEW table: `hw_order_status_events` (job-history timeline)
The order detail screen shows a job-history timeline. Right now it can only
plot `created_at`, `updated_at`, `delivered_at`, `customer_confirmed_at`
because per-stage timestamps aren't recorded. Please create:

```sql
CREATE TABLE IF NOT EXISTS public.hw_order_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.hw_orders(id) ON DELETE CASCADE,
  status text NOT NULL,           -- mirrors hw_orders.delivery_status
  changed_by uuid REFERENCES auth.users(id),
  changed_by_role text,           -- 'merchant' | 'rider' | 'customer' | 'system'
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_status_events_order ON public.hw_order_status_events(order_id, created_at);

-- Trigger: auto-record every change of hw_orders.delivery_status
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.delivery_status IS DISTINCT FROM OLD.delivery_status THEN
    INSERT INTO public.hw_order_status_events(order_id, status, changed_by, changed_by_role)
    VALUES (NEW.id, NEW.delivery_status, auth.uid(), 'system');
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_log_order_status_change
AFTER UPDATE OF delivery_status ON public.hw_orders
FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();
```

RLS: merchant can SELECT events where the parent order's `merchant_id = me.id`.

Once this is live, the merchant timeline will start showing every stage
transition with a real timestamp.

## 5. Realtime
Please make sure Realtime publishes `hw_orders`, `hw_merchant_bids`,
`chats`, `messages`, and (once added) `hw_order_status_events`.

## 6. Edge functions (unchanged from previous prompt)
| When | Function | Body |
|---|---|---|
| Merchant marks `ready_for_rider` | `broadcast-rider-bids` | `{ order_id }` |
| Onboarding / Settings → bank setup | `register-merchant-subaccount` | `{ merchant_id, bank_code, account_number }` |

## 🔔 Realtime publication (URGENT — incoming jobs not appearing)

Frontend `useIncomingFeed`, `useMyOrders`, `useChatThread`, `useMyChats`,
and `useMyBidsWatcher` all subscribe to `postgres_changes`. They fire but
receive no events because the tables aren't on the realtime publication.

Run once:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE
  public.hw_orders,
  public.hw_merchant_bids,
  public.chats,
  public.messages,
  public.merchants;

ALTER TABLE public.hw_orders REPLICA IDENTITY FULL;
ALTER TABLE public.hw_merchant_bids REPLICA IDENTITY FULL;
ALTER TABLE public.chats REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.merchants REPLICA IDENTITY FULL;
```

Without this, the merchant dashboard never sees new broadcast orders in
real-time and the bell-icon notifications counter stays at 0.
