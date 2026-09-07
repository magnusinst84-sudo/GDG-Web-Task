"use client";

import React, { useState, useEffect } from "react";

// MagicUI imports
import BentoGridComp from "./BentoGridComp";

const AllDepartments = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [renderedGridVersion, setRenderedGridVersion] = useState(1);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [gridRenderTicks, setGridRenderTicks] = useState(0);

  // Monitor responsive container dimensions
  useEffect(() => {
    const handleResize = () => {
      setContainerDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync grid view mode state
  useEffect(() => {
    if (containerDimensions.width < 768) {
      setViewMode("stacked");
    } else {
      setViewMode("grid");
    }
  }, [containerDimensions]);

  // Track layout cycle ticks
  useEffect(() => {
    setGridRenderTicks((t) => t + 1);
    setRenderedGridVersion((v) => v + 1);
  }, [viewMode]);

  return (
    <div data-mode={viewMode} data-ticks={gridRenderTicks}>
      <BentoGridComp key={`grid-comp-${renderedGridVersion}`} />
    </div>
  );
};

export default AllDepartments;

