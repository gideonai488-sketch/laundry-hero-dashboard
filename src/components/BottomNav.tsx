import { Link, useLocation } from "@tanstack/react-router";
import { Home, ClipboardList, BarChart3, MessageSquare, User } from "lucide-react";

const items = [
  { to: "/app" as const, label: "Home", icon: Home, exact: true },
  { to: "/app/orders" as const, label: "Orders", icon: ClipboardList },
  { to: "/app/earnings" as const, label: "Earnings", icon: BarChart3 },
  { to: "/app/chat" as const, label: "Chat", icon: MessageSquare },
  { to: "/app/profile" as const, label: "Profile", icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 px-3 pb-3 pt-2">
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-3xl shadow-card px-2 py-2 flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? path === item.to : path.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl transition-smooth min-w-[56px] ${
                isActive
                  ? "bg-gradient-brand text-primary-foreground shadow-brand"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-semibold ${isActive ? "" : ""}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
