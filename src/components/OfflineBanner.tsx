import { useOfflineQueue } from "@/hooks/use-offline-queue";
import { CloudOff, RefreshCw } from "lucide-react";

export function OfflineBanner() {
  const { online, queued } = useOfflineQueue();
  if (online) return null;
  return (
    <div className="sticky top-0 z-40 px-3 py-2 bg-warning text-warning-foreground text-xs font-bold flex items-center gap-2 shadow-card">
      <CloudOff size={14} className="shrink-0" />
      <div className="flex-1 truncate">
        You're offline · {queued} action{queued === 1 ? "" : "s"} queued · will sync when back online
      </div>
      <RefreshCw size={12} className="animate-spin opacity-70" />
    </div>
  );
}
