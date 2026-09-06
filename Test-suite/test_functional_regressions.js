import fetch from "node-fetch";

async function testFunctionalRegressions() {
  console.log("=== Testing Functional Regressions ===");

  // 1. Check GET /api/admin/applicants without auth (should return 403)
  try {
    const res = await fetch("http://localhost:3000/api/admin/applicants");
    console.log(`1. GET /api/admin/applicants (unauthed): Status ${res.status} (Expected 403)`);
  } catch (err) {
    console.error("1. Error:", err.message);
  }

  // 2. Check PATCH /api/shortlist/test-id without auth (should return 403)
  try {
    const res = await fetch("http://localhost:3000/api/shortlist/test-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shortlisted: true }),
    });
    console.log(`2. PATCH /api/shortlist/[id] (unauthed): Status ${res.status} (Expected 403)`);
  } catch (err) {
    console.error("2. Error:", err.message);
  }

  // 3. Check POST /api/send-email without auth (should return 403)
  try {
    const res = await fetch("http://localhost:3000/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipients: [], payloadData: { subject: "test", body: "test" } }),
    });
    console.log(`3. POST /api/send-email (unauthed): Status ${res.status} (Expected 403)`);
  } catch (err) {
    console.error("3. Error:", err.message);
  }

  // 4. Check POST /api/submit-form validation (invalid RegNo should return 400)
  try {
    const res = await fetch("http://localhost:3000/api/submit-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Name: "Test User",
        RegistrationNumber: "INVALID_REG",
        Email: "test@example.com",
        Phone: "1234567890",
        Department: "Design",
        Questions: { "Portfolio Link": "http://example.com" },
      }),
    });
    console.log(`4. POST /api/submit-form (invalid RegNo): Status ${res.status} (Expected 400)`);
  } catch (err) {
    console.error("4. Error:", err.message);
  }

  // 5. Check GET /api/check-applications
  try {
    const res = await fetch("http://localhost:3000/api/check-applications?email=test%40example.com");
    const json = await res.json();
    console.log(`5. GET /api/check-applications: Status ${res.status}, count = ${json.count}`);
  } catch (err) {
    console.error("5. Error:", err.message);
  }

  console.log("=== End Functional Regression Test ===");
}

testFunctionalRegressions();
