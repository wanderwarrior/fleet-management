import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";
import { useAppContext, type AssistantDriver } from "../context/AppContext";
import {
  ChevronLeft,
  User,
  Phone,
  CreditCard,
  FileText,
  BadgeCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  Camera,
  Upload,
  Loader2,
} from "lucide-react";

type AssistantFormState = {
  name: string;
  phone: string;
  licenseNumber: string;
  idProof: string;
  photoUrl: string;
};

type AssistantFormErrors = Partial<Record<keyof AssistantFormState, string>>;

const defaultForm: AssistantFormState = {
  name: "",
  phone: "",
  licenseNumber: "",
  idProof: "",
  photoUrl: "",
};

function validate(form: AssistantFormState): AssistantFormErrors {
  const errors: AssistantFormErrors = {};

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
  } else if (
    !/^[A-Z]{2}[-\s]?\d{2}[-\s]?\d{4}\d{7}$/.test(
      form.licenseNumber.trim().toUpperCase()
    )
  ) {
    errors.licenseNumber = "Format: XX-00-YYYY0000000 (e.g. MH-04-20210012345).";
  }

  if (form.idProof.trim() && form.idProof.trim().length < 4) {
    errors.idProof = "ID proof must be at least 4 characters.";
  }

  return errors;
}

const statusColor: Record<string, string> = {
  Verified: "text-emerald-400 bg-emerald-400/10",
  Reviewing: "text-yellow-400 bg-yellow-400/10",
  Expired: "text-rose-400 bg-rose-400/10",
  Pending: "text-gray-400 bg-gray-400/10",
};

function resizeImageToBase64(file: File, maxPx = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas unavailable")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image load failed"));
    };
    img.src = objectUrl;
  });
}

export default function DriverDetail() {
  const { id: driverId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { uid } = useAuth();
  const { drivers, trips, vehicles } = useAppContext();

  const driver = drivers.find((d) => d.id === driverId);

  const assignedVehicles = driver
    ? vehicles.filter((v) => v.driverId === driver.id)
    : [];

  const connectedTrips = driver
    ? trips.filter((t) => assignedVehicles.some((v) => v.id === t.vehicleId))
    : [];

  // ── Assistant drivers ────────────────────────────────────
  const [assistants, setAssistants] = useState<AssistantDriver[]>([]);
  const [loadingAssistants, setLoadingAssistants] = useState(true);

  // ── Modal state ──────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AssistantDriver | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState<AssistantFormState>(defaultForm);
  const [errors, setErrors] = useState<AssistantFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch assistant drivers from Firestore subcollection ──
  useEffect(() => {
    if (!uid || !driverId) return;
    const col = collection(
      db,
      "users",
      uid,
      "drivers",
      driverId,
      "assistantDrivers"
    );
    getDocs(col)
      .then((snap) => {
        setAssistants(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AssistantDriver)
        );
      })
      .finally(() => setLoadingAssistants(false));
  }, [uid, driverId]);

  // ── Helpers ──────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null);
    setForm(defaultForm);
    setPhotoFile(null);
    setPhotoPreview("");
    setErrors({});
    setPhotoUploadError(null);
    setShowModal(true);
  }

  function openEdit(a: AssistantDriver) {
    setEditTarget(a);
    setForm({
      name: a.name,
      phone: a.phone,
      licenseNumber: a.licenseNumber,
      idProof: a.idProof,
      photoUrl: a.photoUrl ?? "",
    });
    setPhotoFile(null);
    setPhotoPreview(a.photoUrl ?? "");
    setErrors({});
    setPhotoUploadError(null);
    setShowModal(true);
  }

  function handleChange<K extends keyof AssistantFormState>(
    key: K,
    value: AssistantFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoUploadError(null);
    setPhotoPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!uid || !driverId) return;

    setSubmitting(true);
    setPhotoUploadError(null);
    const pendingFile = photoFile;
    setPhotoFile(null);

    try {
      let photoUrl = form.photoUrl;
      if (pendingFile) {
        try {
          photoUrl = await resizeImageToBase64(pendingFile);
        } catch {
          setPhotoUploadError(
            "Could not process image. Details saved without photo."
          );
        }
      }

      const data = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        licenseNumber: form.licenseNumber.trim().toUpperCase(),
        idProof: form.idProof.trim(),
        photoUrl,
      };

      const col = collection(
        db,
        "users",
        uid,
        "drivers",
        driverId,
        "assistantDrivers"
      );

      if (editTarget) {
        await updateDoc(
          doc(
            db,
            "users",
            uid,
            "drivers",
            driverId,
            "assistantDrivers",
            editTarget.id
          ),
          data
        );
        setAssistants((prev) =>
          prev.map((a) => (a.id === editTarget.id ? { ...a, ...data } : a))
        );
      } else {
        const ref = await addDoc(col, data);
        setAssistants((prev) => [...prev, { id: ref.id, ...data }]);
      }

      setShowModal(false);
      setEditTarget(null);
      setForm(defaultForm);
      setPhotoPreview("");
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || !uid || !driverId) return;
    await deleteDoc(
      doc(
        db,
        "users",
        uid,
        "drivers",
        driverId,
        "assistantDrivers",
        deleteTarget
      )
    );
    setAssistants((prev) => prev.filter((a) => a.id !== deleteTarget));
    setDeleteTarget(null);
  }

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-400">Driver not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-400 text-sm hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const deleteName = assistants.find((a) => a.id === deleteTarget)?.name;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      {/* ── Driver Profile Card ────────────────────────────── */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-white mb-5">Driver Profile</h3>
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          {driver.photoUrl ? (
            <img
              src={driver.photoUrl}
              alt={driver.name}
              className="h-20 w-20 rounded-full object-cover border-2 border-gray-700 shrink-0"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-500 shrink-0">
              <User className="h-9 w-9" />
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-lg font-semibold text-white">{driver.name}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {driver.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                <span className="font-mono">{driver.licenseNumber}</span>
              </span>
              {driver.idProof && (
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {driver.idProof}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-0.5">
              <span
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[driver.licenseStatus]}`}
              >
                <BadgeCheck className="h-3 w-3" />
                License: {driver.licenseStatus}
              </span>
              {driver.idProof && (
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[driver.idProofStatus]}`}
                >
                  <FileText className="h-3 w-3" />
                  ID: {driver.idProofStatus}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Connected Trips ──────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Connected Trips</h2>
            <p className="text-sm text-gray-400">
              Trips for vehicles assigned to this driver.
            </p>
          </div>
        </div>

        {connectedTrips.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900 p-6 text-sm text-gray-400">
            No trips are currently connected to this driver’s assigned truck.
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Vehicle</th>
                  <th className="px-5 py-3 font-medium">Route</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {connectedTrips.map((trip) => {
                  const amount = trip.lines.reduce((sum, line) => sum + line.received - line.spent, 0);
                  const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
                  return (
                    <tr
                      key={trip.id}
                      className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-gray-300">
                        {new Date(trip.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3 text-gray-300">
                        {vehicle?.truckNumber || vehicle?.name || trip.vehicleId}
                      </td>
                      <td className="px-5 py-3 text-gray-300">
                        {trip.from} → {trip.to}
                      </td>
                      <td className="px-5 py-3 text-right text-emerald-400 font-medium">
                        ₹{amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Assistant Drivers ──────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Assistant Drivers
          </h2>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Assistant
          </button>
        </div>

        {loadingAssistants ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : assistants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-gray-700 text-gray-500 text-sm gap-2">
            <User className="h-8 w-8 opacity-40" />
            No assistant drivers yet
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assistants.map((a) => (
              <div
                key={a.id}
                className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {a.photoUrl ? (
                    <img
                      src={a.photoUrl}
                      alt={a.name}
                      className="h-12 w-12 rounded-full object-cover border border-gray-700 shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500 shrink-0">
                      <User className="h-6 w-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {a.name}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(a.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Phone className="h-3 w-3 shrink-0" />
                        {a.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <CreditCard className="h-3 w-3 shrink-0" />
                        <span className="font-mono">{a.licenseNumber}</span>
                      </div>
                      {a.idProof && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <FileText className="h-3 w-3 shrink-0" />
                          {a.idProof}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation ────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Remove Assistant Driver
            </h2>
            <p className="text-sm text-gray-400">
              Are you sure you want to remove{" "}
              <span className="text-gray-200">{deleteName}</span>? This action
              cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm font-medium text-white transition-colors"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ───────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editTarget ? "Edit Assistant Driver" : "Add Assistant Driver"}
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

            <div className="space-y-5">
              {/* Photo upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-700"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-500">
                      <User className="h-9 w-9" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    title="Choose photo"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-xs font-medium transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {photoPreview ? "Change Photo" : "Upload Photo"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
                {photoFile && (
                  <p className="text-xs text-blue-400">
                    Photo selected — will save on submit
                  </p>
                )}
                {photoUploadError && (
                  <p className="text-xs text-rose-400">{photoUploadError}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors ${
                    errors.name
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-400">{errors.name}</p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Mobile Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    handleChange(
                      "phone",
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors ${
                    errors.phone
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>
                )}
              </div>

              {/* License */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  License Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.licenseNumber}
                  onChange={(e) =>
                    handleChange(
                      "licenseNumber",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="e.g. MH0420210012345"
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors font-mono ${
                    errors.licenseNumber
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.licenseNumber && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.licenseNumber}
                  </p>
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
                {errors.idProof && (
                  <p className="mt-1 text-xs text-rose-400">{errors.idProof}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
            >
              {submitting
                ? "Saving…"
                : editTarget
                ? "Save Changes"
                : "Add Assistant"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
