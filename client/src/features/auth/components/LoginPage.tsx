import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth.ts";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Eye, EyeOff, Lock, Mail } from "lucide-react";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const { login, isLoading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void login(form.email, form.password);
  };

  return (
    <div className="min-h-screen font-sans antialiased bg-gradient-to-br from-white via-emerald-50/40 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex">
      {/* Decorative Split Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] bg-gradient-to-br from-emerald-500 to-green-700 p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] bg-white/10 rounded-full pointer-events-none" />
        <Link
          to="/"
          className="flex items-center gap-3 text-white font-bold text-2xl"
        >
          <Building2 className="w-8 h-8" />
          <span>Mullaky</span>
        </Link>
        <h2 className="text-4xl font-extrabold text-white leading-snug">
          Welcome back to
          <br />
          your community hub
        </h2>
      </div>

      {/* Interactive Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Sign in
          </h1>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-100 dark:border-gray-700 rounded-2xl p-8 space-y-5 shadow-xl">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:text-white"
                    placeholder="you@example.com"
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
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:text-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
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
                    Sign in <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Account Creation Anchor Redirect Options */}
            <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-700/60 text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Don't have an account yet?{" "}
              </span>
              <Link
                to="/register"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
