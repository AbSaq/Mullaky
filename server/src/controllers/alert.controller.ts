import type { Request, Response } from "express";
import { firestore } from "../config/firebase.js";
import admin from "firebase-admin";

export const getBuildingAlerts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId } = req.params;

    const snapshot = await firestore
      .collection("alerts")
      .where("buildingId", "==", buildingId)
      .get();

    const alerts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort newest alerts to the top
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
    const { title, content, type } = req.body;
    const uid = req.user?.uid;

    if (req.user?.role !== "owner" && req.user?.role !== "admin") {
      res.status(403).json({
        message: "Forbidden: Only authorities can dispatch announcements.",
      });
      return;
    }

    const userDoc = await firestore.collection("users").doc(uid!).get();
    const userName = userDoc.data()?.fullName || "Management Node";

    const newAlertRef = firestore.collection("alerts").doc();
    const newAlert = {
      buildingId,
      title,
      content,
      type, // emergency | warning | info | maintenance
      userId: uid,
      userName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await newAlertRef.set(newAlert);
    res.status(201).json({ id: newAlertRef.id, ...newAlert });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to dispatch network announcement." });
  }
};
