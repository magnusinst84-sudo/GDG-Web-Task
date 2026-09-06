require("dotenv").config({ path: ".env.local" });
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

function getDb() {
  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "demo-DWASFW-rec";
  const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
  const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  const appOptions = { projectId: FIREBASE_PROJECT_ID };
  if (FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    appOptions.credential = cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY,
    });
  }

  const app = getApps()[0] || initializeApp(appOptions);
  return getFirestore(app);
}

async function setupAdminSession() {
  const db = getDb();
  const adminUserId = "test-admin-user-id";
  const adminToken = "test_admin_session_token_99999";
  const adminEmail = "admin_test@vit.ac.in";

  await db.collection("user").doc(adminUserId).set({
    id: adminUserId,
    email: adminEmail,
    name: "Admin Test User",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "admin",
  });

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.collection("session").doc(adminToken).set({
    id: adminToken,
    token: adminToken,
    userId: adminUserId,
    expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: "127.0.0.1",
    userAgent: "node-fetch",
  });

  console.log("Created admin user and session in Firestore.");
}

setupAdminSession().catch(console.error);
