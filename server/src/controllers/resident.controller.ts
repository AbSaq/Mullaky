import type { Request, Response } from "express";
import { firestore } from "../config/firebase.js";
import admin from "firebase-admin";

export const getBuildingResidents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId } = req.params;

    const membershipsSnap = await firestore
      .collection("memberships")
      .where("buildingId", "==", buildingId)
      .get();

    const residents = await Promise.all(
      membershipsSnap.docs.map(async (mDoc) => {
        const mData = mDoc.data();
        const uDoc = await firestore
          .collection("users")
          .doc(mData.userId)
          .get();
        const uData = uDoc.data();

        return {
          id: mDoc.id,
          userId: mData.userId,
          fullName: uData?.fullName || "Unknown User",
          email: uData?.email || "No Email Registered",
          role: mData.role || "user",
        };
      }),
    );

    res.status(200).json(residents);
  } catch (error) {
    console.error("Error retrieving building residents:", error);
    res.status(500).json({ message: "Failed to load occupant data lists." });
  }
};

export const removeResidentMembership = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId, membershipId } = req.params;

    if (req.user?.role !== "owner" && req.user?.role !== "admin") {
      res
        .status(403)
        .json({ message: "Unauthorized permission profile window." });
      return;
    }

    if (typeof membershipId !== "string") {
      return;
    }
    const membershipRef = firestore.collection("memberships").doc(membershipId);

    const mDoc = await membershipRef.get();

    if (!mDoc.exists || mDoc.data()?.buildingId !== buildingId) {
      res
        .status(404)
        .json({ message: "Target user membership record not found." });
      return;
    }

    await membershipRef.delete();
    res.status(200).json({
      message: "Occupant successfully removed from workspace records.",
    });
  } catch (error) {
    console.error("Error breaking resident link connection:", error);
    res
      .status(500)
      .json({ message: "Internal transaction write operation dropped." });
  }
};

export const getSentBuildingInvitations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId } = req.params;

    const snap = await firestore
      .collection("invitations")
      .where("buildingId", "==", buildingId)
      .get();

    const invitations = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    res.status(200).json(invitations);
  } catch (error) {
    console.error("Error reading invitation sequences:", error);
    res
      .status(500)
      .json({ message: "Failed to pull invitation tracking database maps." });
  }
};

export const createBuildingInvitation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId } = req.params;
    const { email } = req.body;

    if (req.user?.role !== "owner" && req.user?.role !== "admin") {
      res
        .status(403)
        .json({ message: "Action forbidden for standard tenant keys." });
      return;
    }

    // 1. Validate if the targeted target user exists inside our primary auth ledger table
    const userMatchSnap = await firestore
      .collection("users")
      .where("email", "==", email.trim().toLowerCase())
      .get();

    if (userMatchSnap.empty) {
      res.status(404).json({
        message:
          "No registered system user found matching this email. They must create an account first.",
      });
      return;
    }

    const targetUserDoc = userMatchSnap.docs[0];
    if (!targetUserDoc) {
      throw Error("target user does not exist.");
    }
    const targetUserId = targetUserDoc.id;

    // 2. Check if a duplicate pending invitation record already tracking this pair exists
    const duplicateCheck = await firestore
      .collection("invitations")
      .where("buildingId", "==", buildingId)
      .where("toUserId", "==", targetUserId)
      .where("status", "==", "pending")
      .get();

    if (!duplicateCheck.empty) {
      res.status(400).json({
        message:
          "An active invitation request tracking this account is already pending execution loops.",
      });
      return;
    }

    if (typeof buildingId !== "string") {
      return;
    }
    const buildingDoc = await firestore
      .collection("buildings")
      .doc(buildingId)
      .get();
    const buildingData = buildingDoc.data();

    // 3. Commit new tracking token directly down into the Firestore collections
    const newInvitationRef = firestore.collection("invitations").doc();
    await newInvitationRef.set({
      buildingId,
      buildingName: buildingData?.name || "Workspace Infrastructure",
      buildingAddress: buildingData?.address || "",
      toUserId: targetUserId,
      toUserEmail: email.trim().toLowerCase(),
      fromOwnerId: req.user.uid,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message:
        "Invitation verified and logged cleanly down the transport pipe.",
    });
  } catch (error) {
    console.error("Critical invitation processing drop:", error);
    res
      .status(500)
      .json({ message: "Ecosystem failure logging verification tokens." });
  }
};
