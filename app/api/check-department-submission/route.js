import { connect } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const department = searchParams.get("department");

    if (!email || !department) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing email or department", error: "Missing email or department", data: null }),
        { status: 400 }
      );
    }

    if (email !== userEmail) {
      return new Response(
        JSON.stringify({ success: false, message: "You can only check your own submissions", error: "Unauthorized access", data: null }),
        { status: 403 }
      );
    }

    const db = await connect();
    const snapshot = await db
      .collection("formData")
      .where("Email", "==", email)
      .where("Department", "==", department)
      .select("Department")
      .get();

    const isSubmitted = snapshot.size > 0;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Department submission status checked",
        submitted: isSubmitted,
        data: { submitted: isSubmitted },
        error: null,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking department submission:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Database query failed",
        error: error.message || "Database query failed",
        data: null,
      }),
      { status: 500 }
    );
  }
}

