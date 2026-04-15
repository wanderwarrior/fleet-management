import { useState } from "react";
import { Plus, X, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useAppContext, type Trip } from "../context/AppContext";

// ── Helpers ──────────────────────────────────────────────────

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

// ── Component ────────────────────────────────────────────────

const emptyForm = {
  truckId: "",
  from: "",
  to: "",
  date: "",
  revenue: 0,
  toll: 0,
  fuel: 0,
  other: 0,
};

export default function Trips() {
  const { vehicles, trips, addTrip, updateTrip, deleteTrip } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Trip | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function getTruckNumber(truckId: string) {
    return vehicles.find((v) => v.id === truckId)?.truckNumber ?? truckId;
  }

  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(t: Trip) {
    setEditTarget(t);
    setForm({
      truckId: t.truckId,
      from: t.from,
      to: t.to,
      date: t.date,
      revenue: t.revenue,
      toll: t.toll,
      fuel: t.fuel,
      other: t.other,
    });
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.truckId || !form.from.trim() || !form.to.trim() || !form.date)
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
          const totalExp = t.toll + t.fuel + t.other;
          const profit = t.revenue - totalExp;
          return (
            <div
              key={t.id}
              className="bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
            >
              {/* Top section */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-medium text-white">
                    {getTruckNumber(t.truckId)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(t.date)}
                    </span>
                    <button
                      onClick={() => openEdit(t)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(t.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span>{t.from}</span>
                  <ArrowRight className="h-4 w-4 text-gray-600 shrink-0" />
                  <span>{t.to}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Revenue</span>
                  <span className="font-medium text-emerald-400">
                    {formatCurrency(t.revenue)}
                  </span>
                </div>
              </div>

              {/* Expenses breakdown */}
              <div className="border-t border-gray-800 px-5 py-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Expenses
                </p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Toll</p>
                    <p className="text-gray-300">{formatCurrency(t.toll)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Fuel</p>
                    <p className="text-gray-300">{formatCurrency(t.fuel)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Other</p>
                    <p className="text-gray-300">{formatCurrency(t.other)}</p>
                  </div>
                </div>
              </div>

              {/* Profit */}
              <div className="border-t border-gray-800 px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">
                  Profit
                </span>
                <span
                  className={`text-sm font-semibold ${
                    profit >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {formatCurrency(profit)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editTarget ? "Edit Trip" : "Add New Trip"}
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
              {/* Truck */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Truck
                </label>
                <select
                  value={form.truckId}
                  onChange={(e) =>
                    setForm({ ...form, truckId: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="" disabled>
                    Select a truck
                  </option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.truckNumber}
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
                    onChange={(e) =>
                      setForm({ ...form, from: e.target.value })
                    }
                    placeholder="e.g. Mumbai"
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    To
                  </label>
                  <input
                    type="text"
                    value={form.to}
                    onChange={(e) => setForm({ ...form, to: e.target.value })}
                    placeholder="e.g. Pune"
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Revenue */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Revenue (₹)
                </label>
                <input
                  type="number"
                  value={form.revenue || ""}
                  onChange={(e) =>
                    setForm({ ...form, revenue: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Expenses */}
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide pt-1">
                Expenses
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Toll (₹)
                  </label>
                  <input
                    type="number"
                    value={form.toll || ""}
                    onChange={(e) =>
                      setForm({ ...form, toll: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Fuel (₹)
                  </label>
                  <input
                    type="number"
                    value={form.fuel || ""}
                    onChange={(e) =>
                      setForm({ ...form, fuel: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Other (₹)
                  </label>
                  <input
                    type="number"
                    value={form.other || ""}
                    onChange={(e) =>
                      setForm({ ...form, other: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
            >
              {editTarget ? "Save Changes" : "Add Trip"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
