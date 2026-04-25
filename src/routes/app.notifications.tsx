import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/lib/queries";
import { Banknote, Bell, ClipboardList, Loader2, Settings, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Highest Wash Merchant" }] }),
  component: NotificationsPage,
});

const iconFor = (kind: string) => {
  if (kind.includes("order")) return ClipboardList;
  if (kind.includes("payout") || kind.includes("payment")) return Banknote;
  if (kind.includes("review")) return Star;
  return Settings;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotificationsPage() {
  const { user } = useAuth();
  const { data: notifications = [], isLoading } = useNotifications(user?.id);
  const markRead = useMarkNotificationRead(user?.id);
  const markAll = useMarkAllNotificationsRead(user?.id);

  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <div>
      <AppHeader title="Notifications" subtitle={`${unread} unread`} />

      <div className="px-5 mt-2 flex items-center justify-end">
        <button
          onClick={() => markAll.mutate(undefined, { onSuccess: () => toast.success("All marked as read") })}
          disabled={unread === 0 || markAll.isPending}
          className="text-[11px] font-bold text-primary disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>

      <div className="px-5 mt-3 space-y-2">
        {isLoading && <div className="text-center py-12 text-muted-foreground"><Loader2 className="animate-spin mx-auto" /></div>}
        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="mx-auto mb-2 opacity-40" size={28} />
            <p className="text-sm">No notifications yet.</p>
          </div>
        )}
        {notifications.map((n) => {
          const Icon = iconFor(n.kind);
          const isRead = !!n.read_at;
          return (
            <button
              key={n.id}
              onClick={() => !isRead && markRead.mutate(n.id)}
              className={`w-full text-left bg-card rounded-2xl border border-border shadow-card p-3 flex items-start gap-3 ${!isRead ? "ring-1 ring-primary/30" : ""}`}
            >
              <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-sm truncate">{n.title}</div>
                  {!isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                </div>
                {n.body && <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>}
                <div className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.created_at)}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-5 mt-6 text-center">
        <Link to="/app/voice-history" className="text-xs text-primary font-bold">View voice command audit trail →</Link>
      </div>
    </div>
  );
}
