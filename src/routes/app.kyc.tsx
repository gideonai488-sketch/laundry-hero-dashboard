import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Building2, Camera, Check, FileCheck2, IdCard, Upload } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/app/kyc")({
  head: () => ({ meta: [{ title: "Verify your business — Highest Wash Merchant" }] }),
  component: KycPage,
});

const steps = [
  { id: "business", label: "Business info", icon: Building2 },
  { id: "id", label: "Owner ID", icon: IdCard },
  { id: "license", label: "License", icon: FileCheck2 },
  { id: "selfie", label: "Selfie check", icon: Camera },
];

function KycPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});

  const completeStep = () => {
    setDone((d) => ({ ...d, [steps[step].id]: true }));
    if (step < steps.length - 1) setStep(step + 1);
    else {
      toast.success("Verification submitted! Review takes 24 hours.");
      navigate({ to: "/app" });
    }
  };

  const Icon = steps[step].icon;

  return (
    <div>
      <AppHeader title="Verify business" subtitle="Required to go live" />

      {/* Progress */}
      <section className="px-5 mt-2">
        <div className="bg-card rounded-2xl border border-border shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center flex-1 relative">
                {i > 0 && (
                  <div className={`absolute right-1/2 top-3 w-full h-0.5 ${done[steps[i - 1].id] ? "bg-gradient-brand" : "bg-muted"}`} />
                )}
                <div
                  className={`relative h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    done[s.id] ? "bg-gradient-brand text-primary-foreground" : i === step ? "bg-primary/15 text-primary border-2 border-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done[s.id] ? <Check size={12} /> : i + 1}
                </div>
                <div className="text-[9px] font-semibold mt-1.5 text-center">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step content */}
      <section className="px-5 mt-4">
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-brand">
            <Icon size={20} />
          </div>
          <h2 className="font-bold text-lg mt-3">{steps[step].label}</h2>

          {step === 0 && (
            <div className="space-y-3 mt-4">
              <div>
                <Label htmlFor="legal">Legal business name</Label>
                <Input id="legal" placeholder="As registered" maxLength={100} className="h-11 rounded-xl mt-1.5" />
              </div>
              <div>
                <Label htmlFor="reg">Registration number</Label>
                <Input id="reg" placeholder="Tax ID / EIN / VAT number" maxLength={50} className="h-11 rounded-xl mt-1.5" />
              </div>
              <div>
                <Label htmlFor="addr">Registered address</Label>
                <Input id="addr" placeholder="Street, city, postcode" maxLength={200} className="h-11 rounded-xl mt-1.5" />
              </div>
            </div>
          )}

          {step === 1 && (
            <UploadDrop label="Upload front of ID" hint="Passport, driver's license or national ID" />
          )}
          {step === 2 && (
            <UploadDrop label="Upload business license" hint="PDF or photo, max 10 MB" />
          )}
          {step === 3 && (
            <UploadDrop label="Take a selfie" hint="We'll match it with your ID" />
          )}

          <button
            onClick={completeStep}
            className="w-full mt-5 h-12 rounded-xl bg-gradient-brand text-primary-foreground font-semibold shadow-brand"
          >
            {step < steps.length - 1 ? "Continue" : "Submit for review"}
          </button>
        </div>
      </section>

      <p className="px-5 mt-4 text-center text-[11px] text-muted-foreground">
        Your data is encrypted and shared only with our compliance team.
      </p>
    </div>
  );
}

function UploadDrop({ label, hint }: { label: string; hint: string }) {
  return (
    <button
      onClick={() => toast.success(`${label} uploaded`)}
      className="w-full mt-4 p-6 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center gap-2 hover:bg-muted/60 transition-smooth"
    >
      <div className="h-10 w-10 rounded-xl bg-gradient-brand-soft text-primary flex items-center justify-center">
        <Upload size={18} />
      </div>
      <div className="font-semibold text-sm">{label}</div>
      <div className="text-[11px] text-muted-foreground">{hint}</div>
    </button>
  );
}
