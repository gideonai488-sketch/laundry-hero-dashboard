import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { useChats } from "@/lib/queries";
import { Loader2, MessageSquare, Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/app/chat")({
  head: () => ({ meta: [{ title: "Messages — Highest Wash Merchant" }] }),
  component: ChatPage,
});

function timeAgo(iso: string | null | undefined) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function ChatPage() {
  const { merchant } = useAuth();
  const { data: chats = [], isLoading } = useChats(merchant?.id);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return chats;
    const t = q.toLowerCase();
    return chats.filter((c) => {
      const name = c.customer?.full_name ?? "";
      const last = c.last_message?.body ?? "";
      return name.toLowerCase().includes(t) || last.toLowerCase().includes(t);
    });
  }, [chats, q]);

  return (
    <div>
      <AppHeader title="Messages" subtitle={`${chats.length} conversation${chats.length === 1 ? "" : "s"}`} />

      <div className="px-5 mt-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search chats..."
            className="w-full h-11 pl-9 pr-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="mt-4 px-2">
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading chats…</p>
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="mx-auto mb-2 opacity-40" size={28} />
            <p className="text-sm">No conversations yet.</p>
          </div>
        )}
        {filtered.map((c) => {
          const name = c.customer?.full_name ?? "Customer";
          const avatar = name.slice(0, 2).toUpperCase();
          const last = c.last_message?.body ?? "Tap to open chat";
          return (
            <Link
              key={c.id}
              to="/app/message/$chatId"
              params={{ chatId: c.id }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-accent transition-smooth text-left"
            >
              <div className="relative shrink-0">
                <div className="h-12 w-12 rounded-full bg-gradient-brand text-primary-foreground font-bold flex items-center justify-center">
                  {avatar}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-sm truncate">{name}</div>
                  <div className="text-[10px] text-muted-foreground shrink-0">{timeAgo(c.last_message?.sent_at ?? c.last_message_at)}</div>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {c.order_id && <div className="text-[10px] text-primary font-semibold">{c.order_id.slice(0, 8)}</div>}
                  <div className="text-xs text-muted-foreground truncate flex-1">{last}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="px-5 mt-6">
        <Link to="/app/notifications" className="block p-4 rounded-2xl bg-gradient-brand-soft border border-border text-center text-sm font-semibold text-primary">
          View all notifications →
        </Link>
      </div>
    </div>
  );
}
