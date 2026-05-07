import { useState } from "react";
import { Plus, X, ArrowRight, Trash2, Eye } from "lucide-react";
import { useAppContext, type Trip, type TripLine } from "../context/AppContext";

function formatCurrency(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const emptyForm = {
  vehicleId: "",
  from: "",
  to: "",
  date: new Date().toISOString().split("T")[0],
  loadWeight: 0,
  totalAmount: 0,
  status: "In Progress" as "In Progress" | "Completed",
  lines: [{ detail: "Fuel", spent: 0, received: 0 }] as TripLine[],
};

export default function Trips() {
  const { vehicles, trips, addTrip, updateTrip, deleteTrip } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Trip | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function getVehicleLabel(vehicleId: string) {
    const v = vehicles.find((v) => v.id === vehicleId);
    return v ? v.truckNumber || v.name : vehicleId;
  }

  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(t: Trip) {
    setEditTarget(t);
    setForm({
      vehicleId: t.vehicleId,
      from: t.from,
      to: t.to,
      date: t.date,
      loadWeight: t.loadWeight,
      totalAmount: t.totalAmount,
      status: t.status,
      lines: t.lines.length ? t.lines : [{ detail: "", spent: 0, received: 0 }],
    });
    setShowModal(true);
  }

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!form.vehicleId || !form.from.trim() || !form.to.trim() || !form.date)
      return;

    if (editTarget) {
      updateTrip({ id: editTarget.id, ...form });
    } else {
      addTrip(form);
    }

    setForm(emptyForm);
    setEditTarget(null);
    setShowModal(false);
  }

  const isCompletedView = editTarget !== null && form.status === "Completed";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Trips</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Trip
        </button>
      </div>

      {/* Trip Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {trips.map((t) => {
          const totalSpent = t.lines.reduce((s, l) => s + l.spent, 0);
          const totalReceived = t.lines.reduce((s, l) => s + l.received, 0);
          const net = totalReceived - totalSpent;
          return (
            <div
              key={t.id}
              className="bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
            >
              {/* Top section */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-white">
                      {getVehicleLabel(t.vehicleId)}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        t.status === "Completed"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(t.date)}
                    </span>
                    <button
                      onClick={() => openEdit(t)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                    >
                      <Eye className="h-4 w-4 inline mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => setDeleteTarget(t.id)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span>{t.from}</span>
                  <ArrowRight className="h-4 w-4 text-gray-600 shrink-0" />
                  <span>{t.to}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total Amount</span>
                  <span className="font-medium text-emerald-400">
                    {formatCurrency(t.totalAmount)}
                  </span>
                </div>

                {t.loadWeight > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Load Weight</span>
                    <span className="text-gray-300">
                      {t.loadWeight.toLocaleString("en-IN")} kg
                    </span>
                  </div>
                )}
              </div>

              {/* Expenses breakdown */}
              {t.lines.length > 0 && (
                <div className="border-t border-gray-800 px-5 py-4 space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Financial Summary
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Spent</span>
                    <span className="text-rose-400">
                      {formatCurrency(totalSpent)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Received</span>
                    <span className="text-emerald-400">
                      {formatCurrency(totalReceived)}
                    </span>
                  </div>
                </div>
              )}

              {/* Net */}
              <div className="border-t border-gray-800 px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">Net</span>
                <span
                  className={`text-sm font-semibold ${
                    net >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {formatCurrency(net)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Delete Trip</h2>
            <p className="text-sm text-gray-400">
              Are you sure you want to delete this trip? This action cannot be
              undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteTrip(deleteTarget);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm font-medium text-white transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Trip Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editTarget ? "View Trip Details" : "Add New Trip"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditTarget(null);
                }}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Vehicle */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Vehicle
                </label>
                <select
                  value={form.vehicleId}
                  disabled={isCompletedView}
                  onChange={(e) =>
                    setForm({ ...form, vehicleId: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    Select a vehicle
                  </option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.truckNumber || v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Route */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    From
                  </label>
                  <input
                    type="text"
                    value={form.from}
                    disabled={isCompletedView}
                    onChange={(e) => setForm({ ...form, from: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    To
                  </label>
                  <input
                    type="text"
                    value={form.to}
                    disabled={isCompletedView}
                    onChange={(e) => setForm({ ...form, to: e.target.value })}
                    placeholder="e.g. Pune"
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Date & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    disabled={isCompletedView}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    disabled={isCompletedView}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as typeof form.status,
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Load Weight & Total Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Load Weight (KG)
                  </label>
                  <input
                    type="number"
                    value={form.loadWeight || ""}
                    disabled={isCompletedView}
                    onChange={(e) =>
                      setForm({ ...form, loadWeight: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Total Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={form.totalAmount || ""}
                    disabled={isCompletedView}
                    onChange={(e) =>
                      setForm({ ...form, totalAmount: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {isCompletedView && (
              <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400">
                This trip is completed and cannot be edited.
              </div>
            )}
            <div className="flex items-center gap-3 justify-end pt-2">
              {editTarget && (
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditTarget(null);
                    setForm(emptyForm);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium text-gray-300 transition-colors"
                >
                  {isCompletedView ? "Close" : "Discard"}
                </button>
              )}
              {!isCompletedView && (
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
                >
                  {editTarget ? "Save Changes" : "Add Trip"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
