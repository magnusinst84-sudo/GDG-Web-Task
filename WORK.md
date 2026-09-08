# WORK.md — Full Change Log

A chronological, categorized log of every change made during this round. For narrative
explanation and interview-ready detail on the highest-value items, see the full
Fix & Optimization Report. This document is the flat changelog reference.

---

## Security Fixes

- **Admin PII leak (primary finding)**: `app/(pages)/admin/page.jsx` fetched all
  applicant data before any auth check, leaking it via the RSC payload. Added
  server-side session+role check before any Firestore access.
- **Unauthenticated admin routes**: `app/api/admin/applicants/route.js` (GET) and
  `app/api/shortlist/[id]/route.js` (PATCH) had zero auth checks. Added session+role
  checks to both.
- **Unauthenticated email endpoint / open relay risk**: `app/api/send-email/route.js`
  accepted arbitrary recipients/content with no auth. Added session+role check before
  any Nodemailer call.
- **TOCTOU race condition**: `submit-form`'s 2-application cap used an unguarded
  read-then-write. Wrapped in `db.runTransaction()`.
- **Client payload spoofing**: server previously trusted client-supplied `Email` and
  `shortlisted` values in some paths. Server now always derives `Email` from the
  session and sets `shortlisted: false` server-side regardless of client input.
- **Server-side schema validation (Zod)**: added to `submit-form` (Department enum,
  RegistrationNumber regex, required non-empty answers per department's real question
  list) and `shortlist/[id]` (strict boolean validation).
- **Dev-mode auth bypass — first occurrence**: `admin/page.jsx` had a
  `!isDev && (...)` guard around its auth check, disabling it whenever
  `NODE_ENV === "development"`. Removed.
- **Dev-mode auth bypass — second occurrence**: `components/AdminContent.jsx` had the
  same pattern independently. Removed in a follow-up pass.
- **`firestore.rules` hardening**: tightened from `allow read, write: if true` to
  `if false` (defense-in-depth; confirmed irrelevant to app function since all access
  goes through `firebase-admin`, which bypasses client rules).
- **Auth "Invalid origin" bug**: `BETTER_AUTH_URL` mismatched the actual dev server
  port. Added `trustedOrigins` array to `lib/auth.js` covering both ports.

## Correctness Fixes

- **Missing `shortlisted: false` default**: new applicant documents never had this
  field set, breaking the admin "Not Shortlisted" filter. Fixed — set explicitly on
  write.
- **Critical form payload mismatch (regression, found via external review)**:
  `FormComp.jsx` sent `{ Answers: values }` instead of the server's expected
  `{ Questions: {...}, "Year of Study": string }` shape, and never rendered a "Year of
  Study" field at all. Every real submission failed. Fixed: added the field, rebuilt
  the payload to send correctly-shaped `Questions` per department.
- **Dead `Preference`/`Pref` field**: present in CSV export, admin table column, and
  TypeScript model but never written by any code path. Removed from all three.
- **Blank questionnaire answers allowed**: client schema had every question
  `.optional()`, server didn't check. Fixed on both sides — server now cross-references
  the department's actual required question list.
- **CSV export readability**: multi-question answers were concatenated into one
  unreadable pipe-separated string per cell. Restructured to `Q:`/`A:` pairs on
  separate lines.

## Bugs Found & Fixed (Runtime/Build)

- **`app/_error.js`**: leftover Pages Router file inside App Router — broke
  `next build` and the `/join` route. Deleted.
- **`tableChecksum` runtime crash**: a leftover reference to a deleted variable in
  `DataTable.jsx`/`AdminContent.jsx` crashed `/admin` at runtime despite a clean build.
  Fixed.
- **Homepage infinite render loop**: a cascading `useEffect` chain plus an inline
  popup component definition caused `Maximum update depth exceeded` crashes on mouse
  movement. Fixed by removing dead telemetry state and hoisting the popup config to a
  stable module-level constant.
- **MailComposer dialog overflow**: toolbar wider than the dialog pushed the
  Verify/Send buttons off-screen, unclickable. Fixed with responsive wrapping/width
  constraints.
- **MailComposer Tiptap stale closure**: editor content wasn't correctly propagating
  to submission state. Fixed.
- **Unstable React keys**: `Departments.jsx` used `Math.random()` in list keys, causing
  unnecessary remounts. Replaced with stable `key={review.id}`.
- **Broken test script path**: `Test-suite/test_auth_session.js` had an incorrect
  relative `require` path. Removed (superseded by the working `.mjs` version).

## Features Added / Completed

- **MailComposer wired up**: was fully built but never imported/rendered anywhere.
  Added trigger button, row-selection binding, and modal state to `DataTable.jsx`.
  Verified reaching real Gmail SMTP delivery.
- **Audit logging**: new `lib/audit.js` + `auditLog` Firestore collection, recording
  admin email, action, target ID, and before/after state on shortlist mutations.
- **"Year of Study" field**: added to the application form (was required server-side
  but never collected — part of the form payload fix above).
- **Department detail popup accent colors**: `PopupComp` now accepts an optional
  `accentColor` prop, used to tint the department "View Details" popup with that
  department's real tone color.

## Performance / Cost Optimizations

- `.limit(1000)` safety cap on the admin Firestore query.
- `.select("Department")` field-mask projections on cap-check queries in `submit-form`.
- Eliminated a redundant read-after-write in the shortlist route.
- `MailComposer`'s Tiptap editor dynamically imported (`next/dynamic`, `ssr: false`)
  out of the initial `/admin` bundle — measured reduction from 142kB to 42kB route JS.
- Standardized API response shapes (`{ success, message, data, error }`) across routes.
- Moved hardcoded submission deadline to an environment variable
  (`SUBMISSION_DEADLINE`) with validation and a safe fallback.

## Dead Code Removed

Roughly 9 separate instances of fake CPU-heavy loops (10,000–300,000 iterations)
computing unused or decorative "security/integrity/checksum" values, found across two
cleanup passes:
`AdminContent.jsx` (`evaluatePermissionSignature`), `DataTable.jsx` (`tableChecksum`),
`departments/page.jsx` (`verifyDepartmentMatrix`), `Hero.jsx`
(`calculateEasingCurves`), `Footer.jsx` (`computeFooterLayoutChecksum`),
`FormComp.jsx` (`validateFormEntropy`), the homepage telemetry counter, `Card.jsx`
(`shadingAcc`), `AllDepartments.jsx` (`density`).

## UI/UX Redesign

Full editorial-magazine visual redesign across NavBar, Hero, Footer, Departments page
(asymmetric featured cards, per-department gradients/icons), application form
(department-tone accents), sign-in page, and admin dashboard. Root styling issue found
and fixed: `app/globals.css` was missing shadcn/Tailwind CSS custom-property
definitions. Full detail and process in `UI.md`.

## Documentation

- Rewrote `README.md` with full technical audit detail: every fix, its vulnerability
  description, the fix applied, and how it was verified.
- Removed dead `file:///C:/Users/...` local-machine links from README, replaced with
  relative repository paths.
- Produced this changelog (`WORK.md`) and a UI process document (`UI.md`).
- Produced a standalone "Complete Fix & Optimization Report" for interview reference.

## Housekeeping

- Normalized line endings (CRLF/LF) across the repository.
- Resolved an unresolved git merge conflict that had been committed directly into
  `README.md`.
- Audited Firestore for test accounts holding `role: admin` from automated test runs;
  revoked/removed all except the legitimate admin account.
- Kept `Test-suite/` (formerly `scratch/`) verification scripts in the repository
  intentionally, as reproducible evidence of testing performed (e.g. the concurrent
  submission race-condition test).

## Known, Explicitly Deferred (Not Done This Round)

- Base theme brightness/contrast pass.
- `DataTable` stale-filter-state edge case.
- Email HTML escaping for applicant-controlled fields.
- Bulk-email rate/recipient limits.
- Production-domain `trustedOrigins` (not needed — local execution only, per
  organizer confirmation).
- Residual "Organization Name" literal text in a few question labels.
