"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Bricolage_Grotesque } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
});

export default function Hero() {
  const [headline] = useState("Recruitment 2026");
  const [subheading] = useState("Ready to make your mark?");
  const [descriptionText] = useState(
    "Join our departments and work on real-world projects. Your journey starts here."
  );

  return (
    <main className="relative overflow-hidden">
      {/* Decorative radial gradient wash — purely cosmetic */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "55%",
          height: "120%",
          background:
            "radial-gradient(ellipse at top left, rgba(138,180,248,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-28 flex flex-col items-start"
      >
        {/* Mono overline — "Recruitment 2026" */}
        <p
          className="mono-label mb-5"
          style={{ color: "rgba(255,255,255,0.38)" }}
        >
          ◆&nbsp;&nbsp;{headline}
        </p>

        {/* Main headline */}
        <h1
          className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter text-white leading-[0.95] mb-6 max-w-4xl"
          style={{ fontFamily: bricolage.style.fontFamily }}
        >
          {subheading}
        </h1>

        {/* Thin rule divider */}
        <div
          className="editorial-rule mb-6"
          style={{ maxWidth: "460px", opacity: 0.35 }}
        />

        {/* Description */}
        <p
          className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed mb-10 font-light"
        >
          {descriptionText}
        </p>

        {/* CTA — minimal bordered editorial button */}
        <Link href="/departments" className="btn-editorial group">
          Join us
          <ArrowRight
            className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        </Link>
      </div>

      {/* Bottom thin rule */}
      <div
        aria-hidden="true"
        style={{
          borderTop: "var(--editorial-rule)",
          marginTop: "0",
        }}
      />
    </main>
  );
}
