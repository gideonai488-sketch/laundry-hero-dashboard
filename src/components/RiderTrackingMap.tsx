import { riderTracks } from "@/lib/mock-data";
import { Bike, Phone, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  orderId: string;
}

const stageLabels: Record<string, string> = {
  "en-route-pickup": "En route to pickup",
  "at-pickup": "At pickup location",
  "en-route-delivery": "En route to delivery",
  "at-delivery": "At delivery location",
};

export function RiderTrackingMap({ orderId }: Props) {
  const seed = riderTracks[orderId];
  const [pos, setPos] = useState(seed?.position ?? { x: 50, y: 50 });
  const [trail, setTrail] = useState(seed?.trail ?? []);
  const [eta, setEta] = useState(seed?.etaMin ?? 0);

  useEffect(() => {
    if (!seed) return;
    const id = setInterval(() => {
      setPos((p) => {
        const dx = seed.destination.x - p.x;
        const dy = seed.destination.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.5) return p;
        const step = Math.min(dist, 1.6);
        const next = {
          x: p.x + (dx / dist) * step,
          y: p.y + (dy / dist) * step,
        };
        setTrail((t) => [...t.slice(-15), next]);
        return next;
      });
      setEta((e) => Math.max(0, e - 0.05));
    }, 800);
    return () => clearInterval(id);
  }, [seed]);

  if (!seed) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-card p-4 text-center text-xs text-muted-foreground">
        No active rider for this order yet.
      </div>
    );
  }

  // Build SVG path from trail
  const trailPath = trail.length > 1
    ? "M " + trail.map((p) => `${p.x} ${p.y}`).join(" L ")
    : "";

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Map */}
      <div className="relative h-56 bg-gradient-to-br from-accent via-card to-muted">
        {/* Mock road grid */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--border)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          {/* Major roads */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="var(--muted-foreground)" strokeWidth="0.6" opacity="0.3" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="var(--muted-foreground)" strokeWidth="0.6" opacity="0.3" />
          <line x1="0" y1="20" x2="100" y2="80" stroke="var(--muted-foreground)" strokeWidth="0.4" opacity="0.2" />

          {/* Trail */}
          {trailPath && (
            <path d={trailPath} stroke="var(--primary)" strokeWidth="0.8" fill="none" strokeDasharray="2 1.5" opacity="0.7" />
          )}

          {/* Origin */}
          <circle cx={seed.origin.x} cy={seed.origin.y} r="2" fill="var(--success)" />
          <circle cx={seed.origin.x} cy={seed.origin.y} r="3.5" fill="none" stroke="var(--success)" strokeWidth="0.4" opacity="0.5" />

          {/* Destination */}
          <circle cx={seed.destination.x} cy={seed.destination.y} r="2.2" fill="var(--destructive)" />
          <circle cx={seed.destination.x} cy={seed.destination.y} r="4" fill="none" stroke="var(--destructive)" strokeWidth="0.4" opacity="0.5">
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Rider marker */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-linear"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            <div className="relative h-9 w-9 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-brand ring-2 ring-background">
              <Bike size={16} />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-2 left-2 bg-card/90 backdrop-blur rounded-lg px-2 py-1 text-[10px] flex items-center gap-2 border border-border">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Origin</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Drop-off</span>
        </div>
        <div className="absolute top-2 right-2 bg-card/90 backdrop-blur rounded-lg px-2 py-1 text-[10px] font-bold border border-border">
          ETA <span className="text-primary">{Math.ceil(eta)} min</span>
        </div>
      </div>

      {/* Rider info */}
      <div className="p-4 flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-brand-soft text-primary font-bold flex items-center justify-center shrink-0">
          {seed.riderAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm truncate">{seed.riderName}</div>
          <div className="text-[11px] text-muted-foreground truncate">{seed.vehicle}</div>
          <div className="flex items-center gap-1 mt-0.5 text-[11px]">
            <Star size={10} className="text-warning fill-warning" />
            <span className="font-semibold">{seed.rating}</span>
            <span className="text-muted-foreground">· {stageLabels[seed.stage]}</span>
          </div>
        </div>
        <button
          onClick={() => toast.success(`Calling ${seed.riderName}…`)}
          className="h-10 w-10 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-brand"
          aria-label="Call rider"
        >
          <Phone size={16} />
        </button>
      </div>
    </div>
  );
}
