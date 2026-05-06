import { NotificationBell } from "./NotificationBell";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  hideBell?: boolean;
}

export function AppHeader({ title, subtitle, right, hideBell }: AppHeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/50"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="px-5 py-3 flex items-center justify-between gap-2 min-h-[56px]">
        <div className="min-w-0 flex-1">
          {title && <h1 className="text-xl font-bold leading-tight truncate">{title}</h1>}
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {right}
          {!hideBell && <NotificationBell />}
        </div>
      </div>
    </header>
  );
}
