import type { Request } from "express";

export type User = { username: string; name: string };
export interface AuthRequest extends Request {
  user?: User;
}
