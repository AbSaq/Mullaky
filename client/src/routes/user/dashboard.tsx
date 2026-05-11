import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Building2,
  Bell,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Home,
} from "lucide-react";
import { auth, firestore } from "../../firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/user/dashboard")({
  component: UserDashboard,
});

function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [building, setBuilding] = useState<any>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const navigate = useNavigate();
const { user, userData, loading } = useAuth();

  // Get selected building from sessionStorage
  const selectedMembership = JSON.parse(sessionStorage.getItem("selectedBuilding") || "{}");

const fetchData = async () => {
    try {
      // Check if user actually has this membership
      if (selectedMembership?.buildingId) {
        const memSnap = await getDocs(
          query(
            collection(firestore, "memberships"),
            where("userId", "==", user?.uid),
            where("buildingId", "==", selectedMembership.buildingId)
          )
        );
        // If no membership found clear session
        if (memSnap.empty) {
          sessionStorage.removeItem("selectedBuilding");
          setBuilding(null);
        } else {
          // Get building info
          const buildingSnap = await getDoc(doc(firestore, "buildings", selectedMembership.buildingId));
          if (buildingSnap.exists()) setBuilding({ id: buildingSnap.id, ...buildingSnap.data() });
        }
      }

      // Get pending invitations for this user
      if (user) {
        const invSnap = await getDocs(
          query(
            collection(firestore, "invitations"),
            where("toUserId", "==", user.uid),
            where("status", "==", "pending")
          )
        );
        setInvitations(invSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    } catch (err) {
      console.log("Error:", err);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) navigate({ to: "/login" });
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut(auth);
    navigate({ to: "/login" });
  };

  const acceptInvitation = async (inv: any) => {
    try {
      // Update invitation status
      await updateDoc(doc(firestore, "invitations", inv.id), {
        status: "accepted",
      });

      // Create membership
      await addDoc(collection(firestore, "memberships"), {
        userId: user.uid,
        buildingId: inv.buildingId,
        buildingName: inv.buildingName,
        buildingAddress: "",
        role: "user",
        createdAt: serverTimestamp(),
      });

      // Remove from local state
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));

      // Redirect to select building
      navigate({ to: "/select-building" });
    } catch (err) {
      console.log("Error accepting:", err);
    }
  };

  const declineInvitation = async (inv: any) => {
    try {
      await updateDoc(doc(firestore, "invitations", inv.id), {
        status: "declined",
      });
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
    } catch (err) {
      console.log("Error declining:", err);
    }
  };

const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "invitations", label: "Invitations", icon: Mail, badge: invitations.length },
    // Only show these if user has a building
    ...(selectedMembership?.buildingId ? [
      { id: "finances", label: "Finances", icon: DollarSign, badge: 0 },
      { id: "alerts", label: "Alerts", icon: Bell, badge: 0 },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex font-sans">

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? `w-64` : `w-20`} transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col`}>
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
            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {userData?.fullName?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{userData?.fullName}</p>
<div className="flex items-center gap-1">
  <Home className="w-3 h-3 text-emerald-500" />
  <p className="text-xs text-emerald-600 dark:text-emerald-400">
    {selectedMembership?.role === "owner" ? "Owner" : "Resident"}
  </p>
</div>
            </div>
          </div>
        )}

        {sidebarOpen && building && (
          <div className="mx-4 mt-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Your Building</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{building.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{building.address}</p>
          </div>
        )}

{sidebarOpen && building && (
  <button
    onClick={() => navigate({ to: "/select-building" })}
    className="mx-4 mt-2 text-xs text-emerald-600 hover:underline text-left px-1"
  >
    ← Switch Building
  </button>
)}

        <nav className="flex-1 p-4 space-y-1 mt-2">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
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
              {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">{label}</span>}
              {sidebarOpen && badge ? (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {badge}
                </span>
              ) : null}
              {sidebarOpen && activeTab === id && !badge && <ChevronRight className="w-4 h-4 ml-auto" />}
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
              {building ? building.name : "No building selected"}
            </p>
          </div>
          <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <Bell className="w-5 h-5 text-gray-500" />
            {invitations.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>

        <div className="p-8">

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Welcome card */}
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-extrabold">
                  Welcome, {userData?.fullName?.split(" ")[0]}! 👋
                </h2>
                <p className="text-emerald-100 mt-2">
                  {building ? `You are a resident of ${building.name}` : `You have not joined a building yet.`}
                </p>
              </div>

              {/* Building info */}
              {building ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Your Building</h2>
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
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">No building yet</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Check your invitations tab for pending invitations from building owners.
                  </p>
                  <button
                    onClick={() => setActiveTab("invitations")}
                    className="bg-emerald-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition"
                  >
                    View Invitations
                  </button>
                </div>
              )}
            </div>
          )}


          {/* Latest finance summary */}
          {building && (
          <UserLatestFinanceSummary buildingId={selectedMembership?.buildingId || ""} />
          )}


          {/* ── Invitations ── */}
          {activeTab === "invitations" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invitations</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{invitations.length} pending invitations</p>
              </div>

              {invitations.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">No invitations</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    You don't have any pending invitations right now.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex items-center gap-5">
                      <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center shrink-0">
                        <Building2 className="w-7 h-7 text-emerald-500" />
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
                          className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition"
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
          )}
{activeTab === "finances" && (
  <UserFinancesSection buildingId={selectedMembership?.buildingId || ""} />
)}
          {/* ── Coming soon ── */}
{activeTab !== "overview" && activeTab !== "invitations" && activeTab !== "finances" && (
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

// ── User Finances Section ─────────────────────────────────
function UserFinancesSection({ buildingId }: { buildingId: string }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Finances</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{reports.length} reports</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">No reports yet</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Your building owner hasn't added any financial reports yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{report.month}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Total Collected: <span className="font-semibold text-emerald-500">SAR {report.totalCollected?.toLocaleString()}</span>
                </p>
              </div>

              {report.expenses?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </div>
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

// ── User Latest Finance Summary ───────────────────────────
function UserLatestFinanceSummary({ buildingId }: { buildingId: string }) {
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
        setLatest(docs[docs.length - 1]);
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
              <span className="text-sm font-semibold text-gray-900 dark:text-white w-20 text-right">
                SAR {exp.amount?.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}