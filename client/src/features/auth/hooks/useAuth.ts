import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginSyncRequest, registerSyncRequest } from "../api/authApi";
import {
  checkVerificationRequest,
  resendVerificationRequest,
} from "../api/authApi";
import { queryClient } from "../../../queryClient.ts";

export function useAuth() {
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: loginSyncRequest,
    onSuccess: async (data) => {
      localStorage.setItem("token", data.token);

      await queryClient.invalidateQueries({ queryKey: ["userStatus"] });
      void navigate({ to: data.targetRoute });
    },
    onError: (error: any) => {
      setLocalError(error.response?.data?.error || "Failed to authenticate.");
    },
  });

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

export function useEmailVerification() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [resent, setResent] = useState(false);
  const email = localStorage.getItem("pendingEmail") || "";

  const checkMutation = useMutation({
    mutationFn: checkVerificationRequest,
    onSuccess: (data) => {
      if (data.verified) {
        localStorage.removeItem("pendingEmail");
        // Invalidate queries to update beforeLoad global router status
        queryClient.invalidateQueries({ queryKey: ["userStatus"] }).then(() => {
          void navigate({ to: "/dashboard" });
        });
      } else {
        alert("Email not verified yet. Please check your inbox!");
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendVerificationRequest,
    onSuccess: () => {
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    },
  });

  const handleManualCheck = () => {
    if (email) checkMutation.mutate({ email });
  };

  const handleResend = () => {
    if (email) resendMutation.mutate({ email });
  };

  const handleSignOut = () => {
    localStorage.removeItem("pendingEmail");
    localStorage.removeItem("token");
    sessionStorage.clear();

    queryClient.setQueryData(["userStatus"], {
      isAuthenticated: false,
      isVerified: false,
    });

    void navigate({ to: "/login" });
  };

  return {
    handleManualCheck,
    handleResend,
    handleSignOut,
    resent,
    isChecking: checkMutation.isPending,
    isResending: resendMutation.isPending,
  };
}
