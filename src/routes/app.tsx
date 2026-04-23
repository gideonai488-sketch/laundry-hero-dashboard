import { Outlet, createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md min-h-screen pb-28 relative">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
