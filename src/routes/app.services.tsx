import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { services as initial, formatMoney, type Service } from "@/lib/mock-data";
import { Info, Lock } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/app/services")({
  head: () => ({ meta: [{ title: "Services — Highest Wash Merchant" }] }),
  component: ServicesPage,
});

function ServicesPage() {
  const [list, setList] = useState<Service[]>(initial);

  return (
    <div>
      <AppHeader title="Services" subtitle="Pick which services you offer" />

      {/* Admin-managed notice */}
      <div className="px-5 mt-2">
        <div className="rounded-2xl bg-gradient-brand-soft border border-border p-4 flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shrink-0">
            <Info size={16} />
          </div>
          <div className="text-xs">
            <div className="font-bold text-sm">Service catalog is set by Highest Wash</div>
            <p className="text-muted-foreground mt-1 leading-relaxed">
              Our team curates the services and prices customers see across the platform — this keeps
              quality and pricing consistent everywhere. You decide which ones your shop accepts.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-3">
        {list.map((s) => (
          <div key={s.id} className="bg-card rounded-2xl border border-border shadow-card p-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-brand-soft flex items-center justify-center text-2xl">
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold">{s.name}</div>
                  <Switch
                    checked={s.active}
                    onCheckedChange={(v) => {
                      setList((prev) => prev.map((x) => (x.id === s.id ? { ...x, active: v } : x)));
                      toast.success(`${s.name} ${v ? "enabled for your shop" : "paused"}`);
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div className="bg-muted rounded-lg p-2">
                <div className="text-muted-foreground flex items-center gap-1">
                  Price <Lock size={9} />
                </div>
                <div className="font-bold mt-0.5 text-primary">
                  {formatMoney(s.priceMin)}–{s.priceMax}
                </div>
              </div>
              <div className="bg-muted rounded-lg p-2">
                <div className="text-muted-foreground">Turnaround</div>
                <div className="font-semibold mt-0.5">{s.turnaround}</div>
              </div>
              <div className="bg-muted rounded-lg p-2">
                <div className="text-muted-foreground">Bookings</div>
                <div className="font-semibold mt-0.5">{s.bookings}</div>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Lock size={10} /> Pricing managed by platform admins
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 mt-6 mb-2 text-center">
        <p className="text-xs text-muted-foreground">
          Want a service that's not listed? <button onClick={() => toast.success("Request sent to the Highest Wash team")} className="text-primary font-semibold underline-offset-2 hover:underline">Request a new service</button>
        </p>
      </div>
    </div>
  );
}
