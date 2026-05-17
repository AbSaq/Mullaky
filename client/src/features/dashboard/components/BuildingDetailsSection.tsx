import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, Wrench, Bell } from "lucide-react";
import {
  buildingDetailsQueryOptions,
  useBuildingCrud,
} from "../queries/buildingCrudQueries";

interface Props {
  buildingsData: any[];
}

export function BuildingDetailsSection({ buildingsData }: Props) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    floors: "",
    units: "",
  });

  const { data: details, isLoading: loadingDetails } = useQuery(
    buildingDetailsQueryOptions(selectedId || ""),
  );
  const { createBuilding, updateBuilding, deleteBuilding, isPending } =
    useBuildingCrud();

  const selectedBuilding = buildingsData.find((b) => b.id === selectedId);
  const filtered = buildingsData.filter(
    (b) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.address?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    await createBuilding(form);
    setForm({ name: "", address: "", floors: "", units: "" });
    setShowAddForm(false);
  };

  const handleUpdate = async () => {
    if (selectedId) {
      await updateBuilding({ id: selectedId, body: form });
      setShowEditForm(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)] overflow-hidden">
      {/* LEFT COLUMN: SELECTION LIST PANELS */}
      <div className="w-80 shrink-0 flex flex-col gap-3 h-full">
        <button
          onClick={() => {
            setForm({ name: "", address: "", floors: "", units: "" });
            setShowAddForm(true);
            setSelectedId(null);
          }}
          className="w-full bg-emerald-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-600 transition cursor-pointer shadow-sm"
        >
          + Add Building Workspace
        </button>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search infrastructure..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex-1 overflow-auto space-y-2 pr-1">
          {filtered.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedId(b.id);
                setForm({
                  name: b.name,
                  address: b.address,
                  floors: b.floors,
                  units: b.units,
                });
                setShowAddForm(false);
                setShowEditForm(false);
              }}
              className={`w-full text-left bg-white dark:bg-gray-900 rounded-2xl border p-4 transition duration-150 cursor-pointer ${selectedId === b.id ? "border-emerald-500 shadow-sm" : "border-gray-100 dark:border-gray-800 hover:shadow-sm"}`}
            >
              <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                {b.name}
              </h3>
              <p className="text-xs text-gray-400 truncate mt-1">{b.address}</p>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: INSPECTOR FRAME */}
      <div className="flex-1 overflow-auto h-full space-y-6 pr-2">
        {showAddForm && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white">
              New Infrastructure Node
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Building Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="text"
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="number"
                placeholder="Floors"
                value={form.floors}
                onChange={(e) => setForm({ ...form, floors: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="number"
                placeholder="Units"
                value={form.units}
                onChange={(e) => setForm({ ...form, units: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={isPending}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 cursor-pointer transition"
              >
                Save Entry
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 cursor-pointer transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectedBuilding && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {selectedBuilding.name}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {selectedBuilding.address}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEditForm(!showEditForm)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Delete structural node permanently?")) {
                        await deleteBuilding(selectedBuilding.id);
                        setSelectedId(null);
                      }
                    }}
                    className="px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-100 cursor-pointer transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {showEditForm && (
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-50 pt-4">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                  />
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                  />
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {loadingDetails ? (
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              details && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-500">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {details.residents.length}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
                        Active Residents
                      </p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-500">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {details.maintenance.length}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
                        Job Requests
                      </p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-500">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {details.alerts.length}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
                        Logged Alerts
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
