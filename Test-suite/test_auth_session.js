require("dotenv").config({ path: ".env.local" });
const { auth } = require("./lib/auth");

async function testSession() {
  const db = require("./scratch/setup_test_session");
  // Let's sign up / in a user via auth
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: "test_val_user@example.com",
        password: "Password123!",
        name: "Test Validation User",
      },
      asResponse: true,
    });
    console.log("SignUp response headers set-cookie:", res.headers.get("set-cookie"));
    const setCookie = res.headers.get("set-cookie");
    
    // Now let's test submitting form with this set-cookie
    const blankPayload = {
      Name: "Validation Tester",
      RegistrationNumber: "25BCE9999",
      Phone: "9876543210",
      "Year of Study": "2nd Year",
      Email: "test_val_user@example.com",
      Department: "Publicity",
      Questions: {
        "Imagine ORG is hosting a technical event and registrations are lower than expected. What kind of publicity strategy would you use to increase participation?": "   ", // Blank spaces!
        "If you had to promote a technical workshop to students who know very little about the topic, how would you create content that makes them interested in attending?": "Proper answer here",
        "Which social media platform would you prioritize for promoting a college technical community, and what type of content would you create for it?": "Another proper answer"
      }
    };

    const submitRes1 = await fetch("http://localhost:3000/api/submit-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: setCookie,
      },
      body: JSON.stringify(blankPayload),
    });

    console.log("BLANK answer submit status:", submitRes1.status);
    const body1 = await submitRes1.json();
    console.log("BLANK answer submit body:", JSON.stringify(body1, null, 2));

    const validPayload = {
      Name: "Validation Tester",
      RegistrationNumber: "25BCE9999",
      Phone: "9876543210",
      "Year of Study": "2nd Year",
      Email: "test_val_user@example.com",
      Department: "Publicity",
      Questions: {
        "Imagine ORG is hosting a technical event and registrations are lower than expected. What kind of publicity strategy would you use to increase participation?": "I would launch a targeted social media campaign and organize flash promos.",
        "If you had to promote a technical workshop to students who know very little about the topic, how would you create content that makes them interested in attending?": "I would use relatable memes and bite-sized video teasers to simplify concepts.",
        "Which social media platform would you prioritize for promoting a college technical community, and what type of content would you create for it?": "Instagram for visual reels and LinkedIn for professional announcements."
      }
    };

    const submitRes2 = await fetch("http://localhost:3000/api/submit-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: setCookie,
      },
      body: JSON.stringify(validPayload),
    });

    console.log("VALID answer submit status:", submitRes2.status);
    const body2 = await submitRes2.json();
    console.log("VALID answer submit body:", JSON.stringify(body2, null, 2));

  } catch (err) {
    console.error("Error:", err);
  }
}

testSession().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
