import { connect } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ message: "Authentication required" }),
        { status: 401 }
      );
    }

    const user = session.user;
    const userEmail = user.email;

    const deadline = new Date("2026-08-23T23:59:59+05:30");
    if (new Date() > deadline)
      return new Response(
        JSON.stringify({
          message: "The submission deadline has passed"
        }),
        { status: 403 }
      );
                  
    const db = await connect();
    const data = await req.json();

    const { Department, Questions, ...formFields } = data;

    const regNoRegex = /^\d{2}[A-Z]{3}\d{4}$/;
    if (formFields.RegistrationNumber && !regNoRegex.test(formFields.RegistrationNumber)) {
      return new Response(
        JSON.stringify({
          message: "Registration number must be 2 numbers, 3 uppercase letters, and 4 numbers (e.g. 25BCE5612)",
        }),
        { status: 400 }
      );
    }

    const collection = db.collection("formData");

    try {
      await db.runTransaction(async (t) => {
        const query = collection.where("Email", "==", userEmail);
        const existingSubmissionsSnapshot = await t.get(query);
        
        const alreadySubmittedDept = existingSubmissionsSnapshot.docs.some(
          (doc) => doc.data()?.Department === Department
        );

        if (alreadySubmittedDept) {
          throw new Error(`You have already submitted an application for ${Department}`);
        }

        if (existingSubmissionsSnapshot.size >= 2) {
          throw new Error("Remember that you can only submit upto 2 unique applications");
        }

        const newDocRef = collection.doc();
        t.set(newDocRef, {
          ...formFields,
          Department,
          Questions,
          Email: userEmail,
          shortlisted: false,
          createdAt: new Date(),
        });
      });

      return new Response(
        JSON.stringify({
          message: "Form submitted successfully!",
        }),
        { status: 200 }
      );
    } catch (txError) {
      return new Response(
        JSON.stringify({
          message: txError.message,
        }),
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Form submission error:", error);
    return new Response(JSON.stringify({ message: "Error submitting form" }), {
      status: 500,
    });
  }
}
