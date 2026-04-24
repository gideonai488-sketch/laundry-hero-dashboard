import { Sparkles, TrendingDown, TrendingUp, Loader2, Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAIInsights, useUpdateInsight } from "@/lib/queries";
import { toast } from "sonner";

export function AIInsights({ limit }: { limit?: number }) {
  const { merchant } = useAuth();
  const { data: items = [], isLoading } = useAIInsights(merchant?.id, limit ?? 20);
  const update = useUpdateInsight(merchant?.id);

  if (isLoading) {
    return (
      <section className="px-5 mt-6">
        <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground">
          <Loader2 className="animate-spin mx-auto mb-2" size={18} />
          <div className="text-xs">Loading AI insights…</div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  const trendOf = (kind: string): "up" | "down" | "neutral" =>
    kind === "pricing" || kind === "schedule" ? "up" : kind === "anomaly" || kind === "dispute" ? "down" : "neutral";

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
          const trend = trendOf(it.kind);
          const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Sparkles;
          const tone =
            trend === "up"
              ? "from-success/15 to-success/5 text-success"
              : trend === "down"
                ? "from-warning/15 to-warning/5 text-warning"
                : "from-primary/15 to-primary/5 text-primary";
          return (
            <div key={it.id} className={`rounded-2xl border border-border bg-gradient-to-br ${tone} p-4`}>
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-card flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-sm text-foreground">{it.title}</div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-card text-foreground uppercase">{it.kind}</span>
                  </div>
                  <div className="text-xs text-foreground/75 mt-1">{it.body}</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => update.mutate({ id: it.id, status: "accepted" }, { onSuccess: () => toast.success("Insight accepted") })}
                      className="flex items-center gap-1 text-[11px] font-bold text-primary bg-card px-2 py-1 rounded-full"
                    >
                      <Check size={11} /> Accept
                    </button>
                    <button
                      onClick={() => update.mutate({ id: it.id, status: "dismissed" }, { onSuccess: () => toast("Dismissed") })}
                      className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-card px-2 py-1 rounded-full"
                    >
                      <X size={11} /> Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
