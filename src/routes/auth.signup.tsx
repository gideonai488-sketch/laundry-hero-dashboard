import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Sign up — Highest Wash Merchant" }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-hero text-primary-foreground px-6 pt-6 pb-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/85 hover:text-white">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="mt-10">
          <Logo size="lg" variant="light" />
        </div>
        <h1 className="mt-8 text-3xl font-bold">Become a merchant</h1>
        <p className="mt-2 text-white/85">Start accepting jobs in 5 minutes — no setup fees.</p>
      </div>

      <div className="flex-1 -mt-6 bg-background rounded-t-3xl px-6 pt-8 pb-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/app" });
          }}
          className="space-y-4 max-w-md mx-auto"
        >
          <div className="space-y-2">
            <Label htmlFor="biz">Business name</Label>
            <Input id="biz" placeholder="Highest Wash Laundry" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner">Your name</Label>
            <Input id="owner" placeholder="Daniel Owusu" className="h-12 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="024 555 0188" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Accra" className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@business.com" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwd">Password</Label>
            <Input id="pwd" type="password" placeholder="At least 8 characters" className="h-12 rounded-xl" />
          </div>

          <div className="rounded-xl bg-gradient-brand-soft p-4 space-y-2">
            {["Free to start, no monthly fees", "Get paid weekly to MoMo or bank", "Insurance on every order"].map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 size={16} className="text-success" /> {b}
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground border-0 shadow-brand text-base font-semibold">
            Create account
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Already a merchant?{" "}
            <Link to="/auth/login" className="font-semibold text-primary">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
