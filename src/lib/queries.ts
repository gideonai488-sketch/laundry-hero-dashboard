import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

/**
 * Live data hooks for the Highest Wash MERCHANT app — bid-marketplace model.
 *
 * Backend tables (shared with customer + rider apps):
 *   - merchants(id, owner_id, business_name, phone, address, lat, lng,
 *               online, paystack_subaccount_code, country_code, ...)
 *   - hw_orders(id, customer_id, merchant_id, rider_id, status,
 *               payment_status, merchant_status, delivery_status,
 *               pickup_address, delivery_address, pickup_lat, pickup_lng,
 *               pickup_date, pickup_time_slot, estimated_weight_kg,
 *               photo_urls, notes, subtotal, delivery_fee, total,
 *               customer_amount, currency, customer_currency, fx_rate,
 *               service_name, created_at, updated_at, delivered_at,
 *               customer_confirmed_at, cancelled_reason)
 *   - hw_order_items(id, order_id, qty, description, weight_kg)
 *   - hw_merchant_bids(id, order_id, merchant_id, amount, status,
 *                      message, created_at, expires_at)
 *   - profiles(id, full_name, phone, avatar_url)
 */

// All Supabase responses are typed loosely — the shared backend owns the
// generated types and this client is intentionally untyped.
type AnyRow = Record<string, any>;

// ───────────────────────── Merchant mutations ─────────────────────────

export function useToggleOnline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ merchantId, online }: { merchantId: string; online: boolean }) => {
      const { error } = await supabase
        .from("merchants")
        .update({ online })
        .eq("id", merchantId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auth-merchant"] }),
  });
}

export function useUpdateMerchant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ merchantId, patch }: { merchantId: string; patch: AnyRow }) => {
      const { error } = await supabase
        .from("merchants")
        .update(patch)
        .eq("id", merchantId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auth-merchant"] }),
  });
}

// ───────────────────────── Incoming broadcast feed ─────────────────────────

/**
 * Live feed of orders broadcast to the merchant pool:
 *   merchant_status = 'pending' AND merchant_id IS NULL.
 *
 * We also fetch a quick snapshot of the customer profile (best-effort) and
 * the order_items so the card can show services + estimated weight.
 */
export function useIncomingFeed(myMerchantId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["incoming-feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hw_orders")
        .select("*")
        .eq("merchant_status", "pending")
        .is("merchant_id", null)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const orders = (data ?? []) as AnyRow[];
      if (orders.length === 0) return [];

      // Fetch items + customer names in parallel
      const ids = orders.map((o) => o.id);
      const customerIds = Array.from(new Set(orders.map((o) => o.customer_id).filter(Boolean)));
      const [itemsRes, profilesRes, myBidsRes] = await Promise.all([
        supabase.from("hw_order_items").select("*").in("order_id", ids),
        customerIds.length
          ? supabase.from("profiles").select("id, full_name").in("id", customerIds)
          : Promise.resolve({ data: [] as AnyRow[], error: null }),
        myMerchantId
          ? supabase
              .from("hw_merchant_bids")
              .select("order_id, status, amount")
              .eq("merchant_id", myMerchantId)
              .in("order_id", ids)
          : Promise.resolve({ data: [] as AnyRow[], error: null }),
      ]);
      const itemsByOrder = new Map<string, AnyRow[]>();
      (itemsRes.data ?? []).forEach((it: AnyRow) => {
        const arr = itemsByOrder.get(it.order_id) ?? [];
        arr.push(it);
        itemsByOrder.set(it.order_id, arr);
      });
      const profileMap = new Map<string, AnyRow>(
        (profilesRes.data ?? []).map((p: AnyRow) => [p.id, p])
      );
      const myBidByOrder = new Map<string, AnyRow>(
        (myBidsRes.data ?? []).map((b: AnyRow) => [b.order_id, b])
      );

      return orders.map((o) => ({
        ...o,
        items: itemsByOrder.get(o.id) ?? [],
        customer: profileMap.get(o.customer_id) ?? null,
        my_bid: myBidByOrder.get(o.id) ?? null,
      }));
    },
  });

  // Realtime: any change to broadcast pool re-fetches.
  useEffect(() => {
    const ch = supabase
      .channel("merchant:incoming")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hw_orders", filter: "merchant_status=eq.pending" },
        () => qc.invalidateQueries({ queryKey: ["incoming-feed"] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return query;
}

// ───────────────────────── My orders ─────────────────────────

export function useMyOrders(merchantId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["my-orders", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hw_orders")
        .select("*")
        .eq("merchant_id", merchantId!)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const orders = (data ?? []) as AnyRow[];
      const customerIds = Array.from(new Set(orders.map((o) => o.customer_id).filter(Boolean)));
      const profilesRes = customerIds.length
        ? await supabase.from("profiles").select("id, full_name, phone").in("id", customerIds)
        : { data: [] as AnyRow[], error: null };
      const profileMap = new Map<string, AnyRow>(
        (profilesRes.data ?? []).map((p: AnyRow) => [p.id, p])
      );
      return orders.map((o) => ({ ...o, customer: profileMap.get(o.customer_id) ?? null }));
    },
  });

  useEffect(() => {
    if (!merchantId) return;
    const ch = supabase
      .channel(`merchant:mine:${merchantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hw_orders", filter: `merchant_id=eq.${merchantId}` },
        () => qc.invalidateQueries({ queryKey: ["my-orders", merchantId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [merchantId, qc]);

  return query;
}

export function useOrder(orderId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["order", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data: order, error } = await supabase
        .from("hw_orders")
        .select("*")
        .eq("id", orderId!)
        .maybeSingle();
      if (error) throw error;
      if (!order) return null;
      const [itemsRes, profileRes] = await Promise.all([
        supabase.from("hw_order_items").select("*").eq("order_id", orderId!),
        order.customer_id
          ? supabase.from("profiles").select("id, full_name, phone").eq("id", order.customer_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);
      return { ...order, items: itemsRes.data ?? [], customer: profileRes.data ?? null };
    },
  });

  useEffect(() => {
    if (!orderId) return;
    const ch = supabase
      .channel(`order:${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hw_orders", filter: `id=eq.${orderId}` },
        () => qc.invalidateQueries({ queryKey: ["order", orderId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [orderId, qc]);

  return query;
}

export function useUpdateDeliveryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      delivery_status,
    }: {
      orderId: string;
      delivery_status: string;
    }) => {
      const patch: AnyRow = { delivery_status, updated_at: new Date().toISOString() };
      const { error } = await supabase.from("hw_orders").update(patch).eq("id", orderId);
      if (error) throw error;

      // Optional: when merchant marks ready_for_rider, ping the broadcast fn.
      if (delivery_status === "ready_for_rider") {
        try {
          await supabase.functions.invoke("broadcast-rider-bids", { body: { order_id: orderId } });
        } catch (e) {
          // The edge function may not be deployed yet — surfaced in BACKEND_TODO.
          console.warn("broadcast-rider-bids not available:", e);
        }
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["order", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
}

// ───────────────────────── Bids ─────────────────────────

export function useSubmitBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      merchantId,
      amount,
      message,
    }: {
      orderId: string;
      merchantId: string;
      amount: number;
      message?: string;
    }) => {
      const expires = new Date(Date.now() + 5 * 60_000).toISOString();
      const { error } = await supabase.from("hw_merchant_bids").insert({
        order_id: orderId,
        merchant_id: merchantId,
        amount,
        message: message ?? null,
        status: "pending",
        expires_at: expires,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incoming-feed"] });
      qc.invalidateQueries({ queryKey: ["my-bids"] });
    },
  });
}

export function useWithdrawBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bidId }: { bidId: string }) => {
      const { error } = await supabase
        .from("hw_merchant_bids")
        .update({ status: "withdrawn" })
        .eq("id", bidId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incoming-feed"] });
      qc.invalidateQueries({ queryKey: ["my-bids"] });
    },
  });
}

/**
 * Watches *my* bids for accept/reject so the dashboard can toast on a win.
 * Use in a top-level provider so it's always running.
 */
export function useMyBidsWatcher(merchantId: string | undefined, onAccepted: (orderId: string) => void) {
  useEffect(() => {
    if (!merchantId) return;
    const ch = supabase
      .channel(`merchant:bids:${merchantId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "hw_merchant_bids",
          filter: `merchant_id=eq.${merchantId}`,
        },
        (payload: AnyRow) => {
          if (payload.new?.status === "accepted") {
            onAccepted(payload.new.order_id as string);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [merchantId, onAccepted]);
}
