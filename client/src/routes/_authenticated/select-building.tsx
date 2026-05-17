import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Building2 } from "lucide-react";
import {
  buildingSelectionQueryOptions,
  useInvitationAction,
} from "../../features/buildings/queries/buildingQueries";
import { SelectBuildingCard } from "../../features/buildings/components/SelectBuildingCard";

export const Route = createFileRoute("/_authenticated/select-building")({
  component: SelectBuildingPage,
});

function SelectBuildingPage() {
  const navigate = useNavigate();

  const { user } = Route.useRouteContext();

  const { data, isLoading } = useQuery(buildingSelectionQueryOptions());
  const { mutate: performAction, isPending } = useInvitationAction();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("pendingEmail");
    window.location.href = "/login";
  };

  const handleSelectBuilding = (membership: any) => {
    sessionStorage.setItem("selectedBuilding", JSON.stringify(membership));
    void navigate({ to: "/dashboard" });
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/40 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col font-sans antialiased">
      {/* Decoupled Header component */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800/60 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
            Mulaky
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {user.user?.fullName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-2 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Container Assembly */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome back, {user.user?.fullName?.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Select an infrastructure workspace to manage records
            </p>
          </div>

          <SelectBuildingCard
            data={data}
            onSelect={handleSelectBuilding}
            onAction={(invitationId, action) =>
              performAction({ invitationId, action })
            }
            isActionPending={isPending}
          />
        </div>
      </main>
    </div>
  );
}
