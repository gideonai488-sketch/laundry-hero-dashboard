import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  MapPin,
  PackageOpen,
  Power,
  Radio,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  ensureChat,
  useIncomingFeed,
  useMyOrders,
  useToggleOnline,
  useSubmitBid,
  useMyBidsWatcher,
} from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/NotificationBell";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — Highest Wash Merchant" }] }),
  component: Dashboard,
});

const fmt = (n: number) => `₵${n.toFixed(2)}`;

function haversineKm(lat1?: number | null, lng1?: number | null, lat2?: number | null, lng2?: number | null) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function Dashboard() {
  const navigate = useNavigate();
  const { merchant, refresh } = useAuth();
  const merchantId = merchant?.id;

  const toggleOnline = useToggleOnline();
  const { data: incoming = [], isLoading: incomingLoading } = useIncomingFeed(merchantId);
  const { data: myOrders = [] } = useMyOrders(merchantId);

  // Toast on win + auto-open a chat with the customer
  useMyBidsWatcher(merchantId, async (orderId) => {
    toast.success(`🎉 You won order #${orderId.slice(0, 6)}!`);
    refresh();
    if (!merchantId) return;
    // Look up customer for this order, then ensure a chat exists
    const { data } = await supabase
      .from("hw_orders")
      .select("customer_id")
      .eq("id", orderId)
      .maybeSingle();
    if (data?.customer_id) {
      await ensureChat({ orderId, customerId: data.customer_id, merchantId });
    }
  });

  const today = new Date();
  const isToday = (iso?: string | null) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d.toDateString() === today.toDateString();
  };

  // Stats
  const inProgress = useMemo(
    () =>
      myOrders.filter(
        (o: any) =>
          o.delivery_status &&
          !["delivered", "cancelled"].includes(o.delivery_status as string)
      ),
    [myOrders]
  );
  const deliveredToday = useMemo(
    () => myOrders.filter((o: any) => o.delivery_status === "delivered" && isToday(o.delivered_at)),
    [myOrders]
  );
  const earnedToday = useMemo(
    () =>
      deliveredToday
        .filter((o: any) => o.payment_status === "paid")
        .reduce((s: number, o: any) => s + Number(o.subtotal ?? 0), 0),
    [deliveredToday]
  );
  const wonToday = useMemo(
    () => myOrders.filter((o: any) => isToday(o.created_at)).length,
    [myOrders]
  );

  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const visibleIncoming = useMemo(
    () => incoming.filter((o: any) => !skipped.has(o.id) && !o.my_bid),
    [incoming, skipped]
  );

  const [bidOrder, setBidOrder] = useState<any | null>(null);

  const setOnline = (v: boolean) => {
    if (!merchantId) return;
    toggleOnline.mutate(
      { merchantId, online: v },
      {
        onSuccess: () => {
          toast.success(v ? "You're online — sending you orders." : "Shop is offline.");
          refresh();
        },
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  return (
    <div>
      {/* Header */}
      <header
        className="px-5 pb-4 bg-gradient-hero text-primary-foreground rounded-b-3xl shadow-brand"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-white/75 font-medium">Welcome back</div>
            <div className="flex items-center gap-1.5 mt-0.5 truncate">
              <MapPin size={14} className="shrink-0" />
              <div className="text-base font-bold truncate">{merchant?.business_name ?? "My shop"}</div>
            </div>
          </div>

          <button
            onClick={() => setOnline(!merchant?.online)}
            disabled={toggleOnline.isPending}
            className={`flex items-center gap-2 px-3 h-10 rounded-full text-xs font-bold transition-smooth border ${
              merchant?.online
                ? "bg-success/20 border-success/30 text-white"
                : "bg-white/10 border-white/30 text-white/85"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${merchant?.online ? "bg-success animate-pulse" : "bg-white/60"}`} />
            <Power size={14} />
            {merchant?.online ? "Online" : "Offline"}
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mt-5">
          <Stat label="Won today" value={String(wonToday)} icon={<Trophy size={14} />} />
          <Stat label="In progress" value={String(inProgress.length)} icon={<Activity size={14} />} />
          <Stat label="Delivered" value={String(deliveredToday.length)} icon={<CheckCircle2 size={14} />} />
          <Stat label="₵ today" value={fmt(earnedToday)} icon={<Banknote size={14} />} />
        </div>
      </header>

      {/* Live feed */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Radio size={16} className="text-primary" /> Incoming orders
            </h2>
            <p className="text-xs text-muted-foreground">
              Live broadcast pool — bid fast, the customer picks one merchant.
            </p>
          </div>
          {merchant?.online && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-success/15 text-success">
              LIVE
            </span>
          )}
        </div>

        {!merchant?.online && (
          <div className="mt-4 rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
            <Power className="mx-auto mb-2 opacity-50" size={20} />
            You're offline. Toggle "Online" above to start receiving orders.
          </div>
        )}

        {merchant?.online && incomingLoading && (
          <div className="mt-4 text-center py-10 text-muted-foreground">
            <Loader2 className="animate-spin mx-auto" size={20} />
          </div>
        )}

        {merchant?.online && !incomingLoading && visibleIncoming.length === 0 && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            <Sparkles className="mx-auto mb-2 text-primary opacity-70" size={20} />
            No open orders right now — sit tight, the next one will pop in here in real-time.
          </div>
        )}

        <div className="mt-3 space-y-3">
          {visibleIncoming.map((o: any) => (
            <IncomingCard
              key={o.id}
              order={o}
              myLat={merchant?.lat}
              myLng={merchant?.lng}
              onBid={() => setBidOrder(o)}
              onSkip={() => setSkipped((s) => new Set([...s, o.id]))}
            />
          ))}
        </div>
      </section>

      {/* In-progress shortcut */}
      {inProgress.length > 0 && (
        <section className="px-5 mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ClipboardList size={16} className="text-primary" /> In progress
            </h2>
            <button onClick={() => navigate({ to: "/app/orders" })} className="text-xs font-bold text-primary inline-flex items-center gap-1">
              All orders <ArrowRight size={12} />
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {inProgress.slice(0, 3).map((o: any) => (
              <button
                key={o.id}
                onClick={() => navigate({ to: "/app/order/$orderId", params: { orderId: o.id } })}
                className="w-full text-left p-3 rounded-2xl bg-card border border-border shadow-card flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-brand-soft text-primary flex items-center justify-center">
                  <PackageOpen size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">#{String(o.id).slice(0, 6)}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {o.delivery_status} · {fmt(Number(o.subtotal ?? 0))}
                  </div>
                </div>
                <ArrowRight size={14} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Bid sheet */}
      <BidSheet order={bidOrder} merchantId={merchantId} onClose={() => setBidOrder(null)} />
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-2xl px-2 py-2.5 text-center">
      <div className="flex items-center justify-center text-white/80">{icon}</div>
      <div className="text-base font-bold leading-tight mt-1">{value}</div>
      <div className="text-[10px] text-white/70 leading-none mt-0.5">{label}</div>
    </div>
  );
}

const COUNTDOWN_SECONDS = 90;

function IncomingCard({
  order,
  myLat,
  myLng,
  onBid,
  onSkip,
}: {
  order: any;
  myLat: number | null | undefined;
  myLng: number | null | undefined;
  onBid: () => void;
  onSkip: () => void;
}) {
  // Countdown anchored on order.created_at
  // useState(0) avoids SSR/client hydration mismatch (Date.now() differs server vs client)
  const createdMs = new Date(order.created_at).getTime();
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  const elapsed = (now - createdMs) / 1000;
  const remaining = Math.max(0, COUNTDOWN_SECONDS - elapsed);
  const pct = remaining / COUNTDOWN_SECONDS;
  const expired = remaining <= 0;

  const distKm = haversineKm(myLat, myLng, order.pickup_lat, order.pickup_lng);
  const services = (order.items as any[])?.map((i) => i.description).filter(Boolean).join(", ") || order.service_name || "Laundry order";
  const customerName = order.customer?.full_name?.split(" ")?.[0] ?? "New customer";
  const photos = (order.photo_urls as string[] | null) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
    >
      <div className="p-4 flex items-start gap-3">
        {/* Countdown ring */}
        <div className="relative h-14 w-14 shrink-0">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
            <circle cx="18" cy="18" r="16" stroke="hsl(var(--border))" strokeWidth="3" fill="none" />
            <motion.circle
              cx="18" cy="18" r="16"
              stroke={expired ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
              strokeWidth="3" fill="none" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 16}
              animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - pct) }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
            {Math.ceil(remaining)}s
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-bold text-sm truncate">{customerName}</div>
            {distKm != null && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-brand-soft text-primary">
                {distKm.toFixed(1)} km
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <MapPin size={11} className="shrink-0" /> {order.pickup_address ?? "No address"}
          </div>
          <div className="text-xs mt-1 line-clamp-2">{services}</div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
            {order.estimated_weight_kg && <span>~{order.estimated_weight_kg} kg</span>}
            {order.pickup_date && <span className="inline-flex items-center gap-1"><Clock size={10} /> {order.pickup_date}</span>}
          </div>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          {photos.slice(0, 4).map((src, i) => (
            <img key={i} src={src} alt="" className="h-14 w-14 rounded-lg object-cover border border-border shrink-0" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 p-3 border-t border-border bg-muted/30">
        <button
          onClick={onSkip}
          className="h-11 rounded-xl border border-border bg-card font-semibold text-sm flex items-center justify-center gap-1.5"
        >
          <X size={14} /> Skip
        </button>
        <button
          onClick={onBid}
          disabled={expired}
          className="h-11 rounded-xl bg-gradient-brand text-primary-foreground font-bold text-sm shadow-brand flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          <Banknote size={14} /> {expired ? "Expired" : "Bid"}
        </button>
      </div>
    </motion.div>
  );
}

function BidSheet({
  order,
  merchantId,
  onClose,
}: {
  order: any | null;
  merchantId: string | undefined;
  onClose: () => void;
}) {
  const submit = useSubmitBid();
  const suggested = order?.estimated_weight_kg ? Math.round(0.6 * Number(order.estimated_weight_kg) * 25) : 25;
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (order) {
      setAmount(String(suggested));
      setMessage("");
    }
  }, [order, suggested]);

  const validate = () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n < 5 || n > 500) {
      toast.error("Amount must be a whole ₵ value between ₵5 and ₵500.");
      return null;
    }
    return Math.round(n);
  };

  const send = () => {
    if (!order || !merchantId) return;
    const n = validate();
    if (n == null) return;
    submit.mutate(
      { orderId: order.id, merchantId, amount: n, message: message.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Bid submitted — good luck!");
          onClose();
        },
        onError: (e: any) => toast.error(e.message ?? "Couldn't submit bid"),
      }
    );
  };

  return (
    <Sheet open={!!order} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl px-5 pt-6 pb-8 max-w-md mx-auto">
        <SheetHeader className="text-left">
          <SheetTitle>Submit your bid</SheetTitle>
          <SheetDescription>
            Total price in ₵ for the whole basket. Customer picks the bid they like best.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">₵</span>
              <Input
                type="number"
                inputMode="numeric"
                min={5}
                max={500}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 text-2xl font-bold pl-8 rounded-xl"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Suggested: ₵{suggested} (≈₵25 / kg) · range ₵5–₵500
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message (optional)</label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Free fabric softener · ready in 24h"
              className="h-12 rounded-xl"
              maxLength={120}
            />
          </div>
        </div>

        <SheetFooter className="mt-6 flex-col gap-2">
          <Button
            onClick={send}
            disabled={submit.isPending}
            className="w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground border-0 shadow-brand text-base font-semibold"
          >
            {submit.isPending ? <Loader2 className="animate-spin" /> : "Submit bid"}
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full h-12 rounded-xl">
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
