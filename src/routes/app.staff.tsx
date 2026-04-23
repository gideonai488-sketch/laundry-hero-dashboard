import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { staff } from "@/lib/mock-data";
import { Phone, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/staff")({
  head: () => ({ meta: [{ title: "Staff — Highest Wash Merchant" }] }),
  component: StaffPage,
});

const roleColors: Record<string, string> = {
  Manager: "bg-primary/15 text-primary",
  Washer: "bg-success/15 text-success",
  Driver: "bg-warning/15 text-warning-foreground",
};

function StaffPage() {
  return (
    <div>
      <AppHeader title="Staff" subtitle="Your team" />

      <div className="px-5 mt-2">
        <button
          onClick={() => toast.info("Invite staff form would open")}
          className="w-full p-4 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-brand flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Invite a team member
        </button>
      </div>

      <div className="px-5 mt-4 space-y-2">
        {staff.map((s) => (
          <div key={s.id} className="bg-card rounded-2xl border border-border shadow-card p-3 flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-brand-soft text-primary font-bold flex items-center justify-center">
                {s.avatar}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-card ${s.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-sm truncate">{s.name}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColors[s.role]}`}>{s.role}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.phone}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.ordersHandled} orders handled</div>
            </div>
            <button className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-smooth">
              <Phone size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
