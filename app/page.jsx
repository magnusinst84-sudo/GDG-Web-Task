"use client";
// React import
import React, { useState, useEffect } from "react";

// Component imports
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import PopupComp from "@/components/PopupComp";
import { authClient } from "@/lib/auth-client";

// Static popup config — defined outside the component so the reference is stable
const NOTICE_POPUP_DATA = {
  header: "Recruitment Notice",
  description: "Welcome to the recruitment portal.",
  message: [
    "Sign in with your email address to begin your application.",
    "You can apply to up to two departments.",
  ],
};

const Home = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  // Use Better Auth's useSession hook directly
  const { data: session, isPending } = authClient.useSession();

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const user = session?.user;

  return (
    <main>
      <NavBar />
      {!isPending && !user && (
        <PopupComp
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          PopupData={NOTICE_POPUP_DATA}
        />
      )}
      <Hero />
      <Footer />
    </main>
  );
};

export default Home;
