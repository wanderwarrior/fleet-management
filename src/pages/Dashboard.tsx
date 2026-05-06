import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronRight,
  Landmark,
  Truck,
  X,
  Eye,
  EyeOff,
  Pencil,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { vehicles, drivers, bankAccounts, addVehicle, addBankAccount, updateBankAccount, deleteBankAccount } =
    useAppContext();

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editBankId, setEditBankId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Vehicle form state ──────────────────────────────────
  const emptyVForm = {
    name: "",
    truckNumber: "",
    type: "",
    model: "",
    plateNumber: "",
    odometer: 0,
    loadCapacity:0
  };
  const [vForm, setVForm] = useState(emptyVForm);
  const [vErrors, setVErrors] = useState<Record<string, string>>({});

  function validateVForm(): boolean {
    const errs: Record<string, string> = {};
    if (!vForm.name.trim())
      errs.name = "Vehicle name is required.";
    else if (vForm.name.trim().length < 2)
      errs.name = "Vehicle name must be at least 2 characters.";

    if (!vForm.truckNumber.trim())
      errs.truckNumber = "Truck number is required.";
    else if (!/^[A-Z]{2}[\s-]?\d{2}[\s-]?[A-Z]{1,3}[\s-]?\d{4}$/i.test(vForm.truckNumber.trim()))
      errs.truckNumber = "Enter a valid truck number (e.g. MH-12-AB-1234).";

    if (!vForm.type.trim())
      errs.type = "Vehicle type is required.";

    if (!vForm.model.trim())
      errs.model = "Model is required.";

    if (!vForm.plateNumber.trim())
      errs.plateNumber = "Plate number is required.";

    if (vForm.odometer < 0)
      errs.odometer = "Odometer cannot be negative.";

    setVErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleAddVehicle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateVForm()) return;
    await addVehicle({
      ...vForm,
      name: vForm.name.trim(),
      truckNumber: vForm.truckNumber.trim().toUpperCase(),
      plateNumber: vForm.plateNumber.trim().toUpperCase(),
      status: "Active",
      routeStatus: "Available",
      driverId: "",
    });
    setVForm(emptyVForm);
    setVErrors({});
    setShowVehicleModal(false);
  }

  // ── Bank form state ─────────────────────────────────────
  const emptyBForm = {
    holderName: "",
    bankName: "",
    accountNo: "",
    accountType: "Savings" as "Savings" | "Current",
    ifsc: "",
  };
  const [bForm, setBForm] = useState(emptyBForm);
  const [retypeAccountNo, setRetypeAccountNo] = useState("");
  const [showAccountNo, setShowAccountNo] = useState(false);
  const [showRetypeAccountNo, setShowRetypeAccountNo] = useState(false);
  const [bErrors, setBErrors] = useState<Record<string, string>>({});

  function validateBForm(): boolean {
    const errs: Record<string, string> = {};
    if (!bForm.holderName.trim())
      errs.holderName = "Account holder name is required.";
    if (!bForm.bankName.trim())
      errs.bankName = "Bank name is required.";
    if (!bForm.accountNo.trim())
      errs.accountNo = "Account number is required.";
    else if (!/^\d{9,18}$/.test(bForm.accountNo))
      errs.accountNo = "Enter a valid account number (9–18 digits).";
    if (!retypeAccountNo.trim())
      errs.retypeAccountNo = "Please confirm your account number.";
    else if (bForm.accountNo !== retypeAccountNo)
      errs.retypeAccountNo = "Account numbers do not match.";
    if (!bForm.ifsc.trim())
      errs.ifsc = "IFSC code is required.";
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(bForm.ifsc))
      errs.ifsc = "Enter a valid IFSC code (e.g. ICIC0001234).";
    setBErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function openEditBank(id: string) {
    const b = bankAccounts.find((a) => a.id === id);
    if (!b) return;
    setBForm({
      holderName: b.holderName,
      bankName: b.bankName,
      accountNo: b.accountNo,
      accountType: b.accountType,
      ifsc: b.ifsc,
    });
    setRetypeAccountNo(b.accountNo);
    setBErrors({});
    setEditBankId(id);
    setShowBankModal(true);
  }

  async function handleAddBank(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateBForm()) return;
    if (editBankId) {
      await updateBankAccount({ id: editBankId, ...bForm, ifsc: bForm.ifsc.toUpperCase() });
      setEditBankId(null);
    } else {
      await addBankAccount({ ...bForm, ifsc: bForm.ifsc.toUpperCase() });
    }
    setBForm(emptyBForm);
    setRetypeAccountNo("");
    setBErrors({});
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
                        {v.truckNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {v.driverId
                          ? (drivers.find((d) => d.id === v.driverId)?.name ?? "Unknown Driver")
                          : "No Driver Assigned"}
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
                      <p className="text-sm font-medium text-white">{b.holderName}</p>
                      <p className="text-xs text-gray-500">
                        {b.bankName} • {b.accountType} • •••• {b.accountNo.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditBank(b.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-gray-800 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(b.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-800 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
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
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold text-white">Add New Truck</h2>

            <div className="space-y-3">

              {/* Vehicle Name */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Vehicle Name <span className="text-rose-400">*</span>
                </label>
                <input
                  placeholder="e.g. Truck Alpha"
                  value={vForm.name}
                  onChange={(e) => setVForm({ ...vForm, name: e.target.value })}
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${vErrors.name ? "border-rose-500 focus:border-rose-500" : "border-gray-700 focus:border-blue-500"}`}
                />
                {vErrors.name && <p className="text-xs text-rose-400 mt-1">{vErrors.name}</p>}
              </div>

              {/* Truck Number */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Truck Number <span className="text-rose-400">*</span>
                </label>
                <input
                  placeholder="e.g. MH-12-AB-1234"
                  value={vForm.truckNumber}
                  onChange={(e) => setVForm({ ...vForm, truckNumber: e.target.value.toUpperCase() })}
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-mono ${vErrors.truckNumber ? "border-rose-500 focus:border-rose-500" : "border-gray-700 focus:border-blue-500"}`}
                />
                {vErrors.truckNumber && <p className="text-xs text-rose-400 mt-1">{vErrors.truckNumber}</p>}
              </div>

              {/* Vehicle Type & Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Model <span className="text-rose-400">*</span>
                  </label>
                  <input
                    placeholder="e.g. Tata 407"
                    value={vForm.model}
                    onChange={(e) => setVForm({ ...vForm, model: e.target.value })}
                    className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${vErrors.model ? "border-rose-500 focus:border-rose-500" : "border-gray-700 focus:border-blue-500"}`}
                  />
                  {vErrors.model && <p className="text-xs text-rose-400 mt-1">{vErrors.model}</p>}
                  
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Odometer (km)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={vForm.odometer || ""}
                    onChange={(e) => setVForm({ ...vForm, odometer: Number(e.target.value) })}
                    className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${vErrors.odometer ? "border-rose-500 focus:border-rose-500" : "border-gray-700 focus:border-blue-500"}`}
                  />
                  {vErrors.odometer && <p className="text-xs text-rose-400 mt-1">{vErrors.odometer}</p>}
                </div>
              </div>

              {/* Vehicle Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Vehicle Type <span className="text-rose-400">*</span>
                  </label>
                  <input
                    placeholder="e.g. Heavy"
                    value={vForm.type}
                    onChange={(e) => setVForm({ ...vForm, type: e.target.value })}
                    className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${vErrors.type ? "border-rose-500 focus:border-rose-500" : "border-gray-700 focus:border-blue-500"}`}
                  />
                  {vErrors.type && <p className="text-xs text-rose-400 mt-1">{vErrors.type}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Load capacity (tons)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={vForm.loadCapacity || ""}
                    onChange={(e) => setVForm({ ...vForm, loadCapacity: Number(e.target.value) })}
                    className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${vErrors.loadCapacity ? "border-rose-500 focus:border-rose-500" : "border-gray-700 focus:border-blue-500"}`}
                  />
                  {vErrors.loadCapacity && <p className="text-xs text-rose-400 mt-1">{vErrors.loadCapacity}</p>}
                </div>
              </div>

            </div>

            <div className="flex items-center gap-3 justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowVehicleModal(false);
                  setVForm(emptyVForm);
                  setVErrors({});
                }}
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
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold text-white">{editBankId ? "Edit Bank Account" : "Add Bank Account"}</h2>

            <div className="space-y-3">

              {/* Account Holder Name */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Account Holder Name <span className="text-rose-400">*</span>
                </label>
                <input
                  placeholder="e.g. Patrica"
                  value={bForm.holderName}
                  onChange={(e) => setBForm({ ...bForm, holderName: e.target.value })}
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${bErrors.holderName ? "border-rose-500 focus:border-rose-500" : "border-gray-700 focus:border-blue-500"}`}
                />
                {bErrors.holderName && <p className="text-xs text-rose-400 mt-1">{bErrors.holderName}</p>}
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Bank Name <span className="text-rose-400">*</span>
                </label>
                <input
                  placeholder="e.g. ICICI"
                  value={bForm.bankName}
                  onChange={(e) => setBForm({ ...bForm, bankName: e.target.value })}
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${bErrors.bankName ? "border-rose-500 focus:border-rose-500" : "border-gray-700 focus:border-blue-500"}`}
                />
                {bErrors.bankName && <p className="text-xs text-rose-400 mt-1">{bErrors.bankName}</p>}
              </div>

              {/* Account No. */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Account No. <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showAccountNo ? "text" : "password"}
                    placeholder="Enter account number"
                    value={bForm.accountNo}
                    onChange={(e) => setBForm({ ...bForm, accountNo: e.target.value.replace(/\D/g, "") })}
                    className={`w-full h-10 px-3 pr-10 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${bErrors.accountNo ? "border-rose-500 focus:border-rose-500" : "border-gray-700 focus:border-blue-500"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccountNo((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showAccountNo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {bErrors.accountNo && <p className="text-xs text-rose-400 mt-1">{bErrors.accountNo}</p>}
              </div>

              {/* Retype Account No. */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Retype Account No. <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRetypeAccountNo ? "text" : "password"}
                    placeholder="Re-enter account number"
                    value={retypeAccountNo}
                    onChange={(e) => setRetypeAccountNo(e.target.value.replace(/\D/g, ""))}
                    className={`w-full h-10 px-3 pr-10 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${bErrors.retypeAccountNo ? "border-rose-500 focus:border-rose-500" : "border-gray-700 focus:border-blue-500"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRetypeAccountNo((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showRetypeAccountNo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {bErrors.retypeAccountNo && <p className="text-xs text-rose-400 mt-1">{bErrors.retypeAccountNo}</p>}
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Account Type <span className="text-rose-400">*</span>
                </label>
                <select
                  value={bForm.accountType}
                  onChange={(e) => setBForm({ ...bForm, accountType: e.target.value as "Savings" | "Current" })}
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
              </div>

              {/* IFSC */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  IFSC <span className="text-rose-400">*</span>
                </label>
                <input
                  placeholder="e.g. ICIC0001234"
                  value={bForm.ifsc}
                  onChange={(e) => setBForm({ ...bForm, ifsc: e.target.value.toUpperCase() })}
                  maxLength={11}
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-mono ${bErrors.ifsc ? "border-rose-500 focus:border-rose-500" : "border-gray-700 focus:border-blue-500"}`}
                />
                {bErrors.ifsc && <p className="text-xs text-rose-400 mt-1">{bErrors.ifsc}</p>}
              </div>

            </div>

            <div className="flex items-center gap-3 justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowBankModal(false);
                  setEditBankId(null);
                  setBForm(emptyBForm);
                  setRetypeAccountNo("");
                  setBErrors({});
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
              >
                Save
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
