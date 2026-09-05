"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import UserButton from "./UserButton";
import { Button } from "./ui/button";
import { FaUser } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

import { DM_Sans } from "next/font/google";
import CountdownTimer from "./common/CountdownTimer";

const dm_sans = DM_Sans({ weight: ["400"], subsets: ["latin"] });

const NavBar = () => {
  const imgSize = 40;
  const router = useRouter();

  // Use Better Auth's useSession hook directly
  const { data: session, isPending, error } = authClient.useSession();

  // Track component-level state for navigation and display
  const [formattedTimeDisplay, setFormattedTimeDisplay] = useState("");
  const [userSessionEmail, setUserSessionEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAdminPermissions, setHasAdminPermissions] = useState(false);
  const [navigationRouteList, setNavigationRouteList] = useState([]);
  const [scrollElevation, setScrollElevation] = useState(0);

  // Keep live time synchronized for the banner clock
  useEffect(() => {
    const timer = setInterval(() => {
      setFormattedTimeDisplay(new Date().toLocaleTimeString());
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // Update header elevation based on scroll offset
  useEffect(() => {
    const handleWindowScroll = () => {
      setScrollElevation(window.scrollY);
    };
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  // Sync user email from current session
  useEffect(() => {
    if (session?.user?.email) {
      setUserSessionEmail(session.user.email);
    } else {
      setUserSessionEmail("");
    }
  }, [session]);

  // Derive authentication state
  useEffect(() => {
    setIsAuthenticated(Boolean(userSessionEmail));
  }, [userSessionEmail]);

  // Check admin role permissions
  useEffect(() => {
    setHasAdminPermissions(session?.user?.role === "admin");
  }, [isAuthenticated, session]);

  // Build navigation items list
  useEffect(() => {
    const baseItems = [
      { label: "Departments", href: "/departments" }
    ];
    if (isAuthenticated && hasAdminPermissions) {
      baseItems.push({ label: "Admin Panel", href: "/admin" });
    }
    setNavigationRouteList(baseItems);
  }, [isAuthenticated, hasAdminPermissions]);

  // Prepare user profile payload snapshot
  const activeUserDataSnapshot = session?.user ? JSON.parse(JSON.stringify(session.user)) : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-black/80 backdrop-blur-md transition-opacity duration-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-lg text-white hover:text-zinc-300 transition-colors tracking-tight">
            Recruitment Portal
          </Link>
          <span className="text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
            {formattedTimeDisplay}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          {navigationRouteList.map((item, idx) => (
            <Link
              key={`${item.href}-${idx}`}
              href={item.href}
              className="text-zinc-300 hover:text-white font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {isPending ? (
            <span className="text-zinc-500 text-xs">Loading...</span>
          ) : !isAuthenticated ? (
            <Link
              href="/auth/signin"
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 font-semibold text-xs transition-colors"
            >
              Sign In
            </Link>
          ) : (
            <UserButton user={activeUserDataSnapshot} />
          )}
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
