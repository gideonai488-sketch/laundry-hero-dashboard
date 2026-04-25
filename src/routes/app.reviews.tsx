import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { useReviews } from "@/lib/queries";
import { Loader2, Star } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/app/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Highest Wash Merchant" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { merchant } = useAuth();
  const { data: list = [], isLoading } = useReviews(merchant?.id);

  const stats = useMemo(() => {
    const total = list.length || 1;
    const rating = merchant?.rating ?? 0;
    return { total: list.length, avg: rating };
  }, [list.length, merchant?.rating]);

  return (
    <div>
      <AppHeader title="Reviews" subtitle={`${stats.total} reviews · ${stats.avg.toFixed(1)} avg`} />

      <section className="px-5 mt-2">
        <div className="bg-card rounded-2xl border border-border shadow-card p-4 flex gap-4">
          <div className="text-center shrink-0">
            <div className="text-4xl font-bold text-primary">{stats.avg.toFixed(1)}</div>
            <div className="flex justify-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={12} className={s <= Math.round(stats.avg) ? "fill-warning text-warning" : "text-muted"} />
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">{stats.total} reviews</div>
          </div>
          <div className="flex-1 text-xs text-muted-foreground self-center">
            Customer ratings update in real time as orders are completed and rated in the customer app.
          </div>
        </div>
      </section>

      <div className="px-5 mt-4 space-y-3">
        {isLoading && <div className="text-center py-12 text-muted-foreground"><Loader2 className="animate-spin mx-auto" /></div>}
        {!isLoading && list.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No reviews yet.</div>}
        {list.map((r) => {
          const name = r.customer?.full_name ?? "Customer";
          return (
            <div key={r.id} className="bg-card rounded-2xl border border-border shadow-card p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-brand-soft text-primary font-bold flex items-center justify-center shrink-0">
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm">{name}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {r.order_id ? `${r.order_id.slice(0, 8)} · ` : ""}{new Date(r.created_at).toLocaleDateString()}
                  </div>
                  {r.comment && <p className="text-sm mt-2 leading-relaxed">{r.comment}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
