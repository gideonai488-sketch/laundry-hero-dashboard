import { Bell, MapPin, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { merchantProfile } from "@/lib/mock-data";
import { VoiceCommandBar } from "./VoiceCommandBar";
import { LocaleBadge } from "./LocaleBadge";
import { useLocale } from "@/lib/locale";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showLocation?: boolean;
}

export function AppHeader({ title, subtitle, showLocation }: AppHeaderProps) {
  const { t } = useLocale();
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="px-5 py-4 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          {showLocation ? (
            <>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground font-medium">{t("welcomeBack")}</div>
                <LocaleBadge />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin size={14} className="text-primary shrink-0" />
                <div className="text-sm font-bold truncate">{merchantProfile.businessName}</div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold leading-tight truncate">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <VoiceCommandBar />
          <Link
            to="/app/search"
            className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-smooth"
            aria-label="Search"
          >
            <Search size={18} />
          </Link>
          <Link
            to="/app/notifications"
            className="relative h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-smooth"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          </Link>
        </div>
      </div>
    </header>
  );
}
