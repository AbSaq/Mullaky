import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, ChevronRight, Crown, Users, LogOut, Mail, CheckCircle2, XCircle, Clock } from "lucide-react";
import { auth, firestore } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs, query, where, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/select-building")({
  component: SelectBuildingPage,
});

function SelectBuildingPage() {
  const { user, userData, memberships, role, loading } = useAuth();
  const [invitations, setInvitations] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) navigate({ to: "/login" });
      if (role === "admin") navigate({ to: "/admin/dashboard" });
    }
  }, [user, role, loading]);

  useEffect(() => {
    if (user) fetchInvitations();
  }, [user]);

  const fetchInvitations = async () => {
    try {
      const snap = await getDocs(
        query(
          collection(firestore, "invitations"),
          where("toUserId", "==", user.uid),
          where("status", "==", "pending")
        )
      );
      setInvitations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const acceptInvitation = async (inv: any) => {
    try {
      await updateDoc(doc(firestore, "invitations", inv.id), { status: "accepted" });
      await addDoc(collection(firestore, "memberships"), {
        userId: user.uid,
        buildingId: inv.buildingId,
        buildingName: inv.buildingName,
        buildingAddress: "",
        role: "user",
        createdAt: serverTimestamp(),
      });
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
      window.location.reload();
    } catch (err) {
      console.log("Error accepting:", err);
    }
  };

  const declineInvitation = async (inv: any) => {
    try {
      await updateDoc(doc(firestore, "invitations", inv.id), { status: "declined" });
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
    } catch (err) {
      console.log("Error declining:", err);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate({ to: "/login" });
  };

  const enterBuilding = (membership: any) => {
    sessionStorage.setItem("selectedBuilding", JSON.stringify(membership));
    if (membership.role === "owner") {
      navigate({ to: "/owner/dashboard" });
    } else {
      navigate({ to: "/user/dashboard" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/40 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">Mulaky</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{userData?.fullName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{userData?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-8">

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Welcome back, {userData?.fullName?.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Select a building to continue
            </p>
          </div>

          {/* No buildings and no invitations */}
          {memberships.length === 0 && invitations.length === 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
<h2 className="text-lg font-bold text-gray-900 dark:text-white">No buildings yet</h2>
<p className="text-gray-500 dark:text-gray-400 text-sm">
  You haven't joined any building yet. Wait for an invitation from your building owner.
</p>
<button
  onClick={() => navigate({ to: "/user/dashboard" })}
  className="bg-emerald-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition"
>
  Go to Dashboard
</button>
            </div>
          )}

          {/* Buildings list */}
          {memberships.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-bold text-gray-900 dark:text-white">Your Buildings</h2>
              {memberships.map((membership) => (
                <button
                  key={membership.id}
                  onClick={() => enterBuilding(membership)}
                  className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex items-center gap-5 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200 text-left group"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    membership.role === "owner"
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "bg-emerald-100 dark:bg-emerald-900/30"
                  }`}>
                    {membership.role === "owner" ? (
                      <Crown className="w-7 h-7 text-blue-500" />
                    ) : (
                      <Users className="w-7 h-7 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {membership.buildingName}
                      </h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        membership.role === "owner"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      }`}>
                        {membership.role === "owner" ? "👑 Owner" : "👤 Resident"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {membership.buildingAddress}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Pending invitations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-500" />
              <h2 className="font-bold text-gray-900 dark:text-white">Pending Invitations</h2>
              {invitations.length > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {invitations.length}
                </span>
              )}
            </div>

            {invitations.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 text-center space-y-2">
                <Mail className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm text-gray-400">No pending invitations</p>
              </div>
            ) : (
              invitations.map((inv) => (
                <div key={inv.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-orange-200 dark:border-orange-800 shadow-sm p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{inv.buildingName}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {inv.createdAt?.toDate?.()?.toLocaleDateString() || "Just now"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptInvitation(inv)}
                      className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-emerald-600 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept
                    </button>
                    <button
                      onClick={() => declineInvitation(inv)}
                      className="flex items-center gap-1.5 border border-red-200 text-red-500 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-50 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}