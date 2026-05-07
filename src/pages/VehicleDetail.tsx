import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Circle,
  MapPin,
  User,
  Phone,
  FileText,
  Shield,
  Plus,
  Trash2,
  Upload,
  Search,
  Loader2,
  Camera,
  Pencil,
  X,
  CreditCard,
  BadgeCheck,
} from "lucide-react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";
import { useAppContext } from "../context/AppContext";
import type { TripLine, AssistantDriver } from "../context/AppContext";

type Tab = "driver" | "trips";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    vehicles,
    drivers,
    trips,
    updateVehicle,
    addDriver,
    updateDriver,
    deleteDriver,
    addTrip,
    updateTrip,
    deleteTrip,
  } = useAppContext();

  const vehicle = vehicles.find((v) => v.id === id);
  const [tab, setTab] = useState<Tab>("driver");

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-400">Vehicle not found.</p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-400 text-sm hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const driver = drivers.find((d) => d.id === vehicle.driverId);
  const vehicleTrips = trips.filter((t) => t.vehicleId === vehicle.id);

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      {/* ── Vehicle Header ─────────────────────────────────── */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-semibold text-white">
                {vehicle.name}
              </h1>
              <h1 className="text-xl font-semibold text-white">
                {vehicle.truckNumber}
              </h1>
              <span className="flex items-center gap-1.5 text-xs font-medium">
                <Circle
                  className={`h-2 w-2 fill-current ${
                    vehicle.status === "Active"
                      ? "text-emerald-400"
                      : "text-gray-500"
                  }`}
                />
                <span
                  className={
                    vehicle.status === "Active"
                      ? "text-emerald-400"
                      : "text-gray-500"
                  }
                >
                  {vehicle.status}
                </span>
              </span>
              {vehicle.routeStatus && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    vehicle.routeStatus === "On Route"
                      ? "bg-blue-500/15 text-blue-400"
                      : "bg-gray-700/50 text-gray-400"
                  }`}
                >
                  {vehicle.routeStatus}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
              {vehicle.type && (
                <span>
                  Type: <span className="text-gray-300">{vehicle.type}</span>
                </span>
              )}
              {vehicle.model && (
                <span>
                  Model: <span className="text-gray-300">{vehicle.model}</span>
                </span>
              )}
              <span>
                Odometer:{" "}
                <span className="text-gray-300">
                  {(vehicle.odometer ?? 0).toLocaleString("en-IN")} km
                </span>
              </span>
            </div>
          </div>

          {/* <button
            onClick={async () => {
              await deleteVehicle(vehicle.id);
              navigate("/");
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-sm font-medium transition-colors self-start"
          >
            <Trash2 className="h-4 w-4" />
            Delete Vehicle
          </button> */}
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-800">
        <button
          onClick={() => setTab("driver")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            tab === "driver"
              ? "text-blue-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Driver Details
          {tab === "driver" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setTab("trips")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            tab === "trips"
              ? "text-blue-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Trip Details
          {tab === "trips" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full" />
          )}
        </button>
      </div>

      {/* ── Tab Content ────────────────────────────────────── */}
      {tab === "driver" ? (
        <DriverTab
          vehicle={vehicle}
          driver={driver ?? null}
          addDriver={addDriver}
          updateDriver={updateDriver}
          deleteDriver={deleteDriver}
          updateVehicle={updateVehicle}
        />
      ) : (
        <TripTab
          vehicleId={vehicle.id}
          trips={vehicleTrips}
          addTrip={addTrip}
          updateTrip={updateTrip}
          deleteTrip={deleteTrip}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ── Assistant Driver helpers ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════

type AssistantFormState = {
  name: string;
  phone: string;
  licenseNumber: string;
  idProof: string;
  photoUrl: string;
};

type AssistantFormErrors = Partial<Record<keyof AssistantFormState, string>>;

const defaultAssistantForm: AssistantFormState = {
  name: "", phone: "", licenseNumber: "", idProof: "", photoUrl: "",
};

function validateAssistant(form: AssistantFormState): AssistantFormErrors {
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
  } else if (!/^[A-Z]{2}[-\s]?\d{2}[-\s]?\d{4}\d{7}$/.test(form.licenseNumber.trim().toUpperCase())) {
    errors.licenseNumber = "Format: XX-00-YYYY0000000 (e.g. MH-04-20210012345).";
  }
  if (form.idProof.trim() && form.idProof.trim().length < 4) {
    errors.idProof = "ID proof must be at least 4 characters.";
  }
  return errors;
}

// ═══════════════════════════════════════════════════════════════
// ── Driver Tab ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

interface DriverTabProps {
  vehicle: ReturnType<typeof useAppContext>["vehicles"][number];
  driver: ReturnType<typeof useAppContext>["drivers"][number] | null;
  addDriver: ReturnType<typeof useAppContext>["addDriver"];
  updateDriver: ReturnType<typeof useAppContext>["updateDriver"];
  deleteDriver: ReturnType<typeof useAppContext>["deleteDriver"];
  updateVehicle: ReturnType<typeof useAppContext>["updateVehicle"];
}

type DriverFormErrors = {
  name?: string;
  phone?: string;
  licenseNumber?: string;
  idProof?: string;
};

function validateDriverForm(form: {
  name: string;
  phone: string;
  licenseNumber: string;
  idProof: string;
}): DriverFormErrors {
  const errors: DriverFormErrors = {};

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
    errors.licenseNumber =
      "Format: XX-00-YYYY0000000 (e.g. MH-04-20210012345).";
  }

  if (form.idProof.trim() && form.idProof.trim().length < 4) {
    errors.idProof = "ID proof must be at least 4 characters.";
  }

  return errors;
}

/** Resize an image File to max 200×200 and return a base64 JPEG string. */
function resizeImageToBase64(file: File, maxPx = 200): Promise<string> {
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
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image load failed")); };
    img.src = objectUrl;
  });
}

function DriverTab({
  vehicle,
  driver,
  addDriver,
  updateDriver,
  deleteDriver,
  updateVehicle,
}: DriverTabProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: driver?.name ?? "",
    phone: driver?.phone ?? "",
    licenseNumber: driver?.licenseNumber ?? "",
    idProof: driver?.idProof ?? "",
    licenseStatus: driver?.licenseStatus ?? ("Reviewing" as const),
    idProofStatus: driver?.idProofStatus ?? ("Pending" as const),
    photoUrl: driver?.photoUrl ?? "",
  });
  const [errors, setErrors] = useState<DriverFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(
    driver?.photoUrl ?? ""
  );
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChange<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
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
    e.target.value = ""; // allow re-selecting the same file
  }

  async function handleSave() {
    const validationErrors = validateDriverForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setPhotoUploadError(null);

    // Capture & clear immediately — prevents stale retries on failure
    const pendingFile = photoFile;
    setPhotoFile(null);

    try {
      // ── Encode photo to base64 (client-side, no Storage needed) ──
      let photoUrl = form.photoUrl;
      if (pendingFile) {
        try {
          photoUrl = await resizeImageToBase64(pendingFile);
        } catch (imgErr) {
          console.error("Image processing failed:", imgErr);
          setPhotoUploadError("Could not process image. Details saved without photo.");
        }
      }

      const cleaned = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        licenseNumber: form.licenseNumber.trim().toUpperCase(),
        idProof: form.idProof.trim(),
        licenseStatus: form.licenseStatus,
        idProofStatus: form.idProofStatus,
        photoUrl,
      };

      // ── Save driver + link to vehicle ─────────────────────────────
      if (driver) {
        await updateDriver({ id: driver.id, ...cleaned });
      } else {
        const newId = await addDriver({ ...cleaned });
        await updateVehicle({ ...vehicle, driverId: newId });
      }

      setForm((prev) => ({ ...prev, photoUrl }));
      setPhotoPreview(photoUrl);
      setErrors({});
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveDriver() {
    if (!driver) return;
    await deleteDriver(driver.id);
    await updateVehicle({ ...vehicle, driverId: "" });
  }

  const [isEditing, setIsEditing] = useState(!driver); // new driver → edit mode immediately

  // ── Assistant drivers ────────────────────────────────────────
  const { uid } = useAuth();
  const [assistants, setAssistants] = useState<AssistantDriver[]>([]);
  const [loadingAssistants, setLoadingAssistants] = useState(!!driver);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [editAssistant, setEditAssistant] = useState<AssistantDriver | null>(null);
  const [deleteAssistantTarget, setDeleteAssistantTarget] = useState<string | null>(null);
  const [assistantForm, setAssistantForm] = useState<AssistantFormState>(defaultAssistantForm);
  const [assistantErrors, setAssistantErrors] = useState<AssistantFormErrors>({});
  const [assistantSubmitting, setAssistantSubmitting] = useState(false);
  const [assistantPhotoFile, setAssistantPhotoFile] = useState<File | null>(null);
  const [assistantPhotoPreview, setAssistantPhotoPreview] = useState("");
  const [assistantPhotoUploadError, setAssistantPhotoUploadError] = useState<string | null>(null);
  const assistantFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!uid || !driver?.id) { setLoadingAssistants(false); return; }
    const col = collection(db, "users", uid, "drivers", driver.id, "assistantDrivers");
    getDocs(col)
      .then((snap) => {
        setAssistants(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AssistantDriver));
      })
      .finally(() => setLoadingAssistants(false));
  }, [uid, driver?.id]);

  function openAddAssistant() {
    setEditAssistant(null);
    setAssistantForm(defaultAssistantForm);
    setAssistantPhotoFile(null);
    setAssistantPhotoPreview("");
    setAssistantErrors({});
    setAssistantPhotoUploadError(null);
    setShowAssistantModal(true);
  }

  function openEditAssistant(a: AssistantDriver) {
    setEditAssistant(a);
    setAssistantForm({ name: a.name, phone: a.phone, licenseNumber: a.licenseNumber, idProof: a.idProof, photoUrl: a.photoUrl ?? "" });
    setAssistantPhotoFile(null);
    setAssistantPhotoPreview(a.photoUrl ?? "");
    setAssistantErrors({});
    setAssistantPhotoUploadError(null);
    setShowAssistantModal(true);
  }

  function handleAssistantChange<K extends keyof AssistantFormState>(key: K, value: AssistantFormState[K]) {
    setAssistantForm((prev) => ({ ...prev, [key]: value }));
    setAssistantErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleAssistantPhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAssistantPhotoFile(file);
    setAssistantPhotoUploadError(null);
    setAssistantPhotoPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function handleAssistantSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    const validationErrors = validateAssistant(assistantForm);
    if (Object.keys(validationErrors).length > 0) { setAssistantErrors(validationErrors); return; }
    if (!uid || !driver?.id) return;
    setAssistantSubmitting(true);
    setAssistantPhotoUploadError(null);
    const pendingFile = assistantPhotoFile;
    setAssistantPhotoFile(null);
    try {
      let photoUrl = assistantForm.photoUrl;
      if (pendingFile) {
        try { photoUrl = await resizeImageToBase64(pendingFile); }
        catch { setAssistantPhotoUploadError("Could not process image. Details saved without photo."); }
      }
      const data = { name: assistantForm.name.trim(), phone: assistantForm.phone.trim(), licenseNumber: assistantForm.licenseNumber.trim().toUpperCase(), idProof: assistantForm.idProof.trim(), photoUrl };
      const col = collection(db, "users", uid, "drivers", driver.id, "assistantDrivers");
      if (editAssistant) {
        await updateDoc(doc(db, "users", uid, "drivers", driver.id, "assistantDrivers", editAssistant.id), data);
        setAssistants((prev) => prev.map((a) => a.id === editAssistant.id ? { ...a, ...data } : a));
      } else {
        const ref = await addDoc(col, data);
        setAssistants((prev) => [...prev, { id: ref.id, ...data }]);
      }
      setShowAssistantModal(false);
      setEditAssistant(null);
      setAssistantForm(defaultAssistantForm);
      setAssistantPhotoPreview("");
      setAssistantErrors({});
    } finally {
      setAssistantSubmitting(false);
    }
  }

  async function handleAssistantDelete() {
    if (!deleteAssistantTarget || !uid || !driver?.id) return;
    await deleteDoc(doc(db, "users", uid, "drivers", driver.id, "assistantDrivers", deleteAssistantTarget));
    setAssistants((prev) => prev.filter((a) => a.id !== deleteAssistantTarget));
    setDeleteAssistantTarget(null);
  }

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      Verified: "bg-emerald-500/15 text-emerald-400",
      Reviewing: "bg-amber-500/15 text-amber-400",
      Expired: "bg-rose-500/15 text-rose-400",
      Pending: "bg-gray-700/50 text-gray-400",
    };
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] ?? colors.Pending}`}>
        {status}
      </span>
    );
  }

  function handleDiscard() {
    setForm({
      name: driver?.name ?? "",
      phone: driver?.phone ?? "",
      licenseNumber: driver?.licenseNumber ?? "",
      idProof: driver?.idProof ?? "",
      licenseStatus: driver?.licenseStatus ?? "Reviewing",
      idProofStatus: driver?.idProofStatus ?? "Pending",
      photoUrl: driver?.photoUrl ?? "",
    });
    setPhotoFile(null);
    setPhotoPreview(driver?.photoUrl ?? "");
    setErrors({});
    setPhotoUploadError(null);
    setIsEditing(false);
  }

  async function handleSaveAndView() {
    await handleSave();
    // Only close edit mode if save didn't leave validation errors
    setIsEditing((prev) => {
      // errors state isn't updated yet in this tick; handleSave sets them
      // We rely on handleSave's own guard — if it returned early, errors are set
      return prev; // let the effect below handle it
    });
  }

  // Close edit mode after a successful save (errors will be empty)
  useEffect(() => {
    if (!saving && Object.keys(errors).length === 0 && driver) {
      setIsEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving]);

  return (
    <div className="space-y-6">
      {/* ── Profile Card ───────────────────────────────── */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-white">Driver Profile</h3>
          {driver && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/drivers/${driver.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-600/50 text-blue-400 hover:bg-blue-500/10 text-xs font-medium transition-colors"
              >
                View Full Profile
              </button>
              <button
                onClick={openAddAssistant}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600/50 text-emerald-400 hover:bg-emerald-500/10 text-xs font-medium transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Assistant
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-xs font-medium transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Centered avatar + name */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="relative">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Driver"
                className="h-24 w-24 rounded-full object-cover border-2 border-gray-700"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 border-2 border-gray-700">
                <User className="h-10 w-10" />
              </div>
            )}
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                title="Change photo"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />

          <div className="text-center">
            <p className="text-base font-semibold text-white">
              {form.name || driver?.name || "No driver assigned"}
            </p>
            {driver && (
              <p className="text-xs text-gray-500 mt-0.5">
                ID: {driver.id.slice(0, 8).toUpperCase()}
              </p>
            )}
            {photoFile && (
              <p className="text-xs text-blue-400 mt-1">Photo selected — will save on submit</p>
            )}
          </div>

          <div className="flex gap-2">
            {driver && (
              <button
                onClick={handleRemoveDriver}
                className="px-4 py-1.5 rounded-lg border border-gray-700 text-gray-300 text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-xs font-medium text-white transition-colors"
            >
            <Upload className="h-3 w-3" />
              Upload New
            </button>
          </div>
        </div>

        {/* ── View mode: read-only info ─────────────────── */}
        {!isEditing && driver && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-800">
            <div>
              <p className="text-xs text-gray-500 mb-1">Driver Name</p>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <User className="h-4 w-4 text-gray-500 shrink-0" />
                {driver.name || "—"}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                {driver.phone || "—"}
              </div>
            </div>
          </div>
        )}

        {/* ── Edit mode: name + phone fields ───────────── */}
        {isEditing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Driver Name <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500 shrink-0" />
                <input
                  placeholder="Enter driver name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`flex-1 h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors ${
                    errors.name ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-rose-400 pl-6">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Mobile Number <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  className={`flex-1 h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors ${
                    errors.phone ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-rose-400 pl-6">{errors.phone}</p>}
            </div>
          </div>
        )}
      </div>

      {/* ── Documents & Licenses ────────────────────────── */}
      {/* View mode */}
      {!isEditing && driver && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Documents & Licenses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FileText className="h-4 w-4" />
                <span>License Details</span>
                {statusBadge(driver.licenseStatus)}
              </div>
              <p className="text-sm font-mono text-gray-200 pl-6">
                {driver.licenseNumber || "—"}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="h-4 w-4" />
                <span>ID Proof</span>
                {statusBadge(driver.idProofStatus)}
              </div>
              <p className="text-sm text-gray-200 pl-6">
                {driver.idProof || "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit mode */}
      {isEditing && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Documents & Licenses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FileText className="h-4 w-4" />
                  License Details <span className="text-rose-400">*</span>
                </div>
                {statusBadge(form.licenseStatus)}
              </div>
              <input
                placeholder="e.g. MH0420210012345"
                value={form.licenseNumber}
                onChange={(e) => handleChange("licenseNumber", e.target.value.toUpperCase())}
                className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none font-mono focus:ring-1 transition-colors ${
                  errors.licenseNumber ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {errors.licenseNumber && <p className="text-xs text-rose-400">{errors.licenseNumber}</p>}
              <select
                value={form.licenseStatus}
                onChange={(e) => handleChange("licenseStatus", e.target.value as typeof form.licenseStatus)}
                className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Verified">Verified</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield className="h-4 w-4" />
                  ID Proof <span className="text-gray-600 text-xs">(optional)</span>
                </div>
                {statusBadge(form.idProofStatus)}
              </div>
              <input
                placeholder="e.g. Aadhaar / PAN number"
                value={form.idProof}
                onChange={(e) => handleChange("idProof", e.target.value)}
                className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors ${
                  errors.idProof ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {errors.idProof && <p className="text-xs text-rose-400">{errors.idProof}</p>}
              <select
                value={form.idProofStatus}
                onChange={(e) => handleChange("idProofStatus", e.target.value as typeof form.idProofStatus)}
                className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Verified">Verified</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Actions (edit mode only) ─────────────────────── */}
      {isEditing && (
        <>
          {photoUploadError && (
            <p className="text-xs text-amber-400 text-right">{photoUploadError}</p>
          )}
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={handleDiscard}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSaveAndView}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </>
      )}

      {/* ── Assistant Drivers ──────────────────────────────── */}
      {driver && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Assistant Drivers</h3>
            <button
              onClick={openAddAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Assistant
            </button>
          </div>

          {loadingAssistants ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          ) : assistants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 rounded-xl border border-dashed border-gray-700 text-gray-500 text-xs gap-2">
              <User className="h-6 w-6 opacity-40" />
              No assistant drivers yet
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assistants.map((a) => (
                <div key={a.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className="flex items-start gap-3">
                    {a.photoUrl ? (
                      <img src={a.photoUrl} alt={a.name} className="h-10 w-10 rounded-full object-cover border border-gray-600 shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-gray-500 shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-white truncate">{a.name}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => openEditAssistant(a)} className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-500/10 hover:text-blue-400 transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeleteAssistantTarget(a.id)} className="p-1.5 rounded-lg text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Phone className="h-3 w-3 shrink-0" />{a.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <CreditCard className="h-3 w-3 shrink-0" />
                          <span className="font-mono">{a.licenseNumber}</span>
                        </div>
                        {a.idProof && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FileText className="h-3 w-3 shrink-0" />{a.idProof}
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
      )}

      {/* ── Delete Assistant Confirmation ─────────────────── */}
      {deleteAssistantTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Remove Assistant Driver</h2>
            <p className="text-sm text-gray-400">
              Are you sure you want to remove{" "}
              <span className="text-gray-200">{assistants.find((a) => a.id === deleteAssistantTarget)?.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteAssistantTarget(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={handleAssistantDelete} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm font-medium text-white transition-colors">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Assistant Modal ─────────────────────── */}
      {showAssistantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleAssistantSubmit}
            noValidate
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editAssistant ? "Edit Assistant Driver" : "Add Assistant Driver"}
              </h2>
              <button
                type="button"
                onClick={() => { setShowAssistantModal(false); setEditAssistant(null); setAssistantErrors({}); }}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Photo */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {assistantPhotoPreview ? (
                    <img src={assistantPhotoPreview} alt="Preview" className="h-20 w-20 rounded-full object-cover border-2 border-gray-700" />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-500">
                      <User className="h-9 w-9" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => assistantFileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => assistantFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-xs font-medium transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {assistantPhotoPreview ? "Change Photo" : "Upload Photo"}
                </button>
                <input ref={assistantFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAssistantPhotoSelect} />
                {assistantPhotoFile && <p className="text-xs text-blue-400">Photo selected — will save on submit</p>}
                {assistantPhotoUploadError && <p className="text-xs text-rose-400">{assistantPhotoUploadError}</p>}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  value={assistantForm.name}
                  onChange={(e) => handleAssistantChange("name", e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors ${assistantErrors.name ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {assistantErrors.name && <p className="mt-1 text-xs text-rose-400">{assistantErrors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Mobile Number <span className="text-rose-400">*</span></label>
                <input
                  type="tel"
                  value={assistantForm.phone}
                  onChange={(e) => handleAssistantChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors ${assistantErrors.phone ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {assistantErrors.phone && <p className="mt-1 text-xs text-rose-400">{assistantErrors.phone}</p>}
              </div>

              {/* License */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">License Number <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  value={assistantForm.licenseNumber}
                  onChange={(e) => handleAssistantChange("licenseNumber", e.target.value.toUpperCase())}
                  placeholder="e.g. MH0420210012345"
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors font-mono ${assistantErrors.licenseNumber ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {assistantErrors.licenseNumber && <p className="mt-1 text-xs text-rose-400">{assistantErrors.licenseNumber}</p>}
              </div>

              {/* ID Proof */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">ID Proof Number <span className="text-gray-500 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={assistantForm.idProof}
                  onChange={(e) => handleAssistantChange("idProof", e.target.value)}
                  placeholder="e.g. Aadhaar / PAN number"
                  className={`w-full h-10 px-3 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors ${assistantErrors.idProof ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {assistantErrors.idProof && <p className="mt-1 text-xs text-rose-400">{assistantErrors.idProof}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={assistantSubmitting}
              className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
            >
              {assistantSubmitting ? "Saving…" : editAssistant ? "Save Changes" : "Add Assistant"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ── City Search Component ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

interface NominatimResult {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
  };
}

interface CitySearchProps {
  value: string;
  onChange: (city: string) => void;
  placeholder: string;
  hasError?: boolean;
}

function CitySearch({ value, onChange, placeholder, hasError }: CitySearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value changes (e.g. when editing an existing trip)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const fetchCities = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q
      )}&countrycodes=in&limit=8&format=json&addressdetails=1`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "en" },
      });
      const data: NominatimResult[] = await res.json();
      const cities = data
        .map((item) => {
          const a = item.address;
          const city =
            a.city || a.town || a.village || a.municipality || a.county || "";
          const state = a.state || "";
          return city ? (state ? `${city}, ${state}` : city) : "";
        })
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i);
      setResults(cities);
      setOpen(cities.length > 0);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(q: string) {
    setQuery(q);
    onChange(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCities(q), 400);
  }

  function select(city: string) {
    setQuery(city);
    onChange(city);
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={`w-full h-10 pl-8 pr-8 rounded-lg bg-gray-800 border text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 transition-colors ${
            hasError
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
              : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
          }`}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-11 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
          {results.map((city, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                select(city);
              }}
              className="w-full px-3 py-2.5 text-sm text-left text-gray-200 hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ── Trip Tab ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

interface TripTabProps {
  vehicleId: string;
  trips: ReturnType<typeof useAppContext>["trips"];
  addTrip: ReturnType<typeof useAppContext>["addTrip"];
  updateTrip: ReturnType<typeof useAppContext>["updateTrip"];
  deleteTrip: ReturnType<typeof useAppContext>["deleteTrip"];
}

type TripFormErrors = {
  from?: string;
  to?: string;
};

function TripTab({ vehicleId, trips, addTrip, updateTrip, deleteTrip }: TripTabProps) {
  const [editingTrip, setEditingTrip] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [tripErrors, setTripErrors] = useState<TripFormErrors>({});
  const [tripSaving, setTripSaving] = useState(false);
  const [viewEditForm, setViewEditForm] = useState<{
    date: string; from: string; to: string;
    loadWeight: number; totalAmount: number;
    lines: TripLine[]; status: "In Progress" | "Completed";
  } | null>(null);
  const [viewEditFormTripId, setViewEditFormTripId] = useState<string | null>(null);
  const [viewLineLocks, setViewLineLocks] = useState<Array<null | "spent" | "received">>([]);
  const [viewSaving, setViewSaving] = useState(false);
  const [formLineLocks, setFormLineLocks] = useState<Array<null | "spent" | "received">>([null]);

  // Sort oldest→newest so Trip #1 is oldest, highest # is newest
  const sortedTrips = [...trips].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  function getTripNumber(tripId: string) {
    const idx = sortedTrips.findIndex((t) => t.id === tripId);
    return idx === -1 ? "?" : idx + 1;
  }

  function initViewForm(tripId: string) {
    const t = trips.find((tr) => tr.id === tripId);
    if (!t) return;
    const lines = t.lines.length ? t.lines : [{ detail: "", spent: 0, received: 0 }];
    setViewEditForm({
      date: t.date, from: t.from, to: t.to,
      loadWeight: t.loadWeight, totalAmount: t.totalAmount,
      lines, status: t.status as "In Progress" | "Completed",
    });
    setViewEditFormTripId(tripId);
    setViewLineLocks(lines.map(() => null));
  }

  function openView(tripId: string) {
    initViewForm(tripId);
    if (!openTabs.includes(tripId)) {
      setOpenTabs((prev) => [...prev, tripId]);
    }
    setActiveTab(tripId);
    setShowForm(false);
  }

  function closeTab(tripId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setOpenTabs((prev) => prev.filter((id) => id !== tripId));
    if (activeTab === tripId) setActiveTab("list");
  }

  const emptyForm = {
    date: new Date().toISOString().split("T")[0],
    from: "",
    to: "",
    loadWeight: 0,
    totalAmount: 0,
    lines: [{ detail: "Fuel", spent: 0, received: 0 }] as TripLine[],
    status: "In Progress" as const,
  };

  const [form, setForm] = useState(emptyForm);

  function openNew() {
    setEditingTrip(null);
    setForm(emptyForm);
    setTripErrors({});
    setFormLineLocks([null]);
    setShowForm(true);
  }


  function validateTrip(): boolean {
    const errs: TripFormErrors = {};
    if (!form.from.trim()) errs.from = "Origin city is required.";
    if (!form.to.trim()) errs.to = "Destination city is required.";
    if (Object.keys(errs).length > 0) {
      setTripErrors(errs);
      return false;
    }
    return true;
  }

  async function handleSave() {
    if (!validateTrip()) return;
    setTripSaving(true);
    try {
      if (editingTrip) {
        await updateTrip({ id: editingTrip, vehicleId, ...form });
      } else {
        await addTrip({ vehicleId, ...form });
      }
      setShowForm(false);
      setEditingTrip(null);
      setTripErrors({});
    } finally {
      setTripSaving(false);
    }
  }

  async function handleComplete(tripId: string) {
    const t = trips.find((tr) => tr.id === tripId);
    if (!t) return;
    await updateTrip({ ...t, status: "Completed" });
  }

  function addLine() {
    setForm({ ...form, lines: [...form.lines, { detail: "", spent: 0, received: 0 }] });
    setFormLineLocks(prev => [...prev, null]);
  }

  function updateLine(index: number, field: keyof TripLine, value: string | number) {
    const updated = form.lines.map((l, i) =>
      i === index ? { ...l, [field]: value } : l
    );
    setForm({ ...form, lines: updated });
  }

  function removeLine(index: number) {
    setForm({ ...form, lines: form.lines.filter((_, i) => i !== index) });
    setFormLineLocks(prev => prev.filter((_, i) => i !== index));
  }

  function handleFormLineBlur(lineIdx: number, field: "spent" | "received") {
    const value = form.lines[lineIdx]?.[field] ?? 0;
    const otherField = field === "spent" ? "received" : "spent";
    setFormLineLocks(prev => {
      const updated = [...prev];
      updated[lineIdx] = value > 0 ? otherField : null;
      return updated;
    });
  }

  function handleViewLineBlur(lineIdx: number, field: "spent" | "received") {
    if (!viewEditForm) return;
    const value = viewEditForm.lines[lineIdx]?.[field] ?? 0;
    const otherField = field === "spent" ? "received" : "spent";
    setViewLineLocks(prev => {
      const updated = [...prev];
      updated[lineIdx] = value > 0 ? otherField : null;
      return updated;
    });
  }

  function updateViewLine(index: number, field: keyof TripLine, value: string | number) {
    setViewEditForm(prev => {
      if (!prev) return prev;
      const updated = prev.lines.map((l, i) => i === index ? { ...l, [field]: value } : l);
      return { ...prev, lines: updated };
    });
  }

  function addViewLine() {
    setViewEditForm(prev => {
      if (!prev) return prev;
      return { ...prev, lines: [...prev.lines, { detail: "", spent: 0, received: 0 }] };
    });
    setViewLineLocks(prev => [...prev, null]);
  }

  function removeViewLine(index: number) {
    setViewEditForm(prev => {
      if (!prev) return prev;
      return { ...prev, lines: prev.lines.filter((_, i) => i !== index) };
    });
    setViewLineLocks(prev => prev.filter((_, i) => i !== index));
  }

  async function handleViewSave() {
    if (!viewEditForm || !activeTab || activeTab === "list") return;
    setViewSaving(true);
    try {
      await updateTrip({ id: activeTab, vehicleId, ...viewEditForm });
    } finally {
      setViewSaving(false);
    }
  }

  function handleViewDiscard() {
    if (activeTab && activeTab !== "list") {
      initViewForm(activeTab);
    }
  }

  const totalSpent = form.lines.reduce((s, l) => s + l.spent, 0);
  const totalReceived = form.lines.reduce((s, l) => s + l.received, 0);

  function formatCurrency(n: number) {
    return "₹" + n.toLocaleString("en-IN");
  }

  // ── Tab bar (always rendered) ────────────────────────────
  const tabBar = (
    <div className="flex items-center border-b border-gray-800 overflow-x-auto scrollbar-none">
      {/* Trips list tab */}
      <button
        onClick={() => { setActiveTab("list"); setShowForm(false); }}
        className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors shrink-0 ${
          activeTab === "list" && !showForm
            ? "border-blue-500 text-white"
            : "border-transparent text-gray-500 hover:text-gray-300"
        }`}
      >
        All Trips
      </button>

      {/* Open trip tabs */}
      {openTabs.map((tabId) => {
        const trip = trips.find((t) => t.id === tabId);
        if (!trip) return null;
        const isActive = activeTab === tabId && !showForm;
        return (
          <div
            key={tabId}
            onClick={() => {
              if (viewEditFormTripId !== tabId) initViewForm(tabId);
              setActiveTab(tabId);
              setShowForm(false);
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              isActive
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <span>Trip #{getTripNumber(tabId)}</span>
            <button
              onClick={(e) => closeTab(tabId, e)}
              className={`rounded hover:bg-gray-700 p-0.5 transition-colors ${
                isActive ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-400"
              }`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}

      {/* Add new trip */}
      <button
        onClick={openNew}
        className="flex items-center justify-center px-3 py-2.5 text-gray-500 hover:text-gray-300 border-b-2 border-transparent transition-colors shrink-0"
        title="Add Trip"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );

  // ── Form view ───────────────────────────────────────────
  if (showForm) {
    return (
      <div className="space-y-0">
        {tabBar}
        <div className="pt-5 space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 sm:p-6 space-y-5">
            <h3 className="text-sm font-semibold text-white">
              {editingTrip ? "Edit Trip" : "New Trip"}
            </h3>

            {/* Date */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Trip Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full sm:w-64 h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Route */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Route Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    From <span className="text-rose-400">*</span>
                  </label>
                  <CitySearch
                    value={form.from}
                    onChange={(city) => {
                      setForm({ ...form, from: city });
                      setTripErrors((prev) => ({ ...prev, from: undefined }));
                    }}
                    placeholder="Search origin city…"
                    hasError={!!tripErrors.from}
                  />
                  {tripErrors.from && (
                    <p className="mt-1 text-xs text-rose-400">{tripErrors.from}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    To <span className="text-rose-400">*</span>
                  </label>
                  <CitySearch
                    value={form.to}
                    onChange={(city) => {
                      setForm({ ...form, to: city });
                      setTripErrors((prev) => ({ ...prev, to: undefined }));
                    }}
                    placeholder="Search destination city…"
                    hasError={!!tripErrors.to}
                  />
                  {tripErrors.to && (
                    <p className="mt-1 text-xs text-rose-400">{tripErrors.to}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Cargo & Logistics */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Cargo & Logistics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Load Weight (KG)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.loadWeight || ""}
                    onChange={(e) => setForm({ ...form, loadWeight: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.totalAmount || ""}
                    onChange={(e) => setForm({ ...form, totalAmount: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Financial Details
              </h4>
              <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400">
                      <th className="px-4 py-2.5 text-left font-medium">Details</th>
                      <th className="px-4 py-2.5 text-right font-medium">Money Spent</th>
                      <th className="px-4 py-2.5 text-right font-medium">Money Received</th>
                      <th className="px-4 py-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.lines.map((line, i) => (
                      <tr key={i} className="border-b border-gray-700 last:border-0">
                        <td className="px-4 py-2">
                          <input
                            placeholder="e.g. Fuel, Advance Payment"
                            value={line.detail}
                            onChange={(e) => updateLine(i, "detail", e.target.value)}
                            className="w-full h-8 px-2 rounded bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            placeholder="0"
                            value={line.spent || ""}
                            disabled={formLineLocks[i] === "spent"}
                            onChange={(e) => updateLine(i, "spent", Number(e.target.value))}
                            onBlur={() => handleFormLineBlur(i, "spent")}
                            className="w-full h-8 px-2 rounded bg-gray-800 border border-gray-700 text-sm text-gray-200 text-right placeholder-gray-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            placeholder="0"
                            value={line.received || ""}
                            disabled={formLineLocks[i] === "received"}
                            onChange={(e) => updateLine(i, "received", Number(e.target.value))}
                            onBlur={() => handleFormLineBlur(i, "received")}
                            className="w-full h-8 px-2 rounded bg-gray-800 border border-gray-700 text-sm text-gray-200 text-right placeholder-gray-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          {form.lines.length > 1 && (
                            <button
                              onClick={() => removeLine(i)}
                              className="text-gray-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={addLine}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors w-full border-t border-gray-700"
                >
                  <Plus className="h-3 w-3" />
                  Add More Lines
                </button>
              </div>
              <div className="flex justify-end gap-6 mt-3 text-sm">
                <span className="text-gray-400">
                  Total Spent:{" "}
                  <span className="text-rose-400 font-medium">{formatCurrency(totalSpent)}</span>
                </span>
                <span className="text-gray-400">
                  Total Received:{" "}
                  <span className="text-emerald-400 font-medium">{formatCurrency(totalReceived)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={() => { setShowForm(false); setEditingTrip(null); setTripErrors({}); }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={tripSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
            >
              {tripSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {tripSaving ? "Saving…" : "Save Trip Details"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Trip Detail tab content ─────────────────────────────
  const viewTrip = trips.find((t) => t.id === activeTab);
  if (activeTab !== "list" && viewTrip) {
    const isCompleted = viewTrip.status === "Completed";
    const vf = viewEditFormTripId === activeTab ? viewEditForm : null;

    if (!vf) {
      return (
        <div className="space-y-0">
          {tabBar}
          <div className="pt-5 text-center text-sm text-gray-500">Loading…</div>
        </div>
      );
    }

    const vfSpent = vf.lines.reduce((s, l) => s + l.spent, 0);
    const vfReceived = vf.lines.reduce((s, l) => s + l.received, 0);
    const vfNet = vfReceived - vfSpent;

    return (
      <div className="space-y-0">
        {tabBar}
        <div className="pt-5 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-white">
                {viewTrip.from} → {viewTrip.to}
              </h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                viewTrip.status === "Completed"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-amber-500/15 text-amber-400"
              }`}>
                {viewTrip.status}
              </span>
            </div>
            <div className="flex gap-2">
              {!isCompleted && (
                <button
                  onClick={() => handleComplete(viewTrip.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition-colors"
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => deleteTrip(viewTrip.id)}
                className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {isCompleted && (
            <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400">
              This trip is completed and cannot be edited.
            </div>
          )}

          {/* Trip Info */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <p className="text-xs text-gray-500 mb-4 font-semibold uppercase tracking-wider">Trip Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Trip Date</label>
                <input
                  type="date"
                  value={vf.date}
                  disabled={isCompleted}
                  onChange={(e) => setViewEditForm({ ...vf, date: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Load Weight (KG)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={vf.loadWeight || ""}
                  disabled={isCompleted}
                  onChange={(e) => setViewEditForm({ ...vf, loadWeight: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                {isCompleted ? (
                  <input value={vf.from} disabled className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none opacity-60 cursor-not-allowed" />
                ) : (
                  <CitySearch
                    value={vf.from}
                    onChange={(city) => setViewEditForm({ ...vf, from: city })}
                    placeholder="Search origin city…"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                {isCompleted ? (
                  <input value={vf.to} disabled className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none opacity-60 cursor-not-allowed" />
                ) : (
                  <CitySearch
                    value={vf.to}
                    onChange={(city) => setViewEditForm({ ...vf, to: city })}
                    placeholder="Search destination city…"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={vf.totalAmount || ""}
                  disabled={isCompleted}
                  onChange={(e) => setViewEditForm({ ...vf, totalAmount: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Financial Details</p>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="px-4 py-2.5 text-left font-medium">Details</th>
                    <th className="px-4 py-2.5 text-right font-medium">Money Spent</th>
                    <th className="px-4 py-2.5 text-right font-medium">Money Received</th>
                    <th className="px-4 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {vf.lines.map((line, i) => (
                    <tr key={i} className="border-b border-gray-700 last:border-0">
                      <td className="px-4 py-2">
                        <input
                          placeholder="e.g. Fuel, Advance Payment"
                          value={line.detail}
                          disabled={isCompleted}
                          onChange={(e) => updateViewLine(i, "detail", e.target.value)}
                          className="w-full h-8 px-2 rounded bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={line.spent || ""}
                          disabled={isCompleted || viewLineLocks[i] === "spent"}
                          onChange={(e) => updateViewLine(i, "spent", Number(e.target.value))}
                          onBlur={() => !isCompleted && handleViewLineBlur(i, "spent")}
                          className="w-full h-8 px-2 rounded bg-gray-800 border border-gray-700 text-sm text-gray-200 text-right placeholder-gray-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={line.received || ""}
                          disabled={isCompleted || viewLineLocks[i] === "received"}
                          onChange={(e) => updateViewLine(i, "received", Number(e.target.value))}
                          onBlur={() => !isCompleted && handleViewLineBlur(i, "received")}
                          className="w-full h-8 px-2 rounded bg-gray-800 border border-gray-700 text-sm text-gray-200 text-right placeholder-gray-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        {!isCompleted && vf.lines.length > 1 && (
                          <button onClick={() => removeViewLine(i)} className="text-gray-500 hover:text-rose-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!isCompleted && (
                <button
                  onClick={addViewLine}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors w-full border-t border-gray-700"
                >
                  <Plus className="h-3 w-3" />
                  Add More Lines
                </button>
              )}
            </div>
            <div className="flex justify-end gap-6 mt-3 text-sm">
              <span className="text-gray-400">Total Spent: <span className="text-rose-400 font-medium">{formatCurrency(vfSpent)}</span></span>
              <span className="text-gray-400">Total Received: <span className="text-emerald-400 font-medium">{formatCurrency(vfReceived)}</span></span>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Financial Summary</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                <p className="text-base font-bold text-rose-400">{formatCurrency(vfSpent)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Received</p>
                <p className="text-base font-bold text-emerald-400">{formatCurrency(vfReceived)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Net Profit / Loss</p>
                <p className={`text-base font-bold ${vfNet >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {vfNet >= 0 ? "+" : ""}{formatCurrency(vfNet)}
                </p>
              </div>
            </div>
          </div>

          {/* Save / Discard */}
          {!isCompleted && (
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={handleViewDiscard}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleViewSave}
                disabled={viewSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
              >
                {viewSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {viewSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Trip List tab content ───────────────────────────────
  return (
    <div className="space-y-0">
      {tabBar}
      <div className="pt-5 space-y-3">
        {trips.length === 0 ? (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
            <MapPin className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No trips recorded for this vehicle yet.</p>
          </div>
        ) : (
          trips.map((t) => {
            const spent = t.lines.reduce((s, l) => s + l.spent, 0);
            const received = t.lines.reduce((s, l) => s + l.received, 0);
            return (
              <div
                key={t.id}
                className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white">
                        {t.from} → {t.to}
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
                    <p className="text-xs text-gray-500">
                      {new Date(t.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {t.loadWeight.toLocaleString("en-IN")} kg ·{" "}
                      {formatCurrency(t.totalAmount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-rose-400">Spent: {formatCurrency(spent)}</span>
                    <span className="text-emerald-400">Received: {formatCurrency(received)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openView(t.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors"
                      >
                        View
                      </button>
                      {t.status !== "Completed" && (
                        <button
                          onClick={() => handleComplete(t.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => deleteTrip(t.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
