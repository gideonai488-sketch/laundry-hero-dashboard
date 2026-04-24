import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { MerchantRow } from "./auth";

// ───────────────────────── Orders ─────────────────────────

export type LiveOrderStatus =
  | "pending" | "ai_dispatching" | "accepted" | "pickup" | "washing"
  | "ready" | "out_for_delivery" | "delivered" | "cancelled";

export interface LiveOrder {
  id: string;
  merchant_id: string;
  customer_id: string;
  customer_name: string | null;
  service_summary: string | null;
  item_count: number | null;
  total_usd: number | null;
  total_local: number | null;
  local_currency: string | null;
  pickup_address: string | null;
  distance_km: number | null;
  status: LiveOrderStatus;
  notes: string | null;
  rider_id: string | null;
  created_at: string;
}

export function useOrders(merchantId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["hw_orders", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hw_orders")
        .select("*")
        .eq("merchant_id", merchantId!)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
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
    return () => { supabase.removeChannel(ch); };
  }, [merchantId, qc]);

  return query;
}

export function useUpdateOrderStatus(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LiveOrderStatus }) => {
      const { error } = await supabase.from("hw_orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw_orders", merchantId] }),
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
  ai_confidence: number | null;
  ai_reason: string | null;
  trust_summary: string | null;
  payload: Record<string, unknown> | null;
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
    return () => { supabase.removeChannel(ch); };
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
  price_usd: number;
  duration_hours: number | null;
  ai_pricing_enabled: boolean | null;
  active: boolean | null;
}

export function useServices(merchantId: string | undefined) {
  return useQuery({
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
}

// ───────────────────────── Staff ─────────────────────────

export interface LiveStaff {
  id: string;
  merchant_id: string;
  full_name: string;
  role: string | null;
  phone: string | null;
  active: boolean | null;
}

export function useStaff(merchantId: string | undefined) {
  return useQuery({
    queryKey: ["staff", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("merchant_id", merchantId!)
        .order("full_name");
      if (error) throw error;
      return (data ?? []) as LiveStaff[];
    },
  });
}

// ───────────────────────── Inventory ─────────────────────────

export interface LiveInventoryItem {
  id: string;
  merchant_id: string;
  name: string;
  unit: string | null;
  quantity: number;
  reorder_threshold: number | null;
  auto_reorder: boolean | null;
}

export function useInventory(merchantId: string | undefined) {
  return useQuery({
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
}

// ───────────────────────── AI Insights ─────────────────────────

export interface LiveAIInsight {
  id: string;
  merchant_id: string;
  kind: "pricing" | "demand" | "anomaly" | "dispute" | "reorder" | "schedule" | string;
  title: string;
  body: string;
  status: "open" | "accepted" | "dismissed";
  payload: Record<string, unknown> | null;
  created_at: string;
}

export function useAIInsights(merchantId: string | undefined, limit = 20) {
  return useQuery({
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
  merchant_id: string;
  amount_usd: number;
  amount_local: number | null;
  local_currency: string | null;
  status: "pending" | "processing" | "paid" | "failed";
  destination: string | null;
  paid_at: string | null;
  created_at: string;
}

export function usePayouts(merchantId: string | undefined) {
  return useQuery({
    queryKey: ["hw_payouts", merchantId],
    enabled: !!merchantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hw_payouts")
        .select("*")
        .eq("merchant_id", merchantId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as LivePayout[];
    },
  });
}

// ───────────────────────── Notifications ─────────────────────────

export interface LiveNotification {
  id: string;
  user_id: string;
  type: string;
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
        { event: "INSERT", schema: "public", table: "hw_notifications", filter: `user_id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey: ["hw_notifications", userId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, qc]);

  return query;
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
