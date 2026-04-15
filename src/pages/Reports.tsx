import { useMemo, useState } from "react";
import {
  IndianRupee,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

// ── Helpers ──────────────────────────────────────────────────

function formatCurrency(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function getMonthYear(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ── Component ────────────────────────────────────────────────

export default function Reports() {
  const { trips, vehicles } = useAppContext();

  const months = useMemo(() => {
    const set = new Set(trips.map((t) => getMonthYear(t.date)));
    return Array.from(set).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [trips]);

  const [selectedMonth, setSelectedMonth] = useState(months[0] ?? "");

  const filtered = trips.filter((t) => getMonthYear(t.date) === selectedMonth);

  const totalSpent = filtered.reduce(
    (sum, t) => sum + t.lines.reduce((s, l) => s + l.spent, 0),
    0
  );
  const totalReceived = filtered.reduce(
    (sum, t) => sum + t.lines.reduce((s, l) => s + l.received, 0),
    0
  );
  const profit = totalReceived - totalSpent;

  // Aggregate by line detail name
  const breakdown = useMemo(() => {
    const map = new Map<string, { spent: number; received: number }>();
    for (const t of filtered) {
      for (const l of t.lines) {
        const key = l.detail || "Other";
        const prev = map.get(key) ?? { spent: 0, received: 0 };
        map.set(key, {
          spent: prev.spent + l.spent,
          received: prev.received + l.received,
        });
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1].spent - a[1].spent);
  }, [filtered]);

  function getVehicleName(vehicleId: string) {
    const v = vehicles.find((v) => v.id === vehicleId);
    return v?.name || v?.truckNumber || vehicleId;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Reports</h1>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        >
          {months.length === 0 && <option value="">No trips yet</option>}
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <IndianRupee className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Received</p>
              <p className="text-xl font-semibold text-white mt-0.5">
                {formatCurrency(totalReceived)}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
              <TrendingDown className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Spent</p>
              <p className="text-xl font-semibold text-white mt-0.5">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
            <div
              className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${
                profit >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"
              }`}
            >
              <TrendingUp
                className={`h-5 w-5 ${
                  profit >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-gray-400">Net Profit</p>
              <p
                className={`text-xl font-semibold mt-0.5 ${
                  profit >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatCurrency(profit)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expense Breakdown by Detail */}
      {breakdown.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Breakdown by Category
          </h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium text-right">Spent</th>
                  <th className="px-5 py-3 font-medium text-right">Received</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map(([name, vals]) => (
                  <tr
                    key={name}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-gray-300">{name}</td>
                    <td className="px-5 py-3 text-right text-rose-400 font-medium">
                      {formatCurrency(vals.spent)}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-400 font-medium">
                      {formatCurrency(vals.received)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Trip details table */}
      {filtered.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Trips This Month
          </h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Vehicle</th>
                  <th className="px-5 py-3 font-medium">Route</th>
                  <th className="px-5 py-3 font-medium text-right">Spent</th>
                  <th className="px-5 py-3 font-medium text-right">Received</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const spent = t.lines.reduce((s, l) => s + l.spent, 0);
                  const received = t.lines.reduce((s, l) => s + l.received, 0);
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-gray-400">
                        {new Date(t.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="px-5 py-3 text-gray-300">
                        {getVehicleName(t.vehicleId)}
                      </td>
                      <td className="px-5 py-3 text-gray-300">
                        {t.from} → {t.to}
                      </td>
                      <td className="px-5 py-3 text-right text-rose-400 font-medium">
                        {formatCurrency(spent)}
                      </td>
                      <td className="px-5 py-3 text-right text-emerald-400 font-medium">
                        {formatCurrency(received)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Trip count note */}
      <p className="text-sm text-gray-600">
        Based on {filtered.length} trip{filtered.length !== 1 && "s"}
        {selectedMonth && ` in ${selectedMonth}`}.
      </p>
    </div>
  );
}
