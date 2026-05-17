import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import {
  buildingResidentsQueryOptions,
  useResidentOperations,
} from "../queries/residentQueries";

interface Props {
  buildingId: string;
}

export function ResidentsSection({ buildingId }: Props) {
  const [search, setSearch] = useState("");
  const { data: residents = [], isLoading } = useQuery(
    buildingResidentsQueryOptions(buildingId),
  );
  const { removeResident } = useResidentOperations(buildingId);

  const filtered = residents.filter(
    (r) =>
      r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search building occupants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Resident
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email Address
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Permission Role
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  No active residents recorded here.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
                >
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {r.fullName}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {r.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 capitalize">
                      {r.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.role !== "owner" && (
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              "Revoke workspace access for this resident?",
                            )
                          ) {
                            await removeResident(r.id);
                          }
                        }}
                        className="text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900 px-3 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        Remove occupant
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
