import { useState } from "react";
import { Mic } from "lucide-react";
import { sampleVoicePrompts, voiceIntents } from "@/lib/mock-data";
import { logVoiceCommand } from "@/lib/voice-history";
import { toast } from "sonner";

export function VoiceCommandBar() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const start = () => {
    if (listening) return;
    setListening(true);
    setTranscript("");
    const sample = sampleVoicePrompts[Math.floor(Math.random() * sampleVoicePrompts.length)];
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTranscript(sample.slice(0, i));
      if (i >= sample.length) {
        clearInterval(id);
        setTimeout(() => {
          const intent = voiceIntents.find((v) => v.pattern.test(sample));
          if (intent) {
            toast.success(intent.feedback, { icon: "🎤", duration: 3500 });
            logVoiceCommand({
              transcript: sample,
              intent: intent.action,
              result: intent.feedback,
              source: "push-to-talk",
              success: true,
            });
          } else {
            toast(`Heard: "${sample}"`, { icon: "🎤" });
            logVoiceCommand({
              transcript: sample,
              intent: "unknown",
              result: "No matching intent",
              source: "push-to-talk",
              success: false,
            });
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
