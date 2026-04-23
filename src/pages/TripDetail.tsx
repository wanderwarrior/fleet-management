import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Calendar, Weight, DollarSign, TrendingUp, TrendingDown, Truck } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function formatCurrency(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trips, vehicles } = useAppContext();

  const trip = trips.find((t) => t.id === id);

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-400">Trip not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
  const totalSpent = trip.lines.reduce((s, l) => s + l.spent, 0);
  const totalReceived = trip.lines.reduce((s, l) => s + l.received, 0);
  const net = totalReceived - totalSpent;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">
            {trip.from} → {trip.to}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Trip Details</p>
        </div>
        <span
          className={`ml-auto text-xs font-medium px-3 py-1 rounded-full ${
            trip.status === "Completed"
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-amber-500/15 text-amber-400"
          }`}
        >
          {trip.status}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Calendar className="h-3.5 w-3.5" />
            Date
          </div>
          <p className="text-sm font-medium text-white">
            {new Date(trip.date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Weight className="h-3.5 w-3.5" />
            Load Weight
          </div>
          <p className="text-sm font-medium text-white">
            {trip.loadWeight.toLocaleString("en-IN")} kg
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <DollarSign className="h-3.5 w-3.5" />
            Total Amount
          </div>
          <p className="text-sm font-medium text-white">
            {formatCurrency(trip.totalAmount)}
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Truck className="h-3.5 w-3.5" />
            Vehicle
          </div>
          <p className="text-sm font-medium text-white truncate">
            {vehicle ? vehicle.truckNumber || vehicle.name : "—"}
          </p>
        </div>
      </div>

      {/* Route */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Route
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">{trip.from}</span>
          </div>
          <div className="flex-1 border-t border-dashed border-gray-700" />
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">{trip.to}</span>
          </div>
        </div>
      </div>

      {/* Trip Lines */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Expense & Income Lines
        </h2>
        {trip.lines.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No lines recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">Detail</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3 pr-4">Spent</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {trip.lines.map((line, i) => (
                  <tr key={i}>
                    <td className="py-3 pr-4 text-gray-300">{line.detail || "—"}</td>
                    <td className="py-3 pr-4 text-right text-rose-400">
                      {line.spent > 0 ? formatCurrency(line.spent) : "—"}
                    </td>
                    <td className="py-3 text-right text-emerald-400">
                      {line.received > 0 ? formatCurrency(line.received) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Financial Summary
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs">
              <TrendingDown className="h-3.5 w-3.5" />
              Total Spent
            </div>
            <p className="text-lg font-bold text-rose-400">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
              <TrendingUp className="h-3.5 w-3.5" />
              Total Received
            </div>
            <p className="text-lg font-bold text-emerald-400">{formatCurrency(totalReceived)}</p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              Net Profit / Loss
            </div>
            <p className={`text-lg font-bold ${net >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {net >= 0 ? "+" : ""}{formatCurrency(net)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
