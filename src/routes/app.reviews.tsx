import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { reviews as initial, type Review } from "@/lib/mock-data";
import { Star, MessageCircleReply, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Highest Wash Merchant" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const [list, setList] = useState<Review[]>(initial);
  const [filter, setFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1" | "noreply">("all");
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const stats = useMemo(() => {
    const total = list.length;
    const avg = list.reduce((s, r) => s + r.rating, 0) / total;
    const buckets = [5, 4, 3, 2, 1].map((n) => ({
      n,
      count: list.filter((r) => r.rating === n).length,
      pct: (list.filter((r) => r.rating === n).length / total) * 100,
    }));
    return { total, avg, buckets };
  }, [list]);

  const filtered = list.filter((r) => {
    if (filter === "all") return true;
    if (filter === "noreply") return !r.reply;
    return r.rating === Number(filter);
  });

  const sendReply = (id: string) => {
    if (!draft.trim()) return;
    setList((prev) => prev.map((r) => (r.id === id ? { ...r, reply: draft.trim() } : r)));
    setDraft("");
    setReplyOpen(null);
    toast.success("Reply posted");
  };

  return (
    <div>
      <AppHeader title="Reviews" subtitle={`${stats.total} reviews · ${stats.avg.toFixed(1)} avg`} />

      {/* Rating summary */}
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
          <div className="flex-1 space-y-1">
            {stats.buckets.map((b) => (
              <div key={b.n} className="flex items-center gap-2 text-xs">
                <span className="w-3 font-semibold">{b.n}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-brand rounded-full" style={{ width: `${b.pct}%` }} />
                </div>
                <span className="w-6 text-right text-muted-foreground">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="px-5 mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1">
        {[
          { k: "all", l: "All" },
          { k: "noreply", l: "Needs reply" },
          { k: "5", l: "5★" },
          { k: "4", l: "4★" },
          { k: "3", l: "3★" },
          { k: "2", l: "2★" },
          { k: "1", l: "1★" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setFilter(t.k as typeof filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              filter === t.k ? "bg-gradient-brand text-primary-foreground shadow-brand" : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-5 mt-4 space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl border border-border shadow-card p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-brand-soft text-primary font-bold flex items-center justify-center shrink-0">
                {r.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-sm">{r.customer}</div>
                  <div className="flex gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={11} className={s <= r.rating ? "fill-warning text-warning" : "text-muted"} />
                    ))}
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{r.service} · {r.orderId} · {r.date}</div>
                <p className="text-sm mt-2 leading-relaxed">{r.comment}</p>

                {r.reply && (
                  <div className="mt-3 p-3 rounded-xl bg-gradient-brand-soft border border-border">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary">You replied</div>
                    <p className="text-xs mt-1">{r.reply}</p>
                  </div>
                )}

                {!r.reply && replyOpen !== r.id && (
                  <button
                    onClick={() => setReplyOpen(r.id)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary"
                  >
                    <MessageCircleReply size={12} /> Reply
                  </button>
                )}

                {replyOpen === r.id && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Thanks for your feedback…"
                      maxLength={500}
                      className="flex-1 h-9 rounded-xl px-3 text-xs bg-background border border-input"
                    />
                    <button
                      onClick={() => sendReply(r.id)}
                      className="h-9 w-9 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-brand"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
