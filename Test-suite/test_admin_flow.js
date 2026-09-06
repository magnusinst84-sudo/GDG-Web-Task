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

async function testAdminFlow() {
  console.log("=== Testing Admin Auth & Endpoints ===");

  const fetch = (await import("node-fetch")).default;
  const email = `admin_real_${Date.now()}@example.com`;
  const password = "AdminPassword123!";
  const name = "Real Admin User";

  // 1. Sign Up
  const signupRes = await fetch("http://localhost:3000/api/auth/sign-up/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const cookies = signupRes.headers.raw()["set-cookie"];
  const cookieHeader = cookies.map((c) => c.split(";")[0]).join("; ");

  // 2. Promote user to admin in Firestore
  const db = getDb();
  const userQuery = await db.collection("user").where("email", "==", email).get();
  if (!userQuery.empty) {
    const userDoc = userQuery.docs[0];
    await userDoc.ref.update({ role: "admin" });
    console.log(`Promoted ${email} to admin role.`);
  }

  // 3. GET /api/admin/applicants with admin cookie
  const getRes = await fetch("http://localhost:3000/api/admin/applicants", {
    headers: { "Cookie": cookieHeader },
  });
  const getJson = await getRes.json();
  console.log(`3. GET /api/admin/applicants: Status ${getRes.status}, count: ${getJson.applicants?.length}`);

  if (getJson.applicants && getJson.applicants.length > 0) {
    const applicantId = getJson.applicants[0]._id;
    const initialShortlist = getJson.applicants[0].shortlisted;

    // 4. PATCH /api/shortlist/[id]
    const patchRes = await fetch(`http://localhost:3000/api/shortlist/${applicantId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      body: JSON.stringify({ shortlisted: !initialShortlist }),
    });
    console.log(`4. PATCH /api/shortlist/${applicantId}: Status ${patchRes.status}`);

    // Verify update in Firestore
    const updatedApplicantDoc = await db.collection("applications").doc(applicantId).get();
    console.log(`Firestore updated shortlisted field: ${updatedApplicantDoc.data()?.shortlisted} (Expected: ${!initialShortlist})`);
  }

  // 5. POST /api/send-email
  const mailRes = await fetch("http://localhost:3000/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
    },
    body: JSON.stringify({
      recipients: [{ Email: "recipient@example.com", Name: "Recipient" }],
      payloadData: { subject: "Test Invitation", body: "<p>Hello</p>", mailType: "Interview Invite" },
    }),
  });
  const mailJson = await mailRes.json();
  console.log(`5. POST /api/send-email: Status ${mailRes.status}, response:`, mailJson);
}

testAdminFlow().catch(console.error);
