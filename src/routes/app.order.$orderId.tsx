import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  ensureChat,
  useOrder,
  useOrderDispute,
  useSubmitDispute,
  useUpdateDeliveryStatus,
} from "@/lib/queries";

export const Route = createFileRoute("/app/order/$orderId")({
  head: ({ params }) => ({ meta: [{ title: `Order #${params.orderId.slice(0, 6)} — Highest Wash` }] }),
  component: OrderDetailPage,
});

const fmt = (n: number) => `₵${n.toFixed(2)}`;

const STAGES: { key: string; label: string; merchantOwned: boolean }[] = [
  { key: "merchant_accepted", label: "Bid accepted", merchantOwned: false },
  { key: "picked_up_by_rider", label: "Picked up by rider", merchantOwned: false },
  { key: "washing", label: "Washing", merchantOwned: true },
  { key: "ready_for_rider", label: "Ready for rider", merchantOwned: true },
  { key: "out_for_delivery", label: "Out for delivery", merchantOwned: false },
  { key: "delivered", label: "Delivered", merchantOwned: false },
];

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const { user, merchant } = useAuth();
  const { data: order, isLoading } = useOrder(orderId);
  const { data: dispute } = useOrderDispute(orderId);
  const update = useUpdateDeliveryStatus();
  const submitDispute = useSubmitDispute();
  const [openingChat, setOpeningChat] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  if (isLoading || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const currentIdx = Math.max(
    0,
    STAGES.findIndex((s) => s.key === String(order.delivery_status))
  );

  const advance = (key: string) => {
    update.mutate(
      { orderId, delivery_status: key, riderId: order?.rider_id ?? null },
      {
        onSuccess: () => toast.success(`Marked as ${key.replace(/_/g, " ")}`),
        onError: (e: any) => toast.error(e.message ?? "Couldn't update"),
      }
    );
  };

  const openChat = async () => {
    if (!merchant?.id || !order?.customer_id) return;
    setOpeningChat(true);
    const chatId = await ensureChat({
      orderId,
      customerId: order.customer_id,
      merchantId: merchant.id,
    });
    setOpeningChat(false);
    if (chatId) navigate({ to: "/app/messages/$chatId", params: { chatId } });
    else toast.error("Couldn't open chat — backend may need to enable RLS for chats.");
  };

  const fileDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    submitDispute.mutate(
      { orderId, reason: disputeReason.trim() },
      {
        onSuccess: () => {
          toast.success("Dispute submitted. Support will reach out.");
          setDisputeReason("");
          setShowDisputeForm(false);
        },
        onError: (err: any) => toast.error(err.message ?? "Couldn't submit dispute"),
      }
    );
  };

  const customerName = order.customer?.full_name ?? "Customer";
  const phone = order.customer?.phone;
  const items: any[] = order.items ?? [];
  const photos: string[] = order.photo_urls ?? [];

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/50">
        <div className="px-5 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/app/orders" })}
            className="h-10 w-10 -ml-2 rounded-full hover:bg-accent flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <div className="text-base font-bold">Order #{String(order.id).slice(0, 6)}</div>
            <div className="text-[11px] text-muted-foreground truncate">{order.service_name ?? "Laundry"}</div>
          </div>
          <div className="ml-auto text-base font-bold">{fmt(Number(order.subtotal ?? 0))}</div>
        </div>
      </header>

      {/* Customer */}
      <section className="px-5 mt-4">
        <div className="rounded-2xl bg-card border border-border shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center font-bold">
              {customerName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{customerName}</div>
              <div className="text-xs text-muted-foreground truncate">
                Status: {String(order.delivery_status ?? "pending").replace(/_/g, " ")}
              </div>
            </div>
            <button
              onClick={openChat}
              disabled={openingChat}
              className="h-10 w-10 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-brand disabled:opacity-50"
              aria-label="Open chat"
            >
              {openingChat ? <Loader2 className="animate-spin" size={14} /> : <MessageSquare size={16} />}
            </button>
            {phone && (
              <a href={`tel:${phone}`} className="h-10 w-10 rounded-full bg-gradient-brand-soft text-primary flex items-center justify-center" aria-label="Call">
                <Phone size={16} />
              </a>
            )}
          </div>
          <button
            onClick={openChat}
            disabled={openingChat}
            className="mt-3 w-full h-10 rounded-xl bg-gradient-brand-soft text-primary text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <MessageSquare size={14} />
            {openingChat ? "Opening chat…" : "Message customer"}
          </button>
        </div>
      </section>

      {/* Pickup */}
      <section className="px-5 mt-4">
        <div className="rounded-2xl bg-card border border-border shadow-card p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <MapPin size={12} className="text-primary" /> Pickup
          </div>
          <div className="mt-1 font-semibold text-sm">{order.pickup_address ?? "—"}</div>
          {order.pickup_date && (
            <div className="text-xs text-muted-foreground mt-1">
              {order.pickup_date} {order.pickup_time_slot ? `· ${order.pickup_time_slot}` : ""}
            </div>
          )}
        </div>
      </section>

      {/* Items */}
      {items.length > 0 && (
        <section className="px-5 mt-4">
          <div className="rounded-2xl bg-card border border-border shadow-card p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Items</div>
            <ul className="mt-2 divide-y divide-border">
              {items.map((it) => (
                <li key={it.id} className="py-2 flex items-center justify-between text-sm">
                  <span className="truncate pr-3">{it.description ?? "Item"}</span>
                  <span className="text-muted-foreground shrink-0">
                    {it.qty ? `×${it.qty}` : ""}
                    {it.weight_kg ? ` · ${it.weight_kg}kg` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <section className="px-5 mt-4">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Photos</div>
          <div className="flex gap-2 overflow-x-auto">
            {photos.map((src, i) => (
              <img key={i} src={src} alt="" className="h-24 w-24 rounded-xl object-cover border border-border shrink-0" />
            ))}
          </div>
        </section>
      )}

      {/* Stage controller */}
      <section className="px-5 mt-6">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Stage
        </div>
        <ol className="space-y-2">
          {STAGES.map((s, idx) => {
            const done = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            const isNextMerchant =
              idx === currentIdx + 1 &&
              s.merchantOwned &&
              !["delivered", "cancelled"].includes(String(order.delivery_status));

            return (
              <li
                key={s.key}
                className={`flex items-center gap-3 p-3 rounded-2xl border ${
                  isCurrent
                    ? "border-primary bg-primary/5"
                    : done
                    ? "border-border bg-card"
                    : "border-dashed border-border bg-card/50"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    done
                      ? "bg-success/20 text-success"
                      : isCurrent
                      ? "bg-gradient-brand text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <CheckCircle2 size={14} /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{s.label}</div>
                  {!s.merchantOwned && !done && (
                    <div className="text-[10px] text-muted-foreground">Updated by rider / system</div>
                  )}
                </div>
                {isNextMerchant && (
                  <button
                    onClick={() => advance(s.key)}
                    disabled={update.isPending}
                    className="h-9 px-3 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-brand disabled:opacity-40"
                  >
                    {update.isPending ? <Loader2 className="animate-spin" size={14} /> : `Mark ${s.label}`}
                  </button>
                )}
              </li>
            );
          })}
        </ol>

        {order.notes && (
          <div className="mt-4 rounded-2xl bg-gradient-brand-soft border border-primary/20 p-3 text-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
              <Sparkles size={11} /> Customer notes
            </div>
            <div className="mt-1">{order.notes}</div>
          </div>
        )}
      </section>

      {/* Timeline (history of known status changes) */}
      <section className="px-5 mt-6">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Job history
        </div>
        <ol className="relative border-l-2 border-border ml-3 space-y-4 pb-2">
          <TimelineEvent
            label="Order placed"
            iso={order.created_at}
            done
            tone="primary"
          />
          {order.merchant_id && (
            <TimelineEvent
              label="Bid accepted"
              iso={order.updated_at}
              done
              tone="primary"
              hint="You won this order"
            />
          )}
          {order.delivered_at && (
            <TimelineEvent label="Delivered" iso={order.delivered_at} done tone="success" />
          )}
          {order.customer_confirmed_at && (
            <TimelineEvent
              label="Customer confirmed"
              iso={order.customer_confirmed_at}
              done
              tone="success"
            />
          )}
          <TimelineEvent
            label={`Currently: ${String(order.delivery_status ?? "pending").replace(/_/g, " ")}`}
            iso={order.updated_at}
            done={String(order.delivery_status) === "delivered"}
            tone={String(order.delivery_status) === "cancelled" ? "destructive" : "muted"}
            hint="Detailed per-stage timestamps need backend status events"
          />
        </ol>
      </section>

      {/* Dispute / issue submission */}
      <section className="px-5 mt-6 mb-6">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Issue with this order?
        </div>

        {dispute ? (
          <div className="rounded-2xl bg-card border border-border p-4 shadow-card">
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                  dispute.status === "resolved"
                    ? "bg-success/15 text-success"
                    : "bg-amber-500/15 text-amber-600"
                }`}
              >
                <AlertTriangle size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold capitalize">
                  Dispute · {dispute.status ?? "open"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Filed {new Date(dispute.created_at).toLocaleString()}
                  {dispute.resolved_at
                    ? ` · resolved ${new Date(dispute.resolved_at).toLocaleString()}`
                    : ""}
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm bg-muted/50 rounded-xl p-3 whitespace-pre-wrap">
              {dispute.reason}
            </div>
          </div>
        ) : !showDisputeForm ? (
          <button
            onClick={() => setShowDisputeForm(true)}
            className="w-full h-12 rounded-2xl border border-amber-500/40 text-amber-600 font-semibold flex items-center justify-center gap-2"
          >
            <AlertTriangle size={16} /> Report an issue
          </button>
        ) : (
          <form
            onSubmit={fileDispute}
            className="rounded-2xl bg-card border border-border p-4 shadow-card space-y-3"
          >
            <div className="text-xs text-muted-foreground">
              Tell support what happened — wrong items, damage, customer no-show, payment problem, etc.
            </div>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Describe the issue…"
              className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDisputeForm(false);
                  setDisputeReason("");
                }}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitDispute.isPending || !disputeReason.trim()}
                className="flex-1 h-11 rounded-xl bg-gradient-brand text-primary-foreground text-sm font-bold shadow-brand disabled:opacity-40 flex items-center justify-center"
              >
                {submitDispute.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function TimelineEvent({
  label,
  iso,
  done,
  tone,
  hint,
}: {
  label: string;
  iso?: string | null;
  done: boolean;
  tone: "primary" | "success" | "muted" | "destructive";
  hint?: string;
}) {
  const dotClass =
    tone === "success"
      ? "bg-success text-white"
      : tone === "destructive"
      ? "bg-destructive text-white"
      : tone === "muted"
      ? "bg-muted text-muted-foreground"
      : "bg-gradient-brand text-primary-foreground";
  return (
    <li className="ml-4">
      <span
        className={`absolute -left-[9px] h-4 w-4 rounded-full flex items-center justify-center ${dotClass}`}
      >
        {done ? <CheckCircle2 size={10} /> : <Clock size={10} />}
      </span>
      <div className="text-sm font-semibold capitalize">{label}</div>
      <div className="text-[11px] text-muted-foreground">
        {iso ? new Date(iso).toLocaleString() : "—"}
      </div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5 italic">{hint}</div>}
    </li>
  );
}
