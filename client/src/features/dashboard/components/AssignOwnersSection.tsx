import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Building2 } from "lucide-react";
import {
  adminUsersQueryOptions,
  useAssignOwner,
} from "../queries/adminQueries";

interface AssignOwnersProps {
  buildingsData: any[];
}

export function AssignOwnersSection({ buildingsData }: AssignOwnersProps) {
  const [search, setSearch] = useState("");
  const [ownerSearch, setOwnerSearch] = useState<Record<string, string>>({});

  const { data: users = [] } = useQuery(adminUsersQueryOptions());
  const { mutate: assignOwner, isPending } = useAssignOwner();

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
              (o.fullName
                ?.toLowerCase()
                .includes(currentSearch.toLowerCase()) ||
                o.email?.toLowerCase().includes(currentSearch.toLowerCase())),
          );

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
                <p className="text-xs font-medium text-gray-500">
                  Assign Owner
                </p>
                <input
                  type="text"
                  placeholder="Search owner matching criteria..."
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
                    {filteredOwners.map((o) => (
                      <button
                        key={o.id}
                        disabled={isPending}
                        onClick={() =>
                          assignOwner({ buildingId: b.id, ownerId: o.id })
                        }
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-left text-xs text-gray-700 dark:text-gray-300"
                      >
                        <span className="truncate">{o.fullName}</span>
                        <span className="text-emerald-500 font-medium shrink-0">
                          Assign
                        </span>
                      </button>
                    ))}
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
