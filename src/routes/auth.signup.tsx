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
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", password: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/app/onboarding` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: redirectTo,
        data: { full_name: form.full_name, phone: form.phone },
      },
    });

    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }

    setBusy(false);
    if (!data.session) {
      toast.success("Check your email to confirm your account.");
      navigate({ to: "/auth/login" });
    } else {
      toast.success("Welcome — let's set up your shop.");
      navigate({ to: "/app/onboarding" });
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
        <p className="mt-2 text-white/85">Win laundry orders in real-time across Ghana.</p>
      </div>

      <div className="flex-1 -mt-6 bg-background rounded-t-3xl px-6 pt-8 pb-10">
        <form onSubmit={submit} className="space-y-4 max-w-md mx-auto">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" required value={form.full_name} onChange={set("full_name")} placeholder="Full name" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="+233 20 000 0000" className="h-12 rounded-xl" />
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
            {[
              "Live incoming orders from the customer app",
              "Bid your own price — win the jobs you want",
              "Paystack settlement to your bank",
            ].map((b) => (
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
