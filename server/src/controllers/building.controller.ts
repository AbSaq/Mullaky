import type { Request, Response } from "express";
import { firestore } from "../config/firebase.js";
import admin from "firebase-admin";

export const getBuildingSelectionData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const membershipsSnap = await firestore
      .collection("memberships")
      .where("userId", "==", uid)
      .get();

    const memberships = membershipsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const invitationsSnap = await firestore
      .collection("invitations")
      .where("toUserId", "==", uid)
      .where("status", "==", "pending")
      .get();

    const invitations = invitationsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ memberships, invitations });
  } catch (error) {
    console.error("Error fetching building selection data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const handleInvitationAction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { invitationId, action } = req.body;

    if (!uid) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const invitationRef = firestore.collection("invitations").doc(invitationId);
    const invitationDoc = await invitationRef.get();

    if (!invitationDoc.exists || invitationDoc.data()?.toUserId !== uid) {
      res.status(404).json({ message: "Invitation not found" });
      return;
    }

    if (action === "decline") {
      await invitationRef.update({ status: "declined" });
      res.status(200).json({ message: "Invitation declined successfully" });
      return;
    }

    if (action === "accept") {
      const invData = invitationDoc.data();
      const batch = firestore.batch();

      batch.update(invitationRef, { status: "accepted" });

      const newMembershipRef = firestore.collection("memberships").doc();
      batch.set(newMembershipRef, {
        userId: uid,
        buildingId: invData?.buildingId,
        buildingName: invData?.buildingName,
        buildingAddress: invData?.buildingAddress || "",
        role: "user",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();
      res.status(200).json({ message: "Invitation accepted successfully" });
      return;
    }

    res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error("Error handling invitation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createBuilding = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (req.user?.role !== "admin") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { name, address, floors, units } = req.body;
    const newBuildingRef = firestore.collection("buildings").doc();

    await newBuildingRef.set({
      name,
      address,
      floors: Number(floors) || 0,
      units: Number(units) || 0,
      ownerId: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res
      .status(201)
      .json({ id: newBuildingRef.id, message: "Building recorded." });
  } catch (error) {
    res.status(500).json({ message: "Failed to create building entry." });
  }
};

export const updateBuilding = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (req.user?.role !== "admin") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { id } = req.params;
    const { name, address, floors, units } = req.body;

    if (typeof id === "string") {
      await firestore
        .collection("buildings")
        .doc(id)
        .update({
          name,
          address,
          floors: Number(floors) || 0,
          units: Number(units) || 0,
        });
    }

    res.status(200).json({ message: "Building records updated." });
  } catch (error) {
    res.status(500).json({ message: "Failed to update building parameters." });
  }
};

export const deleteBuilding = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (req.user?.role !== "admin") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { id } = req.params;
    const batch = firestore.batch();

    if (typeof id === "string") {
      batch.delete(firestore.collection("buildings").doc(id));
    }

    const [memberships, invitations] = await Promise.all([
      firestore.collection("memberships").where("buildingId", "==", id).get(),
      firestore.collection("invitations").where("buildingId", "==", id).get(),
    ]);

    memberships.docs.forEach((d) => batch.delete(d.ref));
    invitations.docs.forEach((d) => batch.delete(d.ref));

    await batch.commit();
    res
      .status(200)
      .json({ message: "Building clean cascade delete complete." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to cascade delete workspace metrics." });
  }
};

export const getBuildingOperationalDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (req.user?.role !== "admin") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { id } = req.params;

    const [membershipsSnap, alertsSnap, maintenanceSnap] = await Promise.all([
      firestore.collection("memberships").where("buildingId", "==", id).get(),
      firestore.collection("alerts").where("buildingId", "==", id).get(),
      firestore.collection("maintenance").where("buildingId", "==", id).get(),
    ]);

    const residents = await Promise.all(
      membershipsSnap.docs.map(async (mDoc) => {
        const mData = mDoc.data();
        const uDoc = await firestore
          .collection("users")
          .doc(mData.userId)
          .get();
        return {
          id: mDoc.id,
          ...mData,
          fullName: uDoc.data()?.fullName,
          email: uDoc.data()?.email,
        };
      }),
    );

    const alerts = alertsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const maintenance = maintenanceSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    res.status(200).json({ residents, alerts, maintenance });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to resolve workspace details metadata." });
  }
};
