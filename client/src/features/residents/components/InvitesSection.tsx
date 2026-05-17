import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import {
  sentInvitationsQueryOptions,
  useResidentOperations,
} from "../queries/residentQueries";

interface Props {
  buildingId: string;
}

export function InviteSection({ buildingId }: Props) {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");

  const { data: invitations = [], isLoading } = useQuery(
    sentInvitationsQueryOptions(buildingId),
  );
  const { sendInvitation, isInvitePending, inviteError } =
    useResidentOperations(buildingId);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    try {
      await sendInvitation(email);
      setSuccess(`Invitation dispatched to ${email} successfully.`);
      setEmail("");
    } catch {
      // Handled automatically via reference errors bound to useResidentOperations
    }
  };

  const statusColors: Record<string, string> = {
    pending:
      "bg-orange-50 text-orange-700 dark:bg-orange-900/10 dark:text-orange-400",
    accepted:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400",
    declined: "bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400",
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleInvite}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4"
      >
        <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
          Send Workspace Invitation
        </h3>

        {inviteError && (
          <div className="bg-red-50 text-red-600 border border-red-100 text-xs px-4 py-2.5 rounded-xl">
            {inviteError.response?.data?.message ||
              "Failed to dispatch invitation records."}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs px-4 py-2.5 rounded-xl">
            {success}
          </div>
        )}

        <div className="flex gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter potential resident account email..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={isInvitePending || !email}
            className="bg-blue-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer flex items-center gap-2 shrink-0"
          >
            {isInvitePending ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" /> Dispatch
              </>
            )}
          </button>
        </div>
      </form>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-sm tracking-wide text-gray-400 uppercase">
            Dispatched Trackers Log
          </h3>
        </div>
        {isLoading ? (
          <div className="p-6 text-center animate-pulse text-sm text-gray-400">
            Loading historical dispatch tracks...
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            No invitations emitted from this infrastructure node yet.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/40 text-xs text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-3">Account Destination</th>
                <th className="px-6 py-3">Transmission Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
              {invitations.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-4 font-medium">{inv.toUserEmail}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${statusColors[inv.status]}`}
                    >
                      {inv.status}
                    </span>
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
