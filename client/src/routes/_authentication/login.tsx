import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useLogin } from "../../features/auth/loginMutation";

import type { Inputs } from "../../features/auth/types";

import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/_authentication/login")({
  component: LoginPage,
});

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit } = useForm<Inputs>();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await loginMutation.mutateAsync(data);
      await navigate({ to: "/home" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen font-sans antialiased bg-gradient-to-br from-white via-emerald-50/40 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] bg-gradient-to-br from-emerald-500 to-green-700 p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[350px] h-[350px] bg-white/10 rounded-full pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <Building2 className="w-8 h-8 text-white" />
          <span className="text-2xl font-bold text-white">Mulaky</span>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-extrabold text-white leading-snug">
            Welcome back to
            <br />
            your community hub
          </h2>

          <p className="text-emerald-100 text-lg leading-relaxed max-w-sm">
            Manage maintenance requests, send alerts, and keep your building
            running smoothly — all from one place.
          </p>

          <div className="space-y-3">
            {[
              "End-to-end encrypted sessions",
              "Role-based access control",
              "Audit logs for every action",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <Shield className="w-3 h-3 text-white" />
                </div>
                <span className="text-emerald-100 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: "500+", label: "Buildings" },
            { value: "50K+", label: "Residents" },
            { value: "99.9%", label: "Uptime" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-emerald-200 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <Building2 className="w-7 h-7 text-emerald-500" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Mulaky
          </span>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Sign in
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl shadow-gray-100 dark:shadow-black/30 p-8 space-y-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register("username")}
                    type="text"
                    placeholder="username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {loginMutation.isError && (
                <p className="text-sm text-red-500">
                  {loginMutation.error.message || "Login failed"}
                </p>
              )}

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 active:scale-[0.98] transition-all duration-200 shadow-md shadow-emerald-200 disabled:opacity-60"
              >
                {loginMutation.isPending ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Contact your admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
