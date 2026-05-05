# HR Office — Project Roadmap & Status

> **Last updated:** 2026-05-05
> **Stack:** Next.js 16 (App Router) + Convex + Shadcn/ui + Tailwind CSS
> **i18n:** EN / RU / HY (Armenian)
> **Auth:** Convex Auth (session-based)
> **RBAC Roles:** superadmin, admin, supervisor, employee, driver

---

## Status Legend

| Symbol | Meaning                                                |
| ------ | ------------------------------------------------------ |
| ✅     | Fully implemented (schema + backend + UI + i18n + nav) |
| ⚠️     | Mostly implemented, minor gaps remain                  |
| 🔲     | Not started                                            |
| 🚧     | In progress                                            |

---

## Phase 1 — Core HR Features (MVP Complete)

### 1.1 Performance Reviews / 360° Feedback

**Status:** ⚠️ Mostly implemented

| Layer   | Status | Files                                                                                                                                                                                                                                                                                                |
| ------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema  | ✅     | `convex/schema/performance.ts`                                                                                                                                                                                                                                                                       |
| Backend | ✅     | `convex/performance.ts`                                                                                                                                                                                                                                                                              |
| UI      | ✅     | `src/components/PerformanceClient.tsx`, `src/components/performance/CreateCycleWizard.tsx`, `src/components/performance/FillReviewDialog.tsx`, `src/components/performance/LaunchCycleDialog.tsx`, `src/components/performance/ResultsDialog.tsx`, `src/components/performance/CycleSummaryCard.tsx` |
| Route   | ✅     | `src/app/(dashboard)/performance/page.tsx`                                                                                                                                                                                                                                                           |
| i18n    | ⚠️     | EN ✅, RU ✅, HY 🔲                                                                                                                                                                                                                                                                                  |
| Sidebar | ✅     | Nav item added                                                                                                                                                                                                                                                                                       |

**Features implemented:**

- Review cycles, templates, assignments, responses, ratings
- 3-step CreateCycleWizard (Basic Info → Review Types → Competencies)
- FillReviewDialog (1-5 rating per competency + comments + strengths/improvements)
- LaunchCycleDialog (select participants, auto-assign self/manager)
- ResultsDialog (overall score, competency bars, grouped by type)
- CycleSummaryCard (all employees ranked by score)
- Mirror manager reviews → supervisorRatings (backward compat)
- Immutable competency snapshot at cycle creation
- Peer anonymity threshold (configurable, default 2)

**TODO:**

- [ ] Deadline notifications for reviews
- [ ] Export results (PDF/CSV)
- [ ] HY translations

---

### 1.2 OKR / Goals Management

**Status:** ⚠️ Mostly implemented

| Layer   | Status | Files                                                                                                                                                                          |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Schema  | ✅     | `convex/schema/goals.ts`                                                                                                                                                       |
| Backend | ✅     | `convex/goals.ts`                                                                                                                                                              |
| UI      | ✅     | `src/components/GoalsClient.tsx`, `src/components/goals/CreateObjectiveWizard.tsx`, `src/components/goals/CheckinDialog.tsx`, `src/components/goals/ObjectiveDetailDialog.tsx` |
| Route   | ✅     | `src/app/(dashboard)/goals/page.tsx`                                                                                                                                           |
| i18n    | ⚠️     | EN ✅, RU ✅, HY 🔲                                                                                                                                                            |
| Sidebar | ✅     | Crosshair icon                                                                                                                                                                 |

**Features implemented:**

- Objectives, keyResults, goalCheckins
- 3-step CreateObjectiveWizard
- CheckinDialog (update KR value + confidence + note)
- ObjectiveDetailDialog (KRs with progress bars + check-in history + aligned goals)
- Progress bar per KR (0-100%) with direction (increase/decrease)
- Goal tree (company → team → individual) via parentObjectiveId
- Filtering by period (Q1-Q4, H1-H2, FY) and year
- Team progress visualization (stats cards)
- Team scope via department field

**TODO:**

- [ ] HY translations
- [ ] Link OKR with Performance Reviews
- [ ] Weekly check-in reminders (cron)

---

### 1.3 Recruitment / ATS

**Status:** ⚠️ Mostly implemented

| Layer       | Status | Files                                      |
| ----------- | ------ | ------------------------------------------ |
| Schema      | ✅     | `convex/schema/recruitment.ts`             |
| Backend     | ✅     | `convex/recruitment.ts`                    |
| UI          | ✅     | `src/components/RecruitmentClient.tsx`     |
| Route       | ✅     | `src/app/(dashboard)/recruitment/page.tsx` |
| Public page | ✅     | `src/app/careers/[slug]/page.tsx`          |
| i18n        | ✅     | EN, RU                                     |

**Features implemented:**

- Vacancies CRUD
- Kanban pipeline (Applied → Screening → Interview → Offer → Hired)
- Candidate cards (resume, contacts, notes)
- Interview scheduling
- Scorecard for interviewers
- Public careers page with application form

**TODO:**

- [ ] Email templates for candidates (Resend integration)
- [ ] Recruitment funnel analytics

---

### 1.4 Onboarding Workflows

**Status:** ⚠️ Mostly implemented

| Layer   | Status | Files                                     |
| ------- | ------ | ----------------------------------------- |
| Schema  | ✅     | `convex/schema/onboarding.ts`             |
| Backend | ✅     | `convex/onboarding.ts`                    |
| UI      | ✅     | `src/components/OnboardingClient.tsx`     |
| Route   | ✅     | `src/app/(dashboard)/onboarding/page.tsx` |
| i18n    | ✅     | EN, RU                                    |

**Features implemented:**

- Onboarding templates, programs, tasks
- Templates by department/position
- Automatic checklists (spawn from template)
- Buddy/mentor assignment
- Progress tracker (% completion, server-side)
- Auto tasks for IT/HR/manager (assigneeType + dayOffset)
- Welcome page (My Onboarding tab)

**TODO:**

- [ ] Integration with Tasks module (auto-create tasks)
- [ ] Link with Recruitment (auto-trigger on hired)

---

### 1.5 Offboarding Workflows

**Status:** ✅ Fully implemented

| Layer   | Status | Files                                      |
| ------- | ------ | ------------------------------------------ |
| Schema  | ✅     | `convex/schema/offboarding.ts`             |
| Backend | ✅     | `convex/offboarding.ts`                    |
| UI      | ✅     | `src/components/OffboardingClient.tsx`     |
| Route   | ✅     | `src/app/(dashboard)/offboarding/page.tsx` |
| i18n    | ✅     | EN, RU                                     |

**Features implemented:**

- Offboarding programs, tasks, exitInterviews
- 8 default tasks (access revoke, equipment return, knowledge transfer, etc.)
- Exit Interview form (5-point experience, recommend, feedback, improvements)
- Retention analytics (reason breakdown, avg experience, recommend rate)
- StartOffboardingWizard (3-step)
- ProgramDetailDialog (checklist + exit interview panel)

---

### 1.6 E-Signatures

**Status:** ⚠️ Mostly implemented

| Layer   | Status | Files                                     |
| ------- | ------ | ----------------------------------------- |
| Schema  | ✅     | `convex/schema/signatures.ts`             |
| Backend | ✅     | `convex/signatures.ts`                    |
| UI      | ✅     | `src/components/ESignaturesClient.tsx`    |
| Route   | ✅     | `src/app/(dashboard)/signatures/page.tsx` |
| i18n    | ⚠️     | EN ✅, RU ✅, HY 🔲                       |

**Features implemented:**

- Document templates, signature documents, signature requests, audit log
- 3-step CreateDocumentWizard
- SignDocumentDialog (Canvas signature pad, mouse + touch)
- DocumentDetailDialog (status, signers progress, audit log)
- TemplateManager (CRUD with categories: NDA, Offer, Contract, Policy, Custom)
- Immutable document snapshot on send (content hash)
- Sequential signing order enforcement
- Audit log (created, sent, viewed, signed, declined, cancelled, reminder_sent)

**TODO:**

- [ ] HY nav key
- [ ] PDF generation of signed document

---

### 1.7 Employee Engagement / Pulse Surveys

**Status:** ⚠️ Mostly implemented

| Layer   | Status | Files                                  |
| ------- | ------ | -------------------------------------- |
| Schema  | ✅     | `convex/schema/surveys.ts`             |
| Backend | ✅     | `convex/surveys.ts`                    |
| UI      | ✅     | `src/components/SurveysClient.tsx`     |
| Route   | ✅     | `src/app/(dashboard)/surveys/page.tsx` |
| i18n    | ✅     | EN, RU                                 |

**Features implemented:**

- Surveys, surveyQuestions, surveyResponses, surveyAnswers
- Question types: rating, multiple_choice, text, yes_no, nps
- Anonymous responses
- eNPS (0-10 scale)
- Create survey wizard
- TakeSurveyDialog, ResultsDialog

**TODO:**

- [ ] Drag-and-drop survey builder (question ordering)
- [ ] Automatic pulse surveys (cron: weekly/monthly)
- [ ] Results dashboard with trends
- [ ] Department segmentation

---

### 1.8 Recognition & Kudos

**Status:** ⚠️ Mostly implemented

| Layer   | Status | Files                                      |
| ------- | ------ | ------------------------------------------ |
| Schema  | ✅     | `convex/schema/recognition.ts`             |
| Backend | ✅     | `convex/recognition.ts`                    |
| UI      | ✅     | `src/components/RecognitionClient.tsx`     |
| Route   | ✅     | `src/app/(dashboard)/recognition/page.tsx` |
| i18n    | ⚠️     | EN ✅, RU ✅, HY 🔲                        |

**Features implemented:**

- Kudos feed, leaderboard, stats cards
- SendKudos Wizard (3-step)
- Points Economy (userPoints + pointTransactions)
- Points: -3 for sending kudos, +1 for attendance, +3 for positive review ≥4★
- Badge system (kudosBadges, kudosBadgeAwards)

**TODO:**

- [ ] HY translations
- [ ] Move component: `src/components/RecognitionClient.tsx` → `src/components/recognition/RecognitionClient.tsx`

---

## Phase 2 — Competitive Edge (Not Started)

### 2.1 Learning Management System (LMS)

**Status:** 🔲 Not started

**Required files:**

- Schema: `convex/schema/learning.ts` (courses, lessons, enrollments, certificates, quizzes, quizAnswers)
- Backend: `convex/learning.ts`
- UI: `src/components/learning/LearningClient.tsx`
- Route: `src/app/(dashboard)/learning/page.tsx`

**Features to implement:**

- Course catalog (internal + external)
- Video/text lessons with progress tracking
- Quizzes and tests
- Certificates on completion
- Mandatory compliance training
- Manager course assignment
- Team learning reports

**Competitors with this:** Rippling, Leapsome, HiBob

---

### 2.2 Compensation Management

**Status:** 🔲 Not started

**Required files:**

- Schema: `convex/schema/compensation.ts` (salaryBands, compensationReviews, bonuses, salaryHistory)
- Backend: `convex/compensation.ts`
- UI: `src/components/compensation/CompensationClient.tsx`
- Route: `src/app/(dashboard)/compensation/page.tsx`

**Features to implement:**

- Salary bands by position (min/mid/max)
- Employee position visualization within band
- Compensation review cycles
- Bonuses and premiums
- Raise budgeting
- Market benchmarking
- Compensation history

**Competitors with this:** Rippling, BambooHR

---

### 2.3 Benefits Administration

**Status:** 🔲 Not started

**Required files:**

- Schema: `convex/schema/benefits.ts` (benefitPlans, benefitEnrollments, claims)
- Backend: `convex/benefits.ts`
- UI: `src/components/benefits/BenefitsClient.tsx`
- Route: `src/app/(dashboard)/benefits/page.tsx`

**Features to implement:**

- Benefits catalog (insurance, fitness, education)
- Self-service enrollment
- Flexible benefits budget
- Claims submission and approval
- Payroll integration for reimbursements

**Competitors with this:** Rippling, Deel, BambooHR

---

### 2.4 Visual Org Chart

**Status:** 🔲 Not started

**Required files:**

- Schema: `convex/schema/orgchart.ts` (orgNodes, orgRelationships)
- Backend: `convex/orgchart.ts`
- UI: `src/components/orgchart/OrgChartClient.tsx`
- Route: `src/app/(dashboard)/org-chart/page.tsx`

**Features to implement:**

- Interactive visualization (React Flow recommended)
- Hierarchy: company → department → team → person
- Search and filter
- Click → mini employee profile
- Drag-and-drop reorg (admin only)
- Export to PDF/PNG

**Competitors with this:** HiBob, BambooHR

---

### 2.5 Document Management System

**Status:** 🔲 Not started

**Required files:**

- Schema: `convex/schema/documents.ts` (documents, folders, documentAccess, documentVersions)
- Backend: `convex/documents.ts`
- UI: `src/components/documents/DocumentsClient.tsx`
- Route: `src/app/(dashboard)/documents/page.tsx`

**Features to implement:**

- Folder hierarchy (by department, type, employee)
- File upload/download (Convex file storage)
- Access control (who can view/edit)
- Document versioning
- Document templates
- Full-text search
- E-Signatures integration

**Competitors with this:** Rippling, BambooHR

---

### 2.6 Expense Management

**Status:** 🔲 Not started

**Required files:**

- Schema: `convex/schema/expenses.ts` (expenseReports, expenseItems, receipts, expensePolicies)
- Backend: `convex/expenses.ts`
- UI: `src/components/expenses/ExpensesClient.tsx`
- Route: `src/app/(dashboard)/expenses/page.tsx`

**Features to implement:**

- Expense submission (receipt photo, amount, category)
- Manager approval workflow
- Expense policies (category limits)
- Reports by department/period
- Payroll integration (reimbursement)

**Competitors with this:** Rippling

---

### 2.7 Succession Planning

**Status:** 🔲 Not started

**Required files:**

- Schema: `convex/schema/succession.ts` (keyPositions, successors, developmentPlans, nineBoxRatings)
- Backend: `convex/succession.ts`
- UI: `src/components/succession/SuccessionClient.tsx`
- Route: `src/app/(dashboard)/succession/page.tsx`

**Features to implement:**

- 9-Box Grid (Performance vs Potential)
- Key position identification
- Successor assignment
- Development plans (linked to LMS)
- Risk assessment (what if someone leaves)

**Competitors with this:** Leapsome, HiBob

---

## Phase 3 — Differentiation (Not Started)

### 3.1 Mobile App (PWA)

**Status:** 🔲 Not started

**Required files:**

- `public/manifest.json`
- `public/sw.js` (service worker)
- `src/app/(dashboard)/layout.tsx` — add PWA registration

**Features to implement:**

- PWA manifest + service worker
- Responsive design for all modules
- Push notifications (Web Push API)
- Offline mode (caching)
- Quick actions: approve leave, mark attendance
- Alternative: React Native (iOS + Android)

---

### 3.2 Compliance & Audit Trail

**Status:** ⚠️ Partially implemented

**Existing:**

- Schema: `convex/schema/security.ts`
- Backend: `convex/security.ts`
- `convex/admin.ts` — auditLogs query

**TODO:**

- [ ] Full audit logging for ALL actions (who, what, when, IP, before/after)
- [ ] Audit log UI with filters (user, action, date)
- [ ] GDPR tools (data export, right to delete)
- [ ] Compliance dashboard
- [ ] Data retention policies

---

### 3.3 Asset / IT Equipment Management

**Status:** 🔲 Not started

**Required files:**

- Schema: `convex/schema/assets.ts` (assets, assetAssignments, assetCategories)
- Backend: `convex/assets.ts`
- UI: `src/components/assets/AssetsClient.tsx`
- Route: `src/app/(dashboard)/assets/page.tsx`

**Features to implement:**

- Equipment inventory (laptops, phones, keys)
- Assignment/return (linked to onboarding/offboarding)
- Statuses: available, assigned, repair, retired
- QR codes for quick scanning
- Return reminders

---

### 3.4 Company News Feed / Announcements

**Status:** 🔲 Not started

**Required files:**

- Schema: `convex/schema/news.ts` (announcements, reactions, comments)
- Backend: `convex/news.ts`
- UI: `src/components/news/NewsClient.tsx`
- Route: `src/app/(dashboard)/news/page.tsx`

**Features to implement:**

- Company news feed
- Categories: news, events, birthdays, achievements
- Rich-text editor for posts
- Reactions and comments
- Pin important announcements
- Targeting (by department, role)

---

### 3.5 Custom Workflow Builder (Visual)

**Status:** ⚠️ Partially implemented

**Existing:**

- Schema: `convex/schema/automation.ts`
- Backend: `convex/automation.ts`, `convex/automationActions.ts`, `convex/automationMutations.ts`, `convex/automationTest.ts`

**TODO:**

- [ ] Visual drag-and-drop builder (React Flow / xyflow)
- [ ] Nodes: trigger → condition → action
- [ ] Triggers: new employee, leave approved, birthday, etc.
- [ ] Actions: send email, create task, notify, update field
- [ ] Workflow templates
- [ ] Execution logging

---

### 3.6 Employee Directory

**Status:** ⚠️ Partially implemented

**Existing:**

- `src/app/(dashboard)/employees/page.tsx`
- `src/components/employees/EmployeesClient.tsx`

**TODO:**

- [ ] Advanced search (name, department, position, skills)
- [ ] Employee cards (photo, contacts, department)
- [ ] Filtering and sorting
- [ ] Quick actions (chat, call)
- [ ] Office map (who sits where) — optional

---

### 3.7 PDF Reports / Export

**Status:** 🔲 Not started

**Required files:**

- `src/lib/pdf.ts` (react-pdf or puppeteer wrapper)
- Export utilities for each module

**Features to implement:**

- Export: employee profile, payslip, leave report
- Export: attendance report, team report
- Customizable report templates
- Bulk export (multiple employees)
- Scheduled reports (auto-email)

---

### 3.8 Career Development Paths

**Status:** 🔲 Not started

**Required files:**

- Schema: `convex/schema/careers.ts` (skillMatrices, careerTracks, gapAnalyses, mentorships)
- Backend: `convex/careers.ts`
- UI: `src/components/careers/CareersClient.tsx`
- Route: `src/app/(dashboard)/careers/page.tsx`

**Features to implement:**

- Skill Matrix (skills by position)
- Career tracks (Junior → Mid → Senior → Lead)
- Gap analysis (what's needed for promotion)
- LMS integration (recommended courses)
- Mentorship assignments

---

### 3.9 Shift Scheduling

**Status:** 🔲 Not started

**Required files:**

- Schema: `convex/schema/shifts.ts` (shifts, shiftTemplates, shiftSwaps)
- Backend: `convex/shifts.ts`
- UI: `src/components/shifts/ShiftsClient.tsx`
- Route: `src/app/(dashboard)/shifts/page.tsx`

**Features to implement:**

- Visual shift schedule (week/month view)
- Shift templates (morning, evening, night)
- Swap requests
- Auto-distribution
- Change notifications
- Attendance tracking integration

---

## Already Implemented (Not in Roadmap)

### Dashboard

**Status:** ✅ Fully implemented

- Route: `src/app/(dashboard)/dashboard/page.tsx`
- Component: `src/components/dashboard/DashboardClient.tsx`

### Employees

**Status:** ✅ Fully implemented

- Routes: `src/app/(dashboard)/employees/page.tsx`, `src/app/(dashboard)/employees/[id]/page.tsx`
- Components: `src/components/employees/EmployeesClient.tsx`, `src/components/employees/EmployeeProfilePageClient.tsx`
- Schema: `convex/schema/employees.ts`

### Leaves

**Status:** ✅ Fully implemented

- Route: `src/app/(dashboard)/leaves/page.tsx`
- Component: `src/components/leaves/LeavesClient.tsx`
- Schema: `convex/schema/leaves.ts`
- Backend: `convex/leaves.ts`

### Attendance / Time Tracking

**Status:** ✅ Fully implemented

- Route: `src/app/(dashboard)/attendance/page.tsx`
- Component: `src/components/attendance/AttendanceDashboard.tsx`
- Backend: `convex/timeTracking.ts`

### Tasks

**Status:** ✅ Fully implemented

- Route: `src/app/(dashboard)/tasks/page.tsx`
- Component: `src/components/tasks/TasksClient.tsx`
- Schema: `convex/schema/tasks.ts`
- Backend: `convex/tasks.ts`

### Chat

**Status:** ✅ Fully implemented

- Route: `src/app/(dashboard)/chat/page.tsx`
- Component: `src/components/chat/ChatClient.tsx`
- Schema: `convex/schema/chat.ts`
- Backend: `convex/chat.ts`, `convex/chatAction.ts`

### Calendar

**Status:** ✅ Fully implemented

- Route: `src/app/(dashboard)/calendar/page.tsx`
- Component: `src/components/calendar/CalendarClient.tsx`
- Schema: `convex/schema/calendar.ts`

### Analytics

**Status:** ✅ Fully implemented

- Route: `src/app/(dashboard)/analytics/page.tsx`
- Backend: `convex/analytics.ts`
- Components: LeavesTrendChart, DepartmentStats, LeaveHeatmap, StatsCard

### Payroll

**Status:** ✅ Fully implemented

- Routes: `src/app/(dashboard)/payroll/page.tsx`, `payroll/[id]/page.tsx`, `payroll/runs/page.tsx`, `payroll/settings/page.tsx`
- Schema: `convex/schema/payroll.ts`
- Components: PayrollDashboard, PayrollRecordsTable, PayrollCalculator, PayrollRunDialogs, EditPayrollRecordDialog, PayrollRunDetailClient

### Drivers

**Status:** ✅ Fully implemented (unique feature)

- Routes: `src/app/(dashboard)/drivers/page.tsx`, `drivers/dashboard/page.tsx`, `drivers/favorites/page.tsx`
- Schema: `convex/schema/drivers.ts`
- Backend: `convex/drivers.ts`, `convex/driverAI.ts`
- Components: 40+ files in `src/components/drivers/`

### Approvals

**Status:** ✅ Fully implemented

- Route: `src/app/(dashboard)/approvals/page.tsx`
- Component: `src/components/approvals/ApprovalsClient.tsx`

### AI Chat

**Status:** ✅ Fully implemented

- Route: `src/app/(dashboard)/ai-chat/page.tsx`
- Component: `src/components/ai-chat/AIChatClient.tsx`
- Schema: `convex/schema/ai.ts`
- Backend: `convex/aiChat.ts`, `convex/aiChatMutations.ts`

### Help / Tickets

**Status:** ✅ Fully implemented

- Route: `src/app/(dashboard)/help/page.tsx`
- Schema: `convex/schema/tickets.ts`, `convex/schema/sla.ts`
- Backend: `convex/tickets.ts`, `convex/sla.ts`
- Component: `src/components/help/CreateTicketWizard.tsx`

### Settings

**Status:** ✅ Fully implemented

- Route: `src/app/(dashboard)/settings/page.tsx`
- Schema: `convex/schema/settings.ts`
- Backend: `convex/settings.ts`
- Components: 10 sub-components (Appearance, Cookie, Security, Localization, Integration, Advanced Security, Dashboard Customization, Profile, Productivity, Notification)

### Profile

**Status:** ✅ Fully implemented

- Route: `src/app/(dashboard)/profile/page.tsx`

### Organization Management

**Status:** ✅ Fully implemented

- Schema: `convex/schema/organizations.ts`
- Backend: `convex/organizations.ts`, `convex/organizationJoinRequests.ts`, `convex/organizationRequests.ts`
- Routes: `src/app/(dashboard)/join-requests/page.tsx`, `src/app/(dashboard)/org-requests/page.tsx`

### Admin Panel

**Status:** ✅ Fully implemented

- Routes: `src/app/(dashboard)/admin/page.tsx`, `admin/events/page.tsx`, `admin/join-requests/page.tsx`
- Backend: `convex/admin.ts`, `convex/events.ts`

### Superadmin Panel

**Status:** ✅ Fully implemented

- Routes: 15+ pages (users, organizations, subscriptions, security, automation, impersonation, emergency, bulk actions, create-org, support, stripe-dashboard)
- Backend: `convex/superadmin.ts`, `convex/subscriptions.ts`, `convex/subscriptions_admin.ts`, `convex/security.ts`, `convex/automation*.ts`

### Birthdays

**Status:** ✅ Fully implemented

- Backend: `convex/birthdays.ts`

### Conflicts

**Status:** ✅ Fully implemented

- Backend: `convex/conflicts/main.ts`

---

## Implementation Priority Order

```
PHASE 2 (Competitive Edge — highest impact first):
  2.4 Visual Org Chart ............... ~2-3 days  (quick win, high visual impact)
  2.1 LMS ............................ ~7-10 days (biggest gap vs competitors)
  2.2 Compensation Management ........ ~4-5 days  (enterprise requirement)
  2.5 Document Management ............ ~4-5 days  (core HR necessity)
  2.6 Expense Management ............. ~3-4 days
  2.3 Benefits Administration ........ ~3-4 days
  2.7 Succession Planning ............ ~3-4 days

PHASE 3 (Differentiation):
  3.7 PDF Reports .................... ~2-3 days  (quick win)
  3.4 Company News Feed .............. ~2-3 days
  3.6 Employee Directory ............. ~2-3 days
  3.2 Compliance & Audit Trail ....... ~3-4 days
  3.1 Mobile App (PWA) ............... ~5-7 days
  3.3 Asset Management ............... ~3-4 days
  3.5 Custom Workflow Builder ........ ~7-10 days
  3.8 Career Development ............. ~4-5 days
  3.9 Shift Scheduling ............... ~4-5 days

PHASE 1 (Remaining TODOs):
  1.8 Recognition HY translations .... ~1 day
  1.7 Survey builder + cron .......... ~3-4 days
  1.6 E-Signatures PDF generation .... ~2-3 days
  1.2 OKR HY + reminders ............. ~2-3 days
  1.1 Performance notifications ........ ~2-3 days
  1.4 Onboarding integrations ........ ~2-3 days
  1.3 Recruitment email templates .... ~2-3 days
```

---

## Technical Standards for New Modules

Every new module MUST follow these conventions:

### File Structure

```
convex/schema/{module}.ts          — Database schema (defineTable)
convex/{module}.ts                  — Backend queries + mutations
src/app/(dashboard)/{module}/page.tsx — Server wrapper with nextDynamic
src/components/{module}/{Module}Client.tsx — Client component
src/components/{module}/            — Sub-components (wizards, dialogs, cards)
src/i18n/locales/en.json            — English translations
src/i18n/locales/ru.json            — Russian translations
src/i18n/locales/hy.json            — Armenian translations
```

### Server Wrapper Pattern

```tsx
import nextDynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

export const dynamic = 'force-dynamic';

const ModuleClient = nextDynamic(() => import('@/components/module/ModuleClient'), {
  loading: () => <Skeleton className="h-96 w-full" />,
});

export default function ModulePage() {
  return <ModuleClient />;
}
```

### Client Component Rules

- Use `'use client'` directive at top
- Accept NO `params` props — use `useParams()` hook instead
- Import Skeleton from `@/components/ui/Skeleton` (capital S)
- Import Convex API from `@/convex/_generated/api` (alias, not relative)

### Backend Rules

- All queries must filter `role !== 'superadmin'` from user lists
- Use `MAX_PAGE_SIZE` from `convex/pagination`
- Use indexes (`withIndex`) whenever possible, avoid `.collect()` unless necessary
- All mutations must check RBAC permissions
- Use `SUPERADMIN_EMAIL` from `convex/lib/auth` for superadmin checks

### i18n Rules

- Every new module needs EN + RU + HY translations
- Add nav keys to `src/i18n/locales/{en,ru,hy}.json` under `nav.{module}`
- Use `useTranslation()` hook in client components

### RBAC Rules

- Every module must define which roles can access it
- Permission checks in backend mutations
- UI shows/hides features based on role

---

## Competitive Analysis Summary

| Feature                  | This Project | Rippling |  HiBob  | BambooHR | Leapsome |  Deel   |
| ------------------------ | :----------: | :------: | :-----: | :------: | :------: | :-----: |
| Employee Management      |      ✅      |    ✅    |   ✅    |    ✅    |    ❌    |   ✅    |
| Leave Management         |      ✅      |    ✅    |   ✅    |    ✅    |    ✅    |   ✅    |
| Attendance/Time Tracking |      ✅      |    ✅    |   ✅    |    ✅    |    ❌    |   ❌    |
| Task Management          |      ✅      |    ✅    |   ❌    |    ❌    |    ❌    |   ❌    |
| Chat/Messaging           |      ✅      |    ❌    |   ✅    |    ❌    |    ❌    |   ❌    |
| Calendar                 |      ✅      |    ❌    |   ❌    |    ❌    |    ❌    |   ❌    |
| Recruitment/ATS          |      ✅      |    ✅    |   ✅    |    ✅    |    ❌    |   ✅    |
| Onboarding               |      ✅      |    ✅    |   ✅    |    ✅    |    ✅    |   ✅    |
| Offboarding              |      ✅      |    ✅    |   ✅    |    ✅    |    ✅    |   ✅    |
| Performance Reviews      |      ✅      |    ✅    |   ✅    |    ❌    |    ✅    |   ❌    |
| OKR/Goals                |      ✅      |    ❌    |   ❌    |    ❌    |    ✅    |   ❌    |
| E-Signatures             |      ✅      |    ✅    |   ❌    |    ❌    |    ❌    |   ✅    |
| Pulse Surveys            |      ✅      |    ❌    |   ✅    |    ❌    |    ✅    |   ❌    |
| Recognition/Kudos        |      ✅      |    ❌    |   ✅    |    ❌    |    ✅    |   ❌    |
| AI Assistant             |      ✅      |    ✅    |   ❌    |    ❌    |    ❌    |   ❌    |
| Payroll                  |      ✅      |    ✅    |   ❌    |    ❌    |    ❌    |   ✅    |
| Driver Management        |      ✅      |    ❌    |   ❌    |    ❌    |    ❌    |   ❌    |
| Approvals Workflow       |      ✅      |    ✅    |   ✅    |    ✅    |    ❌    |   ❌    |
| Analytics Dashboard      |      ✅      |    ✅    |   ✅    |    ✅    |    ✅    |   ❌    |
| Multi-language (3+)      |      ✅      |    ✅    |   ✅    |    ❌    |    ❌    |   ✅    |
| **LMS**                  |      🔲      |    ✅    |   ❌    |    ❌    |    ✅    |   ❌    |
| **Compensation**         |      🔲      |    ✅    |   ❌    |    ✅    |    ❌    |   ❌    |
| **Benefits**             |      🔲      |    ✅    |   ❌    |    ✅    |    ❌    |   ✅    |
| **Org Chart**            |      🔲      |    ❌    |   ✅    |    ✅    |    ❌    |   ❌    |
| **Documents**            |      🔲      |    ✅    |   ❌    |    ✅    |    ❌    |   ❌    |
| **Expenses**             |      🔲      |    ✅    |   ❌    |    ❌    |    ❌    |   ❌    |
| **Succession**           |      🔲      |    ❌    |   ❌    |    ❌    |    ✅    |   ❌    |
| **PWA/Mobile**           |      🔲      |    ✅    |   ✅    |    ✅    |    ✅    |   ✅    |
| **TOTAL**                |   **~22**    | **~16**  | **~14** | **~11**  | **~10**  | **~13** |

**After completing Phase 2:** This project will have **~29 features**, surpassing all competitors.
**After completing Phase 3:** This project will have **~38 features**, becoming the most comprehensive HR platform.

---

## How to Use This File

1. Pick a module number (e.g., "2.1" for LMS)
2. Check the "Required files" section for what needs to be created
3. Follow the "Technical Standards" for file structure and patterns
4. Update this file after completing each module (change 🔲 → ✅)
5. Update the competitive analysis table

> 💡 **Next recommended module:** 2.4 Visual Org Chart (quick win, 2-3 days) or 2.1 LMS (biggest competitive gap, 7-10 days)
