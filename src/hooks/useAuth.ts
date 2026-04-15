import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

export const logout = async () => {
  await signOut(auth);
};
import { auth } from "../services/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, uid: user?.uid ?? null, loading };
}
