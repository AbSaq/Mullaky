import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Mail, RefreshCw, CheckCircle2, LogIn } from "lucide-react";
import { auth } from "../firebase";
import { reload, signOut } from "firebase/auth";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();

  // Auto check every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        await reload(user); // refresh user data from Firebase
        if (user.emailVerified) {
          setVerified(true);
          clearInterval(interval);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Manual check
const handleCheckVerification = async () => {
    setChecking(true);
    try {
      // Sign in again temporarily to check verification
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      // We need the email — get it from localStorage
      const email = localStorage.getItem("pendingEmail") || "";
      const password = localStorage.getItem("pendingPassword") || "";

      if (email && password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await reload(userCredential.user);
        
        if (userCredential.user.emailVerified) {
          localStorage.removeItem("pendingEmail");
          localStorage.removeItem("pendingPassword");
          setVerified(true);
        } else {
          await signOut(auth);
          alert("Email not verified yet. Please check your inbox!");
        }
      }
    } catch (err) {
      console.log("Error:", err);
    }
    setChecking(false);
  };

  // Resend email
  const handleResend = async () => {
    const user = auth.currentUser;
    if (user) {
      const { sendEmailVerification } = await import("firebase/auth");
      await sendEmailVerification(user);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await signOut(auth);
    navigate({ to: "/login" });
  };

  // ── Verified state ──────────────────────────────────────────
  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/40 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Email Verified! 🎉
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your email has been successfully verified. You can now log in to your account.
            </p>
          </div>

          {/* Go to login */}
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 active:scale-[0.98] transition-all duration-200 shadow-md shadow-emerald-200"
          >
            <LogIn className="w-4 h-4" />
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Waiting state ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/40 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">

        {/* Logo */}
        <div className="flex justify-center items-center gap-2">
          <Building2 className="w-7 h-7 text-emerald-500" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">Mulaky</span>
        </div>

        {/* Card */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl p-8 space-y-6 text-center">

          {/* Email icon with pulse */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-emerald-500" />
              </div>
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Check your email
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              We sent a verification link to your email address. Click the link to verify your account.
            </p>
          </div>

          {/* Auto checking indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Automatically checking for verification...
          </div>

          {/* Resent message */}
          {resent && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm rounded-xl px-4 py-3">
              ✅ Verification email resent! Check your inbox.
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            {/* Manual check */}
            <button
              onClick={handleCheckVerification}
              disabled={checking}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 active:scale-[0.98] transition-all duration-200 shadow-md shadow-emerald-200 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              {checking ? "Checking..." : "I've verified my email"}
            </button>

            {/* Resend */}
            <button
              onClick={handleResend}
              className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Resend verification email
            </button>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full py-3 rounded-xl text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}