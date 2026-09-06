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

async function run() {
  const db = getDb();
  console.log("=== USERS ===");
  const usersSnap = await db.collection("user").get();
  usersSnap.forEach(d => console.log(d.id, d.data()));

  console.log("\n=== SESSIONS ===");
  const sessionsSnap = await db.collection("session").get();
  sessionsSnap.forEach(d => console.log(d.id, d.data()));

  console.log("\n=== APPLICANTS (formData) ===");
  const formSnap = await db.collection("formData").limit(5).get();
  formSnap.forEach(d => console.log(d.id, d.data()));
}

run().catch(console.error);
