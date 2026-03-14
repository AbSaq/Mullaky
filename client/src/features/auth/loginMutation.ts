import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { authApi } from "../../api/auth";
import type { Inputs } from "./types.ts";

export const userQueryOptions = queryOptions({
  queryKey: ["user"],
  queryFn: authApi.getProfile,
});

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
