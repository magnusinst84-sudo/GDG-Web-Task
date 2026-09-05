import { connect, serializeFirestoreData } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access", error: "Unauthorized access", data: null },
        { status: 403 }
      );
    }

    const db = await connect();
    const snapshot = await db.collection("formData").limit(1000).get();
    const applicants = snapshot.docs.map((doc) => ({
      id: doc.id,
      _id: doc.id,
      ...serializeFirestoreData(doc.data()),
    }));

    return NextResponse.json({
      success: true,
      message: "Applicants retrieved successfully",
      applicants,
      data: { applicants },
      error: null,
    });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch applicants", error: "Failed to fetch applicants", data: null },
      { status: 500 }
    );
  }
}

