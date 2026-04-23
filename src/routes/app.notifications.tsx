import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { notifications } from "@/lib/mock-data";
import { Banknote, Bell, ClipboardList, Star, Settings } from "lucide-react";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Highest Wash Merchant" }] }),
  component: NotificationsPage,
});

const iconMap = {
  order: ClipboardList,
  payment: Banknote,
  review: Star,
  system: Settings,
};

const toneMap = {
  order: "bg-primary/15 text-primary",
  payment: "bg-success/15 text-success",
  review: "bg-warning/15 text-warning-foreground",
  system: "bg-muted text-muted-foreground",
};

function NotificationsPage() {
  return (
    <div>
      <AppHeader title="Notifications" subtitle={`${notifications.filter((n) => !n.read).length} unread`} />

      <div className="px-5 mt-2 space-y-2">
        {notifications.map((n) => {
          const Icon = iconMap[n.type];
          return (
            <div
              key={n.id}
              className={`bg-card rounded-2xl border border-border shadow-card p-3 flex items-start gap-3 ${!n.read ? "ring-1 ring-primary/30" : ""}`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${toneMap[n.type]}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-sm truncate">{n.title}</div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{n.time}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 mt-6 text-center">
        <Bell className="mx-auto text-muted-foreground/40 mb-2" size={24} />
        <p className="text-xs text-muted-foreground">You're all caught up</p>
      </div>
    </div>
  );
}
