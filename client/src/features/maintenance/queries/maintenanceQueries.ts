import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../../api/api";

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "in-progress" | "resolved";
  userName: string;
}

export const buildingMaintenanceQueryOptions = (buildingId: string) =>
  queryOptions({
    queryKey: ["buildingMaintenance", buildingId],
    queryFn: async (): Promise<MaintenanceTicket[]> => {
      const { data } = await api.get(`/buildings/${buildingId}/maintenance`);
      return data;
    },
    enabled: !!buildingId,
  });

export function useMaintenanceOperations(buildingId: string) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (body: {
      title: string;
      description: string;
      category: string;
      visibility: string;
    }) => {
      await api.post(`/buildings/${buildingId}/maintenance`, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["buildingMaintenance", buildingId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["dashboardOverview", buildingId],
      });
    },
  });

  const transitionMutation = useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: {
      requestId: string;
      status: string;
    }) => {
      await api.patch(
        `/buildings/${buildingId}/maintenance/${requestId}/status`,
        { status },
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["buildingMaintenance", buildingId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await api.delete(`/buildings/${buildingId}/maintenance/${requestId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["buildingMaintenance", buildingId] });
      void queryClient.invalidateQueries({ queryKey: ["dashboardOverview", buildingId] });
    },
  });

  return {
    createTicket: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    transitionTask: transitionMutation.mutate,
    isTransitioning: transitionMutation.isPending,
    deleteTicket: deleteMutation.mutate,
  };
}
