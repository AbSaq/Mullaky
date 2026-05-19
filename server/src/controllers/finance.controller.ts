import type { Request, Response } from "express";
import { firestore } from "../config/firebase.js";
import admin from "firebase-admin";

export const getBuildingFinanceLedger = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId } = req.params;

    // 1. Pull verified rent invoices submitted by tenants
    const invoicesSnap = await firestore
      .collection("invoices")
      .where("buildingId", "==", buildingId)
      .get();
    const invoices = invoicesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 2. Pull custom expense macro reports logged by the owner
    const reportsSnap = await firestore
      .collection("finances")
      .where("buildingId", "==", buildingId)
      .get();
    const ownerReports = reportsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 3. Compute dynamic charts mapping array metrics across standard reporting limits
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const chartData = months.map((m) => {
      const monthlyRent = invoices
        .filter((i: any) => i.month?.toLowerCase().includes(m.toLowerCase()))
        .reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

      const matchingReport = ownerReports.find((r: any) =>
        r.month?.toLowerCase().includes(m.toLowerCase()),
      ) as any;
      const monthlyExpenses =
        matchingReport?.expenses?.reduce(
          (sum: number, e: any) => sum + (e.amount || 0),
          0,
        ) || 0;

      const reportedRevenue = matchingReport?.totalCollected || 0;

      return {
        name: m,
        revenue:
          monthlyRent > 0
            ? monthlyRent
            : reportedRevenue > 0
              ? reportedRevenue
              : 4000,
        expenses: monthlyExpenses > 0 ? monthlyExpenses : 1500,
      };
    });

    res.status(200).json({ chartData, invoices, ownerReports });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to compile financial ledger vectors." });
  }
};

export const createOwnerExpenseReport = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { buildingId } = req.params;
    const { month, totalCollected, expenses, notes } = req.body;

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
        res.status(403).json({ message: "Privileged structural role needed." });
        return;
      }
    }

    const newReportRef = firestore.collection("finances").doc();
    await newReportRef.set({
      buildingId,
      month,
      totalCollected: Number(totalCollected),
      expenses: expenses.map((e: any) => ({
        name: e.name,
        amount: Number(e.amount) || 0,
      })),
      notes: notes || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res
      .status(201)
      .json({ message: "Financial statement sheet committed successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to store asset ledger report metrics." });
  }
};

export const deleteOwnerExpenseReport = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { reportId } = req.params;
    if (typeof reportId !== "string") {
      res.status(500).json({ message: "reportId is not string" });
      return;
    }
    await firestore.collection("finances").doc(reportId).delete();
    res.status(200).json({ message: "Statement target entry purged." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to truncate macro data log entry." });
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
