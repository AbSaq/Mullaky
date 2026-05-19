import type { Request, Response } from "express";
import { firestore } from "../config/firebase.js";
import admin from "firebase-admin";

export const deleteBuildingAlert = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId, alertId } = req.params;
    const uid = req.user?.uid;
    const jwtRole = req.user?.role;

    if (jwtRole !== "admin") {
      const membershipSnap = await firestore
        .collection("memberships")
        .where("userId", "==", uid)
        .where("buildingId", "==", buildingId)
        .get();

      const membershipRole = membershipSnap.docs[0]?.data()?.role;
      if (membershipRole !== "owner") {
        res.status(403).json({ message: "Forbidden." });
        return;
      }
    }

    await firestore.collection("alerts").doc(alertId as string).delete();
    res.status(200).json({ message: "Alert removed." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete alert." });
  }
};

export const getBuildingAlerts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId } = req.params;
    const uid = req.user?.uid;

    const membershipSnap = await firestore
      .collection("memberships")
      .where("userId", "==", uid)
      .where("buildingId", "==", buildingId)
      .get();
    const membershipRole = membershipSnap.docs[0]?.data()?.role;
    const isAuthority = membershipRole === "owner" || req.user?.role === "admin";

    const snapshot = await firestore
      .collection("alerts")
      .where("buildingId", "==", buildingId)
      .get();

    let alerts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];

    // Residents only see public alerts + their own private alerts
    if (!isAuthority) {
      alerts = alerts.filter(
        (a) => a.visibility !== "private" || a.userId === uid,
      );
    }

    alerts.sort(
      (a: any, b: any) =>
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
    );

    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to load building notifications." });
  }
};

export const broadcastBuildingAlert = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId } = req.params;
    const { title, content, type, visibility = "public" } = req.body;
    const uid = req.user?.uid;

    const membershipSnap = await firestore
      .collection("memberships")
      .where("userId", "==", uid)
      .where("buildingId", "==", buildingId)
      .get();
    const membershipRole = membershipSnap.docs[0]?.data()?.role;
    const isAuthority = membershipRole === "owner" || req.user?.role === "admin";

    // Residents can only submit "info" type
    if (!isAuthority && type !== "info") {
      res.status(403).json({ message: "Residents can only submit info notices." });
      return;
    }

    const userDoc = await firestore.collection("users").doc(uid!).get();
    const userName = userDoc.data()?.fullName || "Resident";

    const newAlertRef = firestore.collection("alerts").doc();
    const newAlert = {
      buildingId,
      title,
      content,
      type,
      visibility, // "public" | "private"
      userId: uid,
      userName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await newAlertRef.set(newAlert);
    res.status(201).json({ id: newAlertRef.id, ...newAlert });
  } catch (error) {
    res.status(500).json({ message: "Failed to dispatch network announcement." });
  }
};
