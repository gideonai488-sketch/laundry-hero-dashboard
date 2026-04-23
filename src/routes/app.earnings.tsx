import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { AIInsights } from "@/components/AIInsights";
import { revenueData, monthlyData, serviceShare, payouts } from "@/lib/mock-data";
import { useLocale } from "@/lib/locale";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/earnings")({
  head: () => ({ meta: [{ title: "Earnings — Highest Wash Merchant" }] }),
  component: EarningsPage,
});

const ranges = ["7D", "30D", "6M", "1Y"] as const;

function EarningsPage() {
  const [range, setRange] = useState<(typeof ranges)[number]>("7D");

  return (
    <div>
      <AppHeader title="Earnings" subtitle="Track every dollar" />

      {/* Hero card */}
      <section className="px-5">
        <div className="rounded-3xl bg-gradient-hero text-primary-foreground p-5 shadow-brand">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Available balance</div>
          <div className="text-4xl font-bold mt-1">{formatGHS(2420)}</div>
          <div className="flex items-center gap-1 text-sm text-white/85 mt-1">
            <ArrowUpRight size={14} /> +12.4% this month
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/app/payouts" className="flex-1 bg-white text-primary font-semibold text-sm py-2.5 rounded-xl text-center">
              Withdraw
            </Link>
            <Link to="/app/bank" className="flex-1 bg-white/15 backdrop-blur border border-white/20 text-white font-semibold text-sm py-2.5 rounded-xl text-center">
              Payout accounts
            </Link>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="px-5 mt-5 grid grid-cols-2 gap-3">
        {[
          { label: "Today", v: formatGHS(340), c: "+18%", up: true },
          { label: "This week", v: formatGHS(1820), c: "+12%", up: true },
          { label: "Avg order", v: formatGHS(28), c: "+4%", up: true },
          { label: "Refunds", v: formatGHS(34), c: "-2%", up: false },
        ].map((k) => (
          <div key={k.label} className="bg-card rounded-2xl border border-border shadow-card p-4">
            <div className="text-xs text-muted-foreground font-medium">{k.label}</div>
            <div className="text-xl font-bold mt-1">{k.v}</div>
            <div className={`text-xs font-semibold mt-1 flex items-center gap-0.5 ${k.up ? "text-success" : "text-destructive"}`}>
              {k.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {k.c}
            </div>
          </div>
        ))}
      </section>

      {/* Range tabs + chart */}
      <section className="px-5 mt-5">
        <div className="bg-card rounded-3xl border border-border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Revenue</h3>
            <div className="flex gap-1 bg-muted p-1 rounded-full">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full transition-smooth ${
                    range === r ? "bg-card shadow-soft text-primary" : "text-muted-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-56 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={range === "6M" ? monthlyData : revenueData}>
                <defs>
                  <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--primary-glow)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey={range === "6M" ? "month" : "day"} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  cursor={{ fill: "var(--accent)" }}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [formatGHS(v), "Revenue"]}
                />
                <Bar dataKey="revenue" fill="url(#bar)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* AI insights */}
      <AIInsights />

      {/* Service split */}
      <section className="px-5 mt-5">
        <div className="bg-card rounded-3xl border border-border shadow-card p-5">
          <h3 className="font-bold mb-1">Revenue by service</h3>
          <p className="text-xs text-muted-foreground mb-3">Where your money is coming from</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={serviceShare} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {serviceShare.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Recent payouts */}
      <section className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Recent payouts</h3>
          <Link to="/app/payouts" className="text-xs font-semibold text-primary">All</Link>
        </div>
        <div className="space-y-2">
          {payouts.slice(0, 3).map((p) => (
            <div key={p.id} className="bg-card rounded-2xl border border-border shadow-card p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/15 text-success flex items-center justify-center">
                <Wallet size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{p.method}</div>
                <div className="text-xs text-muted-foreground">{p.date}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">{formatGHS(p.amount)}</div>
                <div className="text-[10px] text-success font-semibold uppercase">{p.status}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
