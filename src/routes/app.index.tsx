import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  MapPin,
  Navigation2,
  PackageOpen,
  Power,
  Radio,
  Scale,
  StickyNote,
  Sparkles,
  Trophy,
  User,
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
import { useLocale } from "@/lib/locale";
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

          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell variant="onHero" />
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

const COUNTDOWN_SECONDS = 6 * 60 * 60; // 6 hours

function formatCountdown(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

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
  const createdMs = new Date(order.created_at).getTime();
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = (now - createdMs) / 1000;
  const remaining = Math.max(0, COUNTDOWN_SECONDS - elapsed);
  const pct = remaining / COUNTDOWN_SECONDS;
  const expired = remaining <= 0;
  const urgentSoon = remaining < 1800; // last 30 min turns amber

  const distKm = haversineKm(myLat, myLng, order.pickup_lat, order.pickup_lng);
  const customerName = order.customer?.full_name ?? "New customer";
  const customerInitials = customerName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const photos = (order.photo_urls as string[] | null) ?? [];
  const items = (order.items as any[]) ?? [];
  const suggestedPrice = order.estimated_weight_kg
    ? Math.round(Number(order.estimated_weight_kg) * 25)
    : null;

  const ringColor = expired
    ? "hsl(var(--destructive))"
    : urgentSoon
    ? "#f59e0b"
    : "hsl(var(--primary))";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="bg-card rounded-3xl border border-border shadow-card overflow-hidden"
    >
      {/* ── Header strip ── */}
      <div className="bg-gradient-hero px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {order.service_name && (
            <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white mb-1.5">
              {order.service_name}
            </span>
          )}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/25 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {customerInitials || <User size={14} />}
            </div>
            <div className="min-w-0">
              <div className="text-white font-bold text-sm truncate">{customerName}</div>
              {distKm != null && (
                <div className="text-white/75 text-[10px] flex items-center gap-0.5">
                  <Navigation2 size={9} /> {distKm.toFixed(1)} km away
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Countdown ring */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <div className="relative h-14 w-14">
            <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90 w-full h-full">
              <circle cx="18" cy="18" r="15" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
              <motion.circle
                cx="18" cy="18" r="15"
                stroke={expired ? "#ef4444" : urgentSoon ? "#f59e0b" : "white"}
                strokeWidth="3" fill="none" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 15}
                animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - pct) }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Clock size={10} className="text-white/80" />
              <span className="text-white text-[9px] font-bold leading-tight">
                {expired ? "Done" : formatCountdown(remaining)}
              </span>
            </div>
          </div>
          <span className={`text-[8px] font-bold uppercase ${expired ? "text-red-300" : "text-white/60"}`}>
            {expired ? "expired" : "open"}
          </span>
        </div>
      </div>

      {/* ── Addresses ── */}
      <div className="px-4 pt-3 space-y-1.5">
        <div className="flex items-start gap-2 text-xs">
          <div className="mt-0.5 h-4 w-4 rounded-full bg-success/15 flex items-center justify-center shrink-0">
            <div className="h-1.5 w-1.5 rounded-full bg-success" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Pickup</div>
            <div className="font-medium text-foreground truncate">{order.pickup_address ?? "Address not set"}</div>
          </div>
        </div>
        {order.delivery_address && (
          <>
            <div className="ml-[7px] h-4 w-px bg-border" />
            <div className="flex items-start gap-2 text-xs">
              <div className="mt-0.5 h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin size={9} className="text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Delivery</div>
                <div className="font-medium text-foreground truncate">{order.delivery_address}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Items ── */}
      <div className="px-4 pt-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
          Items
        </div>
        {items.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {items.map((item: any, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-muted border border-border font-semibold"
              >
                {item.qty && Number(item.qty) > 1 && (
                  <span className="bg-primary/15 text-primary rounded-full px-1 text-[9px] font-black">
                    {item.qty}×
                  </span>
                )}
                {item.description}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic">
            {order.service_name ?? "Laundry order"}
          </div>
        )}
      </div>

      {/* ── Order details row ── */}
      <div className="px-4 pt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {order.pickup_date && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays size={12} className="text-primary shrink-0" />
            <span className="font-medium">{order.pickup_date}</span>
          </div>
        )}
        {order.pickup_time_slot && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={12} className="text-primary shrink-0" />
            <span className="font-medium">{order.pickup_time_slot}</span>
          </div>
        )}
        {order.estimated_weight_kg && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Scale size={12} className="text-primary shrink-0" />
            <span className="font-medium">~{order.estimated_weight_kg} kg</span>
          </div>
        )}
      </div>

      {/* ── Notes ── */}
      {order.notes && (
        <div className="mx-4 mt-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl px-3 py-2">
          <StickyNote size={13} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium line-clamp-2">{order.notes}</p>
        </div>
      )}

      {/* ── Photos ── */}
      {photos.length > 0 && (
        <div className="px-4 pt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.slice(0, 6).map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="h-16 w-16 rounded-xl object-cover border border-border shrink-0"
            />
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="p-4 mt-2 border-t border-border bg-muted/20">
        {suggestedPrice && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-muted-foreground">Suggested bid</span>
            <span className="text-sm font-black text-foreground">
              ≈ {order.currency ?? "GHS"} {suggestedPrice}
              <span className="text-[10px] font-normal text-muted-foreground ml-1">(₵25/kg)</span>
            </span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onSkip}
            className="h-12 rounded-2xl border-2 border-border bg-card font-bold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <X size={15} /> Pass
          </button>
          <button
            onClick={onBid}
            disabled={expired}
            className="h-12 rounded-2xl bg-gradient-brand text-primary-foreground font-black text-sm shadow-brand flex items-center justify-center gap-1.5 disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Banknote size={15} /> {expired ? "Expired" : "Place bid"}
          </button>
        </div>
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
  const { currency: localCurrency } = useLocale();
  const suggested = order?.estimated_weight_kg ? Math.round(0.6 * Number(order.estimated_weight_kg) * 25) : 25;
  const [amount, setAmount] = useState("");
  const [etaMinutes, setEtaMinutes] = useState("60");
  const [currency, setCurrency] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (order) {
      setAmount(String(suggested));
      setEtaMinutes("60");
      setCurrency(order.currency ?? localCurrency.code);
      setMessage("");
    }
  }, [order, suggested, localCurrency.code]);

  const validate = () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Enter a valid bid amount.");
      return null;
    }
    const eta = Number(etaMinutes);
    if (!Number.isFinite(eta) || eta < 10 || eta > 10080) {
      toast.error("ETA must be between 10 and 10080 minutes.");
      return null;
    }
    return { amount: Math.round(n), etaMinutes: Math.round(eta) };
  };

  const send = () => {
    if (!order || !merchantId) return;
    const vals = validate();
    if (!vals) return;
    submit.mutate(
      {
        orderId: order.id,
        amount: vals.amount,
        currency: currency || localCurrency.code,
        etaMinutes: vals.etaMinutes,
        message: message.trim() || undefined,
      },
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
            Set your price, currency and turnaround time. The customer picks the best offer.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your price</label>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 text-2xl font-bold rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Currency</label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="GHS"
                className="h-14 text-lg font-bold rounded-xl text-center"
                maxLength={3}
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground -mt-2">
            Suggested: {suggested} (≈25 / kg)
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              ETA (minutes)
            </label>
            <Input
              type="number"
              inputMode="numeric"
              min={10}
              max={10080}
              step={10}
              value={etaMinutes}
              onChange={(e) => setEtaMinutes(e.target.value)}
              placeholder="60"
              className="h-12 rounded-xl"
            />
            <p className="text-[11px] text-muted-foreground">How long until the order is ready? (e.g. 60 = 1 hour)</p>
          </div>

          <div className="space-y-1.5">
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
