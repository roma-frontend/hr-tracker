# i18n Hardcoded Text Implementation Guide

**Purpose**: Detailed mapping of all hardcoded English text found during i18n audit with suggested i18n keys and implementation locations.

**Generated**: 2024  
**Status**: READY FOR IMPLEMENTATION

---

## Table of Contents
1. [Productivity Features (Pomodoro)](#1-productivity-features-pomodoro)
2. [Task Management](#2-task-management)
3. [Organization & Auth Errors](#3-organization--auth-errors)
4. [Security Messages](#4-security-messages)
5. [Utility Errors](#5-utility-errors)
6. [Implementation Order](#implementation-order)

---

## 1. Productivity Features (Pomodoro)

### Location: `src/components/productivity/PomodoroTimer.tsx`

#### 1.1 Toast Success Messages

**Current Code (Line 85)**:
```tsx
toast.success(`${mode === "pomodoro" ? "Pomodoro" : "Break"} started!`);
```

**Needed i18n Keys**:
- `pomodoro.pomodoroStarted`: "Pomodoro started!"
- `pomodoro.breakStarted`: "Break started!"

**Updated Code**:
```tsx
const sessionType = mode === "pomodoro" ? t('pomodoro.pomodoroStarted') : t('pomodoro.breakStarted');
toast.success(sessionType);
```

---

**Current Code (Line 117)**:
```tsx
toast.success("Pomodoro completed! 🎉 Time for a break!", { duration: 5000 });
```

**Needed i18n Key**:
- `pomodoro.pomodoroComplete`: "Pomodoro completed! 🎉 Time for a break!"

**Updated Code**:
```tsx
toast.success(t('pomodoro.pomodoroComplete'), { duration: 5000 });
```

---

**Current Code (Line 135)**:
```tsx
toast.success("Break over! Ready to focus? 💪", { duration: 5000 });
```

**Needed i18n Key**:
- `pomodoro.breakOver`: "Break over! Ready to focus? 💪"

**Updated Code**:
```tsx
toast.success(t('pomodoro.breakOver'), { duration: 5000 });
```

---

**Current Code (Line 152)**:
```tsx
toast.success("Long break complete! ✨", { duration: 5000 });
```

**Needed i18n Key**:
- `pomodoro.longBreakComplete`: "Long break complete! ✨"

**Updated Code**:
```tsx
toast.success(t('pomodoro.longBreakComplete'), { duration: 5000 });
```

---

#### 1.2 Toast Error Messages

**Current Code (Line 87)**:
```tsx
toast.error("Failed to start session");
```

**Needed i18n Key**:
- `errors.sessionStartFailed`: "Failed to start session"

**Updated Code**:
```tsx
toast.error(t('errors.sessionStartFailed'));
```

---

#### 1.3 Browser Notification Titles

**Current Code (Line 123)**:
```tsx
new Notification("🎉 Pomodoro Complete!", { ... });
```

**Needed i18n Key**:
- `pomodoro.notificationTitle`: "🎉 Pomodoro Complete!"

**Updated Code**:
```tsx
new Notification(t('pomodoro.notificationTitle'), { ... });
```

---

**Current Code (Line 141)**:
```tsx
new Notification("💪 Break Over!", { ... });
```

**Needed i18n Key**:
- `pomodoro.breakOverTitle`: "💪 Break Over!"

**Updated Code**:
```tsx
new Notification(t('pomodoro.breakOverTitle'), { ... });
```

---

**Current Code (Line 158)**:
```tsx
new Notification("✨ Long Break Complete!", { ... });
```

**Needed i18n Key**:
- `pomodoro.longBreakTitle`: "✨ Long Break Complete!"

**Updated Code**:
```tsx
new Notification(t('pomodoro.longBreakTitle'), { ... });
```

---

#### 1.4 Browser Notification Bodies

**Current Code (Line 124)**:
```tsx
body: "Great work! Time for a 5-minute break."
```

**Needed i18n Key**:
- `pomodoro.breakReadyMsg`: "Great work! Time for a 5-minute break."

**Updated Code**:
```tsx
body: t('pomodoro.breakReadyMsg')
```

---

**Current Code (Line 142)**:
```tsx
body: "Feeling refreshed? Ready to focus again?"
```

**Needed i18n Key**:
- `pomodoro.refreshedMsg`: "Feeling refreshed? Ready to focus again?"

**Updated Code**:
```tsx
body: t('pomodoro.refreshedMsg')
```

---

**Current Code (Line 159)**:
```tsx
body: "Time to get back to crushing your goals!"
```

**Needed i18n Key**:
- `pomodoro.goalsMsg`: "Time to get back to crushing your goals!"

**Updated Code**:
```tsx
body: t('pomodoro.goalsMsg')
```

---

#### 1.5 UI Labels

**Current Code (Line 262)**:
```tsx
{mode === "pomodoro" ? "Focus Time" : mode === "shortBreak" ? "Short Break" : "Long Break"}
```

**Needed i18n Keys**:
- `pomodoro.focusTime`: "Focus Time"
- `pomodoro.shortBreak`: "Short Break"
- `pomodoro.longBreak`: "Long Break"

**Updated Code**:
```tsx
{mode === "pomodoro" ? t('pomodoro.focusTime') : mode === "shortBreak" ? t('pomodoro.shortBreak') : t('pomodoro.longBreak')}
```

---

#### 1.6 Button Text

**Current Code (Line 281-287)**:
```tsx
<Button onClick={handleStart} size="sm" className="w-full">
  <Play className="w-4 h-4 mr-2" />
  Start
</Button>
```

**Needed i18n Key**:
- `buttons.start`: "Start"
- `buttons.resume`: "Resume"
- `buttons.pause`: "Pause"

**Updated Code**:
```tsx
<Button onClick={handleStart} size="sm" className="w-full">
  <Play className="w-4 h-4 mr-2" />
  {t('buttons.start')}
</Button>
```

---

#### 1.7 Tips and Hints

**Current Code (Line 299)**:
```tsx
<p className="text-[10px] text-[var(--text-muted)]">
  💡 25 min focus + 5 min break = peak productivity
</p>
```

**Needed i18n Key**:
- `pomodoro.productivityTip`: "💡 25 min focus + 5 min break = peak productivity"

**Updated Code**:
```tsx
<p className="text-[10px] text-[var(--text-muted)]">
  {t('pomodoro.productivityTip')}
</p>
```

---

## 2. Task Management

### Location: `src/components/productivity/TodayTasksPanel.tsx`

#### 2.1 Task Status Messages

**Current Code (Line 26)**:
```tsx
toast.success(newStatus === "completed" ? "Task completed! 🎉" : "Task reopened");
```

**Needed i18n Keys**:
- `tasks.taskCompleted`: "Task completed! 🎉"
- `tasks.taskReopened`: "Task reopened"

**Updated Code**:
```tsx
const message = newStatus === "completed" ? t('tasks.taskCompleted') : t('tasks.taskReopened');
toast.success(message);
```

---

#### 2.2 Task Error Messages

**Current Code (Line 28)**:
```tsx
toast.error("Failed to update task");
```

**Needed i18n Key**:
- `errors.taskUpdateFailed`: "Failed to update task"

**Updated Code**:
```tsx
toast.error(t('errors.taskUpdateFailed'));
```

---

## 3. Organization & Auth Errors

### Location: `convex/organizationRequests.ts`

| Line | Current Text | i18n Key | Suggested Translation |
|------|--------------|----------|----------------------|
| 28 | `Invalid organization slug` | `errors.invalidOrgSlug` | Invalid organization slug |
| 35 | `Organization "{slug}" already exists` | `errors.orgAlreadyExists` | Organization already exists |
| 42 | `This email is already registered` | `errors.emailAlreadyRegistered` | This email is already registered |
| 86 | `Your organization "{name}" has been created successfully. You're on the Starter plan (10 employees max).` | `success.organizationCreatedStarter` | Your organization has been created successfully. You're on the Starter plan. |
| 120 | `Invalid organization slug` | `errors.invalidOrgSlug` | Invalid organization slug |
| 127 | `Organization "{slug}" already exists` | `errors.orgAlreadyExists` | Organization already exists |
| 136 | `You already have a pending organization request` | `errors.pendingReqExists` | You already have a pending organization request |
| 143 | `This email is already registered` | `errors.emailAlreadyRegistered` | This email is already registered |
| 198 | `Superadmin only` | `errors.superadminOnly` | This action is restricted to superadmins |
| 230 | `Only superadmin can approve organization requests` | `errors.superadminApproveOnly` | Only superadmins can approve organization requests |
| 234 | `Request not found` | `errors.requestNotFound` | Request not found |
| 236 | `This request has already been reviewed` | `errors.requestAlreadyReviewed` | This request has already been reviewed |
| 243 | `Organization slug is already taken` | `errors.slugTaken` | Organization slug is already taken |
| 322 | `Only superadmin can reject organization requests` | `errors.superadminRejectOnly` | Only superadmins can reject organization requests |
| 326 | `Request not found` | `errors.requestNotFound` | Request not found |
| 328 | `This request has already been reviewed` | `errors.requestAlreadyReviewed` | This request has already been reviewed |

**Implementation Strategy**:
Replace all `throw new Error()` statements with function calls that throw localized error messages:

```tsx
// Before
throw new Error("Invalid organization slug");

// After
throw new Error(t('errors.invalidOrgSlug'));
```

---

## 4. Security Messages

### Location: `src/proxy.ts`

| Line | Current Text | i18n Key | Type |
|------|--------------|----------|------|
| 70 | `🚨 Potential DDoS attack from IP: ${ip}` | `security.ddosAttempt` | Log (Optional) |
| 175 | `Too many login attempts` | `errors.tooManyLoginAttempts` | Error (HIGH PRIORITY) |
| 193 | `🚨 SQL Injection attempt from ${ip}` | `security.sqlInjectionAttempt` | Log (Optional) |

**Note**: Lines 70 and 193 are security log messages (optional for translation). Line 175 is user-facing and HIGH PRIORITY.

**Implementation for Line 175**:
```tsx
// Before
error: 'Too many login attempts',

// After
error: t('errors.tooManyLoginAttempts'),
```

---

### Location: `src/lib/faceApi.ts`

| Line | Current Text | i18n Key | Type |
|------|--------------|----------|------|
| 32 | `Error loading Face-API models` | `errors.modelLoadFailed` | Error Log |
| 66 | `Error detecting face` | `errors.faceDetectionFailed` | Error Log |

**Note**: These are primarily for logging; user-facing error messages should be added to `errors` section if shown in UI.

---

### Location: `src/components/LanguageSwitcher.tsx`

| Line | Current Text | i18n Key | Type |
|------|--------------|----------|------|
| 36 | `Failed to save to localStorage` | `errors.localStorageSaveFailed` | Log/Console Error |

**Note**: This is a debug message; optional for full translation but recommended for completeness.

---

## 5. Utility Errors

### General Error Messages

These errors should be added to the `errors` section if not already present:

| i18n Key | Suggested Translation | Use Case |
|----------|----------------------|----------|
| `errors.invalidOrgSlug` | Invalid organization slug | Org creation |
| `errors.orgAlreadyExists` | Organization already exists | Org creation |
| `errors.emailAlreadyRegistered` | This email is already registered | Registration |
| `errors.superadminOnly` | This action is restricted to superadmins | Authorization |
| `errors.tooManyLoginAttempts` | Too many login attempts | Security |
| `errors.requestNotFound` | Request not found | Data retrieval |
| `errors.requestAlreadyReviewed` | This request has already been reviewed | State validation |
| `errors.sessionStartFailed` | Failed to start session | Pomodoro |
| `errors.taskUpdateFailed` | Failed to update task | Task management |
| `errors.modelLoadFailed` | Error loading Face-API models | Face recognition |
| `errors.faceDetectionFailed` | Error detecting face | Face recognition |
| `errors.localStorageSaveFailed` | Failed to save to localStorage | Storage |

---

## Implementation Order

### Phase 1: Critical (User-Facing Errors)
1. **Convex Errors** (`convex/organizationRequests.ts`)
   - Focus on error messages users will see
   - Total: ~12 unique error messages
   - Effort: HIGH (requires error message localization)

2. **Login Attempts** (`src/proxy.ts` line 175)
   - `errors.tooManyLoginAttempts`
   - Effort: LOW (single message)

### Phase 2: High Priority (UI Components)
3. **Pomodoro Component** (`src/components/productivity/PomodoroTimer.tsx`)
   - Toast messages, notifications, labels
   - Total: 13 strings
   - Effort: MEDIUM (mostly copy updates)

4. **Tasks Component** (`src/components/productivity/TodayTasksPanel.tsx`)
   - Task status messages and errors
   - Total: 2 strings
   - Effort: LOW

### Phase 3: Medium Priority (Logging/Optional)
5. **Debug/Console Messages**
   - `src/proxy.ts` lines 70, 193
   - `src/lib/faceApi.ts` lines 32, 66
   - `src/components/LanguageSwitcher.tsx` line 36
   - Effort: LOW (optional, for completeness)

---

## JSON File Updates Required

### en.json Updates Needed

Add the following sections or update existing ones:

```json
{
  "pomodoro": {
    "pomodoroStarted": "Pomodoro started!",
    "breakStarted": "Break started!",
    "pomodoroComplete": "Pomodoro completed! 🎉 Time for a break!",
    "breakOver": "Break over! Ready to focus? 💪",
    "longBreakComplete": "Long break complete! ✨",
    "notificationTitle": "🎉 Pomodoro Complete!",
    "breakOverTitle": "💪 Break Over!",
    "longBreakTitle": "✨ Long Break Complete!",
    "breakReadyMsg": "Great work! Time for a 5-minute break.",
    "refreshedMsg": "Feeling refreshed? Ready to focus again?",
    "goalsMsg": "Time to get back to crushing your goals!",
    "focusTime": "Focus Time",
    "shortBreak": "Short Break",
    "longBreak": "Long Break",
    "productivityTip": "💡 25 min focus + 5 min break = peak productivity"
  },
  "tasks": {
    "taskCompleted": "Task completed! 🎉",
    "taskReopened": "Task reopened"
  },
  "errors": {
    "sessionStartFailed": "Failed to start session",
    "taskUpdateFailed": "Failed to update task",
    "invalidOrgSlug": "Invalid organization slug",
    "orgAlreadyExists": "Organization already exists",
    "emailAlreadyRegistered": "This email is already registered",
    "pendingReqExists": "You already have a pending organization request",
    "superadminOnly": "This action is restricted to superadmins",
    "superadminApproveOnly": "Only superadmins can approve organization requests",
    "superadminRejectOnly": "Only superadmins can reject organization requests",
    "requestNotFound": "Request not found",
    "requestAlreadyReviewed": "This request has already been reviewed",
    "slugTaken": "Organization slug is already taken",
    "tooManyLoginAttempts": "Too many login attempts",
    "modelLoadFailed": "Failed to load Face-API models",
    "faceDetectionFailed": "Error detecting face",
    "localStorageSaveFailed": "Failed to save to localStorage"
  },
  "success": {
    "organizationCreatedStarter": "Your organization has been created successfully. You're on the Starter plan (10 employees max)."
  }
}
```

### Existing Buttons Section
Update existing `buttons` section or add:

```json
{
  "buttons": {
    "start": "Start",
    "resume": "Resume",
    "pause": "Pause"
  }
}
```

---

## Testing Recommendations

1. **Locale Testing**: Test each string in all three languages (en, ru, hy)
2. **Character Limits**: Ensure UI layouts accommodate translations (especially German/Russian if added)
3. **Pluralization**: Test messages with dynamic content (organization names, etc.)
4. **Notifications**: Browser notifications should display correctly with translated text
5. **Toast Messages**: Verify toast styling works with different length translations

---

## Notes

- Emoji usage is preserved (e.g., 🎉, 💪, ✨) as they're language-agnostic
- Dynamic content (e.g., organization slug, email) should use template strings with i18n
- Consider adding context for translators (e.g., where these messages appear)
- Test RTL support if Armenian has unique layout requirements

