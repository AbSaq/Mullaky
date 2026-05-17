import { Bell, CheckCircle2, ArrowRight, Zap } from "lucide-react";

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section className="hero-section">
      {/* Ambient blobs */}
      <div className="absolute top-20 right-[-100px] w-[500px] h-[500px] bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-[-80px] w-[400px] h-[400px] bg-green-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="hero-inner">
        {/* Copy */}
        <div className="hero-copy">
          <div className="hero-badge">
            <Zap className="w-3.5 h-3.5" />
            <span>HOA Management, Simplified</span>
          </div>

          <h1 className="hero-title">
            Smart Community
            <span className="block text-emerald-500">Management for</span>
            Modern Buildings
          </h1>

          <p className="hero-subtitle">
            Mullaky helps residents, administrators, and maintenance teams
            manage building issues, emergency alerts, and community
            communication — all in one seamless platform.
          </p>

          <div className="hero-cta-group">
            <a href="/login" className="hero-cta-primary">
              Get Started <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/login" className="hero-cta-secondary">
              Login
            </a>
          </div>

          <div className="hero-stats">
            {["500+ Buildings", "50K+ Residents", "99.9% Uptime"].map(
              (stat) => (
                <div key={stat} className="hero-stat">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{stat}</span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Mock dashboard card */}
        <div className="hidden lg:flex justify-center">
          <div className="relative w-full max-w-lg">
            {/* Main panel */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <span className="text-sm font-semibold text-gray-800">
                  Building Dashboard
                </span>
                <span className="dashboard-live-badge">● Live</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Open Issues",
                    value: "12",
                    color: "text-orange-500",
                  },
                  { label: "In Progress", value: "8", color: "text-blue-500" },
                  { label: "Resolved", value: "47", color: "text-emerald-500" },
                ].map((item) => (
                  <div key={item.label} className="dashboard-stat-cell">
                    <p className={`text-2xl font-bold ${item.color}`}>
                      {item.value}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: "Elevator Malfunction – Floor 3",
                    status: "In Progress",
                    color: "bg-blue-100 text-blue-700",
                  },
                  {
                    title: "Water Leak – Apartment 14B",
                    status: "Assigned",
                    color: "bg-orange-100 text-orange-700",
                  },
                  {
                    title: "Lobby Light Repair",
                    status: "Resolved",
                    color: "bg-emerald-100 text-emerald-700",
                  },
                ].map((item) => (
                  <div key={item.title} className="dashboard-row">
                    <span className="text-xs font-medium text-gray-700">
                      {item.title}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.color}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating alert badge */}
            <div className="floating-badge -top-6 -right-6 w-56">
              <div className="bg-red-100 p-2 rounded-xl shrink-0">
                <Bell className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  Emergency Alert
                </p>
                <p className="text-xs text-gray-400">Sent to 248 residents</p>
              </div>
            </div>

            {/* Floating resolved badge */}
            <div className="floating-badge -bottom-4 -left-6 w-48">
              <div className="bg-emerald-100 p-2 rounded-xl shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  Issue Resolved
                </p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
