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
    const { invitationId, action } = req.body; // action: 'accept' | 'decline'

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
