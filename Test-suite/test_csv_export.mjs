import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { CSV_Header } from "../constants/index.js";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

const formatQuestionsForCsv = (item) => {
  if (!item?.Questions) return "";

  if (Array.isArray(item.Questions)) {
    return item.Questions
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (Array.isArray(entry)) return entry.join(": ");
        if (entry && typeof entry === "object") {
          return Object.entries(entry)
            .map(([key, value]) => `Q: ${key}\nA: ${value}`)
            .join("\n\n");
        }
        return String(entry ?? "");
      })
      .join("\n\n");
  }

  if (typeof item.Questions === "object") {
    return Object.entries(item.Questions)
      .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
      .join("\n\n");
  }

  return String(item.Questions);
};

async function testCsvExport() {
  const db = getDb();
  console.log("=== CSV HEADERS ===");
  console.log(CSV_Header);

  console.log("\n=== CHECKING FOR DEAD PREF / PREFERENCE COLUMN ===");
  const hasPrefHeader = CSV_Header.some(h => h.key === "Pref" || h.label === "Preference");
  console.log("Contains Pref/Preference header?", hasPrefHeader);

  console.log("\n=== SAMPLE FORMATTED QUESTIONS FOR RECENT APPLICANTS ===");
  const snapshot = await db.collection("formData").limit(3).get();
  
  snapshot.forEach((doc) => {
    const item = doc.data();
    console.log(`\nApplicant: ${item.Name} (${item.Department})`);
    console.log("----------------------------------------");
    console.log(formatQuestionsForCsv(item));
    console.log("----------------------------------------");
  });
}

testCsvExport().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
