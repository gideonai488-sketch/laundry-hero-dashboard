import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { scorecard } from "@/lib/mock-data";
import { Award, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/scorecard")({
  head: () => ({ meta: [{ title: "Performance — Highest Wash Merchant" }] }),
  component: ScorecardPage,
});

function ScorecardPage() {
  return (
    <div>
      <AppHeader title="Performance scorecard" subtitle={scorecard.weekOf} />

      <section className="px-5 mt-2">
        <div className="rounded-3xl bg-gradient-hero text-primary-foreground p-5 shadow-brand text-center">
          <Award size={36} className="mx-auto opacity-90" />
          <div className="text-7xl font-bold mt-2 leading-none">{scorecard.overallGrade}</div>
          <div className="text-sm font-semibold mt-1 opacity-90">Score · {scorecard.overallScore}/100</div>
          <div className="text-xs opacity-75 mt-2">Top 13% of merchants in your city</div>
        </div>
      </section>

      <section className="px-5 mt-5 grid grid-cols-2 gap-2.5">
        {scorecard.metrics.map((m) => (
          <div key={m.label} className="bg-card rounded-2xl border border-border shadow-card p-3">
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{m.label}</div>
            <div className="text-xl font-bold mt-1">{m.value}</div>
            <div className={`text-[10px] font-bold mt-0.5 ${m.positive ? "text-success" : "text-destructive"}`}>{m.delta}</div>
            <div className="text-[10px] text-muted-foreground mt-1.5 truncate">{m.benchmark}</div>
          </div>
        ))}
      </section>

      <section className="px-5 mt-6">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5"><Sparkles size={14} /> AI highlights</h3>
        <div className="bg-card rounded-2xl border border-border shadow-card p-4 space-y-3">
          {scorecard.highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <TrendingUp size={14} className="text-primary mt-0.5 shrink-0" />
              <span>{h}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
