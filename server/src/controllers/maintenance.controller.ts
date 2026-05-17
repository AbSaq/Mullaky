import type { Request, Response } from "express";
import { firestore } from "../config/firebase.js";
import admin from "firebase-admin";

export const getBuildingMaintenance = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId } = req.params;

    const snapshot = await firestore
      .collection("maintenance")
      .where("buildingId", "==", buildingId)
      .get();

    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load building maintenance workspace cards.",
    });
  }
};

export const createMaintenanceRequest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId } = req.params;
    const { title, description, category } = req.body;
    const uid = req.user?.uid;

    const userDoc = await firestore.collection("users").doc(uid!).get();
    const userName = userDoc.data()?.fullName || "Anonymous Resident";

    const newTicketRef = firestore.collection("maintenance").doc();
    const newTicket = {
      buildingId,
      title,
      description,
      category,
      status: "pending", // Baseline initialization state for Kanban maps
      userId: uid,
      userName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await newTicketRef.set(newTicket);
    res.status(201).json({ id: newTicketRef.id, ...newTicket });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to commit maintenance ticket metadata." });
  }
};

export const updateMaintenanceStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId, requestId } = req.params;
    const { status } = req.body; // pending | in-progress | resolved

    if (req.user?.role !== "owner" && req.user?.role !== "admin") {
      res.status(403).json({
        message: "Privileged access needed to shift task lane vectors.",
      });
      return;
    }

    if (typeof requestId !== "string") {
      console.log("requestId is not a string");
      throw Error("requestId is not a string");
    }
    const taskRef = firestore.collection("maintenance").doc(requestId);

    const taskDoc = await taskRef.get();

    if (!taskDoc.exists || taskDoc.data()?.buildingId !== buildingId) {
      res.status(404).json({
        message:
          "Target maintenance ticket not found on this infrastructure node.",
      });
      return;
    }

    await taskRef.update({ status });
    res
      .status(200)
      .json({ message: "Kanban board board lane index updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to transition workflow column state." });
  }
};
