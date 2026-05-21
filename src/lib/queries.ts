import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "./supabase";

const CURRENCY_SYM: Record<string, string> = {
  GHS: "₵", NGN: "₦", KES: "KSh ", ZAR: "R", USD: "$", GBP: "£", EUR: "€",
};
function fmtAmt(amount: number, currency?: string | null) {
  const sym = CURRENCY_SYM[currency ?? "GHS"] ?? (currency ? `${currency} ` : "₵");
  return `${sym}${amount.toFixed(2)}`;
}

// Lazy import push so SSR never touches browser-only APIs
const notifyLocal = (title: string, opts: { body?: string; tag?: string; url?: string }) => {
  if (typeof window === "undefined") return;
  import("./push").then(({ showLocalNotification }) => showLocalNotification(title, opts)).catch(() => {});
};

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
        .eq("status", "broadcast")
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

  // Track known order IDs so we only notify on genuinely NEW ones
  const knownIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const ch = supabase
      .channel(`merchant:incoming:${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hw_orders", filter: "status=eq.broadcast" },
        (payload: AnyRow) => {
          qc.invalidateQueries({ queryKey: ["incoming-feed"] });
          // Fire a local notification when a NEW order arrives and the tab is hidden
          if (
            payload.eventType === "INSERT" &&
            payload.new?.id &&
            !knownIds.current.has(payload.new.id) &&
            document.visibilityState === "hidden"
          ) {
            knownIds.current.add(payload.new.id as string);
            notifyLocal("New order incoming! 🧺", {
              body: payload.new.pickup_address
                ? `Pickup: ${payload.new.pickup_address}`
                : "Open the app to bid before the 90 s window closes.",
              tag: `order-${payload.new.id}`,
              url: "/app/",
            });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  // Seed knownIds once initial data loads
  useEffect(() => {
    const orders = query.data;
    if (orders) orders.forEach((o: AnyRow) => knownIds.current.add(o.id as string));
  }, [query.data]);

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
        (payload: AnyRow) => {
          qc.invalidateQueries({ queryKey: ["my-orders", merchantId] });

          // Fire payment notification when payment_status flips to "paid"
          const prev = payload.old?.payment_status;
          const next = payload.new?.payment_status;
          if (next === "paid" && prev !== "paid") {
            const order = payload.new as AnyRow;
            const amount = fmtAmt(Number(order.subtotal ?? 0), order.currency);

            // Look up customer name from cache; fall back to "Customer"
            const cached = qc.getQueryData<AnyRow[]>(["my-orders", merchantId]) ?? [];
            const cached_order = cached.find((o) => o.id === order.id);
            const customerName: string =
              (cached_order?.customer as AnyRow | null)?.full_name ?? "Customer";

            const orderId = String(order.id).slice(0, 6);

            // In-app toast (always fires — foreground or background tab)
            toast.success(`💳 Payment received — ${amount}`, {
              description: `${customerName} · Order #${orderId}\nYour bank settlement arrives within 24 hours.`,
              duration: 8000,
            });

            // OS-level push notification (fires when tab is hidden / app backgrounded)
            notifyLocal(`💳 Payment received — ${amount}`, {
              body: `${customerName} · Order #${orderId} · Bank settlement within 24 hours.`,
              tag: `payment-${order.id}`,
              url: `/app/order/${order.id}`,
            });
          }
        }
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
      const [itemsRes, profileRes, riderRes] = await Promise.all([
        supabase.from("hw_order_items").select("*").eq("order_id", orderId!),
        order.customer_id
          ? supabase.from("profiles").select("id, full_name, phone, avatar_url").eq("id", order.customer_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        order.rider_id
          ? supabase.from("profiles").select("id, full_name, phone, avatar_url").eq("id", order.rider_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);
      return {
        ...order,
        items: itemsRes.data ?? [],
        customer: profileRes.data ?? null,
        rider: riderRes.data ?? null,
      };
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
      riderId,
    }: {
      orderId: string;
      delivery_status: string;
      riderId?: string | null;
    }) => {
      const patch: AnyRow = { delivery_status, updated_at: new Date().toISOString() };
      const { error } = await supabase.from("hw_orders").update(patch).eq("id", orderId);
      if (error) throw error;

      if (delivery_status === "ready_for_rider" && riderId) {
        try {
          await supabase.functions.invoke("notify-rider", {
            body: {
              rider_id: riderId,
              title: "Order ready for pickup 🧺",
              body: "The laundry is clean and ready — please collect it.",
              data: { order_id: orderId },
            },
          });
        } catch (e) {
          console.warn("notify-rider failed:", e);
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
      amount,
      currency,
      etaMinutes,
      message,
    }: {
      orderId: string;
      amount: number;
      currency: string;
      etaMinutes: number;
      message?: string;
    }) => {
      const { error } = await supabase.functions.invoke("place-merchant-bid", {
        body: {
          order_id: orderId,
          amount,
          currency,
          eta_minutes: etaMinutes,
          message: message ?? null,
        },
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
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      const { error } = await supabase.functions.invoke("merchant-decline-order", {
        body: {
          hw_order_id: orderId,
          reason: reason ?? "Merchant withdrew bid",
        },
      });
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
            // Notify even if tab is hidden
            if (document.visibilityState === "hidden") {
              notifyLocal("🎉 You won the bid!", {
                body: `Order #${String(payload.new.order_id).slice(0, 6)} is yours. Open the app to start.`,
                tag: `bid-won-${payload.new.order_id}`,
                url: `/app/order/${payload.new.order_id}`,
              });
            }
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
    const topic = `merchant:chats:${merchantId}:${Math.random().toString(36).slice(2, 8)}`;
    const ch = supabase.channel(topic);
    ch.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "chats", filter: `merchant_id=eq.${merchantId}` },
      () => qc.invalidateQueries({ queryKey: ["my-chats", merchantId] })
    );
    ch.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      () => qc.invalidateQueries({ queryKey: ["my-chats", merchantId] })
    );
    ch.subscribe();
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

      const profileIds = [chat?.customer_id, chat?.rider_id].filter(Boolean) as string[];
      const [profilesRes, orderRes] = await Promise.all([
        profileIds.length
          ? supabase.from("profiles").select("id, full_name, phone, avatar_url").in("id", profileIds)
          : Promise.resolve({ data: [] as AnyRow[], error: null }),
        chat?.order_id
          ? supabase
              .from("hw_orders")
              .select("id, service_name, delivery_status, subtotal, pickup_address")
              .eq("id", chat.order_id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      const profileMap = new Map<string, AnyRow>(
        ((profilesRes.data ?? []) as AnyRow[]).map((p: AnyRow) => [p.id, p])
      );
      const customer = chat?.customer_id ? (profileMap.get(chat.customer_id) ?? null) : null;
      const rider = chat?.rider_id ? (profileMap.get(chat.rider_id) ?? null) : null;
      const order = orderRes.data ?? null;

      return { chat, customer, rider, order, messages: (msgsRes.data ?? []) as AnyRow[] };
    },
  });

  useEffect(() => {
    if (!chatId) return;
    const topic = `chat:${chatId}:${Math.random().toString(36).slice(2, 8)}`;
    const ch = supabase.channel(topic);
    ch.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
      () => qc.invalidateQueries({ queryKey: ["chat", chatId] })
    );
    ch.subscribe();
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
  riderId?: string | null;
}): Promise<string | null> {
  const { data: existing } = await supabase
    .from("chats")
    .select("id, rider_id")
    .eq("order_id", opts.orderId)
    .eq("merchant_id", opts.merchantId)
    .maybeSingle();
  if (existing?.id) {
    // If we now have a rider but the chat doesn't yet, patch it
    if (opts.riderId && !existing.rider_id) {
      await supabase
        .from("chats")
        .update({ rider_id: opts.riderId })
        .eq("id", existing.id);
    }
    return existing.id as string;
  }
  const { data, error } = await supabase
    .from("chats")
    .insert({
      order_id: opts.orderId,
      customer_id: opts.customerId,
      merchant_id: opts.merchantId,
      ...(opts.riderId ? { rider_id: opts.riderId } : {}),
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

// ───────────────────────── Payouts ─────────────────────────

export function usePayouts(merchantId: string | undefined) {
  return useQuery({
    queryKey: ["payouts", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payouts")
        .select("id, merchant_id, amount, currency, status, created_at")
        .eq("merchant_id", merchantId!)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) {
        // Table may not be live yet — return empty list rather than crash
        console.warn("payouts query failed:", error.message);
        return [] as AnyRow[];
      }
      return (data ?? []) as AnyRow[];
    },
  });
}

export function useRequestPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      merchantId,
      amount,
      currency,
    }: {
      merchantId: string;
      amount: number;
      currency: string;
    }) => {
      const { error } = await supabase.functions.invoke("request-payout", {
        body: { merchant_id: merchantId, amount, currency },
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["payouts", vars.merchantId] });
    },
  });
}

// ───────────────────────── Disputes ─────────────────────────

export function useOrderDispute(orderId: string | undefined) {
  return useQuery({
    queryKey: ["dispute", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select("id, order_id, reason, status, category, raised_by_role, created_at, resolved_at, resolution")
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
    mutationFn: async ({
      orderId,
      reason,
      category,
      raisedBy,
    }: {
      orderId: string;
      reason: string;
      category?: string;
      raisedBy?: string;
    }) => {
      const { error } = await supabase.from("disputes").insert({
        order_id: orderId,
        reason,
        status: "open",
        raised_by_role: "merchant",
        ...(raisedBy ? { raised_by: raisedBy } : {}),
        ...(category ? { category } : {}),
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["dispute", vars.orderId] });
    },
  });
}

export function useOrderStatusEvents(orderId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["status-events", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hw_order_status_events")
        .select("id, status, changed_by_role, note, created_at")
        .eq("order_id", orderId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AnyRow[];
    },
  });

  useEffect(() => {
    if (!orderId) return;
    const ch = supabase
      .channel(`status-events:${orderId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hw_order_status_events", filter: `order_id=eq.${orderId}` },
        () => qc.invalidateQueries({ queryKey: ["status-events", orderId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [orderId, qc]);

  return query;
}
