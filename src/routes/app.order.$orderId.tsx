import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  orders as initialOrders,
  formatGHS,
  statusMeta,
  type Order,
  type OrderStatus,
} from "@/lib/mock-data";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Receipt,
  Shirt,
  Sparkles,
  Truck,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/order/$orderId")({
  head: ({ params }) => ({
    meta: [{ title: `Order ${params.orderId} — Highest Wash Merchant` }],
  }),
  component: OrderDetailPage,
});

const lifecycle: { status: OrderStatus; label: string; icon: typeof Package; hint: string }[] = [
  { status: "accepted", label: "Accepted", icon: CheckCircle2, hint: "Job confirmed" },
  { status: "pickup", label: "Picked up", icon: Truck, hint: "Driver collected items" },
  { status: "washing", label: "Washing", icon: Sparkles, hint: "Cleaning in progress" },
  { status: "ready", label: "Ready", icon: Shirt, hint: "Out for delivery" },
  { status: "delivered", label: "Delivered", icon: Package, hint: "Customer received" },
];

const nextStage: Partial<Record<OrderStatus, { status: OrderStatus; toast: string }>> = {
  pending: { status: "accepted", toast: "Job accepted" },
  accepted: { status: "pickup", toast: "Marked as picked up" },
  pickup: { status: "washing", toast: "Washing started" },
  washing: { status: "ready", toast: "Ready for delivery" },
  ready: { status: "delivered", toast: "Marked as delivered" },
};

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const initial = initialOrders.find((o) => o.id === orderId) ?? initialOrders[0];
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order>(initial);

  const meta = statusMeta[order.status];

  // Mock pricing breakdown derived from total amount
  const breakdown = useMemo(() => {
    const subtotal = Math.round(order.amount * 0.82);
    const pickup = order.distance ? 8 : 0;
    const detergent = Math.round(order.amount * 0.06);
    const platformFee = Math.round(order.amount * 0.06);
    const tax = order.amount - subtotal - pickup - detergent - platformFee;
    const merchantNet = order.amount - platformFee;
    return { subtotal, pickup, detergent, platformFee, tax, merchantNet };
  }, [order.amount]);

  const activeIndex = lifecycle.findIndex((s) => s.status === order.status);
  const isTerminal = order.status === "delivered" || order.status === "cancelled";
  const next = nextStage[order.status];

  const update = (status: OrderStatus, msg: string) => {
    setOrder((prev) => ({ ...prev, status }));
    toast.success(msg);
  };

  return (
    <div className="pb-6">
      {/* Custom header with back button */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/app/orders" })}
            className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center hover:bg-accent transition-smooth"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold leading-tight truncate">Order {order.id}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{order.createdAt}</p>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${meta.tone}`}>
            {meta.label}
          </span>
        </div>
      </header>

      {/* Customer card */}
      <section className="px-5 mt-4">
        <div className="rounded-2xl bg-gradient-brand text-primary-foreground p-4 shadow-brand">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur text-white font-bold text-lg flex items-center justify-center shrink-0">
              {order.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/70 font-medium">Customer</div>
              <div className="font-bold text-base truncate">{order.customer}</div>
              <div className="text-[11px] text-white/80 mt-0.5 flex items-center gap-1">
                <User size={11} /> Verified · Member since 2025
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => toast.success(`Calling ${order.customer}...`)}
              className="h-10 rounded-xl bg-white/15 hover:bg-white/25 transition-smooth font-semibold text-sm flex items-center justify-center gap-1.5"
            >
              <Phone size={14} /> Call
            </button>
            <Link
              to="/app/chat"
              className="h-10 rounded-xl bg-white text-primary hover:bg-white/95 transition-smooth font-bold text-sm flex items-center justify-center gap-1.5"
            >
              <MessageCircle size={14} /> Message
            </Link>
          </div>
        </div>
      </section>

      {/* Pickup address */}
      <section className="px-5 mt-4">
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="h-32 bg-gradient-brand-soft relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_40%,var(--primary)_0%,transparent_40%),radial-gradient(circle_at_70%_60%,var(--primary-glow)_0%,transparent_45%)]" />
            <div className="relative h-12 w-12 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-brand">
              <MapPin size={20} />
            </div>
          </div>
          <div className="p-4">
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Pickup address
            </div>
            <div className="font-bold mt-1">{order.address}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {order.distance} from your shop
            </div>
            <button
              onClick={() => toast.success("Opening directions...")}
              className="mt-3 w-full h-10 rounded-xl border border-border text-sm font-semibold hover:bg-accent transition-smooth flex items-center justify-center gap-1.5"
            >
              Get directions <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Service & items */}
      <section className="px-5 mt-4">
        <h3 className="font-bold mb-2 text-sm">Service details</h3>
        <div className="bg-card rounded-2xl border border-border shadow-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand-soft text-primary flex items-center justify-center shrink-0">
              <Shirt size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">{order.service}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {order.items} item{order.items === 1 ? "" : "s"} · Standard turnaround
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-bold text-primary">{formatGHS(order.amount)}</div>
            </div>
          </div>

          {order.notes && (
            <div className="text-xs bg-warning/10 text-foreground p-3 rounded-xl border border-warning/30">
              <span className="font-semibold">Customer note: </span>
              {order.notes}
            </div>
          )}
        </div>
      </section>

      {/* Pricing breakdown */}
      <section className="px-5 mt-4">
        <h3 className="font-bold mb-2 text-sm flex items-center gap-1.5">
          <Receipt size={14} /> Pricing breakdown
        </h3>
        <div className="bg-card rounded-2xl border border-border shadow-card p-4 text-sm">
          <Row label={`${order.service} × ${order.items}`} value={formatGHS(breakdown.subtotal)} />
          {breakdown.pickup > 0 && (
            <Row label="Pickup & delivery" value={formatGHS(breakdown.pickup)} />
          )}
          <Row label="Detergent / supplies" value={formatGHS(breakdown.detergent)} />
          {breakdown.tax > 0 && <Row label="VAT" value={formatGHS(breakdown.tax)} />}
          <div className="border-t border-border my-2" />
          <Row label="Customer paid" value={formatGHS(order.amount)} bold />
          <Row
            label="Platform fee (6%)"
            value={`− ${formatGHS(breakdown.platformFee)}`}
            tone="text-muted-foreground"
          />
          <div className="border-t border-border my-2" />
          <Row
            label="You earn"
            value={formatGHS(breakdown.merchantNet)}
            bold
            tone="text-success"
          />
        </div>
      </section>

      {/* Status stepper */}
      <section className="px-5 mt-4">
        <h3 className="font-bold mb-3 text-sm">Job progress</h3>
        <div className="bg-card rounded-2xl border border-border shadow-card p-4">
          {order.status === "cancelled" ? (
            <div className="text-center py-4">
              <div className="h-12 w-12 mx-auto rounded-full bg-destructive/15 text-destructive flex items-center justify-center">
                <X size={20} />
              </div>
              <div className="font-bold mt-2">Order cancelled</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                This job is no longer active
              </div>
            </div>
          ) : (
            <ol className="space-y-3">
              {lifecycle.map((step, i) => {
                const done = activeIndex >= i && order.status !== "pending";
                const active = activeIndex === i;
                const Icon = step.icon;
                return (
                  <li key={step.status} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-smooth ${
                          done
                            ? "bg-gradient-brand text-primary-foreground shadow-brand"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {done && !active ? <Check size={16} /> : <Icon size={16} />}
                      </div>
                      {i < lifecycle.length - 1 && (
                        <div
                          className={`w-0.5 h-6 mt-1 ${
                            done && activeIndex > i ? "bg-primary/40" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div
                        className={`text-sm font-bold ${
                          active ? "text-primary" : done ? "" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                        {active && (
                          <span className="ml-2 text-[10px] font-bold uppercase text-primary">
                            · Now
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{step.hint}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      {/* Action bar */}
      {!isTerminal && (
        <section className="px-5 mt-5 sticky bottom-24 z-20">
          {order.status === "pending" ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => update("cancelled", `Order ${order.id} declined`)}
                className="h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
              >
                <X size={16} /> Decline
              </Button>
              <Button
                onClick={() => update("accepted", `Order ${order.id} accepted`)}
                className="h-12 rounded-xl bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-95 border-0 font-bold"
              >
                <Check size={16} /> Accept job
              </Button>
            </div>
          ) : (
            next && (
              <Button
                onClick={() => update(next.status, next.toast)}
                className="w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-95 border-0 font-bold"
              >
                Mark as {statusMeta[next.status].label} →
              </Button>
            )
          )}
        </section>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`${bold ? "font-bold" : "text-muted-foreground"} ${tone ?? ""}`}>
        {label}
      </span>
      <span className={`${bold ? "font-bold" : "font-semibold"} ${tone ?? ""}`}>{value}</span>
    </div>
  );
}
