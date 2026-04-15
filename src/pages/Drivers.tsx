import { useState } from "react";
import { Plus, X, Phone, CreditCard, Pencil, Trash2 } from "lucide-react";
import { useAppContext, type Driver } from "../context/AppContext";

export default function Drivers() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Driver | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
  });

  function openAdd() {
    setEditTarget(null);
    setForm({ name: "", phone: "", licenseNumber: "" });
    setShowModal(true);
  }

  function openEdit(d: Driver) {
    setEditTarget(d);
    setForm({ name: d.name, phone: d.phone, licenseNumber: d.licenseNumber });
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.licenseNumber.trim())
      return;

    if (editTarget) {
      updateDriver({ id: editTarget.id, ...form });
    } else {
      addDriver(form);
    }

    setForm({ name: "", phone: "", licenseNumber: "" });
    setEditTarget(null);
    setShowModal(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Drivers</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Driver
        </button>
      </div>

      {/* Driver Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((d) => (
          <div
            key={d.id}
            className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-colors space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">{d.name}</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(d)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(d.id)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{d.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CreditCard className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono">{d.licenseNumber}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Delete Driver</h2>
            <p className="text-sm text-gray-400">
              Are you sure you want to delete{" "}
              <span className="text-gray-200">
                {drivers.find((d) => d.id === deleteTarget)?.name}
              </span>
              ? This action cannot be undone.
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
                  deleteDriver(deleteTarget);
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

      {/* Add / Edit Driver Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editTarget ? "Edit Driver" : "Add New Driver"}
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
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter driver name"
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  License Number
                </label>
                <input
                  type="text"
                  value={form.licenseNumber}
                  onChange={(e) =>
                    setForm({ ...form, licenseNumber: e.target.value })
                  }
                  placeholder="e.g. MH-0420210012345"
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
            >
              {editTarget ? "Save Changes" : "Add Driver"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
