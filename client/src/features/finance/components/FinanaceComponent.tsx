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
} from "recharts";
import { DollarSign, Receipt, CreditCard } from "lucide-react";
import {
  buildingFinancesQueryOptions,
  useFinanceOperations,
} from "../queries/financeQueries.ts";

interface Props {
  buildingId: string;
  userRole: string;
}

export function FinancesSection({ buildingId, userRole }: Props) {
  const [payAmount, setPayAmount] = useState("");
  const { data, isLoading } = useQuery(
    buildingFinancesQueryOptions(buildingId),
  );
  const { mutate: payRent, isPending } = useFinanceOperations(buildingId);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount) return;
    payRent({ amount: Number(payAmount), month: "May" });
    setPayAmount("");
  };

  if (isLoading || !data)
    return (
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
    );

  return (
    <div className="space-y-6">
      {/* GRAPH CARD LAYER */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 p-6 rounded-2xl shadow-sm">
        <h3 className="font-bold text-sm tracking-wide text-gray-400 uppercase mb-4">
          Infrastructure Financial Overview
        </h3>
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
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fillOpacity={0.1}
                fill="#3B82F6"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#EF4444"
                fillOpacity={0.05}
                fill="#EF4444"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PAYMENT SUBMISSION OUTPOST FOR TENANTS */}
        {userRole === "user" && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4">
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
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 transition text-white font-semibold rounded-xl text-sm cursor-pointer"
              >
                {isPending ? "Processing..." : "Authorize Remittance"}
              </button>
            </form>
          </div>
        )}

        {/* LEDGER INVOICE LOG PANEL */}
        <div
          className={`${userRole === "user" ? "md:col-span-2" : "md:col-span-3"} bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden`}
        >
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-gray-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
              Statement Transactions Log
            </h3>
          </div>
          <div className="max-h-60 overflow-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                {data.invoices.length === 0 ? (
                  <tr>
                    <td className="p-6 text-center text-gray-400">
                      No invoices generated for this building.
                    </td>
                  </tr>
                ) : (
                  data.invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition"
                    >
                      <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                        {inv.userName}
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {inv.month} Rent
                      </td>
                      <td className="px-6 py-3 font-bold text-emerald-500">
                        SAR {inv.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20">
                          Cleared
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
