import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testSession() {
  const { auth } = await import("../lib/auth.js");
  
  const testEmail = `val_user_${Date.now()}@example.com`;
  const testPassword = "Password123!";

  try {
    const signUpRes = await auth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: "Validation Test User",
      },
      asResponse: true,
    });

    const setCookieHeader = signUpRes.headers.get("set-cookie");
    console.log("Registered test user. Cookie header:", setCookieHeader);

    // TEST 1: Direct API submission with BLANK question answer
    console.log("\n--- TEST 1: Direct API submit with BLANK question answer ---");
    const blankPayload = {
      Name: "Validation Tester",
      RegistrationNumber: "25BCE9999",
      Phone: "9876543210",
      "Year of Study": "2nd Year",
      Email: testEmail,
      Department: "Publicity",
      Questions: {
        "Imagine ORG is hosting a technical event and registrations are lower than expected. What kind of publicity strategy would you use to increase participation?": "    ", // Blank spaces!
        "If you had to promote a technical workshop to students who know very little about the topic, how would you create content that makes them interested in attending?": "Valid answer text",
        "Which social media platform would you prioritize for promoting a college technical community, and what type of content would you create for it?": "Valid answer text"
      }
    };

    const res1 = await fetch("http://localhost:3000/api/submit-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: setCookieHeader,
      },
      body: JSON.stringify(blankPayload),
    });

    console.log("BLANK Answer Submit Status Code:", res1.status);
    const json1 = await res1.json();
    console.log("BLANK Answer Submit Response:", JSON.stringify(json1, null, 2));

    // TEST 2: Direct API submission with ALL questions VALID
    console.log("\n--- TEST 2: Direct API submit with ALL questions VALID ---");
    const validPayload = {
      Name: "Validation Tester",
      RegistrationNumber: "25BCE9999",
      Phone: "9876543210",
      "Year of Study": "2nd Year",
      Email: testEmail,
      Department: "Publicity",
      Questions: {
        "Imagine ORG is hosting a technical event and registrations are lower than expected. What kind of publicity strategy would you use to increase participation?": "I would launch a targeted social media campaign and organize flash promos on campus.",
        "If you had to promote a technical workshop to students who know very little about the topic, how would you create content that makes them interested in attending?": "I would use relatable memes, interactive stories, and bite-sized video teasers.",
        "Which social media platform would you prioritize for promoting a college technical community, and what type of content would you create for it?": "Instagram for visual reels and stories, and LinkedIn for professional announcements."
      }
    };

    const res2 = await fetch("http://localhost:3000/api/submit-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: setCookieHeader,
      },
      body: JSON.stringify(validPayload),
    });

    console.log("VALID Answer Submit Status Code:", res2.status);
    const json2 = await res2.json();
    console.log("VALID Answer Submit Response:", JSON.stringify(json2, null, 2));

  } catch (err) {
    console.error("Test Error:", err);
  }
}

testSession().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
