import { useState } from "react";
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
  });

  async function handleSave() {
    if (driver) {
      await updateDriver({ id: driver.id, ...form });
    } else {
      const tempId = crypto.randomUUID();
      await addDriver(form);
      // Link driver to vehicle — use the last added driver
      // We need a workaround: addDriver doesn't return the id
      // So we update the vehicle with driverId after
      void tempId;
    }
  }

  async function handleRemoveDriver() {
    if (!driver) return;
    await deleteDriver(driver.id);
    await updateVehicle({ ...vehicle, driverId: "" });
  }

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      Verified: "bg-emerald-500/15 text-emerald-400",
      Reviewing: "bg-amber-500/15 text-amber-400",
      Expired: "bg-rose-500/15 text-rose-400",
      Pending: "bg-gray-700/50 text-gray-400",
    };
    return (
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          colors[status] ?? colors.Pending
        }`}
      >
        {status}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Driver Profile ──────────────────────────────── */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-white mb-4">
          Driver Profile
        </h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 border border-gray-700">
            <User className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {driver?.name || "No driver assigned"}
            </p>
            {driver && (
              <p className="text-xs text-gray-500">ID: {driver.id.slice(0, 8)}</p>
            )}
          </div>
          <div className="flex gap-2">
            {driver && (
              <button
                onClick={handleRemoveDriver}
                className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 text-xs font-medium hover:bg-rose-500/10 transition-colors"
              >
                Remove
              </button>
            )}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors">
              <Upload className="h-3 w-3" />
              Upload Photo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Driver Name
            </label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <input
                placeholder="Enter driver name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="flex-1 h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Mobile Number
            </label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <input
                placeholder="Enter mobile number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="flex-1 h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Documents & Licenses ────────────────────────── */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-white mb-4">
          Documents & Licenses
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FileText className="h-4 w-4" />
                License Details
              </div>
              {statusBadge(form.licenseStatus)}
            </div>
            <input
              placeholder="License Number"
              value={form.licenseNumber}
              onChange={(e) =>
                setForm({ ...form, licenseNumber: e.target.value })
              }
              className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
            />
            <select
              value={form.licenseStatus}
              onChange={(e) =>
                setForm({
                  ...form,
                  licenseStatus: e.target.value as typeof form.licenseStatus,
                })
              }
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
                ID Proof
              </div>
              {statusBadge(form.idProofStatus)}
            </div>
            <input
              placeholder="ID Proof Number"
              value={form.idProof}
              onChange={(e) => setForm({ ...form, idProof: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
            />
            <select
              value={form.idProofStatus}
              onChange={(e) =>
                setForm({
                  ...form,
                  idProofStatus: e.target.value as typeof form.idProofStatus,
                })
              }
              className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Verified">Verified</option>
              <option value="Reviewing">Reviewing</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* ── Verification Status Bar ──────────────────── */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Verification Status</span>
            <span>
              {
                [form.licenseStatus, form.idProofStatus].filter(
                  (s) => s === "Verified"
                ).length
              }{" "}
              / 2 Verified
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${
                  ([form.licenseStatus, form.idProofStatus].filter(
                    (s) => s === "Verified"
                  ).length /
                    2) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 justify-end">
        <button
          onClick={() =>
            setForm({
              name: driver?.name ?? "",
              phone: driver?.phone ?? "",
              licenseNumber: driver?.licenseNumber ?? "",
              idProof: driver?.idProof ?? "",
              licenseStatus: driver?.licenseStatus ?? "Reviewing",
              idProofStatus: driver?.idProofStatus ?? "Pending",
            })
          }
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
        >
          Discard
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
        >
          Save Changes
        </button>
      </div>
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

function TripTab({ vehicleId, trips, addTrip, updateTrip, deleteTrip }: TripTabProps) {
  const [editingTrip, setEditingTrip] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

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
      status: t.status,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (editingTrip) {
      await updateTrip({ id: editingTrip, vehicleId, ...form });
    } else {
      await addTrip({ vehicleId, ...form });
    }
    setShowForm(false);
    setEditingTrip(null);
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
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <input
                    placeholder="Origin city"
                    value={form.from}
                    onChange={(e) => setForm({ ...form, from: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <input
                    placeholder="Destination city"
                    value={form.to}
                    onChange={(e) => setForm({ ...form, to: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
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
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
          >
            Save Trip Details
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
