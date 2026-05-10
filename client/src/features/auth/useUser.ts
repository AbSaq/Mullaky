import { queryOptions, useQuery } from "@tanstack/react-query";
import { authApi } from "../../api/auth";

export const userQueryOptions = queryOptions({
  queryKey: ["user"],
  queryFn: authApi.getProfile,
  retry: false,
});

export function useUser() {
  return useQuery(userQueryOptions);
}
