import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Sign up — Highest Wash Merchant" }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    biz: "", owner: "", phone: "", country: "", city: "", email: "", password: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/app` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: redirectTo,
        data: { full_name: form.owner, phone: form.phone },
      },
    });

    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      // Insert merchant row (kyc_status defaults to 'pending' on the backend).
      const { error: mErr } = await supabase.from("merchants").insert({
        owner_id: userId,
        business_name: form.biz,
        city: form.city || null,
        country: form.country || null,
        phone: form.phone || null,
      });
      if (mErr && mErr.code !== "23505") {
        // 23505 = duplicate; ignore if a trigger already created it.
        console.error(mErr);
        toast.error("Account created but business profile failed: " + mErr.message);
      }
    }

    setBusy(false);
    if (!data.session) {
      toast.success("Check your email to confirm your account.");
      navigate({ to: "/auth/login" });
    } else {
      toast.success("Welcome to Highest Wash!");
      navigate({ to: "/app" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-hero text-primary-foreground px-6 pt-6 pb-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/85 hover:text-white">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="mt-10"><Logo size="lg" variant="light" /></div>
        <h1 className="mt-8 text-3xl font-bold">Become a merchant</h1>
        <p className="mt-2 text-white/85">Start accepting jobs in 5 minutes — available in 30+ countries.</p>
      </div>

      <div className="flex-1 -mt-6 bg-background rounded-t-3xl px-6 pt-8 pb-10">
        <form onSubmit={submit} className="space-y-4 max-w-md mx-auto">
          <div className="space-y-2">
            <Label htmlFor="biz">Business name</Label>
            <Input id="biz" required value={form.biz} onChange={set("biz")} placeholder="Your laundry shop" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner">Your name</Label>
            <Input id="owner" required value={form.owner} onChange={set("owner")} placeholder="Full name" className="h-12 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="+1 555 123 4567" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <select id="country" required value={form.country} onChange={set("country")} className="w-full h-12 rounded-xl px-3 bg-background border border-input text-sm">
                <option value="" disabled>Select…</option>
                {["United States","United Kingdom","Canada","Australia","Germany","France","Spain","India","Brazil","Mexico","Nigeria","Kenya","Ghana","South Africa","UAE","Singapore","Japan","Other"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" required value={form.city} onChange={set("city")} placeholder="e.g. London, Lagos, Tokyo" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={set("email")} placeholder="you@business.com" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwd">Password</Label>
            <Input id="pwd" type="password" required minLength={8} value={form.password} onChange={set("password")} placeholder="At least 8 characters" className="h-12 rounded-xl" />
          </div>

          <div className="rounded-xl bg-gradient-brand-soft p-4 space-y-2">
            {["Free to start, no monthly fees", "Get paid weekly to bank or mobile wallet", "Insurance on every order"].map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 size={16} className="text-success" /> {b}
              </div>
            ))}
          </div>

          <Button type="submit" disabled={busy} className="w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground border-0 shadow-brand text-base font-semibold">
            {busy ? <Loader2 className="animate-spin" /> : "Create account"}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            By signing up you agree to our <Link to="/legal/terms" className="underline">Terms</Link>, <Link to="/legal/privacy" className="underline">Privacy Policy</Link> and <Link to="/legal/merchant" className="underline">Merchant Agreement</Link>.
          </p>
          <div className="text-center text-sm text-muted-foreground">
            Already a merchant? <Link to="/auth/login" className="font-semibold text-primary">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
