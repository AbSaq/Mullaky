import jwt from "jsonwebtoken";

import * as userModel from "../models/userModel.js";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

interface LoginCredentials {
  username: string;
  password: string;
}

export const login = async ({ username, password }: LoginCredentials) => {
  const user = await userModel.findByUsername(username);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.password !== password) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ username: user.username, name: user.name }, secret, {
    expiresIn: "1d",
  });

  return {
    message: "Login successful",
    token,
    user: {
      username: user.username,
      name: user.name,
    },
  };
};

export const getProfile = async (username: string) => {
  const user = await userModel.findByUsername(username);
  if (!user) throw new Error("User not found");
  return {
    username: user.username,
    name: user.name,
  };
};
