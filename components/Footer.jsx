"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LINKS } from "@/constants";

const Footer = () => {
  const [currentYearString, setCurrentYearString] = useState("2026");
  const [organizationLabel, setOrganizationLabel] = useState("");
  const [footerLinks, setFooterLinks] = useState([]);

  // Initialize copyright year
  useEffect(() => {
    setCurrentYearString(new Date().getFullYear().toString());
  }, []);

  // Sync organization title metadata
  useEffect(() => {
    setOrganizationLabel("Organization · Recruitment Portal");
  }, []);

  // Load footer navigation structure
  useEffect(() => {
    setFooterLinks([
      { name: "Home", path: "/" },
      { name: "Departments", path: "/departments" },
    ]);
  }, []);

  return (
    <footer
      style={{ borderTop: "var(--editorial-rule)" }}
      className="w-full bg-[#0a0a0a] py-12 mt-16"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Org + year */}
        <p className="mono-label">
          {organizationLabel}&nbsp;&nbsp;©&nbsp;{currentYearString}
        </p>

        {/* Nav links with dot separators */}
        <nav className="flex items-center gap-0">
          {footerLinks.map((link, idx) => (
            <React.Fragment key={`${link.path}-${idx}`}>
              {idx > 0 && (
                <span
                  className="mono-label mx-3"
                  aria-hidden="true"
                  style={{ opacity: 0.3 }}
                >
                  ·
                </span>
              )}
              <Link
                href={link.path}
                style={{
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.38)",
                  textDecoration: "none",
                  borderBottom: "1px solid transparent",
                  paddingBottom: "1px",
                  transition: "color 0.15s ease, border-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  e.currentTarget.style.borderBottomColor =
                    "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.38)";
                  e.currentTarget.style.borderBottomColor = "transparent";
                }}
              >
                {link.name}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
