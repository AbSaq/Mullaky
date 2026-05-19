import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type QueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { dashboardOverviewQueryOptions } from "../../features/dashboard/queries/dashboardQueries";
import { UnifiedDashboardShell } from "../../features/dashboard/components/UnifiedDashboardShell";
import { UsersSection } from "../../features/dashboard/components/UsersSection";
import { AssignOwnersSection } from "../../features/dashboard/components/AssignOwnersSection";
import { BuildingDetailsSection } from "../../features/dashboard/components/BuildingDetailsSection";
import { ResidentsSection } from "../../features/residents/components/ResidentsSection";
import { InviteSection } from "../../features/residents/components/InvitesSection";
import { MaintenanceSection } from "../../features/maintenance/components/MaintenanceSection.tsx";
import { FinancesSection } from "../../features/finance/components/FinanaceComponent.tsx";
import { AlertsSection } from "../../features/alerts/components/AlertsSection.tsx";
import { DashboardOverviewTab } from "../../features/dashboard/components/DashboardOverviewTab.tsx";
import type { UserStatusResponse } from "../../features/auth/queries/userQueries.ts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: UnifiedMasterDashboard,
  context: () => {
    return {} as {
      queryClient: QueryClient;
      user: UserStatusResponse;
    };
  },
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

  return (
    <UnifiedDashboardShell
      data={data}
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {activeTab === "overview" && (
        <DashboardOverviewTab data={data} user={user} />
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
          userRole={data.role}
        />
      )}
      {activeTab === "finances" && currentBuildingId && (
        <FinancesSection buildingId={currentBuildingId} userRole={data.role} />
      )}
      {activeTab === "alerts" && currentBuildingId && (
        <AlertsSection buildingId={currentBuildingId} userRole={data.role} />
      )}
    </UnifiedDashboardShell>
  );
}
