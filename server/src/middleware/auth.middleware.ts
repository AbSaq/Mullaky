import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest, User } from "../types/index.js";

const secret: string = process.env.JWT_SECRET ?? "fallback_development_secret";

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res
      .status(401)
      .json({ message: "Access Denied: Bearer token is missing or malformed" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded as unknown as User;

    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
