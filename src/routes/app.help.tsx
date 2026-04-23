import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { faqs } from "@/lib/mock-data";
import { ChevronDown, Mail, MessageCircle, Phone, Search, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/help")({
  head: () => ({ meta: [{ title: "Help center — Highest Wash Merchant" }] }),
  component: HelpPage,
});

function HelpPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number | null>(0);

  const filtered = useMemo(
    () => faqs.filter((f) => `${f.q} ${f.a} ${f.category}`.toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  return (
    <div>
      <AppHeader title="Help center" subtitle="We're here 24/7" />

      <div className="px-5 mt-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search help articles"
            maxLength={100}
            className="w-full h-11 rounded-xl pl-9 pr-3 text-sm bg-card border border-border"
          />
        </div>
      </div>

      {/* Quick contact */}
      <section className="px-5 mt-4 grid grid-cols-3 gap-2">
        <ContactCard icon={MessageCircle} label="Live chat" onClick={() => toast.success("Connecting you to support…")} />
        <ContactCard icon={Mail} label="Email us" onClick={() => toast.success("Opened email")} href="mailto:support@highestwash.com" />
        <ContactCard icon={Phone} label="Call us" onClick={() => toast.success("Calling…")} href="tel:+18005550100" />
      </section>

      {/* Dispute */}
      <section className="px-5 mt-4">
        <Link
          to="/app/profile"
          onClick={(e) => { e.preventDefault(); toast.success("Dispute form opened"); }}
          className="rounded-2xl bg-destructive/5 border border-destructive/30 p-4 flex items-start gap-3 hover:bg-destructive/10 transition-smooth"
        >
          <div className="h-10 w-10 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
            <ShieldAlert size={16} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">Dispute a payout or order</div>
            <div className="text-xs text-muted-foreground mt-0.5">Our team mediates within 24 hours.</div>
          </div>
        </Link>
      </section>

      {/* FAQ */}
      <section className="px-5 mt-6">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-2">
          Frequently asked
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-card divide-y divide-border overflow-hidden">
          {filtered.map((f, i) => (
            <button
              key={i}
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-sm">{f.q}</div>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                />
              </div>
              {open === i && (
                <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{f.a}</div>
              )}
              <div className="text-[10px] uppercase tracking-widest font-bold text-primary/70 mt-2">
                {f.category}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">No articles match your search.</div>
          )}
        </div>
      </section>

      <div className="px-5 mt-6 mb-2 text-center text-[11px] text-muted-foreground">
        <Link to="/legal/terms" className="underline">Terms</Link> ·{" "}
        <Link to="/legal/privacy" className="underline">Privacy</Link> ·{" "}
        <Link to="/legal/merchant" className="underline">Merchant Agreement</Link>
      </div>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  onClick,
  href,
}: {
  icon: typeof Mail;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const cls = "bg-card rounded-2xl border border-border shadow-card p-3 flex flex-col items-center justify-center gap-1.5 hover:bg-accent transition-smooth text-center";
  if (href) {
    return (
      <a href={href} onClick={onClick} className={cls}>
        <div className="h-9 w-9 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-brand">
          <Icon size={14} />
        </div>
        <div className="text-[11px] font-bold">{label}</div>
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      <div className="h-9 w-9 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-brand">
        <Icon size={14} />
      </div>
      <div className="text-[11px] font-bold">{label}</div>
    </button>
  );
}
