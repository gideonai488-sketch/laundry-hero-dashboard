import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { useStaff, useUpsertStaff, useDeleteStaff, type LiveStaff } from "@/lib/queries";
import { Phone, Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/staff")({
  head: () => ({ meta: [{ title: "Staff — Highest Wash Merchant" }] }),
  component: StaffPage,
});

const roleColors: Record<string, string> = {
  manager: "bg-primary/15 text-primary",
  washer: "bg-success/15 text-success",
  driver: "bg-warning/15 text-warning-foreground",
};

function StaffPage() {
  const { merchant } = useAuth();
  const { data = [], isLoading } = useStaff(merchant?.id);
  const upsert = useUpsertStaff(merchant?.id);
  const remove = useDeleteStaff(merchant?.id);
  const [editing, setEditing] = useState<Partial<LiveStaff> | null>(null);

  const save = () => {
    if (!editing || !merchant) return;
    if (!editing.name?.trim()) { toast.error("Name required"); return; }
    upsert.mutate(
      {
        id: editing.id,
        merchant_id: merchant.id,
        name: editing.name.trim(),
        role: editing.role ?? "washer",
        phone: editing.phone ?? null,
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
      <AppHeader title="Staff" subtitle={`${data.length} member${data.length === 1 ? "" : "s"}`} />

      <div className="px-5 mt-2">
        <button
          onClick={() => setEditing({ active: true, role: "washer" })}
          className="w-full p-4 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-brand flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Invite a team member
        </button>
      </div>

      <div className="px-5 mt-4 space-y-2">
        {isLoading && <div className="text-center py-12 text-muted-foreground"><Loader2 className="animate-spin mx-auto" /></div>}
        {!isLoading && data.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No staff yet.</div>}
        {data.map((s) => (
          <div key={s.id} className="bg-card rounded-2xl border border-border shadow-card p-3 flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-brand-soft text-primary font-bold flex items-center justify-center">
                {s.name.slice(0, 2).toUpperCase()}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-card ${s.active ? "bg-success" : "bg-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-sm truncate">{s.name}</div>
                {s.role && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${roleColors[s.role.toLowerCase()] ?? "bg-muted"}`}>{s.role}</span>}
              </div>
              {s.phone && <div className="text-xs text-muted-foreground mt-0.5">{s.phone}</div>}
            </div>
            <button onClick={() => setEditing(s)} className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-smooth" aria-label="Edit">
              <Pencil size={14} />
            </button>
            {s.phone && (
              <a href={`tel:${s.phone}`} className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-smooth" aria-label="Call">
                <Phone size={14} />
              </a>
            )}
            <button
              onClick={() => { if (confirm(`Remove ${s.name}?`)) remove.mutate(s.id, { onSuccess: () => toast.success("Removed") }); }}
              className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit staff" : "New staff"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={editing?.name ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, name: e.target.value }))} /></div>
            <div>
              <Label>Role</Label>
              <select value={editing?.role ?? "washer"} onChange={(e) => setEditing((p) => ({ ...p!, role: e.target.value }))} className="w-full h-10 rounded-md px-3 bg-background border border-input text-sm">
                <option value="manager">Manager</option><option value="washer">Washer</option><option value="driver">Driver</option>
              </select>
            </div>
            <div><Label>Phone</Label><Input value={editing?.phone ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, phone: e.target.value }))} /></div>
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
