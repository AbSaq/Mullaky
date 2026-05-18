import type { Request, Response } from "express";
import { firestore } from "../config/firebase.js";

export const getDashboardOverview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const role = req.user?.role;
    const buildingId = req.query.buildingId as string;

    if (!uid || !role) {
      res.status(401).json({ message: "Unauthorized token payload match." });
      return;
    }

    // ── ADMIN ROLE METRICS AGGREGATION ──
    if (role === "admin") {
      const [buildingsSnap, usersSnap, alertsSnap] = await Promise.all([
        firestore.collection("buildings").get(),
        firestore.collection("users").get(),
        firestore.collection("alerts").get(),
      ]);

      const recentActivity = [
        {
          type: "resolved",
          text: "Issue resolved: Elevator Floor 3",
          time: "2 min ago",
        },
        {
          type: "warning",
          text: "New alert: Water leak Apt 14B",
          time: "15 min ago",
        },
        {
          type: "user",
          text: "New user registered: Sara Ahmed",
          time: "1 hr ago",
        },
        {
          type: "finance",
          text: "Finance ledger matrix updated: May 2026",
          time: "3 hr ago",
        },
        {
          type: "building",
          text: "New building added: Al Noor Tower",
          time: "1 day ago",
        },
      ];

      const buildingsList = buildingsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      res.status(200).json({
        role: "admin",
        stats: {
          buildings: buildingsSnap.size,
          users: usersSnap.size,
          alerts: alertsSnap.size,
          finances: 0,
        },
        buildingsData: buildingsList,
        recentActivity,
      });
      return;
    }

    // Require building context validation check for operational business dashboard frames
    if (!buildingId) {
      res
        .status(400)
        .json({ message: "Missing buildingId initialization query filter." });
      return;
    }

    // Verify user membership validity match
    const membershipCheck = await firestore
      .collection("memberships")
      .where("userId", "==", uid)
      .where("buildingId", "==", buildingId)
      .get();

    if (membershipCheck.empty) {
      res
        .status(403)
        .json({ message: "Access forbidden to target infrastructure node." });
      return;
    }

    // ── OPERATIONAL CONSOLIDATED PIPELINE QUERY MAP (OWNER & USER) ──
    const [
      buildingDoc,
      residentsSnap,
      alertsSnap,
      maintenanceSnap,
      financesSnap,
    ] = await Promise.all([
      firestore.collection("buildings").doc(buildingId).get(),
      firestore
        .collection("memberships")
        .where("buildingId", "==", buildingId)
        .get(),
      firestore
        .collection("alerts")
        .where("buildingId", "==", buildingId)
        .get(),
      firestore
        .collection("maintenance")
        .where("buildingId", "==", buildingId)
        .get(),
      firestore
        .collection("finances")
        .where("buildingId", "==", buildingId)
        .get(),
    ]);

    const residents = residentsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    const allAlerts = alertsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const maintenance = maintenanceSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    const finances = financesSnap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
    }));
    // Sort operations securely inside the isolated memory allocation layers
    allAlerts.sort(
      (a: any, b: any) =>
        (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0),
    );
    finances.sort(
      (a: any, b: any) =>
        (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0),
    );

    res.status(200).json({
      role,
      building: { id: buildingDoc.id, ...buildingDoc.data() },
      stats: {
        residents: residents.length,
        alerts: allAlerts.length,
        maintenance: maintenance.filter(
          (m: any) => m.status === "pending" || m.status === "in-progress",
        ).length,
        finances: finances[0]?.totalCollected || 0,
      },
      residents: role === "owner" ? residents : undefined, // Encapsulate data visibility matrices cleanly
      recentAlerts: allAlerts.slice(0, 5),
      maintenanceRequests:
        role === "user"
          ? maintenance.filter(
              (m: any) => m.userId === uid || m.visibility === "public",
            )
          : maintenance,
      latestFinance: finances[0] || null,
    });
  } catch (error) {
    console.error("Dashboard engine cluster failure:", error);
    res
      .status(500)
      .json({ message: "Internal metrics resolution server failure." });
  }
};
