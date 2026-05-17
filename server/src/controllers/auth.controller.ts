import type { Response } from "express";
import type { AuthRequest } from "../types/types.js";
import * as authService from "../services/auth.service.js";

export const loginSync = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await authService.processLoginSync(req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const registerSync = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { email, password, fullName } = req.body;
    const result = await authService.processRegisterSync({
      email,
      password,
      fullName,
    });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const checkVerification = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await authService.checkEmailVerificationStatus(email);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const resendVerification = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    await authService.triggerVerificationEmailResend(email);
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getMeStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // If authMiddleware successfully executes, req.user payload properties will be populated
    if (!req.user) {
      res.status(200).json({ isAuthenticated: false, isVerified: false });
      return;
    }
    const result = await authService.getUserProfileStatus(req.user.uid);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(200).json({ isAuthenticated: false, isVerified: false });
  }
};
