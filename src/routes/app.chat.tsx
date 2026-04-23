import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { chats } from "@/lib/mock-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/app/chat")({
  head: () => ({ meta: [{ title: "Messages — Highest Wash Merchant" }] }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <div>
      <AppHeader title="Messages" subtitle="Talk to your customers" />

      <div className="px-5 mt-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            placeholder="Search chats..."
            className="w-full h-11 pl-9 pr-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="mt-4 px-2">
        {chats.map((c) => (
          <button
            key={c.id}
            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-accent transition-smooth text-left"
          >
            <div className="relative shrink-0">
              <div className="h-12 w-12 rounded-full bg-gradient-brand text-primary-foreground font-bold flex items-center justify-center">
                {c.avatar}
              </div>
              {c.unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
                  {c.unread}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-sm truncate">{c.customer}</div>
                <div className="text-[10px] text-muted-foreground shrink-0">{c.time}</div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="text-[10px] text-primary font-semibold">{c.orderId}</div>
                <div className="text-xs text-muted-foreground truncate flex-1">{c.lastMessage}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="px-5 mt-6">
        <Link to="/app/notifications" className="block p-4 rounded-2xl bg-gradient-brand-soft border border-border text-center text-sm font-semibold text-primary">
          View all notifications →
        </Link>
      </div>
    </div>
  );
}
