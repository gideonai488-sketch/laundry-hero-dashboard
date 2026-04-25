import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { useMerchantCustomers } from "@/lib/queries";
import { useLocale } from "@/lib/locale";
import { Crown, Loader2, Mail, Phone, Search, Sparkles, User } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/app/customers")({
  head: () => ({ meta: [{ title: "Customers — Highest Wash Merchant" }] }),
  component: CustomersPage,
});

type Tier = "vip" | "regular" | "new";
const tierOf = (count: number, spend: number): Tier => {
  if (spend >= 500 || count >= 10) return "vip";
  if (count >= 3) return "regular";
  return "new";
};

const tierMeta: Record<Tier, { label: string; icon: typeof Crown; tone: string }> = {
  vip: { label: "VIP", icon: Crown, tone: "bg-warning/15 text-warning-foreground" },
  regular: { label: "Regular", icon: Sparkles, tone: "bg-primary/15 text-primary" },
  new: { label: "New", icon: User, tone: "bg-success/15 text-success" },
};

function CustomersPage() {
  const { merchant } = useAuth();
  const { format } = useLocale();
  const { data: customers = [], isLoading } = useMerchantCustomers(merchant?.id);
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<"all" | Tier>("all");

  const enriched = useMemo(
    () => customers.map((c) => ({ ...c, tier: tierOf(c.total_orders, c.total_spend_usd) })),
    [customers]
  );

  const filtered = useMemo(() => {
    return enriched.filter((c) => {
      if (tier !== "all" && c.tier !== tier) return false;
      if (q.trim() && !`${c.full_name ?? ""} ${c.phone ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [enriched, q, tier]);

  const totals = {
    total: enriched.length,
    ltv: enriched.reduce((s, c) => s + c.total_spend_usd, 0),
    vip: enriched.filter((c) => c.tier === "vip").length,
  };

  return (
    <div>
      <AppHeader title="Customers" subtitle={`${totals.total} customers · ${format(totals.ltv)} LTV`} />

      <section className="px-5 mt-2 grid grid-cols-3 gap-2">
        {[
          { v: totals.total, l: "Total" },
          { v: totals.vip, l: "VIPs" },
          { v: format(totals.ltv), l: "LTV" },
        ].map((s) => (
          <div key={s.l} className="bg-card rounded-2xl border border-border shadow-card p-3 text-center">
            <div className="text-base font-bold">{s.v}</div>
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{s.l}</div>
          </div>
        ))}
      </section>

      <div className="px-5 mt-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search customers"
            maxLength={80}
            className="w-full h-10 rounded-xl pl-9 pr-3 text-sm bg-card border border-border"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 mt-3 -mx-1">
          {[{ k: "all", l: "All" }, { k: "vip", l: "VIP" }, { k: "regular", l: "Regular" }, { k: "new", l: "New" }].map((t) => (
            <button
              key={t.k}
              onClick={() => setTier(t.k as typeof tier)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                tier === t.k ? "bg-gradient-brand text-primary-foreground shadow-brand" : "bg-card border border-border text-muted-foreground"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4 space-y-3">
        {isLoading && <div className="text-center py-12 text-muted-foreground"><Loader2 className="animate-spin mx-auto" /></div>}
        {!isLoading && filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No customers yet.</div>}
        {filtered.map((c) => {
          const meta = tierMeta[c.tier];
          const Icon = meta.icon;
          const name = c.full_name ?? "Customer";
          return (
            <div key={c.id} className="bg-card rounded-2xl border border-border shadow-card p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-brand-soft text-primary font-bold flex items-center justify-center shrink-0">
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold truncate">{name}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${meta.tone}`}>
                      <Icon size={10} /> {meta.label}
                    </span>
                  </div>
                  {c.phone && <div className="text-xs text-muted-foreground mt-0.5 truncate">{c.phone}</div>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div className="bg-muted rounded-lg p-2">
                  <div className="text-muted-foreground">Orders</div>
                  <div className="font-bold mt-0.5">{c.total_orders}</div>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <div className="text-muted-foreground">LTV</div>
                  <div className="font-bold mt-0.5 text-primary">{format(c.total_spend_usd)}</div>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <div className="text-muted-foreground">Last</div>
                  <div className="font-bold mt-0.5">{c.last_order_at ? new Date(c.last_order_at).toLocaleDateString() : "—"}</div>
                </div>
              </div>

              {c.phone && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <a href={`tel:${c.phone}`} className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-card border border-border text-xs font-semibold">
                    <Phone size={12} /> Call
                  </a>
                  <a href={`sms:${c.phone}`} className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-brand text-primary-foreground text-xs font-semibold">
                    <Mail size={12} /> Message
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
