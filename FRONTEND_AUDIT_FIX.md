# CBT Simulator Student Frontend — Audit Fix Log

> Generated: 2026-03-17
> Linked to: AUDIT_PLAN.md (backend audit)
> Scope: Student frontend only (`waec-cbt-simulator` / `einsteinscbt.vercel.app`)
> Status: ALL FIXES APPLIED

---

## Why This Document Exists

The backend audit (see `AUDIT_PLAN.md`) identified issues that require coordinated frontend changes.
This document records every frontend fix applied, the reason it was needed, the files changed, and what
the backend team should be aware of when deploying their matching Batch 2 changes.

---

## FIX 1 — iOS / PWA Login Fix: Same-Origin Proxy

**Severity:** CRITICAL
**Problem:**
iOS Safari's Intelligent Tracking Prevention (ITP) blocks cross-origin cookies in PWA standalone mode.
The frontend is at `waec-cbt-simulator.vercel.app` / `einsteinscbt.vercel.app` and the backend is at
`cbt-simulator-backend.vercel.app`. Every API call with `credentials: 'include'` from an iOS PWA
returns 401 because the session cookie is never sent. The user logs in, is redirected to the dashboard,
the first API call fires, gets 401, and the `fetchWithAuth` retry logic force-logs them out immediately.

**Root cause chain:**
1. Login POST succeeds → session cookie set on `cbt-simulator-backend.vercel.app` domain
2. App saves user to localStorage cache and navigates to `/dashboard`
3. Dashboard mounts → makes first API call with `credentials: 'include'`
4. iOS ITP: cross-origin cookie NOT sent → backend returns 401
5. `fetchWithAuth` retry: tries `/auth/refresh` → also 401 (no cookie)
6. `setUser(null)` + `clearAuthCache()` + `router.push('/login')` + toast "Session expired"

**Fix applied (frontend):**
- **New file:** `src/app/api/proxy/[...path]/route.js`
  - A Next.js App Router catch-all API route that proxies all requests to the backend
  - Browser calls same-origin `/api/proxy/...` → Next.js server forwards to backend server-to-server
  - Cookies are stored on the frontend domain (first-party) → iOS never blocks them
  - `Set-Cookie` headers are cleaned (domain stripped, SameSite=Lax) before returning to browser
  - Handles GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Updated:** `src/context/StudentAuthContext.jsx`
  - Removed `BASE_URL = 'https://cbt-simulator-backend.vercel.app'`
  - Added `const PROXY = '/api/proxy'`
  - All 4 direct `fetch()` calls updated to use `PROXY`:
    - `GET  /api/proxy/auth/me`         (was `https://cbt-simulator-backend.vercel.app/api/auth/me`)
    - `POST /api/proxy/student/login`   (was `.../api/student/login`)
    - `POST /api/proxy/auth/logout`     (was `.../api/auth/logout`)
    - `POST /api/proxy/auth/refresh`    (was `.../api/auth/refresh`)
  - `fetchWithAuth` URL builder updated to use `PROXY/student/...`

**Backend action required:** None. The proxy calls the same endpoints. CORS is handled server-side
(the proxy server is already in the allowed origins list).

---

## FIX 2 — Login Response Key: `student` vs `user`

**Severity:** CRITICAL
**Problem:**
The API context documents the student login response as `{ "student": { ... } }` (new API) while the
previously observed wire response used `{ "user": { ... } }` (legacy). The frontend was only reading
`data.user`, so if the backend had already switched to `data.student`, every login silently fails
(no user state set, immediate redirect to login).

**Fix applied (frontend):**
- **Updated:** `src/context/StudentAuthContext.jsx` — `login()` function
  - `const userData = data.student || data.user;`
  - Uses `userData` everywhere instead of `data.user`
  - Handles both old and new response shape transparently

**Backend note:**
This frontend now tolerates both `{ user }` and `{ student }` in the login response.
When Batch 2 (C-3) is deployed and the response is standardised, no further frontend change is needed.

---

## FIX 3 — Practice Save: Wrong Payload Shape

**Severity:** HIGH
**Problem:**
`POST /api/student/practice/save` was updated (as part of the backend audit) to require a
`questions[]` array with per-question detail. The frontend was sending a summary-only payload:
```json
{ "correct": 15, "wrong": 3, "unanswered": 2, "percentage": 75, "difficulty": "all" }
```
This payload shape no longer matches what the backend accepts, so practice sessions were not being
stored in the database.

**Fix applied (frontend):**
- **Updated:** `src/app/dashboard/practice-room/page.jsx` — `savePracticeToServer()`
  - Now sends:
    ```json
    {
      "subjectId": "...",
      "subjectName": "...",
      "questions": [
        { "id": "...", "question": "...", "correctAnswer": "A", "userAnswer": "B", "isCorrect": false }
      ],
      "score": 15,
      "totalQuestions": 20,
      "timeTaken": 300
    }
    ```
  - `questions[]` is built from the `resultData.questions` array already computed in `calculateResults()`
  - `timeTaken` computed as `session.timeLimit - timeLeft` (seconds elapsed during the session)
- **Updated:** `src/app/dashboard/exam-mock-room/page.jsx` — `savePracticeToServer()`
  - Same payload shape
  - `questions[]` built from `session.questions` crossed with the `answers` state object
  - `timeTaken` = `3600 - timeLeft` (mock exam is always 60 minutes)

**Backend action required:** None for the payload change — backend already expects this shape.

---

## FIX 4 — Exam Answer Save: Wrong Answer Value + Race Condition + Auto-Save Drift

**Severity:** CRITICAL + HIGH
**Problems (3 found in `src/app/exam-room/page.jsx`):**

1. **Wrong answer value** — `POST /api/student/exams/:examId/save-answer` expects `{ "answer": "Alice" }` — the option TEXT. The previous fix sent the letter (`"A"`–`"D"`), which was also wrong. Fix: use `questions.find(q => q.id === questionId)?.options[optionIndex]` to get the text.

2. **Race condition on submit** — `saveCurrentAnswers()` fired all save-answer requests as fire-and-forget (`.catch(() => {})`). `submitExam()` called `await saveCurrentAnswers()` but that returned before requests resolved, so `/submit` hit the server before answers were recorded — backend scored from incomplete data. Fix: `saveCurrentAnswers(awaitAll=false)` for auto-save; `saveCurrentAnswers(true)` on submit path uses `await Promise.all(saves)`.

3. **Auto-save timer reset on every answer** — `useEffect` had `answers` in its dep array, so the 30 s interval restarted every time a student selected an answer. A student answering at normal speed never triggered an auto-save. Fix: moved to a stable interval that reads from `answersRef` (a `useRef` synced to `answers`), removed `answers` from dep array.

**Fix applied (frontend):**
- **Updated:** `src/app/exam-room/page.jsx`
  - Added `answersRef = useRef({})` + sync effect
  - `handleAnswerSelect()`: `answer: question?.options?.[optionIndex]`
  - `saveCurrentAnswers(awaitAll)`: uses option text, `Promise.all` when `awaitAll=true`
  - `submitExam()`: calls `saveCurrentAnswers(true)` — guaranteed flush before submit
  - Auto-save `useEffect`: reads `answersRef.current`, stable interval, no `answers` dep

---

## FIX 5 — Auth: Soft vs Hard checkAuth on Cold Start

**Severity:** HIGH
**Problem:**
On every app load, `checkAuth()` called `GET /api/auth/me`. If the server returned 401 (including
iOS cookie-blocked scenarios), it cleared `user` state and the localStorage cache, immediately
redirecting to login — even though the user had a valid recent session.

**Fix applied (frontend):**
- **Updated:** `src/context/StudentAuthContext.jsx`
  - `checkAuth(soft = false)` — new optional `soft` parameter
  - `soft=true`: on 401 or network failure, do **not** clear user or cache (background refresh)
  - `soft=false`: on 401, clear user and cache (first load with no cache — hard check)
  - `initAuth()`: if cache exists → `setUser(cached)` + `setAuthChecked(true)` immediately,
    then `checkAuth(true)` in background (non-blocking, non-evicting)
  - `initAuth()`: if no cache → `await checkAuth(false)` (blocking hard check)

**Combined with FIX 1 (proxy):** Once the proxy is in place, `checkAuth()` will succeed on iOS
because cookies now travel same-origin. FIX 5 is an additional safety net for edge cases
(network failures, offline mode, slow connections).

---

## FIX 6 — Settings: Change Password Uses Wrong HTTP Method

**Severity:** MEDIUM
**Problem:**
`POST /api/student/change-password` is a `POST` endpoint. The Settings component was calling it
with `method: 'PUT'`, resulting in a 404 (route not registered for PUT).

**Fix applied (frontend):**
- **Updated:** `src/components/dashboard-content/Settings.jsx` — `handlePasswordChange()`
  - Changed `method: 'PUT'` → `method: 'POST'`

**Backend action required:** None. Endpoint is already `POST`.

---

## FIX 7 — Performance Page: Double `/student/student/history` Path

**Severity:** MEDIUM
**Problem:**
`fetchWithAuth('/student/history')` builds the URL as:
```
/api/proxy/student/student/history    ← WRONG (double "student")
```
because `fetchWithAuth` already prepends `/student/` to the endpoint. The correct endpoint
`GET /api/student/history` requires calling `fetchWithAuth('/history')`.

**Fix applied (frontend):**
- **Updated:** `src/components/dashboard-content/Performance.jsx`
  - `fetchWithAuth('/student/history')` → `fetchWithAuth('/history')`

---

## FIX 8 — PastQuestions: Non-existent Endpoint `/results/all`

**Severity:** MEDIUM
**Problem:**
The component was calling `fetchWithAuth('/results/all')`. This endpoint does not exist in the API.
The correct endpoint is `GET /api/student/results` (called via `fetchWithAuth('/results')`).

The response shape was also mismatched: code read `data.results` but API returns `data.exams`.

**Fix applied (frontend):**
- **Updated:** `src/components/dashboard-content/PastQuestions.jsx`
  - `fetchWithAuth('/results/all')` → `fetchWithAuth('/results')`
  - Response parsing: `data.exams || data.results` (handles both old and new shape)
  - Date extraction: reads `r.createdAt._seconds` or `r.endTime` (matches actual API response shape)

---

---

## FIX 10 — Practice Save: Payload Field Mismatches (practice-room + exam-mock-room)

**Severity:** CRITICAL
**Problem:**
Both `practice-room` and `exam-mock-room` called `POST /api/student/practice/save` with the wrong body shape. The actual API requires:
```json
{ "subjectId", "subjectName", "totalQuestions", "correct", "wrong", "unanswered", "percentage", "duration", "difficulty", "isTimedTest" }
```
What the frontend was sending:
```json
{ "subjectId", "subjectName", "questions": [...], "score": 15, "totalQuestions", "timeTaken": 300 }
```
Specific mismatches:
- `score` → should be `correct` (field rename)
- `wrong`, `unanswered`, `percentage` missing entirely (all present in `resultData`, just not mapped)
- `timeTaken` (seconds) → should be `duration` (minutes: divide by 60)
- `difficulty` and `isTimedTest` missing
- `questions` array included but not accepted by this endpoint

**Fix applied (frontend):**
- **Updated:** `src/app/dashboard/practice-room/page.jsx` — `savePracticeToServer()`
  - Body rebuilt: `correct`, `wrong`, `unanswered`, `percentage` from `resultData`
  - `duration = Math.floor((session.timeLimit - timeLeft) / 60)`
  - `difficulty: session.difficulty || 'all'`, `isTimedTest: session.timeLimit > 0`
  - Removed `questions` array and `score`/`timeTaken` fields
- **Updated:** `src/app/dashboard/exam-mock-room/page.jsx` — `savePracticeToServer()`
  - Same body shape
  - `duration = Math.floor((3600 - timeLeft) / 60)` (mock exam is always 60 min)
  - `difficulty: 'all'`, `isTimedTest: true` (always timed)
  - Removed `questions` array and `score`/`timeTaken` fields

**Backend action required:** None. Endpoint already expects this shape.

---

## BATCH 2 COORDINATION STATUS

The following backend Batch 2 fixes from `AUDIT_PLAN.md` now have their matching frontend changes
already in place:

| Batch 2 Item | Frontend Status |
|---|---|
| **C-3** — Remove tokens from login response body | ✅ Ready. Frontend no longer reads `data.token` or `data.accessToken` from login response. No `Authorization: Bearer` header is sent. When backend removes tokens from response, no frontend change needed. |
| **H-3** — Remove `credentials.password` from createStudent response | Not applicable to student frontend. Admin dashboard only. |
| **H-5** — Remove raw TOTP secret from 2FA setup response | Not applicable to student frontend. Admin dashboard only. |
| **M-6** — Add pagination to list endpoints | ✅ Ready. All three paginated endpoints implemented with `?limit=20&page=N`. Backward-compatible — if backend returns no `total` field, frontend falls back to array length. Backend can deploy M-6 at any time. |

---

## FILES CHANGED

| File | Change |
|---|---|
| `src/app/api/proxy/[...path]/route.js` | **CREATED** — Same-origin proxy (iOS ITP fix) |
| `src/context/StudentAuthContext.jsx` | Proxy URLs, login key fix, soft checkAuth |
| `src/app/exam-room/page.jsx` | save-answer: option text (not letter); race condition fixed (awaitAll); auto-save stable interval via answersRef |
| `src/app/dashboard/practice-room/page.jsx` | practice/save payload: correct field names, missing fields added, duration in minutes |
| `src/app/dashboard/exam-mock-room/page.jsx` | practice/save payload: correct field names, missing fields added, duration in minutes |
| `src/components/dashboard-content/Settings.jsx` | change-password: PUT → POST |
| `src/components/dashboard-content/Performance.jsx` | `/student/history` → `/history`; pagination for exam + practice history (independent, `limit=20`) |
| `src/components/dashboard-content/PastQuestions.jsx` | `/results/all` → `/results`, response shape; pagination for results (`limit=20`) |

---

---

## FIX 9 — M-6 Pagination: All Three Paginated Endpoints

**Severity:** MEDIUM (performance, not correctness)
**Endpoints paginated:**
- `GET /api/student/results` → `PastQuestions.jsx`
- `GET /api/student/history` → `Performance.jsx` (Exam History section)
- `GET /api/student/practice/history` → `Performance.jsx` (Practice History section)

**Fix applied (frontend):**
- `LIMIT = 20` per page for all three
- Sends `?limit=20&page=N` query params via `fetchWithAuth`
- Reads `data.total` to compute `totalPages`; falls back to array length if `total` absent (backward-compatible)
- Page-change `useEffect` re-fetches only the changed section (not a full reload)
- Prev / Page X of Y / Next controls render only when `totalPages > 1`
- `Performance.jsx`: two independent paginators (exam + practice), initial load uses `useRef` skip to avoid double-fetch on mount

**Backend action required:** Deploy M-6 — backend can now send `?limit` and `?page` support at any time. Frontend is ready.

---

## PENDING (Backend Must Notify Frontend Before Deploying)

1. **C-3 Token Removal** — Frontend is already ready. Backend can deploy this change at any time.
   No user-facing impact; login will simply stop including unused token fields in the response.
