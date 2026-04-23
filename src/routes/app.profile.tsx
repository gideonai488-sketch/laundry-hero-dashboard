import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { merchantProfile, staff, services } from "@/lib/mock-data";
import { Banknote, BellRing, Building2, ChevronRight, Globe, HelpCircle, LogOut, Settings, Shield, Star, Users, Wrench } from "lucide-react";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — Highest Wash Merchant" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();

  type MenuItem = {
    icon: typeof Wrench;
    label: string;
    to: "/app/services" | "/app/staff" | "/app/bank" | "/app/profile" | "/app/notifications";
    hint?: string;
  };
  const sections: { title: string; items: MenuItem[] }[] = [
    {
      title: "Business",
      items: [
        { icon: Wrench, label: "Services & pricing", to: "/app/services", hint: `${services.filter((s) => s.active).length} active` },
        { icon: Users, label: "Staff & branches", to: "/app/staff", hint: `${staff.length} members` },
        { icon: Banknote, label: "Bank & MoMo accounts", to: "/app/bank", hint: "2 linked" },
        { icon: Building2, label: "Business profile", to: "/app/profile" },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: BellRing, label: "Notifications", to: "/app/notifications" },
        { icon: Shield, label: "Security", to: "/app/profile" },
        { icon: Globe, label: "Language & region", to: "/app/profile" },
        { icon: Settings, label: "Preferences", to: "/app/profile" },
        { icon: HelpCircle, label: "Help center", to: "/app/profile" },
      ],
    },
  ];

  return (
    <div>
      <AppHeader title="Profile" />

      {/* Profile card */}
      <section className="px-5">
        <div className="rounded-3xl bg-gradient-hero text-primary-foreground p-5 shadow-brand">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur border border-white/30 text-white font-bold text-2xl flex items-center justify-center">
              {merchantProfile.businessName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="font-bold text-lg truncate">{merchantProfile.businessName}</div>
                {merchantProfile.verified && (
                  <span className="text-[10px] bg-white/20 backdrop-blur px-1.5 py-0.5 rounded-full font-bold">✓</span>
                )}
              </div>
              <div className="text-xs text-white/80 mt-0.5">{merchantProfile.email}</div>
              <div className="flex items-center gap-1 mt-2 text-sm font-semibold">
                <Star size={14} fill="currentColor" /> {merchantProfile.rating}
                <span className="text-white/70 font-normal text-xs ml-1">({merchantProfile.totalReviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 mt-4 grid grid-cols-3 gap-3">
        {[
          { v: "1,847", l: "Orders" },
          { v: "GH₵142k", l: "Earned" },
          { v: "98%", l: "On-time" },
        ].map((s) => (
          <div key={s.l} className="bg-card rounded-2xl border border-border shadow-card p-3 text-center">
            <div className="text-base font-bold">{s.v}</div>
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{s.l}</div>
          </div>
        ))}
      </section>

      {/* Menu */}
      {sections.map((sec) => (
        <section key={sec.title} className="px-5 mt-6">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-2">{sec.title}</div>
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            {sec.items.map((item, i) => (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 p-4 hover:bg-accent transition-smooth ${
                  i < sec.items.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-brand-soft flex items-center justify-center">
                  <item.icon size={16} className="text-primary" />
                </div>
                <div className="flex-1 font-medium text-sm">{item.label}</div>
                {item.hint && <div className="text-xs text-muted-foreground">{item.hint}</div>}
                <ChevronRight size={16} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      ))}

      <div className="px-5 mt-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-card border border-border text-destructive font-semibold text-sm hover:bg-destructive/5 transition-smooth"
        >
          <LogOut size={16} /> Log out
        </button>
        <p className="text-center text-xs text-muted-foreground mt-4">Member since {merchantProfile.joinedAt}</p>
      </div>
    </div>
  );
}
