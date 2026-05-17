import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginSyncRequest, registerSyncRequest } from "../api/authApi";

export function useAuth() {
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();

  // 1. Login Mutation (Pure Axios to Express)
  const loginMutation = useMutation({
    mutationFn: loginSyncRequest,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      navigate({ to: data.targetRoute });
    },
    onError: (error: any) => {
      setLocalError(error.response?.data?.error || "Failed to authenticate.");
    },
  });

  // 2. Registration Mutation (Pure Axios to Express)
  const registerMutation = useMutation({
    mutationFn: registerSyncRequest,
    onSuccess: (_, variables) => {
      localStorage.setItem("pendingEmail", variables.email);
      setTimeout(() => navigate({ to: "/verify-email" }), 900);
    },
    onError: (error: any) => {
      setLocalError(error.response?.data?.error || "Failed to create account.");
    },
  });

  const loginAction = async (email: string, password: string) => {
    setLocalError("");
    loginMutation.mutate({ email, password });
  };

  const registerAction = async (
    email: string,
    password: string,
    fullName: string,
  ) => {
    setLocalError("");
    // Pass registration fields straight to our backend mutation.
    registerMutation.mutate({ email, password, fullName });
  };

  return {
    login: loginAction,
    register: registerAction,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    error: localError,
  };
}
