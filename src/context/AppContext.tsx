import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
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

// ── Types ────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  name: string;
  truckNumber: string;
  type: string;
  model: string;
  plateNumber: string;
  odometer: number;
  status: "Active" | "Idle";
  routeStatus: "On Route" | "Available";
  driverId: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  idProof: string;
  licenseStatus: "Verified" | "Reviewing" | "Expired";
  idProofStatus: "Verified" | "Reviewing" | "Pending";
}

export interface TripLine {
  detail: string;
  spent: number;
  received: number;
}

export interface Trip {
  id: string;
  vehicleId: string;
  from: string;
  to: string;
  date: string;
  loadWeight: number;
  totalAmount: number;
  lines: TripLine[];
  status: "In Progress" | "Completed";
}

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  lastFour: string;
}

interface AppContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  bankAccounts: BankAccount[];
  loading: boolean;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Promise<void>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addDriver: (driver: Omit<Driver, "id">) => Promise<void>;
  updateDriver: (driver: Driver) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  addTrip: (trip: Omit<Trip, "id">) => Promise<void>;
  updateTrip: (trip: Trip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  addBankAccount: (account: Omit<BankAccount, "id">) => Promise<void>;
  updateBankAccount: (account: BankAccount) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

// ── Provider ─────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const { uid } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Collection refs ──────────────────────────────────────

  const vehiclesCol = uid ? collection(db, "users", uid, "vehicles") : null;
  const driversCol = uid ? collection(db, "users", uid, "drivers") : null;
  const tripsCol = uid ? collection(db, "users", uid, "trips") : null;
  const bankAccountsCol = uid ? collection(db, "users", uid, "bankAccounts") : null;

  // ── Fetch all data ───────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!vehiclesCol || !driversCol || !tripsCol || !bankAccountsCol) return;
    setLoading(true);
    const [vSnap, dSnap, tSnap, bSnap] = await Promise.all([
      getDocs(vehiclesCol),
      getDocs(driversCol),
      getDocs(tripsCol),
      getDocs(bankAccountsCol),
    ]);
    setVehicles(vSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Vehicle));
    setDrivers(dSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Driver));
    setTrips(tSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Trip));
    setBankAccounts(bSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as BankAccount));
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    if (uid) {
      fetchData();
    } else {
      setVehicles([]);
      setDrivers([]);
      setTrips([]);
      setBankAccounts([]);
      setLoading(false);
    }
  }, [uid, fetchData]);

  // ── Vehicles ─────────────────────────────────────────────

  async function addVehicle(vehicle: Omit<Vehicle, "id">) {
    if (!vehiclesCol) return;
    const ref = await addDoc(vehiclesCol, vehicle);
    setVehicles((prev) => [...prev, { id: ref.id, ...vehicle } as Vehicle]);
  }

  async function updateVehicle(vehicle: Vehicle) {
    if (!uid) return;
    const { id, ...data } = vehicle;
    await updateDoc(doc(db, "users", uid, "vehicles", id), data);
    setVehicles((prev) => prev.map((v) => (v.id === id ? vehicle : v)));
  }

  async function deleteVehicle(id: string) {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "vehicles", id));
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }

  // ── Drivers ──────────────────────────────────────────────

  async function addDriver(driver: Omit<Driver, "id">) {
    if (!driversCol) return;
    const ref = await addDoc(driversCol, driver);
    setDrivers((prev) => [...prev, { id: ref.id, ...driver } as Driver]);
  }

  async function updateDriver(driver: Driver) {
    if (!uid) return;
    const { id, ...data } = driver;
    await updateDoc(doc(db, "users", uid, "drivers", id), data);
    setDrivers((prev) => prev.map((d) => (d.id === id ? driver : d)));
  }

  async function deleteDriver(id: string) {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "drivers", id));
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  }

  // ── Trips ────────────────────────────────────────────────

  async function addTrip(trip: Omit<Trip, "id">) {
    if (!tripsCol) return;
    const ref = await addDoc(tripsCol, trip);
    setTrips((prev) => [{ id: ref.id, ...trip } as Trip, ...prev]);
  }

  async function updateTrip(trip: Trip) {
    if (!uid) return;
    const { id, ...data } = trip;
    await updateDoc(doc(db, "users", uid, "trips", id), data);
    setTrips((prev) => prev.map((t) => (t.id === id ? trip : t)));
  }

  async function deleteTrip(id: string) {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "trips", id));
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Bank Accounts ───────────────────────────────────────

  async function addBankAccount(account: Omit<BankAccount, "id">) {
    if (!bankAccountsCol) return;
    const ref = await addDoc(bankAccountsCol, account);
    setBankAccounts((prev) => [...prev, { id: ref.id, ...account } as BankAccount]);
  }

  async function updateBankAccount(account: BankAccount) {
    if (!uid) return;
    const { id, ...data } = account;
    await updateDoc(doc(db, "users", uid, "bankAccounts", id), data);
    setBankAccounts((prev) => prev.map((a) => (a.id === id ? account : a)));
  }

  async function deleteBankAccount(id: string) {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "bankAccounts", id));
    setBankAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <AppContext.Provider
      value={{
        vehicles, drivers, trips, bankAccounts, loading,
        addVehicle, updateVehicle, deleteVehicle,
        addDriver, updateDriver, deleteDriver,
        addTrip, updateTrip, deleteTrip,
        addBankAccount, updateBankAccount, deleteBankAccount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
