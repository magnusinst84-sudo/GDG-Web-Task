import { NextResponse } from 'next/server';
import { connect, serializeFirestoreData } from '@/lib/db';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit";

const shortlistSchema = z.object({
  shortlisted: z.boolean({
    required_error: "Field 'shortlisted' is required",
    invalid_type_error: "Field 'shortlisted' must be a boolean",
  }),
});

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

    const body = await req.json().catch(() => ({}));
    const parseResult = shortlistSchema.safeParse(body);

    if (!parseResult.success) {
      const issueMessages = parseResult.error.issues.map(
        (issue) => `${issue.path.join(".") || "payload"}: ${issue.message}`
      );
      const errorMessage = `Validation failed: ${issueMessages.join("; ")}`;
      return NextResponse.json(
        { success: false, message: errorMessage, error: errorMessage, data: null },
        { status: 400 }
      );
    }

    const { shortlisted } = parseResult.data;
    const db = await connect();
    const { id } = params;

    try {
        const docRef = db.collection('formData').doc(id);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            return NextResponse.json(
              { success: false, message: 'Applicant not found', error: 'Applicant not found', data: null },
              { status: 404 }
            );
        }

        const previousShortlisted = docSnapshot.data()?.shortlisted ?? false;

        await docRef.update({ shortlisted });

        // Record administrative mutation in auditLog collection (non-blocking)
        await logAuditEvent(db, {
          adminEmail: session.user.email,
          action: "UPDATE_SHORTLIST_STATUS",
          targetId: id,
          details: {
            previousShortlisted,
            newShortlisted: shortlisted,
          },
        });

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
