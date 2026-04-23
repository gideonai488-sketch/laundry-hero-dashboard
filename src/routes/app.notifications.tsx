import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { notificationGroups, notifications } from "@/lib/mock-data";
import { Banknote, Bell, ClipboardList, Settings, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Highest Wash Merchant" }] }),
  component: NotificationsPage,
});

const iconMap = { order: ClipboardList, payment: Banknote, review: Star, system: Settings };
const toneMap: Record<string, string> = {
  high: "border-destructive/40 bg-destructive/5",
  medium: "border-warning/40 bg-warning/5",
  low: "border-border bg-card",
};

function NotificationsPage() {
  const [readMap, setReadMap] = useState<Record<string, boolean>>({});
  const [snoozed, setSnoozed] = useState<Record<string, boolean>>({});

  const visibleGroups = notificationGroups.filter((g) => !snoozed[g.id]);
  const unread = notifications.filter((n) => !n.read && !readMap[n.id]).length;

  return (
    <div>
      <AppHeader title="Notifications" subtitle={`${unread} unread · AI grouped`} />

      <div className="px-5 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
          <Sparkles size={11} /> AI digest
        </div>
        <button onClick={() => { setReadMap({}); toast.success("All marked as read"); }} className="text-[11px] font-bold text-primary">Mark all read</button>
      </div>

      <div className="px-5 mt-3 space-y-2.5">
        {visibleGroups.map((g) => {
          const Icon = iconMap[g.type];
          return (
            <div key={g.id} className={`rounded-2xl border-2 ${toneMap[g.priority]} p-4 shadow-card`}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shrink-0 shadow-brand">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-sm truncate">{g.title}</div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${g.priority === "high" ? "bg-destructive/20 text-destructive" : g.priority === "medium" ? "bg-warning/20 text-warning-foreground" : "bg-muted text-muted-foreground"}`}>
                      {g.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{g.summary}</p>
                  <ul className="mt-2 space-y-1">
                    {g.items.map((it, i) => (
                      <li key={i} className="text-[11px] text-foreground/80 pl-2 border-l-2 border-primary/30">{it}</li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center gap-2">
                    {g.actionLabel && (
                      <button onClick={() => toast.success(`${g.actionLabel}…`)} className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-gradient-brand text-primary-foreground shadow-brand">
                        {g.actionLabel}
                      </button>
                    )}
                    <button onClick={() => { setSnoozed((p) => ({ ...p, [g.id]: true })); toast(`Snoozed for 1 hr`); }} className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-border hover:bg-accent">
                      Snooze
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 mt-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">All notifications</div>
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = iconMap[n.type];
            const isRead = n.read || readMap[n.id];
            return (
              <button key={n.id} onClick={() => setReadMap((p) => ({ ...p, [n.id]: true }))} className={`w-full text-left bg-card rounded-2xl border border-border shadow-card p-3 flex items-start gap-3 ${!isRead ? "ring-1 ring-primary/30" : ""}`}>
                <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm truncate">{n.title}</div>
                    {!isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{n.time}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-6 text-center">
        <Bell className="mx-auto text-muted-foreground/40 mb-2" size={24} />
        <Link to="/app/voice-history" className="text-xs text-primary font-bold">View voice command audit trail →</Link>
      </div>
    </div>
  );
}
