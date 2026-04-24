import { Outlet, createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { AICopilot } from "@/components/AICopilot";
import { OfflineBanner } from "@/components/OfflineBanner";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Loader2, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (!user) return null;

  // No merchant row yet → onboarding hint
  if (!merchant) {
    return (
      <GateScreen
        icon={<AlertTriangle size={28} />}
        title="No merchant profile"
        body="Your account isn't linked to a laundry shop yet. Complete signup or contact support."
        cta={{ label: "Back to signup", to: "/auth/signup" }}
      />
    );
  }

  // KYC gate
  if (merchant.kyc_status !== "verified") {
    return (
      <GateScreen
        icon={<Clock size={28} />}
        title={merchant.kyc_status === "rejected" ? "KYC rejected" : "Verification in progress"}
        body={
          merchant.kyc_status === "rejected"
            ? "Our team rejected your last KYC submission. Please re-upload your documents."
            : "Our team is reviewing your business documents. You'll be able to go online once verified — usually under 24 hours."
        }
        cta={{ label: "Open KYC center", to: "/app/kyc" }}
        allowKyc
      />
    );
  }

  // Role check (admin allowed too as a fail-safe for support sessions)
  if (!isMerchant) {
    return (
      <GateScreen
        icon={<ShieldCheck size={28} />}
        title="Awaiting role grant"
        body="Your KYC is verified but the 'merchant' role hasn't been granted yet. Our team will assign it shortly."
        cta={{ label: "Sign out", to: "/auth/login" }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <div className="mx-auto w-full max-w-md min-h-screen pb-28 relative">
        <Outlet />
      </div>
      <AICopilot />
      <BottomNav />
      <OnboardingTour />
    </div>
  );
}

function GateScreen({
  icon, title, body, cta, allowKyc,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: { label: string; to: string };
  allowKyc?: boolean;
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
            {allowKyc ? (
              <Link to="/app/kyc" className="block w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground shadow-brand font-semibold flex items-center justify-center">
                {cta.label}
              </Link>
            ) : (
              <Link to={cta.to} className="block w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground shadow-brand font-semibold flex items-center justify-center">
                {cta.label}
              </Link>
            )}
            <button onClick={signOut} className="block w-full h-12 rounded-xl border border-border font-semibold">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
