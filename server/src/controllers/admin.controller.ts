import type { Request, Response } from "express";
import { firestore } from "../config/firebase.js";
import admin from "firebase-admin";

export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (req.user?.role !== "admin") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const snap = await firestore.collection("users").get();
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (req.user?.role !== "admin") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { userId, role } = req.body;
    await firestore.collection("users").doc(userId).update({ role });
    res.status(200).json({ message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role" });
  }
};

export const removeBuildingOwner = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (req.user?.role !== "admin") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { buildingId } = req.body;
    const batch = firestore.batch();

    const buildingRef = firestore.collection("buildings").doc(buildingId);
    const buildingDoc = await buildingRef.get();
    const ownerId = buildingDoc.data()?.ownerId;

    // Clear ownerId from building
    batch.update(buildingRef, { ownerId: admin.firestore.FieldValue.delete() });

    // Remove owner memberships for this building
    const memberships = await firestore
      .collection("memberships")
      .where("buildingId", "==", buildingId)
      .where("role", "==", "owner")
      .get();

    memberships.docs.forEach((d) => batch.delete(d.ref));

    // Reset user role and clear buildingId
    if (ownerId) {
      const userRef = firestore.collection("users").doc(ownerId);
      batch.update(userRef, {
        role: "user",
        buildingId: admin.firestore.FieldValue.delete(),
      });
    }

    await batch.commit();
    res.status(200).json({ message: "Owner removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove owner" });
  }
};

export const assignBuildingOwner = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (req.user?.role !== "admin") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { buildingId, ownerId } = req.body;
    const batch = firestore.batch();

    const buildingRef = firestore.collection("buildings").doc(buildingId);
    const userRef = firestore.collection("users").doc(ownerId);

    const buildingDoc = await buildingRef.get();
    const buildingData = buildingDoc.data();

    // Remove old owner memberships for this building
    const oldMemberships = await firestore
      .collection("memberships")
      .where("buildingId", "==", buildingId)
      .where("role", "==", "owner")
      .get();

    oldMemberships.docs.forEach((d) => batch.delete(d.ref));

    // Update building and user profiles
    batch.update(buildingRef, { ownerId });
    batch.update(userRef, { buildingId, role: "owner" });

    // Inject new owner membership document
    const membershipRef = firestore.collection("memberships").doc();
    batch.set(membershipRef, {
      userId: ownerId,
      buildingId,
      buildingName: buildingData?.name || "",
      buildingAddress: buildingData?.address || "",
      role: "owner",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
    res.status(200).json({ message: "Owner assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign owner" });
  }
};
