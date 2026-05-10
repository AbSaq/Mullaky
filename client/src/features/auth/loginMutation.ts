import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi } from "../../api/auth";

import { userQueryOptions } from "./useUser.ts";
import type { Inputs } from "../../types/auth.ts";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: Inputs) =>
      authApi.login(credentials.username, credentials.password),

    onSuccess: (data) => {
      queryClient.setQueryData(userQueryOptions.queryKey, data.user);
    },
  });
}
