import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest, User } from "../types/types.js";

const secret = process.env.JWT_SECRET || "fallback_development_secret";

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, secret) as User;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
