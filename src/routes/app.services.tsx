import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { services as initial, formatGHS, type Service } from "@/lib/mock-data";
import { Plus, Pencil, MoreVertical } from "lucide-react";
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
      <AppHeader title="Services" subtitle="Manage your offerings & prices" />

      <div className="px-5 mt-2">
        <button
          onClick={() => toast.info("Add service form would open")}
          className="w-full p-4 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-brand flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add a new service
        </button>
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
                      toast.success(`${s.name} ${v ? "enabled" : "paused"}`);
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div className="bg-muted rounded-lg p-2">
                <div className="text-muted-foreground">Price</div>
                <div className="font-bold mt-0.5 text-primary">
                  {formatGHS(s.priceMin)}–{s.priceMax}
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

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => toast.info(`Edit ${s.name}`)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-muted hover:bg-accent transition-smooth flex items-center justify-center gap-1.5"
              >
                <Pencil size={12} /> Edit
              </button>
              <button className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-smooth">
                <MoreVertical size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
