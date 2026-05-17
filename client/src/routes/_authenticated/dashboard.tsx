import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { dashboardOverviewQueryOptions } from "../../features/dashboard/queries/dashboardQueries";
import { UnifiedDashboardShell } from "../../features/dashboard/components/UnifiedDashboardShell";
import { UsersSection } from "../../features/dashboard/components/UsersSection";
import { AssignOwnersSection } from "../../features/dashboard/components/AssignOwnersSection";
import { BuildingDetailsSection } from "../../features/dashboard/components/BuildingDetailsSection";
import { ResidentsSection } from "../../features/residents/components/ResidentsSection";
import { InviteSection } from "../../features/residents/components/InvitesSection";
import { MaintenanceSection } from "../../features/maintenance/components/MaintenanceSection.tsx";

const PlaceholderSection = ({ title }: { title: string }) => (
  <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-center text-sm text-gray-400">
    {title} module rendering sequence initialized.
  </div>
);

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: UnifiedMasterDashboard,
});

function UnifiedMasterDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // 1. Resolve auth profile directly out of parent component layout contexts
  const { user } = Route.useRouteContext();

  // 2. Fetch session markers out of storage context blocks safely
  const sessionBuilding = JSON.parse(
    sessionStorage.getItem("selectedBuilding") || "null",
  );
  const currentBuildingId =
    user.role !== "admin" ? sessionBuilding?.buildingId : undefined;

  // 3. Client storage fallback security redirect guard
  useEffect(() => {
    if (user.role !== "admin" && !currentBuildingId) {
      void navigate({ to: "/select-building" });
    }
  }, [user.role, currentBuildingId]);

  const { data, isLoading } = useQuery(
    dashboardOverviewQueryOptions(currentBuildingId),
  );

  // Sync back to matching dashboard tabs if an admin switches active layouts dynamically
  useEffect(() => {
    if (user.role === "admin" && activeTab === "buildingdetails") {
      setActiveTab("buildings");
    }
  }, [activeTab, user.role]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Define active color indicators for interior welcome panels based on active roles
  const welcomeGradient =
    user.role === "owner"
      ? "from-blue-500 to-indigo-600"
      : "from-emerald-500 to-teal-600";

  const accentText =
    user.role === "owner" ? "text-blue-100" : "text-emerald-100";

  return (
    <UnifiedDashboardShell
      data={data}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div
            className={`bg-gradient-to-r ${welcomeGradient} p-6 rounded-2xl text-white shadow-sm`}
          >
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome back, {user.user?.fullName}!
            </h2>
            <p className={`${accentText} text-sm mt-1`}>
              {user.role === "admin"
                ? "Platform analytics engines reporting global configurations."
                : `Workspace metrics tracking interface active for ${data.building?.name || "assigned building"}.`}
            </p>
          </div>

          {/* Main Dashboard Stats Cards Grid Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 rounded-2xl shadow-sm hover:shadow-md transition duration-200">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Alert Notifications
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                {data.stats.alerts}
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 rounded-2xl shadow-sm hover:shadow-md transition duration-200">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Active Maintenance Tasks
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                {data.stats.maintenance}
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 rounded-2xl shadow-sm hover:shadow-md transition duration-200">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Financial Aggregates
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                {user.role === "admin"
                  ? `${data.stats.buildings ?? 0} Nodes`
                  : `SAR ${data.stats.finances?.toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Submodule Layout Router Interceptor Mapping Switches ── */}
      {activeTab === "buildings" && (
        <BuildingDetailsSection buildingsData={data.buildingsData || []} />
      )}

      {activeTab === "users" && <UsersSection />}

      {activeTab === "assign-owners" && (
        <AssignOwnersSection buildingsData={data.buildingsData || []} />
      )}

      {activeTab === "residents" && currentBuildingId && (
        <ResidentsSection buildingId={currentBuildingId} />
      )}

      {activeTab === "invite" && currentBuildingId && (
        <InviteSection buildingId={currentBuildingId} />
      )}
      {activeTab === "maintenance" && currentBuildingId && (
        <MaintenanceSection
          buildingId={currentBuildingId}
          userRole={user.role}
        />
      )}
      {activeTab === "finances" && (
        <PlaceholderSection title="Recharts Analytics Reporting Canvas" />
      )}
      {activeTab === "alerts" && (
        <PlaceholderSection title="System-Wide Network Warning Broadcaster" />
      )}
    </UnifiedDashboardShell>
  );
}
