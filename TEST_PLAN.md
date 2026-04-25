# 🧪 HR Office Platform — QA Test Plan

| Field          | Value                      |
| -------------- | -------------------------- |
| **Project**    | HR Office Platform         |
| **Repository** | `roma-frontend/hr-project` |
| **Version**    | 1.0.0                      |
| **Author**     | Roman Gulanyan             |
| **Date**       | April 2026                 |
| **Status**     | Active                     |

---

## 🎯 Test Strategy

| Level             | Scope                                            | Tools                          |
| ----------------- | ------------------------------------------------ | ------------------------------ |
| **Unit**          | Components, hooks, utilities, Convex functions   | Jest, React Testing Library    |
| **Integration**   | API routes, Convex actions, service interactions | Jest, MSW, Convex test harness |
| **E2E**           | Full user flows, cross-browser                   | Playwright (Chromium, Firefox) |
| **Security**      | Auth, RBAC, injection, headers                   | CodeQL, OWASP ZAP              |
| **Performance**   | Load testing, Core Web Vitals                    | k6, Lighthouse                 |
| **Accessibility** | WCAG 2.1 AA compliance                           | axe-core, Playwright a11y      |

## 📊 Coverage Targets

| Metric         | Target | Gate                 |
| -------------- | ------ | -------------------- |
| **Statements** | ≥ 80%  | ✅ CI fails if below |
| **Branches**   | ≥ 75%  | ✅ CI fails if below |
| **Functions**  | ≥ 80%  | ✅ CI fails if below |
| **Lines**      | ≥ 80%  | ✅ CI fails if below |

## 🐛 Bug Severity

| Severity           | SLA                 |
| ------------------ | ------------------- |
| **S1 🔴 Critical** | Fix within 4 hours  |
| **S2 🟠 Major**    | Fix within 24 hours |
| **S3 🟡 Minor**    | Fix within 1 sprint |
| **S4 🟢 Trivial**  | Backlog             |

---

## 📝 Test Cases

### 1. Auth & Security (14 cases)

| ID       | Name                          | Expected Result                                  | Priority | Type        |
| -------- | ----------------------------- | ------------------------------------------------ | -------- | ----------- |
| AUTH-001 | Azure AD OAuth login          | User authenticated, redirected to dashboard      | P0       | E2E         |
| AUTH-002 | Google OAuth login            | User authenticated with Google profile           | P0       | E2E         |
| AUTH-003 | TOTP 2FA setup                | 2FA enabled, recovery codes displayed            | P0       | E2E         |
| AUTH-004 | TOTP 2FA verification         | Login succeeds with valid code; invalid rejected | P0       | Integration |
| AUTH-005 | WebAuthn passkey registration | Passkey registered, listed in settings           | P1       | E2E         |
| AUTH-006 | WebAuthn passkey login        | Login without password                           | P1       | E2E         |
| AUTH-007 | Session expiry & refresh      | Token silently refreshed                         | P0       | Integration |
| AUTH-008 | RBAC — Superadmin access      | All modules accessible                           | P0       | E2E         |
| AUTH-009 | RBAC — Employee restrictions  | 403 on admin pages                               | P0       | E2E         |
| AUTH-010 | RBAC — Supervisor scope       | Only own team visible                            | P1       | Integration |
| AUTH-011 | Rate limiting — login         | Account locked after threshold                   | P0       | Integration |
| AUTH-012 | CSP headers verification      | Security headers present                         | P0       | Security    |
| AUTH-013 | CSRF protection               | External POST rejected                           | P0       | Security    |
| AUTH-014 | Bcrypt password hashing       | Hash starts with $2b$12$                         | P0       | Unit        |

### 2. Employee Lifecycle (9 cases)

| ID      | Name                      | Expected Result                 | Priority | Type        |
| ------- | ------------------------- | ------------------------------- | -------- | ----------- |
| EMP-001 | Create employee           | Employee in DB, in directory    | P0       | E2E         |
| EMP-002 | Edit employee             | Changes persisted, audit log    | P0       | E2E         |
| EMP-003 | Deactivate employee       | Status Inactive, access revoked | P0       | E2E         |
| EMP-004 | Photo upload (Cloudinary) | Image optimized, URL stored     | P1       | Integration |
| EMP-005 | Search & filter           | Real-time filtered results      | P1       | E2E         |
| EMP-006 | Document management       | PDF stored, downloadable        | P1       | Integration |
| EMP-007 | Bulk import (CSV)         | All rows created, errors shown  | P2       | E2E         |
| EMP-008 | Audit log                 | All changes logged              | P1       | Integration |
| EMP-009 | Duplicate detection       | Duplicate email blocked         | P0       | Unit        |

### 3. Face Recognition Attendance (9 cases)

| ID      | Name                   | Expected Result                    | Priority | Type        |
| ------- | ---------------------- | ---------------------------------- | -------- | ----------- |
| ATT-001 | Camera permission      | Stream displayed                   | P0       | E2E         |
| ATT-002 | Check-in               | Recorded with timestamp            | P0       | E2E         |
| ATT-003 | Check-out              | Hours calculated                   | P0       | E2E         |
| ATT-004 | Multiple faces         | Warning, button disabled           | P1       | Integration |
| ATT-005 | No face detected       | Message shown                      | P1       | Integration |
| ATT-006 | Camera denied fallback | Manual form shown                  | P1       | E2E         |
| ATT-007 | Attendance report      | Table with times, late highlighted | P1       | E2E         |
| ATT-008 | Low-light handling     | Warning or fallback                | P2       | Integration |
| ATT-009 | Anomaly detection      | Flagged, supervisor notified       | P2       | Unit        |

### 4. Leave Management (10 cases)

| ID      | Name                    | Expected Result               | Priority | Type        |
| ------- | ----------------------- | ----------------------------- | -------- | ----------- |
| LVE-001 | Submit request          | Pending, supervisor notified  | P0       | E2E         |
| LVE-002 | Approve leave           | Approved, balance deducted    | P0       | E2E         |
| LVE-003 | Reject with reason      | Rejected, employee notified   | P0       | E2E         |
| LVE-004 | Outlook Calendar sync   | Event created (Out of Office) | P0       | Integration |
| LVE-005 | Balance calculation     | Correct remaining balance     | P0       | Unit        |
| LVE-006 | Overlapping detection   | Overlap rejected              | P0       | Unit        |
| LVE-007 | Leave types             | Each follows own policy       | P1       | Integration |
| LVE-008 | Entitlement by category | Staff 30d, Contractor 15d     | P1       | Unit        |
| LVE-009 | Cancel → remove event   | Outlook event removed         | P1       | Integration |
| LVE-010 | Multi-level approval    | Supervisor + Admin chain      | P1       | E2E         |

### 5. Task Management (7 cases)

| ID      | Name                  | Expected Result          | Priority | Type        |
| ------- | --------------------- | ------------------------ | -------- | ----------- |
| TSK-001 | Create task           | In To Do column          | P0       | E2E         |
| TSK-002 | Drag-and-drop         | Status updated, synced   | P0       | E2E         |
| TSK-003 | Assign to member      | Assignee notified        | P1       | E2E         |
| TSK-004 | Deadline notification | Alert 24h before         | P1       | Integration |
| TSK-005 | Filtering             | Correct subset           | P1       | E2E         |
| TSK-006 | Completion            | Timestamp recorded       | P1       | E2E         |
| TSK-007 | Comments              | Saved, watchers notified | P2       | Integration |

### 6. Team Chat (7 cases)

| ID      | Name            | Expected Result             | Priority | Type        |
| ------- | --------------- | --------------------------- | -------- | ----------- |
| CHT-001 | Send message    | Instant delivery            | P0       | E2E         |
| CHT-002 | Real-time sync  | < 1 second delivery         | P0       | Integration |
| CHT-003 | File sharing    | Uploaded, link in chat      | P1       | E2E         |
| CHT-004 | Create channel  | Visible to members          | P1       | E2E         |
| CHT-005 | Message search  | Results with context        | P2       | E2E         |
| CHT-006 | Unread count    | Badge shows, clears on read | P1       | Integration |
| CHT-007 | Direct messages | Private 1-on-1              | P1       | E2E         |

### 7. AI HR Assistant (6 cases)

| ID     | Name                 | Expected Result         | Priority | Type        |
| ------ | -------------------- | ----------------------- | -------- | ----------- |
| AI-001 | Policy Q&A           | Correct answer          | P1       | E2E         |
| AI-002 | Analytics query      | Accurate count          | P1       | Integration |
| AI-003 | Context retention    | Remembers previous turn | P2       | Integration |
| AI-004 | Error handling       | Graceful fallback       | P1       | Unit        |
| AI-005 | Response accuracy    | Exact match with DB     | P0       | Integration |
| AI-006 | Sensitive data guard | RBAC enforced           | P0       | Security    |

### 8. Driver Management (6 cases)

| ID      | Name                  | Expected Result         | Priority | Type        |
| ------- | --------------------- | ----------------------- | -------- | ----------- |
| DRV-001 | Register driver       | Active profile          | P1       | E2E         |
| DRV-002 | Create booking        | Pending booking         | P1       | E2E         |
| DRV-003 | Availability calendar | Color-coded slots       | P1       | E2E         |
| DRV-004 | Conflict detection    | Double-booking rejected | P0       | Unit        |
| DRV-005 | Assignment            | Confirmed, notified     | P1       | Integration |
| DRV-006 | Cancellation          | Slot freed              | P1       | E2E         |

### 9. AI Analytics (6 cases)

| ID      | Name               | Expected Result        | Priority | Type        |
| ------- | ------------------ | ---------------------- | -------- | ----------- |
| ANL-001 | Dashboard load     | All widgets < 3s       | P0       | E2E         |
| ANL-002 | Headcount trend    | Correct data           | P1       | Integration |
| ANL-003 | Leave patterns     | By type, peaks shown   | P1       | E2E         |
| ANL-004 | Attendance heatmap | By day/hour            | P1       | Integration |
| ANL-005 | Data export        | CSV/PDF matches screen | P2       | E2E         |
| ANL-006 | Role-based scope   | Scoped to role         | P0       | Integration |

### 10. Microsoft 365 Integration (7 cases)

| ID       | Name                | Expected Result              | Priority | Type        |
| -------- | ------------------- | ---------------------------- | -------- | ----------- |
| M365-001 | SharePoint sync     | Employees fetched and mapped | P0       | Integration |
| M365-002 | Data mapping        | Correct field mapping        | P0       | Unit        |
| M365-003 | Incremental sync    | Only changed records         | P1       | Integration |
| M365-004 | Outlook event       | Leave event created          | P0       | Integration |
| M365-005 | Token refresh       | Auto-refresh works           | P0       | Integration |
| M365-006 | Throttling handling | Backoff retry                | P1       | Integration |
| M365-007 | Schema validation   | Warning on missing column    | P1       | Integration |

### 11. Stripe Billing (6 cases)

| ID      | Name                | Expected Result                | Priority | Type        |
| ------- | ------------------- | ------------------------------ | -------- | ----------- |
| BIL-001 | Create subscription | Active in Stripe               | P0       | E2E         |
| BIL-002 | Upgrade plan        | Prorated, features unlocked    | P1       | E2E         |
| BIL-003 | Payment failure     | Grace period, notified         | P0       | Integration |
| BIL-004 | Webhook processing  | Signature valid, state updated | P0       | Integration |
| BIL-005 | Cancel subscription | Cancels at period end          | P1       | E2E         |
| BIL-006 | Invoice download    | PDF correct                    | P2       | E2E         |

### 12. i18n (5 cases)

| ID       | Name              | Expected Result        | Priority | Type |
| -------- | ----------------- | ---------------------- | -------- | ---- |
| I18N-001 | EN → RU           | All UI in Russian      | P1       | E2E  |
| I18N-002 | EN → HY           | All UI in Armenian     | P1       | E2E  |
| I18N-003 | Date localization | Locale-formatted dates | P1       | Unit |
| I18N-004 | Missing fallback  | English fallback       | P2       | Unit |
| I18N-005 | Number formatting | Locale numbers         | P2       | Unit |

### 13. Performance (4 cases)

| ID       | Name              | Expected Result          | Priority | Type |
| -------- | ----------------- | ------------------------ | -------- | ---- |
| PERF-001 | Dashboard LCP     | < 2.5s, Lighthouse ≥ 90  | P0       | Perf |
| PERF-002 | API P95           | < 500ms read, < 1s write | P0       | Perf |
| PERF-003 | 100 concurrent    | 0% errors, P99 < 3s      | P1       | Perf |
| PERF-004 | Real-time latency | < 500ms                  | P1       | Perf |

### 14. Accessibility (4 cases)

| ID       | Name           | Expected Result        | Priority | Type |
| -------- | -------------- | ---------------------- | -------- | ---- |
| A11Y-001 | Keyboard nav   | All elements reachable | P0       | E2E  |
| A11Y-002 | Screen reader  | Content announced      | P1       | E2E  |
| A11Y-003 | Color contrast | WCAG 2.1 AA met        | P1       | Unit |
| A11Y-004 | ARIA labels    | All buttons labeled    | P1       | Unit |

---

## ✅ Sign-Off Criteria

All P0 pass, P1 pass, coverage ≥ 80%, zero S1/S2 bugs, E2E 100%, accessibility zero critical, LCP < 2.5s, CodeQL clean, UAT sign-off, code review approved.

**Total: 82 test cases | P0: 28 | P1: 36 | P2: 14 | P3: 4**
