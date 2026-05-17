import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../../api/api";

export interface Resident {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
}

export interface Invitation {
  id: string;
  toUserEmail: string;
  status: "pending" | "accepted" | "declined";
  createdAt: any;
}

export const buildingResidentsQueryOptions = (buildingId: string) =>
  queryOptions({
    queryKey: ["buildingResidents", buildingId],
    queryFn: async (): Promise<Resident[]> => {
      const { data } = await api.get(`/buildings/${buildingId}/residents`);
      return data;
    },
    enabled: !!buildingId,
  });

export const sentInvitationsQueryOptions = (buildingId: string) =>
  queryOptions({
    queryKey: ["sentInvitations", buildingId],
    queryFn: async (): Promise<Invitation[]> => {
      const { data } = await api.get(`/buildings/${buildingId}/invitations`);
      return data;
    },
    enabled: !!buildingId,
  });

export function useResidentOperations(buildingId: string) {
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      await api.delete(`/buildings/${buildingId}/residents/${membershipId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["buildingResidents", buildingId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["dashboardOverview", buildingId],
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post(`/buildings/${buildingId}/invitations`, {
        email,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sentInvitations", buildingId],
      });
    },
  });

  return {
    removeResident: removeMutation.mutateAsync,
    sendInvitation: inviteMutation.mutateAsync,
    isInvitePending: inviteMutation.isPending,
    inviteError: inviteMutation.error as any,
  };
}
