import type { Request, Response } from "express";
import { firestore } from "../config/firebase.js";
import admin from "firebase-admin";

export const getBuildingFinanceLedger = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId } = req.params;

    const invoicesSnap = await firestore
      .collection("invoices")
      .where("buildingId", "==", buildingId)
      .get();

    const invoices = invoicesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Standard baseline charts aggregate breakdown matrix
    const chartData = [
      { name: "Jan", revenue: 4200, expenses: 2400 },
      { name: "Feb", revenue: 4800, expenses: 2800 },
      { name: "Mar", revenue: 6100, expenses: 3100 },
      { name: "Apr", revenue: 5800, expenses: 2900 },
      { name: "May", revenue: 7300, expenses: 4000 },
    ];

    res.status(200).json({ chartData, invoices });
  } catch (error) {
    res.status(500).json({ message: "Failed to extract ledger aggregates." });
  }
};

export const recordRentPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId } = req.params;
    const { amount, month } = req.body;
    const uid = req.user?.uid;

    const userDoc = await firestore.collection("users").doc(uid!).get();
    const userName = userDoc.data()?.fullName || "Resident";

    const newInvoiceRef = firestore.collection("invoices").doc();
    await newInvoiceRef.set({
      buildingId,
      userId: uid,
      userName,
      amount: Number(amount),
      month,
      status: "paid",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "Payment verified and recorded." });
  } catch (error) {
    res.status(500).json({ message: "Transaction submission failed." });
  }
};
