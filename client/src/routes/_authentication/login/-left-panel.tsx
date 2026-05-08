import { Building2, Shield } from "lucide-react";

export default function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between w-[48%] bg-gradient-to-br from-emerald-500 to-green-700 p-12 relative overflow-hidden">
      <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] bg-white/10 rounded-full" />
      <div className="absolute bottom-[-60px] right-[-60px] w-[350px] h-[350px] bg-white/10 rounded-full" />

      <div className="flex items-center gap-3 relative z-10">
        <Building2 className="w-8 h-8 text-white" />
        <span className="text-2xl font-bold text-white">Mullaky</span>
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
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
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
  );
}
