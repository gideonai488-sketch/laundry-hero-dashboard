import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useOrder, useUpdateOrderStatus, type LiveOrderStatus } from "@/lib/queries";
import { useLocale } from "@/lib/locale";
import {
  ArrowLeft, Check, CheckCircle2, ChevronRight, Loader2, MapPin, MessageCircle,
  Package, Phone, Receipt, Shirt, Sparkles, Truck, User, X,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RiderTrackingMap } from "@/components/RiderTrackingMap";

export const Route = createFileRoute("/app/order/$orderId")({
  head: ({ params }) => ({ meta: [{ title: `Order ${params.orderId.slice(0, 8)} — Highest Wash Merchant` }] }),
  component: OrderDetailPage,
});

const statusMeta: Record<LiveOrderStatus, { label: string; tone: string }> = {
  pending: { label: "Pending", tone: "bg-warning/15 text-warning-foreground" },
  ai_dispatching: { label: "Dispatching", tone: "bg-primary/15 text-primary" },
  accepted: { label: "Accepted", tone: "bg-primary/15 text-primary" },
  pickup: { label: "Picked up", tone: "bg-primary/15 text-primary" },
  washing: { label: "Washing", tone: "bg-primary/15 text-primary" },
  ready: { label: "Ready", tone: "bg-success/15 text-success" },
  out_for_delivery: { label: "Out for delivery", tone: "bg-success/15 text-success" },
  delivered: { label: "Delivered", tone: "bg-success/15 text-success" },
  cancelled: { label: "Cancelled", tone: "bg-destructive/15 text-destructive" },
};

const lifecycle: { status: LiveOrderStatus; label: string; icon: typeof Package; hint: string }[] = [
  { status: "accepted", label: "Accepted", icon: CheckCircle2, hint: "Job confirmed" },
  { status: "pickup", label: "Picked up", icon: Truck, hint: "Driver collected items" },
  { status: "washing", label: "Washing", icon: Sparkles, hint: "Cleaning in progress" },
  { status: "ready", label: "Ready", icon: Shirt, hint: "Out for delivery" },
  { status: "delivered", label: "Delivered", icon: Package, hint: "Customer received" },
];

const nextStage: Partial<Record<LiveOrderStatus, { status: LiveOrderStatus; toast: string }>> = {
  pending: { status: "accepted", toast: "Job accepted" },
  ai_dispatching: { status: "accepted", toast: "Job accepted" },
  accepted: { status: "pickup", toast: "Marked as picked up" },
  pickup: { status: "washing", toast: "Washing started" },
  washing: { status: "ready", toast: "Ready for delivery" },
  ready: { status: "out_for_delivery", toast: "Out for delivery" },
  out_for_delivery: { status: "delivered", toast: "Marked as delivered" },
};

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const { merchant } = useAuth();
  const { format } = useLocale();
  const { data: order, isLoading } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus(merchant?.id);

  const breakdown = useMemo(() => {
    const total = Number(order?.amount_usd ?? 0);
    const subtotal = Math.round(total * 0.82 * 100) / 100;
    const platformFee = Math.round(total * 0.06 * 100) / 100;
    const detergent = Math.round(total * 0.06 * 100) / 100;
    const tax = Math.max(0, total - subtotal - detergent - platformFee);
    return { subtotal, platformFee, detergent, tax, merchantNet: total - platformFee };
  }, [order?.amount_usd]);

  if (isLoading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="animate-spin mr-2" /> Loading order…
      </div>
    );
  }

  const meta = statusMeta[order.status] ?? statusMeta.pending;
  const isTerminal = order.status === "delivered" || order.status === "cancelled";
  const next = nextStage[order.status];
  const activeIndex = lifecycle.findIndex((s) => s.status === order.status);
  const customerName = order.customer?.full_name ?? "Customer";
  const items = Array.isArray(order.items) ? order.items.length : 0;
  const shortId = order.id.slice(0, 8);

  const update = (status: LiveOrderStatus, msg: string) => {
    updateStatus.mutate({ id: order.id, status }, {
      onSuccess: () => toast.success(msg),
      onError: (e) => toast.error((e as Error).message),
    });
  };

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/app/orders" })} className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center hover:bg-accent transition-smooth" aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold leading-tight truncate">Order {shortId}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${meta.tone}`}>{meta.label}</span>
        </div>
      </header>

      <section className="px-5 mt-4">
        <div className="rounded-2xl bg-gradient-brand text-primary-foreground p-4 shadow-brand">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur text-white font-bold text-lg flex items-center justify-center shrink-0">
              {customerName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/70 font-medium">Customer</div>
              <div className="font-bold text-base truncate">{customerName}</div>
              <div className="text-[11px] text-white/80 mt-0.5 flex items-center gap-1">
                <User size={11} /> {order.customer?.phone ?? "Verified customer"}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {order.customer?.phone ? (
              <a href={`tel:${order.customer.phone}`} className="h-10 rounded-xl bg-white/15 hover:bg-white/25 transition-smooth font-semibold text-sm flex items-center justify-center gap-1.5">
                <Phone size={14} /> Call
              </a>
            ) : (
              <button disabled className="h-10 rounded-xl bg-white/10 opacity-50 font-semibold text-sm flex items-center justify-center gap-1.5">
                <Phone size={14} /> Call
              </button>
            )}
            <Link to="/app/chat" className="h-10 rounded-xl bg-white text-primary hover:bg-white/95 transition-smooth font-bold text-sm flex items-center justify-center gap-1.5">
              <MessageCircle size={14} /> Message
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 mt-4">
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="h-32 bg-gradient-brand-soft relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_40%,var(--primary)_0%,transparent_40%),radial-gradient(circle_at_70%_60%,var(--primary-glow)_0%,transparent_45%)]" />
            <div className="relative h-12 w-12 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-brand">
              <MapPin size={20} />
            </div>
          </div>
          <div className="p-4">
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Pickup address</div>
            <div className="font-bold mt-1">{order.pickup_address ?? "—"}</div>
            {order.delivery_address && order.delivery_address !== order.pickup_address && (
              <>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-3">Delivery address</div>
                <div className="font-bold mt-1">{order.delivery_address}</div>
              </>
            )}
            <button onClick={() => toast.info("Opening directions…")} className="mt-3 w-full h-10 rounded-xl border border-border text-sm font-semibold hover:bg-accent transition-smooth flex items-center justify-center gap-1.5">
              Get directions <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {["pickup", "ready", "out_for_delivery"].includes(order.status) && (
        <section className="px-5 mt-4">
          <h3 className="font-bold mb-2 text-sm flex items-center gap-1.5"><Truck size={14} /> Live rider</h3>
          <RiderTrackingMap orderId={order.id} />
        </section>
      )}

      <section className="px-5 mt-4">
        <h3 className="font-bold mb-2 text-sm">Service details</h3>
        <div className="bg-card rounded-2xl border border-border shadow-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand-soft text-primary flex items-center justify-center shrink-0">
              <Shirt size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">Wash & Fold</div>
              <div className="text-xs text-muted-foreground mt-0.5">{items} item{items === 1 ? "" : "s"} · Standard turnaround</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-bold text-primary">{format(Number(order.amount_usd ?? 0))}</div>
            </div>
          </div>

          {order.notes && (
            <div className="text-xs bg-warning/10 text-foreground p-3 rounded-xl border border-warning/30">
              <span className="font-semibold">Customer note: </span>{order.notes}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 mt-4">
        <h3 className="font-bold mb-2 text-sm flex items-center gap-1.5"><Receipt size={14} /> Pricing breakdown</h3>
        <div className="bg-card rounded-2xl border border-border shadow-card p-4 text-sm">
          <Row label="Subtotal" value={format(breakdown.subtotal)} />
          <Row label="Detergent / supplies" value={format(breakdown.detergent)} />
          {breakdown.tax > 0 && <Row label="VAT" value={format(breakdown.tax)} />}
          <div className="border-t border-border my-2" />
          <Row label="Customer paid" value={format(Number(order.amount_usd ?? 0))} bold />
          <Row label="Platform fee (6%)" value={`− ${format(breakdown.platformFee)}`} tone="text-muted-foreground" />
          <div className="border-t border-border my-2" />
          <Row label="You earn" value={format(breakdown.merchantNet)} bold tone="text-success" />
        </div>
      </section>

      <section className="px-5 mt-4">
        <h3 className="font-bold mb-3 text-sm">Job progress</h3>
        <div className="bg-card rounded-2xl border border-border shadow-card p-4">
          {order.status === "cancelled" ? (
            <div className="text-center py-4">
              <div className="h-12 w-12 mx-auto rounded-full bg-destructive/15 text-destructive flex items-center justify-center"><X size={20} /></div>
              <div className="font-bold mt-2">Order cancelled</div>
              <div className="text-xs text-muted-foreground mt-0.5">This job is no longer active</div>
            </div>
          ) : (
            <ol className="space-y-3">
              {lifecycle.map((step, i) => {
                const done = activeIndex >= i && order.status !== "pending" && order.status !== "ai_dispatching";
                const active = activeIndex === i;
                const Icon = step.icon;
                return (
                  <li key={step.status} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-smooth ${
                        done ? "bg-gradient-brand text-primary-foreground shadow-brand" : "bg-muted text-muted-foreground"
                      }`}>
                        {done && !active ? <Check size={16} /> : <Icon size={16} />}
                      </div>
                      {i < lifecycle.length - 1 && (
                        <div className={`w-0.5 h-6 mt-1 ${done && activeIndex > i ? "bg-primary/40" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className={`text-sm font-bold ${active ? "text-primary" : done ? "" : "text-muted-foreground"}`}>
                        {step.label}
                        {active && <span className="ml-2 text-[10px] font-bold uppercase text-primary">· Now</span>}
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

      {!isTerminal && (
        <section className="px-5 mt-5 sticky bottom-24 z-20">
          {(order.status === "pending" || order.status === "ai_dispatching") ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => update("cancelled", `Order ${shortId} declined`)}
                disabled={updateStatus.isPending}
                className="h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
              >
                <X size={16} /> Decline
              </Button>
              <Button
                onClick={() => update("accepted", `Order ${shortId} accepted`)}
                disabled={updateStatus.isPending}
                className="h-12 rounded-xl bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-95 border-0 font-bold"
              >
                <Check size={16} /> Accept job
              </Button>
            </div>
          ) : (
            next && (
              <Button
                onClick={() => update(next.status, next.toast)}
                disabled={updateStatus.isPending}
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

function Row({ label, value, bold, tone }: { label: string; value: string; bold?: boolean; tone?: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`${bold ? "font-bold" : "text-muted-foreground"} ${tone ?? ""}`}>{label}</span>
      <span className={`${bold ? "font-bold" : "font-semibold"} ${tone ?? ""}`}>{value}</span>
    </div>
  );
}
