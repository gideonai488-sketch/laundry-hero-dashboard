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

// ───────────────────────── Chats & messages ─────────────────────────

/**
 * Live list of chats for this merchant (one per order with a customer).
 * Joins customer profile + order summary for the list view.
 */
export function useMyChats(merchantId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["my-chats", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("id, order_id, customer_id, merchant_id, rider_id, last_message_at")
        .eq("merchant_id", merchantId!)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(100);
      if (error) throw error;
      const chats = (data ?? []) as AnyRow[];
      if (!chats.length) return [];

      const customerIds = Array.from(new Set(chats.map((c) => c.customer_id).filter(Boolean)));
      const orderIds = Array.from(new Set(chats.map((c) => c.order_id).filter(Boolean)));
      const chatIds = chats.map((c) => c.id);

      const [profilesRes, ordersRes, lastMsgsRes] = await Promise.all([
        customerIds.length
          ? supabase.from("profiles").select("id, full_name, phone, avatar_url").in("id", customerIds)
          : Promise.resolve({ data: [] as AnyRow[], error: null }),
        orderIds.length
          ? supabase.from("hw_orders").select("id, service_name, delivery_status, subtotal").in("id", orderIds)
          : Promise.resolve({ data: [] as AnyRow[], error: null }),
        chatIds.length
          ? supabase
              .from("messages")
              .select("chat_id, body, sender_id, sent_at, read_at")
              .in("chat_id", chatIds)
              .order("sent_at", { ascending: false })
              .limit(500)
          : Promise.resolve({ data: [] as AnyRow[], error: null }),
      ]);

      const profileMap = new Map<string, AnyRow>((profilesRes.data ?? []).map((p: AnyRow) => [p.id, p]));
      const orderMap = new Map<string, AnyRow>((ordersRes.data ?? []).map((o: AnyRow) => [o.id, o]));
      const lastByChat = new Map<string, AnyRow>();
      const unreadByChat = new Map<string, number>();
      (lastMsgsRes.data ?? []).forEach((m: AnyRow) => {
        if (!lastByChat.has(m.chat_id)) lastByChat.set(m.chat_id, m);
        if (!m.read_at && m.sender_id !== merchantId) {
          unreadByChat.set(m.chat_id, (unreadByChat.get(m.chat_id) ?? 0) + 1);
        }
      });

      return chats.map((c) => ({
        ...c,
        customer: profileMap.get(c.customer_id) ?? null,
        order: orderMap.get(c.order_id) ?? null,
        last_message: lastByChat.get(c.id) ?? null,
        unread_count: unreadByChat.get(c.id) ?? 0,
      }));
    },
  });

  useEffect(() => {
    if (!merchantId) return;
    const ch = supabase
      .channel(`merchant:chats:${merchantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chats", filter: `merchant_id=eq.${merchantId}` },
        () => qc.invalidateQueries({ queryKey: ["my-chats", merchantId] })
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => qc.invalidateQueries({ queryKey: ["my-chats", merchantId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [merchantId, qc]);

  return query;
}

export function useChatThread(chatId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["chat", chatId],
    enabled: !!chatId,
    queryFn: async () => {
      const [chatRes, msgsRes] = await Promise.all([
        supabase
          .from("chats")
          .select("id, order_id, customer_id, merchant_id, rider_id")
          .eq("id", chatId!)
          .maybeSingle(),
        supabase
          .from("messages")
          .select("id, chat_id, sender_id, body, sent_at, read_at")
          .eq("chat_id", chatId!)
          .order("sent_at", { ascending: true })
          .limit(500),
      ]);
      if (chatRes.error) throw chatRes.error;
      if (msgsRes.error) throw msgsRes.error;
      const chat = chatRes.data as AnyRow | null;
      let customer: AnyRow | null = null;
      let order: AnyRow | null = null;
      if (chat?.customer_id) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, phone, avatar_url")
          .eq("id", chat.customer_id)
          .maybeSingle();
        customer = data;
      }
      if (chat?.order_id) {
        const { data } = await supabase
          .from("hw_orders")
          .select("id, service_name, delivery_status, subtotal, pickup_address")
          .eq("id", chat.order_id)
          .maybeSingle();
        order = data;
      }
      return { chat, customer, order, messages: (msgsRes.data ?? []) as AnyRow[] };
    },
  });

  useEffect(() => {
    if (!chatId) return;
    const ch = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        () => qc.invalidateQueries({ queryKey: ["chat", chatId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [chatId, qc]);

  return query;
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      chatId,
      senderId,
      body,
    }: {
      chatId: string;
      senderId: string;
      body: string;
    }) => {
      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        sender_id: senderId,
        body,
        sent_at: new Date().toISOString(),
      });
      if (error) throw error;
      // Best-effort touch of last_message_at (RLS may block — backend trigger is the safety net)
      await supabase
        .from("chats")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", chatId);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["chat", vars.chatId] });
      qc.invalidateQueries({ queryKey: ["my-chats"] });
    },
  });
}

export function useMarkChatRead() {
  return useMutation({
    mutationFn: async ({ chatId, merchantId }: { chatId: string; merchantId: string }) => {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("chat_id", chatId)
        .neq("sender_id", merchantId)
        .is("read_at", null);
    },
  });
}

/**
 * Ensure a chat row exists for an (order, customer, merchant) tuple.
 * Used right after a bid is accepted so the merchant can immediately ping
 * the customer. Returns the chat id.
 */
export async function ensureChat(opts: {
  orderId: string;
  customerId: string;
  merchantId: string;
}): Promise<string | null> {
  const { data: existing } = await supabase
    .from("chats")
    .select("id")
    .eq("order_id", opts.orderId)
    .eq("merchant_id", opts.merchantId)
    .maybeSingle();
  if (existing?.id) return existing.id as string;
  const { data, error } = await supabase
    .from("chats")
    .insert({
      order_id: opts.orderId,
      customer_id: opts.customerId,
      merchant_id: opts.merchantId,
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .maybeSingle();
  if (error) {
    console.warn("ensureChat failed:", error);
    return null;
  }
  return (data?.id as string) ?? null;
}

// ───────────────────────── Disputes ─────────────────────────

export function useOrderDispute(orderId: string | undefined) {
  return useQuery({
    queryKey: ["dispute", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select("id, order_id, reason, status, created_at, resolved_at")
        .eq("order_id", orderId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSubmitDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const { error } = await supabase.from("disputes").insert({
        order_id: orderId,
        reason,
        status: "open",
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["dispute", vars.orderId] });
    },
  });
}
