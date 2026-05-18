import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Mail, RefreshCw } from "lucide-react";
import {
  checkVerificationRequest,
  rfJi5GN23kBTCA6KLrWVND2B7BRERd9uE,
} from "../../features/auth/api/authApi.ts";
import { useState } from "react";

export const Route = createFileRoute("/(auth)/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const queryClient = useQueryClient();
  const [resent, setResent] = useState(false);
  const email = localStorage.getItem("pendingEmail") || "";

  const checkMutation = useMutation({
    mutationFn: checkVerificationRequest,
    onSuccess: (data) => {
      if (data.verified) {
        localStorage.removeItem("pendingEmail");
        void queryClient.invalidateQueries({ queryKey: ["userStatus"] });
      } else {
        alert("Email not verified yet. Please check your inbox!");
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: rfJi5GN23kBTCA6KLrWVND2B7BRERd9uE,
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
    queryClient.setQueryData(["userStatus"], {
      isAuthenticated: false,
      isVerified: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/40 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center items-center gap-2">
          <Building2 className="w-7 h-7 text-emerald-500" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Mulaky
          </span>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-emerald-500" />
              </div>
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Check your email
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              We sent a verification link to your email address. Click the link
              to verify your account.
            </p>
          </div>

          {resent && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
              ✅ Verification email resent! Check your inbox.
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleManualCheck}
              disabled={checkMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 transition shadow-md disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${checkMutation.isPending ? `animate-spin` : ``}`}
              />
              {checkMutation.isPending
                ? "Checking..."
                : "I've verified my email"}
            </button>

            <button
              onClick={handleResend}
              disabled={resendMutation.isPending}
              className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              {resendMutation.isPending
                ? "Sending..."
                : "Resend verification email"}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full py-3 rounded-xl text-sm text-gray-400 hover:text-gray-600 transition cursor-pointer"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
