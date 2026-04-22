import { useState } from "react";
import { Plus, X, Circle, Trash2, Pencil } from "lucide-react";
import { useAppContext, type Vehicle } from "../context/AppContext";

const emptyForm = {
  name: "",
  truckNumber: "",
  type: "",
  model: "",
  plateNumber: "",
  odometer: 0,
  status: "Active" as "Active" | "Idle",
  routeStatus: "Available" as "On Route" | "Available",
  driverId: "",
};

export default function Vehicles() {
  const { vehicles, drivers, addVehicle, updateVehicle, deleteVehicle } =
    useAppContext();

  function getDriverName(driverId: string) {
    return drivers.find((d) => d.id === driverId)?.name ?? "Unassigned";
  }

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(v: Vehicle) {
    setEditTarget(v);
    setForm({
      name: v.name,
      truckNumber: v.truckNumber,
      type: v.type,
      model: v.model,
      plateNumber: v.plateNumber,
      odometer: v.odometer,
      status: v.status,
      routeStatus: v.routeStatus,
      driverId: v.driverId,
    });
    setShowModal(true);
  }

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!form.truckNumber.trim()) return;

    if (editTarget) {
      updateVehicle({ id: editTarget.id, ...form });
    } else {
      addVehicle(form);
    }

    setForm(emptyForm);
    setEditTarget(null);
    setShowModal(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Vehicles</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </button>
      </div>

      {/* Vehicle Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-colors space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-medium text-white">
                {v.truckNumber}
              </span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <Circle
                    className={`h-2 w-2 fill-current ${
                      v.status === "Active" ? "text-emerald-400" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={
                      v.status === "Active" ? "text-emerald-400" : "text-gray-500"
                    }
                  >
                    {v.status}
                  </span>
                </span>
                <button
                  onClick={() => openEdit(v)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(v.id)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {v.name && (
              <p className="text-xs text-gray-400">{v.name}</p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {v.type && <span>Type: <span className="text-gray-400">{v.type}</span></span>}
              {v.model && <span>Model: <span className="text-gray-400">{v.model}</span></span>}
              {v.odometer > 0 && (
                <span>ODO: <span className="text-gray-400">{v.odometer.toLocaleString("en-IN")} km</span></span>
              )}
            </div>

            <p className="text-sm text-gray-400">
              Driver:{" "}
              <span className="text-gray-300">{getDriverName(v.driverId)}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Delete Vehicle</h2>
            <p className="text-sm text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-mono text-gray-200">
                {vehicles.find((v) => v.id === deleteTarget)?.truckNumber}
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
                  deleteVehicle(deleteTarget);
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

      {/* Add / Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editTarget ? "Edit Vehicle" : "Add New Vehicle"}
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

            <div className="space-y-3">
              {/* Truck Number */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Truck Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.truckNumber}
                  onChange={(e) =>
                    setForm({ ...form, truckNumber: e.target.value.toUpperCase() })
                  }
                  placeholder="MH-04-XX-0000"
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Vehicle Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Tata Prima"
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Type & Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Type
                  </label>
                  <input
                    type="text"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    placeholder="e.g. Truck"
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Model
                  </label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="e.g. 2022"
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Plate & Odometer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    value={form.plateNumber}
                    onChange={(e) =>
                      setForm({ ...form, plateNumber: e.target.value.toUpperCase() })
                    }
                    placeholder="MH-04-XX-0000"
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Odometer (km)
                  </label>
                  <input
                    type="number"
                    value={form.odometer || ""}
                    onChange={(e) =>
                      setForm({ ...form, odometer: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Status & Route Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as "Active" | "Idle" })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="Idle">Idle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Route Status
                  </label>
                  <select
                    value={form.routeStatus}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        routeStatus: e.target.value as "On Route" | "Available",
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="Available">Available</option>
                    <option value="On Route">On Route</option>
                  </select>
                </div>
              </div>

              {/* Driver */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Driver
                </label>
                <select
                  value={form.driverId}
                  onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Unassigned</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
            >
              {editTarget ? "Save Changes" : "Add Vehicle"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
