import React, { useEffect, useMemo, useState } from "react";
import * as z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { QuestionnaireData, reviews } from "@/constants";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useSubmissions } from "@/components/SubmissionsProvider";
import { hexToRgba } from "@/lib/utils";

const normaliseQuestion = (question) => (
  typeof question === "string"
    ? { name: question, type: "generic", placeholder: "2-3 sentences" }
    : question
);

// Map department names to their tone hex color
const getDeptTone = (deptName) => {
  if (!deptName) return "#8ab4f8";
  const match = reviews.find(
    (r) => r.name.toLowerCase() === deptName.toLowerCase()
  );
  return match?.tone || "#8ab4f8";
};

const FormComp = ({ dept1, dept2, isLoading, setIsLoading }) => {
  // Use Better Auth's useSession hook directly
  const { data: session, isPending } = authClient.useSession();
  
  const user = session?.user;
  const isSignedIn = !!user;
  const isLoaded = !isPending;

  // Form lifecycle state
  const [isFormOpen] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { submittedDepartments: contextSubmitted, markDepartmentsSubmitted } = useSubmissions();
  const [submittedDepartments, setSubmittedDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDraftReady, setIsDraftReady] = useState(false);

  const departmentNames = useMemo(
    () => [dept1, dept2].filter(Boolean).map((department) => typeof department === "string" ? department : department.name),
    [dept1, dept2]
  );

  const dept1Tone = useMemo(() => getDeptTone(departmentNames[0]), [departmentNames]);
  const dept2Tone = useMemo(() => getDeptTone(departmentNames[1]), [departmentNames]);

  const draftKey = user?.email && departmentNames.length
    ? `recruitment-draft:${user.email}:${[...departmentNames].sort().join("|")}`
    : null;

  // Check application count when user is loaded
  useEffect(() => {
    if (user) {
      const userEmail = user.email;
      checkApplicationCount(userEmail);
    }
  }, [user]);

  // Function to check application count
  async function checkApplicationCount(userEmail) {
    const checkResponse = await fetch(
      `/api/check-applications?email=${userEmail}`
    );
    const { count } = await checkResponse.json();

    if (count >= 2) {
      setErrorMessage(
        "Remember that you can only submit upto 2 unique applications"
      );
      setIsSubmitting(false);
      return;
    }
  }

  const normalizeDeptName = (str) => (str ? str.trim().toLowerCase().replace(/\s*\/\s*/g, "/") : "");

  const questionData = useMemo(
    () => [...new Set(departmentNames.flatMap((department) =>
      (QuestionnaireData.find((item) => normalizeDeptName(item.department) === normalizeDeptName(department))?.questions ?? [])
        .map(normaliseQuestion)
        .map((question) => question.name)
    ))],
    [departmentNames]
  );

  const schemaObj = {
    Name: z.string().min(1, "Name is required"),
    RegistrationNumber: z
      .string()
      .min(1, "Registration number is required")
      .regex(
        /^\d{2}[A-Z]{3}\d{4}$/,
        "Registration number must be 2 numbers, 3 uppercase letters, and 4 numbers (e.g. 25BCE5612)"
      ),
    Email: z.string(),
    Phone: z
      .string()
      .min(1, "Phone is required")
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    "Year of Study": z.string().optional(),
  };

  questionData.forEach((qd) => {
    schemaObj[qd] = z.string().trim().min(1, "Answer is required");
  });

  const formSchema = z.object(schemaObj);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Name: "",
      RegistrationNumber: "",
      Email: "",
      Phone: "",
    },
  });

  useEffect(() => {
    if (!isLoaded || !user || !draftKey) return;

    const email = user.email;
    let isActive = true;
    setIsDraftReady(false);

    try {
      const savedDraft = JSON.parse(localStorage.getItem(draftKey) || "{}");
      form.reset({ ...form.getValues(), ...savedDraft.values, Email: email });
    } catch {
      form.setValue("Email", email);
    }

    async function initialiseForm() {
      const savedDraft = JSON.parse(localStorage.getItem(draftKey) || "{}");
      let remoteSubmitted = contextSubmitted || [];

      if (!remoteSubmitted.length) {
        const cacheKey = `submitted_depts_${email}`;
        const cached = typeof window !== "undefined" ? sessionStorage.getItem(cacheKey) : null;

        if (cached) {
          try {
            remoteSubmitted = JSON.parse(cached);
          } catch {}
        } else {
          try {
            const response = await fetch(`/api/check-applications?email=${encodeURIComponent(email)}`);
            const result = await response.json();
            if (result?.submittedDepartments) {
              remoteSubmitted = result.submittedDepartments;
              if (typeof window !== "undefined") {
                sessionStorage.setItem(cacheKey, JSON.stringify(remoteSubmitted));
              }
            }
          } catch (err) {
            console.error("Failed to check applications:", err);
          }
        }
      }

      if (!isActive) return;
      const completed = [...new Set([...(savedDraft.submittedDepartments || []), ...remoteSubmitted])];
      setSubmittedDepartments(completed);
      if (departmentNames.length > 0 && departmentNames.every((dept) => completed.includes(dept))) {
        setErrorMessage(`You have already submitted an application for ${departmentNames.join(" and ")}.`);
      }
      localStorage.setItem(draftKey, JSON.stringify({ values: form.getValues(), submittedDepartments: completed }));
      setLoading(false);
      setIsDraftReady(true);
    }

    initialiseForm().catch(() => {
      if (isActive) {
        setLoading(false);
        setIsDraftReady(true);
      }
    });

    return () => { isActive = false; };
  }, [contextSubmitted, departmentNames, draftKey, form, isLoaded, user]);

  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    if (!isDraftReady || !draftKey) return;
    localStorage.setItem(draftKey, JSON.stringify({ values: watchedValues, submittedDepartments }));
  }, [draftKey, isDraftReady, submittedDepartments, watchedValues]);

  // Check if user is authenticated
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <span className="mx-auto mb-4 block h-8 w-8 animate-spin rounded-full border border-white/20 border-t-white/70" />
          <p className="mono-label mt-3">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-6">
        <div
          className="text-center py-12 px-8 max-w-sm"
          style={{ border: "var(--editorial-rule)" }}
        >
          <p className="mono-label mb-4">Sign In Required</p>
          <p className="text-zinc-400 text-sm mb-8">
            Please sign in to access the application form.
          </p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="btn-editorial"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (values) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const successful = [];
      const failed = [];

      for (const department of departmentNames) {
        if (submittedDepartments.includes(department)) continue;

        const payload = {
          Email: values.Email,
          Name: values.Name,
          RegistrationNumber: values.RegistrationNumber,
          Department: department,
          Phone: values.Phone,
          Answers: values,
        };

        const response = await fetch("/api/submit-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          successful.push(department);
        } else {
          failed.push(department);
        }
      }

      const completed = [...new Set([...submittedDepartments, ...successful])];

      setSubmittedDepartments(completed);
      markDepartmentsSubmitted(completed);
      if (draftKey) localStorage.setItem(draftKey, JSON.stringify({ values, submittedDepartments: completed }));

      if (successful.length) {
        successful.forEach((dept) => toast.success(`Application submitted for ${dept}.`));
      }

      if (failed.length) {
        setErrorMessage(`Failed to submit for: ${failed.join(", ")}`);
        setIsSubmitting(false);
      } else {
        router.push("/departments");
      }
    } catch {
      setErrorMessage("An error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <p className="mono-label">Checking your application status…</p>
      </div>
    );
  }

  if (!isFormOpen) {
    return (
      <div
        className="max-w-md mx-auto my-16 px-8 py-10 text-center"
        style={{ border: "var(--editorial-rule)" }}
      >
        <p className="mono-label mb-3">Recruitment Closed</p>
        <p className="text-zinc-500 text-sm">Recruitment has now been terminated.</p>
      </div>
    );
  }

  return (
    <main
      className="max-w-4xl mx-auto px-6 sm:px-8 py-12 text-white min-h-screen my-8 relative overflow-hidden"
      style={{ borderLeft: "var(--editorial-rule)", borderRight: "var(--editorial-rule)" }}
    >
      {/* Subtle radial header glow behind department title */}
      <div
        className="absolute top-0 left-0 right-0 h-96 pointer-events-none z-0"
        style={{
          background: departmentNames.length === 2
            ? `radial-gradient(ellipse at 30% 0%, ${hexToRgba(dept1Tone, 0.15)} 0%, rgba(10,10,10,0) 60%), radial-gradient(ellipse at 70% 0%, ${hexToRgba(dept2Tone, 0.15)} 0%, rgba(10,10,10,0) 60%)`
            : `radial-gradient(ellipse at 50% 0%, ${hexToRgba(dept1Tone, 0.2)} 0%, rgba(10,10,10,0) 70%)`,
        }}
      />

      <div className="relative z-10">
        {/* Error banner */}
        {errorMessage && !isSubmitting && (
          <div
            className="mb-8 py-4 px-5 flex items-start justify-between gap-4"
            style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}
          >
            <p className="text-red-300 text-sm leading-relaxed">{errorMessage}</p>
            <button
              type="button"
              onClick={() => router.push("/departments")}
              className="mono-label flex-shrink-0"
              style={{
                color: "rgba(252,165,165,0.8)",
                borderBottom: "1px solid rgba(252,165,165,0.3)",
                paddingBottom: "1px",
                background: "none",
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* Editorial header */}
        <div className="mb-10" style={{ borderBottom: `1px solid ${hexToRgba(dept1Tone, 0.3)}`, paddingBottom: "2rem" }}>
          <p className="mono-label mb-3" style={{ color: dept1Tone }}>Application Form</p>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight flex flex-wrap items-center gap-2"
            style={{ fontFamily: "var(--font-bricolage, system-ui)" }}
          >
            <span style={{ color: dept1Tone }}>{departmentNames[0]}</span>
            {departmentNames[1] && (
              <>
                <span className="text-zinc-600 font-normal">+</span>
                <span style={{ color: dept2Tone }}>{departmentNames[1]}</span>
              </>
            )}
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">
            <section className="space-y-6">
              {/* Section overline with subtle tone border */}
              <div style={{ borderBottom: `1px solid ${hexToRgba(dept1Tone, 0.25)}`, paddingBottom: "0.75rem" }}>
                <p className="mono-label" style={{ color: dept1Tone }}>§ 01 — About You</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mono-label block mb-2">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Jane Doe"
                          className="field-underline focus:border-white transition-colors"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="RegistrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mono-label block mb-2">Registration No.</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 25BCE5612"
                          className="field-underline focus:border-white transition-colors"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mono-label block mb-2">Gender</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || ""}
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            borderBottom: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 0,
                            color: field.value ? "#ededed" : "rgba(255,255,255,0.25)",
                            padding: "6px 0",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        >
                          <option value="" disabled style={{ background: "#111" }}>Select Gender</option>
                          <option value="Male" style={{ background: "#111" }}>Male</option>
                          <option value="Female" style={{ background: "#111" }}>Female</option>
                          <option value="Other" style={{ background: "#111" }}>Other</option>
                          <option value="Prefer not to say" style={{ background: "#111" }}>Prefer not to say</option>
                        </select>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mono-label block mb-2">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          type="email"
                          className="field-underline"
                          style={{ opacity: 0.4, cursor: "not-allowed" }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Phone"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="mono-label block mb-2">Phone (WhatsApp)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="10-digit number"
                          className="field-underline focus:border-white transition-colors"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="Why do you want to join Organization Name?"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mono-label block mb-3">
                      Why do you want to join Organization Name?
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="2-3 sentences…"
                        className="field-underline resize-none focus:border-white transition-colors"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs mt-1" />
                  </FormItem>
                )}
              />
            </section>

            <div className="editorial-rule" />

            {renderDepartmentQuestions(departmentNames[0], QuestionnaireData, form, dept1Tone)}
            {departmentNames[1] && renderDepartmentQuestions(departmentNames[1], QuestionnaireData, form, dept2Tone)}

            <div
              className="pt-6 flex justify-end"
              style={{ borderTop: "var(--editorial-rule)" }}
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="font-bold px-8 py-3 text-sm tracking-wide transition-all text-white border"
                style={{
                  backgroundColor: hexToRgba(dept1Tone, 0.2),
                  borderColor: hexToRgba(dept1Tone, 0.6),
                  boxShadow: `0 0 15px ${hexToRgba(dept1Tone, 0.15)}`,
                }}
              >
                {isSubmitting ? "Submitting…" : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
};

const renderDepartmentQuestions = (department, QuestionnaireData, form, accentColor) => {
  const questions = (
    QuestionnaireData.find(qd => qd.department === department)?.questions ?? []
  )
    .map(normaliseQuestion)
    .filter((question) => question.name !== "Why do you want to join Organization Name?" && question.name !== "Why do you want to join DWASFW?");

  if (!questions.length) return null;

  return (
    <section className="space-y-7 my-8">
      {/* Section overline with specific department's tone accent */}
      <div style={{ borderBottom: `1px solid ${hexToRgba(accentColor, 0.3)}`, paddingBottom: "0.75rem" }}>
        <p className="mono-label" style={{ color: accentColor }}>
          {department} — Questions
        </p>
      </div>

      <div className="space-y-8">
        {questions.map((question, idx) => {
          const isCompact = question.type === "short-text";

          return (
            <div key={question.name}>
              <FormField
                control={form.control}
                name={question.name}
                render={({ field }) => (
                  <FormItem>
                    {/* Question number + text in pull-quote style */}
                    <FormLabel
                      className="block mb-3"
                      style={{
                        fontStyle: "italic",
                        color: "rgba(237,237,237,0.85)",
                        fontSize: "15px",
                        lineHeight: 1.6,
                        fontWeight: 400,
                      }}
                    >
                      <span
                        className="mono-label mr-2"
                        style={{ color: accentColor, fontStyle: "normal" }}
                      >
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      {question.name}
                    </FormLabel>
                    <FormControl>
                      {isCompact ? (
                        <Input
                          {...field}
                          placeholder={question.placeholder || "Answer…"}
                          className="field-underline transition-colors"
                          style={{
                            borderColor: "rgba(255,255,255,0.2)",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = accentColor)}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.2)")}
                        />
                      ) : (
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder={question.placeholder || "2-3 sentences…"}
                          className="field-underline resize-none transition-colors"
                          style={{
                            borderColor: "rgba(255,255,255,0.2)",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = accentColor)}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.2)")}
                        />
                      )}
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs mt-1" />
                  </FormItem>
                )}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FormComp;
