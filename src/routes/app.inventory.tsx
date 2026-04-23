import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { inventory as initial, type InventoryItem } from "@/lib/mock-data";
import { AlertTriangle, Minus, Plus, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Highest Wash Merchant" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(initial);

  const update = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, inStock: Math.max(0, i.inStock + delta) } : i)),
    );
  };

  const lowStock = items.filter((i) => i.inStock < i.threshold);

  return (
    <div>
      <AppHeader title="Inventory" subtitle={`${items.length} items · ${lowStock.length} low`} />

      {lowStock.length > 0 && (
        <section className="px-5 mt-2">
          <div className="rounded-2xl bg-warning/10 border border-warning/30 p-3 flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-warning/20 text-warning-foreground flex items-center justify-center shrink-0">
              <AlertTriangle size={14} />
            </div>
            <div className="text-xs">
              <div className="font-bold text-sm">{lowStock.length} items running low</div>
              <p className="text-muted-foreground mt-0.5">{lowStock.map((i) => i.name).join(", ")}</p>
            </div>
          </div>
        </section>
      )}

      <div className="px-5 mt-4 space-y-3">
        {items.map((i) => {
          const low = i.inStock < i.threshold;
          const pct = Math.min(100, (i.inStock / (i.threshold * 2)) * 100);
          return (
            <div key={i.id} className="bg-card rounded-2xl border border-border shadow-card p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-brand-soft flex items-center justify-center text-2xl">{i.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm truncate">{i.name}</div>
                    {low && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/15 text-warning-foreground">LOW</span>}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize mt-0.5">{i.category}</div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">In stock</span>
                  <span className="font-bold text-sm">
                    {i.inStock} <span className="text-muted-foreground font-normal">{i.unit}</span>
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full ${low ? "bg-warning" : "bg-gradient-brand"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Reorder when below {i.threshold}</div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => update(i.id, -1)}
                  className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center"
                  aria-label="Decrease"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => update(i.id, +1)}
                  className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center"
                  aria-label="Increase"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => toast.success(`Reorder request sent for ${i.name}`)}
                  className="flex-1 h-9 rounded-lg bg-gradient-brand text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-brand"
                >
                  <Package size={12} /> Reorder
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
