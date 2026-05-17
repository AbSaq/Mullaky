import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../../api/api";

export interface AlertMessage {
  id: string;
  title: string;
  content: string;
  type: "emergency" | "warning" | "info" | "maintenance";
  userName: string;
  createdAt?: { seconds: number };
}

export const buildingAlertsQueryOptions = (buildingId: string) =>
  queryOptions({
    queryKey: ["buildingAlerts", buildingId],
    queryFn: async (): Promise<AlertMessage[]> => {
      const { data } = await api.get(`/buildings/${buildingId}/alerts`);
      return data;
    },
    enabled: !!buildingId,
  });

export function useAlertOperations(buildingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      title: string;
      content: string;
      type: string;
    }) => {
      await api.post(`/buildings/${buildingId}/alerts`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["buildingAlerts", buildingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardOverview", buildingId],
      });
    },
  });
}
