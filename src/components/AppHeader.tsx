interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function AppHeader({ title, subtitle, right }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="px-5 py-4 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          {title && <h1 className="text-xl font-bold leading-tight truncate">{title}</h1>}
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
        {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
      </div>
    </header>
  );
}
