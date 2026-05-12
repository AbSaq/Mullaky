import { useEffect, useState } from "react";
import { firestore } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export function useAlerts(buildingId: string) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!buildingId) return;

    // Get last seen time from localStorage
    const lastSeen = localStorage.getItem(`alerts_seen_${buildingId}`);
    const lastSeenTime = lastSeen ? Number(lastSeen) : 0;

    // Real-time listener
    const q = query(
      collection(firestore, "alerts"),
      where("buildingId", "==", buildingId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds);
      setAlerts(list);

      // Count unread
      const unread = list.filter((a: any) =>
        a.createdAt?.seconds * 1000 > lastSeenTime
      ).length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [buildingId]);

  const markAllRead = () => {
    localStorage.setItem(`alerts_seen_${buildingId}`, Date.now().toString());
    setUnreadCount(0);
  };

  return { alerts, unreadCount, markAllRead };
}