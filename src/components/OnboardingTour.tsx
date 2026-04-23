import { useEffect, useState } from "react";
import { onboardingSteps } from "@/lib/mock-data";
import { ChevronRight, X } from "lucide-react";

const STORAGE_KEY = "hw-onboarding-done-v1";

export function OnboardingTour({ force = false, onClose }: { force?: boolean; onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (force) { setOpen(true); setStep(0); return; }
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [force]);

  const finish = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
    setOpen(false);
    onClose?.();
  };

  if (!open) return null;
  const s = onboardingSteps[step];
  const last = step === onboardingSteps.length - 1;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-brand overflow-hidden border border-border animate-in slide-in-from-bottom">
        <div className="h-44 bg-gradient-hero text-primary-foreground relative flex items-center justify-center">
          <button
            onClick={finish}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
            aria-label="Close tour"
          >
            <X size={16} />
          </button>
          <div className="text-7xl">{s.icon}</div>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {onboardingSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-8 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </div>
        <div className="p-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
            Step {step + 1} of {onboardingSteps.length}
          </div>
          <h2 className="text-2xl font-bold">{s.title}</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.body}</p>
          <div className="mt-6 flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((p) => p - 1)}
                className="flex-1 h-12 rounded-xl border border-border text-sm font-semibold hover:bg-accent transition-smooth"
              >
                Back
              </button>
            )}
            {!last ? (
              <button
                onClick={() => setStep((p) => p + 1)}
                className="flex-1 h-12 rounded-xl bg-gradient-brand text-primary-foreground font-bold shadow-brand flex items-center justify-center gap-2"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={finish}
                className="flex-1 h-12 rounded-xl bg-gradient-brand text-primary-foreground font-bold shadow-brand"
              >
                Let's go 🚀
              </button>
            )}
          </div>
          <button
            onClick={finish}
            className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground transition-smooth"
          >
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
}
