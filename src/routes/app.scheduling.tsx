import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { shiftWeek, aiShiftSuggestions } from "@/lib/mock-data";
import { Calendar, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/scheduling")({
  head: () => ({ meta: [{ title: "Staff scheduling — Highest Wash Merchant" }] }),
  component: SchedulingPage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function SchedulingPage() {
  return (
    <div>
      <AppHeader title="Scheduling" subtitle="Plan shifts with AI help" />

      <section className="px-5 mt-2">
        <div className="rounded-2xl bg-gradient-brand-soft border border-primary/30 p-3 flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">AI suggests adding {aiShiftSuggestions.length} shifts</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Forecast shows Thu–Sat above capacity. Add Fatima H. to recover ~$420/wk.</div>
            <button onClick={() => toast.success("AI shifts added to roster")} className="mt-2 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-gradient-brand text-primary-foreground shadow-brand">Accept all</button>
          </div>
        </div>
      </section>

      <section className="px-5 mt-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
          <Calendar size={11} /> Week of Apr 21
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          {days.map((day) => {
            const shifts = [...shiftWeek, ...aiShiftSuggestions].filter((s) => s.day === day);
            return (
              <div key={day} className="border-b border-border last:border-b-0 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-sm">{day}</div>
                  <button onClick={() => toast.info(`Add shift for ${day}`)} className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center" aria-label="Add shift">
                    <Plus size={12} />
                  </button>
                </div>
                {shifts.length === 0 ? (
                  <div className="text-[11px] text-muted-foreground">No shifts</div>
                ) : (
                  <div className="space-y-1.5">
                    {shifts.map((s, i) => (
                      <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${s.aiSuggested ? "bg-gradient-brand-soft border border-primary/30" : "bg-muted"}`}>
                        <div className="h-7 w-7 rounded-lg bg-card text-primary font-bold flex items-center justify-center text-[10px] shrink-0">{s.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{s.staffName}</div>
                          <div className="text-[10px] text-muted-foreground">{s.role} · {s.start}–{s.end}</div>
                        </div>
                        {s.aiSuggested && (
                          <span className="text-[9px] font-bold text-primary bg-card px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles size={9} /> AI
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
