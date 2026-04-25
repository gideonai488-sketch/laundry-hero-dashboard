import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { useInventory, useUpsertInventory, useDeleteInventory, type LiveInventoryItem } from "@/lib/queries";
import { AlertTriangle, Minus, Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Highest Wash Merchant" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const { merchant } = useAuth();
  const { data = [], isLoading } = useInventory(merchant?.id);
  const upsert = useUpsertInventory(merchant?.id);
  const remove = useDeleteInventory(merchant?.id);
  const [editing, setEditing] = useState<Partial<LiveInventoryItem> | null>(null);

  const lowStock = data.filter((i) => (i.current_qty ?? 0) < (i.reorder_threshold ?? 0));

  const adjust = (it: LiveInventoryItem, delta: number) => {
    upsert.mutate({
      id: it.id,
      merchant_id: it.merchant_id,
      name: it.name,
      current_qty: Math.max(0, (it.current_qty ?? 0) + delta),
    });
  };

  const save = () => {
    if (!editing || !merchant) return;
    if (!editing.name?.trim()) { toast.error("Name required"); return; }
    upsert.mutate(
      {
        id: editing.id,
        merchant_id: merchant.id,
        name: editing.name.trim(),
        sku: editing.sku ?? null,
        unit: editing.unit ?? "unit",
        current_qty: Number(editing.current_qty ?? 0),
        reorder_threshold: Number(editing.reorder_threshold ?? 0),
        preferred_supplier: editing.preferred_supplier ?? null,
        auto_reorder: editing.auto_reorder ?? false,
      },
      {
        onSuccess: () => { toast.success("Saved"); setEditing(null); },
        onError: (e) => toast.error((e as Error).message),
      }
    );
  };

  return (
    <div>
      <AppHeader title="Inventory" subtitle={`${data.length} items · ${lowStock.length} low`} />

      <div className="px-5 mt-2">
        <button onClick={() => setEditing({ current_qty: 0, reorder_threshold: 5, unit: "unit" })} className="w-full p-3 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-brand flex items-center justify-center gap-2">
          <Plus size={18} /> Add item
        </button>
      </div>

      {lowStock.length > 0 && (
        <section className="px-5 mt-3">
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
        {isLoading && <div className="text-center py-12 text-muted-foreground"><Loader2 className="animate-spin mx-auto" /></div>}
        {!isLoading && data.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No items yet.</div>}
        {data.map((i) => {
          const qty = i.current_qty ?? 0;
          const threshold = i.reorder_threshold ?? 0;
          const low = qty < threshold;
          const pct = Math.min(100, (qty / Math.max(1, threshold * 2)) * 100);
          return (
            <div key={i.id} className="bg-card rounded-2xl border border-border shadow-card p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-brand-soft flex items-center justify-center text-2xl">📦</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm truncate">{i.name}</div>
                    {low && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/15 text-warning-foreground">LOW</span>}
                  </div>
                  {i.sku && <div className="text-xs text-muted-foreground mt-0.5">SKU: {i.sku}</div>}
                </div>
                <button onClick={() => setEditing(i)} className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center" aria-label="Edit"><Pencil size={14} /></button>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">In stock</span>
                  <span className="font-bold text-sm">{qty} <span className="text-muted-foreground font-normal">{i.unit ?? ""}</span></span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                  <div className={`h-full rounded-full ${low ? "bg-warning" : "bg-gradient-brand"}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Reorder when below {threshold}</div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => adjust(i, -1)} className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center" aria-label="Decrease"><Minus size={14} /></button>
                <button onClick={() => adjust(i, +1)} className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center" aria-label="Increase"><Plus size={14} /></button>
                <button
                  onClick={() => { if (confirm(`Delete ${i.name}?`)) remove.mutate(i.id, { onSuccess: () => toast.success("Deleted") }); }}
                  className="ml-auto h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center" aria-label="Delete"
                ><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit item" : "New item"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={editing?.name ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>SKU</Label><Input value={editing?.sku ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, sku: e.target.value }))} /></div>
              <div><Label>Unit</Label><Input value={editing?.unit ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, unit: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Current qty</Label><Input type="number" value={editing?.current_qty ?? 0} onChange={(e) => setEditing((p) => ({ ...p!, current_qty: Number(e.target.value) }))} /></div>
              <div><Label>Reorder ≤</Label><Input type="number" value={editing?.reorder_threshold ?? 0} onChange={(e) => setEditing((p) => ({ ...p!, reorder_threshold: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Supplier</Label><Input value={editing?.preferred_supplier ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, preferred_supplier: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={upsert.isPending}>{upsert.isPending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
