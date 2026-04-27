import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useChatThread, useMarkChatRead, useSendMessage } from "@/lib/queries";

export const Route = createFileRoute("/app/messages/$chatId")({
  head: ({ params }) => ({ meta: [{ title: `Chat — Highest Wash` }] }),
  component: ChatThreadPage,
});

function fmtTime(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ChatThreadPage() {
  const { chatId } = Route.useParams();
  const navigate = useNavigate();
  const { user, merchant } = useAuth();
  const { data, isLoading } = useChatThread(chatId);
  const send = useSendMessage();
  const markRead = useMarkChatRead();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [data?.messages?.length]);

  useEffect(() => {
    if (chatId && merchant?.id) markRead.mutate({ chatId, merchantId: merchant.id });
  }, [chatId, merchant?.id, data?.messages?.length]);

  if (isLoading || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const customerName = data.customer?.full_name ?? "Customer";
  const phone = data.customer?.phone;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !user) return;
    send.mutate(
      { chatId, senderId: user.id, body },
      {
        onSuccess: () => setText(""),
        onError: (err: any) => toast.error(err.message ?? "Couldn't send"),
      }
    );
  };

  const quick = [
    "Hi! I've accepted your order — picking up soon.",
    "On the way to pick up your laundry now.",
    "Items are washing, will be ready shortly.",
    "Your laundry is ready for delivery.",
  ];

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/app/messages" })}
            className="h-10 w-10 -ml-2 rounded-full hover:bg-accent flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-10 w-10 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center font-bold text-sm">
            {customerName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{customerName}</div>
            {data.order && (
              <button
                onClick={() => navigate({ to: "/app/order/$orderId", params: { orderId: data.order!.id } })}
                className="text-[11px] text-muted-foreground truncate underline-offset-2 hover:underline text-left"
              >
                Order #{String(data.order.id).slice(0, 6)} · {String(data.order.delivery_status ?? "").replace(/_/g, " ")}
              </button>
            )}
          </div>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="h-10 w-10 rounded-full bg-gradient-brand-soft text-primary flex items-center justify-center"
              aria-label="Call customer"
            >
              <Phone size={16} />
            </a>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 space-y-2">
        {data.messages.length === 0 && (
          <div className="text-center py-10 text-xs text-muted-foreground">
            Say hi to {customerName.split(" ")[0]} — they'll get a notification.
          </div>
        )}
        {data.messages.map((m: any) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm shadow-sm ${
                  mine
                    ? "bg-gradient-brand text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border rounded-bl-sm"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{m.body}</div>
                <div className={`text-[9px] mt-0.5 ${mine ? "text-white/75" : "text-muted-foreground"}`}>
                  {fmtTime(m.sent_at)}
                  {mine && m.read_at ? " · read" : ""}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/95 backdrop-blur-xl border-t border-border z-30">
        {data.messages.length === 0 && (
          <div className="px-3 pt-2 flex gap-1.5 overflow-x-auto">
            {quick.map((q) => (
              <button
                key={q}
                onClick={() => setText(q)}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-accent"
              >
                {q.length > 30 ? q.slice(0, 30) + "…" : q}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={submit} className="px-3 py-3 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 h-11 px-4 rounded-2xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            disabled={send.isPending || !text.trim()}
            className="h-11 w-11 rounded-2xl bg-gradient-brand text-primary-foreground shadow-brand flex items-center justify-center disabled:opacity-40"
            aria-label="Send"
          >
            {send.isPending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
