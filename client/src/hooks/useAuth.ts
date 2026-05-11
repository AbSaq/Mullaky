import { useEffect, useState } from "react";
import { auth, firestore } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export type Role = "admin" | "owner" | "user" | "";

export interface UserData {
  uid: string;
  fullName: string;
  email: string;
  role: Role;
  buildingId?: string;
}

export interface Membership {
  id: string;
  userId: string;
  buildingId: string;
  buildingName: string;
  buildingAddress: string;
  role: "owner" | "user";
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [role, setRole] = useState<Role>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Get user data
        const docSnap = await getDoc(doc(firestore, "users", firebaseUser.uid));
        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData({ ...data, uid: firebaseUser.uid });
          setRole(data.role);
        }

        // Get memberships
        const membershipsSnap = await getDocs(
          query(collection(firestore, "memberships"), where("userId", "==", firebaseUser.uid))
        );
        const membershipsList = membershipsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Membership[];
        setMemberships(membershipsList);

      } else {
        setUser(null);
        setUserData(null);
        setMemberships([]);
        setRole("");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userData, role, memberships, loading };
}