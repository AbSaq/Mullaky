import { queryOptions } from "@tanstack/react-query";
import { api } from "../../../api/api";

export interface UserStatusResponse {
  isAuthenticated: boolean;
  isVerified: boolean;
  role: "user" | "owner" | "admin";
  targetRoute: string;
  // 💡 Add this optional profile block to match your Express /auth/me payload
  user?: {
    email: string;
    fullName: string;
  };
}

export const userStatusQueryOptions = () =>
  queryOptions({
    queryKey: ["userStatus"],
    queryFn: async (): Promise<UserStatusResponse> => {
      try {
        const { data } = await api.get<UserStatusResponse>("/auth/me");
        return data;
      } catch (error) {
        return {
          isAuthenticated: false,
          isVerified: false,
          role: "user",
          targetRoute: "/login",
        };
      }
    },
    staleTime: 1000 * 60 * 5,
  });
