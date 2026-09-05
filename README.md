# Recruitment Portal — Security & Backend Audit Fixes (Round 2)

## 1. Overview

This project is a recruitment portal built as a Next.js 14 monolith (App Router, Server Components, and API routes) utilizing Google Cloud Firestore via `firebase-admin` for data persistence and `better-auth` for user authentication. This document details the technical fixes implemented during Round 2, with primary emphasis on resolving a critical hidden backend vulnerability in response storage and applicant identification.

---

## 2. Primary Finding: Admin PII Leak (Hidden Bug)

### The Vulnerability
`app/(pages)/admin/page.jsx` previously queried and fetched all applicant PII (names, emails, registration numbers, phone numbers, department preferences, and questionnaire responses) from Firestore unconditionally at the top of the Server Component *before* executing any authentication or role checks.

Although the client-side UI rendered an "Access Denied" view for non-admin users, the underlying React Server Component (RSC) payload had already serialized and transmitted all applicant documents to the browser. Any unauthenticated client inspecting the network payload could extract full applicant PII.

Furthermore, two administrative API routes lacked session and role validation:
- `app/api/admin/applicants/route.js` (`GET`): Exposed all applicant documents as JSON without authentication.
- `app/api/shortlist/[id]/route.js` (`PATCH`): Allowed unauthenticated requests to modify applicant shortlisting status.

### The Fix
Added server-side session and role validation using `better-auth` (`auth.api.getSession`) across all three locations before executing any Firestore reads or mutations:
1. In `app/(pages)/admin/page.jsx`, `session?.user?.role === "admin"` is checked before calling `connect()` or querying Firestore. Non-admin requests receive an early UI response without fetching any applicant data.
2. In `app/api/admin/applicants/route.js`, unauthenticated or non-admin requests immediately return HTTP 403 Forbidden.
3. In `app/api/shortlist/[id]/route.js`, unauthenticated or non-admin requests immediately return HTTP 403 Forbidden.

### Verification
- **RSC Payload Inspection**: Verified via network inspection that unauthenticated page requests receive an RSC payload strictly containing the "Access Denied" view, with zero applicant PII data present.
- **Direct API Verification**: Verified via HTTP requests that unauthenticated `GET /api/admin/applicants` and `PATCH /api/shortlist/[id]` return HTTP 403 Forbidden.
- **Admin Verification**: Confirmed that logging in with an authorized admin account (`session.user.role === "admin"`) successfully loads and renders applicant data.

---

## 3. Secondary Fix: TOCTOU Race Condition & Submission Cap

### The Vulnerability
In `app/api/submit-form/route.js`, the 2-application maximum cap and per-department deduplication were previously evaluated using standard non-transactional read operations prior to performing a document write.

Because client candidates can submit applications for multiple departments concurrently, parallel HTTP requests could execute read checks simultaneously before either write completed. Both requests would read fewer than 2 existing submissions, pass validation, and write documents, thereby bypassing the 2-application cap.

### The Fix
Wrapped the read-check-write workflow inside an atomic Firestore transaction (`db.runTransaction()`).
- The transaction queries existing submissions for the user's email while holding a transactional lock.
- If existing submissions count is `>= 2` or an application for the target department already exists, the transaction throws an error and aborts.
- Firestore serializes and retries concurrent conflicting transactions automatically.

### Verification
- **UI Application Submission**: Submitting 2 distinct department applications succeeded cleanly; a 3rd attempt was blocked.
- **Server-Side Bypass Verification**: Verified server-side enforcement by issuing direct HTTP `POST` requests to `/api/submit-form`, confirming the transaction rejects a 3rd application with HTTP 400 even when client-side UI checks are bypassed.

---

## 4. Fix: Missing `shortlisted: false` Default Field

### The Issue
New applicant documents created via `/api/submit-form` were saved without a `shortlisted` boolean field. However, the admin dashboard filter evaluated `String(data.shortlisted) === "false"`. Because `undefined` did not equal `"false"`, newly submitted applicants failed to appear under the "Not Shortlisted" administrative filter.

### The Fix
Explicitly initialized `shortlisted: false` on document creation inside the submission transaction in `app/api/submit-form/route.js`.

### Verification
Inspected created Firestore documents directly to confirm `shortlisted: false` is stored as an explicit boolean upon form submission.

---

## 5. Unauthenticated Email Broadcast Endpoint Fix (`/api/send-email`) & Frontend Wiring

### Investigation Findings
1. **Usage & Caller**: Investigated frontend references to `/api/send-email`. The endpoint was referenced in `handleRowSelection` within `components/DataTable.jsx`, intended to allow admins to send custom email notifications to selected applicant rows. However, `MailComposer.jsx` was previously not rendered in the UI.
2. **Arbitrary Recipients Input**: The endpoint accepted `recipients` directly from the client request payload body (`{ recipients, payloadData }`), along with arbitrary `payloadData.body` and `payloadData.subject`. Without authentication, an unauthenticated client could supply arbitrary email addresses and custom message bodies to turn the server's Gmail Nodemailer transport into an open email relay.

### The Fix
- **Backend Security**: Added server-side session and admin role checks using `auth.api.getSession` at the top of `app/api/send-email/route.js`. If no active session exists or `session.user.role !== "admin"`, the endpoint immediately returns HTTP 403 Forbidden (`{ error: "Unauthorized access" }`) before any Nodemailer code runs.
- **Frontend Integration**: Wired `<MailComposer />` into `components/DataTable.jsx`'s toolbar. Passed `selectedFlatRows.length` as `recipients` count and `handleRowSelection` as the form submit handler. Fixed a state closure bug in `MailComposer.jsx`'s TipTap editor `onUpdate` handler to correctly capture rich-text content in state.

---

## 6. User-Scoped Application Status Endpoints

Added server-side email verification to user-facing application status endpoints:
- `app/api/check-applications/route.js`
- `app/api/check-department-submission/route.js`
- `app/api/get-submissions/route.js`

Each endpoint verifies `email === session.user.email` server-side, returning HTTP 403 Forbidden if a user attempts to query another user's application count or submitted department list.

---

## 7. Other Cleanup & Defense-in-Depth

- **Removed `evaluatePermissionSignature()`**: Removed a ~80,000-iteration hashing loop in `components/AdminContent.jsx` that computed a cosmetic `data-` DOM attribute. It provided no security function and added unnecessary execution overhead.
- **Deleted Dead Code**: Deleted `lib/actions/form.action.js` and `lib/actions/data.action.js`, which were unused legacy files containing non-transactional mutation logic.
- **Removed Clerk Legacy Artifact**: Removed a leftover `id.startsWith("clerk_")` check in `app/(pages)/join/[...joinIds]/page.jsx`, cleaning up legacy code from a previous authentication setup.
- **Tightened `firestore.rules`**: Updated Firestore security rules from `allow read, write: if true` to `allow read, write: if false`.
  > *Note*: All database interactions in this application take place server-side via `firebase-admin`, which bypasses Firestore client security rules entirely. Setting rules to `if false` provides defense-in-depth against direct client SDK access without impacting app behavior.

---

## 8. Known Issue (Left Intentionally As-Is): Submission Deadline

> The form's internal application deadline was originally hardcoded to a past date, silently rejecting all applications regardless of the actual challenge timeline — a functional bug independent of the security fixes above. We've left the deadline set to a future date intentionally, so reviewers can exercise the live form without first needing to patch a date field themselves. In a real deployment this would be replaced with the actual recruitment window or driven from a config/environment value.

---

## 9. Department Constants Cleanup

Department names and questionnaire strings in `constants/index.js` were found containing obfuscated or garbled strings (e.g. `§_Mn9X7_qz`, `¥_Pb!8Q_wk`). Investigation indicated that these strings do not follow a standard decodable pattern — they appear as placeholder noise rather than a cipher. The department IDs, icons, and colour tones were intact and valid; only the human-readable `name`, `description`, and questionnaire `name`/`placeholder` fields were garbled. These were subsequently cleaned up and replaced with readable department names (e.g. "Management", "Publicity", "Web Dev") and meaningful questionnaire questions appropriate to each department.

---

## 10. Out of Scope

- Front-end UI restyling and CSS/Tailwind layout modifications (Tailwind classes were stripped from most components and are managed separately).
