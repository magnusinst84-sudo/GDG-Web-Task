import { NextResponse } from "next/server";
import { connect, serializeFirestoreData } from "@/lib/db";
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
    const snapshot = await db.collection("formData").where("Email", "==", email).get();
    const submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      _id: doc.id,
      ...serializeFirestoreData(doc.data()),
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Submissions retrieved successfully",
        data: submissions,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch submissions",
        error: error.message || "Internal Server Error",
        data: null,
      },
      { status: 500 }
    );
  }
}

