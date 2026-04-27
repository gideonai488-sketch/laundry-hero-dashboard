import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Banknote, Loader2, Wallet, TrendingUp, Calendar } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { useMyOrders } from "@/lib/queries";

export const Route = createFileRoute("/app/earnings")({
  head: () => ({ meta: [{ title: "Wallet — Highest Wash Merchant" }] }),
  component: WalletPage,
});

const fmt = (n: number) => `₵${n.toFixed(2)}`;

function WalletPage() {
  const { merchant } = useAuth();
  const { data: orders = [], isLoading } = useMyOrders(merchant?.id);

  const paid = useMemo(
    () => orders.filter((o: any) => o.payment_status === "paid" && o.delivered_at),
    [orders]
  );

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

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

  const trend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? "+∞" : "—";
    const pct = ((curr - prev) / prev) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(0)}%`;
  };

  const recent = paid
    .slice()
    .sort((a: any, b: any) => new Date(b.delivered_at).getTime() - new Date(a.delivered_at).getTime())
    .slice(0, 30);

  const hasPayouts = !!merchant?.paystack_subaccount_code;

  return (
    <div>
      <AppHeader title="Wallet" subtitle="Earnings & payouts" />

      {/* Tiles */}
      <section className="px-5 mt-2 grid grid-cols-3 gap-2">
        <Tile icon={<Calendar size={14} />} label="This week" value={fmt(weekTotal)} />
        <Tile icon={<TrendingUp size={14} />} label="This month" value={fmt(monthTotal)} />
        <Tile icon={<Wallet size={14} />} label="Lifetime" value={fmt(lifetimeTotal)} />
      </section>

      {/* Payouts setup banner */}
      {!hasPayouts && (
        <section className="px-5 mt-5">
          <div className="rounded-2xl bg-gradient-brand text-primary-foreground p-4 shadow-brand">
            <div className="flex items-center gap-2">
              <Banknote size={18} />
              <div className="font-bold">Set up payouts</div>
            </div>
            <p className="text-xs text-white/85 mt-1">
              Add your bank to start receiving Paystack settlements ~24 h after each delivery.
            </p>
            <a href="/app/settings" className="inline-block mt-3 px-3 h-9 rounded-xl bg-white text-primary font-bold text-xs leading-9">
              Open Settings
            </a>
          </div>
        </section>
      )}

      {hasPayouts && (
        <section className="px-5 mt-5">
          <div className="rounded-2xl bg-card border border-border p-4 text-xs text-muted-foreground">
            Paystack settles to your bank ~24 h after the customer confirms delivery.
            Subaccount: <span className="font-mono text-foreground">{merchant?.paystack_subaccount_code}</span>
          </div>
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
          {recent.map((o: any) => (
            <li key={o.id} className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-card">
              <div className="h-10 w-10 rounded-xl bg-gradient-brand-soft text-primary flex items-center justify-center">
                <Banknote size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">
                  {o.customer?.full_name ?? "Customer"} · #{String(o.id).slice(0, 6)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(o.delivered_at).toLocaleDateString()} · {o.service_name ?? "Laundry"}
                </div>
              </div>
              <div className="text-base font-bold">{fmt(Number(o.subtotal ?? 0))}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border shadow-card p-3 text-center">
      <div className="text-muted-foreground flex items-center justify-center">{icon}</div>
      <div className="text-base font-bold mt-1">{value}</div>
      <div className="text-[10px] text-muted-foreground leading-none mt-0.5">{label}</div>
    </div>
  );
}
