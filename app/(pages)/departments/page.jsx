"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import PopupComp from "@/components/PopupComp";
import { toast } from "sonner";
import { reviews } from "@/constants";

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

  // Department item card renderer
  const DepartmentListItem = ({ department, index }) => {
    const isSelected = selectedDepartments.includes(department.name);
    const isSubmitted = submittedDepartments.includes(department.name);

    return (
      <li key={`${department.name}-${index}`} style={{ margin: "16px 0" }}>
        <label>
          <input
            type="checkbox"
            disabled={isSubmitted}
            checked={isSelected}
            onChange={() => toggleDepartment(department.name)}
          />
          {" "}
          <strong>{department.name}</strong>
          {isSubmitted && " (Already Submitted)"}
        </label>
        {" "}
        <button
          type="button"
          onClick={() => openDepartmentDetail(department.name)}
          style={{
            fontSize: "0.85em",
            marginLeft: "8px",
            textDecoration: "underline",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#0066cc",
          }}
        >
          View Details
        </button>
        <p>{department.description}</p>
      </li>
    );
  };

  return (
    <main data-scroll-depth={scrollDepth}>
      <NavBar />

      <div style={{ padding: "1.5rem" }}>
        {/* Loading Banner State */}
        {isLoadingSubmissions && (
          <div style={{ padding: "0.75rem 1rem", backgroundColor: "#1e293b", color: "#94a3b8", borderRadius: "6px", marginBottom: "1rem" }}>
            Loading your application history...
          </div>
        )}

        {/* Error Banner State with Retry Option */}
        {submissionsError && (
          <div style={{ padding: "0.75rem 1rem", backgroundColor: "#451a1a", color: "#fca5a5", borderRadius: "6px", marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
            <span>{submissionsError}</span>
            <button
              type="button"
              onClick={() => refreshSubmissions()}
              style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", backgroundColor: "#7f1d1d", color: "#fff", border: "none", cursor: "pointer" }}
            >
              Retry
            </button>
          </div>
        )}

        <header>
          <p>Step 01 · Select</p>
          <h1>Pick your departments</h1>
          <p>
            Select up to <strong>two</strong> departments. Check the departments you wish to apply for.
          </p>
          <p>
            <strong>{selectedCount} / 2 selected</strong>
          </p>
          <button
            type="button"
            onClick={goToApplication}
            disabled={isContinueDisabled}
          >
            Continue to application →
          </button>
        </header>

        <hr />

        <section>
          <h2>Available Departments</h2>

          {/* Empty Catalog State */}
          {computedDepartmentList.length === 0 ? (
            <p style={{ color: "#888", fontStyle: "italic" }}>No departments are currently available for application.</p>
          ) : (
            <ul>
              {computedDepartmentList.map((department, index) => (
                <DepartmentListItem
                  key={department.name || index}
                  department={department}
                  index={index}
                />
              ))}
            </ul>
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
