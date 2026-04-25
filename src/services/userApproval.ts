import { doc, setDoc, getDoc, updateDoc, collection, getDocs, onSnapshot } from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  token: string;
  createdAt: string;
}

export async function createUserProfile(uid: string, email: string, name: string): Promise<void> {
  await setDoc(doc(db, "userProfiles", uid), {
    uid,
    email,
    name,
    status: "pending",
    token: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "userProfiles", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, "userProfiles"));
  return snap.docs.map((d) => d.data() as UserProfile);
}

export async function updateUserStatus(uid: string, status: "approved" | "rejected"): Promise<void> {
  await updateDoc(doc(db, "userProfiles", uid), { status });
}

export function subscribeToUserProfiles(
  onData: (users: UserProfile[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, "userProfiles"),
    (snap) => {
      const users = snap.docs.map((d) => d.data() as UserProfile);
      users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(users);
    },
    (err) => onError(err)
  );
}
