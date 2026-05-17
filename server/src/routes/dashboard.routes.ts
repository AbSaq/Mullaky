import { Router } from "express";
import { getDashboardOverview } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/overview", requireAuth, getDashboardOverview);

export default router;
