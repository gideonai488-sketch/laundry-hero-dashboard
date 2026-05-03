create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  endpoint    text not null,
  keys        jsonb not null,
  user_agent  text,
  created_at  timestamptz not null default now(),
  constraint push_subscriptions_merchant_endpoint_unique unique (merchant_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "merchant owns their subscriptions"
  on public.push_subscriptions
  for all
  using (
    merchant_id in (
      select id from public.merchants where owner_id = auth.uid()
    )
  );
