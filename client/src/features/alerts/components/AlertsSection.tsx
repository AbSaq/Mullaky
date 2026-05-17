import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Megaphone,
  AlertTriangle,
  Info,
  Wrench,
  ShieldAlert,
} from "lucide-react";
import {
  buildingAlertsQueryOptions,
  useAlertOperations,
} from "../queries/alertQueries";

interface Props {
  buildingId: string;
  userRole: string;
}

export function AlertsSection({ buildingId, userRole }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "info" });

  const { data: alerts = [], isLoading } = useQuery(
    buildingAlertsQueryOptions(buildingId),
  );
  const { mutate: broadcastAlert, isPending } = useAlertOperations(buildingId);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    broadcastAlert(form);
    setForm({ title: "", content: "", type: "info" });
    setShowForm(false);
  };

  const styleMap: Record<
    string,
    { bg: string; text: string; border: string; icon: any }
  > = {
    emergency: {
      bg: "bg-red-50 dark:bg-red-950/20",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-100 dark:border-red-900/40",
      icon: ShieldAlert,
    },
    warning: {
      bg: "bg-orange-50 dark:bg-orange-950/20",
      text: "text-orange-700 dark:text-orange-400",
      border: "border-orange-100 dark:border-orange-900/40",
      icon: AlertTriangle,
    },
    maintenance: {
      bg: "bg-purple-50 dark:bg-purple-950/20",
      text: "text-purple-700 dark:text-purple-400",
      border: "border-purple-100 dark:border-purple-900/40",
      icon: Wrench,
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/20",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-100 dark:border-blue-900/40",
      icon: Info,
    },
  };

  if (isLoading)
    return (
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
    );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* AUTHORITY BROADCAST FORM TOGGLE BUTTON */}
      {(userRole === "owner" || userRole === "admin") && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 transition text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />{" "}
            {showForm ? "Hide Console" : "New Broadcast Announcement"}
          </button>
        </div>
      )}

      {/* DISPATCH CONTROL PANEL */}
      {showForm && (
        <form
          onSubmit={handleBroadcast}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4 animate-fadeIn"
        >
          <h3 className="font-bold text-sm text-gray-800 dark:text-white uppercase tracking-wider">
            Configure Broadcast Vector
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              required
              placeholder="Announcement Title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="md:col-span-3 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 capitalize"
            >
              <option value="info">Info Notice</option>
              <option value="maintenance">Maintenance</option>
              <option value="warning">Warning</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <textarea
            required
            rows={3}
            placeholder="Compose communication notice payload description here..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-blue-500 text-white font-semibold text-sm rounded-xl cursor-pointer hover:bg-blue-600 transition"
            >
              {isPending ? "Emitting..." : "Broadcast Notice"}
            </button>
          </div>
        </form>
      )}

      {/* RENDER BULLETINS CHRONOLOGICALLY */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/60">
            No community notices dispatched to this node yet.
          </p>
        ) : (
          alerts.map((alert) => {
            const style = styleMap[alert.type] || styleMap.info;
            return (
              <div
                key={alert.id}
                className={`${style.bg} ${style.border} border rounded-2xl p-5 shadow-sm flex items-start gap-4 transition hover:shadow-md`}
              >
                <div
                  className={`p-2 rounded-xl bg-white dark:bg-gray-900 shadow-sm shrink-0 ${style.text}`}
                >
                  <style.icon className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight truncate capitalize">
                      {alert.title}
                    </h4>
                    <span
                      className={`text-[10px] uppercase font-black tracking-wider ${style.text}`}
                    >
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed break-words">
                    {alert.content}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium pt-1">
                    Dispatched by {alert.userName}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
