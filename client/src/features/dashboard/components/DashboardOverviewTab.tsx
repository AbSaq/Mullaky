import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  Layers,
  Home,
  Bell,
  Wrench,
  AlertTriangle,
  ShieldAlert,
  Info,
  Clock,
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
          Welcome back, {user.user?.fullName}! 
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

      {/* ── Latest Activity (Only for non-Admins) ── */}
      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Last Alert */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Last Alert</h3>
            </div>
            {data.recentAlerts?.[0] ? (() => {
              const alert = data.recentAlerts[0];
              const alertIconMap: Record<string, any> = {
                emergency: ShieldAlert,
                warning: AlertTriangle,
                info: Info,
                maintenance: Wrench,
              };
              const AlertIcon = alertIconMap[alert.type] || Info;
              const alertColorMap: Record<string, string> = {
                emergency: "text-red-500",
                warning: "text-orange-500",
                info: "text-blue-500",
                maintenance: "text-purple-500",
              };
              return (
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertIcon className={`w-4 h-4 shrink-0 ${alertColorMap[alert.type] || "text-blue-500"}`} />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{alert.title}</p>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{alert.content}</p>
                  <p className="text-[11px] text-gray-400">By {alert.userName}</p>
                </div>
              );
            })() : (
              <p className="p-4 text-xs text-gray-400">No alerts yet.</p>
            )}
          </div>

          {/* Last Maintenance */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Last Maintenance</h3>
            </div>
            {data.maintenanceRequests?.[0] ? (() => {
              const req = data.maintenanceRequests[0];
              const statusColor: Record<string, string> = {
                pending: "bg-orange-100 text-orange-600",
                "in-progress": "bg-blue-100 text-blue-600",
                resolved: "bg-emerald-100 text-emerald-700",
              };
              return (
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{req.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColor[req.status] || "bg-gray-100 text-gray-500"}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{req.description}</p>
                  <p className="text-[11px] text-gray-400">By {req.userName}</p>
                </div>
              );
            })() : (
              <p className="p-4 text-xs text-gray-400">No maintenance requests yet.</p>
            )}
          </div>

          {/* Last Finance */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Last Finance Report</h3>
            </div>
            {data.latestFinance ? (
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500">{data.latestFinance.month}</p>
                </div>
                <p className="text-2xl font-black text-emerald-500">
                  SAR {(data.latestFinance.totalCollected ?? 0).toLocaleString()}
                </p>
                {data.latestFinance.expenses?.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {data.latestFinance.expenses.slice(0, 3).map((exp: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs text-gray-400">
                        <span>{exp.name}</span>
                        <span className="font-medium">SAR {exp.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="p-4 text-xs text-gray-400">No finance report yet.</p>
            )}
          </div>

        </div>
      )}

      {/* ── Buildings Overview (Only for Admins) ── */}
      {isAdmin && data.buildingsData && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              Buildings Overview
            </h3>
            <span className="ml-auto text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
              {data.buildingsData.length} total
            </span>
          </div>
          {data.buildingsData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Building2 className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No buildings in the system yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {data.buildingsData.map((building: any) => (
                <div
                  key={building.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition duration-150"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {building.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <p className="text-xs text-gray-400 truncate">{building.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{building.floors ?? "—"} floors</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <Home className="w-3.5 h-3.5" />
                      <span>{building.units ?? "—"} units</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
