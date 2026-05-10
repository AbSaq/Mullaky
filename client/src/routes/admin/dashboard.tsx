import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  Bell,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { auth, firestore } from "../../firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../hooks/useAuth";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    buildings: 0,
    users: 0,
    alerts: 0,
    finances: 0,
  });
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  const fetchStats = async () => {
    try {
      const usersSnap = await getDocs(collection(firestore, "users"));
      const buildingsSnap = await getDocs(collection(firestore, "buildings"));
      const alertsSnap = await getDocs(collection(firestore, "alerts"));
      setStats({
        buildings: buildingsSnap.size,
        users: usersSnap.size,
        alerts: alertsSnap.size,
        finances: 0,
      });
    } catch (err) {
      console.log("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate({ to: "/login" });
      } else if (role && role !== "admin") {
        navigate({ to: "/welcome" });
      }
    }
  }, [user, role, loading]);

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Checking permissions...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut(auth);
    navigate({ to: "/login" });
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "buildings", label: "Buildings", icon: Building2 },
    { id: "users", label: "Users", icon: Users },
    { id: "finances", label: "Finances", icon: DollarSign },
    { id: "alerts", label: "Alerts", icon: Bell },
  ];

  const statCards = [
    { label: "Total Buildings", value: stats.buildings, icon: Building2, color: "emerald", change: "+2 this month" },
    { label: "Total Users", value: stats.users, icon: Users, color: "blue", change: "+12 this month" },
    { label: "Active Alerts", value: stats.alerts, icon: AlertTriangle, color: "orange", change: "3 urgent" },
    { label: "Monthly Revenue", value: "SAR 0", icon: DollarSign, color: "purple", change: "+8% vs last month" },
  ];

  const recentActivity = [
    { icon: CheckCircle2, color: "text-emerald-500", text: "Issue resolved: Elevator Floor 3", time: "2 min ago" },
    { icon: AlertTriangle, color: "text-orange-500", text: "New alert: Water leak Apt 14B", time: "15 min ago" },
    { icon: Users, color: "text-blue-500", text: "New user registered: Sara Ahmed", time: "1 hr ago" },
    { icon: DollarSign, color: "text-purple-500", text: "Finance report updated: May 2026", time: "3 hr ago" },
    { icon: Building2, color: "text-emerald-500", text: "New building added: Al Noor Tower", time: "1 day ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex font-sans">

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col`}>
        <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-lg">Mulaky</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="mx-4 mt-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Super Admin</p>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 mt-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                activeTab === id
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
              {sidebarOpen && activeTab === id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>

        <div className="p-8">

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {statCards.map(({ label, value, icon: Icon, color, change }) => (
                  <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        color === "emerald" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                        color === "blue" ? "bg-blue-100 dark:bg-blue-900/30" :
                        color === "orange" ? "bg-orange-100 dark:bg-orange-900/30" :
                        "bg-purple-100 dark:bg-purple-900/30"
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          color === "emerald" ? "text-emerald-500" :
                          color === "blue" ? "text-blue-500" :
                          color === "orange" ? "text-orange-500" :
                          "text-purple-500"
                        }`} />
                      </div>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">{change}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 dark:text-white text-lg">Recent Activity</h2>
                  <span className="text-xs text-emerald-600 font-medium cursor-pointer hover:underline">View all</span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {recentActivity.map(({ icon: Icon, color, text, time }, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{text}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Users tab ── */}
          {activeTab === "users" && <UsersSection />}

          {/* ── Buildings tab ── */}
          {activeTab === "buildings" && <BuildingsSection />}

          {/* ── Other tabs coming soon ── */}
          {activeTab !== "overview" && activeTab !== "users" && activeTab !== "buildings" && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto">
                  <Building2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Coming soon!</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Users Section ────────────────────────────────────────
function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(firestore, "users"));
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (uid: string, newRole: string) => {
    setUpdatingId(uid);
    try {
      await updateDoc(doc(firestore, "users", uid), { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.log("Error updating role:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const roleColors: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    owner: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    user: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Users</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{users.length} total users</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Building</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-sm">
                      {u.fullName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{u.fullName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleColors[u.role] || roleColors.user}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {u.buildingId || "—"}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={u.role}
                    disabled={updatingId === u.id}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="user">User</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Buildings Section ─────────────────────────────────────
function BuildingsSection() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", floors: "", units: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const snap = await getDocs(collection(firestore, "buildings"));
      setBuildings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addBuilding = async () => {
    if (!form.name || !form.address) return;
    setSaving(true);
    try {
      const docRef = await addDoc(collection(firestore, "buildings"), {
        name: form.name,
        address: form.address,
        floors: Number(form.floors) || 0,
        units: Number(form.units) || 0,
        ownerId: null,
        createdAt: serverTimestamp(),
      });
      setBuildings((prev) => [...prev, { id: docRef.id, ...form, ownerId: null }]);
      setForm({ name: "", address: "", floors: "", units: "" });
      setShowForm(false);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Buildings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{buildings.length} total buildings</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-600 transition shadow-md shadow-emerald-200"
        >
          + Add Building
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">New Building</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Building Name</label>
              <input
                type="text"
                placeholder="Al Noor Tower"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Address</label>
              <input
                type="text"
                placeholder="Jeddah, Saudi Arabia"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Floors</label>
              <input
                type="number"
                placeholder="10"
                value={form.floors}
                onChange={(e) => setForm({ ...form, floors: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Units</label>
              <input
                type="number"
                placeholder="48"
                value={form.units}
                onChange={(e) => setForm({ ...form, units: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={addBuilding}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Building"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {buildings.map((b) => (
          <div key={b.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-500" />
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${b.ownerId ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {b.ownerId ? "Has Owner" : "No Owner"}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{b.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{b.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{b.floors || 0}</p>
                <p className="text-xs text-gray-500">Floors</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{b.units || 0}</p>
                <p className="text-xs text-gray-500">Units</p>
              </div>
            </div>
          </div>
        ))}
        {buildings.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            No buildings yet. Click "Add Building" to get started!
          </div>
        )}
      </div>
    </div>
  );
}