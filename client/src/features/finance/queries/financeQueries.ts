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

  return useMutation({
    mutationFn: async (body: { amount: number; month: string }) => {
      await api.post(`/buildings/${buildingId}/finances/pay`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["buildingFinances", buildingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardOverview", buildingId],
      });
    },
  });
}
