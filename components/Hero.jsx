"use client";

import React from "react";
import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
});

export default function Hero() {
  return (
    <main
      className="relative overflow-hidden min-h-screen flex flex-col"
      style={{ background: "#0a0a0a" }}
    >
      {/* ── Ambient gradient glows (purely cosmetic, matching reference image) ── */}

      {/* Left-edge cyan glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "45%",
          height: "100%",
          background:
            "radial-gradient(ellipse at 0% 60%, rgba(56,189,248,0.18) 0%, transparent 62%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Centre-right purple glow — behind the headline */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "5%",
          right: "-5%",
          width: "70%",
          height: "90%",
          background:
            "radial-gradient(ellipse at 70% 35%, rgba(168,85,247,0.16) 0%, rgba(109,40,217,0.08) 35%, transparent 68%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Subtle noise-texture overlay (CSS-only) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
          backgroundSize: "128px 128px",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.4,
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex-grow flex flex-col justify-center max-w-7xl mx-auto w-full px-6 sm:px-10 py-20 sm:py-28">

        {/* Mono overline */}
        <div className="flex items-center gap-3 mb-8">
          <span
            className="mono-label"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            RECRUITMENT 2026 · OPEN NOW
          </span>
          {/* Short horizontal rule after label */}
          <div
            style={{
              width: "40px",
              height: "1px",
              background: "rgba(255,255,255,0.2)",
              flexShrink: 0,
            }}
          />
        </div>

        {/* ── Headline block ── */}
        <div className="mb-10">
          {/* Lines 1 & 2 — heavy bold sans */}
          <h1
            className="leading-[0.92] tracking-tighter text-white"
            style={{
              fontFamily: bricolage.style.fontFamily,
              fontSize: "clamp(3.5rem, 9vw, 9rem)",
              fontWeight: 800,
            }}
          >
            <span className="block">Learn Fast.</span>
            <span className="block">Build Together.</span>
          </h1>

          {/* Line 3 — italic serif contrast */}
          <p
            className="leading-[0.92] tracking-tight text-white"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: "clamp(3rem, 8.2vw, 8.2rem)",
              fontWeight: 700,
              marginTop: "0.06em",
            }}
          >
            Make Your Mark.
          </p>
        </div>

        {/* Thin rule divider */}
        <div
          style={{
            width: "clamp(200px, 30%, 360px)",
            height: "1px",
            background: "rgba(255,255,255,0.15)",
            marginBottom: "2rem",
          }}
        />

        {/* CTA */}
        <Link
          href="/departments"
          className="group inline-flex items-center gap-3 mono-label w-max"
          style={{
            color: "rgba(255,255,255,0.7)",
            borderBottom: "1px solid rgba(255,255,255,0.25)",
            paddingBottom: "3px",
            letterSpacing: "0.15em",
            transition: "color 0.2s, border-color 0.2s",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
          }}
        >
          EXPLORE DEPARTMENTS
          <svg
            width="14"
            height="10"
            viewBox="0 0 14 10"
            fill="none"
            className="transition-transform duration-200 group-hover:translate-x-1"
          >
            <path
              d="M1 5h12M9 1l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {/* ── Bottom-right mono motto sidebar ── */}
      <div
        className="absolute bottom-8 right-8 hidden lg:flex flex-col items-end gap-1 z-10"
        aria-hidden="true"
      >
        <div
          style={{
            width: "1px",
            height: "48px",
            background: "rgba(255,255,255,0.12)",
            marginBottom: "10px",
            alignSelf: "center",
          }}
        />
        {["CODE.", "COLLABORATE.", "CREATE IMPACT."].map((line) => (
          <span
            key={line}
            className="mono-label"
            style={{
              color: "rgba(255,255,255,0.22)",
              letterSpacing: "0.18em",
              fontSize: "9px",
            }}
          >
            {line}
          </span>
        ))}
      </div>

      {/* Bottom thin rule */}
      <div
        aria-hidden="true"
        className="relative z-10"
        style={{ borderTop: "var(--editorial-rule)" }}
      />
    </main>
  );
}
