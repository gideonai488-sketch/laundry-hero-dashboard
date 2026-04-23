import { useEffect, useState } from "react";
import { dispatchAssignments, formatGHS, type DispatchAssignment } from "@/lib/mock-data";
import { Bot, Check, MapPin, Shield, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

export function AIDispatchPanel() {
  const [items, setItems] = useState<DispatchAssignment[]>(dispatchAssignments);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // decrement countdowns
  useEffect(() => {
    setItems((prev) =>
      prev
        .map((a) => ({ ...a, expiresInSec: Math.max(0, a.expiresInSec - 1) }))
        .filter((a) => a.expiresInSec > 0)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const accept = (a: DispatchAssignment) => {
    setItems((prev) => prev.filter((x) => x.id !== a.id));
    toast.success(`Order ${a.orderId} accepted · rider ${a.riderName} dispatched`);
  };

  const reject = (a: DispatchAssignment) => {
    setItems((prev) => prev.filter((x) => x.id !== a.id));
    toast(`Order ${a.orderId} declined · AI will reassign`, { icon: "🤖" });
  };

  if (items.length === 0) return null;

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
          {items.length} live
        </span>
      </div>

      <div className="space-y-3">
        {items.map((a) => {
          const pct = Math.max(0, Math.min(100, (a.expiresInSec / 90) * 100));
          const urgent = a.expiresInSec < 20;
          return (
            <div
              key={a.id}
              className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
            >
              {/* countdown bar */}
              <div className="h-1 bg-muted">
                <div
                  className={`h-full transition-all ${urgent ? "bg-destructive" : "bg-gradient-brand"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Bot size={12} className="text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        AI assigned · {a.aiConfidence}% match
                      </span>
                    </div>
                    <div className="font-bold mt-1 truncate">{a.customer}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.orderId} · {a.service} · {formatGHS(a.amount)}
                    </div>
                  </div>
                  <div className={`text-right shrink-0 ${urgent ? "text-destructive" : "text-foreground"}`}>
                    <div className="text-2xl font-bold tabular-nums">{a.expiresInSec}s</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">to confirm</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px] bg-success/10 border border-success/20 rounded-lg p-2">
                  <Shield size={12} className="text-success shrink-0" />
                  <span className="text-foreground/80">{a.trustSummary}</span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-muted rounded-lg p-2 flex items-center gap-1.5">
                    <MapPin size={11} className="text-primary" />
                    <span className="font-semibold">{a.distance}</span>
                  </div>
                  <div className="bg-muted rounded-lg p-2 flex items-center gap-1.5">
                    <span>🛵</span>
                    <span className="font-semibold truncate">{a.riderName} · {a.riderEta}</span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-muted-foreground italic">{a.reason}</div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => reject(a)}
                    className="py-2.5 text-xs font-semibold rounded-xl border border-border hover:bg-destructive/5 hover:text-destructive transition-smooth flex items-center justify-center gap-1.5"
                  >
                    <X size={14} /> Decline
                  </button>
                  <button
                    onClick={() => accept(a)}
                    className="py-2.5 text-xs font-bold rounded-xl bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-95 transition-smooth flex items-center justify-center gap-1.5"
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
