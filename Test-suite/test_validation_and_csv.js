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

async function runTests() {
  const db = getDb();
  const testUserId = "test-user-validation-id";
  const testToken = "test_validation_session_token_9999";
  const testEmail = "validation_test_user@vit.ac.in";

  // Clean existing test submission first if any
  const existingDocs = await db.collection("formData").where("Email", "==", testEmail).get();
  for (const doc of existingDocs.docs) {
    await doc.ref.delete();
  }

  // Create session doc
  await db.collection("user").doc(testUserId).set({
    id: testUserId,
    email: testEmail,
    name: "Validation Test User",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "user",
  });

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.collection("session").doc(testToken).set({
    id: testToken,
    token: testToken,
    userId: testUserId,
    expiresAt: expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const headers = {
    "Content-Type": "application/json",
    Cookie: `better-auth.session_token=${testToken}`,
    Authorization: `Bearer ${testToken}`,
  };

  console.log("--- TEST 1: Direct API submit with BLANK question answer ---");
  const blankPayload = {
    Name: "Validation Tester",
    RegistrationNumber: "25BCE9999",
    Phone: "9876543210",
    "Year of Study": "2nd Year",
    Email: testEmail,
    Department: "Publicity",
    Questions: {
      "Imagine ORG is hosting a technical event and registrations are lower than expected. What kind of publicity strategy would you use to increase participation?": "   ", // Blank spaces!
      "If you had to promote a technical workshop to students who know very little about the topic, how would you create content that makes them interested in attending?": "Proper answer here",
      "Which social media platform would you prioritize for promoting a college technical community, and what type of content would you create for it?": "Another proper answer"
    }
  };

  const res1 = await fetch("http://localhost:3000/api/submit-form", {
    method: "POST",
    headers,
    body: JSON.stringify(blankPayload),
  });

  const status1 = res1.status;
  const json1 = await res1.json();
  console.log("Status Code:", status1);
  console.log("Response:", JSON.stringify(json1, null, 2));

  console.log("\n--- TEST 2: Direct API submit with ALL questions VALID ---");
  const validPayload = {
    Name: "Validation Tester",
    RegistrationNumber: "25BCE9999",
    Phone: "9876543210",
    "Year of Study": "2nd Year",
    Email: testEmail,
    Department: "Publicity",
    Questions: {
      "Imagine ORG is hosting a technical event and registrations are lower than expected. What kind of publicity strategy would you use to increase participation?": "I would launch a targeted social media campaign and organize flash promos.",
      "If you had to promote a technical workshop to students who know very little about the topic, how would you create content that makes them interested in attending?": "I would use relatable memes and bite-sized video teasers to simplify concepts.",
      "Which social media platform would you prioritize for promoting a college technical community, and what type of content would you create for it?": "Instagram for visual reels and LinkedIn for professional announcements."
    }
  };

  const res2 = await fetch("http://localhost:3000/api/submit-form", {
    method: "POST",
    headers,
    body: JSON.stringify(validPayload),
  });

  const status2 = res2.status;
  const json2 = await res2.json();
  console.log("Status Code:", status2);
  console.log("Response:", JSON.stringify(json2, null, 2));
}

runTests().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
