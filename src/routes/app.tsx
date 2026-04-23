import { Outlet, createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { AICopilot } from "@/components/AICopilot";
import { OfflineBanner } from "@/components/OfflineBanner";
import { OnboardingTour } from "@/components/OnboardingTour";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
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
