import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Wrench,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
} from "lucide-react";
import {
  buildingMaintenanceQueryOptions,
  useMaintenanceOperations,
} from "../queries/maintenanceQueries";

interface Props {
  buildingId: string;
  userRole: string;
}

export function MaintenanceSection({ buildingId, userRole }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Plumbing",
  });

  const { data: tickets = [], isLoading } = useQuery(
    buildingMaintenanceQueryOptions(buildingId),
  );
  const { createTicket, transitionTask, isCreating } =
    useMaintenanceOperations(buildingId);

  const columns = [
    {
      id: "pending",
      label: "Reported Issues",
      icon: Clock,
      color: "text-orange-500 bg-orange-50 dark:bg-orange-950/20",
    },
    {
      id: "in-progress",
      label: "In Progress",
      icon: Play,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
    },
    {
      id: "resolved",
      label: "Resolved Work",
      icon: CheckCircle2,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
    },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTicket(form);
    setForm({ title: "", description: "", category: "Plumbing" });
    setShowModal(false);
  };

  if (isLoading)
    return (
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
    );

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-hidden">
      <div className="flex justify-between items-center shrink-0">
        <p className="text-sm text-gray-400 font-medium">
          Use rapid step-action controls to move tasks seamlessly between kanban
          lanes.
        </p>

        {(userRole === "user" ||
          userRole === "owner" ||
          userRole === "admin") && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-600 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> File Issue Request
          </button>
        )}
      </div>

      {/* Kanban Columns Grid Board Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden h-full">
        {columns.map((col) => {
          const colTickets = tickets.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className="bg-gray-100/60 dark:bg-gray-900/40 rounded-2xl p-4 flex flex-col h-full border border-gray-100 dark:border-gray-800/40"
            >
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${col.color}`}>
                    <col.icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                    {col.label}
                  </h3>
                </div>
                <span className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-500 font-bold px-2 py-0.5 rounded-full">
                  {colTickets.length}
                </span>
              </div>

              <div className="flex-1 overflow-auto space-y-3 pr-1">
                {colTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 rounded-xl p-4 shadow-sm space-y-3 hover:shadow-md transition"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">
                        {ticket.category}
                      </span>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1.5 leading-tight">
                        {ticket.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-50 dark:border-gray-800 text-[11px] text-gray-400">
                      <span className="truncate max-w-[120px]">
                        By: {ticket.userName}
                      </span>

                      {/* Action trigger steps restricted to building owners / administrators */}
                      {(userRole === "owner" || userRole === "admin") &&
                        ticket.status !== "resolved" && (
                          <button
                            onClick={() =>
                              transitionTask({
                                requestId: ticket.id,
                                status:
                                  ticket.status === "pending"
                                    ? "in-progress"
                                    : "resolved",
                              })
                            }
                            className="flex items-center gap-1 text-blue-500 hover:underline font-semibold cursor-pointer"
                          >
                            Advancing <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report ticket intake modal overlay configuration */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-gray-900 max-w-md w-full rounded-2xl border border-gray-100 p-6 space-y-4 shadow-2xl"
          >
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-500" /> Lodge Issue Form
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                required
                placeholder="Issue Header (e.g. Broken elevator motor)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <textarea
                required
                rows={3}
                placeholder="Provide descriptive context regarding tracking issue parameters..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="HVAC / Cooling">HVAC / Cooling</option>
                <option value="Structural / Masonry">
                  Structural / Masonry
                </option>
                <option value="Janitorial">Janitorial</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition cursor-pointer"
              >
                {isCreating ? "Filing..." : "File Request"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
