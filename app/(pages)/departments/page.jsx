"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bricolage_Grotesque } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import PopupComp from "@/components/PopupComp";
import { toast } from "sonner";
import { reviews } from "@/constants";
import { cn, hexToRgba } from "@/lib/utils";
import {
  Code2,
  Palette,
  Database,
  Smartphone,
  Layout,
  Cloud,
  Box,
  Megaphone,
  Briefcase,
  Globe,
  Gamepad2,
  Trophy,
} from "lucide-react";
import { useSubmissions } from "@/components/SubmissionsProvider";

const DEPARTMENT_ICONS = {
  "Management": Briefcase,
  "Publicity": Megaphone,
  "Outreach": Globe,
  "UI/UX": Layout,
  "Creatives / Design": Palette,
  "Web Dev": Code2,
  "App Dev": Smartphone,
  "Game Dev": Gamepad2,
  "Data Science": Database,
  "Cloud & DevOps": Cloud,
  "Blockchain": Box,
  "Competitive Programming": Trophy,
};

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const departments = reviews;


const DepartmentsListPage = () => {
  const router = useRouter();
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const {
    submittedDepartments,
    isLoadingSubmissions,
    submissionsError,
    refreshSubmissions,
  } = useSubmissions();

  // Component state for department selections and pagination
  const [selectedCount, setSelectedCount] = useState(0);
  const [remainingSlots, setRemainingSlots] = useState(2);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isContinueDisabled, setIsContinueDisabled] = useState(true);
  const [lastClickedDepartment, setLastClickedDepartment] = useState("");
  const [scrollDepth, setScrollDepth] = useState(0);
  const [computedDepartmentList, setComputedDepartmentList] = useState([]);

  // Popup component state
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupData, setPopupData] = useState(null);

  // Track window scroll coordinates
  useEffect(() => {
    const handleScroll = () => {
      setScrollDepth(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize cached department catalog
  useEffect(() => {
    setComputedDepartmentList(JSON.parse(JSON.stringify(departments)));
  }, []);

  // Update selected counter
  useEffect(() => {
    setSelectedCount(selectedDepartments.length);
  }, [selectedDepartments]);

  // Recalculate available registration slots
  useEffect(() => {
    setRemainingSlots(2 - submittedDepartments.length);
  }, [submittedDepartments]);

  // Map selected departments to application route IDs
  useEffect(() => {
    const ids = computedDepartmentList
      .filter((dept) => selectedDepartments.includes(dept.name))
      .map((dept) => dept.id);
    setSelectedIds(ids);
  }, [selectedDepartments, computedDepartmentList]);

  // Evaluate form submission readiness
  useEffect(() => {
    setIsContinueDisabled(selectedIds.length === 0);
  }, [selectedIds]);

  const openDepartmentDetail = (departmentName) => {
    setLastClickedDepartment(departmentName);
    const dept = computedDepartmentList.find((d) => d.name === departmentName);
    const isSelected = selectedDepartments.includes(departmentName);
    const isSubmitted = submittedDepartments.includes(departmentName);

    setPopupData({
      header: departmentName,
      description:
        dept?.description || "No description available for this department.",
      message: [
        `Application Status: ${
          isSubmitted
            ? "Already Submitted"
            : isSelected
            ? "Selected for application"
            : "Available to select"
        }`,
        `Registration Rule: You can apply for up to 2 departments total across technical and non-technical tracks.`,
      ],
    });
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const toggleDepartment = (departmentName) => {
    setLastClickedDepartment(departmentName);

    if (submittedDepartments.includes(departmentName)) {
      toast.error(
        `You have already submitted an application for ${departmentName}.`
      );
      return;
    }

    if (remainingSlots <= 0) {
      toast.error(
        "You have already submitted the maximum allowed (2) applications."
      );
      return;
    }

    setSelectedDepartments((current) => {
      const isSelected = current.includes(departmentName);

      if (isSelected) {
        return current.filter((name) => name !== departmentName);
      }

      if (current.length >= remainingSlots) {
        toast.error(`You can select at most ${remainingSlots} department(s).`);
        return current;
      }

      return [...current, departmentName];
    });
  };

  const goToApplication = () => {
    if (!selectedIds.length) return;
    router.push(`/join/${selectedIds.join("/")}`);
  };

  // ── Department card component ───────────────────────────
  const DepartmentCard = ({ department, featured = false }) => {
    const isSelected = selectedDepartments.includes(department.name);
    const isSubmitted = submittedDepartments.includes(department.name);
    const accentColor = department.tone || "#8ab4f8";
    const IconComponent = DEPARTMENT_ICONS[department.name] || Code2;

    return (
      <div
        className={cn(
          "relative flex flex-col justify-between transition-all duration-200 overflow-hidden",
          "border-l-[3px]",
          featured ? "p-8 sm:p-10 min-h-[280px]" : "p-5 sm:p-6 min-h-[200px]",
          isSubmitted && "opacity-50"
        )}
        style={{
          background: "#0a0a0a",
          borderLeftColor: isSelected ? accentColor : "rgba(255,255,255,0.12)",
          borderTop: "var(--editorial-rule)",
          borderRight: "var(--editorial-rule)",
          borderBottom: "var(--editorial-rule)",
          boxShadow: isSelected
            ? `0 0 0 1px ${hexToRgba(accentColor, 0.35)}`
            : "none",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {/* Per-department radial gradient wash — high intensity matching mockup */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 90% 15%, ${hexToRgba(accentColor, 0.45)} 0%, ${hexToRgba(accentColor, 0.15)} 50%, rgba(10,10,10,0) 80%)`,
            pointerEvents: "none",
            zIndex: 0,
            transition: "opacity 0.3s ease",
            opacity: isSelected ? 1.5 : 1,
          }}
        />

        {/* Card content sits above the gradient wash */}
        <div className="relative z-10 flex flex-col h-full">

          {/* Header row: Status/Featured badges + Department Icon */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5 flex-wrap">
              {featured ? (
                <span
                  className="mono-label px-2 py-0.5"
                  style={{
                    border: `1px solid ${hexToRgba(accentColor, 0.6)}`,
                    color: accentColor,
                    fontSize: "10px",
                    letterSpacing: "0.15em",
                  }}
                >
                  FEATURED
                </span>
              ) : (
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: accentColor, opacity: 0.9 }}
                />
              )}

              {isSubmitted && (
                <span
                  className="mono-label px-2 py-0.5"
                  style={{
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  Submitted ✓
                </span>
              )}
              {isSelected && !isSubmitted && !featured && (
                <span
                  className="mono-label px-2 py-0.5"
                  style={{
                    border: `1px solid ${hexToRgba(accentColor, 0.5)}`,
                    color: accentColor,
                  }}
                >
                  Selected
                </span>
              )}
            </div>

            {/* Department Icon from lucide-react */}
            <div
              className="flex items-center justify-center p-2 rounded-lg flex-shrink-0"
              style={{
                background: hexToRgba(accentColor, 0.12),
                color: accentColor,
                border: `1px solid ${hexToRgba(accentColor, 0.25)}`,
              }}
            >
              <IconComponent size={featured ? 24 : 18} />
            </div>
          </div>

          {/* Department name */}
          <h3
            className={cn(
              "font-extrabold tracking-tight leading-[0.95] mb-3",
              featured
                ? "text-3xl sm:text-4xl lg:text-5xl"
                : "text-xl sm:text-2xl"
            )}
            style={{
              fontFamily: bricolage.style.fontFamily,
              color: isSelected ? accentColor : "#ffffff",
              transition: "color 0.2s",
            }}
          >
            {department.name}
          </h3>

          {/* Description — pull-quote style */}
          <p
            className={cn(
              "pull-quote leading-relaxed mb-6",
              featured ? "text-sm sm:text-base text-zinc-300" : "text-sm text-zinc-400"
            )}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: featured ? 4 : 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {department.description}
          </p>

          {/* Bottom actions row: Checkbox + Details button */}
          <div className="flex items-center justify-between gap-3 mt-auto pt-2">
            <label
              className={cn(
                "flex items-center gap-2.5 cursor-pointer select-none",
                isSubmitted && "cursor-not-allowed"
              )}
            >
              <input
                type="checkbox"
                disabled={isSubmitted}
                checked={isSelected}
                onChange={() => toggleDepartment(department.name)}
                className="sr-only"
              />
              {/* Custom checkbox */}
              <span
                className="inline-flex items-center justify-center w-4 h-4 flex-shrink-0 transition-all duration-150"
                style={{
                  border: isSelected
                    ? `2px solid ${accentColor}`
                    : "2px solid rgba(255,255,255,0.3)",
                  background: isSelected
                    ? hexToRgba(accentColor, 0.25)
                    : "transparent",
                }}
              >
                {isSelected && (
                  <svg
                    width="8"
                    height="6"
                    viewBox="0 0 8 6"
                    fill="none"
                    strokeWidth="2"
                    stroke={accentColor}
                  >
                    <path d="M1 3L3 5L7 1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                className="mono-label"
                style={{ color: isSelected ? accentColor : "rgba(255,255,255,0.5)" }}
              >
                {isSubmitted ? "Submitted" : isSelected ? "Deselect" : "Select"}
              </span>
            </label>

            {/* Details button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDepartmentDetail(department.name);
              }}
              className="mono-label flex-shrink-0"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.2)",
                paddingBottom: "1px",
                color: "rgba(255,255,255,0.45)",
                background: "none",
                cursor: "pointer",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "#ffffff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
              }
            >
              Details →
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main
      data-scroll-depth={scrollDepth}
      className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between"
    >
      <NavBar />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 w-full flex-grow">

        {/* ── Loading Banner State (logic untouched) ── */}
        {isLoadingSubmissions && (
          <div
            className="flex items-center gap-3 mb-6 py-3 px-4"
            style={{ borderBottom: "var(--editorial-rule)" }}
          >
            <span className="h-3 w-3 rounded-full border border-white/30 border-t-white animate-spin flex-shrink-0" />
            <span className="mono-label">Loading application history…</span>
          </div>
        )}

        {/* ── Error Banner State with Retry (logic untouched) ── */}
        {submissionsError && (
          <div
            className="flex justify-between items-center gap-4 mb-6 py-3 px-4"
            style={{
              border: "1px solid rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.05)",
            }}
          >
            <span className="text-red-300 text-sm">{submissionsError}</span>
            <button
              type="button"
              onClick={() => refreshSubmissions()}
              className="mono-label"
              style={{
                color: "rgba(252,165,165,0.8)",
                borderBottom: "1px solid rgba(252,165,165,0.3)",
                paddingBottom: "1px",
                background: "none",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Page header ── */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p
              className="mono-label mb-3"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Step 01 · Select
            </p>
            <h1
              className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-none"
              style={{ fontFamily: bricolage.style.fontFamily }}
            >
              Pick your departments
            </h1>
            <p className="text-zinc-500 text-sm mt-3 max-w-md">
              Select up to <strong className="text-zinc-300">two</strong>{" "}
              departments you wish to apply for.
            </p>
          </div>

          {/* Selection counter + continue */}
          <div
            className="flex items-center gap-5 flex-shrink-0 sm:pb-1"
            style={{ borderTop: "var(--editorial-rule)", paddingTop: "1rem" }}
          >
            <div>
              <span
                className="text-3xl font-bold text-white tabular-nums"
                style={{ fontFamily: bricolage.style.fontFamily }}
              >
                {selectedCount}
              </span>
              <span className="mono-label ml-1.5 text-zinc-500">/ 2</span>
              <p className="mono-label mt-0.5">selected</p>
            </div>

            <button
              type="button"
              onClick={goToApplication}
              disabled={isContinueDisabled}
              className="btn-editorial"
              style={
                isContinueDisabled
                  ? { opacity: 0.3, cursor: "not-allowed" }
                  : {}
              }
            >
              Continue →
            </button>
          </div>
        </header>

        {/* ── Department grid ── */}
        <section>
          <p
            className="mono-label mb-5"
            style={{ borderBottom: "var(--editorial-rule)", paddingBottom: "12px" }}
          >
            Available Departments ({computedDepartmentList.length})
          </p>

          {/* Empty Catalog State (logic untouched) */}
          {computedDepartmentList.length === 0 ? (
            <div
              className="py-16 text-center"
              style={{ borderTop: "var(--editorial-rule)" }}
            >
              <p className="mono-label">
                No departments are currently available for application.
              </p>
            </div>
          ) : (
            <>
              {/* ── Featured row — top 2 departments: side-by-side horizontally on desktop ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.06] mb-px">
                {computedDepartmentList.slice(0, 2).map((department) => (
                  <div key={department.name} className="bg-[#0a0a0a]">
                    <DepartmentCard department={department} featured />
                  </div>
                ))}
              </div>

              {/* ── Standard grid — remaining 10 departments ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06]">
                {computedDepartmentList.slice(2).map((department) => (
                  <div key={department.name} className="bg-[#0a0a0a]">
                    <DepartmentCard department={department} />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Popup — all data/logic untouched */}
      <PopupComp isOpen={isPopupOpen} onClose={closePopup} PopupData={popupData} />

      <Footer />
    </main>
  );
};

export default DepartmentsListPage;
