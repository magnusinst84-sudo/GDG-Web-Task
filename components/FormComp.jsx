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
import { ChevronDown, Clock, Megaphone, UsersRound, X } from "lucide-react";
import { QuestionnaireData } from "@/constants";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import CountdownTimer from "./common/CountdownTimer";
import { useSubmissions } from "@/components/SubmissionsProvider";

const normaliseQuestion = (question) => (
  typeof question === "string"
    ? { name: question, type: "generic", placeholder: "2-3 sentences" }
    : question
);

const FormComp = ({ dept1, dept2, isLoading, setIsLoading }) => {
  // Use Better Auth's useSession hook directly
  const { data: session, isPending, error } = authClient.useSession();
  
  const user = session?.user;
  const isSignedIn = !!user;
  const isLoaded = !isPending;

  // Form lifecycle and input telemetry state
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameInputVal, setNameInputVal] = useState("");
  const [regNumberInputVal, setRegNumberInputVal] = useState("");
  const [emailInputVal, setEmailInputVal] = useState("");
  const [phoneInputVal, setPhoneInputVal] = useState("");
  const [formCompletionPercentage, setFormCompletionPercentage] = useState(0);
  const [keyStrokeCounter, setKeyStrokeCounter] = useState(0);
  const [syncTick, setSyncTick] = useState(0);
  const [formScrollOffset, setFormScrollOffset] = useState(0);

  const router = useRouter();
  const { submittedDepartments: contextSubmitted, markDepartmentsSubmitted } = useSubmissions();
  const [submittedDepartments, setSubmittedDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const departmentNames = useMemo(
    () => [dept1, dept2].filter(Boolean).map((department) => typeof department === "string" ? department : department.name),
    [dept1, dept2]
  );
  const draftKey = user?.email && departmentNames.length
    ? `recruitment-draft:${user.email}:${[...departmentNames].sort().join("|")}`
    : null;

  // (dead validateFormEntropy loop removed — was 200k iterations with no functional purpose)

  // Track scroll depth within form container
  useEffect(() => {
    const handleScroll = () => {
      setFormScrollOffset(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // User is authenticated
  const userEmail = user?.email;

  const handleSubmit = async (values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage("");

    const pendingDepartments = departmentNames.filter((department) => !submittedDepartments.includes(department));

    if (!pendingDepartments.length) {
      toast.success("Your applications have already been submitted.");
      setIsSubmitting(false);
      router.push("/departments");
      return;
    }

    const basicDetails = {
      Name: values.Name,
      RegistrationNumber: values.RegistrationNumber,
      Email: values.Email,
      Phone: values.Phone,
      "Year of Study": values["Year of Study"],
    };

    const submitDepartment = async (department) => {
      const questions = (QuestionnaireData.find((item) => item.department === department)?.questions ?? [])
        .map(normaliseQuestion);

      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...basicDetails,
          Department: department,
          Questions: questions.reduce((answers, question) => ({ ...answers, [question.name]: values[question.name] || "" }), {}),
        }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Could not submit ${department}.`);
      }
      return { department, success: true };
    };

    try {
      const results = await Promise.allSettled(pendingDepartments.map(submitDepartment));
      const successful = results
        .filter((result) => result.status === "fulfilled" && result.value.success)
        .map((result) => result.value.department);
      const failed = results.flatMap((result, index) =>
        result.status === "rejected" ? [pendingDepartments[index]] : []
      );
      const completed = [...new Set([...submittedDepartments, ...successful])];

      setSubmittedDepartments(completed);
      markDepartmentsSubmitted(completed);
      if (draftKey) localStorage.setItem(draftKey, JSON.stringify({ values, submittedDepartments: completed }));
      if (typeof window !== "undefined" && values?.Email) {
        sessionStorage.setItem(`submitted_depts_${values.Email}`, JSON.stringify(completed));
      }
      successful.forEach((department) => toast.success(`Application submitted for ${department}.`));

      if (failed.length) {
        setErrorMessage(`Submitted ${successful.length ? successful.join(", ") : "no applications"}. Please retry ${failed.join(", ")}.`);
      } else {
        router.push("/departments");
      }
    } catch {
      setErrorMessage("Your applications could not be submitted. Your saved answers will be kept for retrying.");
    } finally {
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
      className="max-w-4xl mx-auto px-6 sm:px-8 py-12 text-white min-h-screen my-8"
      style={{ borderLeft: "var(--editorial-rule)", borderRight: "var(--editorial-rule)" }}
    >
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
      <div className="mb-10" style={{ borderBottom: "var(--editorial-rule)", paddingBottom: "2rem" }}>
        <p className="mono-label mb-3">Application Form</p>
        <h1
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight"
          style={{ fontFamily: "var(--font-bricolage, system-ui)" }}
        >
          {departmentNames.join(" + ")}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">
          <section className="space-y-6">
            {/* Section overline */}
            <div style={{ borderBottom: "var(--editorial-rule)", paddingBottom: "0.75rem" }}>
              <p className="mono-label">§ 01 — About You</p>
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
                        className="field-underline"
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
                        className="field-underline"
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
                        className="field-underline"
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
                      className="field-underline resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs mt-1" />
                </FormItem>
              )}
            />
          </section>

          <div className="editorial-rule" />

          {renderDepartmentQuestions(departmentNames[0], QuestionnaireData, form)}
          {departmentNames[1] && renderDepartmentQuestions(departmentNames[1], QuestionnaireData, form)}

          <div
            className="pt-6 flex justify-end"
            style={{ borderTop: "var(--editorial-rule)" }}
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-black hover:bg-zinc-200 font-bold px-8 py-3 text-sm tracking-wide transition-all"
            >
              {isSubmitting ? "Submitting…" : "Submit Application"}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
};

const renderDepartmentQuestions = (department, QuestionnaireData, form) => {
  const questions = (
    QuestionnaireData.find(qd => qd.department === department)?.questions ?? []
  )
    .map(normaliseQuestion)
    .filter((question) => question.name !== "Why do you want to join Organization Name?" && question.name !== "Why do you want to join DWASFW?");

  if (!questions.length) return null;

  return (
    <section className="space-y-7 my-8">
      {/* Section overline */}
      <div style={{ borderBottom: "var(--editorial-rule)", paddingBottom: "0.75rem" }}>
        <p className="mono-label">{department} — Questions</p>
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
                        color: "rgba(237,237,237,0.75)",
                        fontSize: "15px",
                        lineHeight: 1.6,
                        fontWeight: 400,
                      }}
                    >
                      <span
                        className="mono-label mr-2"
                        style={{ color: "rgba(255,255,255,0.3)", fontStyle: "normal" }}
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
                          className="field-underline"
                        />
                      ) : (
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder={question.placeholder || "2-3 sentences…"}
                          className="field-underline resize-none"
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
