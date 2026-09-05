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

  // Nested auth gate component
  const UnauthorizedView = ({ onSignIn }) => (
    <div className="max-w-md mx-auto my-12 p-8 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-4 shadow-xl text-white">
      <h2 className="text-2xl font-bold">Authentication Required</h2>
      <p className="text-zinc-400 text-sm">Please sign in to access the admin panel.</p>
      <button
        type="button"
        onClick={onSignIn}
        className="px-6 py-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 font-bold text-sm transition-colors"
      >
        Sign In
      </button>
    </div>
  );

  if (isPending) {
    return (
      <div className="p-8 text-center text-zinc-400 font-medium">
        Loading administrative dashboard...
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <UnauthorizedView
        onSignIn={() => {
          window.location.href = "/auth/signin";
        }}
      />
    );
  }

  if (!roleAuthorization) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-lg bg-red-950/80 border border-red-800/80 text-red-200 text-center font-medium shadow-lg">
        Access Denied! You are not authorized to view this webpage.
      </div>
    );
  }

  return (
    <div>
      <DataTable data={applicants} />
    </div>
  );
};

export default AdminContent;
