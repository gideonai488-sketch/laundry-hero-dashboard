import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { MerchantRow } from "./auth";

/**
 * Live data hooks for the Highest Wash Merchant app.
 *
 * Every shape below matches the actual database schema in the shared Supabase
 * project (`eqbogpvabcsngspphjte`) — verified by introspection. Do not rename
 * fields without coordinating with the customer/rider apps.
 */

// ───────────────────────── Orders ─────────────────────────

export type LiveOrderStatus =
  | "pending"
  | "ai_dispatching"
  | "accepted"
  | "pickup"
  | "washing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface LiveOrder {
  id: string;
  merchant_id: string;
  customer_id: string;
  rider_id: string | null;
  items: unknown | null;
  amount_usd: number | null;
  status: LiveOrderStatus;
  pickup_address: string | null;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  // Joined / derived
  customer?: { id: string; full_name: string | null; phone: string | null } | null;
}

export function useOrders(merchantId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["hw_orders", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hw_orders")
        .select("*, customer:customers!hw_orders_customer_id_fkey(id, full_name, phone)")
        .eq("merchant_id", merchantId!)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) {
        // Fallback if the FK alias above isn't named that — fetch flat.
        const { data: flat, error: e2 } = await supabase
          .from("hw_orders")
          .select("*")
          .eq("merchant_id", merchantId!)
          .order("created_at", { ascending: false })
          .limit(100);
        if (e2) throw e2;
        return (flat ?? []) as LiveOrder[];
      }
      return (data ?? []) as LiveOrder[];
    },
  });

  useEffect(() => {
    if (!merchantId) return;
    const ch = supabase
      .channel(`merchant:${merchantId}:orders`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hw_orders", filter: `merchant_id=eq.${merchantId}` },
        () => qc.invalidateQueries({ queryKey: ["hw_orders", merchantId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [merchantId, qc]);

  return query;
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["hw_orders", "one", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hw_orders")
        .select("*")
        .eq("id", orderId!)
        .maybeSingle();
      if (error) throw error;
      return data as LiveOrder | null;
    },
  });
}

export function useUpdateOrderStatus(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LiveOrderStatus }) => {
      const { error } = await supabase.from("hw_orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hw_orders", merchantId] });
      qc.invalidateQueries({ queryKey: ["hw_orders", "one"] });
    },
  });
}

// ───────────────────────── Dispatch offers ─────────────────────────

export interface DispatchOffer {
  id: string;
  order_id: string;
  recipient_id: string;
  recipient_type: "merchant" | "rider";
  expires_at: string;
  decision: "pending" | "accepted" | "declined" | "expired";
  decided_at: string | null;
  ai_confidence: number | null;
  ai_reason: string | null;
  trust_summary: string | null;
  created_at: string;
}

export function useDispatchOffers(merchantId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["dispatch_offers", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dispatch_offers")
        .select("*")
        .eq("recipient_id", merchantId!)
        .eq("recipient_type", "merchant")
        .eq("decision", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DispatchOffer[];
    },
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!merchantId) return;
    const ch = supabase
      .channel(`merchant:${merchantId}:dispatch`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dispatch_offers", filter: `recipient_id=eq.${merchantId}` },
        () => qc.invalidateQueries({ queryKey: ["dispatch_offers", merchantId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [merchantId, qc]);

  return query;
}

export function useRespondOffer(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: "accepted" | "declined" }) => {
      const { error } = await supabase
        .from("dispatch_offers")
        .update({ decision, decided_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dispatch_offers", merchantId] }),
  });
}

// ───────────────────────── Services ─────────────────────────

export interface LiveService {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  base_price_usd: number;
  unit: string | null;
  turnaround_hours: number | null;
  active: boolean | null;
  ai_pricing_enabled: boolean | null;
}

export function useServices(merchantId: string | undefined) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["services", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("merchant_id", merchantId!)
        .order("name");
      if (error) throw error;
      return (data ?? []) as LiveService[];
    },
  });
  useEffect(() => {
    if (!merchantId) return;
    const ch = supabase
      .channel(`merchant:${merchantId}:services`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services", filter: `merchant_id=eq.${merchantId}` },
        () => qc.invalidateQueries({ queryKey: ["services", merchantId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [merchantId, qc]);
  return q;
}

export function useUpsertService(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (svc: Partial<LiveService> & { merchant_id: string; name: string; base_price_usd: number }) => {
      if (svc.id) {
        const { error } = await supabase.from("services").update(svc).eq("id", svc.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert(svc);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services", merchantId] }),
  });
}

export function useDeleteService(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services", merchantId] }),
  });
}

// ───────────────────────── Staff ─────────────────────────

export interface LiveStaff {
  id: string;
  merchant_id: string;
  user_id: string | null;
  name: string;
  role: string | null;
  phone: string | null;
  active: boolean | null;
}

export function useStaff(merchantId: string | undefined) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["staff", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("merchant_id", merchantId!)
        .order("name");
      if (error) throw error;
      return (data ?? []) as LiveStaff[];
    },
  });
  useEffect(() => {
    if (!merchantId) return;
    const ch = supabase
      .channel(`merchant:${merchantId}:staff`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "staff", filter: `merchant_id=eq.${merchantId}` },
        () => qc.invalidateQueries({ queryKey: ["staff", merchantId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [merchantId, qc]);
  return q;
}

export function useUpsertStaff(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: Partial<LiveStaff> & { merchant_id: string; name: string }) => {
      if (s.id) {
        const { error } = await supabase.from("staff").update(s).eq("id", s.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("staff").insert(s);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff", merchantId] }),
  });
}

export function useDeleteStaff(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("staff").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff", merchantId] }),
  });
}

// ───────────────────────── Inventory ─────────────────────────

export interface LiveInventoryItem {
  id: string;
  merchant_id: string;
  name: string;
  sku: string | null;
  unit: string | null;
  current_qty: number | null;
  reorder_threshold: number | null;
  preferred_supplier: string | null;
  auto_reorder: boolean | null;
  last_reordered_at: string | null;
}

export function useInventory(merchantId: string | undefined) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["inventory_items", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("merchant_id", merchantId!)
        .order("name");
      if (error) throw error;
      return (data ?? []) as LiveInventoryItem[];
    },
  });
  useEffect(() => {
    if (!merchantId) return;
    const ch = supabase
      .channel(`merchant:${merchantId}:inv`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory_items", filter: `merchant_id=eq.${merchantId}` },
        () => qc.invalidateQueries({ queryKey: ["inventory_items", merchantId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [merchantId, qc]);
  return q;
}

export function useUpsertInventory(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (i: Partial<LiveInventoryItem> & { merchant_id: string; name: string }) => {
      if (i.id) {
        const { error } = await supabase.from("inventory_items").update(i).eq("id", i.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("inventory_items").insert(i);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory_items", merchantId] }),
  });
}

export function useDeleteInventory(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory_items", merchantId] }),
  });
}

// ───────────────────────── AI Insights ─────────────────────────

export interface LiveAIInsight {
  id: string;
  merchant_id: string;
  kind: "pricing" | "demand" | "anomaly" | "dispute" | "reorder" | "schedule" | string;
  title: string;
  body: string;
  status: "open" | "accepted" | "dismissed";
  severity: string | null;
  created_at: string;
}

export function useAIInsights(merchantId: string | undefined, limit = 20) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["ai_insights", merchantId, limit],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("merchant_id", merchantId!)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as LiveAIInsight[];
    },
  });
  useEffect(() => {
    if (!merchantId) return;
    const ch = supabase
      .channel(`merchant:${merchantId}:insights`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ai_insights", filter: `merchant_id=eq.${merchantId}` },
        () => qc.invalidateQueries({ queryKey: ["ai_insights", merchantId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [merchantId, qc]);
  return q;
}

export function useUpdateInsight(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "dismissed" }) => {
      const { error } = await supabase.from("ai_insights").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai_insights", merchantId] }),
  });
}

// ───────────────────────── Payouts ─────────────────────────

export interface LivePayout {
  id: string;
  owner_id: string;
  account_id: string | null;
  amount_usd: number;
  amount_local: number | null;
  status: "pending" | "processing" | "paid" | "failed";
  reference: string | null;
  paid_at: string | null;
}

export function usePayouts(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["hw_payouts", ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hw_payouts")
        .select("*")
        .eq("owner_id", ownerId!)
        .order("paid_at", { ascending: false, nullsFirst: true })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as LivePayout[];
    },
  });
}

// ───────────────────────── Payout accounts ─────────────────────────

export interface LivePayoutAccount {
  id: string;
  owner_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export function usePayoutAccounts(ownerId: string | undefined) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["payout_accounts", ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payout_accounts")
        .select("*")
        .eq("owner_id", ownerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LivePayoutAccount[];
    },
  });
  return q;
  void qc; // reserved for future realtime
}

export function useAddPayoutAccount(ownerId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (details: Record<string, unknown>) => {
      const { error } = await supabase.from("payout_accounts").insert({ owner_id: ownerId, details });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payout_accounts", ownerId] }),
  });
}

export function useDeletePayoutAccount(ownerId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payout_accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payout_accounts", ownerId] }),
  });
}

// ───────────────────────── Notifications ─────────────────────────

export interface LiveNotification {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

export function useNotifications(userId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["hw_notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hw_notifications")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as LiveNotification[];
    },
  });

  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel(`user:${userId}:notifications`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hw_notifications", filter: `user_id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey: ["hw_notifications", userId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [userId, qc]);

  return query;
}

export function useMarkNotificationRead(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("hw_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw_notifications", userId] }),
  });
}

export function useMarkAllNotificationsRead(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await supabase
        .from("hw_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw_notifications", userId] }),
  });
}

// ───────────────────────── Update merchant (online toggle) ─────────────────────────

export function useUpdateMerchant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<MerchantRow> }) => {
      const { error } = await supabase.from("merchants").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

// ───────────────────────── Chats & messages ─────────────────────────

export interface LiveChat {
  id: string;
  merchant_id: string | null;
  customer_id: string | null;
  rider_id: string | null;
  order_id: string | null;
  last_message_at: string | null;
  // Joined
  customer?: { id: string; full_name: string | null; phone: string | null } | null;
  last_message?: { body: string | null; sent_at: string | null; sender_type: string | null } | null;
}

export function useChats(merchantId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["chats", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("merchant_id", merchantId!)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(100);
      if (error) throw error;
      const rows = (data ?? []) as LiveChat[];

      // Best-effort hydrate customer + last message client-side
      const customerIds = Array.from(new Set(rows.map((r) => r.customer_id).filter(Boolean))) as string[];
      const chatIds = rows.map((r) => r.id);

      const [custRes, msgRes] = await Promise.all([
        customerIds.length
          ? supabase.from("customers").select("id, full_name, phone").in("id", customerIds)
          : Promise.resolve({ data: [], error: null } as const),
        chatIds.length
          ? supabase
              .from("messages")
              .select("chat_id, body, sent_at, sender_type")
              .in("chat_id", chatIds)
              .order("sent_at", { ascending: false })
          : Promise.resolve({ data: [], error: null } as const),
      ]);

      const customerMap = new Map((custRes.data ?? []).map((c: { id: string; full_name: string | null; phone: string | null }) => [c.id, c]));
      const lastByChat = new Map<string, { body: string | null; sent_at: string | null; sender_type: string | null }>();
      for (const m of (msgRes.data ?? []) as Array<{ chat_id: string; body: string | null; sent_at: string | null; sender_type: string | null }>) {
        if (!lastByChat.has(m.chat_id)) lastByChat.set(m.chat_id, { body: m.body, sent_at: m.sent_at, sender_type: m.sender_type });
      }

      return rows.map((r) => ({
        ...r,
        customer: r.customer_id ? customerMap.get(r.customer_id) ?? null : null,
        last_message: lastByChat.get(r.id) ?? null,
      }));
    },
  });

  useEffect(() => {
    if (!merchantId) return;
    const ch = supabase
      .channel(`merchant:${merchantId}:chats`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chats", filter: `merchant_id=eq.${merchantId}` },
        () => qc.invalidateQueries({ queryKey: ["chats", merchantId] })
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => qc.invalidateQueries({ queryKey: ["chats", merchantId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [merchantId, qc]);

  return query;
}

export interface LiveMessage {
  id: string;
  chat_id: string;
  sender_id: string | null;
  sender_type: "merchant" | "customer" | "rider" | "ai" | string | null;
  body: string | null;
  sent_at: string | null;
}

export function useMessages(chatId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["messages", chatId],
    enabled: !!chatId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId!)
        .order("sent_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as LiveMessage[];
    },
  });

  useEffect(() => {
    if (!chatId) return;
    const ch = supabase
      .channel(`chat:${chatId}:messages`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        () => qc.invalidateQueries({ queryKey: ["messages", chatId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [chatId, qc]);

  return query;
}

export function useChat(chatId: string | undefined) {
  return useQuery({
    queryKey: ["chats", "one", chatId],
    enabled: !!chatId,
    queryFn: async () => {
      const { data, error } = await supabase.from("chats").select("*").eq("id", chatId!).maybeSingle();
      if (error) throw error;
      const chat = data as LiveChat | null;
      if (!chat?.customer_id) return chat;
      const { data: cust } = await supabase
        .from("customers")
        .select("id, full_name, phone")
        .eq("id", chat.customer_id)
        .maybeSingle();
      return { ...chat, customer: cust ?? null };
    },
  });
}

export function useSendMessage(chatId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, senderId }: { body: string; senderId: string }) => {
      if (!chatId) throw new Error("No chat");
      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        sender_id: senderId,
        sender_type: "merchant",
        body,
        sent_at: new Date().toISOString(),
      });
      if (error) throw error;
      // Touch the chat's last_message_at
      await supabase
        .from("chats")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", chatId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", chatId] }),
  });
}

// ───────────────────────── Promotions ─────────────────────────

export interface LivePromotion {
  id: string;
  merchant_id: string;
  code: string | null;
  description: string | null;
  discount_pct: number | null;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean | null;
}

export function usePromotions(merchantId: string | undefined) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["promotions", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("merchant_id", merchantId!)
        .order("ends_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as LivePromotion[];
    },
  });
  useEffect(() => {
    if (!merchantId) return;
    const ch = supabase
      .channel(`merchant:${merchantId}:promos`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "promotions", filter: `merchant_id=eq.${merchantId}` },
        () => qc.invalidateQueries({ queryKey: ["promotions", merchantId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [merchantId, qc]);
  return q;
}

export function useUpsertPromotion(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Partial<LivePromotion> & { merchant_id: string }) => {
      if (p.id) {
        const { error } = await supabase.from("promotions").update(p).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promotions").insert(p);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions", merchantId] }),
  });
}

export function useDeletePromotion(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions", merchantId] }),
  });
}

// ───────────────────────── Reviews ─────────────────────────

export interface LiveReview {
  id: string;
  merchant_id: string;
  customer_id: string;
  order_id: string | null;
  rider_id: string | null;
  comment: string | null;
  created_at: string;
  // hydrated
  customer?: { full_name: string | null } | null;
}

export function useReviews(merchantId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("merchant_id", merchantId!)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      const rows = (data ?? []) as LiveReview[];
      const ids = Array.from(new Set(rows.map((r) => r.customer_id).filter(Boolean)));
      if (!ids.length) return rows;
      const { data: cust } = await supabase.from("customers").select("id, full_name").in("id", ids);
      const map = new Map((cust ?? []).map((c: { id: string; full_name: string | null }) => [c.id, c]));
      return rows.map((r) => ({ ...r, customer: map.get(r.customer_id) ?? null }));
    },
  });
}

// ───────────────────────── Customers (orders-derived) ─────────────────────────

export interface CustomerSummary {
  id: string;
  full_name: string | null;
  phone: string | null;
  total_orders: number;
  total_spend_usd: number;
  last_order_at: string | null;
}

export function useMerchantCustomers(merchantId: string | undefined) {
  return useQuery({
    queryKey: ["merchant_customers", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("hw_orders")
        .select("customer_id, amount_usd, created_at")
        .eq("merchant_id", merchantId!);
      if (error) throw error;
      const grouped = new Map<string, { count: number; spend: number; last: string }>();
      for (const o of (orders ?? []) as Array<{ customer_id: string; amount_usd: number | null; created_at: string }>) {
        if (!o.customer_id) continue;
        const cur = grouped.get(o.customer_id) ?? { count: 0, spend: 0, last: o.created_at };
        cur.count += 1;
        cur.spend += Number(o.amount_usd ?? 0);
        if (new Date(o.created_at) > new Date(cur.last)) cur.last = o.created_at;
        grouped.set(o.customer_id, cur);
      }
      const ids = Array.from(grouped.keys());
      if (!ids.length) return [] as CustomerSummary[];
      const { data: cust, error: e2 } = await supabase
        .from("customers")
        .select("id, full_name, phone")
        .in("id", ids);
      if (e2) throw e2;
      const meta = new Map((cust ?? []).map((c: { id: string; full_name: string | null; phone: string | null }) => [c.id, c]));
      return ids.map<CustomerSummary>((id) => {
        const g = grouped.get(id)!;
        const m = meta.get(id);
        return {
          id,
          full_name: m?.full_name ?? null,
          phone: m?.phone ?? null,
          total_orders: g.count,
          total_spend_usd: g.spend,
          last_order_at: g.last,
        };
      }).sort((a, b) => b.total_spend_usd - a.total_spend_usd);
    },
  });
}

// ───────────────────────── Voice logs ─────────────────────────

export interface LiveVoiceLog {
  id: string;
  user_id: string;
  user_role: string | null;
  source: string | null;
  transcript: string | null;
  intent: string | null;
  result_summary: string | null;
  success: boolean | null;
  audio_url: string | null;
  duration_ms: number | null;
  created_at: string;
}

export function useVoiceLogs(userId: string | undefined) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["voice_logs", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voice_logs")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as LiveVoiceLog[];
    },
  });
  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel(`user:${userId}:voice`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "voice_logs", filter: `user_id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey: ["voice_logs", userId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, qc]);
  return q;
}

export async function logVoiceCommandToDb(entry: {
  userId: string;
  userRole?: string;
  source?: string;
  transcript: string;
  intent?: string;
  resultSummary?: string;
  success?: boolean;
}) {
  await supabase.from("voice_logs").insert({
    user_id: entry.userId,
    user_role: entry.userRole ?? "merchant",
    source: entry.source ?? "push-to-talk",
    transcript: entry.transcript,
    intent: entry.intent ?? null,
    result_summary: entry.resultSummary ?? null,
    success: entry.success ?? true,
  });
}
