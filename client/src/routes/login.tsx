import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
} from "lucide-react";
import { auth, firestore } from "../firebase";
import { 
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // 👈 added for error messages
  const navigate = useNavigate();         // 👈 to redirect after login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

try {
  // 1. Sign in
  const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);

  // 2. Check if email is verified
  if (!userCredential.user.emailVerified) {
    await signOut(auth);
    setError("Please verify your email before logging in. Check your inbox.");
    return;
  }

  // 3. Update verified status in Firestore
  await setDoc(doc(firestore, "users", userCredential.user.uid), {
    verified: true
  }, { merge: true });

  // 4. Redirect to dashboard
  navigate({ to: "/welcome" });

} catch (err: any) {
  switch (err.code) {
    case "auth/user-not-found":
      setError("No account found with this email.");
      break;
    case "auth/wrong-password":
      setError("Incorrect password. Please try again.");
      break;
    case "auth/invalid-email":
      setError("Please enter a valid email address.");
      break;
    case "auth/too-many-requests":
      setError("Too many attempts. Please try again later.");
      break;
    default:
      setError("Something went wrong. Please try again.");
  }
} finally {
  setLoading(false);
}
  };

  return (
    <div className="min-h-screen font-sans antialiased bg-gradient-to-br from-white via-emerald-50/40 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex">
      {/* ── Left panel (decorative) ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] bg-gradient-to-br from-emerald-500 to-green-700 p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[350px] h-[350px] bg-white/10 rounded-full pointer-events-none" />

        <Link to="/" className="flex items-center gap-3 relative z-10 text-white hover:opacity-90">
          <Building2 className="w-8 h-8" />
          <span className="text-2xl font-bold">Mulaky</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-extrabold text-white leading-snug">
            Welcome back to<br />your community hub
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

      {/* ── Right panel (form) ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <Link to="/" className="flex lg:hidden items-center gap-2 mb-10 text-gray-900 dark:text-white hover:opacity-90">
          <Building2 className="w-7 h-7 text-emerald-500" />
          <span className="text-xl font-bold">Mulaky</span>
        </Link>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Sign in</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl shadow-gray-100 dark:shadow-black/30 p-8 space-y-5">
            
            {/* 👇 Error message box */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-xs text-emerald-600 hover:underline font-medium">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 active:scale-[0.98] transition-all duration-200 shadow-md shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
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
            <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}