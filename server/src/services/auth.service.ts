import jwt from "jsonwebtoken";
import { auth, firestore } from "../config/firebase.js";

const secret = process.env.JWT_SECRET || "fallback_development_secret";

interface LoginSyncPayload {
  email: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export const processLoginSync = async ({ email }: LoginSyncPayload) => {
  const firebaseUser = await auth.getUserByEmail(email);

  if (!firebaseUser.emailVerified) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  const userDocRef = firestore.collection("users").doc(firebaseUser.uid);
  await userDocRef.set({ verified: true }, { merge: true });

  const docSnap = await userDocRef.get();
  if (!docSnap.exists) {
    throw new Error("USER_RECORD_NOT_FOUND");
  }

  const userData = docSnap.data();
  const role = userData?.role || "user";
  const targetRoute = await calculateTargetRoute(firebaseUser.uid, role);

  const token = jwt.sign(
    { uid: firebaseUser.uid, email: firebaseUser.email, role },
    secret,
    { expiresIn: "1d" },
  );

  return {
    message: "Authentication verified",
    token,
    targetRoute,
    user: {
      email: firebaseUser.email,
      fullName: userData?.fullName || "",
      role,
    },
  };
};

export const processRegisterSync = async ({
  email,
  password,
  fullName,
}: RegisterPayload) => {
  // 1. Write core user to Firebase credential block
  const newFirebaseUser = await auth.createUser({
    email,
    password,
    displayName: fullName,
  });

  // 2. Set base attributes inside accompanying database collection
  const userDocRef = firestore.collection("users").doc(newFirebaseUser.uid);
  await userDocRef.set({
    fullName,
    email,
    role: "user",
    verified: false,
    createdAt: new Date().toISOString(),
  });

  // 3. Auto-generate the link so developers can see it in terminal
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const link = await auth.generateEmailVerificationLink(email, {
    url: `${clientUrl}/login`,
  });
  console.log(`✉️ Verification link generated for new user ${email}: ${link}`);

  return { success: true };
};

export const checkEmailVerificationStatus = async (email: string) => {
  const firebaseUser = await auth.getUserByEmail(email);

  if (firebaseUser.emailVerified) {
    const userDocRef = firestore.collection("users").doc(firebaseUser.uid);
    await userDocRef.set({ verified: true }, { merge: true });
    return { verified: true };
  }

  return { verified: false };
};

export const triggerVerificationEmailResend = async (email: string) => {
  const actionCodeSettings = {
    url: `${process.env.CLIENT_URL || "http://localhost:5173"}/login`,
  };
  const link = await auth.generateEmailVerificationLink(
    email,
    actionCodeSettings,
  );
  console.log(`✉️ Verification link generated for ${email}: ${link}`);
  return link;
};

export const getUserProfileStatus = async (uid: string) => {
  const firebaseUser = await auth.getUser(uid);
  const userDoc = await firestore.collection("users").doc(uid).get();
  const userData = userDoc.data();

  if (!userData) {
    return { isAuthenticated: false, isVerified: false };
  }

  const role = userData.role || "user";
  const targetRoute = await calculateTargetRoute(uid, role);

  return {
    isAuthenticated: true,
    isVerified: firebaseUser.emailVerified,
    role,
    targetRoute,
  };
};

const calculateTargetRoute = async (
  uid: string,
  role: string,
): Promise<string> => {
  if (role === "admin") {
    return "/dashboard";
  }
  return "/select-building";
};
