import { useEffect, useState } from "react";
import { auth, firestore } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export type Role = "admin" | "owner" | "user" | "";

export interface UserData {
  uid: string;
  fullName: string;
  email: string;
  role: Role;
  buildingId?: string;
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [role, setRole] = useState<Role>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const docSnap = await getDoc(doc(firestore, "users", firebaseUser.uid));
        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData({ ...data, uid: firebaseUser.uid });
          setRole(data.role);
        }
      } else {
        setUser(null);
        setUserData(null);
        setRole("");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userData, role, loading };
}