import jwt from "jsonwebtoken";
import { auth, firestore } from "../config/firebase.js";

const secret = process.env.JWT_SECRET || "fallback_development_secret";
const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY || "";
if (!FIREBASE_WEB_API_KEY) {
  console.log("warning no firebase web api key");
}

interface LoginSyncPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export const processLoginSync = async ({
  email,
  password,
}: LoginSyncPayload) => {
  let localId: string;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error("Wrong email or password");
    }

    localId = data.localId;
  } catch (error) {
    throw new Error("Wrong email or password");
  }

  const firebaseUser = await auth.getUser(localId);

  if (!firebaseUser.emailVerified) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  const userDocRef = firestore.collection("users").doc(firebaseUser.uid);
  await userDocRef.set({ verified: true }, { merge: true });

  const docSnap = await userDocRef.get();
  if (!docSnap.exists) {
    throw new Error("User not found");
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

  // 3. Send verification email via Firebase REST API
  await sendVerificationEmail(newFirebaseUser.uid);

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
  const firebaseUser = await auth.getUserByEmail(email);
  await sendVerificationEmail(firebaseUser.uid);
};

const sendVerificationEmail = async (uid: string): Promise<void> => {
  const customToken = await auth.createCustomToken(uid);

  const signInRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_WEB_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  );
  const signInData = await signInRes.json();
  if (!signInRes.ok || signInData.error) {
    throw new Error("Failed to sign in with custom token");
  }

  const sendRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_WEB_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestType: "VERIFY_EMAIL",
        idToken: signInData.idToken,
      }),
    },
  );
  const sendData = await sendRes.json();
  if (!sendRes.ok || sendData.error) {
    throw new Error("Failed to send verification email");
  }
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
    user: {
      email: firebaseUser.email,
      fullName: userData.fullName || "",
      role,
    },
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
