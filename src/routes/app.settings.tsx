import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { defaultHours, type OperatingHours } from "@/lib/mock-data";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar, Clock, MapPin, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Shop settings — Highest Wash Merchant" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [hours, setHours] = useState<OperatingHours[]>(defaultHours);
  const [autoAccept, setAutoAccept] = useState(true);
  const [autoMax, setAutoMax] = useState(60);
  const [autoRadius, setAutoRadius] = useState(5);
  const [voice, setVoice] = useState(false);
  const [vacation, setVacation] = useState(false);
  const [radius, setRadius] = useState([5]);
  const [capacity, setCapacity] = useState(20);

  return (
    <div>
      <AppHeader title="Shop settings" subtitle="Hours, capacity & pickup rules" />

      {/* Operating hours */}
      <section className="px-5 mt-2">
        <SectionTitle icon={<Clock size={14} />}>Operating hours</SectionTitle>
        <div className="bg-card rounded-2xl border border-border shadow-card divide-y divide-border">
          {hours.map((h, idx) => (
            <div key={h.day} className="p-3 flex items-center gap-3">
              <div className="w-10 text-sm font-bold">{h.day}</div>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  type="time"
                  value={h.open}
                  disabled={h.closed}
                  onChange={(e) =>
                    setHours((prev) => prev.map((x, i) => (i === idx ? { ...x, open: e.target.value } : x)))
                  }
                  className="h-9 rounded-lg text-xs"
                />
                <span className="text-muted-foreground text-xs">→</span>
                <Input
                  type="time"
                  value={h.close}
                  disabled={h.closed}
                  onChange={(e) =>
                    setHours((prev) => prev.map((x, i) => (i === idx ? { ...x, close: e.target.value } : x)))
                  }
                  className="h-9 rounded-lg text-xs"
                />
              </div>
              <Switch
                checked={!h.closed}
                onCheckedChange={(v) =>
                  setHours((prev) => prev.map((x, i) => (i === idx ? { ...x, closed: !v } : x)))
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* Capacity */}
      <section className="px-5 mt-6">
        <SectionTitle icon={<Sparkles size={14} />}>Daily capacity</SectionTitle>
        <div className="bg-card rounded-2xl border border-border shadow-card p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-sm">Max orders per day</div>
            <div className="text-2xl font-bold text-primary">{capacity}</div>
          </div>
          <Slider
            value={[capacity]}
            onValueChange={(v) => setCapacity(v[0])}
            min={5}
            max={80}
            step={1}
            className="mt-3"
          />
          <div className="text-xs text-muted-foreground mt-2">New orders pause once you hit capacity.</div>
        </div>
      </section>

      {/* Pickup radius */}
      <section className="px-5 mt-6">
        <SectionTitle icon={<MapPin size={14} />}>Pickup radius</SectionTitle>
        <div className="bg-card rounded-2xl border border-border shadow-card p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-sm">Max distance</div>
            <div className="text-2xl font-bold text-primary">{radius[0]} km</div>
          </div>
          <Slider value={radius} onValueChange={setRadius} min={1} max={25} step={1} className="mt-3" />
          <div className="text-xs text-muted-foreground mt-2">Orders outside this range are routed elsewhere.</div>
        </div>
      </section>

      {/* AI Auto-accept rules */}
      <section className="px-5 mt-6">
        <SectionTitle icon={<Zap size={14} />}>AI auto-accept rules</SectionTitle>
        <div className="bg-card rounded-2xl border border-border shadow-card divide-y divide-border">
          <ToggleRow
            title="Let AI auto-accept orders"
            desc="AI confirms matching jobs in 5s if you don't override"
            checked={autoAccept}
            onChange={(v) => {
              setAutoAccept(v);
              toast.success(v ? "AI auto-accept enabled" : "AI auto-accept disabled");
            }}
          />
          {autoAccept && (
            <>
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Verified customers only</div>
                  <Switch checked disabled />
                </div>
                <div className="text-xs text-muted-foreground">AI runs background check before accepting</div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-semibold">Max order amount</div>
                  <div className="text-lg font-bold text-primary">${autoMax}</div>
                </div>
                <Slider value={[autoMax]} onValueChange={(v) => setAutoMax(v[0])} min={10} max={200} step={5} />
                <div className="text-xs text-muted-foreground">Larger orders go to manual review</div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-semibold">Max distance</div>
                  <div className="text-lg font-bold text-primary">{autoRadius} km</div>
                </div>
                <Slider value={[autoRadius]} onValueChange={(v) => setAutoRadius(v[0])} min={1} max={15} step={1} />
              </div>
            </>
          )}
          <ToggleRow
            title="Voice command always-on"
            desc="Wake-word listening (\"Hey Wash\") for hands-free control"
            checked={voice}
            onChange={(v) => {
              setVoice(v);
              toast.success(v ? "Voice wake-word enabled" : "Voice wake-word disabled");
            }}
          />
          <ToggleRow
            title="Vacation mode"
            desc="Pause all incoming orders until you turn it off"
            checked={vacation}
            onChange={(v) => {
              setVacation(v);
              toast.success(v ? "Shop is now on vacation" : "Welcome back, accepting orders");
            }}
          />
        </div>
      </section>

      {/* Holidays */}
      <section className="px-5 mt-6">
        <SectionTitle icon={<Calendar size={14} />}>Upcoming holidays</SectionTitle>
        <div className="bg-card rounded-2xl border border-border shadow-card p-4 space-y-2">
          {["May 1 — Labour Day", "May 25 — Memorial Day", "Jul 4 — Independence Day"].map((h) => (
            <div key={h} className="flex items-center justify-between text-sm">
              <span>{h}</span>
              <button
                onClick={() => toast.success("Marked as closed")}
                className="text-xs font-bold text-primary"
              >
                Mark closed
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="px-5 mt-6 mb-2">
        <button
          onClick={() => toast.success("Settings saved")}
          className="w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground font-semibold shadow-brand"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-2 flex items-center gap-1.5">
      {icon} {children}
    </div>
  );
}

function ToggleRow({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="p-4 flex items-start gap-3">
      <div className="flex-1">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
