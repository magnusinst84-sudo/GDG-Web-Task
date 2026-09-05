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
        JSON.stringify({ success: false, message: "Authentication required", error: "Authentication required", data: null }),
        { status: 401 }
      );
    }

    const user = session.user;
    const userEmail = user.email;

    const rawDeadline = process.env.SUBMISSION_DEADLINE || "2026-12-31T23:59:59+05:30";
    const deadlineDate = new Date(rawDeadline);
    if (isNaN(deadlineDate.getTime())) {
      console.error("Invalid SUBMISSION_DEADLINE environment variable:", rawDeadline);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Server configuration error: invalid submission deadline",
          error: "Server configuration error",
          data: null,
        }),
        { status: 500 }
      );
    }

    if (new Date() > deadlineDate) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "The submission deadline has passed",
          error: "The submission deadline has passed",
          data: null,
        }),
        { status: 403 }
      );
    }

    const db = await connect();
    const data = await req.json();

    const { Department, Questions, ...formFields } = data;

    const regNoRegex = /^\d{2}[A-Z]{3}\d{4}$/;
    if (formFields.RegistrationNumber && !regNoRegex.test(formFields.RegistrationNumber)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Registration number must be 2 numbers, 3 uppercase letters, and 4 numbers (e.g. 25BCE5612)",
          error: "Invalid Registration Number format",
          data: null,
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
          success: true,
          message: "Form submitted successfully!",
          data: { department: Department },
          error: null,
        }),
        { status: 200 }
      );
    } catch (txError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: txError.message,
          error: txError.message,
          data: null,
        }),
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Form submission error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error submitting form",
        error: error.message || "Internal Server Error",
        data: null,
      }),
      { status: 500 }
    );
  }
}

