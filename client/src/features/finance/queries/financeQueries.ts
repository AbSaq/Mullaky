import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../../api/api";

export interface LedgerResponse {
  chartData: Array<{ name: string; revenue: number; expenses: number }>;
  invoices: Array<{
    id: string;
    userName: string;
    amount: number;
    month: string;
    status: string;
  }>;
  // ── ✅ ADDED METADATA INTERFACE ATTRIBUTE FOR BUILDINGS LOGS ──
  ownerReports: Array<{
    id: string;
    month: string;
    totalCollected: number;
    notes?: string;
    expenses: Array<{ name: string; amount: number }>;
  }>;
}

export const buildingFinancesQueryOptions = (buildingId: string) =>
  queryOptions({
    queryKey: ["buildingFinances", buildingId],
    queryFn: async (): Promise<LedgerResponse> => {
      const { data } = await api.get(`/buildings/${buildingId}/finances`);
      return data;
    },
    enabled: !!buildingId,
  });

export function useFinanceOperations(buildingId: string) {
  const queryClient = useQueryClient();

  // ── Existing Mutation (Untouched) ──
  const payRentMutation = useMutation({
    mutationFn: async (body: { amount: number; month: string }) => {
      await api.post(`/buildings/${buildingId}/finances/pay`, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["buildingFinances", buildingId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["dashboardOverview", buildingId],
      });
    },
  });

  const saveReportMutation = useMutation({
    mutationFn: async (body: {
      month: string;
      totalCollected: number;
      expenses: Array<{ name: string; amount: number }>;
      notes?: string;
    }) => {
      await api.post(`/buildings/${buildingId}/finances/report`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["buildingFinances", buildingId],
      });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      await api.delete(`/buildings/${buildingId}/finances/report/${reportId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["buildingFinances", buildingId],
      });
    },
  });

  // Return the complete collection of operation actions cleanly decoupled
  return {
    payRent: payRentMutation.mutateAsync,
    isPaying: payRentMutation.isPending,
    saveReport: saveReportMutation.mutateAsync,
    isSaving: saveReportMutation.isPending,
    deleteReport: deleteReportMutation.mutateAsync,
  };
}
