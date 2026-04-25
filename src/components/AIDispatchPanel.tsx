import { useEffect, useState } from "react";
import { useLocale } from "@/lib/locale";
import { useAuth } from "@/lib/auth";
import { useDispatchOffers, useRespondOffer, type DispatchOffer } from "@/lib/queries";
import { Bot, Check, MapPin, Shield, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

export function AIDispatchPanel() {
  const { format } = useLocale();
  const { merchant } = useAuth();
  const { data: offers = [] } = useDispatchOffers(merchant?.id);
  const respond = useRespondOffer(merchant?.id);

  // Tick once per second so countdowns animate without re-fetching.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const accept = (o: DispatchOffer) => {
    respond.mutate(
      { id: o.id, decision: "accepted" },
      {
        onSuccess: () => toast.success(`Offer accepted · order ${o.order_id.slice(0, 8)}…`),
        onError: (e) => toast.error((e as Error).message),
      }
    );
  };
  const reject = (o: DispatchOffer) => {
    respond.mutate(
      { id: o.id, decision: "declined" },
      {
        onSuccess: () => toast(`Declined · AI will reassign`, { icon: "🤖" }),
        onError: (e) => toast.error((e as Error).message),
      }
    );
  };

  if (offers.length === 0) return null;

  return (
    <section className="px-5 mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-brand text-primary-foreground flex items-center justify-center">
            <Sparkles size={14} />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">AI dispatch</h2>
            <div className="text-[10px] text-muted-foreground">Auto-assigned to your shop</div>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
          {offers.length} live
        </span>
      </div>

      <div className="space-y-3">
        {offers.map((o) => {
          const expiresInSec = Math.max(0, Math.round((new Date(o.expires_at).getTime() - Date.now()) / 1000));
          const pct = Math.max(0, Math.min(100, (expiresInSec / 90) * 100));
          const urgent = expiresInSec < 20;
          const payload: {
            customer_name?: string;
            service?: string;
            amount_local?: number;
            distance?: string;
            rider_name?: string;
            rider_eta?: string;
          } = {};
          return (
            <div key={o.id} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="h-1 bg-muted">
                <div className={`h-full transition-all ${urgent ? "bg-destructive" : "bg-gradient-brand"}`} style={{ width: `${pct}%` }} />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Bot size={12} className="text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        AI assigned · {o.ai_confidence ?? 92}% match
                      </span>
                    </div>
                    <div className="font-bold mt-1 truncate">{payload.customer_name ?? "Customer"}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.order_id.slice(0, 8)} · {payload.service ?? "Wash & Fold"} · {format(payload.amount_local ?? 0)}
                    </div>
                  </div>
                  <div className={`text-right shrink-0 ${urgent ? "text-destructive" : "text-foreground"}`}>
                    <div className="text-2xl font-bold tabular-nums">{expiresInSec}s</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">to confirm</div>
                  </div>
                </div>

                {o.trust_summary && (
                  <div className="mt-3 flex items-center gap-2 text-[11px] bg-success/10 border border-success/20 rounded-lg p-2">
                    <Shield size={12} className="text-success shrink-0" />
                    <span className="text-foreground/80">{o.trust_summary}</span>
                  </div>
                )}

                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-muted rounded-lg p-2 flex items-center gap-1.5">
                    <MapPin size={11} className="text-primary" />
                    <span className="font-semibold">{payload.distance ?? "—"}</span>
                  </div>
                  <div className="bg-muted rounded-lg p-2 flex items-center gap-1.5">
                    <span>🛵</span>
                    <span className="font-semibold truncate">{payload.rider_name ?? "Rider TBD"} · {payload.rider_eta ?? ""}</span>
                  </div>
                </div>

                {o.ai_reason && <div className="mt-3 text-[11px] text-muted-foreground italic">{o.ai_reason}</div>}

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => reject(o)}
                    disabled={respond.isPending}
                    className="py-2.5 text-xs font-semibold rounded-xl border border-border hover:bg-destructive/5 hover:text-destructive transition-smooth flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <X size={14} /> Decline
                  </button>
                  <button
                    onClick={() => accept(o)}
                    disabled={respond.isPending}
                    className="py-2.5 text-xs font-bold rounded-xl bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-95 transition-smooth flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Check size={14} /> Accept
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
