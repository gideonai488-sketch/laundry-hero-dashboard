import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Loader2,
  Wallet,
  TrendingUp,
  Calendar,
  ArrowDownToLine,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { LinkBankSheet } from "@/components/LinkBankSheet";
import { LinkedBankCard, type BankInfo } from "@/components/LinkedBankCard";
import { useAuth } from "@/lib/auth";
import { useMyOrders, usePayouts, useRequestPayout } from "@/lib/queries";

export const Route = createFileRoute("/app/earnings")({
  head: () => ({ meta: [{ title: "Wallet — Highest Wash Merchant" }] }),
  component: WalletPage,
});

// ─── Currency helpers ────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  GHS: "₵",
  NGN: "₦",
  KES: "KSh ",
  ZAR: "R",
  USD: "$",
  GBP: "£",
  EUR: "€",
};

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  GH: "GHS",
  NG: "NGN",
  KE: "KES",
  ZA: "ZAR",
  US: "USD",
  GB: "GBP",
};

function currencyFromCountry(countryCode?: string | null): string {
  if (!countryCode) return "GHS";
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? "GHS";
}

function fmtMoney(amount: number, currency?: string | null): string {
  const cur = currency ?? "GHS";
  const sym = CURRENCY_SYMBOLS[cur] ?? `${cur} `;
  return `${sym}${amount.toFixed(2)}`;
}

function trend(curr: number, prev: number): string {
  if (prev === 0) return curr > 0 ? "+∞%" : "—";
  const pct = ((curr - prev) / prev) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
}

// ─── Component ───────────────────────────────────────────────────────────────

function WalletPage() {
  const { merchant, refresh } = useAuth();
  const { data: orders = [], isLoading } = useMyOrders(merchant?.id);
  const { data: payouts = [] } = usePayouts(merchant?.id);
  const requestPayout = useRequestPayout();
  const [linkOpen, setLinkOpen] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [requestingPayout, setRequestingPayout] = useState(false);

  const merchantCurrency = currencyFromCountry(merchant?.country_code);

  const readBankInfo = () => {
    if (!merchant?.id) return;
    try {
      const raw = localStorage.getItem(`hw-merchant-bank:${merchant.id}`);
      setBankInfo(raw ? JSON.parse(raw) : null);
    } catch {
      setBankInfo(null);
    }
  };

  useEffect(() => {
    readBankInfo();
  }, [merchant?.id, linkOpen]);

  // Only count orders that are paid AND delivered as earned
  const paid = useMemo(
    () => orders.filter((o: any) => o.payment_status === "paid" && o.delivered_at),
    [orders]
  );

  // Pending: delivered but payment not yet confirmed
  const pendingPayment = useMemo(
    () => orders.filter((o: any) => o.delivered_at && o.payment_status !== "paid"),
    [orders]
  );

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Sum merchant's portion (subtotal = service charge, excludes delivery_fee which goes to rider)
  const sumBetween = (from: Date, to?: Date) =>
    paid
      .filter((o: any) => {
        const d = new Date(o.delivered_at);
        return d >= from && (!to || d < to);
      })
      .reduce((s: number, o: any) => s + Number(o.subtotal ?? 0), 0);

  const todayTotal = sumBetween(startOfToday);
  const yesterdayTotal = sumBetween(startOfYesterday, startOfToday);
  const weekTotal = sumBetween(startOfWeek);
  const lastWeekTotal = sumBetween(startOfLastWeek, startOfWeek);
  const monthTotal = sumBetween(startOfMonth);
  const lastMonthTotal = sumBetween(startOfLastMonth, startOfMonth);
  const lifetimeTotal = paid.reduce((s: number, o: any) => s + Number(o.subtotal ?? 0), 0);
  const ordersDelivered = paid.length;
  const avgOrder = ordersDelivered > 0 ? lifetimeTotal / ordersDelivered : 0;

  // Pending earnings (delivered, awaiting payment confirmation)
  const pendingTotal = pendingPayment.reduce(
    (s: number, o: any) => s + Number(o.subtotal ?? 0),
    0
  );

  // Total paid out so far
  const totalPaidOut = payouts
    .filter((p: any) => p.status === "settled" || p.status === "paid")
    .reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);

  const recent = paid
    .slice()
    .sort(
      (a: any, b: any) =>
        new Date(b.delivered_at).getTime() - new Date(a.delivered_at).getTime()
    )
    .slice(0, 30);

  const hasPayouts = !!merchant?.paystack_subaccount_code || !!bankInfo;

  const handleRequestPayout = async () => {
    if (!merchant?.id || lifetimeTotal <= 0) return;
    setRequestingPayout(true);
    requestPayout.mutate(
      { merchantId: merchant.id, amount: lifetimeTotal - totalPaidOut, currency: merchantCurrency },
      {
        onSuccess: () => {
          toast.success("Payout requested — you'll receive it within 24 hours.");
          setRequestingPayout(false);
        },
        onError: (err: any) => {
          toast.error(err.message ?? "Couldn't request payout. Try again.");
          setRequestingPayout(false);
        },
      }
    );
  };

  return (
    <div>
      <AppHeader title="Wallet" subtitle="Earnings & payouts" />

      {/* Hero — this month */}
      <section className="px-5 mt-2">
        <div className="rounded-3xl bg-gradient-brand text-primary-foreground p-5 shadow-brand">
          <div className="text-xs font-semibold opacity-90">This month</div>
          <div className="mt-1 text-3xl font-extrabold tracking-tight">
            {fmtMoney(monthTotal, merchantCurrency)}
          </div>
          <div className="mt-2 text-[11px] opacity-90 flex items-center gap-3">
            <span>{trend(monthTotal, lastMonthTotal)} vs last month</span>
            <span>·</span>
            <span>{ordersDelivered} orders delivered</span>
          </div>
          {pendingTotal > 0 && (
            <div className="mt-2 px-2.5 py-1 bg-white/20 rounded-xl text-[11px] inline-flex items-center gap-1.5">
              <Clock size={11} />
              {fmtMoney(pendingTotal, merchantCurrency)} pending payment confirmation
            </div>
          )}
        </div>
      </section>

      {/* Period tiles */}
      <section className="px-5 mt-3 grid grid-cols-2 gap-2">
        <Tile
          icon={<Calendar size={14} />}
          label="Today"
          value={fmtMoney(todayTotal, merchantCurrency)}
          sub={`${trend(todayTotal, yesterdayTotal)} vs yesterday`}
        />
        <Tile
          icon={<Calendar size={14} />}
          label="Yesterday"
          value={fmtMoney(yesterdayTotal, merchantCurrency)}
        />
        <Tile
          icon={<TrendingUp size={14} />}
          label="This week"
          value={fmtMoney(weekTotal, merchantCurrency)}
          sub={`${trend(weekTotal, lastWeekTotal)} vs last week`}
        />
        <Tile
          icon={<Wallet size={14} />}
          label="Avg / order"
          value={fmtMoney(avgOrder, merchantCurrency)}
          sub={`${ordersDelivered} delivered · ${fmtMoney(lifetimeTotal, merchantCurrency)} lifetime`}
        />
      </section>

      {/* Payout account */}
      <section className="px-5 mt-5">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Payout account
        </div>
        {!hasPayouts ? (
          <div className="rounded-2xl bg-gradient-brand text-primary-foreground p-4 shadow-brand">
            <div className="flex items-center gap-2">
              <Banknote size={18} />
              <div className="font-bold">Set up payouts</div>
            </div>
            <p className="text-xs text-white/85 mt-1">
              Add your bank to receive Paystack settlements ~24 h after each delivery.
              Your earnings ({fmtMoney(lifetimeTotal, merchantCurrency)} lifetime) are
              waiting.
            </p>
            <button
              onClick={() => setLinkOpen(true)}
              className="inline-block mt-3 px-3 h-9 rounded-xl bg-white text-primary font-bold text-xs leading-9"
            >
              Link bank account
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <LinkedBankCard
              bankInfo={bankInfo}
              subaccountCode={merchant?.paystack_subaccount_code}
              onChangeBank={() => setLinkOpen(true)}
            />
            {/* Request payout */}
            {lifetimeTotal - totalPaidOut > 0 && (
              <button
                onClick={handleRequestPayout}
                disabled={requestingPayout || requestPayout.isPending}
                className="w-full h-12 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-brand disabled:opacity-50"
              >
                {requestingPayout || requestPayout.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    <ArrowDownToLine size={16} />
                    Request payout · {fmtMoney(lifetimeTotal - totalPaidOut, merchantCurrency)}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Payout history */}
      {payouts.length > 0 && (
        <section className="px-5 mt-6">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Payout history
          </div>
          <ul className="space-y-2">
            {payouts.map((p: any) => {
              const settled = p.status === "settled" || p.status === "paid";
              const failed = p.status === "failed";
              return (
                <li
                  key={p.id}
                  className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-card"
                >
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      settled
                        ? "bg-success/15 text-success"
                        : failed
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {settled ? (
                      <CheckCircle2 size={16} />
                    ) : failed ? (
                      <XCircle size={16} />
                    ) : (
                      <Clock size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold capitalize">
                      {p.status ?? "pending"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="text-base font-bold">
                    {fmtMoney(Number(p.amount ?? 0), p.currency ?? merchantCurrency)}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Recent paid orders */}
      <section className="px-5 mt-6">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Recent paid orders
        </div>
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="animate-spin mx-auto" size={20} />
          </div>
        )}
        {!isLoading && recent.length === 0 && (
          <div className="text-center py-10 text-muted-foreground rounded-2xl border border-dashed border-border text-sm">
            No paid orders yet.
          </div>
        )}
        <ul className="space-y-2">
          {recent.map((o: any) => {
            const orderCurrency = o.currency ?? merchantCurrency;
            const earned = Number(o.subtotal ?? 0);
            const deliveryFee = Number(o.delivery_fee ?? 0);
            return (
              <li
                key={o.id}
                className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-card"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-brand-soft text-primary flex items-center justify-center shrink-0">
                  <Banknote size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {o.customer?.full_name ?? "Customer"} · #{String(o.id).slice(0, 6)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(o.delivered_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {o.service_name ?? "Laundry"}
                    {deliveryFee > 0 && (
                      <span className="ml-1 opacity-60">
                        · +{fmtMoney(deliveryFee, orderCurrency)} rider fee
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold">{fmtMoney(earned, orderCurrency)}</div>
                  {o.customer_currency && o.customer_currency !== orderCurrency && (
                    <div className="text-[10px] text-muted-foreground">
                      Customer paid {fmtMoney(Number(o.customer_amount ?? 0), o.customer_currency)}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Pending payment orders */}
      {pendingPayment.length > 0 && (
        <section className="px-5 mt-4 mb-6">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Awaiting payment confirmation
          </div>
          <ul className="space-y-2">
            {pendingPayment.map((o: any) => (
              <li
                key={o.id}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {o.customer?.full_name ?? "Customer"} · #{String(o.id).slice(0, 6)}
                  </div>
                  <div className="text-[11px] text-amber-600">
                    Delivered · payment {o.payment_status ?? "pending"}
                  </div>
                </div>
                <div className="text-base font-bold text-amber-700">
                  {fmtMoney(Number(o.subtotal ?? 0), o.currency ?? merchantCurrency)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="h-6" />

      <LinkBankSheet
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        onLinked={() => {
          readBankInfo();
          refresh();
        }}
      />
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border shadow-card p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
        {icon} {label}
      </div>
      <div className="text-lg font-bold mt-1">{value}</div>
      {sub && (
        <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{sub}</div>
      )}
    </div>
  );
}
