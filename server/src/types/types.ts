import type { Request } from "express";

export type User = {
  uid: string;
  email: string;
  role: "user" | "owner" | "admin";
};

export interface AuthRequest extends Request {
  user?: User;
}
