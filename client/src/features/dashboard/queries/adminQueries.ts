import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../../api/api";

export const adminUsersQueryOptions = () =>
  queryOptions({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data } = await api.get<any[]>("/admin/users");
      return data;
    },
  });

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await api.post("/admin/users/role", { userId, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardOverview"] });
    },
  });
}

export function useAssignOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      buildingId,
      ownerId,
    }: {
      buildingId: string;
      ownerId: string;
    }) => {
      await api.post("/admin/buildings/assign", { buildingId, ownerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardOverview"] });
    },
  });
}
