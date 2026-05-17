import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!admin.apps || !admin.apps.length) {
  try {
    const serviceAccountPath = path.resolve(
      __dirname,
      "../../serviceAccountKey.json",
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });

    console.log(
      "🚀 Firebase Admin SDK initialized successfully via local cert.",
    );
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error);
  }
}

export const auth: admin.auth.Auth = admin.auth();
export const firestore: admin.firestore.Firestore = admin.firestore();
