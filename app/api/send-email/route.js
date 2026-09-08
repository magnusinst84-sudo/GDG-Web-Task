import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { reviews } from "@/constants";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

export const dynamic = "force-dynamic";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const emailRequestSchema = z.object({
  recipients: z.array(z.object({
    Email: z.string().email(),
    Name: z.string().max(200).optional(),
    Department: z.string().max(100).optional(),
  })).min(1).max(100),
  payloadData: z.object({
    subject: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(100000),
  }),
});

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export async function POST(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const parseResult = emailRequestSchema.safeParse(await req.json().catch(() => null));
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Recipients, subject, and message body are required and must be valid" },
        { status: 400 }
      );
    }
    const { recipients, payloadData } = parseResult.data;

    for (const recipient of recipients) {
      let depart = recipient.Department;
      if (depart === "Video Editing") {
        depart = "Photography";
      }
      const dept = reviews.find((item) => item.name === depart);

      let deptName = dept?.name || recipient.Department || "Department";
      if (
        deptName === "Web Development" ||
        deptName === "App Development"
      ) {
        deptName = "Development Department";
      }

      if (deptName === "Photography" || deptName === "Video Editing") {
        deptName = "Photography & Video Editing Department";
      }

      let generalTemp = `
        <div>
            ${payloadData.body}
        </div>
        `;

      generalTemp = generalTemp.replace(/#name/g, escapeHtml(recipient.Name));
      generalTemp = generalTemp.replace(/#dept/g, escapeHtml(deptName));

      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipient.Email,
        subject: payloadData.subject,
        html: generalTemp,
      };

      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ message: "Emails sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
