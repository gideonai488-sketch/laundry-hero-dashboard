import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { supplyOrders } from "@/lib/mock-data";
import { useLocale } from "@/lib/locale";
import { Bot, Check, Clock, Package, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/supplies")({
  head: () => ({ meta: [{ title: "Supplies auto-reorder — Highest Wash Merchant" }] }),
  component: SuppliesPage,
});

const statusTone: Record<string, string> = {
  "auto-placed": "bg-primary/15 text-primary",
  "pending-approval": "bg-warning/15 text-warning-foreground",
  "delivered": "bg-success/15 text-success",
};

function SuppliesPage() {
  const { format } = useLocale();
  const [autoReorder, setAutoReorder] = useState(true);

  return (
    <div>
      <AppHeader title="Supplies auto-reorder" subtitle="AI keeps you stocked" />

      <section className="px-5 mt-2">
        <div className="rounded-2xl bg-card border border-border shadow-card p-4 flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shrink-0">
            <Bot size={18} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">AI auto-reorder</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">When stock drops below threshold, AI orders from your approved suppliers.</div>
          </div>
          <button
            onClick={() => { setAutoReorder((v) => !v); toast.success(`Auto-reorder ${!autoReorder ? "enabled" : "disabled"}`); }}
            className={`h-6 w-11 rounded-full transition-smooth relative ${autoReorder ? "bg-gradient-brand" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${autoReorder ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </section>

      <section className="px-5 mt-4">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5"><Sparkles size={14} /> Recent supply orders</h3>
        <div className="space-y-2">
          {supplyOrders.map((o) => (
            <div key={o.id} className="bg-card rounded-2xl border border-border shadow-card p-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-brand-soft text-primary flex items-center justify-center shrink-0">
                  <Package size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm truncate">{o.itemName}</div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusTone[o.status]}`}>{o.status.replace("-", " ")}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{o.qty} · {o.supplier}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="text-[11px] flex items-center gap-1 text-muted-foreground"><Clock size={11} /> ETA {o.eta}</div>
                    <div className="font-bold text-sm">{format(o.amount)}</div>
                  </div>
                  {o.status === "pending-approval" && (
                    <button onClick={() => toast.success(`Approved ${o.itemName}`)} className="mt-2 w-full py-1.5 text-[11px] font-bold rounded-lg bg-gradient-brand text-primary-foreground shadow-brand flex items-center justify-center gap-1">
                      <Check size={12} /> Approve order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
