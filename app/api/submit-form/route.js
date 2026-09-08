import { connect } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { QuestionnaireData } from "@/constants";

export const dynamic = "force-dynamic";

const normaliseQuestion = (question) => (
  typeof question === "string"
    ? { name: question, type: "generic", placeholder: "2-3 sentences" }
    : question
);

const normalizeDeptName = (str) =>
    str ? str.trim().toLowerCase().replace(/\s*\/\s*/g, "/") : "";

const VALID_DEPARTMENTS = QuestionnaireData.map((item) => item.department);

const submitFormSchema = z.object({
  Name: z.string({ required_error: "Name is required" }).trim().min(1, "Name is required"),
  RegistrationNumber: z
    .string({ required_error: "RegistrationNumber is required" })
    .trim()
    .regex(/^\d{2}[A-Z]{3}\d{4}$/, "Registration number must be 2 numbers, 3 uppercase letters, and 4 numbers (e.g. 25BCE5612)"),
  Phone: z.string({ required_error: "Phone is required" }).trim().min(1, "Phone is required").regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  "Year of Study": z.string({ required_error: "Year of Study is required" }).trim().min(1, "Year of Study is required"),
  Email: z.string().email("Invalid email"),
  Gender: z.string().optional().default(""),
  Department: z.string().trim().min(1, "Department is required"),
  Questions: z.record(z.string(), z.string().trim().min(1, "All question answers must be non-empty")),
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

    const {
      Department,
      Questions,
      Name,
      RegistrationNumber,
      Phone,
      Gender,
      Email,
      ["Year of Study"]: yearOfStudy,
    } = parseResult.data;
    const canonicalDepartment = VALID_DEPARTMENTS.find(
      (department) =>
        normalizeDeptName(department) === normalizeDeptName(Department)
    );

    if (!canonicalDepartment) {
      const errorMessage = `Validation failed: Department must be one of: ${VALID_DEPARTMENTS.join(", ")}`;
      return new Response(JSON.stringify({
        success: false,
        message: errorMessage,
        error: errorMessage,
        data: null,
      }), { status: 400 });
    }

    if (Email !== userEmail) {
      return new Response(JSON.stringify({
        success: false,
        message: "Email must match the authenticated account",
        error: "Email must match the authenticated account",
        data: null,
      }), { status: 403 });
    }

    const deptConfig = QuestionnaireData.find(
      (item) => normalizeDeptName(item.department) === normalizeDeptName(canonicalDepartment)
    );
    const expectedQuestions = (deptConfig?.questions ?? []).map(normaliseQuestion).map((q) => q.name);

    for (const qName of expectedQuestions) {
      const answer = Questions?.[qName];
      if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
        const errorMessage = `Validation failed: Answer is required for question "${qName}"`;
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
    }

    const db = await connect();
    const collection = db.collection("formData");

    try {
      await db.runTransaction(async (t) => {
        const query = collection.where("Email", "==", userEmail).select("Department");
        const existingSubmissionsSnapshot = await t.get(query);

        const alreadySubmittedDept = existingSubmissionsSnapshot.docs.some(
          (doc) =>
            normalizeDeptName(doc.data()?.Department) ===
            normalizeDeptName(canonicalDepartment)
        );

        if (alreadySubmittedDept) {
          throw new Error(`You have already submitted an application for ${canonicalDepartment}`);
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
          Department: canonicalDepartment,
          Questions: Questions || {},
          Email: userEmail,
          Gender,
          shortlisted: false,
          createdAt: new Date(),
        });
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Form submitted successfully!",
          data: { department: canonicalDepartment },
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
