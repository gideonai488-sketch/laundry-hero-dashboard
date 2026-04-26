import { Outlet, createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Loader2, Store, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { loading, user, merchant, isMerchant } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth/login" });
  }, [loading, user, navigate]);

  // Redirect to onboarding when authed but no merchant row exists
  useEffect(() => {
    if (!loading && user && !merchant && location.pathname !== "/app/onboarding") {
      navigate({ to: "/app/onboarding" });
    }
  }, [loading, user, merchant, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (!user) return null;

  // Allow the onboarding route to render even when there's no merchant yet.
  const onOnboarding = typeof window !== "undefined" && window.location.pathname === "/app/onboarding";

  if (!merchant && !onOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  // Role check (admin allowed too as a fail-safe)
  if (merchant && !isMerchant) {
    return (
      <GateScreen
        icon={<ShieldCheck size={28} />}
        title="Awaiting role grant"
        body={"Your shop is set up but the 'merchant' role isn't on your account yet. Please contact support so we can activate it."}
        cta={{ label: "Sign out", to: "/auth/login" as const }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <div className="mx-auto w-full max-w-md min-h-screen pb-28 relative">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}

function GateScreen({
  icon, title, body, cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: { label: string; to: "/auth/login" };
}) {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-hero text-primary-foreground px-6 pt-8 pb-12">
        <Logo size="md" variant="light" />
      </div>
      <div className="flex-1 -mt-6 bg-background rounded-t-3xl px-6 pt-8">
        <div className="max-w-md mx-auto text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-brand-soft text-primary flex items-center justify-center">
            {icon}
          </div>
          <h1 className="mt-5 text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          <div className="mt-6 space-y-2">
            <Link to={cta.to} className="block w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground shadow-brand font-semibold flex items-center justify-center">
              {cta.label}
            </Link>
            <button onClick={signOut} className="block w-full h-12 rounded-xl border border-border font-semibold">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
