import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
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
  const [step, setStep] = useState<"details" | "otp">("details");
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", password: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.startsWith("+")) {
      toast.error("Phone must be in international format e.g. +233...");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      phone: form.phone,
      password: form.password,
      options: {
        data: { full_name: form.full_name, email: form.email },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("We sent you a 6-digit code.");
    setStep("otp");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: form.phone,
      token: otp,
      type: "sms",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome — let's set up your shop.");
    navigate({ to: "/app/onboarding" });
  };

  const resend = async () => {
    const { error } = await supabase.auth.resend({ type: "sms", phone: form.phone });
    if (error) toast.error(error.message);
    else toast.success("Code re-sent.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-hero text-primary-foreground px-6 pt-6 pb-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/85 hover:text-white">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="mt-10"><Logo size="lg" variant="light" /></div>
        <h1 className="mt-8 text-3xl font-bold">{step === "details" ? "Become a merchant" : "Verify your phone"}</h1>
        <p className="mt-2 text-white/85">
          {step === "details"
            ? "Win laundry orders in real-time across Ghana."
            : `We sent a 6-digit code to ${form.phone}.`}
        </p>
      </div>

      <div className="flex-1 -mt-6 bg-background rounded-t-3xl px-6 pt-8 pb-10">
        {step === "details" ? (
          <form onSubmit={sendOtp} className="space-y-4 max-w-md mx-auto">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" required value={form.full_name} onChange={set("full_name")} placeholder="Full name" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" required value={form.phone} onChange={set("phone")} placeholder="+233 20 000 0000" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@business.com" className="h-12 rounded-xl" />
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
              {busy ? <Loader2 className="animate-spin" /> : "Send SMS code"}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              By signing up you agree to our <Link to="/legal/terms" className="underline">Terms</Link>, <Link to="/legal/privacy" className="underline">Privacy Policy</Link> and <Link to="/legal/merchant" className="underline">Merchant Agreement</Link>.
            </p>
            <div className="text-center text-sm text-muted-foreground">
              Already a merchant? <Link to="/auth/login" className="font-semibold text-primary">Log in</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-5 max-w-md mx-auto">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button type="submit" disabled={busy || otp.length !== 6} className="w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground border-0 shadow-brand text-base font-semibold">
              {busy ? <Loader2 className="animate-spin" /> : "Verify & continue"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Didn't get it?{" "}
              <button type="button" onClick={resend} className="font-semibold text-primary">Resend code</button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <button type="button" onClick={() => setStep("details")} className="underline">Edit details</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
