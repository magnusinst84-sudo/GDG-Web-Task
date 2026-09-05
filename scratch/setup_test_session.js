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

async function setupTestUserAndSession() {
  const db = getDb();
  const testUserId = "test-user-concurrent-id";
  const testToken = "test_concurrent_session_token_12345";
  const testEmail = "concurrent_test_applicant@vit.ac.in";

  // Create user doc
  await db.collection("user").doc(testUserId).set({
    id: testUserId,
    email: testEmail,
    name: "Concurrent Test User",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "user",
  });

  // Create session doc
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.collection("session").doc(testToken).set({
    id: testToken,
    token: testToken,
    userId: testUserId,
    expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: "127.0.0.1",
    userAgent: "node-fetch",
  });

  console.log("Created test user and session in Firestore.");
  console.log("Cookie header to use:", `better-auth.session_token=${testToken}`);
}

setupTestUserAndSession().catch(console.error);
