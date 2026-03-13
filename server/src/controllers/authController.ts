import type { Request, Response } from "express";
import * as authService from "../services/authService.js";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err: any) {
    // Use : any or check instance of Error
    res.status(401).json({ message: err.message });
  }
};

export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const result = await authService.getProfile(req.user.username);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};
