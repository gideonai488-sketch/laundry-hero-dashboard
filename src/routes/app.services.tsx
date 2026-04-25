import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { useServices, useUpsertService, useDeleteService, type LiveService } from "@/lib/queries";
import { useLocale } from "@/lib/locale";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/services")({
  head: () => ({ meta: [{ title: "Services — Highest Wash Merchant" }] }),
  component: ServicesPage,
});

function ServicesPage() {
  const { merchant } = useAuth();
  const { format } = useLocale();
  const { data = [], isLoading } = useServices(merchant?.id);
  const upsert = useUpsertService(merchant?.id);
  const remove = useDeleteService(merchant?.id);
  const [editing, setEditing] = useState<Partial<LiveService> | null>(null);

  const save = () => {
    if (!editing || !merchant) return;
    if (!editing.name?.trim()) { toast.error("Name required"); return; }
    upsert.mutate(
      {
        id: editing.id,
        merchant_id: merchant.id,
        name: editing.name.trim(),
        description: editing.description ?? null,
        base_price_usd: Number(editing.base_price_usd ?? 0),
        unit: editing.unit ?? "kg",
        turnaround_hours: editing.turnaround_hours ?? 24,
        active: editing.active ?? true,
        ai_pricing_enabled: editing.ai_pricing_enabled ?? false,
      },
      {
        onSuccess: () => { toast.success("Saved"); setEditing(null); },
        onError: (e) => toast.error((e as Error).message),
      }
    );
  };

  return (
    <div>
      <AppHeader title="Services" subtitle={`${data.length} service${data.length === 1 ? "" : "s"}`} />

      <div className="px-5 mt-2">
        <button
          onClick={() => setEditing({ active: true, base_price_usd: 0, unit: "kg", turnaround_hours: 24 })}
          className="w-full p-4 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-brand flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add a service
        </button>
      </div>

      <div className="px-5 mt-4 space-y-3">
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground"><Loader2 className="animate-spin mx-auto" /></div>
        )}
        {!isLoading && data.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No services yet — add one above.</div>
        )}
        {data.map((s) => (
          <div key={s.id} className="bg-card rounded-2xl border border-border shadow-card p-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-brand-soft flex items-center justify-center text-2xl">🧺</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold truncate">{s.name}</div>
                  <Switch
                    checked={!!s.active}
                    onCheckedChange={(v) => upsert.mutate({ id: s.id, merchant_id: s.merchant_id, name: s.name, base_price_usd: s.base_price_usd, active: v })}
                  />
                </div>
                {s.description && <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div className="bg-muted rounded-lg p-2">
                <div className="text-muted-foreground">Price</div>
                <div className="font-bold mt-0.5 text-primary">{format(Number(s.base_price_usd))}</div>
              </div>
              <div className="bg-muted rounded-lg p-2">
                <div className="text-muted-foreground">Unit</div>
                <div className="font-semibold mt-0.5">{s.unit ?? "—"}</div>
              </div>
              <div className="bg-muted rounded-lg p-2">
                <div className="text-muted-foreground">Turnaround</div>
                <div className="font-semibold mt-0.5">{s.turnaround_hours ?? "—"}h</div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setEditing(s)} className="h-9 rounded-lg border border-border text-xs font-semibold flex items-center justify-center gap-1.5">
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${s.name}"?`)) {
                    remove.mutate(s.id, { onSuccess: () => toast.success("Deleted"), onError: (e) => toast.error((e as Error).message) });
                  }
                }}
                className="h-9 rounded-lg border border-destructive/30 text-destructive text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit service" : "New service"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={editing?.name ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Input value={editing?.description ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, description: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Price ($)</Label><Input type="number" step="0.01" value={editing?.base_price_usd ?? 0} onChange={(e) => setEditing((p) => ({ ...p!, base_price_usd: Number(e.target.value) }))} /></div>
              <div><Label>Unit</Label><Input value={editing?.unit ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, unit: e.target.value }))} /></div>
              <div><Label>Hours</Label><Input type="number" value={editing?.turnaround_hours ?? 24} onChange={(e) => setEditing((p) => ({ ...p!, turnaround_hours: Number(e.target.value) }))} /></div>
            </div>
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
