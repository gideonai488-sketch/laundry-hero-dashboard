import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { reports, type Report } from "@/lib/mock-data";
import { Download, FileSpreadsheet, FileText, Receipt } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports")({
  head: () => ({ meta: [{ title: "Reports — Highest Wash Merchant" }] }),
  component: ReportsPage,
});

const typeMeta: Record<Report["type"], { icon: typeof FileText; label: string; tone: string }> = {
  statement: { icon: FileText, label: "Statement", tone: "bg-primary/15 text-primary" },
  "tax-invoice": { icon: Receipt, label: "Tax invoice", tone: "bg-success/15 text-success" },
  "order-export": { icon: FileSpreadsheet, label: "Order export", tone: "bg-warning/15 text-warning-foreground" },
};

function ReportsPage() {
  return (
    <div>
      <AppHeader title="Reports" subtitle="Statements, tax invoices & exports" />

      <section className="px-5 mt-2">
        <div className="rounded-2xl bg-gradient-hero text-primary-foreground p-4 shadow-brand">
          <div className="text-xs font-bold uppercase tracking-widest text-white/80">Quick export</div>
          <div className="text-lg font-bold mt-1">Generate a custom report</div>
          <p className="text-xs text-white/80 mt-1">Pick a date range and we'll prepare CSV + PDF.</p>
          <button
            onClick={() => toast.success("Custom report generation started")}
            className="mt-3 px-4 py-2 rounded-xl bg-white text-primary text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Download size={12} /> New export
          </button>
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-2">Recent</div>
        <div className="bg-card rounded-2xl border border-border shadow-card divide-y divide-border">
          {reports.map((r) => {
            const meta = typeMeta[r.type];
            const Icon = meta.icon;
            return (
              <div key={r.id} className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${meta.tone}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{r.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {meta.label} · {r.size} · Generated {r.generatedAt}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toast.success(`${r.name}.csv downloaded`)}
                    className="px-3 h-9 rounded-lg bg-card border border-border text-[11px] font-bold"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => toast.success(`${r.name}.pdf downloaded`)}
                    className="px-3 h-9 rounded-lg bg-gradient-brand text-primary-foreground text-[11px] font-bold shadow-brand"
                  >
                    PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <p className="px-5 mt-4 text-center text-[11px] text-muted-foreground">
        Reports are kept for 7 years for tax compliance.
      </p>
    </div>
  );
}
