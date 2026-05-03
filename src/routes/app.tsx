import { Outlet, createFileRoute, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { registerSW, subscribeToPush } from "@/lib/push";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { loading, user, merchant, isMerchant } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Register service worker once on mount
  useEffect(() => {
    registerSW();
  }, []);

  // Subscribe to push notifications once merchant is known
  useEffect(() => {
    if (!merchant?.id) return;
    subscribeToPush(merchant.id).catch(() => {});
  }, [merchant?.id]);

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
  const onOnboarding = location.pathname === "/app/onboarding";

  if (!merchant && !onOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  // Role check (admin allowed too as a fail-safe)
  if (merchant && !isMerchant) {
    return <RoleGate />;
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

function RoleGate() {
  const { signOut, refresh, user, merchant } = useAuth();
  const [checking, setChecking] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // One-shot self-heal: try to insert the merchant role for this user.
  // Will succeed if RLS allows it; otherwise we surface a clearer message.
  const tryGrantSelf = async () => {
    if (!user) return;
    setRetrying(true);
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: "merchant" });
    if (error && error.code !== "23505") {
      // 23505 = already exists (good — refresh below will pick it up)
      toast.error("Couldn't self-grant the role. Ask the backend agent to insert it.");
    }
    await refresh();
    setRetrying(false);
  };

  const checkAgain = async () => {
    setChecking(true);
    await refresh();
    setChecking(false);
    toast.info("Checked again — still pending.");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-hero text-primary-foreground px-6 pt-8 pb-12">
        <Logo size="md" variant="light" />
      </div>
      <div className="flex-1 -mt-6 bg-background rounded-t-3xl px-6 pt-8">
        <div className="max-w-md mx-auto text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-brand-soft text-primary flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Awaiting role grant</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your shop <span className="font-semibold text-foreground">{merchant?.business_name ?? ""}</span> is set
            up, but the <code className="px-1 rounded bg-muted text-xs">merchant</code> role isn't on
            your account yet. The backend agent needs to insert a row in <code className="px-1 rounded bg-muted text-xs">user_roles</code>:
          </p>
          <pre className="mt-3 text-left text-[11px] bg-muted rounded-lg p-3 overflow-x-auto">{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${user?.id ?? "<your-uid>"}', 'merchant');`}</pre>

          <div className="mt-6 space-y-2">
            <button
              onClick={checkAgain}
              disabled={checking}
              className="block w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground shadow-brand font-semibold flex items-center justify-center disabled:opacity-60"
            >
              {checking ? <Loader2 className="animate-spin" /> : "I've been approved — check again"}
            </button>
            <button
              onClick={tryGrantSelf}
              disabled={retrying}
              className="block w-full h-12 rounded-xl border border-border font-semibold disabled:opacity-60"
            >
              {retrying ? <Loader2 className="animate-spin mx-auto" /> : "Try to self-grant role"}
            </button>
            <button onClick={signOut} className="block w-full h-12 rounded-xl text-sm text-muted-foreground">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
