import { Link, useLocation } from "@tanstack/react-router";
import { Home, ClipboardList, MessageCircle, Wallet, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useMyChats } from "@/lib/queries";

const items = [
  { to: "/app" as const, label: "Home", icon: Home, exact: true },
  { to: "/app/orders" as const, label: "Orders", icon: ClipboardList },
  { to: "/app/messages" as const, label: "Chat", icon: MessageCircle, badgeKey: "chat" as const },
  { to: "/app/earnings" as const, label: "Wallet", icon: Wallet },
  { to: "/app/settings" as const, label: "Settings", icon: Settings },
];

export function BottomNav() {
  const location = useLocation();
  const path = location.pathname;
  const { merchant } = useAuth();
  const { data: chats = [] } = useMyChats(merchant?.id);
  const unread = chats.reduce((sum: number, c: any) => sum + (c.unread_count ?? 0), 0);

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 px-3 pt-2"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-3xl shadow-card px-1.5 py-2 flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? path === item.to : path.startsWith(item.to);
          const badge = item.badgeKey === "chat" && unread > 0 ? unread : 0;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-2.5 py-2 rounded-2xl transition-smooth min-w-[56px] min-h-[52px] active:scale-95 ${
                isActive
                  ? "bg-gradient-brand text-primary-foreground shadow-brand"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{item.label}</span>
              {badge > 0 && (
                <span className="absolute top-0.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
