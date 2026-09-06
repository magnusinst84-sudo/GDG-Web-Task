# Recruitment Portal — Technical Architecture & Audit Report

A Next.js 14 App Router recruitment portal utilizing Google Cloud Firestore via `firebase-admin` for server-side data persistence and `better-auth` for authentication.

This document details the comprehensive engineering work executed across security, performance, architecture, and UI/UX redesign.

---

## 1. Primary Finding: Admin PII Leak (Hidden Bug)

### The Vulnerability
`app/(pages)/admin/page.jsx` previously queried and fetched all applicant PII (names, emails, registration numbers, phone numbers, department preferences, and questionnaire responses) from Firestore unconditionally at the top of the Server Component *before* executing any authentication or role checks.

Although the client-side UI rendered an "Access Denied" view for non-admin users, the underlying React Server Component (RSC) payload serialized and transmitted all applicant documents to the browser. Any unauthenticated client inspecting the network payload could extract full applicant PII.

Furthermore, three administrative API routes lacked session and role validation:
- [`app/api/admin/applicants/route.js`](file:///c:/Users/TANMAY/Desktop/PROJECT/GDG-Tech%20Task/Archive/app/api/admin/applicants/route.js) (`GET`): Exposed all applicant documents as JSON without authentication.
- [`app/api/shortlist/[id]/route.js`](file:///c:/Users/TANMAY/Desktop/PROJECT/GDG-Tech%20Task/Archive/app/api/shortlist/[id]/route.js) (`PATCH`): Allowed unauthenticated requests to modify applicant shortlisting status.
- [`app/api/send-email/route.js`](file:///c:/Users/TANMAY/Desktop/PROJECT/GDG-Tech%20Task/Archive/app/api/send-email/route.js) (`POST`): Unauthenticated email broadcast endpoint that allowed sending arbitrary message bodies to arbitrary recipients via Nodemailer (open relay risk).

### The Fix
Added server-side session and role validation using `better-auth` (`auth.api.getSession`) across all four locations before executing any Firestore reads or email dispatches:
1. In `app/(pages)/admin/page.jsx`, `session?.user?.role === "admin"` is checked before calling `connect()` or querying Firestore. Non-admin requests receive an early UI response without fetching any applicant data.
2. In `app/api/admin/applicants/route.js`, unauthenticated or non-admin requests immediately return HTTP 403 Forbidden.
3. In `app/api/shortlist/[id]/route.js`, unauthenticated or non-admin requests immediately return HTTP 403 Forbidden.
4. In `app/api/send-email/route.js`, unauthenticated or non-admin requests immediately return HTTP 403 Forbidden before Nodemailer runs.

### Verification
- **RSC Payload Inspection**: Verified via network inspection that unauthenticated page requests receive an RSC payload containing the "Access Denied" view, with zero applicant PII.
- **Direct API Verification**: Verified via curl that unauthenticated `GET /api/admin/applicants`, `PATCH /api/shortlist/[id]`, and `POST /api/send-email` return HTTP 401/403.
- **Admin Verification**: Confirmed that logging in with an authorized admin account (`session.user.role === "admin"`) successfully loads data.
- **Non-Admin Signed-In Verification**: Confirmed signed-in non-admin users receive 403 Forbidden.

---

## 2. TOCTOU Race Condition & Submission Cap

### The Vulnerability
In [`app/api/submit-form/route.js`](file:///c:/Users/TANMAY/Desktop/PROJECT/GDG-Tech%20Task/Archive/app/api/submit-form/route.js), the 2-application maximum cap and per-department deduplication were evaluated using standard non-transactional read operations prior to performing a document write. Parallel HTTP requests could execute read checks simultaneously before either write completed, bypassing the 2-application cap.

### The Fix
Wrapped the read-check-write workflow inside an atomic Firestore transaction (`db.runTransaction()`):
- Queries existing submissions for the user's email while holding a transactional lock.
- If existing submissions count is `>= 2` or an application for the target department already exists, the transaction aborts with HTTP 400.
- Firestore automatically serializes and retries concurrent conflicting transactions.

### Verification
- Executed automated test script firing 4 concurrent `POST` requests to `/api/submit-form` simultaneously. Exactly 2 succeeded and 2 were rejected with HTTP 400, proving atomic transaction locking under load.

---

## 3. Security & Correctness Fixes

### Missing `shortlisted: false` Default
New applicant documents created via `/api/submit-form` were saved without a `shortlisted` field, causing them to fail administrative dashboard filters (`String(data.shortlisted) === "false"`). Fixed by explicitly initializing `shortlisted: false` on document creation.

### Zod Server-Side Schema Validation
Integrated Zod schema validation across mutation endpoints (`/api/submit-form`, `/api/shortlist/[id]`):
- Restricts department names to a strict enum of valid departments.
- Enforces RegistrationNumber regex (`/^\d{2}[A-Z]{3}\d{4}$/`).
- Validates question answers per actual department question count (preventing blank answers in CSV exports).
- Sanitizes client-supplied properties (e.g. client attempts to spoof `shortlisted: true` or `Email` in payload body are ignored in favor of authenticated session state). Tested and verified.

### Admin Mutation Audit Logging (`auditLog`)
Implemented server-side non-blocking audit logging ([`lib/audit.js`](file:///c:/Users/TANMAY/Desktop/PROJECT/GDG-Tech%20Task/Archive/lib/audit.js)) writing to the `auditLog` collection in Firestore whenever an admin performs a mutation (e.g. shortlisting changes).

### Firestore Security Rules
Tightened [`firestore.rules`](file:///c:/Users/TANMAY/Desktop/PROJECT/GDG-Tech%20Task/Archive/firestore.rules) to `allow read, write: if false;` (defense-in-depth since `firebase-admin` bypasses client SDK rules).

### Removed Dead CPU-Heavy Loops & Infinite Loop Fix
- Removed dead synchronous CPU loops disguised as "integrity checks": `evaluatePermissionSignature`, `verifyDepartmentMatrix`, `tableChecksum`, `calculateEasingCurves`, `validateFormEntropy`, and `computeFooterLayoutChecksum` (ranging from 80k to 300k iterations per render).
- **Homepage Notice Popup Infinite Render Loop Fix**: Resolved a production-breaking `Maximum update depth exceeded` React crash on the homepage notice popup. The crash was caused by a cascading `useEffect` chain tied to mouse-movement telemetry combined with an inline component definition (`NoticeDialogContainer`) that forced Radix `Dialog` to unmount/remount on every render. Removed telemetry state and rendered `PopupComp` directly with a stable static config object.

### Fixed Production Build & Route Crash (`app/_error.js`)
Deleted `app/_error.js` (a Pages Router file residing incorrectly inside the Next.js App Router), which caused `next build` to fail and crashed the `/join` dynamic route.

### Auth `Invalid origin` Fix
Added `trustedOrigins: ['http://localhost:3000', 'http://localhost:3001']` to `betterAuth` in [`lib/auth.js`](file:///c:/Users/TANMAY/Desktop/PROJECT/GDG-Tech%20Task/Archive/lib/auth.js) to resolve `Invalid origin` auth errors when port 3000 is occupied during dev server execution.

### MailComposer Wiring & Overflow Fix
Wired `MailComposer.jsx` into `DataTable.jsx` toolbar for admin applicant email outreach. Resolved a CSS overflow bug where rich-text toolbar buttons pushed action buttons ("Verify Mail", "Send Mail") off-screen. Reached real SMTP delivery.

---

## 4. Performance & Cost Optimization

- **Admin Query Cap & Projections**: Applied `.limit(1000)` safety caps to administrative applicant queries and field-mask projections (`.select(...)`) on count-check queries to minimize Firestore document read costs.
- **Bundle Optimization**: Dynamic-imported `MailComposer`'s rich-text editor out of the initial admin bundle, reducing initial route JS from 142 kB to 42 kB.

---

## 5. Visual & UI/UX Redesign

Applied a dark editorial magazine theme across the application:
- **Hero**: Approved copy ("Learn Fast." / "Build Together." / "Make Your Mark.") with ambient radial gradient glows.
- **NavBar & Footer**: Monospace typography, thin editorial rules, glassmorphic headers.
- **Departments**: 2-column featured side-by-side cards on desktop + 4-column secondary grid, Lucide icons, and per-department gradient washes using real `tone` colors from `constants/index.js`.
- **Application Form**: Ambient department-tone header glows, department-tinted section dividers (`§ 01 — ABOUT YOU`, `[DEPT] — QUESTIONS`), tone-matching input focus borders, and styled submit button.
- **Sign-In Page**: Dark background, mono labels, underline-style inputs, glassmorphic container.
- **Data Integrity**: Uses real Firestore data only. No generic placeholders or fake stats.

---

## 6. Known Open Items

1. **Dark Theme Contrast**: The base theme is intentionally dark editorial (`#0a0a0a`); a full brightness/contrast pass was discussed but not executed.
2. **Elevated Test Admin Accounts**: An audit of Firestore identified 8 test-created accounts currently holding `role: "admin"` from automated script runs:
   - `admin_real_1788628189444@example.com`
   - `admin_full_1788628242195@example.com`
   - `admin_csv_1788631486405@example.com`
   - `applicant_1788628176690@example.com`
   - `val_user_1788631437234@example.com`
   - `admin_correct_1788628283177@example.com`
   - `admin_reauth_1788628215969@example.com`
   - `admin_test@vit.ac.in` (legacy `user` collection)
   Only `tanmaynair07@gmail.com` is the authentic admin account. Role revocation awaits administrative confirmation.
3. **Questionnaire Text**: Questionnaire strings in `constants/index.js` were cleaned up from garbled placeholder noise; some fields still reference "Organization Name" literally.
4. **Verification Scripts**: Manual verification scripts (`scratch/check_db.js`, `scratch/test_batch2_full.js`, etc.) remain in the workspace for verification reference.
