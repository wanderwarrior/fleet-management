import { useState } from "react";
import { Plus, X, Phone, CreditCard, Pencil, Trash2, BadgeCheck, FileText } from "lucide-react";
import { useAppContext, type Driver } from "../context/AppContext";

const LICENSE_STATUSES = ["Verified", "Reviewing", "Expired"] as const;
const ID_PROOF_STATUSES = ["Verified", "Reviewing", "Pending"] as const;

type FormState = {
  name: string;
  phone: string;
  licenseNumber: string;
  licenseStatus: Driver["licenseStatus"];
  idProof: string;
  idProofStatus: Driver["idProofStatus"];
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const defaultForm: FormState = {
  name: "",
  phone: "",
  licenseNumber: "",
  licenseStatus: "Reviewing",
  idProof: "",
  idProofStatus: "Pending",
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required.";
  } else if (!/^[A-Za-z\s]{2,50}$/.test(form.name.trim())) {
    errors.name = "Name must be 2–50 letters only.";
  }

  if (!form.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }

  if (!form.licenseNumber.trim()) {
    errors.licenseNumber = "License number is required.";
  } else if (!/^[A-Z]{2}[-\s]?\d{2}[-\s]?\d{4}\d{7}$/.test(form.licenseNumber.trim().toUpperCase())) {
    errors.licenseNumber = "Format: XX-00-YYYY0000000 (e.g. MH-04-20210012345).";
  }

  if (!form.licenseStatus) {
    errors.licenseStatus = "License status is required.";
  }

  if (form.idProof.trim() && form.idProof.trim().length < 4) {
    errors.idProof = "ID proof number must be at least 4 characters.";
  }

  if (!form.idProofStatus) {
    errors.idProofStatus = "ID proof status is required.";
  }

  return errors;
}

const statusColor: Record<string, string> = {
  Verified: "text-emerald-400 bg-emerald-400/10",
  Reviewing: "text-yellow-400 bg-yellow-400/10",
  Expired: "text-rose-400 bg-rose-400/10",
  Pending: "text-gray-400 bg-gray-400/10",
};

export default function Drivers() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Driver | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function openAdd() {
    setEditTarget(null);
    setForm(defaultForm);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(d: Driver) {
    setEditTarget(d);
    setForm({
      name: d.name,
      phone: d.phone,
      licenseNumber: d.licenseNumber,
      licenseStatus: d.licenseStatus,
      idProof: d.idProof,
      idProofStatus: d.idProofStatus,
    });
    setErrors({});
    setShowModal(true);
  }

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      if (editTarget) {
        await updateDriver({
          id: editTarget.id,
          name: form.name.trim(),
          phone: form.phone.trim(),
          licenseNumber: form.licenseNumber.trim().toUpperCase(),
          licenseStatus: form.licenseStatus,
          idProof: form.idProof.trim(),
          idProofStatus: form.idProofStatus,
        });
      } else {
        await addDriver({
          name: form.name.trim(),
          phone: form.phone.trim(),
          licenseNumber: form.licenseNumber.trim().toUpperCase(),
          licenseStatus: form.licenseStatus,
          idProof: form.idProof.trim(),
          idProofStatus: form.idProofStatus,
        });
      }
      setForm(defaultForm);
      setEditTarget(null);
      setErrors({});
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
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
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[d.licenseStatus]}`}>
                <BadgeCheck className="h-3 w-3" />
                License: {d.licenseStatus}
              </span>
              {d.idProof && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[d.idProofStatus]}`}>
                  <FileText className="h-3 w-3" />
                  ID: {d.idProofStatus}
                </span>
              )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto"
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
                  setErrors({});
                }}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors ${
                    errors.name
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Phone <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors ${
                    errors.phone
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.phone && <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>}
              </div>

              {/* License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  License Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.licenseNumber}
                  onChange={(e) => handleChange("licenseNumber", e.target.value.toUpperCase())}
                  placeholder="e.g. MH0420210012345"
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors font-mono ${
                    errors.licenseNumber
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.licenseNumber && (
                  <p className="mt-1 text-xs text-rose-400">{errors.licenseNumber}</p>
                )}
              </div>

              {/* License Status */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  License Status <span className="text-rose-400">*</span>
                </label>
                <select
                  value={form.licenseStatus}
                  onChange={(e) => handleChange("licenseStatus", e.target.value as Driver["licenseStatus"])}
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 outline-none focus:ring-1 transition-colors ${
                    errors.licenseStatus
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                >
                  {LICENSE_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.licenseStatus && (
                  <p className="mt-1 text-xs text-rose-400">{errors.licenseStatus}</p>
                )}
              </div>

              {/* ID Proof */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  ID Proof Number{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.idProof}
                  onChange={(e) => handleChange("idProof", e.target.value)}
                  placeholder="e.g. Aadhaar / PAN number"
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors ${
                    errors.idProof
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.idProof && <p className="mt-1 text-xs text-rose-400">{errors.idProof}</p>}
              </div>

              {/* ID Proof Status */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  ID Proof Status <span className="text-rose-400">*</span>
                </label>
                <select
                  value={form.idProofStatus}
                  onChange={(e) => handleChange("idProofStatus", e.target.value as Driver["idProofStatus"])}
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 outline-none focus:ring-1 transition-colors ${
                    errors.idProofStatus
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                >
                  {ID_PROOF_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.idProofStatus && (
                  <p className="mt-1 text-xs text-rose-400">{errors.idProofStatus}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
            >
              {submitting ? "Saving…" : editTarget ? "Save Changes" : "Add Driver"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
