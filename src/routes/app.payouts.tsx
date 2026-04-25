import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { usePayouts } from "@/lib/queries";
import { useLocale } from "@/lib/locale";
import { Wallet, ArrowDownToLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/app/payouts")({
  head: () => ({ meta: [{ title: "Payouts — Highest Wash Merchant" }] }),
  component: PayoutsPage,
});

const statusTone: Record<string, string> = {
  paid: "text-success",
  processing: "text-warning",
  pending: "text-muted-foreground",
  failed: "text-destructive",
};

function PayoutsPage() {
  const { user } = useAuth();
  const { format } = useLocale();
  const { data: payouts = [], isLoading } = usePayouts(user?.id);

  const available = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount_usd ?? 0), 0);

  return (
    <div>
      <AppHeader title="Payouts" subtitle="Withdraw your earnings" />

      <section className="px-5">
        <div className="rounded-3xl bg-gradient-hero text-primary-foreground p-5 shadow-brand">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Available to withdraw</div>
          <div className="text-4xl font-bold mt-1">{format(available)}</div>
          <div className="text-xs text-white/80 mt-1">{payouts.length ? `${payouts.length} payout${payouts.length === 1 ? "" : "s"} on record` : "Awaiting first payout"}</div>
          <Button
            onClick={() => toast.info("Withdrawal request — awaiting payments edge function")}
            disabled={available <= 0}
            className="w-full mt-4 h-11 rounded-xl bg-white text-primary hover:bg-white/95 font-semibold border-0 disabled:opacity-50"
          >
            <ArrowDownToLine size={16} className="mr-1.5" /> Withdraw now
          </Button>
        </div>
      </section>

      <section className="px-5 mt-5">
        <h3 className="font-bold mb-3">Payout history</h3>
        <div className="space-y-2">
          {isLoading && <div className="text-center py-12 text-muted-foreground"><Loader2 className="animate-spin mx-auto" /></div>}
          {!isLoading && payouts.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No payouts yet.</div>}
          {payouts.map((p) => (
            <div key={p.id} className="bg-card rounded-2xl border border-border shadow-card p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/15 text-success flex items-center justify-center">
                <Wallet size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{p.reference ?? p.id.slice(0, 8)}</div>
                <div className="text-xs text-muted-foreground">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">{format(Number(p.amount_usd ?? 0))}</div>
                <div className={`text-[10px] font-bold uppercase ${statusTone[p.status] ?? "text-muted-foreground"}`}>{p.status}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
