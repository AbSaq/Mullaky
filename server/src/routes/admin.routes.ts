import { Router } from "express";
import {
  getAllUsers,
  updateUserRole,
  assignBuildingOwner,
  removeBuildingOwner,
} from "../controllers/admin.controller.js";

import {
  createBuilding,
  updateBuilding,
  deleteBuilding,
  getBuildingOperationalDetails,
} from "../controllers/building.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/users", requireAuth, getAllUsers);
router.post("/users/role", requireAuth, updateUserRole);
router.post("/buildings/assign", requireAuth, assignBuildingOwner);
router.post("/buildings/remove-owner", requireAuth, removeBuildingOwner);

router.post("/buildings", requireAuth, createBuilding);
router.put("/buildings/:id", requireAuth, updateBuilding);
router.delete("/buildings/:id", requireAuth, deleteBuilding);
router.get(
  "/buildings/:id/details",
  requireAuth,
  getBuildingOperationalDetails,
);

export default router;
