import { connect } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

export const dynamic = "force-dynamic";

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

    let data;
    try {
      data = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid JSON in request body",
          error: "Invalid JSON format",
          data: null,
        }),
        { status: 400 }
      );
    }

    const parseResult = submitFormSchema.safeParse(data);
    if (!parseResult.success) {
      const issueMessages = parseResult.error.issues.map(
        (issue) => `${issue.path.join(".") || "payload"}: ${issue.message}`
      );
      const errorMessage = `Validation failed: ${issueMessages.join("; ")}`;
      return new Response(
        JSON.stringify({
          success: false,
          message: errorMessage,
          error: errorMessage,
          data: null,
        }),
        { status: 400 }
      );
    }

    const { Department, Questions, Name, RegistrationNumber, Phone, ["Year of Study"]: yearOfStudy } = parseResult.data;

    const db = await connect();
    const collection = db.collection("formData");

    try {
      await db.runTransaction(async (t) => {
        const query = collection.where("Email", "==", userEmail).select("Department");
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
          Name,
          RegistrationNumber,
          Phone,
          "Year of Study": yearOfStudy,
          Department,
          Questions: Questions || {},
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
