import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Building2, X } from "lucide-react";
import {
  adminUsersQueryOptions,
  useAssignOwner,
  useRemoveOwner,
} from "../queries/adminQueries";

interface AssignOwnersProps {
  buildingsData: any[];
}

export function AssignOwnersSection({ buildingsData }: AssignOwnersProps) {
  const [search, setSearch] = useState("");
  const [ownerSearch, setOwnerSearch] = useState<Record<string, string>>({});

  const { data: users = [] } = useQuery(adminUsersQueryOptions());
  const { mutate: assignOwner, isPending: isAssigning } = useAssignOwner();
  const { mutate: removeOwner, isPending: isRemoving } = useRemoveOwner();

  const isPending = isAssigning || isRemoving;

  const filteredBuildings = buildingsData.filter(
    (b) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.address?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search buildings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredBuildings.map((b) => {
          const currentSearch = ownerSearch[b.id] || "";
          const filteredOwners = users.filter(
            (o) =>
              o.role === "owner" &&
              o.email?.toLowerCase().includes(currentSearch.toLowerCase()),
          );
          const currentOwner = users.find((u) => u.id === b.ownerId);

          return (
            <div
              key={b.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${b.ownerId ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-600"}`}
                >
                  {b.ownerId ? "Has Owner" : "No Owner"}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {b.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{b.address}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-gray-500 shrink-0">
                    {b.ownerId ? "Current Owner" : "Assign Owner"}
                  </p>
                  {b.ownerId && currentOwner && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md truncate">
                        {currentOwner.email || currentOwner.fullName}
                      </span>
                      <button
                        disabled={isPending}
                        onClick={() => removeOwner({ buildingId: b.id })}
                        title="Remove owner"
                        className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <input
                  type="email"
                  placeholder="Search by email..."
                  value={currentSearch}
                  onChange={(e) =>
                    setOwnerSearch((prev) => ({
                      ...prev,
                      [b.id]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />

                {currentSearch && (
                  <div className="max-h-32 overflow-y-auto border border-gray-100 dark:border-gray-800 rounded-xl p-1 bg-gray-50/50 dark:bg-gray-900/50">
                    {filteredOwners.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2">No owners found</p>
                    ) : (
                      filteredOwners.map((o) => (
                        <button
                          key={o.id}
                          disabled={isPending}
                          onClick={() => {
                            assignOwner({ buildingId: b.id, ownerId: o.id });
                            setOwnerSearch((prev) => ({ ...prev, [b.id]: "" }));
                          }}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-left text-xs text-gray-700 dark:text-gray-300"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">{o.email}</p>
                            <p className="truncate text-gray-400">{o.fullName}</p>
                          </div>
                          <span className="text-emerald-500 font-medium shrink-0 ml-2">
                            Assign
                          </span>
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
