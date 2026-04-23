import { useEffect, useRef, useState } from "react";
import { Bot, Mic, MicOff, Send, Sparkles, X } from "lucide-react";
import { copilotMockResponses, copilotSuggestions, sampleVoicePrompts, voiceIntents } from "@/lib/mock-data";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AICopilot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey 👋 I'm your AI co-pilot. I can manage orders, draft replies, give insights, or run anything by voice. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking, open]);

  const generateReply = (text: string): string => {
    const match = copilotMockResponses.find((r) => r.match.test(text));
    if (match) return match.reply;
    return "I can help with orders, revenue, customer messages, late jobs, and staffing. Try asking *\"what's my revenue today?\"* or *\"accept all pending orders\"*.";
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = generateReply(text);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      setThinking(false);
    }, 700 + Math.random() * 600);
  };

  // Mock voice: pick a random sample prompt, simulate dictation
  const toggleListen = () => {
    if (listening) {
      setListening(false);
      return;
    }
    setListening(true);
    const sample = sampleVoicePrompts[Math.floor(Math.random() * sampleVoicePrompts.length)];
    let i = 0;
    const id = setInterval(() => {
      i++;
      setInput(sample.slice(0, i));
      if (i >= sample.length) {
        clearInterval(id);
        setListening(false);
        // Auto-route through voice intents if matched, else send as chat
        const intent = voiceIntents.find((v) => v.pattern.test(sample));
        if (intent) {
          toast.success(intent.feedback, { icon: "🎤" });
        }
        setTimeout(() => send(sample), 400);
      }
    }, 60);
  };

  // Render simple markdown (bold + line breaks + bullets)
  const renderRich = (text: string) =>
    text.split("\n").map((line, i) => (
      <div key={i} className={line.trim().startsWith(">") ? "italic text-muted-foreground border-l-2 border-primary/40 pl-2 my-1" : ""}>
        {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="font-bold text-foreground">{part.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{part.replace(/^>\s?/, "")}</span>
          )
        )}
      </div>
    ));

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI co-pilot"
          className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full bg-gradient-brand text-primary-foreground shadow-brand flex items-center justify-center hover:scale-105 transition-smooth"
        >
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success ring-2 ring-background animate-pulse" />
          <Sparkles size={22} />
        </button>
      )}

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md bg-background rounded-t-3xl shadow-brand flex flex-col max-h-[85vh] animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm">AI Co-pilot</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online · ready to help
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      m.role === "user"
                        ? "bg-gradient-brand text-primary-foreground rounded-br-md"
                        : "bg-card border border-border rounded-bl-md"
                    }`}
                  >
                    {m.role === "assistant" ? renderRich(m.content) : m.content}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-3.5 py-2.5 flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              )}

              {messages.length <= 1 && (
                <div className="pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">Try asking</div>
                  <div className="flex flex-wrap gap-2">
                    {copilotSuggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-xs px-3 py-1.5 rounded-full bg-card border border-border hover:bg-accent transition-smooth"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 pb-5 flex items-center gap-2">
              <button
                onClick={toggleListen}
                aria-label={listening ? "Stop listening" : "Start voice input"}
                className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 transition-smooth ${
                  listening
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : "bg-gradient-brand text-primary-foreground shadow-brand"
                }`}
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder={listening ? "Listening…" : "Ask anything…"}
                maxLength={300}
                className="flex-1 h-11 px-4 rounded-full bg-card border border-border text-sm focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                aria-label="Send"
                className="h-11 w-11 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
