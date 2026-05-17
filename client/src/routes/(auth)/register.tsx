import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ArrowRight } from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth";

export const Route = createFileRoute("/(auth)/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const [showPassword] = useState(false); // Retained for type consistency with design layouts
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [localValidationError, setLocalValidationError] = useState("");

  const { register, isLoading, error: serverError } = useAuth();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalValidationError("");

    if (form.password !== form.confirmPassword) {
      setLocalValidationError("Confirm password does not match.");
      return;
    }

    // Direct delegation to backend services via Express transport pipelines
    register(form.email, form.password, form.fullName);
  };

  const activeError = localValidationError || serverError;

  return (
    <div className="min-h-screen font-sans antialiased bg-gradient-to-br from-white via-emerald-50/40 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex">
      {/* Decorative Left Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] bg-gradient-to-br from-emerald-500 to-green-700 p-12 relative overflow-hidden">
        <Link
          to="/"
          className="flex items-center gap-3 text-white font-bold text-2xl"
        >
          <Building2 className="w-8 h-8" />
          <span>Mulaky</span>
        </Link>
        <h2 className="text-4xl font-extrabold text-white">
          Create your account
          <br />
          and join the community
        </h2>
      </div>

      {/* Interactive User Setup Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Create account
          </h1>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-100 dark:border-gray-700 rounded-2xl p-8 space-y-5 shadow-xl">
            {activeError && (
              <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-600 border border-red-200">
                {activeError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:text-white"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:text-white"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 cursor-pointer hover:bg-emerald-600 active:scale-[0.99]"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Register <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* 💡 Navigation option to fallback to login views */}
            <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-700/60 text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
              </span>
              <Link
                to="/login"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
