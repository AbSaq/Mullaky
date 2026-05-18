import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  checkVerificationRequest,
  resendVerificationRequest,
} from "../api/authApi";

export function useAuthVerification() {
  const [verified, setVerified] = useState(false);
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("pendingEmail") || "";

  const checkMutation = useMutation({
    mutationFn: checkVerificationRequest,
    onSuccess: (data) => {
      if (data.verified) {
        localStorage.removeItem("pendingEmail");
        setVerified(true);
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

  // Automated polling execution
  useEffect(() => {
    if (!email || verified) return;

    const interval = setInterval(() => {
      checkMutation.mutate({ email });
    }, 5000);

    return () => clearInterval(interval);
  }, [email, verified]);

  const verifyManualAction = () => {
    if (!email) return;
    checkMutation.mutate({ email });
  };

  const resendAction = () => {
    if (!email) return;
    resendMutation.mutate({ email });
  };

  const signOutAction = () => {
    localStorage.removeItem("pendingEmail");
    navigate({ to: "/login" });
  };

  return {
    verified,
    resent,
    isChecking: checkMutation.isPending,
    verifyManual: verifyManualAction,
    resend: resendAction,
    signOut: signOutAction,
  };
}
