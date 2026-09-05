import { NextResponse } from 'next/server';
import { connect, serializeFirestoreData } from '@/lib/db';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(req, { params }) {
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

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { shortlisted } = body;

    if (typeof shortlisted !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Field 'shortlisted' must be a boolean", error: "Invalid parameter format", data: null },
        { status: 400 }
      );
    }

    try {
        const docRef = db.collection('formData').doc(id);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            return NextResponse.json(
              { success: false, message: 'Applicant not found', error: 'Applicant not found', data: null },
              { status: 404 }
            );
        }

        await docRef.update({ shortlisted });
        const updatedSnapshot = await docRef.get();

        const applicant = {
            id: updatedSnapshot.id,
            _id: updatedSnapshot.id,
            ...serializeFirestoreData(updatedSnapshot.data()),
        };

        return NextResponse.json({
          success: true,
          message: `Applicant shortlist status updated to ${shortlisted}`,
          data: applicant,
          error: null,
        });
    } catch (error) {
        console.error('Error updating applicant:', error.message);
        return NextResponse.json(
          { success: false, message: error.message || "Error updating applicant", error: error.message || "Error updating applicant", data: null },
          { status: 400 }
        );
    }
}

