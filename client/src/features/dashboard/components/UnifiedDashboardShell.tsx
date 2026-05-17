import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Users,
  Bell,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Crown,
  Wrench,
  UserPlus,
} from "lucide-react";
import type { UnifiedDashboardResponse } from "../queries/dashboardQueries";

interface ShellProps {
  data: UnifiedDashboardResponse;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export function UnifiedDashboardShell({
  data,
  activeTab,
  setActiveTab,
  children,
}: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { role, building } = data;

  const isEmerald = role === "admin" || role === "user";
  const themeColor = isEmerald ? "bg-emerald-500" : "bg-blue-500";
  const textActiveColor = isEmerald
    ? "bg-emerald-500 text-white"
    : "bg-blue-500 text-white";
  const ringAccent = isEmerald
    ? "focus:ring-emerald-400"
    : "focus:ring-blue-400";
  const iconAccent = isEmerald ? "text-emerald-500" : "text-blue-500";
  const profileBg = isEmerald
    ? "bg-emerald-50 dark:bg-emerald-900/20"
    : "bg-blue-50 dark:bg-blue-900/20";
  const profileTextColor = isEmerald
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-blue-600 dark:text-blue-400";

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    ...(role === "admin"
      ? [
          { id: "buildings", label: "Buildings", icon: Building2 },
          { id: "users", label: "Users", icon: Users },
          { id: "assign-owners", label: "Assign Owners", icon: Crown },
        ]
      : []),
    ...(role === "owner"
      ? [
          { id: "residents", label: "Residents", icon: Users },
          { id: "invite", label: "Invite Users", icon: UserPlus },
          { id: "maintenance", label: "Maintenance", icon: Wrench },
          { id: "finances", label: "Finances", icon: DollarSign },
          { id: "alerts", label: "Alerts", icon: Bell },
        ]
      : []),
    ...(role === "user"
      ? [
          { id: "maintenance", label: "Maintenance", icon: Wrench },
          { id: "finances", label: "Finances", icon: DollarSign },
          { id: "alerts", label: "Alerts", icon: Bell },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex font-sans antialiased text-gray-900 dark:text-gray-100">
      {/* ── Sidebar Component Structure ── */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800/60 flex flex-col shrink-0`}
      >
        <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 ${themeColor} rounded-lg flex items-center justify-center`}
              >
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
                Mullaky
              </span>
            </div>
          )}
          {/* 💡 Fixed: Added ringAccent here */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition cursor-pointer focus:outline-none focus:ring-2 ${ringAccent}`}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {sidebarOpen && (
          <div
            className={`mx-4 mt-4 ${profileBg} border border-gray-100 dark:border-gray-800 rounded-xl p-3 flex items-center gap-3`}
          >
            <div
              className={`w-9 h-9 ${themeColor} rounded-full flex items-center justify-center text-white font-bold text-sm`}
            >
              {role[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                {role}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {role === "owner" && (
                  <Crown className={`w-3 h-3 ${profileTextColor}`} />
                )}
                <p
                  className={`text-xs font-medium capitalize ${profileTextColor}`}
                >
                  {role === "admin"
                    ? "Super Admin"
                    : role === "owner"
                      ? "Building Owner"
                      : "Resident"}
                </p>
              </div>
            </div>
          </div>
        )}

        {sidebarOpen && building && (
          <div className="mx-4 mt-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100/50 dark:border-gray-800/30">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Managing
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
              {building.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {building.address}
            </p>
          </div>
        )}

        {sidebarOpen && role !== "admin" && (
          <button
            onClick={() => navigate({ to: "/select-building" })}
            className={`mx-5 mt-3 text-xs font-semibold hover:underline text-left cursor-pointer focus:outline-none rounded ${profileTextColor}`}
          >
            ← Switch Infrastructure
          </button>
        )}

        <nav className="flex-1 p-4 space-y-1 mt-2">
          {navItems.map((item) => {
            const isTabActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 ${ringAccent} ${
                  isTabActive
                    ? textActiveColor + " shadow-sm font-semibold"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${isTabActive ? "text-white" : iconAccent}`}
                />
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {sidebarOpen && isTabActive && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition cursor-pointer font-medium text-sm focus:outline-none focus:ring-2 ${ringAccent}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── View Container Workspace Layout Frame ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize tracking-tight">
              {activeTab.replace("-", " ")}
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {building
                ? `${building.name} • ${building.address}`
                : "Global Administration Node"}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">{children}</div>
      </main>
    </div>
  );
}
