import { aiInsights } from "@/lib/mock-data";
import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";

export function AIInsights({ limit }: { limit?: number }) {
  const items = limit ? aiInsights.slice(0, limit) : aiInsights;
  return (
    <section className="px-5 mt-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-lg bg-gradient-brand text-primary-foreground flex items-center justify-center">
          <Sparkles size={14} />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight">AI insights</h2>
          <div className="text-[10px] text-muted-foreground">Personalized for your shop</div>
        </div>
      </div>
      <div className="space-y-2.5">
        {items.map((it) => {
          const Icon = it.trend === "up" ? TrendingUp : it.trend === "down" ? TrendingDown : Sparkles;
          const tone =
            it.trend === "up"
              ? "from-success/15 to-success/5 text-success"
              : it.trend === "down"
                ? "from-warning/15 to-warning/5 text-warning"
                : "from-primary/15 to-primary/5 text-primary";
          return (
            <div
              key={it.id}
              className={`rounded-2xl border border-border bg-gradient-to-br ${tone} p-4`}
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-card flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-sm text-foreground">{it.title}</div>
                    {it.metric && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-card text-foreground">
                        {it.metric}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-foreground/75 mt-1">{it.body}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
