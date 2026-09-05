import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { reviews } from "@/constants";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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

    const { recipients, payloadData } = await req.json();

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients provided" },
        { status: 400 }
      );
    }

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
            ${payloadData?.body || ""}
        </div>
        `;

      generalTemp = generalTemp.replace(/#name/g, recipient.Name || "");
      generalTemp = generalTemp.replace(/#dept/g, deptName);

      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipient.Email,
        subject: payloadData?.subject || "Update from GDG Recruitment",
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
