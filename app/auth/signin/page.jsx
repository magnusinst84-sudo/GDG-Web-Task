"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bricolage_Grotesque } from "next/font/google";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import DWASFWLoader from "@/components/GDGLoader";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage-grotesque",
});

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user && !isPending) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <DWASFWLoader />;
  }

  if (session?.user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mono-label" style={{ color: "rgba(255,255,255,0.4)" }}>
            REDIRECTING...
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (mode === "signup" && !name) {
      toast.error("Please enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        });
        if (res?.error) {
          toast.error(res.error.message || "Failed to create account.");
        } else {
          toast.success("Account created successfully!");
          router.push("/");
        }
      } else {
        const res = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (res?.error) {
          toast.error(res.error.message || "Invalid credentials.");
        } else {
          toast.success("Signed in successfully!");
          router.push("/");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error("Authentication failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: "#0a0a0a" }}
    >
      {/* Background ambient radial gradient glows */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: "50%",
          height: "60%",
          background:
            "radial-gradient(ellipse at center, rgba(56,189,248,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "15%",
          right: "15%",
          width: "45%",
          height: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(168,85,247,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Main Container Card */}
      <div
        className="relative z-10 w-full max-w-md p-8 sm:p-10"
        style={{
          background: "rgba(18, 18, 18, 0.75)",
          backdropFilter: "blur(12px)",
          border: "var(--editorial-rule)",
        }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <span
            className="mono-label block mb-2"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            RECRUITMENT 2026 · CANDIDATE PORTAL
          </span>
          <h1
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight"
            style={{ fontFamily: bricolageGrotesque.style.fontFamily }}
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h1>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          className="grid grid-cols-2 gap-px mb-8"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="mono-label py-2.5 text-center transition-colors"
            style={{
              background: mode === "signin" ? "#0a0a0a" : "transparent",
              color: mode === "signin" ? "#ffffff" : "rgba(255,255,255,0.4)",
              fontWeight: mode === "signin" ? "600" : "400",
            }}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className="mono-label py-2.5 text-center transition-colors"
            style={{
              background: mode === "signup" ? "#0a0a0a" : "transparent",
              color: mode === "signup" ? "#ffffff" : "rgba(255,255,255,0.4)",
              fontWeight: mode === "signup" ? "600" : "400",
            }}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "signup" && (
            <div>
              <label
                htmlFor="name"
                className="mono-label block mb-2"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                FULL NAME
              </label>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-editorial w-full px-0 py-2 bg-transparent border-b border-white/20 text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mono-label block mb-2"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-editorial w-full px-0 py-2 bg-transparent border-b border-white/20 text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mono-label block mb-2"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-editorial w-full px-0 py-2 bg-transparent border-b border-white/20 text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-editorial w-full justify-center"
              style={submitting ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              {submitting
                ? "PROCESSING..."
                : mode === "signin"
                ? "SIGN IN →"
                : "CREATE ACCOUNT →"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
