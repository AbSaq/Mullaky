import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// Public Authentication Endpoints
router.post("/login", authController.loginSync);
router.post("/register", authController.registerSync);
router.post("/check-verification", authController.checkVerification);
router.post("/resend-verification", authController.resendVerification);

// Guarded Identity Session Verification Endpoint
router.get("/me", authMiddleware, authController.getMeStatus);

export default router;
