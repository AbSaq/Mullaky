import { Router } from "express";
import {
  getAllUsers,
  updateUserRole,
  assignBuildingOwner,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/users", requireAuth, getAllUsers);
router.post("/users/role", requireAuth, updateUserRole);
router.post("/buildings/assign", requireAuth, assignBuildingOwner);

export default router;
