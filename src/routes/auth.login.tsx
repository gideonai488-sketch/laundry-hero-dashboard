import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Log in — Highest Wash Merchant" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/app" });
  };




  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-hero text-primary-foreground px-6 pt-6 pb-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/85 hover:text-white">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="mt-10"><Logo size="lg" variant="light" /></div>
        <h1 className="mt-8 text-3xl font-bold">Welcome back 👋</h1>
        <p className="mt-2 text-white/85">Log in to manage your laundry business.</p>
      </div>

      <div className="flex-1 -mt-6 bg-background rounded-t-3xl px-6 pt-8 pb-10">
        <form onSubmit={submit} className="space-y-5 max-w-md mx-auto">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwd">Password</Label>
            <div className="relative">
              <Input id="pwd" type={showPwd ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 rounded-xl pr-11" />
              <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Toggle password">
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={busy} className="w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground border-0 shadow-brand text-base font-semibold">
            {busy ? <Loader2 className="animate-spin" /> : "Log in"}
          </Button>
          <div className="relative text-center text-xs text-muted-foreground">
            <span className="px-2 bg-background relative z-10">or</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          </div>
          <Button type="button" variant="outline" onClick={google} className="w-full h-12 rounded-xl text-base font-semibold">
            Continue with Google
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            New here? <Link to="/auth/signup" className="font-semibold text-primary">Create merchant account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
