import fetch from "node-fetch";

async function testRealBetterAuthFlow() {
  console.log("=== Testing Real Better Auth Sign-Up / Sign-In Flow ===");

  const email = `testuser_${Date.now()}@example.com`;
  const password = "Password123!";
  const name = "Test User";

  // 1. Sign Up
  try {
    const signupRes = await fetch("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    console.log(`1. Sign Up: Status ${signupRes.status}`);
    const cookies = signupRes.headers.raw()["set-cookie"];
    console.log("Set-Cookie headers:", cookies);

    if (cookies && cookies.length > 0) {
      const cookieHeader = cookies.map((c) => c.split(";")[0]).join("; ");

      // 2. Submit form with real cookie
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
          Department: "Design",
          Questions: { "Portfolio Link": "http://example.com" },
        }),
      });
      const submitJson = await submitRes.json();
      console.log(`2. POST /api/submit-form with real cookie: Status ${submitRes.status}, response:`, submitJson);
    }
  } catch (err) {
    console.error("Error during Better Auth test:", err);
  }
}

testRealBetterAuthFlow();
