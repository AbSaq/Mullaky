import { Router } from "express";
import {
  getBuildingSelectionData,
  handleInvitationAction,
} from "../controllers/building.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createBuildingInvitation,
  getBuildingResidents,
  getSentBuildingInvitations,
  removeResidentMembership,
} from "../controllers/resident.controller.js";

import {
  getBuildingMaintenance,
  createMaintenanceRequest,
  updateMaintenanceStatus,
  deleteMaintenanceRequest,
} from "../controllers/maintenance.controller.js";

import {
  createOwnerExpenseReport,
  deleteOwnerExpenseReport,
  getBuildingFinanceLedger,
  recordRentPayment,
} from "../controllers/finance.controller.js";

import {
  getBuildingAlerts,
  broadcastBuildingAlert,
  deleteBuildingAlert,
} from "../controllers/alert.controller.js";

const router = Router();

router.get("/selection", requireAuth, getBuildingSelectionData);
router.post("/invitation-action", requireAuth, handleInvitationAction);

router.get("/:buildingId/residents", requireAuth, getBuildingResidents);
router.delete(
  "/:buildingId/residents/:membershipId",
  requireAuth,
  removeResidentMembership,
);
router.get("/:buildingId/invitations", requireAuth, getSentBuildingInvitations);
router.post("/:buildingId/invitations", requireAuth, createBuildingInvitation);

router.get("/:buildingId/maintenance", requireAuth, getBuildingMaintenance);
router.post("/:buildingId/maintenance", requireAuth, createMaintenanceRequest);
router.patch(
  "/:buildingId/maintenance/:requestId/status",
  requireAuth,
  updateMaintenanceStatus,
);
router.delete(
  "/:buildingId/maintenance/:requestId",
  requireAuth,
  deleteMaintenanceRequest,
);

router.get("/:buildingId/finances", requireAuth, getBuildingFinanceLedger);
router.post("/:buildingId/finances/pay", requireAuth, recordRentPayment);

router.get("/:buildingId/alerts", requireAuth, getBuildingAlerts);
router.post("/:buildingId/alerts", requireAuth, broadcastBuildingAlert);
router.delete("/:buildingId/alerts/:alertId", requireAuth, deleteBuildingAlert);

router.post(
  "/:buildingId/finances/report",
  requireAuth,
  createOwnerExpenseReport,
);
router.delete(
  "/:buildingId/finances/report/:reportId",
  requireAuth,
  deleteOwnerExpenseReport,
);

export default router;
