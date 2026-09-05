"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import PopupComp from "@/components/PopupComp";
import { toast } from "sonner";
import { reviews } from "@/constants";
import { cn } from "@/lib/utils";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage-grotesque",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

import { useSubmissions } from "@/components/SubmissionsProvider";

const departments = reviews;

const DepartmentsListPage = () => {
  const router = useRouter();
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const { submittedDepartments, isLoadingSubmissions, submissionsError, refreshSubmissions } = useSubmissions();

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

  // Track window scroll coordinates for responsive styling
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
      description: dept?.description || "No description available for this department.",
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
      toast.error(`You have already submitted an application for ${departmentName}.`);
      return;
    }

    if (remainingSlots <= 0) {
      toast.error("You have already submitted the maximum allowed (2) applications.");
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

  const DepartmentListItem = ({ department, index }) => {
    const isSelected = selectedDepartments.includes(department.name);
    const isSubmitted = submittedDepartments.includes(department.name);

    return (
      <div
        key={`${department.name}-${index}`}
        className={cn(
          "relative p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-4",
          isSelected
            ? "bg-zinc-900 border-white/40 ring-1 ring-white/20 shadow-lg"
            : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40",
          isSubmitted && "opacity-75 bg-zinc-900/30 border-zinc-800"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              disabled={isSubmitted}
              checked={isSelected}
              onChange={() => toggleDepartment(department.name)}
              className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-white focus:ring-zinc-600 focus:ring-offset-zinc-950 cursor-pointer disabled:cursor-not-allowed"
            />
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                {department.name}
                {isSubmitted && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-normal">
                    Submitted
                  </span>
                )}
                {isSelected && !isSubmitted && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white text-black font-semibold">
                    Selected
                  </span>
                )}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openDepartmentDetail(department.name)}
            className="text-xs font-medium text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            Details
          </button>
        </div>

        <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
          {department.description}
        </p>
      </div>
    );
  };

  return (
    <main data-scroll-depth={scrollDepth} className="min-h-screen bg-black text-white flex flex-col justify-between">
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-grow">
        {/* Loading Banner State */}
        {isLoadingSubmissions && (
          <div className="p-4 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg mb-6 text-sm flex items-center gap-3">
            <span className="h-4 w-4 rounded-full border-2 border-zinc-600 border-t-white animate-spin" />
            Loading your application history...
          </div>
        )}

        {/* Error Banner State with Retry Option */}
        {submissionsError && (
          <div className="p-4 bg-red-950/70 border border-red-800/80 text-red-200 rounded-lg mb-6 text-sm flex justify-between items-center gap-4">
            <span>{submissionsError}</span>
            <button
              type="button"
              onClick={() => refreshSubmissions()}
              className="px-3 py-1 bg-red-900 hover:bg-red-800 text-white rounded text-xs font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <header className="mb-8 bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-mono tracking-wider uppercase text-zinc-500">Step 01 · Select</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Pick your departments</h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              Select up to <strong className="text-white">two</strong> departments you wish to apply for.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
            <div className="text-left sm:text-right">
              <span className="text-2xl font-bold text-white block">
                {selectedCount} <span className="text-zinc-500 text-lg">/ 2</span>
              </span>
              <span className="text-xs text-zinc-400">selected</span>
            </div>

            <button
              type="button"
              onClick={goToApplication}
              disabled={isContinueDisabled}
              className={cn(
                "px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2",
                isContinueDisabled
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-white text-black hover:bg-zinc-200 shadow-lg hover:shadow-white/10"
              )}
            >
              Continue to application →
            </button>
          </div>
        </header>

        <section>
          <h2 className="text-xl font-bold text-zinc-200 mb-4 tracking-tight">Available Departments</h2>

          {/* Empty Catalog State */}
          {computedDepartmentList.length === 0 ? (
            <p className="text-zinc-500 italic py-8 text-center bg-zinc-950 rounded-xl border border-zinc-900">
              No departments are currently available for application.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {computedDepartmentList.map((department, index) => (
                <DepartmentListItem
                  key={department.name || index}
                  department={department}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <PopupComp
        isOpen={isPopupOpen}
        onClose={closePopup}
        PopupData={popupData}
      />

      <Footer />
    </main>
  );
};

export default DepartmentsListPage;
