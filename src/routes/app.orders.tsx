import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2, PackageOpen, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { useMyOrders } from "@/lib/queries";

export const Route = createFileRoute("/app/orders")({
  head: () => ({ meta: [{ title: "Orders — Highest Wash Merchant" }] }),
  component: OrdersPage,
});

const CURRENCY_SYMBOLS: Record<string, string> = {
  GHS: "₵", NGN: "₦", KES: "KSh ", ZAR: "R", USD: "$", GBP: "£", EUR: "€",
};
const fmt = (n: number, currency?: string | null) => {
  const sym = CURRENCY_SYMBOLS[currency ?? "GHS"] ?? (currency ? `${currency} ` : "₵");
  return `${sym}${n.toFixed(2)}`;
};

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const STATUS_COLOURS: Record<string, string> = {
  merchant_accepted: "bg-primary/15 text-primary",
  picked_up_by_rider: "bg-amber-500/15 text-amber-600",
  washing: "bg-blue-500/15 text-blue-600",
  ready_for_rider: "bg-purple-500/15 text-purple-600",
  out_for_delivery: "bg-amber-500/15 text-amber-600",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

function OrdersPage() {
  const navigate = useNavigate();
  const { merchant } = useAuth();
  const { data: orders = [], isLoading } = useMyOrders(merchant?.id);
  const [tab, setTab] = useState<"active" | "history">("active");

  const active = useMemo(
    () =>
      orders.filter(
        (o: any) => !["delivered", "cancelled"].includes(String(o.delivery_status))
      ),
    [orders]
  );
  const history = useMemo(
    () =>
      orders.filter((o: any) =>
        ["delivered", "cancelled"].includes(String(o.delivery_status))
      ),
    [orders]
  );

  const list = tab === "active" ? active : history;

  return (
    <div>
      <AppHeader title="My orders" subtitle={`${active.length} active · ${history.length} done`} />

      <div className="px-5 mt-2">
        <div className="grid grid-cols-2 gap-1 p-1 bg-card border border-border rounded-2xl">
          {(["active", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`h-10 rounded-xl text-sm font-bold capitalize transition-smooth ${
                tab === t ? "bg-gradient-brand text-primary-foreground shadow-brand" : "text-muted-foreground"
              }`}
            >
              {t} {t === "active" ? `(${active.length})` : `(${history.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4 space-y-2">
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="animate-spin mx-auto" size={20} />
          </div>
        )}
        {!isLoading && list.length === 0 && (
          <div className="text-center py-12 text-muted-foreground rounded-2xl border border-dashed border-border">
            <PackageOpen className="mx-auto mb-2 opacity-50" size={24} />
            <p className="text-sm">{tab === "active" ? "No active orders. Bid on incoming orders to win some!" : "No completed orders yet."}</p>
          </div>
        )}
        {list.map((o: any) => (
          <button
            key={o.id}
            onClick={() => navigate({ to: "/app/order/$orderId", params: { orderId: o.id } })}
            className="w-full text-left p-3 rounded-2xl bg-card border border-border shadow-card flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-brand-soft text-primary flex items-center justify-center">
              <PackageOpen size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-sm">#{String(o.id).slice(0, 6)}</div>
                <div className="text-[10px] text-muted-foreground">{timeAgo(o.created_at)}</div>
              </div>
              <div className="text-xs text-muted-foreground truncate">{o.customer?.full_name ?? "Customer"}</div>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    STATUS_COLOURS[String(o.delivery_status)] ?? "bg-muted text-muted-foreground"
                  }`}
                >
                  {String(o.delivery_status ?? "pending").replace(/_/g, " ")}
                </span>
                <span className="text-sm font-bold">{fmt(Number(o.subtotal ?? 0), o.currency)}</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
