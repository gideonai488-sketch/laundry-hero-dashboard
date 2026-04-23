import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { anomalyAlerts, disputes } from "@/lib/mock-data";
import { useLocale } from "@/lib/locale";
import { AlertTriangle, Bot, Check, Shield, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/ai-guard")({
  head: () => ({ meta: [{ title: "AI Guard — Highest Wash Merchant" }] }),
  component: AIGuardPage,
});

const sevTone: Record<string, string> = {
  info: "border-primary/30 bg-primary/5 text-primary",
  warn: "border-warning/40 bg-warning/5 text-warning-foreground",
  critical: "border-destructive/40 bg-destructive/5 text-destructive",
};

function AIGuardPage() {
  const { format } = useLocale();
  const [resolved, setResolved] = useState<Record<string, "approved" | "rejected">>({});

  return (
    <div>
      <AppHeader title="AI Guard" subtitle="Anomalies & dispute resolution" />

      <section className="px-5 mt-2">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5"><AlertTriangle size={14} /> Anomaly alerts</h3>
        <div className="space-y-2">
          {anomalyAlerts.map((a) => (
            <div key={a.id} className={`rounded-2xl border-2 p-3 ${sevTone[a.severity]}`}>
              <div className="flex items-start gap-2">
                <Shield size={14} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-sm">{a.title}</div>
                    {a.orderId && <span className="text-[10px] font-mono">{a.orderId}</span>}
                  </div>
                  <p className="text-xs text-foreground/80 mt-1">{a.detail}</p>
                  <div className="text-[10px] text-muted-foreground mt-1">{a.at} · {a.category}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5"><Bot size={14} /> Disputes · AI-proposed resolutions</h3>
        <div className="space-y-3">
          {disputes.map((d) => {
            const status = resolved[d.id];
            return (
              <div key={d.id} className="bg-card rounded-2xl border border-border shadow-card p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-brand-soft text-primary font-bold flex items-center justify-center shrink-0">{d.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-sm truncate">{d.customer}</div>
                      <span className="text-[10px] font-mono">{d.orderId}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{d.reason}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">Order {format(d.amount)} · opened {d.openedAt}</div>
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-gradient-brand-soft border border-primary/30 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                    <Sparkles14 /> AI proposes
                  </div>
                  <div className="text-sm font-bold">{d.aiResolution.action}</div>
                  <p className="text-xs text-muted-foreground mt-1">{d.aiResolution.rationale}</p>
                </div>
                {!status ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button onClick={() => { setResolved((p) => ({ ...p, [d.id]: "rejected" })); toast(`Dispute ${d.orderId} escalated`); }} className="py-2 text-[11px] font-bold rounded-lg border border-border hover:bg-destructive/5 hover:text-destructive flex items-center justify-center gap-1">
                      <X size={12} /> Reject
                    </button>
                    <button onClick={() => toast(`Edit form opened`)} className="py-2 text-[11px] font-bold rounded-lg border border-border hover:bg-accent">Edit</button>
                    <button onClick={() => { setResolved((p) => ({ ...p, [d.id]: "approved" })); toast.success(`Applied AI resolution`); }} className="py-2 text-[11px] font-bold rounded-lg bg-gradient-brand text-primary-foreground shadow-brand flex items-center justify-center gap-1">
                      <Check size={12} /> Approve
                    </button>
                  </div>
                ) : (
                  <div className={`mt-3 text-center py-2 rounded-lg text-[11px] font-bold ${status === "approved" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                    {status === "approved" ? "✓ Resolution applied" : "Escalated to support"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Sparkles14() {
  return <span className="text-[12px]">✨</span>;
}
