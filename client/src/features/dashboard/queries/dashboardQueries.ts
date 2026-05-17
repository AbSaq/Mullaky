import { queryOptions } from "@tanstack/react-query";
import { api } from "../../../api/api";

export interface UnifiedDashboardResponse {
  role: "admin" | "owner" | "user";
  building?: {
    id: string;
    name: string;
    address: string;
    floors: number;
    units: number;
  };
  stats: {
    buildings?: number;
    users?: number;
    owners?: number;
    unassigned?: number;
    residents?: number;
    alerts: number;
    maintenance: number;
    finances: number;
  };
  buildingsData?: any[];
  residents?: any[];
  recentAlerts: any[];
  maintenanceRequests: any[];
  latestFinance: any | null;
}

export const dashboardOverviewQueryOptions = (buildingId?: string) =>
  queryOptions({
    queryKey: ["dashboardOverview", buildingId ?? "admin"],
    queryFn: async (): Promise<UnifiedDashboardResponse> => {
      const url = buildingId
        ? `/dashboard/overview?buildingId=${buildingId}`
        : "/dashboard/overview";
      const { data } = await api.get<UnifiedDashboardResponse>(url);
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
