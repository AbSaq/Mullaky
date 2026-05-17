import {
  Building2,
  ChevronRight,
  Crown,
  Users,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import type { BuildingSelectionResponse } from "../queries/buildingQueries";

interface SelectBuildingCardProps {
  data: BuildingSelectionResponse;
  onSelect: (membership: any) => void;
  onAction: (invitationId: string, action: "accept" | "decline") => void;
  isActionPending: boolean;
}

export function SelectBuildingCard({
  data,
  onSelect,
  onAction,
  isActionPending,
}: SelectBuildingCardProps) {
  const { memberships, invitations } = data;

  return (
    <div className="w-full max-w-2xl space-y-8">
      {memberships.length === 0 && invitations.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            No buildings yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            You haven't joined any workspace buildings yet. Please wait for an
            assignment from your manager.
          </p>
        </div>
      )}

      {memberships.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm tracking-wide uppercase">
            Your Buildings
          </h2>
          {memberships.map((membership) => (
            <button
              key={membership.id}
              onClick={() => onSelect(membership)}
              className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex items-center gap-5 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200 text-left group cursor-pointer"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  membership.role === "owner"
                    ? "bg-blue-100 dark:bg-blue-900/20"
                    : "bg-emerald-100 dark:bg-emerald-900/20"
                }`}
              >
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
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      membership.role === "owner"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30"
                    }`}
                  >
                    {membership.role === "owner" ? "👑 Owner" : "👤 Resident"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {membership.buildingAddress}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-orange-500" />
          <h2 className="font-bold text-gray-900 dark:text-white text-sm tracking-wide uppercase">
            Pending Invitations
          </h2>
          {invitations.length > 0 && (
            <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
              {invitations.length}
            </span>
          )}
        </div>

        {invitations.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center text-sm text-gray-400">
            No pending building access invitations
          </div>
        ) : (
          invitations.map((inv) => (
            <div
              key={inv.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-orange-100 dark:border-orange-900/40 p-5 flex items-center gap-4 shadow-sm"
            >
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {inv.buildingName}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Incoming Invitation</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={isActionPending}
                  onClick={() => onAction(inv.id, "accept")}
                  className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                </button>
                <button
                  disabled={isActionPending}
                  onClick={() => onAction(inv.id, "decline")}
                  className="flex items-center gap-1.5 border border-red-200 text-red-500 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-50 disabled:opacity-50 transition cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" /> Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
