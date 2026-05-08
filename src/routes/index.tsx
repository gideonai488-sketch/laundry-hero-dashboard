import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Banknote, Bell, CheckCircle2, ClipboardList, Shield, Smartphone, Star, Users, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import heroImg from "@/assets/hero-merchant-woman.jpg";
import dashImg from "@/assets/dashboard-preview.jpg";
import pickupImg from "@/assets/feature-pickup.jpg";
import payoutsImg from "@/assets/feature-payouts.jpg";
import qualityImg from "@/assets/feature-quality.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Highest Wash Merchant — Grow your laundry business worldwide" },
      { name: "description", content: "The all-in-one operating system for laundry merchants. Accept jobs, manage staff, track every dollar, and get paid in 30+ countries." },
      { property: "og:title", content: "Highest Wash Merchant — Grow your laundry business" },
      { property: "og:description", content: "Accept jobs, manage your shop, get paid fast. Trusted by thousands of laundry merchants around the world." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && session) navigate({ to: "/app", replace: true });
  }, [loading, session, navigate]);

  return (

    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <Logo size="sm" />
            <span className="text-[9px] text-muted-foreground tracking-wide mt-0.5 pl-0.5">
              A product of Genesis Holdings Inc, USA
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="sm" className="bg-gradient-brand text-primary-foreground border-0 shadow-brand hover:opacity-95">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-28 text-primary-foreground">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 text-xs font-semibold mb-6">
            <Star size={12} fill="currentColor" />
            Trusted by 12,000+ laundry merchants in 30+ countries
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
            Run your laundry business <span className="text-white/80">like a fintech</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl">
            Accept the orders customers send you, manage your staff, track every dollar, and get paid weekly to your bank or mobile wallet — all from one beautiful app.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-white/95 shadow-soft font-semibold">
                Start free <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <Link to="/app">
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur">
                See live demo
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-xl">
            {[
              { v: "12k+", l: "Active merchants" },
              { v: "$84M", l: "Paid out" },
              { v: "4.9★", l: "Avg rating" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl md:text-3xl font-bold">{s.v}</div>
                <div className="text-xs text-white/70 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="mx-auto max-w-6xl px-5 -mt-10 md:-mt-16 relative z-10">
        <div className="rounded-3xl overflow-hidden shadow-brand bg-card border border-border">
          <img src={dashImg} alt="Merchant dashboard preview" loading="lazy" className="w-full h-auto" />
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">Everything in one place</div>
          <h2 className="text-3xl md:text-4xl font-bold">A complete operating system for laundry merchants</h2>
          <p className="mt-4 text-muted-foreground">From the moment a customer places a booking to the second your payout lands — we handle it all. You just focus on great laundry.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: ClipboardList, title: "Smart order inbox", desc: "Customers book, we route the job to you. Accept or reject in one tap and follow a live pipeline from pickup to delivery." },
            { icon: BarChart3, title: "Earnings analytics", desc: "Daily, weekly, monthly revenue charts. Know exactly where your money is coming from." },
            { icon: Banknote, title: "Global payouts", desc: "Get paid to your bank or mobile wallet — Stripe, Wise, MTN MoMo, M-Pesa, PayPal and more." },
            { icon: Users, title: "Staff & branches", desc: "Invite washers, drivers, managers. Assign roles and track performance." },
            { icon: Zap, title: "Express jobs", desc: "Surge pricing for 6-hour express orders. Earn up to 2× per load." },
            { icon: Shield, title: "Insured & secure", desc: "Every order is insured. Your customer data and payouts are bank-grade safe." },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-soft transition-smooth">
              <div className="h-11 w-11 rounded-xl bg-gradient-brand-soft flex items-center justify-center mb-4">
                <f.icon className="text-primary" size={22} />
              </div>
              <h3 className="font-bold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Alternating image features */}
      <section className="bg-gradient-brand-soft py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 space-y-20">
          {[
            { img: pickupImg, title: "Free pickup, fast delivery", desc: "Our global driver network handles every pickup and drop-off. You focus on washing — we handle logistics.", tag: "Logistics", reverse: false },
            { img: payoutsImg, title: "Get paid to your bank or wallet", desc: "Choose daily, weekly, or instant payouts. Funds land in your bank, Stripe, Wise, PayPal, MTN MoMo, M-Pesa and more.", tag: "Payouts", reverse: true },
            { img: qualityImg, title: "Build a 5-star reputation", desc: "Customers rate every order. Reply to reviews, win loyalty, and climb the rankings in your city.", tag: "Reviews", reverse: false },
          ].map((f) => (
            <div key={f.title} className={`grid md:grid-cols-2 gap-10 items-center ${f.reverse ? "md:[&>div:first-child]:order-2" : ""}`}>
              <div className="rounded-3xl overflow-hidden shadow-card aspect-[4/3]">
                <img src={f.img} alt={f.title} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">{f.tag}</div>
                <h3 className="text-3xl font-bold">{f.title}</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">{f.desc}</p>
                <ul className="mt-5 space-y-2">
                  {["Available worldwide", "No setup fees", "Cancel anytime"].map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-success" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 py-20 md:py-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-14 text-primary-foreground text-center shadow-brand">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <Smartphone className="mx-auto mb-4" size={36} />
            <h2 className="text-3xl md:text-4xl font-bold">Ready to grow your laundry?</h2>
            <p className="mt-3 text-white/85 max-w-lg mx-auto">Join thousands of merchants making more, every week.</p>
            <Link to="/auth/signup" className="inline-block mt-7">
              <Button size="lg" className="bg-white text-primary hover:bg-white/95 font-semibold">
                Create merchant account <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <Logo size="sm" />
          <div>© 2026 Highest Wash. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
