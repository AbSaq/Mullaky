import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../../api/api";

export const buildingDetailsQueryOptions = (buildingId: string) =>
  queryOptions({
    queryKey: ["buildingDetails", buildingId],
    queryFn: async () => {
      if (!buildingId) return null;
      const { data } = await api.get(`/admin/buildings/${buildingId}/details`);
      return data;
    },
    enabled: !!buildingId,
  });

export function useBuildingCrud() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (body: any) => api.post("/admin/buildings", body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["dashboardOverview"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: any }) =>
      api.put(`/admin/buildings/${id}`, body),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["dashboardOverview"] });
      void queryClient.invalidateQueries({
        queryKey: ["buildingDetails", variables.id],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/buildings/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["dashboardOverview"] }),
  });

  return {
    createBuilding: createMutation.mutateAsync,
    updateBuilding: updateMutation.mutateAsync,
    deleteBuilding: deleteMutation.mutateAsync,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
