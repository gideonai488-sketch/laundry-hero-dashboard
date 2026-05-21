import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Loader2, LocateFixed, MapPin, Phone, Store, Banknote } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getCurrentPosition } from "@/lib/geo";

export const Route = createFileRoute("/app/onboarding")({
  head: () => ({ meta: [{ title: "Set up your shop — Highest Wash" }] }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refresh, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    phone: "",
    address: "",
    lat: "",
    lng: "",
    bank_code: "",
    account_number: "",
  });
  const [geoLoading, setGeoLoading] = useState(false);

  const detectLocation = async () => {
    setGeoLoading(true);
    try {
      const coords = await getCurrentPosition();
      setForm((p) => ({
        ...p,
        lat: coords.lat.toFixed(6),
        lng: coords.lng.toFixed(6),
      }));
      toast.success("Location detected!");
    } catch (err: any) {
      toast.error(err?.message ?? "Couldn't detect location — enter coordinates manually.");
    } finally {
      setGeoLoading(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  if (!user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast.error("Business name, phone and address are required.");
      return;
    }
    setBusy(true);

    // 1. Make sure the merchant role exists
    const { error: roleErr } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: "merchant" });
    if (roleErr && roleErr.code !== "23505") {
      // 23505 = unique violation (already there) — fine
      console.warn("user_roles insert:", roleErr);
    }

    // Read signup locale for country_code only (city/area no longer needed —
    // job matching uses GPS 15 km radius, not text-based city/area filtering)
    let signupLocale: { countryCode?: string } = {};
    try {
      const raw = localStorage.getItem("hw-signup-locale-v1");
      if (raw) signupLocale = JSON.parse(raw);
    } catch { /* noop */ }

    // 2. Insert merchants row
    const { error: mErr } = await supabase.from("merchants").insert({
      owner_id: user.id,
      business_name: form.business_name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      online: false,
      country_code: signupLocale.countryCode ?? null,
    });
    if (mErr && mErr.code !== "23505") {
      setBusy(false);
      toast.error("Couldn't create your shop: " + mErr.message);
      return;
    }

    // 3. Optional Paystack subaccount
    if (form.bank_code && form.account_number) {
      try {
        const { data: m } = await supabase
          .from("merchants")
          .select("id")
          .eq("owner_id", user.id)
          .maybeSingle();
        if (m?.id) {
          await supabase.functions.invoke("register-merchant-subaccount", {
            body: { merchant_id: m.id, bank_code: form.bank_code, account_number: form.account_number },
          });
        }
      } catch (err) {
        console.warn("register-merchant-subaccount not deployed yet:", err);
        toast.info("Payouts setup will be completed once the backend deploys it.");
      }
    }

    await refresh();
    setBusy(false);
    toast.success("Shop is open! 🎉");
    navigate({ to: "/app" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero text-primary-foreground px-6 pt-8 pb-12">
        <Logo size="md" variant="light" />
        <h1 className="mt-6 text-3xl font-bold">Set up your shop</h1>
        <p className="mt-2 text-white/85 text-sm">
          Two quick steps and you're ready to receive bids from customers in real-time.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md -mt-6 bg-background rounded-t-3xl px-6 pt-8 pb-10">
        <form onSubmit={submit} className="space-y-6">
          {/* Step 1 — Shop details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
              <h2 className="font-bold text-lg">Shop details</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="biz" className="flex items-center gap-1.5"><Store size={14} /> Business name</Label>
              <Input id="biz" value={form.business_name} onChange={set("business_name")} placeholder="e.g. Sparkle Laundry" className="h-12 rounded-xl" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5"><Phone size={14} /> Shop phone</Label>
              <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="+233 20 000 0000" className="h-12 rounded-xl" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-1.5"><MapPin size={14} /> Pickup address</Label>
              <Input id="address" value={form.address} onChange={set("address")} placeholder="Street, area, city" className="h-12 rounded-xl" required />
              <p className="text-[11px] text-muted-foreground">
                Tip: include enough detail so riders can find you quickly. Map pin coming soon.
              </p>
            </div>

            {/* GPS location — required for 15 km job matching */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><LocateFixed size={14} /> Shop location <span className="text-destructive">*</span></Label>
              {form.lat && form.lng ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/30">
                  <CheckCircle2 size={16} className="text-success shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-success">Location set</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{form.lat}, {form.lng}</div>
                  </div>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={geoLoading}
                    className="text-xs text-primary font-semibold shrink-0"
                  >
                    {geoLoading ? "..." : "Re-detect"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={geoLoading}
                    className="w-full h-12 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors disabled:opacity-50"
                  >
                    {geoLoading ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                    {geoLoading ? "Detecting…" : "Detect my location"}
                  </button>
                  <p className="text-[11px] text-muted-foreground text-center">
                    Required for the 15 km job radius — allow location when prompted.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input inputMode="decimal" value={form.lat} onChange={set("lat")} placeholder="Latitude e.g. 5.5600" className="h-10 rounded-xl text-xs" />
                    <Input inputMode="decimal" value={form.lng} onChange={set("lng")} placeholder="Longitude e.g. -0.2057" className="h-10 rounded-xl text-xs" />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">Or enter coordinates manually above</p>
                </div>
              )}
            </div>
          </section>

          {/* Step 2 — Get paid */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-brand-soft text-primary flex items-center justify-center text-sm font-bold">2</div>
              <h2 className="font-bold text-lg">Get paid <span className="text-xs font-normal text-muted-foreground">(optional)</span></h2>
            </div>

            <div className="rounded-xl bg-card border border-border p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Banknote size={16} className="text-primary" /> Paystack subaccount
              </div>
              <p className="text-xs text-muted-foreground">
                Add your bank info now and we'll create a Paystack subaccount so payouts land
                in your account ~24 h after delivery. You can skip and do this later from
                Settings.
              </p>
              <div className="space-y-2">
                <Label htmlFor="bank" className="text-xs">Bank code</Label>
                <Input id="bank" value={form.bank_code} onChange={set("bank_code")} placeholder="e.g. 058 (GTBank GH)" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acct" className="text-xs">Account number</Label>
                <Input id="acct" value={form.account_number} onChange={set("account_number")} placeholder="10-digit account number" className="h-11 rounded-xl" />
              </div>
            </div>
          </section>

          <Button type="submit" disabled={busy} className="w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground border-0 shadow-brand text-base font-semibold">
            {busy ? <Loader2 className="animate-spin" /> : "Open my shop"}
          </Button>

          <button type="button" onClick={signOut} className="w-full h-12 rounded-xl border border-border font-semibold text-sm text-muted-foreground">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
