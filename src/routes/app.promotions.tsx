import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { usePromotions, useUpsertPromotion, useDeletePromotion, type LivePromotion } from "@/lib/queries";
import { Loader2, Megaphone, Plus, Trash2, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/promotions")({
  head: () => ({ meta: [{ title: "Promotions — Highest Wash Merchant" }] }),
  component: PromotionsPage,
});

function PromotionsPage() {
  const { merchant } = useAuth();
  const { data = [], isLoading } = usePromotions(merchant?.id);
  const upsert = useUpsertPromotion(merchant?.id);
  const remove = useDeletePromotion(merchant?.id);
  const [editing, setEditing] = useState<Partial<LivePromotion> | null>(null);

  const active = data.filter((p) => p.active).length;

  const save = () => {
    if (!editing || !merchant) return;
    upsert.mutate(
      {
        id: editing.id,
        merchant_id: merchant.id,
        code: editing.code ?? null,
        description: editing.description ?? null,
        discount_pct: editing.discount_pct ?? 10,
        starts_at: editing.starts_at ?? null,
        ends_at: editing.ends_at ?? null,
        active: editing.active ?? true,
      },
      {
        onSuccess: () => { toast.success("Saved"); setEditing(null); },
        onError: (e) => toast.error((e as Error).message),
      }
    );
  };

  return (
    <div>
      <AppHeader title="Promotions" subtitle={`${active} of ${data.length} active`} />

      <div className="px-5 mt-2">
        <button onClick={() => setEditing({ active: true, discount_pct: 10 })} className="w-full p-3 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-brand flex items-center justify-center gap-2">
          <Plus size={18} /> Create promotion
        </button>
      </div>

      <div className="px-5 mt-4 space-y-3">
        {isLoading && <div className="text-center py-12 text-muted-foreground"><Loader2 className="animate-spin mx-auto" /></div>}
        {!isLoading && data.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No promotions yet.</div>}
        {data.map((p) => (
          <div key={p.id} className="bg-card rounded-2xl border border-border shadow-card p-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-brand-soft text-primary flex items-center justify-center"><Megaphone size={20} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold">{p.code ?? "Promotion"}</div>
                  <Switch
                    checked={!!p.active}
                    onCheckedChange={(v) => upsert.mutate({ id: p.id, merchant_id: p.merchant_id, active: v })}
                  />
                </div>
                {p.description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.description}</p>}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {p.discount_pct != null && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted">{p.discount_pct}% off</span>}
              {p.ends_at && <span className="text-[10px] text-muted-foreground ml-auto">Until {new Date(p.ends_at).toLocaleDateString()}</span>}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setEditing(p)} className="h-9 rounded-lg border border-border text-xs font-semibold flex items-center justify-center gap-1.5"><Pencil size={12} /> Edit</button>
              <button
                onClick={() => { if (confirm("Delete promotion?")) remove.mutate(p.id, { onSuccess: () => toast.success("Deleted") }); }}
                className="h-9 rounded-lg border border-destructive/30 text-destructive text-xs font-semibold flex items-center justify-center gap-1.5"
              ><Trash2 size={12} /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit promotion" : "New promotion"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Code</Label><Input value={editing?.code ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, code: e.target.value }))} placeholder="WELCOME10" /></div>
            <div><Label>Description</Label><Input value={editing?.description ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, description: e.target.value }))} /></div>
            <div><Label>Discount (%)</Label><Input type="number" value={editing?.discount_pct ?? 10} onChange={(e) => setEditing((p) => ({ ...p!, discount_pct: Number(e.target.value) }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Starts</Label><Input type="date" value={editing?.starts_at?.slice(0, 10) ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, starts_at: e.target.value || null }))} /></div>
              <div><Label>Ends</Label><Input type="date" value={editing?.ends_at?.slice(0, 10) ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, ends_at: e.target.value || null }))} /></div>
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
