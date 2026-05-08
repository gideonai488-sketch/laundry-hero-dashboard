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
      {/* Hero — full-bleed image, rider-style */}
      <section className="relative isolate overflow-hidden min-h-[100svh] flex flex-col">
        {/* Background photo */}
        <img
          src={heroImg}
          alt="Laundry shop owner folding fresh towels"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient wash for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/85" />

        {/* Top header overlay */}
        <header
          className="relative z-10 px-5 pt-3 pb-3 flex items-center justify-between"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-brand text-white font-black text-base">
              H
            </div>
            <div className="leading-tight">
              <div className="text-white font-bold text-base">HighestWash</div>
              <div className="text-white/70 text-[10px] tracking-[0.2em] font-semibold">MERCHANT</div>
            </div>
          </div>
          <Link to="/auth/login">
            <button className="h-10 px-5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-semibold active:scale-95 transition-smooth">
              Sign in
            </button>
          </Link>
        </header>

        {/* Spacer pushes content to bottom */}
        <div className="flex-1" />

        {/* Bottom hero content */}
        <div className="relative z-10 px-6 pb-8 text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[11px] font-bold tracking-wide mb-5">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            LIVE IN 18 COUNTRIES
          </div>

          <h1 className="text-[44px] leading-[1.02] font-black tracking-tight">
            Your shop.<br />
            Your hours.<br />
            <span className="text-[hsl(var(--primary))]">Your money.</span>
          </h1>

          <p className="mt-4 text-white/85 text-[15px] leading-relaxed max-w-md">
            Run your laundry on your schedule. Get paid in your local currency.
            No middlemen — just clean clothes and clean payouts.
          </p>

          <div className="mt-7 space-y-3">
            <Link to="/auth/signup" className="block">
              <button className="w-full h-14 rounded-2xl bg-white text-foreground font-bold text-base shadow-soft active:scale-[0.98] transition-smooth flex items-center justify-center gap-2">
                Get started <ArrowRight size={18} />
              </button>
            </Link>
            <Link to="/auth/login" className="block">
              <button className="w-full h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/25 text-white font-semibold text-base active:scale-[0.98] transition-smooth">
                I already have an account
              </button>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-white/70 text-xs">
            <Shield size={14} />
            Verified merchants · Insured orders
          </div>

          <div className="mt-7 grid grid-cols-3 gap-4 pt-6 border-t border-white/15">
            {[
              { v: "12k+", l: "Merchants" },
              { v: "18", l: "Countries" },
              { v: "Weekly", l: "Payouts" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl font-black text-white">{s.v}</div>
                <div className="text-[10px] text-white/65 mt-0.5 uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>
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
