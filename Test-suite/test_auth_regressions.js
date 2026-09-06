import fetch from "node-fetch";

async function testAuthRegressions() {
  console.log("=== Testing Authenticated Regressions ===");
  const userCookie = "better-auth.session_token=test_concurrent_session_token_12345";
  const adminCookie = "better-auth.session_token=test_admin_session_token_99999";

  // 1. Submit Form with authed user cookie
  try {
    const res = await fetch("http://localhost:3000/api/submit-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": userCookie,
      },
      body: JSON.stringify({
        Name: "Concurrent Test User",
        RegistrationNumber: "25BCE5612",
        Email: "concurrent_test_applicant@vit.ac.in",
        Phone: "9876543210",
        Department: "Design",
        Questions: { "Portfolio Link": "http://example.com" },
      }),
    });
    const json = await res.json();
    console.log(`1. POST /api/submit-form (authed): Status ${res.status}, body:`, json);
  } catch (err) {
    console.error("1. Error:", err.message);
  }

  // 2. Admin applicants with admin cookie
  try {
    const res = await fetch("http://localhost:3000/api/admin/applicants", {
      headers: { "Cookie": adminCookie },
    });
    const json = await res.json();
    console.log(`2. GET /api/admin/applicants (admin authed): Status ${res.status}, total: ${json.totalCount || json.applicants?.length}`);
  } catch (err) {
    console.error("2. Error:", err.message);
  }

  // 3. Shortlist toggle with admin cookie
  try {
    const res = await fetch("http://localhost:3000/api/shortlist/test-applicant-id-123", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": adminCookie,
      },
      body: JSON.stringify({ shortlisted: true }),
    });
    console.log(`3. PATCH /api/shortlist/[id] (admin authed): Status ${res.status}`);
  } catch (err) {
    console.error("3. Error:", err.message);
  }

  // 4. Send email with admin cookie
  try {
    const res = await fetch("http://localhost:3000/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": adminCookie,
      },
      body: JSON.stringify({
        recipients: [{ Email: "test@example.com", Name: "Test User" }],
        payloadData: { subject: "Test Subject", body: "Test Body", mailType: "Blank" },
      }),
    });
    console.log(`4. POST /api/send-email (admin authed): Status ${res.status}`);
  } catch (err) {
    console.error("4. Error:", err.message);
  }

  console.log("=== End Authenticated Regression Test ===");
}

testAuthRegressions();
