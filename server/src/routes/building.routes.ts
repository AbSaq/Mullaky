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

export default router;
