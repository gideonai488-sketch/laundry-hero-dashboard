import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { promotions as initial, type Promotion } from "@/lib/mock-data";
import { Info, Megaphone, Sparkles, Tag } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/app/promotions")({
  head: () => ({ meta: [{ title: "Promotions — Highest Wash Merchant" }] }),
  component: PromotionsPage,
});

const badgeMeta: Record<Promotion["badge"], { label: string; tone: string; icon: typeof Tag }> = {
  new: { label: "NEW", tone: "bg-success/15 text-success", icon: Sparkles },
  featured: { label: "FEATURED", tone: "bg-primary/15 text-primary", icon: Megaphone },
  seasonal: { label: "SEASONAL", tone: "bg-warning/15 text-warning-foreground", icon: Tag },
};

function PromotionsPage() {
  const [list, setList] = useState<Promotion[]>(initial);

  const optedIn = list.filter((p) => p.optedIn).length;

  return (
    <div>
      <AppHeader title="Promotions" subtitle={`${optedIn} of ${list.length} active`} />

      <div className="px-5 mt-2">
        <div className="rounded-2xl bg-gradient-brand-soft border border-border p-4 flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shrink-0">
            <Info size={16} />
          </div>
          <div className="text-xs">
            <div className="font-bold text-sm">Campaigns are designed by Highest Wash</div>
            <p className="text-muted-foreground mt-1 leading-relaxed">
              Toggle the ones you want to participate in. Customers see your shop in featured carousels
              while a campaign is active.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-3">
        {list.map((p) => {
          const meta = badgeMeta[p.badge];
          const Icon = meta.icon;
          return (
            <div key={p.id} className="bg-card rounded-2xl border border-border shadow-card p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-brand-soft text-primary flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold">{p.name}</div>
                    <Switch
                      checked={p.optedIn}
                      onCheckedChange={(v) => {
                        setList((prev) => prev.map((x) => (x.id === p.id ? { ...x, optedIn: v } : x)));
                        toast.success(v ? `Joined "${p.name}"` : `Left "${p.name}"`);
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.description}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.tone}`}>{meta.label}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted">{p.discount}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">Until {p.validUntil}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
