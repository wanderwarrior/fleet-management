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
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { TripLine } from "../context/AppContext";

type Tab = "driver" | "trips";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    vehicles,
    drivers,
    trips,
    updateVehicle,
    deleteVehicle,
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
                {vehicle.name || vehicle.truckNumber}
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
                Plate:{" "}
                <span className="text-gray-300 font-mono">
                  {vehicle.plateNumber || vehicle.truckNumber}
                </span>
              </span>
              <span>
                Odometer:{" "}
                <span className="text-gray-300">
                  {(vehicle.odometer ?? 0).toLocaleString("en-IN")} km
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={async () => {
              await deleteVehicle(vehicle.id);
              navigate("/");
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-sm font-medium transition-colors self-start"
          >
            <Trash2 className="h-4 w-4" />
            Delete Vehicle
          </button>
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
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-xs font-medium transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
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
  const [tripErrors, setTripErrors] = useState<TripFormErrors>({});
  const [tripSaving, setTripSaving] = useState(false);

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
    setShowForm(true);
  }

  function openEdit(tripId: string) {
    const t = trips.find((tr) => tr.id === tripId);
    if (!t) return;
    setEditingTrip(t.id);
    setForm({
      date: t.date,
      from: t.from,
      to: t.to,
      loadWeight: t.loadWeight,
      totalAmount: t.totalAmount,
      lines: t.lines.length ? t.lines : [{ detail: "", spent: 0, received: 0 }],
      status: t.status as typeof form.status,
    });
    setTripErrors({});
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
    setForm({
      ...form,
      lines: [...form.lines, { detail: "", spent: 0, received: 0 }],
    });
  }

  function updateLine(index: number, field: keyof TripLine, value: string | number) {
    const updated = form.lines.map((l, i) =>
      i === index ? { ...l, [field]: value } : l
    );
    setForm({ ...form, lines: updated });
  }

  function removeLine(index: number) {
    setForm({ ...form, lines: form.lines.filter((_, i) => i !== index) });
  }

  const totalSpent = form.lines.reduce((s, l) => s + l.spent, 0);
  const totalReceived = form.lines.reduce((s, l) => s + l.received, 0);

  function formatCurrency(n: number) {
    return "₹" + n.toLocaleString("en-IN");
  }

  if (showForm) {
    return (
      <div className="space-y-6">
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
                <label className="block text-xs text-gray-500 mb-1">
                  Load Weight (KG)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.loadWeight || ""}
                  onChange={(e) =>
                    setForm({ ...form, loadWeight: Number(e.target.value) })
                  }
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Total Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.totalAmount || ""}
                  onChange={(e) =>
                    setForm({ ...form, totalAmount: Number(e.target.value) })
                  }
                  className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Financial Details Table */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Financial Details
            </h4>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="px-4 py-2.5 text-left font-medium">Details</th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Money Spent
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Money Received
                    </th>
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
                          onChange={(e) =>
                            updateLine(i, "spent", Number(e.target.value))
                          }
                          className="w-full h-8 px-2 rounded bg-gray-800 border border-gray-700 text-sm text-gray-200 text-right placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={line.received || ""}
                          onChange={(e) =>
                            updateLine(i, "received", Number(e.target.value))
                          }
                          className="w-full h-8 px-2 rounded bg-gray-800 border border-gray-700 text-sm text-gray-200 text-right placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
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

            {/* Totals */}
            <div className="flex justify-end gap-6 mt-3 text-sm">
              <span className="text-gray-400">
                Total Spent:{" "}
                <span className="text-rose-400 font-medium">
                  {formatCurrency(totalSpent)}
                </span>
              </span>
              <span className="text-gray-400">
                Total Received:{" "}
                <span className="text-emerald-400 font-medium">
                  {formatCurrency(totalReceived)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => {
              setShowForm(false);
              setEditingTrip(null);
              setTripErrors({});
            }}
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
    );
  }

  // ── Trip List View ──────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Trips ({trips.length})
        </h3>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
          <MapPin className="h-10 w-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No trips recorded for this vehicle yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((t) => {
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
                    <span className="text-rose-400">
                      Spent: {formatCurrency(spent)}
                    </span>
                    <span className="text-emerald-400">
                      Received: {formatCurrency(received)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(t.id)}
                        className="px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-xs font-medium transition-colors"
                      >
                        Edit
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
          })}
        </div>
      )}
    </div>
  );
}
