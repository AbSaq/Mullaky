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
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Wrench,
  Send,
  UserPlus,
  TrendingUp,
  Mail,
  Crown,
} from "lucide-react";
import { auth, firestore } from "../../firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { useAlerts } from "../../hooks/useAlerts";


export const Route = createFileRoute("/owner/dashboard")({
  component: OwnerDashboard,
});

function OwnerDashboard() {
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [building, setBuilding] = useState<any>(null);
  const [residents, setResidents] = useState<any[]>([]);
  const [stats, setStats] = useState({ residents: 0, alerts: 0, maintenance: 0, finances: 0 });
  const [pendingInvites, setPendingInvites] = useState(0);
  const navigate = useNavigate();
  const { user, userData, role, loading } = useAuth();

  // Get selected building from sessionStorage
  const selectedMembership = JSON.parse(sessionStorage.getItem("selectedBuilding") || "{}");
  const { alerts: recentAlerts, unreadCount, markAllRead } = useAlerts(selectedMembership?.buildingId || "");

const fetchBuildingData = async () => {
    if (!selectedMembership?.buildingId) return;
    try {
      // Get building info
      const buildingSnap = await getDoc(doc(firestore, "buildings", selectedMembership.buildingId));
      if (buildingSnap.exists()) setBuilding({ id: buildingSnap.id, ...buildingSnap.data() });

      // Get residents
      const residentsSnap = await getDocs(
        query(collection(firestore, "memberships"), where("buildingId", "==", selectedMembership.buildingId))
      );
      const residentsList = await Promise.all(
        residentsSnap.docs.map(async (d) => {
          const memberData = d.data();
          const userSnap = await getDoc(doc(firestore, "users", memberData.userId));
          return { id: d.id, ...memberData, ...userSnap.data() };
        })
      );
      setResidents(residentsList);

      // Get alerts count
      const alertsSnap = await getDocs(
        query(collection(firestore, "alerts"), where("buildingId", "==", selectedMembership.buildingId))
      );

      // Get maintenance count (pending + in-progress)
      const maintenanceSnap = await getDocs(
        query(collection(firestore, "maintenance"), where("buildingId", "==", selectedMembership.buildingId))
      );
      const activeMaintenace = maintenanceSnap.docs.filter(
        (d) => d.data().status === "pending" || d.data().status === "in-progress"
      ).length;

      // Get latest finance total
      const financesSnap = await getDocs(
        query(collection(firestore, "finances"), where("buildingId", "==", selectedMembership.buildingId))
      );
      let latestFinance = 0;
      if (!financesSnap.empty) {
        const finances = financesSnap.docs.map((d) => ({ ...d.data() }));
        finances.sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds);
        latestFinance = finances[0].totalCollected || 0;
      }

      setStats({
        residents: residentsList.length,
        alerts: alertsSnap.size,
        maintenance: activeMaintenace,
        finances: latestFinance,
      });

      // Get pending invitations
      const invSnap = await getDocs(
        query(
          collection(firestore, "invitations"),
          where("toUserId", "==", user?.uid),
          where("status", "==", "pending")
        )
      );
      setPendingInvites(invSnap.size);

    } catch (err) {
      console.log("Error:", err);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate({ to: "/login" });
      } else if (role && role !== "owner") {
        navigate({ to: "/user/dashboard" });
      }
    }
  }, [user, role, loading]);

useEffect(() => {
    if (user) fetchBuildingData();
  }, [user]);

useEffect(() => {
    if (activeTab === "overview" && user) {
      fetchBuildingData();
    }
  }, [activeTab]);

  if (loading || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your dashboard...</p>
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
    { id: "residents", label: "Residents", icon: Users },
    { id: "invite", label: "Invite Users", icon: UserPlus },
    { id: "myinvitations", label: "My Invitations", icon: Mail, badge: pendingInvites },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "finances", label: "Finances", icon: DollarSign },
    { id: "alerts", label: "Alerts", icon: Bell },
  ];

const statCards = [
    { label: "Total Residents", value: stats.residents, icon: Users, color: "blue" },
    { label: "Alerts", value: stats.alerts, icon: AlertTriangle, color: "orange" },
    { label: "Active Maintenance", value: stats.maintenance, icon: CheckCircle2, color: "emerald" },
    { label: "Latest Collection", value: `SAR ${stats.finances.toLocaleString()}`, icon: DollarSign, color: "purple" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex font-sans">

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col`}>
        <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
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
          <div className="mx-4 mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {userData?.fullName?.[0]?.toUpperCase() || "O"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{userData?.fullName}</p>
              <div className="flex items-center gap-1">
                <Crown className="w-3 h-3 text-blue-500" />
                <p className="text-xs text-blue-600 dark:text-blue-400">Building Owner</p>
              </div>
            </div>
          </div>
        )}

        {sidebarOpen && building && (
          <div className="mx-4 mt-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Managing</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{building.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{building.address}</p>
          </div>
        )}

        {/* Switch building button */}
        {sidebarOpen && (
          <button
            onClick={() => navigate({ to: "/select-building" })}
            className="mx-4 mt-2 text-xs text-emerald-600 hover:underline text-left px-1"
          >
            ← Switch Building
          </button>
        )}

        <nav className="flex-1 p-4 space-y-1 mt-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                activeTab === id
                  ? "bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900"
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

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {building ? building.name : "No building assigned yet"}
            </p>
          </div>
<div className="relative">
  <button
    onClick={() => { setShowAlertDropdown(!showAlertDropdown); markAllRead(); }}
    className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
  >
    <Bell className="w-5 h-5 text-gray-500" />
    {unreadCount > 0 && (
      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    )}
  </button>

  {/* Alert dropdown */}
  {showAlertDropdown && (
    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl z-50">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Alerts</h3>
        <button onClick={() => setShowAlertDropdown(false)} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {recentAlerts.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No alerts yet</div>
        ) : (
          recentAlerts.map((alert: any) => (
            <div key={alert.id} className={`p-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${
              alert.type === "emergency" ? "border-l-2 border-l-red-500" :
              alert.type === "warning" ? "border-l-2 border-l-orange-500" : ""
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  alert.type === "emergency" ? "bg-red-100 text-red-700" :
                  alert.type === "warning" ? "bg-orange-100 text-orange-700" :
                  alert.type === "maintenance" ? "bg-purple-100 text-purple-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {alert.type === "emergency" ? "🚨" : alert.type === "warning" ? "⚠️" : alert.type === "maintenance" ? "🔧" : "ℹ️"} {alert.type}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</p>
              {alert.message && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{alert.message}</p>}
              <p className="text-xs text-gray-400 mt-1">by {alert.userName} • {alert.createdAt?.toDate?.()?.toLocaleDateString() || "Just now"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )}
</div>
        </div>

        <div className="p-8">

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        color === "blue" ? "bg-blue-100 dark:bg-blue-900/30" :
                        color === "orange" ? "bg-orange-100 dark:bg-orange-900/30" :
                        color === "emerald" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                        "bg-purple-100 dark:bg-purple-900/30"
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          color === "blue" ? "text-blue-500" :
                          color === "orange" ? "text-orange-500" :
                          color === "emerald" ? "text-emerald-500" :
                          "text-purple-500"
                        }`} />
                      </div>
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Building info */}
              {building && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Building Info</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Name", value: building.name },
                      { label: "Address", value: building.address },
                      { label: "Floors", value: building.floors || 0 },
                      { label: "Units", value: building.units || 0 },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
              )
              }
            {/* Latest finance summary */}
              <LatestFinanceSummary buildingId={selectedMembership?.buildingId || ""} />
            </div>
               )}


          {/* ── Residents ── */}
{activeTab === "residents" && (
  <ResidentsSection 
    residents={residents} 
    setResidents={setResidents}
    buildingId={selectedMembership?.buildingId || ""}
  />
)}



          {/* ── Invite Users ── */}
          {activeTab === "invite" && (
            <InviteSection
              buildingId={selectedMembership?.buildingId || ""}
              buildingName={building?.name || ""}
              ownerId={user?.uid || ""}
            />
          )}

{/* ── My Invitations ── */}
{activeTab === "myinvitations" && (
  <OwnerInvitationsSection userId={user?.uid || ""} />
)}

{activeTab === "finances" && (
  <FinancesSection buildingId={selectedMembership?.buildingId || ""} />
)}

{activeTab === "maintenance" && (
  <OwnerMaintenanceSection buildingId={selectedMembership?.buildingId || ""} />
)}

{activeTab === "alerts" && (
  <AlertsSection
    buildingId={selectedMembership?.buildingId || ""}
    userId={user?.uid || ""}
    userName={userData?.fullName || ""}
  />
)}

{/* ── Coming soon ── */}
{activeTab !== "overview" && activeTab !== "residents" && activeTab !== "invite" && activeTab !== "myinvitations" && activeTab !== "finances" && activeTab !== "maintenance" && activeTab !== "alerts" && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto">
                  <Building2 className="w-8 h-8 text-blue-500" />
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

// ── Residents Section ─────────────────────────────────────
function ResidentsSection({ residents, setResidents, buildingId }: { 
  residents: any[], 
  setResidents: (r: any[]) => void,
  buildingId: string 
}) {
  const [search, setSearch] = useState("");

const removeResident = async (userId: string, membershipId: string) => {
  if (!confirm("Are you sure you want to remove this resident?")) return;
  try {
    await deleteDoc(doc(firestore, "memberships", membershipId));
    setResidents(residents.filter((r) => r.id !== membershipId));
  } catch (err: any) {
    console.log("Error removing resident:", err.message);
    alert("Error: " + err.message);
  }
};

  const filtered = residents.filter(
    (r) =>
      r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Residents</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{residents.length} total residents</p>
      </div>

      <div className="relative">
        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search residents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resident</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400 text-sm">No residents found.</td>
              </tr>
            )}
{filtered.map((r) => (
  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-sm">
          {r.fullName?.[0]?.toUpperCase() || "?"}
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{r.fullName}</span>
      </div>
    </td>
    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{r.email}</td>
    <td className="px-6 py-4">
      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        {r.role}
      </span>
    </td>
    <td className="px-6 py-4">
      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
        Active
      </span>
    </td>
    <td className="px-6 py-4">
  <button
    onClick={() => removeResident(r.userId || r.id, r.id)}
    className="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-200 transition"
  >
    Remove
  </button>
</td>
  </tr>
))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Invite Section ────────────────────────────────────────
function InviteSection({ buildingId, buildingName, ownerId }: { buildingId: string; buildingName: string; ownerId: string }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [invitations, setInvitations] = useState<any[]>([]);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const snap = await getDocs(
        query(collection(firestore, "invitations"), where("buildingId", "==", buildingId))
      );
      setInvitations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const sendInvitation = async () => {
    if (!email) return;
    setSending(true);
    setError("");
    setSuccess("");

    try {
      // Find user by email
      const usersSnap = await getDocs(
        query(collection(firestore, "users"), where("email", "==", email))
      );

      if (usersSnap.empty) {
        setError("No user found with this email. They need to register first.");
        return;
      }

      const targetUser = usersSnap.docs[0];

      // Check if already invited
      const existingInvite = invitations.find(
        (inv) => inv.toUserId === targetUser.id && inv.status === "pending"
      );

      if (existingInvite) {
        setError("This user already has a pending invitation.");
        return;
      }

      // Send invitation
      await addDoc(collection(firestore, "invitations"), {
        buildingId,
        buildingName,
        toUserId: targetUser.id,
        toUserEmail: email,
        fromOwnerId: ownerId,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSuccess(`Invitation sent to ${email} successfully!`);
      setEmail("");
      fetchInvitations();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-orange-100 text-orange-700",
    accepted: "bg-emerald-100 text-emerald-700",
    declined: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invite Users</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Send invitations to join {buildingName}</p>
      </div>

      {/* Invite form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white">Send Invitation</h3>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
            {success}
          </div>
        )}

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Send className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="Enter user email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={sendInvitation}
            disabled={sending || !email}
            className="flex items-center gap-2 bg-blue-500 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-blue-600 transition disabled:opacity-60"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" /> Send
              </>
            )}
          </button>
        </div>
      </div>

      {/* Invitations list */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white">Sent Invitations</h3>
        </div>
        {invitations.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No invitations sent yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{inv.toUserEmail}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[inv.status] || statusColors.pending}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {inv.createdAt?.toDate?.()?.toLocaleDateString() || "Just now"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Owner Invitations Section ─────────────────────────────
function OwnerInvitationsSection({ userId }: { userId: string }) {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const snap = await getDocs(
        query(
          collection(firestore, "invitations"),
          where("toUserId", "==", userId),
          where("status", "==", "pending")
        )
      );
      setInvitations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (inv: any) => {
    try {
      await updateDoc(doc(firestore, "invitations", inv.id), { status: "accepted" });
      await addDoc(collection(firestore, "memberships"), {
        userId,
        buildingId: inv.buildingId,
        buildingName: inv.buildingName,
        buildingAddress: "",
        role: "user",
        createdAt: serverTimestamp(),
      });
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
      navigate({ to: "/select-building" });
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const declineInvitation = async (inv: any) => {
    try {
      await updateDoc(doc(firestore, "invitations", inv.id), { status: "declined" });
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
    } catch (err) {
      console.log("Error:", err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Invitations</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{invitations.length} pending invitations</p>
      </div>

      {invitations.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">No invitations</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">You don't have any pending invitations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((inv) => (
            <div key={inv.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{inv.buildingName}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3" />
                  {inv.createdAt?.toDate?.()?.toLocaleDateString() || "Just now"}
                </div>
                <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                  Pending
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => acceptInvitation(inv)}
                  className="flex items-center gap-2 bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-600 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Accept
                </button>
                <button
                  onClick={() => declineInvitation(inv)}
                  className="flex items-center gap-2 border border-red-200 text-red-500 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-red-50 transition"
                >
                  <XCircle className="w-4 h-4" />
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Finances Section ─────────────────────────────────────
function FinancesSection({ buildingId }: { buildingId: string }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    month: "",
    totalCollected: "",
    notes: "",
  });
  const [expenses, setExpenses] = useState([
    { name: "Maintenance", amount: "" },
    { name: "Security", amount: "" },
    { name: "Cleaning", amount: "" },
    { name: "Utilities", amount: "" },
  ]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const snap = await getDocs(
        query(collection(firestore, "finances"), where("buildingId", "==", buildingId))
      );
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addReport = async () => {
    if (!form.month || !form.totalCollected) return;
    setSaving(true);
    try {
      const docRef = await addDoc(collection(firestore, "finances"), {
        buildingId,
        month: form.month,
        totalCollected: Number(form.totalCollected),
        expenses: expenses.map((e) => ({ name: e.name, amount: Number(e.amount) || 0 })),
        notes: form.notes,
        createdAt: serverTimestamp(),
      });
      setReports((prev) => [...prev, {
        id: docRef.id,
        buildingId,
        month: form.month,
        totalCollected: Number(form.totalCollected),
        expenses: expenses.map((e) => ({ name: e.name, amount: Number(e.amount) || 0 })),
        notes: form.notes,
      }]);
      setForm({ month: "", totalCollected: "", notes: "" });
      setExpenses([
        { name: "Maintenance", amount: "" },
        { name: "Security", amount: "" },
        { name: "Cleaning", amount: "" },
        { name: "Utilities", amount: "" },
      ]);
      setShowForm(false);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    try {
      await deleteDoc(doc(firestore, "finances", id));
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Finances</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{reports.length} reports</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-600 transition shadow-md"
        >
          + Add Report
        </button>
      </div>

      {/* Add report form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">New Financial Report</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Month</label>
              <input
                type="text"
                placeholder="May 2026"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Collected (SAR)</label>
              <input
                type="number"
                placeholder="50000"
                value={form.totalCollected}
                onChange={(e) => setForm({ ...form, totalCollected: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Expenses */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Expenses Breakdown</label>
            <div className="grid grid-cols-2 gap-3">
              {expenses.map((exp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={exp.name}
                    onChange={(e) => {
                      const updated = [...expenses];
                      updated[i].name = e.target.value;
                      setExpenses(updated);
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="number"
                    placeholder="0"
                    value={exp.amount}
                    onChange={(e) => {
                      const updated = [...expenses];
                      updated[i].amount = e.target.value;
                      setExpenses(updated);
                    }}
                    className="w-24 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setExpenses([...expenses, { name: "", amount: "" }])}
              className="text-xs text-blue-500 hover:underline"
            >
              + Add expense
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Notes</label>
            <textarea
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={addReport}
              disabled={saving}
              className="bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-600 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Report"}
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

      {/* Reports list */}
      {reports.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">No reports yet</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Click "Add Report" to create your first financial report.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6">
              {/* Report header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{report.month}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Total Collected: <span className="font-semibold text-emerald-500">SAR {report.totalCollected?.toLocaleString()}</span>
                  </p>
                </div>
                <button
                  onClick={() => deleteReport(report.id)}
                  className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition"
                >
                  Delete
                </button>
              </div>

              {/* Charts */}
              {report.expenses?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bar chart */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Expenses Breakdown</p>
                    <BarChart width={300} height={200} data={report.expenses}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                        formatter={(value: any) => [`SAR ${value.toLocaleString()}`, ""]}
                      />
                      <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </div>

                  {/* Pie chart */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Distribution</p>
                    <PieChart width={300} height={200}>
                      <Pie
                        data={report.expenses}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {report.expenses.map((_: any, index: number) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                        formatter={(value: any) => [`SAR ${value.toLocaleString()}`, ""]}
                      />
                    </PieChart>
                  </div>
                </div>
              )}

              {/* Expenses table */}
              <div className="space-y-2">
                {report.expenses?.map((exp: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{exp.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">SAR {exp.amount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {report.notes && (
                <p className="text-xs text-gray-400 italic">{report.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Latest Finance Summary ────────────────────────────────
function LatestFinanceSummary({ buildingId }: { buildingId: string }) {
  const [latest, setLatest] = useState<any>(null);
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

  useEffect(() => {
    fetchLatest();
  }, []);

  const fetchLatest = async () => {
    try {
      const snap = await getDocs(
        query(collection(firestore, "finances"), where("buildingId", "==", buildingId))
      );
if (!snap.empty) {
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort by createdAt to get the latest
  docs.sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds);
  setLatest(docs[0]); // 👈 first item after sorting = latest
}
    } catch (err) {
      console.log("Error:", err);
    }
  };

  if (!latest) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 dark:text-white text-lg">Latest Finance Report</h2>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">{latest.month}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Collected</p>
          <p className="text-lg font-bold text-emerald-600 mt-1">SAR {latest.totalCollected?.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Expenses</p>
          <p className="text-lg font-bold text-blue-600 mt-1">
            SAR {latest.expenses?.reduce((a: number, e: any) => a + e.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
          <p className="text-lg font-bold text-purple-600 mt-1">
            SAR {(latest.totalCollected - latest.expenses?.reduce((a: number, e: any) => a + e.amount, 0)).toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Expense Items</p>
          <p className="text-lg font-bold text-orange-600 mt-1">{latest.expenses?.length || 0}</p>
        </div>
      </div>

      {/* Mini expenses list */}
      <div className="space-y-2">
        {latest.expenses?.map((exp: any, i: number) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{exp.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${(exp.amount / latest.totalCollected) * 100}%`,
                    backgroundColor: COLORS[i % COLORS.length]
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white w-20 text-right">SAR {exp.amount?.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Owner Maintenance Section ─────────────────────────────
function OwnerMaintenanceSection({ buildingId }: { buildingId: string }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
  title: "",
  description: "",
  category: "General",
  status: "in-progress",
});
  

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const snap = await getDocs(
        query(collection(firestore, "maintenance"), where("buildingId", "==", buildingId))
      );
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(firestore, "maintenance", id), {
        status,
        updatedAt: serverTimestamp(),
      });
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const saveNotes = async (id: string) => {
    try {
      await updateDoc(doc(firestore, "maintenance", id), {
        ownerNotes: noteText,
        updatedAt: serverTimestamp(),
      });
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, ownerNotes: noteText } : r));
      setEditingNotes(null);
      setNoteText("");
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const addNotice = async () => {
if (!noticeForm.title) return;
  setSaving(true);
  try {
    const docRef = await addDoc(collection(firestore, "maintenance"), {
      buildingId,
      userId: "owner",
      userName: "Building Management",
      title: noticeForm.title,
      description: noticeForm.description,
      category: noticeForm.category,
      status: noticeForm.status,
      visibility: "public",
      isOwnerNotice: true,
      ownerNotes: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setRequests((prev) => [...prev, {
      id: docRef.id,
      ...noticeForm,
      buildingId,
      userId: "owner",
      userName: "Building Management",
      visibility: "public",
      isOwnerNotice: true,
      ownerNotes: "",
    }]);
    setNoticeForm({ title: "", description: "", category: "General", status: "in-progress" });
    setShowNoticeForm(false);
  } catch (err) {
    console.log("Error:", err);
  } finally {
    setSaving(false);
  }
};

  const deleteRequest = async (id: string) => {
    if (!confirm("Delete this request?")) return;
    try {
      await deleteDoc(doc(firestore, "maintenance", id));
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  const statusIcons: Record<string, string> = {
    pending: "🟡",
    "in-progress": "🔵",
    resolved: "✅",
  };

  const filtered = requests.filter((r) => {
    const matchSearch = r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.userName?.toLowerCase().includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const RequestCard = ({ r }: { r: any }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{r.title}</h3>
              {r.isOwnerNotice && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
              📢 Notice
              </span>
              )}
              </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.visibility === "public" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {r.visibility === "public" ? "🌍" : "🔒"}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{r.description}</p>
        </div>
        <button
          onClick={() => deleteRequest(r.id)}
          className="text-xs text-red-400 hover:text-red-600 shrink-0"
        >✕</button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
          {r.category}
        </span>
        <span className="text-xs text-gray-400">by {r.userName}</span>
      </div>

      {/* Status selector */}
      <div className="flex items-center gap-2">
        <select
          value={r.status}
          disabled={updatingId === r.id}
          onChange={(e) => updateStatus(r.id, e.target.value)}
          className="flex-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="pending">🟡 Pending</option>
          <option value="in-progress">🔵 In Progress</option>
          <option value="resolved">✅ Resolved</option>
        </select>
        {updatingId === r.id && (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Owner notes */}
      {editingNotes === r.id ? (
        <div className="space-y-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note for the resident..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => saveNotes(r.id)}
              className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition"
            >
              Save Note
            </button>
            <button
              onClick={() => setEditingNotes(null)}
              className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {r.ownerNotes && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2.5 mb-2">
              <p className="text-xs text-blue-600 dark:text-blue-300">{r.ownerNotes}</p>
            </div>
          )}
          <button
            onClick={() => { setEditingNotes(r.id); setNoteText(r.ownerNotes || ""); }}
            className="text-xs text-blue-500 hover:underline"
          >
            {r.ownerNotes ? "Edit note" : "+ Add note"}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Maintenance Requests</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{requests.length} total requests</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${view === "list" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}
            >
              List
            </button>
            <button
            onClick={() => setView("kanban")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${view === "kanban" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}
    >
          Kanban
          </button>
            </div>
          <button
          onClick={() => setShowNoticeForm(!showNoticeForm)}
          className="flex items-center gap-2 bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-600 transition shadow-md"
          >
          📢 Add Notice
        </button>
        </div>
      </div>


{/* Notice form */}
{showNoticeForm && (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-sm p-6 space-y-4">
    <h3 className="font-bold text-gray-900 dark:text-white">📢 Add Building Notice</h3>
    <p className="text-xs text-gray-500">This will be visible to all residents as a public notice.</p>
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 space-y-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Title</label>
        <input
          type="text"
          placeholder="e.g. Elevator maintenance scheduled"
          value={noticeForm.title}
          onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="col-span-2 space-y-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Description</label>
        <textarea
          placeholder="Describe the maintenance work..."
          value={noticeForm.description}
          onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Category</label>
        <select
          value={noticeForm.category}
          onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {["General", "Plumbing", "Electrical", "HVAC", "Structural", "Cleaning", "Security", "Other"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</label>
        <select
          value={noticeForm.status}
          onChange={(e) => setNoticeForm({ ...noticeForm, status: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="pending">🟡 Pending</option>
          <option value="in-progress">🔵 In Progress</option>
          <option value="resolved">✅ Resolved</option>
        </select>
      </div>
    </div>
    <div className="flex gap-3">
      <button
        onClick={addNotice}
        disabled={saving}
        className="bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-600 transition disabled:opacity-60"
      >
        {saving ? "Posting..." : "Post Notice"}
      </button>
      <button
        onClick={() => setShowNoticeForm(false)}
        className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
      >
        Cancel
      </button>
    </div>
  </div>
)}


      {/* Search and filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">All Status</option>
          <option value="pending">🟡 Pending</option>
          <option value="in-progress">🔵 In Progress</option>
          <option value="resolved">✅ Resolved</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">No requests found</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No maintenance requests yet.</p>
        </div>
      ) : view === "list" ? (
        <div className="space-y-3">
          {filtered.map((r) => <RequestCard key={r.id} r={r} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["pending", "in-progress", "resolved"].map((status) => (
            <div key={status} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span>{statusIcons[status]}</span>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 capitalize">
                  {status.replace("-", " ")}
                </h3>
                <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  {filtered.filter((r) => r.status === status).length}
                </span>
              </div>
              {filtered.filter((r) => r.status === status).map((r) => (
                <RequestCard key={r.id} r={r} />
              ))}
              {filtered.filter((r) => r.status === status).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No requests</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Alerts Section ────────────────────────────────────────
function AlertsSection({ buildingId, userId, userName }: { buildingId: string, userId: string, userName: string }) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "info",
  });

  const alertTypes = [
    { value: "emergency", label: "🚨 Emergency", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    { value: "warning", label: "⚠️ Warning", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    { value: "info", label: "ℹ️ Info", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    { value: "maintenance", label: "🔧 Maintenance", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  ];

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const snap = await getDocs(
        query(collection(firestore, "alerts"), where("buildingId", "==", buildingId))
      );
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds);
      setAlerts(list);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendAlert = async () => {
if (!form.title) return;
    setSaving(true);
    try {
      const docRef = await addDoc(collection(firestore, "alerts"), {
        buildingId,
        userId,
        userName,
        title: form.title,
        message: form.message,
        type: form.type,
        createdAt: serverTimestamp(),
      });
      setAlerts((prev) => [{
        id: docRef.id,
        buildingId,
        userId,
        userName,
        ...form,
        createdAt: { seconds: Date.now() / 1000 },
      }, ...prev]);
      setForm({ title: "", message: "", type: "info" });
      setShowForm(false);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteAlert = async (id: string) => {
    if (!confirm("Delete this alert?")) return;
    try {
      await deleteDoc(doc(firestore, "alerts", id));
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const getTypeColor = (type: string) => {
    return alertTypes.find((t) => t.value === type)?.color || alertTypes[2].color;
  };

  const getTypeLabel = (type: string) => {
    return alertTypes.find((t) => t.value === type)?.label || "ℹ️ Info";
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alerts</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{alerts.length} total alerts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-red-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-red-600 transition shadow-md"
        >
          🔔 Send Alert
        </button>
      </div>

      {/* Send alert form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-800 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">📢 Send Alert to All Residents</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Alert Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {alertTypes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setForm({ ...form, type: t.value })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition ${
                      form.type === t.value
                        ? "border-blue-500 " + t.color
                        : "border-gray-200 dark:border-gray-700 text-gray-500"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Title</label>
              <input
                type="text"
                placeholder="e.g. Water cut scheduled"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Message</label>
              <textarea
                placeholder="Write your alert message..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={sendAlert}
              disabled={saving}
              className="bg-red-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-red-600 transition disabled:opacity-60"
            >
              {saving ? "Sending..." : "🔔 Send Alert"}
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

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">No alerts yet</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Click "Send Alert" to notify all residents.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getTypeColor(alert.type)}`}>
                      {getTypeLabel(alert.type)}
                    </span>
                    <h3 className="font-bold text-gray-900 dark:text-white">{alert.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>by {alert.userName}</span>
                    <span>•</span>
                    <span>{alert.createdAt?.toDate?.()?.toLocaleDateString() || "Just now"}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="text-xs text-red-400 hover:text-red-600 shrink-0 transition"
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}