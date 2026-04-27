import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, MessageCircle, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { useMyChats } from "@/lib/queries";

export const Route = createFileRoute("/app/messages")({
  head: () => ({ meta: [{ title: "Messages — Highest Wash Merchant" }] }),
  component: MessagesPage,
});

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function MessagesPage() {
  const { merchant } = useAuth();
  const { data: chats = [], isLoading } = useMyChats(merchant?.id);

  return (
    <div>
      <AppHeader title="Messages" subtitle="Chat with your customers" />

      <div className="px-5 mt-2 space-y-2">
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="animate-spin mx-auto" size={20} />
          </div>
        )}
        {!isLoading && chats.length === 0 && (
          <div className="text-center py-14 rounded-2xl border border-dashed border-border">
            <MessageCircle className="mx-auto mb-2 opacity-40" size={28} />
            <p className="text-sm text-muted-foreground">No conversations yet.</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              When you accept a customer's order, a chat opens automatically.
            </p>
          </div>
        )}
        {chats.map((c: any) => {
          const name = c.customer?.full_name ?? "Customer";
          const initials = name.slice(0, 2).toUpperCase();
          const preview = c.last_message?.body ?? "Tap to start chatting";
          const isMine = c.last_message?.sender_id === merchant?.id;
          return (
            <Link
              key={c.id}
              to="/app/messages/$chatId"
              params={{ chatId: c.id }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border shadow-card"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center font-bold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-sm truncate">{name}</div>
                  <div className="text-[10px] text-muted-foreground shrink-0">
                    {timeAgo(c.last_message?.sent_at ?? c.last_message_at)}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <div className="text-xs text-muted-foreground truncate">
                    {isMine ? "You: " : ""}
                    {preview}
                  </div>
                  {c.unread_count > 0 ? (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                      {c.unread_count > 9 ? "9+" : c.unread_count}
                    </span>
                  ) : (
                    <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                  )}
                </div>
                {c.order && (
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    Order #{String(c.order_id).slice(0, 6)} · {String(c.order.delivery_status ?? "pending").replace(/_/g, " ")}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
