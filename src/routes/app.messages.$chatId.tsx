import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Phone, Send, Truck, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useChatThread, useMarkChatRead, useSendMessage } from "@/lib/queries";

export const Route = createFileRoute("/app/messages/$chatId")({
  head: () => ({ meta: [{ title: `Chat — Highest Wash` }] }),
  component: ChatThreadPage,
});

function fmtTime(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function Avatar({ name, size = 10 }: { name: string; size?: number }) {
  return (
    <div
      className={`h-${size} w-${size} rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0`}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
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
  const riderName = data.rider?.full_name ?? "Rider";
  const hasRider = !!data.chat?.rider_id;

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

  const getSenderLabel = (senderId: string) => {
    if (senderId === data.chat?.customer_id) return customerName.split(" ")[0];
    if (senderId === data.chat?.rider_id) return riderName.split(" ")[0];
    return null;
  };

  const getSenderIcon = (senderId: string) => {
    if (senderId === data.chat?.rider_id) return <Truck size={10} className="inline mr-0.5" />;
    if (senderId === data.chat?.customer_id) return <User size={10} className="inline mr-0.5" />;
    return null;
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/app/messages" })}
            className="h-10 w-10 -ml-2 rounded-full hover:bg-accent flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Stacked avatars when rider present */}
          <div className="relative flex items-center">
            <Avatar name={customerName} size={10} />
            {hasRider && (
              <div className="absolute left-6 h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm border-2 border-background">
                {riderName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className={`flex-1 min-w-0 ${hasRider ? "ml-5" : ""}`}>
            <div className="text-sm font-bold truncate">
              {customerName}
              {hasRider && <span className="text-muted-foreground font-normal"> + {riderName.split(" ")[0]}</span>}
            </div>
            {data.order && (
              <button
                onClick={() =>
                  navigate({ to: "/app/order/$orderId", params: { orderId: data.order!.id } })
                }
                className="text-[11px] text-muted-foreground truncate underline-offset-2 hover:underline text-left"
              >
                Order #{String(data.order.id).slice(0, 6)} ·{" "}
                {String(data.order.delivery_status ?? "").replace(/_/g, " ")}
              </button>
            )}
          </div>

          {/* Call buttons */}
          <div className="flex items-center gap-1.5">
            {data.customer?.phone && (
              <a
                href={`tel:${data.customer.phone}`}
                className="h-9 w-9 rounded-full bg-gradient-brand-soft text-primary flex items-center justify-center"
                aria-label="Call customer"
                title={`Call ${customerName}`}
              >
                <Phone size={15} />
              </a>
            )}
            {hasRider && data.rider?.phone && (
              <a
                href={`tel:${data.rider.phone}`}
                className="h-9 w-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"
                aria-label="Call rider"
                title={`Call rider ${riderName}`}
              >
                <Truck size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Participants strip when rider is in chat */}
        {hasRider && (
          <div className="px-4 pb-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <User size={10} className="text-primary" />
              {customerName.split(" ")[0]}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1">
              <Truck size={10} className="text-amber-500" />
              {riderName.split(" ")[0]}
            </span>
            <span className="text-border">·</span>
            <span>You (merchant)</span>
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-36 space-y-2">
        {data.messages.length === 0 && (
          <div className="text-center py-10 text-xs text-muted-foreground">
            {hasRider
              ? `Say hi to ${customerName.split(" ")[0]} and ${riderName.split(" ")[0]} — they'll get a notification.`
              : `Say hi to ${customerName.split(" ")[0]} — they'll get a notification.`}
          </div>
        )}

        {data.messages.map((m: any) => {
          const mine = m.sender_id === user?.id;
          const isRider = m.sender_id === data.chat?.rider_id;
          const label = !mine ? getSenderLabel(m.sender_id) : null;
          const icon = !mine ? getSenderIcon(m.sender_id) : null;

          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[78%] space-y-0.5">
                {!mine && label && (
                  <div
                    className={`text-[10px] font-semibold px-1 flex items-center gap-0.5 ${
                      isRider ? "text-amber-600" : "text-primary"
                    }`}
                  >
                    {icon}
                    {label}
                  </div>
                )}
                <div
                  className={`px-3.5 py-2 rounded-2xl text-sm shadow-sm ${
                    mine
                      ? "bg-gradient-brand text-primary-foreground rounded-br-sm"
                      : isRider
                      ? "bg-amber-50 border border-amber-200 text-foreground rounded-bl-sm"
                      : "bg-card border border-border rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                  <div
                    className={`text-[9px] mt-0.5 ${
                      mine ? "text-white/75" : isRider ? "text-amber-500/70" : "text-muted-foreground"
                    }`}
                  >
                    {fmtTime(m.sent_at)}
                    {mine && m.read_at ? " · read" : ""}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
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
            placeholder={
              hasRider
                ? `Message ${customerName.split(" ")[0]} & ${riderName.split(" ")[0]}…`
                : "Type a message…"
            }
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
