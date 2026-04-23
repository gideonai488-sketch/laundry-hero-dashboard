import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { getVoiceHistory, subscribeVoiceHistory } from "@/lib/voice-history";
import type { VoiceCommandLog } from "@/lib/mock-data";
import { useEffect, useState } from "react";
import { CheckCircle2, Mic, MicOff, Sparkles, XCircle } from "lucide-react";

export const Route = createFileRoute("/app/voice-history")({
  head: () => ({ meta: [{ title: "Voice history — Highest Wash Merchant" }] }),
  component: VoiceHistoryPage,
});

function VoiceHistoryPage() {
  const [items, setItems] = useState<VoiceCommandLog[]>([]);
  useEffect(() => {
    setItems(getVoiceHistory());
    return subscribeVoiceHistory(setItems);
  }, []);

  return (
    <div>
      <AppHeader title="Voice history" subtitle="Audit trail of AI actions" />

      <section className="px-5 mt-2">
        <div className="rounded-2xl bg-gradient-brand-soft border border-primary/30 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-brand">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">Wake-word listening</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Say "Hey Wash" anywhere to control the app hands-free.</div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> ON
          </div>
        </div>
      </section>

      <div className="px-5 mt-4 space-y-2">
        {items.map((v) => (
          <div key={v.id} className="bg-card rounded-2xl border border-border shadow-card p-3">
            <div className="flex items-start gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${v.success ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                {v.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {v.source === "wake-word" ? <Mic size={11} className="text-primary" /> : v.source === "push-to-talk" ? <Mic size={11} className="text-muted-foreground" /> : <Sparkles size={11} className="text-primary" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{v.source.replace("-", " ")}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{v.at}</span>
                </div>
                <div className="text-sm font-semibold mt-1 italic">"{v.transcript}"</div>
                <div className="text-xs text-muted-foreground mt-1">→ {v.result}</div>
                <div className="text-[10px] text-muted-foreground mt-1">intent: <span className="font-mono text-foreground/80">{v.intent}</span></div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MicOff className="mx-auto mb-2 opacity-40" size={28} />
            <p className="text-sm">No voice commands yet. Try the mic in the header.</p>
          </div>
        )}
      </div>
    </div>
  );
}
