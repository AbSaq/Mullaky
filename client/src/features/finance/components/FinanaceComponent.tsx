import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, X } from "lucide-react";
import {
  buildingFinancesQueryOptions,
  useFinanceOperations,
} from "../queries/financeQueries";

interface Props {
  buildingId: string;
  userRole: string;
}

export function FinancesSection({ buildingId, userRole }: Readonly<Props>) {
  const isOwner = userRole === "owner" || userRole === "admin";

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ month: "", revenue: "", notes: "" });
  const [expenses, setExpenses] = useState([{ name: "", amount: "" }]);

  const { data, isLoading } = useQuery(buildingFinancesQueryOptions(buildingId));
  const { saveReport, isSaving, deleteReport } = useFinanceOperations(buildingId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveReport({
      month: form.month,
      totalCollected: Number(form.revenue),
      expenses: expenses
        .filter((ex) => ex.name && ex.amount)
        .map((ex) => ({ name: ex.name, amount: Number(ex.amount) })),
      notes: form.notes,
    });
    setForm({ month: "", revenue: "", notes: "" });
    setExpenses([{ name: "", amount: "" }]);
    setShowForm(false);
  };

  const addExpenseRow = () => setExpenses([...expenses, { name: "", amount: "" }]);
  const removeExpenseRow = (i: number) => setExpenses(expenses.filter((_, idx) => idx !== i));

  if (isLoading || !data)
    return (
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mt-12" />
    );

  const totalRevenue = data.ownerReports?.reduce((s, r) => s + (r.totalCollected || 0), 0) || 0;
  const totalExpenses = data.ownerReports?.reduce(
    (s, r) => s + r.expenses.reduce((es, e) => es + e.amount, 0), 0,
  ) || 0;

  // Build chart data from owner reports
  const chartData = [...(data.ownerReports || [])]
    .sort((a: any, b: any) => a.month.localeCompare(b.month))
    .map((r) => ({
      month: r.month,
      Revenue: r.totalCollected || 0,
      Expenses: r.expenses.reduce((s, e) => s + e.amount, 0),
    }));

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">SAR {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Expenses</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">SAR {totalExpenses.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Balance</p>
            <p className={`text-2xl font-black mt-1 ${totalRevenue - totalExpenses >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              SAR {(totalRevenue - totalExpenses).toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── BAR CHART ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white">Monthly Overview</h3>
          {isOwner && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Monthly Report
            </button>
          )}
        </div>

        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No reports yet. {isOwner ? "Add a monthly report to see the chart." : ""}
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: "11px", fill: "#9CA3AF" }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: "11px", fill: "#9CA3AF" }} />
                <Tooltip formatter={(v: any) => [`SAR ${Number(v).toLocaleString()}`]} />
                <Legend iconType="circle" />
                <Bar name="Revenue" dataKey="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar name="Expenses" dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── ADD REPORT FORM (OWNER ONLY) ── */}
      {showForm && isOwner && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Add Monthly Report</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Month</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. May 2026"
                  value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Monthly Revenue (SAR)</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={form.revenue}
                  onChange={(e) => setForm({ ...form, revenue: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500">Expenses</label>
                <button
                  type="button"
                  onClick={addExpenseRow}
                  className="text-xs text-blue-500 hover:underline cursor-pointer font-semibold"
                >
                  + Add row
                </button>
              </div>
              <div className="space-y-2">
                {expenses.map((ex, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="e.g. Cleaning"
                      value={ex.name}
                      onChange={(e) => {
                        const u = [...expenses];
                        u[i].name = e.target.value;
                        setExpenses(u);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="number"
                      placeholder="SAR"
                      value={ex.amount}
                      onChange={(e) => {
                        const u = [...expenses];
                        u[i].amount = e.target.value;
                        setExpenses(u);
                      }}
                      className="w-24 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {expenses.length > 1 && (
                      <button type="button" onClick={() => removeExpenseRow(i)} className="text-gray-300 hover:text-red-500 cursor-pointer transition">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none resize-none"
            />

            <div className="flex gap-2 justify-end pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition cursor-pointer disabled:opacity-60">
                {isSaving ? "Saving..." : "Save Report"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── REPORTS LIST ── */}
      {data.ownerReports?.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Monthly Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.ownerReports.map((report) => {
              const reportExpenses = report.expenses.reduce((s, e) => s + e.amount, 0);
              const net = (report.totalCollected || 0) - reportExpenses;
              return (
                <div key={report.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm relative group">
                  {isOwner && (
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 dark:text-white">{report.month}</h4>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${net >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                      {net >= 0 ? "+" : ""}SAR {net.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Revenue</p>
                      <p className="font-bold text-emerald-500">SAR {(report.totalCollected || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Expenses</p>
                      <p className="font-bold text-red-500">SAR {reportExpenses.toLocaleString()}</p>
                    </div>
                  </div>
                  {report.expenses.length > 0 && (
                    <div className="border-t border-gray-50 dark:border-gray-800 pt-3 space-y-1.5">
                      {report.expenses.map((ex, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-500">
                          <span>{ex.name}</span>
                          <span className="font-semibold">SAR {ex.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
