import { api } from "./api";

import type { LoginResponse, User } from "../types/auth.ts";

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const { data } = await api.post<LoginResponse>("/auth/login", {
        username: username,
        password: password,
      });

      localStorage.setItem("token", data.token);
      return data;
    } catch (err: any) {
      console.error(err);
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      throw new Error(message);
    }
  },
  getProfile: async (): Promise<User | null> => {
    try {
      const { data } = await api.get<User>("/auth/profile");
      return data;
    } catch {
      return null;
    }
  },
};
