import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronRight,
  Landmark,
  Truck,
  X,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { vehicles, bankAccounts, addVehicle, addBankAccount, deleteBankAccount } =
    useAppContext();

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Vehicle form state ──────────────────────────────────
  const [vForm, setVForm] = useState({
    name: "",
    truckNumber: "",
    type: "",
    model: "",
    plateNumber: "",
    odometer: 0,
  });

  async function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault();
    await addVehicle({
      ...vForm,
      status: "Active",
      routeStatus: "Available",
      driverId: "",
    });
    setVForm({ name: "", truckNumber: "", type: "", model: "", plateNumber: "", odometer: 0 });
    setShowVehicleModal(false);
  }

  // ── Bank form state ─────────────────────────────────────
  const [bForm, setBForm] = useState({
    name: "",
    bankName: "",
    lastFour: "",
  });

  async function handleAddBank(e: React.FormEvent) {
    e.preventDefault();
    await addBankAccount(bForm);
    setBForm({ name: "", bankName: "", lastFour: "" });
    setShowBankModal(false);
  }

  async function handleDeleteBank() {
    if (deleteConfirm) {
      await deleteBankAccount(deleteConfirm);
      setDeleteConfirm(null);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Vehicle Details Column ──────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Add Your Vehicle Details
            </h2>
            <button
              onClick={() => setShowVehicleModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New Truck
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
              <Truck className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No vehicles added yet. Click "Add New Truck" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => navigate(`/vehicles/${v.id}`)}
                  className="w-full flex items-center justify-between bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Truck className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {v.name || v.truckNumber}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {v.truckNumber}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Bank Accounts Column ───────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Add Bank Account Name
            </h2>
            <button
              onClick={() => setShowBankModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New Account
            </button>
          </div>

          {bankAccounts.length === 0 ? (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
              <Landmark className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No bank accounts added yet. Click "Add New Account" to get
                started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bankAccounts.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Landmark className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{b.name}</p>
                      <p className="text-xs text-gray-500">
                        {b.bankName} •••• {b.lastFour}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(b.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Add Vehicle Modal ────────────────────────────── */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <form
            onSubmit={handleAddVehicle}
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md mx-4 p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-white">Add New Truck</h2>

            <div className="space-y-3">
              <input
                required
                placeholder="Vehicle Name"
                value={vForm.name}
                onChange={(e) => setVForm({ ...vForm, name: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
              <input
                required
                placeholder="Truck Number (e.g. MH-12-AB-1234)"
                value={vForm.truckNumber}
                onChange={(e) =>
                  setVForm({ ...vForm, truckNumber: e.target.value })
                }
                className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Vehicle Type"
                  value={vForm.type}
                  onChange={(e) => setVForm({ ...vForm, type: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                />
                <input
                  placeholder="Model"
                  value={vForm.model}
                  onChange={(e) =>
                    setVForm({ ...vForm, model: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Plate Number"
                  value={vForm.plateNumber}
                  onChange={(e) =>
                    setVForm({ ...vForm, plateNumber: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                />
                <input
                  type="number"
                  placeholder="Odometer (km)"
                  value={vForm.odometer || ""}
                  onChange={(e) =>
                    setVForm({ ...vForm, odometer: Number(e.target.value) })
                  }
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowVehicleModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
              >
                Add Truck
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Add Bank Account Modal ───────────────────────── */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <form
            onSubmit={handleAddBank}
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md mx-4 p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-white">
              Add Bank Account
            </h2>

            <div className="space-y-3">
              <input
                required
                placeholder="Account Name"
                value={bForm.name}
                onChange={(e) => setBForm({ ...bForm, name: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
              <input
                required
                placeholder="Bank Name"
                value={bForm.bankName}
                onChange={(e) =>
                  setBForm({ ...bForm, bankName: e.target.value })
                }
                className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
              <input
                required
                placeholder="Last 4 Digits"
                maxLength={4}
                value={bForm.lastFour}
                onChange={(e) =>
                  setBForm({ ...bForm, lastFour: e.target.value.replace(/\D/g, "") })
                }
                className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
              >
                Add Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Delete Bank Account
            </h2>
            <p className="text-sm text-gray-400">
              Are you sure you want to delete this bank account?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBank}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm font-medium text-white transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
