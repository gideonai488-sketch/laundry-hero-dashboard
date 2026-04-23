import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { orders as initialOrders, customerTrust, formatGHS, statusMeta, type Order, type OrderStatus } from "@/lib/mock-data";
import { Check, ChevronRight, MapPin, Package, Shield, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/orders")({
  head: () => ({ meta: [{ title: "Orders — Highest Wash Merchant" }] }),
  component: OrdersPage,
});

const tabs: { key: "all" | "pending" | "active" | "done"; label: string }[] = [
  { key: "pending", label: "New" },
  { key: "active", label: "In progress" },
  { key: "done", label: "Completed" },
  { key: "all", label: "All" },
];

function OrdersPage() {
  const [data, setData] = useState<Order[]>(initialOrders);
  const [tab, setTab] = useState<"all" | "pending" | "active" | "done">("pending");

  const filtered = data.filter((o) => {
    if (tab === "pending") return o.status === "pending";
    if (tab === "active") return ["accepted", "pickup", "washing", "ready"].includes(o.status);
    if (tab === "done") return ["delivered", "cancelled"].includes(o.status);
    return true;
  });

  const update = (id: string, status: OrderStatus, msg: string) => {
    setData((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success(msg);
  };

  return (
    <div>
      <AppHeader title="Orders" subtitle={`${data.filter((o) => o.status === "pending").length} new · ${data.filter((o) => ["accepted","pickup","washing","ready"].includes(o.status)).length} active`} />

      {/* Tabs */}
      <div className="px-5 mt-2 flex gap-2 overflow-x-auto pb-1 -mx-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-smooth ${
              tab === t.key ? "bg-gradient-brand text-primary-foreground shadow-brand" : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="px-5 mt-4 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="mx-auto mb-3 opacity-40" size={36} />
            <p className="text-sm">No orders here yet.</p>
          </div>
        )}
        {filtered.map((o) => {
          const meta = statusMeta[o.status];
          const trust = customerTrust[o.customer];
          const trustTone =
            trust?.riskScore === "low"
              ? "bg-success/10 text-success border-success/20"
              : trust?.riskScore === "medium"
                ? "bg-warning/10 text-warning border-warning/30"
                : "bg-destructive/10 text-destructive border-destructive/20";
          return (
            <div key={o.id} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <Link
                to="/app/order/$orderId"
                params={{ orderId: o.id }}
                className="block p-4 hover:bg-accent/40 transition-smooth"
              >
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-brand-soft text-primary font-bold flex items-center justify-center shrink-0">
                    {o.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold truncate">{o.customer}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.tone}`}>{meta.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{o.id} · {o.createdAt}</div>
                  </div>
                </div>

                {trust && (
                  <div className={`mt-3 flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border ${trustTone}`}>
                    <Shield size={11} className="shrink-0" />
                    <span className="truncate">AI background check · {trust.summary}</span>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-muted rounded-lg p-2">
                    <div className="text-muted-foreground">Service</div>
                    <div className="font-semibold mt-0.5 truncate">{o.service}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <div className="text-muted-foreground">Items</div>
                    <div className="font-semibold mt-0.5">{o.items}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <div className="text-muted-foreground">Amount</div>
                    <div className="font-semibold mt-0.5 text-primary">{formatGHS(o.amount)}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin size={12} className="text-primary shrink-0" />
                    <span className="truncate">{o.address} · {o.distance}</span>
                  </div>
                  <span className="text-primary font-semibold flex items-center gap-0.5 shrink-0">
                    Details <ChevronRight size={12} />
                  </span>
                </div>

                {o.notes && (
                  <div className="mt-3 text-xs bg-warning/10 text-foreground p-2.5 rounded-lg border border-warning/30">
                    <span className="font-semibold">Note: </span>{o.notes}
                  </div>
                )}
              </Link>

              {/* Action bar */}
              {o.status === "pending" && (
                <div className="border-t border-border grid grid-cols-2">
                  <button
                    onClick={() => update(o.id, "cancelled", `Order ${o.id} declined`)}
                    className="py-3 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-smooth flex items-center justify-center gap-1.5"
                  >
                    <X size={16} /> Decline
                  </button>
                  <button
                    onClick={() => update(o.id, "accepted", `Order ${o.id} accepted`)}
                    className="py-3 text-sm font-bold text-primary-foreground bg-gradient-brand hover:opacity-95 transition-smooth flex items-center justify-center gap-1.5"
                  >
                    <Check size={16} /> Accept job
                  </button>
                </div>
              )}
              {["accepted", "pickup", "washing", "ready"].includes(o.status) && (
                <div className="border-t border-border p-3 flex items-center gap-2">
                  <div className="text-xs text-muted-foreground flex-1">Move to next stage:</div>
                  <button
                    onClick={() => {
                      const next: Record<string, { status: OrderStatus; label: string }> = {
                        accepted: { status: "pickup", label: "Picked up" },
                        pickup: { status: "washing", label: "Washing started" },
                        washing: { status: "ready", label: "Ready for delivery" },
                        ready: { status: "delivered", label: "Delivered" },
                      };
                      const n = next[o.status];
                      if (n) update(o.id, n.status, n.label);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-primary-foreground bg-gradient-brand rounded-full shadow-brand"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
