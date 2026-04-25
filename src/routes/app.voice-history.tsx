import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { useVoiceLogs } from "@/lib/queries";
import { CheckCircle2, Loader2, Mic, MicOff, Sparkles, XCircle } from "lucide-react";

export const Route = createFileRoute("/app/voice-history")({
  head: () => ({ meta: [{ title: "Voice history — Highest Wash Merchant" }] }),
  component: VoiceHistoryPage,
});

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function VoiceHistoryPage() {
  const { user } = useAuth();
  const { data: items = [], isLoading } = useVoiceLogs(user?.id);

  return (
    <div>
      <AppHeader title="Voice history" subtitle="Audit trail of AI actions" />

      <section className="px-5 mt-2">
        <div className="rounded-2xl bg-gradient-brand-soft border border-primary/30 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-brand">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">Voice command log</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">All transcripts saved live to your account.</div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> LIVE
          </div>
        </div>
      </section>

      <div className="px-5 mt-4 space-y-2">
        {isLoading && <div className="text-center py-12 text-muted-foreground"><Loader2 className="animate-spin mx-auto" /></div>}
        {!isLoading && items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MicOff className="mx-auto mb-2 opacity-40" size={28} />
            <p className="text-sm">No voice commands yet. Try the mic in the header.</p>
          </div>
        )}
        {items.map((v) => (
          <div key={v.id} className="bg-card rounded-2xl border border-border shadow-card p-3">
            <div className="flex items-start gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${v.success ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                {v.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Mic size={11} className="text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{(v.source ?? "voice").replace("-", " ")}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(v.created_at)}</span>
                </div>
                {v.transcript && <div className="text-sm font-semibold mt-1 italic">"{v.transcript}"</div>}
                {v.result_summary && <div className="text-xs text-muted-foreground mt-1">→ {v.result_summary}</div>}
                {v.intent && <div className="text-[10px] text-muted-foreground mt-1">intent: <span className="font-mono text-foreground/80">{v.intent}</span></div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
