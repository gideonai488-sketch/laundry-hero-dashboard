import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { pricingSuggestions, demandForecast } from "@/lib/mock-data";
import { useLocale } from "@/lib/locale";
import { Sparkles, TrendingDown, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/ai-pricing")({
  head: () => ({ meta: [{ title: "AI Pricing & Forecast — Highest Wash Merchant" }] }),
  component: AIPricingPage,
});

const loadColor: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  med: "bg-primary/15 text-primary",
  high: "bg-warning/15 text-warning-foreground",
  peak: "bg-destructive/15 text-destructive",
};

function AIPricingPage() {
  const { format } = useLocale();
  const maxForecast = Math.max(...demandForecast.map((d) => d.forecast));

  return (
    <div>
      <AppHeader title="AI pricing & forecast" subtitle="Earn more, plan smarter" />

      <section className="px-5 mt-2">
        <div className="rounded-2xl bg-gradient-hero text-primary-foreground p-4 shadow-brand">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/80">
            <Sparkles size={11} /> AI insight
          </div>
          <div className="text-lg font-bold mt-1">Apply 3 suggestions to earn ~$244 more/wk</div>
          <button onClick={() => toast.success("Pricing changes scheduled for next week")} className="mt-3 px-4 py-2 rounded-lg bg-white text-primary text-xs font-bold">Apply all</button>
        </div>
      </section>

      <section className="px-5 mt-5">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5"><Sparkles size={14} /> Pricing suggestions</h3>
        <div className="space-y-2">
          {pricingSuggestions.map((p) => {
            const up = p.suggested > p.current;
            return (
              <div key={p.id} className="bg-card rounded-2xl border border-border shadow-card p-4">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${up ? "bg-success/15 text-success" : "bg-warning/15 text-warning-foreground"}`}>
                    {up ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-sm truncate">{p.service}</div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">{p.confidence}% confident</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xs text-muted-foreground line-through">{format(p.current)}</span>
                      <span className="text-lg font-bold text-primary">{format(p.suggested)}</span>
                      <span className="text-[10px] text-muted-foreground">· {p.applies}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{p.reason}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-bold text-success">{p.uplift}</span>
                      <button onClick={() => toast.success(`Applied: ${p.service} → ${format(p.suggested)}`)} className="ml-auto px-3 py-1.5 text-[11px] font-bold rounded-lg bg-gradient-brand text-primary-foreground shadow-brand">Apply</button>
                      <button onClick={() => toast(`Dismissed`)} className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-border hover:bg-accent">Skip</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 mt-6">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5"><Calendar size={14} /> 7-day demand forecast</h3>
        <div className="bg-card rounded-2xl border border-border shadow-card p-4">
          <div className="flex items-end gap-1.5 h-32">
            {demandForecast.map((d) => {
              const h = (d.forecast / maxForecast) * 100;
              const bh = (d.baseline / maxForecast) * 100;
              return (
                <div key={d.short} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] font-bold tabular-nums">{d.forecast}</div>
                  <div className="relative w-full h-full flex items-end">
                    <div className="absolute bottom-0 left-0 right-0 rounded-t bg-muted" style={{ height: `${bh}%` }} />
                    <div className="absolute bottom-0 left-0 right-0 rounded-t bg-gradient-brand" style={{ height: `${h}%`, opacity: d.load === "peak" ? 1 : d.load === "high" ? 0.8 : 0.5 }} />
                  </div>
                  <div className="text-[10px] text-muted-foreground">{d.short}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 space-y-1.5">
            {demandForecast.map((d) => (
              <div key={d.date} className="flex items-center gap-2 text-[11px]">
                <span className="w-12 text-muted-foreground">{d.short}</span>
                <span>{d.weather}</span>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${loadColor[d.load]}`}>{d.load}</span>
                <span className="flex-1 truncate text-foreground/80">{d.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
