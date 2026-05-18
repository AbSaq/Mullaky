import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from "recharts";
import {
  DollarSign,
  Receipt,
  CreditCard,
  Plus,
  Trash2,
  BarChart2,
  TrendingUp,
} from "lucide-react";
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
  const [payAmount, setPayAmount] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    month: "May 2026",
    totalCollected: "",
    notes: "",
  });

  const [expenses, setExpenses] = useState([
    { name: "Maintenance", amount: "" },
    { name: "Security", amount: "" },
    { name: "Cleaning", amount: "" },
    { name: "Utilities", amount: "" },
  ]);

  const { data, isLoading } = useQuery(
    buildingFinancesQueryOptions(buildingId),
  );
  const { payRent, isPaying, saveReport, deleteReport } =
    useFinanceOperations(buildingId);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount) return;
    await payRent({ amount: Number(payAmount), month: "May" });
    setPayAmount("");
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveReport({
      month: form.month,
      totalCollected: Number(form.totalCollected),
      expenses: expenses
        .filter((exp) => exp.name && exp.amount)
        .map((exp) => ({
          name: exp.name,
          amount: Number(exp.amount),
        })),
      notes: form.notes,
    });
    setForm({ month: "June 2026", totalCollected: "", notes: "" });
    setShowForm(false);
  };

  if (isLoading || !data)
    return (
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mt-12" />
    );

  const globalTotalRevenue =
    data.invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
  const globalTotalExpenses =
    data.ownerReports?.reduce(
      (sum, rep) => sum + rep.expenses.reduce((s, e) => s + e.amount, 0),
      0,
    ) || 0;
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ── TOP METRICS CARDS PANEL ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Rental Revenue
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              SAR {globalTotalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Aggregated Outflows
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              SAR {globalTotalExpenses.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Net Operating Balance
            </p>
            <p className="text-2xl font-black text-emerald-500">
              SAR {(globalTotalRevenue - globalTotalExpenses).toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── GRAPH CARD LAYER ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm tracking-wide text-gray-400 uppercase">
            Cash Flow Run-Rate Canvas
          </h3>
          {isOwner && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-600 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Append Month Report
            </button>
          )}
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                style={{ fontSize: "12px", fill: "#9CA3AF" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                style={{ fontSize: "12px", fill: "#9CA3AF" }}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area
                name="Gross Inflow"
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fillOpacity={0.08}
                fill="#3B82F6"
                strokeWidth={2.5}
              />
              <Area
                name="Operational Costs"
                type="monotone"
                dataKey="expenses"
                stroke="#EF4444"
                fillOpacity={0.04}
                fill="#EF4444"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── EXPENSE LOG REPORT CONFIGURATION OVERLAY ── */}
      {showForm && (
        <form
          onSubmit={handleAddReport}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4 animate-fadeIn"
        >
          <h3 className="font-bold text-sm text-gray-800 dark:text-white uppercase tracking-wider">
            Log Asset Expense Statement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Reporting Period (e.g. May 2026)"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              required
              placeholder="Gross Non-Rent Inflows (SAR)"
              value={form.totalCollected}
              onChange={(e) =>
                setForm({ ...form, totalCollected: e.target.value })
              }
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">
              Operational Cost Subcomponents
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {expenses.map((exp, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={exp.name}
                    onChange={(e) => {
                      const u = [...expenses];
                      u[i].name = e.target.value;
                      setExpenses(u);
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                  <input
                    type="number"
                    placeholder="SAR"
                    value={exp.amount}
                    onChange={(e) => {
                      const u = [...expenses];
                      u[i].amount = e.target.value;
                      setExpenses(u);
                    }}
                    className="w-24 px-3 py-2 rounded-xl border text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
              ))}
            </div>
          </div>
          <textarea
            placeholder="Operational notes..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-blue-500 text-white rounded-xl"
            >
              Commit Entry
            </button>
          </div>
        </form>
      )}

      {/* ── HISTORICAL OWNER STATEMENT ANALYSIS LAYER ── */}
      {isOwner && data.ownerReports?.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase text-gray-400 tracking-wider">
            Historical Expense Audit Matrix
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.ownerReports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4 relative group"
              >
                <button
                  onClick={() => deleteReport(report.id)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-gray-900 dark:text-white text-base">
                    {report.month} Report
                  </h4>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40">
                    Audited
                  </span>
                </div>
                <div className="w-full h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={report.expenses}
                      margin={{ left: -20, right: 10 }}
                    >
                      <XAxis dataKey="name" style={{ fontSize: "10px" }} />
                      <YAxis style={{ fontSize: "10px" }} />
                      <Tooltip formatter={(v) => [`SAR ${v}`, "Cost"]} />
                      <Bar
                        dataKey="amount"
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                      >
                        {report.expenses.map((_, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LOWER OPERATIONAL GRIDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userRole === "user" && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" /> Remit Month Rent
            </h3>
            <form onSubmit={handlePayment} className="space-y-3">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  required
                  placeholder="Amount (SAR)"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                disabled={isPaying}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 transition text-white font-bold rounded-xl text-sm cursor-pointer shadow-sm"
              >
                {isPaying ? "Authorizing..." : "Remit Payment"}
              </button>
            </form>
          </div>
        )}

        <div
          className={`${userRole === "user" ? "md:col-span-2" : "md:col-span-3"} bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden`}
        >
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-gray-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
              Statement Transactions Ledger
            </h3>
          </div>
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/40 text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3">Payer IdentDoc</th>
                  <th className="px-6 py-3">Allocation</th>
                  <th className="px-6 py-3">Transferred Value</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                {data.invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-gray-400 font-medium"
                    >
                      No verified statement ledger invoices recorded on this
                      infrastructure workspace.
                    </td>
                  </tr>
                ) : (
                  data.invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition"
                    >
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {inv.userName}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {inv.month} Rent
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-500">
                        SAR {inv.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20">
                          Settled ✓
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
