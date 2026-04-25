import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useChat, useMessages, useSendMessage } from "@/lib/queries";
import { ArrowLeft, Send, Phone, Image as ImageIcon, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/message/$chatId")({
  head: ({ params }) => ({
    meta: [{ title: `Chat — Highest Wash Merchant` }],
  }),
  component: ChatThreadPage,
});

const aiDrafts = [
  "Hi! Thanks for reaching out — I'm on it.",
  "Got it! Your laundry will be ready shortly.",
  "Apologies for the wait — checking with the driver now.",
];

function ChatThreadPage() {
  const { chatId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: chat } = useChat(chatId);
  const { data: messages = [], isLoading } = useMessages(chatId);
  const send = useSendMessage(chatId);
  const [draft, setDraft] = useState("");
  const [showDrafts, setShowDrafts] = useState(messages.length === 0);
  const [draftIndex, setDraftIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages.length]);

  const customerName = chat?.customer?.full_name ?? "Customer";
  const avatar = useMemo(() => customerName.slice(0, 2).toUpperCase(), [customerName]);

  const submit = (text?: string) => {
    const t = (text ?? draft).trim();
    if (!t || !user) return;
    send.mutate(
      { body: t, senderId: user.id },
      {
        onSuccess: () => {
          setDraft("");
          setShowDrafts(false);
        },
        onError: (e) => toast.error((e as Error).message),
      }
    );
  };

  const cycleDraft = () => setDraftIndex((i) => (i + 1) % aiDrafts.length);

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-5 py-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/app/chat" })} className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center hover:bg-accent transition-smooth" aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="h-10 w-10 rounded-full bg-gradient-brand text-primary-foreground font-bold flex items-center justify-center text-sm">{avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">{customerName}</div>
            {chat?.order_id && (
              <Link to="/app/order/$orderId" params={{ orderId: chat.order_id }} className="text-[11px] text-primary font-semibold">
                {chat.order_id.slice(0, 8)} →
              </Link>
            )}
          </div>
          {chat?.customer?.phone && (
            <a href={`tel:${chat.customer.phone}`} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-smooth" aria-label="Call">
              <Phone size={16} />
            </a>
          )}
        </div>
      </header>

      <div ref={scrollerRef} className="flex-1 px-4 py-4 space-y-2.5 overflow-y-auto">
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading messages…</p>
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No messages yet — say hi 👋</p>
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender_type === "merchant";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${mine ? "bg-gradient-brand text-primary-foreground rounded-br-md shadow-brand" : "bg-card border border-border rounded-bl-md"}`}>
                <div>{m.body}</div>
                <div className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-muted-foreground"}`}>
                  {m.sent_at ? new Date(m.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showDrafts && (
        <div className="px-3 pb-2">
          <div className="bg-gradient-brand-soft border border-primary/30 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={12} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">AI suggested reply</span>
              <button onClick={cycleDraft} className="ml-auto text-[10px] font-bold text-primary flex items-center gap-1 hover:bg-primary/10 px-2 py-0.5 rounded-full">
                <RefreshCw size={10} /> Try another
              </button>
            </div>
            <div className="text-sm text-foreground bg-card rounded-xl p-3 border border-border">{aiDrafts[draftIndex]}</div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <button onClick={() => setDraft(aiDrafts[draftIndex])} className="py-2 text-[11px] font-bold rounded-lg bg-card border border-border hover:bg-accent">Edit</button>
              <button onClick={() => setShowDrafts(false)} className="py-2 text-[11px] font-bold rounded-lg bg-card border border-border hover:bg-accent">Skip</button>
              <button onClick={() => submit(aiDrafts[draftIndex])} className="py-2 text-[11px] font-bold rounded-lg bg-gradient-brand text-primary-foreground shadow-brand">Send</button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky bottom-20 px-3 pb-2">
        <div className="bg-card border border-border rounded-2xl shadow-card p-2 flex items-center gap-2">
          <button onClick={() => toast.info("Photo upload coming soon")} className="h-9 w-9 rounded-xl hover:bg-accent transition-smooth flex items-center justify-center text-muted-foreground" aria-label="Attach">
            <ImageIcon size={18} />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type a message..."
            className="flex-1 h-10 bg-transparent text-sm focus:outline-none"
          />
          {!showDrafts && (
            <button onClick={() => setShowDrafts(true)} className="h-9 w-9 rounded-xl bg-gradient-brand-soft text-primary flex items-center justify-center" aria-label="AI reply">
              <Sparkles size={16} />
            </button>
          )}
          <button onClick={() => submit()} disabled={!draft.trim() || send.isPending} className="h-9 w-9 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center disabled:opacity-40 shadow-brand" aria-label="Send">
            {send.isPending ? <Loader2 className="animate-spin" size={14} /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
