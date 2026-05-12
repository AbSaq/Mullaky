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
  ChevronRight,
  Search,
  Crown,
  Wrench,
} from "lucide-react";
import { auth, firestore } from "../../firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs, doc, updateDoc, addDoc, getDoc, query, where, serverTimestamp, deleteDoc, deleteField } from "firebase/firestore";
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
    owners: 0,
    unassigned: 0,
  });
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  const fetchStats = async () => {
    try {
      const usersSnap = await getDocs(collection(firestore, "users"));
      const buildingsSnap = await getDocs(collection(firestore, "buildings"));
      const users = usersSnap.docs.map((d) => d.data());
      const buildings = buildingsSnap.docs.map((d) => d.data());
      setStats({
        buildings: buildingsSnap.size,
        users: usersSnap.size,
        owners: users.filter((u) => u.role === "owner").length,
        unassigned: buildings.filter((b) => !b.ownerId).length,
      });
    } catch (err) {
      console.log("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) navigate({ to: "/login" });
      else if (role && role !== "admin") navigate({ to: "/select-building" });
    }
  }, [user, role, loading]);

  useEffect(() => { fetchStats(); }, []);

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
    { id: "buildingdetails", label: "Buildings", icon: Building2 },
    { id: "users", label: "Users", icon: Users },
    { id: "assignowners", label: "Assign Owners", icon: Crown },
  ];

  const statCards = [
    { label: "Total Buildings", value: stats.buildings, icon: Building2, color: "emerald" },
    { label: "Total Users", value: stats.users, icon: Users, color: "blue" },
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{activeTab === "buildingdetails" ? "Buildings" : activeTab === "assignowners" ? "Assign Owners" : activeTab}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, Admin</p>
          </div>
          <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        <div className="p-8">

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        color === "emerald" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                      }`}>
                        <Icon className={`w-6 h-6 ${color === "emerald" ? "text-emerald-500" : "text-blue-500"}`} />
                      </div>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <AdminBuildingsOverview />
            </div>
          )}

          {/* ── Buildings Details tab ── */}
          {activeTab === "buildingdetails" && <BuildingDetailsSection />}

          {/* ── Users tab ── */}
          {activeTab === "users" && <UsersSection />}

          {/* ── Assign Owners tab ── */}
          {activeTab === "assignowners" && <AssignOwnersSection />}

        </div>
      </main>
    </div>
  );
}

// ── Admin Buildings Overview ──────────────────────────────
function AdminBuildingsOverview() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const buildingsSnap = await getDocs(collection(firestore, "buildings"));
      const buildingsList = await Promise.all(
        buildingsSnap.docs.map(async (d) => {
          const building = { id: d.id, ...d.data() } as any;
          if (building.ownerId) {
            const ownerSnap = await getDoc(doc(firestore, "users", building.ownerId));
            if (ownerSnap.exists()) building.owner = ownerSnap.data();
          }
          const membershipsSnap = await getDocs(query(collection(firestore, "memberships"), where("buildingId", "==", building.id)));
          building.residentsCount = membershipsSnap.size;
          const alertsSnap = await getDocs(query(collection(firestore, "alerts"), where("buildingId", "==", building.id)));
          building.alertsCount = alertsSnap.size;
          const maintenanceSnap = await getDocs(query(collection(firestore, "maintenance"), where("buildingId", "==", building.id)));
          building.maintenanceCount = maintenanceSnap.docs.filter((d) => d.data().status === "pending" || d.data().status === "in-progress").length;
          return building;
        })
      );
      setBuildings(buildingsList);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-gray-900 dark:text-white text-lg">Buildings Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {buildings.map((b) => (
          <div key={b.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-500" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${b.ownerId ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-600"}`}>
                {b.ownerId ? "Has Owner" : "No Owner"}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{b.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{b.address}</p>
            </div>
            {b.owner && (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2.5">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {b.owner.fullName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{b.owner.fullName}</p>
                  <p className="text-xs text-gray-400">{b.owner.email}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2 text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{b.residentsCount}</p>
                <p className="text-xs text-gray-400">Residents</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-2 text-center">
                <p className="text-sm font-bold text-orange-600">{b.alertsCount}</p>
                <p className="text-xs text-gray-400">Alerts</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2 text-center">
                <p className="text-sm font-bold text-blue-600">{b.maintenanceCount}</p>
                <p className="text-xs text-gray-400">Maintenance</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Building Details Section ──────────────────────────────
function BuildingDetailsSection() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", address: "", floors: "", units: "" });
  const [addingSaving, setAddingSaving] = useState(false);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [buildingResidents, setBuildingResidents] = useState<any[]>([]);
  const [buildingAlerts, setBuildingAlerts] = useState<any[]>([]);
  const [buildingMaintenance, setBuildingMaintenance] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", address: "", floors: "", units: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBuildings(); }, []);

const addBuilding = async () => {
    if (!addForm.name || !addForm.address) return;
    setAddingSaving(true);
    try {
      const docRef = await addDoc(collection(firestore, "buildings"), {
        name: addForm.name,
        address: addForm.address,
        floors: Number(addForm.floors) || 0,
        units: Number(addForm.units) || 0,
        ownerId: null,
        createdAt: serverTimestamp(),
      });
      setBuildings((prev) => [...prev, {
        id: docRef.id,
        ...addForm,
        floors: Number(addForm.floors) || 0,
        units: Number(addForm.units) || 0,
        ownerId: null,
        residentsCount: 0,
      }]);
      setAddForm({ name: "", address: "", floors: "", units: "" });
      setShowAddForm(false);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setAddingSaving(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const snap = await getDocs(collection(firestore, "buildings"));
      const list = await Promise.all(snap.docs.map(async (d) => {
        const b = { id: d.id, ...d.data() } as any;
        if (b.ownerId) {
          const ownerSnap = await getDoc(doc(firestore, "users", b.ownerId));
          if (ownerSnap.exists()) b.owner = ownerSnap.data();
        }
        const membSnap = await getDocs(query(collection(firestore, "memberships"), where("buildingId", "==", b.id)));
        b.residentsCount = membSnap.size;
        return b;
      }));
      setBuildings(list);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildingDetails = async (buildingId: string) => {
    setLoadingDetails(true);
    try {
      // Get residents
      const membSnap = await getDocs(query(collection(firestore, "memberships"), where("buildingId", "==", buildingId)));
      const residents = await Promise.all(membSnap.docs.map(async (d) => {
        const userSnap = await getDoc(doc(firestore, "users", d.data().userId));
        return { id: d.id, ...d.data(), ...userSnap.data() };
      }));
      setBuildingResidents(residents);

      // Get alerts
      const alertsSnap = await getDocs(query(collection(firestore, "alerts"), where("buildingId", "==", buildingId)));
      const alerts = alertsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      alerts.sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds);
      setBuildingAlerts(alerts);

      // Get maintenance
      const mainSnap = await getDocs(query(collection(firestore, "maintenance"), where("buildingId", "==", buildingId)));
      const maintenance = mainSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      maintenance.sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds);
      setBuildingMaintenance(maintenance);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const selectBuilding = (b: any) => {
    setSelectedBuilding(b);
    setEditForm({ name: b.name, address: b.address, floors: b.floors || "", units: b.units || "" });
    fetchBuildingDetails(b.id);
  };

  const saveEdit = async () => {
    if (!selectedBuilding) return;
    setSaving(true);
    try {
      await updateDoc(doc(firestore, "buildings", selectedBuilding.id), {
        name: editForm.name,
        address: editForm.address,
        floors: Number(editForm.floors) || 0,
        units: Number(editForm.units) || 0,
      });
      setBuildings((prev) => prev.map((b) => b.id === selectedBuilding.id ? { ...b, ...editForm } : b));
      setSelectedBuilding((prev: any) => ({ ...prev, ...editForm }));
      setShowEditForm(false);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  const removeResident = async (membershipId: string, userId: string) => {
    if (!confirm("Remove this resident from the building?")) return;
    try {
      await deleteDoc(doc(firestore, "memberships", membershipId));
      setBuildingResidents((prev) => prev.filter((r) => r.id !== membershipId));
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const deleteBuilding = async (buildingId: string) => {
    if (!confirm("Are you sure you want to delete this building? This will remove all residents and data.")) return;
    try {
      await deleteDoc(doc(firestore, "buildings", buildingId));
      const membSnap = await getDocs(query(collection(firestore, "memberships"), where("buildingId", "==", buildingId)));
      for (const mem of membSnap.docs) await deleteDoc(doc(firestore, "memberships", mem.id));
      const invSnap = await getDocs(query(collection(firestore, "invitations"), where("buildingId", "==", buildingId)));
      for (const inv of invSnap.docs) await deleteDoc(doc(firestore, "invitations", inv.id));
      setBuildings((prev) => prev.filter((b) => b.id !== buildingId));
      setSelectedBuilding(null);
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const filtered = buildings.filter((b) =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.address?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    pending: "bg-orange-100 text-orange-700",
    "in-progress": "bg-blue-100 text-blue-700",
    resolved: "bg-emerald-100 text-emerald-700",
  };

  const alertTypeColors: Record<string, string> = {
    emergency: "bg-red-100 text-red-700",
    warning: "bg-orange-100 text-orange-700",
    info: "bg-blue-100 text-blue-700",
    maintenance: "bg-purple-100 text-purple-700",
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

return (
    <div className="flex gap-6 h-full">
      {/* Buildings list */}
      <div className="w-80 shrink-0 space-y-3">

        {/* Add building button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-600 transition shadow-md"
        >
          + Add Building
        </button>

        {/* Add building form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">New Building</h3>
            <input
              type="text"
              placeholder="Building Name"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="text"
              placeholder="Address"
              value={addForm.address}
              onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Floors"
                value={addForm.floors}
                onChange={(e) => setAddForm({ ...addForm, floors: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="number"
                placeholder="Units"
                value={addForm.units}
                onChange={(e) => setAddForm({ ...addForm, units: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addBuilding}
                disabled={addingSaving}
                className="flex-1 bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl hover:bg-emerald-600 transition disabled:opacity-60"
              >
                {addingSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 border border-gray-200 text-gray-500 text-xs py-2 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search buildings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        {filtered.map((b) => (
          <button
            key={b.id}
            onClick={() => selectBuilding(b)}
            className={`w-full text-left bg-white dark:bg-gray-900 rounded-2xl border p-4 space-y-2 transition-all ${
              selectedBuilding?.id === b.id
                ? "border-emerald-500 shadow-md shadow-emerald-100"
                : "border-gray-100 dark:border-gray-800 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">{b.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.ownerId ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-600"}`}>
                {b.ownerId ? "✅ Owner" : "⚠️ No Owner"}
              </span>
            </div>
            <p className="text-xs text-gray-400">{b.address}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{b.residentsCount} residents</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No buildings found</p>
        )}
      </div>

      {/* Building details */}
      {selectedBuilding ? (
        <div className="flex-1 space-y-6 overflow-auto">

          {/* Header */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedBuilding.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedBuilding.address}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditForm(!showEditForm)}
                  className="text-xs bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => deleteBuilding(selectedBuilding.id)}
                  className="text-xs bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>

            {/* Edit form */}
            {showEditForm && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Name</label>
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Address</label>
                  <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Floors</label>
                  <input type="number" value={editForm.floors} onChange={(e) => setEditForm({ ...editForm, floors: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Units</label>
                  <input type="number" value={editForm.units} onChange={(e) => setEditForm({ ...editForm, units: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
                <div className="col-span-2 flex gap-2">
                  <button onClick={saveEdit} disabled={saving}
                    className="bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl hover:bg-emerald-600 transition disabled:opacity-60">
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setShowEditForm(false)}
                    className="border border-gray-200 text-gray-500 text-xs px-4 py-2 rounded-xl hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: "Floors", value: selectedBuilding.floors || 0, color: "bg-gray-50 dark:bg-gray-800" },
                { label: "Units", value: selectedBuilding.units || 0, color: "bg-gray-50 dark:bg-gray-800" },
                { label: "Residents", value: buildingResidents.length, color: "bg-emerald-50 dark:bg-emerald-900/20" },
                { label: "Alerts", value: buildingAlerts.length, color: "bg-orange-50 dark:bg-orange-900/20" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`${color} rounded-xl p-3 text-center`}>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {loadingDetails ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Residents */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" /> Residents ({buildingResidents.length})
                </h3>
                {buildingResidents.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No residents yet</p>
                ) : (
                  <div className="space-y-2">
                    {buildingResidents.map((r) => (
                      <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs">
                            {r.fullName?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{r.fullName}</p>
                            <p className="text-xs text-gray-400">{r.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.role === "owner" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                            {r.role}
                          </span>
                          <button
                            onClick={() => removeResident(r.id, r.userId)}
                            className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2 py-1 rounded-lg transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alerts */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-500" /> Alerts ({buildingAlerts.length})
                </h3>
                {buildingAlerts.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No alerts yet</p>
                ) : (
                  <div className="space-y-3">
                    {buildingAlerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${alertTypeColors[alert.type] || "bg-blue-100 text-blue-700"}`}>
                          {alert.type}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</p>
                          <p className="text-xs text-gray-400">by {alert.userName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Maintenance */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-500" /> Maintenance ({buildingMaintenance.length})
                </h3>
                {buildingMaintenance.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No maintenance requests yet</p>
                ) : (
                  <div className="space-y-3">
                    {buildingMaintenance.slice(0, 5).map((m) => (
                      <div key={m.id} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusColors[m.status] || statusColors.pending}`}>
                          {m.status}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{m.title}</p>
                          <p className="text-xs text-gray-400">by {m.userName} • {m.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Select a building to view details</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Users Section ────────────────────────────────────────
function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchUsers(); }, []);

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

  const filtered = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400 text-sm">No users found.</td></tr>
            )}
            {filtered.map((u) => (
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

// ── Assign Owners Section ─────────────────────────────────
function AssignOwnersSection() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ownerSearch, setOwnerSearch] = useState<Record<string, string>>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const buildSnap = await getDocs(collection(firestore, "buildings"));
      const userSnap = await getDocs(collection(firestore, "users"));
      const buildingsList = await Promise.all(buildSnap.docs.map(async (d) => {
        const b = { id: d.id, ...d.data() } as any;
        if (b.ownerId) {
          const ownerSnap = await getDoc(doc(firestore, "users", b.ownerId));
          if (ownerSnap.exists()) b.owner = ownerSnap.data();
        }
        return b;
      }));
      setBuildings(buildingsList);
      setOwners(userSnap.docs.map((d) => ({ id: d.id, ...d.data() as any })).filter((u) => u.role === "owner" || u.role === "user"));
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const assignOwner = async (buildingId: string, ownerId: string) => {
    setAssigningId(buildingId);
    try {
      const buildingSnap = await getDoc(doc(firestore, "buildings", buildingId));
      const buildingData = buildingSnap.data();

      const oldMemberships = await getDocs(query(collection(firestore, "memberships"), where("buildingId", "==", buildingId), where("role", "==", "owner")));
      for (const oldMem of oldMemberships.docs) await deleteDoc(doc(firestore, "memberships", oldMem.id));

      await updateDoc(doc(firestore, "buildings", buildingId), { ownerId });
      await updateDoc(doc(firestore, "users", ownerId), { buildingId, role: "owner" });
      await addDoc(collection(firestore, "memberships"), {
        userId: ownerId,
        buildingId,
        buildingName: buildingData?.name || "",
        buildingAddress: buildingData?.address || "",
        role: "owner",
        createdAt: serverTimestamp(),
      });

      const ownerData = owners.find((o) => o.id === ownerId);
      setBuildings((prev) => prev.map((b) => b.id === buildingId ? { ...b, ownerId, owner: ownerData } : b));
      setOwnerSearch((prev) => { const u = { ...prev }; delete u[buildingId]; return u; });
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setAssigningId(null);
    }
  };

  const removeOwner = async (buildingId: string, ownerId: string) => {
    if (!confirm("Remove this owner?")) return;
    try {
      await updateDoc(doc(firestore, "buildings", buildingId), { ownerId: deleteField() });
      await updateDoc(doc(firestore, "users", ownerId), { buildingId: deleteField() });
      const membSnap = await getDocs(query(collection(firestore, "memberships"), where("buildingId", "==", buildingId), where("role", "==", "owner")));
      for (const mem of membSnap.docs) await deleteDoc(doc(firestore, "memberships", mem.id));
      setBuildings((prev) => prev.map((b) => b.id === buildingId ? { ...b, ownerId: null, owner: null } : b));
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const filtered = buildings.filter((b) =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.address?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assign Owners</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Assign owners to buildings</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search buildings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((b) => {
          const filteredOwners = owners.filter((o) =>
            !ownerSearch[b.id] ||
            o.fullName?.toLowerCase().includes(ownerSearch[b.id].toLowerCase()) ||
            o.email?.toLowerCase().includes(ownerSearch[b.id].toLowerCase())
          );

          return (
            <div key={b.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${b.ownerId ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-600"}`}>
                  {b.ownerId ? "Has Owner" : "No Owner"}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{b.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{b.address}</p>
              </div>

              {/* Current owner */}
              {b.owner && (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {b.owner.fullName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{b.owner.fullName}</p>
                      <p className="text-xs text-gray-400">{b.owner.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeOwner(b.id, b.ownerId)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Search and assign owner */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-medium text-gray-500">Assign New Owner</p>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={ownerSearch[b.id] || ""}
                    onChange={(e) => setOwnerSearch((prev) => ({ ...prev, [b.id]: e.target.value }))}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                {ownerSearch[b.id] && (
                  <div className="max-h-32 overflow-y-auto space-y-1 border border-gray-100 dark:border-gray-800 rounded-xl p-1">
                    {filteredOwners.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2">No users found</p>
                    ) : (
                      filteredOwners.slice(0, 5).map((o) => (
                        <button
                          key={o.id}
                          onClick={() => assignOwner(b.id, o.id)}
                          disabled={assigningId === b.id}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition text-left"
                        >
                          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xs font-bold shrink-0">
                            {o.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{o.fullName}</p>
                            <p className="text-xs text-gray-400 truncate">{o.email}</p>
                          </div>
                          {assigningId === b.id ? (
                            <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="text-xs text-emerald-500">Assign</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}