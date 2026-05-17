import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../../api/api";

export interface BuildingSelectionResponse {
  memberships: Array<{
    id: string;
    buildingId: string;
    buildingName: string;
    buildingAddress: string;
    role: "owner" | "user";
  }>;
  invitations: Array<{
    id: string;
    buildingId: string;
    buildingName: string;
    createdAt: any;
  }>;
}

export const buildingSelectionQueryOptions = () =>
  queryOptions({
    queryKey: ["buildingSelection"],
    queryFn: async (): Promise<BuildingSelectionResponse> => {
      const { data } = await api.get<BuildingSelectionResponse>(
        "/buildings/selection",
      );
      return data;
    },
    staleTime: 1000 * 30,
  });

export function useInvitationAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invitationId,
      action,
    }: {
      invitationId: string;
      action: "accept" | "decline";
    }) => {
      const { data } = await api.post("/buildings/invitation-action", {
        invitationId,
        action,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildingSelection"] });
      queryClient.invalidateQueries({ queryKey: ["userStatus"] });
    },
  });
}
