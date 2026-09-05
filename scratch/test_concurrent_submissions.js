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

const TEST_EMAIL = "concurrent_test_runner@vit.ac.in";
const TEST_PASSWORD = "Password123!@#";
const BASE_URL = "http://localhost:3000";

async function cleanupTestData(db) {
  const snapshot = await db.collection("formData").where("Email", "==", TEST_EMAIL).get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  // Also clean user and session docs for this email
  const userSnap = await db.collection("user").where("email", "==", TEST_EMAIL).get();
  userSnap.docs.forEach(async (uDoc) => {
    const sessSnap = await db.collection("session").where("userId", "==", uDoc.id).get();
    sessSnap.docs.forEach(sDoc => sDoc.ref.delete());
    await uDoc.ref.delete();
  });
}

async function obtainSessionCookie() {
  const headers = {
    "Content-Type": "application/json",
    Origin: BASE_URL,
  };

  const signUpRes = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: "Concurrent Test Runner",
    }),
  });

  const signUpBody = await signUpRes.json().catch(() => ({}));
  console.log("signUp status:", signUpRes.status, "body:", signUpBody);

  let cookies = signUpRes.headers.getSetCookie ? signUpRes.headers.getSetCookie() : [signUpRes.headers.get("set-cookie")];
  
  if (!cookies || !cookies.length || !cookies[0]) {
    const signInRes = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });
    const signInBody = await signInRes.json().catch(() => ({}));
    console.log("signIn status:", signInRes.status, "body:", signInBody);
    cookies = signInRes.headers.getSetCookie ? signInRes.headers.getSetCookie() : [signInRes.headers.get("set-cookie")];
  }

  return cookies.filter(Boolean).join("; ");
}

async function runConcurrencyTest() {
  console.log("=========================================");
  console.log("   CONCURRENT SUBMISSION CAP TEST");
  console.log("=========================================\n");

  const db = getDb();

  // 1. Initial cleanup
  await cleanupTestData(db);
  console.log(`Pre-cleaned existing records for ${TEST_EMAIL}`);

  // 2. Authenticate and get real session cookie
  console.log("Authenticating test user via better-auth endpoint...");
  const cookieHeader = await obtainSessionCookie();

  if (!cookieHeader) {
    console.error("Failed to obtain session cookie from better-auth!");
    return;
  }
  console.log("Obtained authenticated session cookie successfully.");

  // 3. Prepare 4 distinct concurrent payloads
  const departments = ["Management", "Publicity", "Outreach", "Web Dev"];
  const payloads = departments.map((dept) => ({
    Name: "Concurrent Tester",
    RegistrationNumber: "25BCE9999",
    Phone: "9999999999",
    "Year of Study": "3rd Year",
    Department: dept,
    Questions: {},
  }));

  console.log(`\nLaunching ${payloads.length} concurrent POST requests to /api/submit-form via Promise.all...\n`);

  const startTime = Date.now();
  const responses = await Promise.all(
    payloads.map((payload) =>
      fetch(`${BASE_URL}/api/submit-form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        const body = await res.json().catch(() => ({}));
        return {
          status: res.status,
          department: payload.Department,
          body,
        };
      })
    )
  );
  const duration = Date.now() - startTime;

  console.log(`All ${responses.length} concurrent requests finished in ${duration}ms.\n`);
  console.log("--- HTTP Response Summary ---");
  responses.forEach((r, idx) => {
    console.log(`Request ${idx + 1} (${r.department}): Status ${r.status} -> ${JSON.stringify(r.body)}`);
  });

  const successful = responses.filter((r) => r.status === 200 && r.body.success);
  const rejected = responses.filter((r) => r.status === 400 || !r.body.success);

  console.log(`\nResults: ${successful.length} succeeded, ${rejected.length} rejected.`);

  // 4. Inspect Firestore state
  console.log("\n--- Firestore Document Count Verification ---");
  const docSnapshot = await db.collection("formData").where("Email", "==", TEST_EMAIL).get();
  console.log(`Total documents found in Firestore for ${TEST_EMAIL}: ${docSnapshot.size}`);

  docSnapshot.docs.forEach((d) => {
    console.log(`- Doc ID: ${d.id} | Department: ${d.data().Department} | Shortlisted: ${d.data().shortlisted}`);
  });

  const passStatus = successful.length === 2 && rejected.length === 2 && docSnapshot.size === 2;
  console.log("\n=========================================");
  if (passStatus) {
    console.log("   CONCURRENCY TEST PASSED (Exact 2 Cap Held Under Concurrent Load)");
  } else {
    console.log("   CONCURRENCY TEST FAILED (Race Condition Detected)");
  }
  console.log("=========================================\n");

  // 5. Final cleanup
  console.log("Cleaning up test documents and test user from Firestore...");
  await cleanupTestData(db);
  console.log("Cleanup complete.");
}

runConcurrencyTest().catch(console.error);
