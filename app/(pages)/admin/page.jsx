import React from "react";
import NavBar from "@/components/NavBar";
import { connect, serializeFirestoreData } from "@/lib/db";
import AdminContent from "@/components/AdminContent";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isDev = process.env.NODE_ENV === "development";

  // Server-side session and role check BEFORE database access
  if (!isDev && (!session?.user || session.user.role !== "admin")) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <NavBar />
        <div className="max-w-md mx-auto my-20 px-8 py-12 text-center" style={{ border: "var(--editorial-rule)" }}>
          <p className="mono-label mb-4">Access Denied</p>
          <p className="text-zinc-500 text-sm">You must be an admin to view this page.</p>
        </div>
      </main>
    );
  }

  let applicants = [];
  try {
    const db = await connect();
    const snapshot = await db.collection("formData").limit(1000).get();
    applicants = snapshot.docs.map((doc) => ({
      id: doc.id,
      _id: doc.id,
      ...serializeFirestoreData(doc.data()),
    }));
  } catch (e) {
    console.error("Firestore read error in admin page:", e);
  }

  // Fallback sample applicants for dev testing if DB is empty
  if (isDev && applicants.length === 0) {
    applicants = [
      {
        _id: "demo-1",
        Name: "Aarav Mehta",
        RegistrationNumber: "21BCE1001",
        Email: "aarav.mehta@example.com",
        Phone: "9876543210",
        Department: "Web Development",
        shortlisted: false,
      },
      {
        _id: "demo-2",
        Name: "Ishita Sharma",
        RegistrationNumber: "21ECE1002",
        Email: "ishita.sharma@example.com",
        Phone: "9876543211",
        Department: "Design",
        shortlisted: true,
      },
    ];
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <NavBar />

      {/* Editorial page header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-10 pb-6" style={{ borderBottom: "var(--editorial-rule)" }}>
        <p className="mono-label mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
          Admin · Applicants
        </p>
        <h1
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
          style={{ fontFamily: "var(--font-bricolage, system-ui)" }}
        >
          Applicant Data
        </h1>
      </div>

      <AdminContent applicants={applicants} />
    </main>
  );
}
