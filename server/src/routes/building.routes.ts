import { Router } from "express";
import {
  getBuildingSelectionData,
  handleInvitationAction,
} from "../controllers/building.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/selection", requireAuth, getBuildingSelectionData);
router.post("/invitation-action", requireAuth, handleInvitationAction);

export default router;
