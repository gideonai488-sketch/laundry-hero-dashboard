import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { AIDispatchPanel } from "@/components/AIDispatchPanel";
import { AIInsights } from "@/components/AIInsights";
import { orders, revenueData, statusMeta } from "@/lib/mock-data";
import { useLocale } from "@/lib/locale";
import { ArrowUpRight, Award, BarChart3, Banknote, Bike, Bot, Calendar, ClipboardList, History, Package, Power, Shield, Sparkles, Star, Truck, Users, Wallet, Zap } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useState } from "react";

export const Route = createFileRoute("/app/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { format: formatGHS, t } = useLocale();
  const [online, setOnline] = useState(true);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const activeOrders = orders.filter((o) => ["accepted", "pickup", "washing", "ready"].includes(o.status));

  return (
    <div>
      <AppHeader showLocation />

      {/* Online toggle hero */}
      <section className="px-5">
        <div className="rounded-3xl bg-gradient-hero text-primary-foreground p-5 shadow-brand relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Today's earnings</div>
              <div className="text-3xl font-bold mt-1">{formatGHS(340)}</div>
              <div className="flex items-center gap-1 text-xs text-white/85 mt-1">
                <ArrowUpRight size={12} /> +18% vs yesterday
              </div>
            </div>
            <button
              onClick={() => setOnline((v) => !v)}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl backdrop-blur border ${
                online ? "bg-success/20 border-success/40" : "bg-white/10 border-white/20"
              }`}
              aria-label="Toggle availability"
            >
              <Power size={20} />
              <span className="text-[10px] font-bold uppercase">{online ? "Online" : "Offline"}</span>
            </button>
          </div>
          <div className="relative grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Pending", value: pendingCount },
              { label: "Active", value: activeOrders.length },
              { label: "Done today", value: 8 },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/15">
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-[10px] text-white/70 font-medium uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="px-5 mt-6">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: ClipboardList, label: "Orders", to: "/app/orders" as const, badge: pendingCount },
            { icon: BarChart3, label: "Earnings", to: "/app/earnings" as const },
            { icon: Wallet, label: "Payouts", to: "/app/payouts" as const },
            { icon: Users, label: "Staff", to: "/app/staff" as const },
          ].map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-card border border-border shadow-card hover:bg-accent transition-smooth relative"
            >
              {a.badge ? (
                <span className="absolute top-1.5 right-1.5 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {a.badge}
                </span>
              ) : null}
              <div className="h-10 w-10 rounded-xl bg-gradient-brand-soft flex items-center justify-center">
                <a.icon size={18} className="text-primary" />
              </div>
              <span className="text-[11px] font-semibold">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Dispatch */}
      <AIDispatchPanel />

      {/* Revenue mini chart */}
      <section className="px-5 mt-6">
        <div className="bg-card rounded-3xl border border-border shadow-card p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">This week</div>
              <div className="text-2xl font-bold mt-0.5">{formatGHS(1820)}</div>
            </div>
            <Link to="/app/earnings" className="text-xs font-semibold text-primary flex items-center gap-1">
              Details <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="h-32 -mx-2 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatGHS(v), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* AI command center */}
      <section className="px-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-lg bg-gradient-brand text-primary-foreground flex items-center justify-center">
            <Bot size={14} />
          </div>
          <h2 className="text-lg font-bold">AI command center</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Sparkles, label: "AI pricing", to: "/app/ai-pricing" as const, tone: "from-primary/20 to-primary/5" },
            { icon: Shield, label: "AI guard", to: "/app/ai-guard" as const, tone: "from-destructive/20 to-destructive/5" },
            { icon: Award, label: "Scorecard", to: "/app/scorecard" as const, tone: "from-success/20 to-success/5" },
            { icon: Calendar, label: "Schedule", to: "/app/scheduling" as const, tone: "from-warning/20 to-warning/5" },
            { icon: Package, label: "Supplies", to: "/app/supplies" as const, tone: "from-accent to-accent/30" },
            { icon: History, label: "Voice log", to: "/app/voice-history" as const, tone: "from-primary/15 to-primary/5" },
          ].map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-gradient-to-br ${a.tone} border border-border hover:scale-[1.02] transition-smooth`}
            >
              <a.icon size={18} className="text-foreground" />
              <span className="text-[11px] font-semibold text-center">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI insights */}
      <AIInsights limit={2} />

      {/* Live activity */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Live activity</h2>
          <Link to="/app/orders" className="text-xs font-semibold text-primary">See all</Link>
        </div>
        <div className="space-y-2">
          {activeOrders.slice(0, 3).map((o) => {
            const meta = statusMeta[o.status];
            return (
              <Link
                key={o.id}
                to="/app/orders"
                className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border shadow-card hover:bg-accent transition-smooth"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-brand-soft text-primary font-bold flex items-center justify-center">
                  {o.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm truncate">{o.customer}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.tone}`}>{meta.label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{o.service} · {o.items} items</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{formatGHS(o.amount)}</div>
                  <div className="text-[10px] text-muted-foreground">{o.createdAt}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Highlights */}
      <section className="px-5 mt-6">
        <h2 className="text-lg font-bold mb-3">Boosters</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Zap, title: "Express jobs", desc: "Earn 2× on 6hr orders", tone: "from-warning/20 to-warning/5" },
            { icon: Star, title: "4.9★ rating", desc: "Top 5% in your city", tone: "from-success/20 to-success/5" },
            { icon: Truck, title: "Free pickups", desc: "12 today", tone: "from-primary/20 to-primary/5" },
            { icon: Banknote, title: "Next payout", desc: "$1,280 · Mon", tone: "from-accent to-accent/30" },
          ].map((h) => (
            <div key={h.title} className={`p-4 rounded-2xl bg-gradient-to-br ${h.tone} border border-border`}>
              <h.icon size={20} className="text-foreground" />
              <div className="font-bold text-sm mt-3">{h.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{h.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Drivers nearby */}
      <section className="px-5 mt-6">
        <div className="rounded-2xl bg-card border border-border shadow-card p-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center">
            <Bike size={20} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">3 drivers nearby</div>
            <div className="text-xs text-muted-foreground">Average pickup time: 8 min</div>
          </div>
          <button className="text-xs font-semibold text-primary">Request</button>
        </div>
      </section>
    </div>
  );
}
