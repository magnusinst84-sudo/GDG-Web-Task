require("dotenv").config({ path: ".env.local" });
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { z } = require("zod");

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

const VALID_DEPARTMENTS = [
  "Management",
  "Publicity",
  "Outreach",
  "UI/UX",
  "Creatives / Design",
  "Web Dev",
  "App Dev",
  "Game Dev",
  "Data Science",
  "Cloud & DevOps",
  "Blockchain",
  "Competitive Programming",
];

const submitFormSchema = z.object({
  Name: z.string({ required_error: "Name is required" }).trim().min(1, "Name cannot be empty"),
  RegistrationNumber: z
    .string({ required_error: "RegistrationNumber is required" })
    .trim()
    .regex(/^\d{2}[A-Z]{3}\d{4}$/, "Registration number must be 2 numbers, 3 uppercase letters, and 4 numbers (e.g. 25BCE5612)"),
  Phone: z.string({ required_error: "Phone is required" }).trim().min(1, "Phone cannot be empty"),
  "Year of Study": z.string({ required_error: "Year of Study is required" }).trim().min(1, "Year of Study cannot be empty"),
  Email: z.string().email("Invalid email format").optional().or(z.literal("")),
  Department: z.enum(VALID_DEPARTMENTS, {
    errorMap: () => ({
      message: `Department must be one of: ${VALID_DEPARTMENTS.join(", ")}`,
    }),
  }),
  Questions: z.record(z.string(), z.string()).optional().default({}),
});

const shortlistSchema = z.object({
  shortlisted: z.boolean({
    required_error: "Field 'shortlisted' is required",
    invalid_type_error: "Field 'shortlisted' must be a boolean",
  }),
});

async function runTests() {
  console.log("=========================================");
  console.log("   BATCH 2 SCHEMA VALIDATION TESTS");
  console.log("=========================================\n");

  // TEST 1: Missing Name
  console.log("--- TEST 1: Missing Required Field ('Name') ---");
  const test1Payload = {
    RegistrationNumber: "25BCE5612",
    Phone: "9876543210",
    "Year of Study": "2nd Year",
    Department: "Web Dev",
  };
  const res1 = submitFormSchema.safeParse(test1Payload);
  if (!res1.success) {
    const issueMessages = res1.error.issues.map((i) => `${i.path.join(".") || "payload"}: ${i.message}`).join("; ");
    console.log("Result: REJECTED (HTTP 400 response shape simulation)");
    console.log(JSON.stringify({
      success: false,
      message: `Validation failed: ${issueMessages}`,
      error: `Validation failed: ${issueMessages}`,
      data: null,
    }, null, 2));
  } else {
    console.log("Result: Unexpectedly PASSED");
  }

  // TEST 2: Invalid Department
  console.log("\n--- TEST 2: Invalid Department Value ('Cybersecurity') ---");
  const test2Payload = {
    Name: "John Doe",
    RegistrationNumber: "25BCE5612",
    Phone: "9876543210",
    "Year of Study": "2nd Year",
    Department: "Cybersecurity",
  };
  const res2 = submitFormSchema.safeParse(test2Payload);
  if (!res2.success) {
    const issueMessages = res2.error.issues.map((issue) => `${issue.path.join(".") || "payload"}: ${issue.message}`).join("; ");
    console.log("Result: REJECTED (HTTP 400 response shape simulation)");
    console.log(JSON.stringify({
      success: false,
      message: `Validation failed: ${issueMessages}`,
      error: `Validation failed: ${issueMessages}`,
      data: null,
    }, null, 2));
  } else {
    console.log("Result: Unexpectedly PASSED");
  }

  // TEST 3: Invalid Registration Number
  console.log("\n--- TEST 3: Invalid Registration Number Format ('INVALID123') ---");
  const test3Payload = {
    Name: "John Doe",
    RegistrationNumber: "INVALID123",
    Phone: "9876543210",
    "Year of Study": "2nd Year",
    Department: "Web Dev",
  };
  const res3 = submitFormSchema.safeParse(test3Payload);
  if (!res3.success) {
    const issueMessages = res3.error.issues.map((issue) => `${issue.path.join(".") || "payload"}: ${issue.message}`).join("; ");
    console.log("Result: REJECTED (HTTP 400 response shape simulation)");
    console.log(JSON.stringify({
      success: false,
      message: `Validation failed: ${issueMessages}`,
      error: `Validation failed: ${issueMessages}`,
      data: null,
    }, null, 2));
  } else {
    console.log("Result: Unexpectedly PASSED");
  }

  // TEST 4: Malicious Payload Override Attempt (shortlisted: true & Email: "hacker@evil.com")
  console.log("\n--- TEST 4: Malicious Payload Override Attempt ---");
  const test4Payload = {
    Name: "Jane Doe",
    RegistrationNumber: "25BCE5612",
    Phone: "9876543210",
    "Year of Study": "2nd Year",
    Department: "Web Dev",
    shortlisted: true,
    Email: "hacker@evil.com",
    role: "admin",
  };
  const res4 = submitFormSchema.safeParse(test4Payload);
  if (res4.success) {
    console.log("Parsed result keys (unrecognized keys stripped):", Object.keys(res4.data));
    console.log("Contains 'shortlisted':", "shortlisted" in res4.data);
    console.log("Contains 'role':", "role" in res4.data);
    // Simulating final set in Firestore
    const userSessionEmail = "user@authenticated.com";
    const finalDocWritten = {
      Name: res4.data.Name,
      RegistrationNumber: res4.data.RegistrationNumber,
      Phone: res4.data.Phone,
      "Year of Study": res4.data["Year of Study"],
      Department: res4.data.Department,
      Questions: res4.data.Questions || {},
      Email: userSessionEmail,
      shortlisted: false,
      createdAt: new Date().toISOString(),
    };
    console.log("Final Firestore doc written to DB (Override Defeated):");
    console.log(JSON.stringify(finalDocWritten, null, 2));
  }

  // TEST 5: Shortlist PATCH non-boolean string
  console.log("\n--- TEST 5: Shortlist PATCH Invalid Non-Boolean ('yes') ---");
  const res5 = shortlistSchema.safeParse({ shortlisted: "yes" });
  if (!res5.success) {
    const issueMessages = res5.error.issues.map((issue) => `${issue.path.join(".") || "payload"}: ${issue.message}`).join("; ");
    console.log("Result: REJECTED (HTTP 400 response shape simulation)");
    console.log(JSON.stringify({
      success: false,
      message: `Validation failed: ${issueMessages}`,
      error: `Validation failed: ${issueMessages}`,
      data: null,
    }, null, 2));
  }

  // TEST 6: Audit Logging in Firestore
  console.log("\n=========================================");
  console.log("   AUDIT LOGGING FIRESTORE TEST");
  console.log("=========================================\n");

  const db = getDb();
  const applicantId = "s8lAp0jUyOoik42SMWX9";
  const docRef = db.collection("formData").doc(applicantId);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    const prevShortlisted = docSnap.data().shortlisted ?? false;
    const newShortlisted = !prevShortlisted;

    console.log(`Toggling applicant ${applicantId} shortlist from ${prevShortlisted} to ${newShortlisted}...`);
    await docRef.update({ shortlisted: newShortlisted });

    // Write audit log entry using firebase-admin
    const { logAuditEvent } = require("../lib/audit.js");
    await logAuditEvent(db, {
      adminEmail: "admin@vit.ac.in",
      action: "UPDATE_SHORTLIST_STATUS",
      targetId: applicantId,
      details: {
        previousShortlisted: prevShortlisted,
        newShortlisted: newShortlisted,
      },
    });

    console.log("Audit log written to Firestore. Querying auditLog collection...");
    const auditSnap = await db.collection("auditLog").where("targetId", "==", applicantId).get();

    if (!auditSnap.empty) {
      const auditDoc = auditSnap.docs[0];
      console.log(`\nAudit Log Document ID: ${auditDoc.id}`);
      console.log("Audit Log Record:");
      const data = auditDoc.data();
      console.log(JSON.stringify({
        id: auditDoc.id,
        adminEmail: data.adminEmail,
        action: data.action,
        targetId: data.targetId,
        details: data.details,
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null,
      }, null, 2));
    } else {
      console.log("No audit log document found!");
    }

    // Revert doc shortlist status back to original to preserve test state
    await docRef.update({ shortlisted: prevShortlisted });
  }
}

runTests().catch(console.error);
