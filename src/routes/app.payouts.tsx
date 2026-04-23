import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { payouts } from "@/lib/mock-data";
import { useLocale } from "@/lib/locale";
import { Wallet, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/app/payouts")({
  head: () => ({ meta: [{ title: "Payouts — Highest Wash Merchant" }] }),
  component: PayoutsPage,
});

function PayoutsPage() {
  const { format: formatGHS } = useLocale();
  return (
    <div>
      <AppHeader title="Payouts" subtitle="Withdraw your earnings" />

      <section className="px-5">
        <div className="rounded-3xl bg-gradient-hero text-primary-foreground p-5 shadow-brand">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Available to withdraw</div>
          <div className="text-4xl font-bold mt-1">{formatGHS(2420)}</div>
          <div className="text-xs text-white/80 mt-1">Next auto-payout: Mon, Apr 29 · Stripe •••821</div>
          <Button
            onClick={() => toast.success("Withdrawal request sent · $2,420")}
            className="w-full mt-4 h-11 rounded-xl bg-white text-primary hover:bg-white/95 font-semibold border-0"
          >
            <ArrowDownToLine size={16} className="mr-1.5" /> Withdraw now
          </Button>
        </div>
      </section>

      <section className="px-5 mt-5">
        <h3 className="font-bold mb-3">Payout history</h3>
        <div className="space-y-2">
          {payouts.map((p) => (
            <div key={p.id} className="bg-card rounded-2xl border border-border shadow-card p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/15 text-success flex items-center justify-center">
                <Wallet size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{p.method}</div>
                <div className="text-xs text-muted-foreground">{p.id} · {p.date}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">{formatGHS(p.amount)}</div>
                <div className="text-[10px] text-success font-bold uppercase">{p.status}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
