"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import UserButton from "./UserButton";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Bricolage_Grotesque } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-bricolage",
});

const NavBar = () => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

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
    const baseItems = [{ label: "Departments", href: "/departments" }];
    if (isAuthenticated && hasAdminPermissions) {
      baseItems.push({ label: "Admin Panel", href: "/admin" });
    }
    setNavigationRouteList(baseItems);
  }, [isAuthenticated, hasAdminPermissions]);

  const activeUserDataSnapshot = session?.user
    ? JSON.parse(JSON.stringify(session.user))
    : null;

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-[#0a0a0a] transition-all duration-200 ${
        scrollElevation > 8
          ? "border-b border-white/[0.08]"
          : "border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className={`${bricolage.className} text-sm font-extrabold uppercase tracking-[0.2em] text-white hover:text-zinc-300 transition-colors`}
        >
          ORG
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Live clock */}
          <span
            className="hidden sm:inline-block"
            style={{
              fontFamily: "var(--font-mono), ui-monospace, monospace",
              fontSize: "10px",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.35)",
              borderBottom: "1px solid rgba(255,255,255,0.12)",
              paddingBottom: "1px",
            }}
          >
            {formattedTimeDisplay}
          </span>

          {/* Nav links */}
          {navigationRouteList.map((item, idx) => (
            <Link
              key={`${item.href}-${idx}`}
              href={item.href}
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                textDecoration: "none",
                borderBottom: "1px solid transparent",
                paddingBottom: "1px",
                transition: "color 0.15s ease, border-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ededed";
                e.currentTarget.style.borderBottomColor =
                  "rgba(255,255,255,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                e.currentTarget.style.borderBottomColor = "transparent";
              }}
            >
              {item.label}
            </Link>
          ))}

          {/* Auth button */}
          {isPending ? (
            <span
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: "10px",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.25)",
              }}
            >
              ···
            </span>
          ) : !isAuthenticated ? (
            <Link
              href="/auth/signin"
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#ededed",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "5px 14px",
                textDecoration: "none",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ededed";
                e.currentTarget.style.color = "#0a0a0a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#ededed";
              }}
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
