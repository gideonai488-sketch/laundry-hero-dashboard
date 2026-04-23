import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { chats } from "@/lib/mock-data";
import { ArrowLeft, Send, Phone, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/chat/$chatId")({
  head: ({ params }) => ({
    meta: [{ title: `Chat ${params.chatId} — Highest Wash Merchant` }],
  }),
  loader: ({ params }) => {
    const chat = chats.find((c) => c.id === params.chatId);
    if (!chat) throw notFound();
    return { chat };
  },
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p className="text-sm text-muted-foreground mb-4">Conversation not found.</p>
      <Link to="/app/chat" className="text-primary font-semibold text-sm">
        ← Back to messages
      </Link>
    </div>
  ),
  component: ChatThreadPage,
});

interface Msg {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

function ChatThreadPage() {
  const { chat } = Route.useLoaderData();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m1", from: "them", text: `Hi! I just placed order ${chat.orderId}.`, time: "10:02" },
    { id: "m2", from: "me", text: "Hello! Got it — sending a driver shortly 🚗", time: "10:03" },
    { id: "m3", from: "them", text: chat.lastMessage, time: chat.time },
  ]);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setMessages((prev) => [
      ...prev,
      { id: `m${prev.length + 1}`, from: "me", text: t, time: "now" },
    ]);
    setDraft("");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-5 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/app/chat" })}
            className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center hover:bg-accent transition-smooth"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-10 w-10 rounded-full bg-gradient-brand text-primary-foreground font-bold flex items-center justify-center text-sm">
            {chat.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">{chat.customer}</div>
            <Link
              to="/app/orders/$orderId"
              params={{ orderId: chat.orderId }}
              className="text-[11px] text-primary font-semibold"
            >
              {chat.orderId} →
            </Link>
          </div>
          <button
            onClick={() => toast.success(`Calling ${chat.customer}...`)}
            className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-smooth"
            aria-label="Call"
          >
            <Phone size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 space-y-2.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                m.from === "me"
                  ? "bg-gradient-brand text-primary-foreground rounded-br-md shadow-brand"
                  : "bg-card border border-border rounded-bl-md"
              }`}
            >
              <div>{m.text}</div>
              <div
                className={`text-[10px] mt-1 ${
                  m.from === "me" ? "text-white/70" : "text-muted-foreground"
                }`}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-20 px-3 pb-2">
        <div className="bg-card border border-border rounded-2xl shadow-card p-2 flex items-center gap-2">
          <button
            onClick={() => toast.info("Attach photo (mock)")}
            className="h-9 w-9 rounded-xl hover:bg-accent transition-smooth flex items-center justify-center text-muted-foreground"
            aria-label="Attach"
          >
            <ImageIcon size={18} />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="flex-1 h-10 bg-transparent text-sm focus:outline-none"
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            className="h-9 w-9 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center disabled:opacity-40 shadow-brand"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
