import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { userQueryOptions } from "./useUser.ts";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      // Remove token from localStorage
      localStorage.removeItem("token");

      // TODO: Call logout endpoint
      // await authApi.logout();

      return { success: true };
    },

    onSuccess: () => {
      // Clear user data from React Query cache
      queryClient.setQueryData(userQueryOptions.queryKey, null);

      // Optionally clear other queries
      queryClient.clear();

      // Redirect to login page
      navigate({ to: "/" }).then();
    },
  });
}
