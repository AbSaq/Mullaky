import { api } from "./api";

type User = {
  username: string;
  name: string;
};
type LoginResponse = { message: string; token: string; user: User };

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
      console.error("woo");
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
