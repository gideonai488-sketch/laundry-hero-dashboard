import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { AIInsights } from "@/components/AIInsights";
import { useAuth } from "@/lib/auth";
import { useOrders, usePayouts } from "@/lib/queries";
import { useLocale } from "@/lib/locale";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, Loader2, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/app/earnings")({
  head: () => ({ meta: [{ title: "Earnings — Highest Wash Merchant" }] }),
  component: EarningsPage,
});

const ranges = ["7D", "30D", "6M", "1Y"] as const;

function bucketize(orders: { created_at: string; amount_usd: number | null; status: string }[], range: typeof ranges[number]) {
  const now = new Date();
  const days = range === "7D" ? 7 : range === "30D" ? 30 : range === "6M" ? 180 : 365;
  const labels = range === "6M" || range === "1Y";
  const bucketCount = range === "7D" ? 7 : range === "30D" ? 30 : range === "6M" ? 6 : 12;
  const bucketDays = days / bucketCount;
  const buckets: { day: string; revenue: number }[] = [];
  for (let i = bucketCount - 1; i >= 0; i--) {
    const start = new Date(now.getTime() - (i + 1) * bucketDays * 86400000);
    const end = new Date(now.getTime() - i * bucketDays * 86400000);
    const revenue = orders
      .filter((o) => o.status === "delivered" && new Date(o.created_at) >= start && new Date(o.created_at) < end)
      .reduce((s, o) => s + Number(o.amount_usd ?? 0), 0);
    buckets.push({
      day: labels
        ? start.toLocaleDateString(undefined, { month: "short" })
        : start.toLocaleDateString(undefined, { weekday: "short" }),
      revenue: Math.round(revenue * 100) / 100,
    });
  }
  return buckets;
}

function EarningsPage() {
  const { merchant, user } = useAuth();
  const { format } = useLocale();
  const [range, setRange] = useState<(typeof ranges)[number]>("7D");
  const { data: orders = [], isLoading } = useOrders(merchant?.id);
  const { data: payouts = [] } = usePayouts(user?.id);

  const data = useMemo(() => bucketize(orders, range), [orders, range]);

  const today = new Date().toDateString();
  const weekStart = new Date(Date.now() - 7 * 86400000);
  const todayRev = orders.filter((o) => o.status === "delivered" && new Date(o.created_at).toDateString() === today).reduce((s, o) => s + Number(o.amount_usd ?? 0), 0);
  const weekRev = orders.filter((o) => o.status === "delivered" && new Date(o.created_at) >= weekStart).reduce((s, o) => s + Number(o.amount_usd ?? 0), 0);
  const delivered = orders.filter((o) => o.status === "delivered");
  const avgOrder = delivered.length ? delivered.reduce((s, o) => s + Number(o.amount_usd ?? 0), 0) / delivered.length : 0;
  const refunds = orders.filter((o) => o.status === "cancelled").reduce((s, o) => s + Number(o.amount_usd ?? 0), 0);
  const available = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount_usd ?? 0), 0);

  return (
    <div>
      <AppHeader title="Earnings" subtitle="Track every dollar" />

      <section className="px-5">
        <div className="rounded-3xl bg-gradient-hero text-primary-foreground p-5 shadow-brand">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Available balance</div>
          <div className="text-4xl font-bold mt-1">{format(available)}</div>
          <div className="flex items-center gap-1 text-sm text-white/85 mt-1">
            <ArrowUpRight size={14} /> {delivered.length} orders delivered
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/app/payouts" className="flex-1 bg-white text-primary font-semibold text-sm py-2.5 rounded-xl text-center">Withdraw</Link>
            <Link to="/app/bank" className="flex-1 bg-white/15 backdrop-blur border border-white/20 text-white font-semibold text-sm py-2.5 rounded-xl text-center">Payout accounts</Link>
          </div>
        </div>
      </section>

      <section className="px-5 mt-5 grid grid-cols-2 gap-3">
        {[
          { label: "Today", v: format(todayRev), c: "", up: true },
          { label: "This week", v: format(weekRev), c: "", up: true },
          { label: "Avg order", v: format(avgOrder), c: "", up: true },
          { label: "Refunds", v: format(refunds), c: "", up: false },
        ].map((k) => (
          <div key={k.label} className="bg-card rounded-2xl border border-border shadow-card p-4">
            <div className="text-xs text-muted-foreground font-medium">{k.label}</div>
            <div className="text-xl font-bold mt-1">{k.v}</div>
            {k.c && (
              <div className={`text-xs font-semibold mt-1 flex items-center gap-0.5 ${k.up ? "text-success" : "text-destructive"}`}>
                {k.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {k.c}
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="px-5 mt-5">
        <div className="bg-card rounded-3xl border border-border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Revenue</h3>
            <div className="flex gap-1 bg-muted p-1 rounded-full">
              {ranges.map((r) => (
                <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 text-[11px] font-bold rounded-full transition-smooth ${range === r ? "bg-card shadow-soft text-primary" : "text-muted-foreground"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-56 -mx-2">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <defs>
                    <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--primary-glow)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={40} />
                  <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [format(v), "Revenue"]} />
                  <Bar dataKey="revenue" fill="url(#bar)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <AIInsights />

      <section className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Recent payouts</h3>
          <Link to="/app/payouts" className="text-xs font-semibold text-primary">All</Link>
        </div>
        <div className="space-y-2">
          {payouts.length === 0 && <div className="text-center py-6 text-muted-foreground text-sm bg-card border border-border rounded-2xl">No payouts yet.</div>}
          {payouts.slice(0, 3).map((p) => (
            <div key={p.id} className="bg-card rounded-2xl border border-border shadow-card p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/15 text-success flex items-center justify-center"><Wallet size={18} /></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{p.reference ?? p.id.slice(0, 8)}</div>
                <div className="text-xs text-muted-foreground">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">{format(Number(p.amount_usd ?? 0))}</div>
                <div className="text-[10px] text-success font-semibold uppercase">{p.status}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
