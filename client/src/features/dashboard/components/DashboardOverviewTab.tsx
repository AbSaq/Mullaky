import {
  Building2,
  Users,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Activity,
  Bell,
  Wrench,
} from "lucide-react";

interface OverviewProps {
  data: any;
  user: any;
}

export function DashboardOverviewTab({ data, user }: Readonly<OverviewProps>) {
  const isAdmin = user.role === "admin";

  // Dynamic Summary Metrics Card Layout Builder
  const statCards = isAdmin
    ? [
        {
          label: "Total Buildings",
          value: data.stats?.buildings ?? 0,
          icon: Building2,
          color: "emerald",
          change: "+2 this month",
        },
        {
          label: "Total Users",
          value: data.stats?.users ?? 0,
          icon: Users,
          color: "blue",
          change: "+12 this month",
        },
        {
          label: "Active Alerts",
          value: data.stats?.alerts ?? 0,
          icon: AlertTriangle,
          color: "orange",
          change: "3 urgent",
        },
        {
          label: "Monthly Revenue",
          value: "SAR 0",
          icon: DollarSign,
          color: "purple",
          change: "+8% vs last month",
        },
      ]
    : [
        {
          label: "Alert Notifications",
          value: data.stats?.alerts ?? 0,
          icon: Bell,
          color: "orange",
          change: "Immediate attention required",
        },
        {
          label: "Active Maintenance Tasks",
          value: data.stats?.maintenance ?? 0,
          icon: Wrench,
          color: "blue",
          change: "Kanban task tracking active",
        },
        {
          label: "Financial Aggregates",
          value: `SAR ${(data.stats?.finances ?? 0).toLocaleString()}`,
          icon: DollarSign,
          color: "emerald",
          change: "Cleared current period balance",
        },
      ];

  // Map Activity Feed Icons to their respective state styles
  const getActivityMeta = (type: string) => {
    switch (type) {
      case "resolved":
        return {
          icon: CheckCircle2,
          color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          color: "text-orange-500 bg-orange-50 dark:bg-orange-950/20",
        };
      case "user":
        return {
          icon: Users,
          color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
        };
      case "finance":
        return {
          icon: DollarSign,
          color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
        };
      default:
        return {
          icon: Building2,
          color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
        };
    }
  };

  const welcomeGradient = isAdmin
    ? "from-emerald-500 to-teal-600"
    : user.role === "owner"
      ? "from-blue-500 to-indigo-600"
      : "from-emerald-500 to-teal-600";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Banner ── */}
      <div
        className={`bg-gradient-to-r ${welcomeGradient} p-6 rounded-2xl text-white shadow-sm`}
      >
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {user.user?.fullName}! 👋
        </h2>
        <p className="text-emerald-100/90 text-sm mt-1 font-medium">
          {isAdmin
            ? "Global platform configurations control console engine active."
            : `Workspace metrics tracking active for ${data.building?.name || "assigned building"}.`}
        </p>
      </div>

      {/* ── Stats Panels Grid Grid ── */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? "xl:grid-cols-4" : "md:grid-cols-3"} gap-6`}
      >
        {statCards.map(({ label, value, icon: Icon, color, change }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800/60 shadow-sm hover:shadow-md transition duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  color === "emerald"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500"
                    : color === "blue"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-500"
                      : color === "orange"
                        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-500"
                        : "bg-purple-50 dark:bg-purple-900/20 text-purple-500"
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {value}
            </p>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-1">
              {label}
            </p>
            {change && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                {change}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Dynamic Audit Trail Activity Logging (Only for Admins) ── */}
      {isAdmin && data.recentActivity && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              System Real-Time Activity Log
            </h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {data.recentActivity.map((act: any, i: number) => {
              const meta = getActivityMeta(act.type);
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition duration-150"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}
                  >
                    <meta.icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 font-medium">
                    {act.text}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {act.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
