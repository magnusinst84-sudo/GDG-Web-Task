"use client";
import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import DataTable from "./DataTable";

const AdminContent = ({ applicants }) => {
  // Use Better Auth's useSession hook directly
  const { data: session, isPending } = authClient.useSession();

  const [activeSessionUser, setActiveSessionUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("pending");
  const [roleAuthorization, setRoleAuthorization] = useState(false);

  // Sync user profile state
  useEffect(() => {
    if (session?.user) {
      setActiveSessionUser(JSON.parse(JSON.stringify(session.user)));
    } else {
      setActiveSessionUser(null);
    }
  }, [session]);

  // Determine authentication state
  useEffect(() => {
    if (!isPending) {
      setAuthStatus(activeSessionUser ? "authenticated" : "unauthenticated");
    }
  }, [isPending, activeSessionUser]);

  // Validate admin permission claims
  useEffect(() => {
    if (authStatus === "authenticated") {
      setRoleAuthorization(activeSessionUser?.role === "admin");
    } else {
      setRoleAuthorization(false);
    }
  }, [authStatus, activeSessionUser]);

  // Real stats — computed from actual prop, never hardcoded
  const totalApplicants = applicants?.length ?? 0;
  const shortlistedCount = applicants?.filter((a) => a.shortlisted === true).length ?? 0;

  const isDev = process.env.NODE_ENV === "development";

  if (isPending) {
    return (
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <p className="mono-label">Loading administrative dashboard…</p>
      </div>
    );
  }

  if (!isDev && authStatus === "unauthenticated") {
    return (
      <div
        className="max-w-md mx-auto my-12 px-8 py-10 text-center"
        style={{ border: "var(--editorial-rule)" }}
      >
        <p className="mono-label mb-4">Authentication Required</p>
        <p className="text-zinc-500 text-sm mb-8">
          Please sign in to access the admin panel.
        </p>
        <button
          type="button"
          onClick={() => { window.location.href = "/auth/signin"; }}
          className="btn-editorial"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (!isDev && !roleAuthorization) {
    return (
      <div
        className="max-w-md mx-auto my-12 px-8 py-10 text-center"
        style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.04)" }}
      >
        <p className="mono-label mb-3" style={{ color: "rgba(252,165,165,0.7)" }}>
          Access Denied
        </p>
        <p className="text-red-300/70 text-sm">
          You are not authorized to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
      {/* Real stats strip — computed from actual data */}
      <div
        className="flex items-center gap-8 mb-8 py-5"
        style={{ borderBottom: "var(--editorial-rule)" }}
      >
        <div>
          <p
            className="text-3xl font-bold text-white tabular-nums"
            style={{ fontFamily: "var(--font-bricolage, system-ui)" }}
          >
            {totalApplicants}
          </p>
          <p className="mono-label mt-1">Total Applicants</p>
        </div>
        <div
          style={{ width: "1px", height: "40px", background: "rgba(255,255,255,0.1)" }}
        />
        <div>
          <p
            className="text-3xl font-bold tabular-nums"
            style={{
              fontFamily: "var(--font-bricolage, system-ui)",
              color: "#6ee7a0",
            }}
          >
            {shortlistedCount}
          </p>
          <p className="mono-label mt-1">Shortlisted</p>
        </div>
      </div>

      <DataTable data={applicants} />
    </div>
  );
};

export default AdminContent;
