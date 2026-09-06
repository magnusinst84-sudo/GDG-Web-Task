import fetch from "node-fetch";

async function testValidFormSubmission() {
  console.log("=== Testing Valid End-to-End Form Submission ===");

  const email = `applicant_${Date.now()}@example.com`;
  const password = "Password123!";
  const name = "Valid Test Applicant";

  try {
    // 1. Sign Up
    const signupRes = await fetch("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const cookies = signupRes.headers.raw()["set-cookie"];
    const cookieHeader = cookies.map((c) => c.split(";")[0]).join("; ");

    // 2. Submit Form
    const submitRes = await fetch("http://localhost:3000/api/submit-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      body: JSON.stringify({
        Name: name,
        RegistrationNumber: "25BCE5612",
        Email: email,
        Phone: "9876543210",
        "Year of Study": "2nd Year",
        Department: "Creatives / Design",
        Questions: { "Portfolio Link": "http://example.com" },
      }),
    });
    const submitJson = await submitRes.json();
    console.log(`2. POST /api/submit-form: Status ${submitRes.status}, response:`, submitJson);
  } catch (err) {
    console.error("Error during valid submission test:", err);
  }
}

testValidFormSubmission();
