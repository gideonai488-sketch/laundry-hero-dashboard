# Realtime publication

The merchant app subscribes to `postgres_changes` on these tables. Without
both steps the dashboard never updates.

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE
  public.hw_orders,
  public.hw_merchant_bids,
  public.chats,
  public.messages,
  public.merchants,
  public.notifications,
  public.hw_order_status_events;

ALTER TABLE public.hw_orders             REPLICA IDENTITY FULL;
ALTER TABLE public.hw_merchant_bids      REPLICA IDENTITY FULL;
ALTER TABLE public.chats                 REPLICA IDENTITY FULL;
ALTER TABLE public.messages              REPLICA IDENTITY FULL;
ALTER TABLE public.merchants             REPLICA IDENTITY FULL;
ALTER TABLE public.notifications         REPLICA IDENTITY FULL;
ALTER TABLE public.hw_order_status_events REPLICA IDENTITY FULL;
```

Smoke test: insert a row into `hw_orders` with `status='broadcast'`, watch
the merchant dashboard show it within ~1s.
