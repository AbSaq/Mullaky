import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useLogin } from "../../../features/auth/loginMutation";

import type { Inputs } from "../../../features/auth/types";

import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit } = useForm<Inputs>();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    await loginMutation.mutateAsync(data);
    await navigate({ to: "/property" });
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
      <div className="flex lg:hidden items-center gap-2 mb-10">
        <Building2 className="w-7 h-7 text-emerald-500" />
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          Mullaky
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
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
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl"
            >
              {loginMutation.isPending ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/" className="text-emerald-600 font-semibold">
            Contact your admin
          </Link>
        </p>
      </div>
    </div>
  );
}
