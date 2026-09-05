import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required", error: "Authentication required", data: null },
        { status: 401 }
      );
    }

    const user = session.user;
    const userEmail = user.email;

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required", error: "Email is required", data: null },
        { status: 400 }
      );
    }

    if (email !== userEmail) {
      return NextResponse.json(
        { success: false, message: "You can only check your own applications", error: "Unauthorized access", data: null },
        { status: 403 }
      );
    }

    const db = await connect();
    const snapshot = await db
      .collection("formData")
      .where("Email", "==", email)
      .select("Department")
      .get();
    const submittedDepartments = snapshot.docs.map((doc) => doc.data().Department).filter(Boolean);

    return NextResponse.json(
      {
        success: true,
        message: "Application status retrieved successfully",
        count: snapshot.size,
        submittedDepartments,
        data: { count: snapshot.size, submittedDepartments },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking applications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while checking applications",
        error: error.message || "Internal Server Error",
        data: null,
      },
      { status: 500 }
    );
  }
}

