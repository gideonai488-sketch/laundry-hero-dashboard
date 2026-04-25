import { useState } from "react";
import { Mic } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { logVoiceCommandToDb } from "@/lib/queries";
import { toast } from "sonner";

const samplePrompts = [
  "Show today's earnings",
  "Mark order as ready",
  "Open dispatch panel",
  "What's my acceptance rate this week?",
  "Pause new orders for 30 minutes",
];

const intents: { pattern: RegExp; intent: string; feedback: string }[] = [
  { pattern: /earning/i, intent: "open_earnings", feedback: "Opening earnings…" },
  { pattern: /ready/i, intent: "mark_ready", feedback: "Marking next order as ready" },
  { pattern: /dispatch/i, intent: "open_dispatch", feedback: "Opening dispatch panel" },
  { pattern: /accept/i, intent: "show_acceptance", feedback: "Showing acceptance rate" },
  { pattern: /pause/i, intent: "pause_orders", feedback: "Pausing new orders for 30 min" },
];

export function VoiceCommandBar() {
  const { user } = useAuth();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const start = () => {
    if (listening) return;
    setListening(true);
    setTranscript("");
    const sample = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTranscript(sample.slice(0, i));
      if (i >= sample.length) {
        clearInterval(id);
        setTimeout(() => {
          const match = intents.find((v) => v.pattern.test(sample));
          const intent = match?.intent ?? "unknown";
          const result = match?.feedback ?? "No matching intent";
          const success = !!match;
          if (success) toast.success(result, { icon: "🎤", duration: 3500 });
          else toast(`Heard: "${sample}"`, { icon: "🎤" });
          if (user) {
            logVoiceCommandToDb({
              userId: user.id,
              source: "push-to-talk",
              transcript: sample,
              intent,
              resultSummary: result,
              success,
            }).catch(() => { /* swallow — non-critical */ });
          }
          setListening(false);
          setTranscript("");
        }, 400);
      }
    }, 55);
  };

  return (
    <button
      onClick={start}
      aria-label="Voice command"
      className={`relative h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-smooth ${
        listening
          ? "bg-destructive text-destructive-foreground"
          : "bg-gradient-brand text-primary-foreground shadow-brand"
      }`}
    >
      <Mic size={16} />
      {listening && (
        <>
          <span className="absolute inset-0 rounded-full bg-destructive/40 animate-ping" />
          <div className="absolute top-12 right-0 w-64 bg-card border border-border rounded-2xl shadow-brand p-3 text-xs text-left z-50">
            <div className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" /> Listening
            </div>
            <div className="font-medium text-foreground min-h-[18px]">{transcript || "Speak now…"}</div>
          </div>
        </>
      )}
    </button>
  );
}
