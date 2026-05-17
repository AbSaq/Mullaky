import type { Request } from "express";

export type User = {
  uid: string;
  email: string;
  role: "user" | "owner" | "admin";
};

export interface AuthRequest extends Request {
  user?: User;
}

export interface Membership {
  id: string;
  userId: string;
  buildingId: string;
  buildingName: string;
  buildingAddress: string;
  role: "owner" | "user";
  createdAt: any;
}

export interface Invitation {
  id: string;
  toUserId: string;
  buildingId: string;
  buildingName: string;
  status: "pending" | "accepted" | "declined";
  createdAt: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        role: "user" | "owner" | "admin";
      };
    }
  }
}
