# SCHEMA — every table the merchant app touches

Run as migrations in this order. `IF NOT EXISTS` everywhere so re-runs
are safe.

## 0. Roles (already exists in some envs — make sure it's there)

```sql
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('customer','rider','merchant','admin','support');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "users see own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users insert own merchant role" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND role = 'merchant');
```

## 1. profiles

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  country_code text,
  city text,
  area text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "self read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "self upsert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Trigger: create profile + copy country/city/area from user_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, country_code, city, area)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
    NEW.phone,
    NEW.raw_user_meta_data->>'country_code',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'area'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 2. merchants

```sql
CREATE TABLE IF NOT EXISTS public.merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  phone text NOT NULL,
  address text,
  country_code text,
  city text,
  area text,
  lat double precision,
  lng double precision,
  online boolean DEFAULT false,
  paystack_subaccount_code text,
  bank_code text,
  bank_account_number text,
  bank_account_name text,
  rating numeric(3,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read" ON public.merchants FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "owner insert" ON public.merchants FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owner update" ON public.merchants FOR UPDATE TO authenticated USING (owner_id = auth.uid());
-- Customers + riders need to see merchant business_name + rating; allow public select of safe columns via a view if needed.
```

## 3. hw_orders, hw_order_items, hw_merchant_bids
(Already exist — keep current shape. Make sure these columns exist.)

```sql
ALTER TABLE public.hw_orders
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS area text,
  ADD COLUMN IF NOT EXISTS currency text,                 -- e.g. 'GHS','USD'
  ADD COLUMN IF NOT EXISTS amount_local numeric(12,2),    -- price in customer's local currency
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS customer_confirmed_at timestamptz;
```

RLS for `hw_orders` (merchant side):
- SELECT where `merchant_id = (SELECT id FROM merchants WHERE owner_id = auth.uid())`
  OR `merchant_id IS NULL AND status = 'broadcast'` (incoming jobs feed)
- UPDATE delivery_status, merchant-only fields where merchant_id matches.

RLS for `hw_merchant_bids`:
- SELECT/INSERT/UPDATE where `merchant_id = (SELECT id FROM merchants WHERE owner_id = auth.uid())`.

## 4. chats + messages
See BACKEND_TODO.md (legacy) for trigger SQL — keep that, plus:

```sql
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- policies as documented in BACKEND_TODO.md
```

## 5. disputes
See BACKEND_TODO.md section 3 — apply the column adds + RLS.

## 6. hw_order_status_events
See BACKEND_TODO.md section 4 — create table + trigger + RLS.

## 7. payouts (NEW — wallet/withdraw)
```sql
CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending|processing|paid|failed
  paystack_transfer_code text,
  failure_reason text,
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz
);
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant read own payouts" ON public.payouts
  FOR SELECT TO authenticated
  USING (merchant_id = (SELECT id FROM public.merchants WHERE owner_id = auth.uid()));
```

## 8. notifications (for the bell)
```sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,          -- 'incoming_job'|'bid_won'|'message'|'payout'|'dispute'
  title text NOT NULL,
  body text,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "owner update read_at" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
```

## 9. push_tokens
```sql
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,      -- 'ios'|'android'|'web'
  token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, token)
);
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "self crud" ON public.push_tokens FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
```
