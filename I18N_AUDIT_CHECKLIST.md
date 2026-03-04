# i18n Audit - Quick Reference Checklist

**Purpose**: Quick reference for all issues found and their resolution status  
**Last Updated**: 2024  
**Status**: Audit Complete - Implementation Pending

---

## Executive Checklist

### Critical Issues (Must Fix)
- [ ] **Russian File Encoding** - 6+ keys contain mojibake in `socialProof` section
  - Location: `/src/i18n/locales/ru.json`
  - Affected: trustedBy, companies, rating, reviews, customers, growth
  - Action: Re-export with proper UTF-8 encoding
  - Priority: HIGHEST

### High Priority Issues (Should Fix)
- [ ] **UI Component Hardcoded Strings** - 15 strings in Pomodoro & Tasks components
  - Location: `src/components/productivity/`
  - Count: 13 in PomodoroTimer.tsx, 2 in TodayTasksPanel.tsx
  - Action: Migrate to i18n using new `pomodoro` and `tasks` sections
  - Priority: HIGH

- [ ] **Convex Error Messages** - 16+ hardcoded errors
  - Location: `convex/organizationRequests.ts`, `convex/security.ts`, `src/proxy.ts`
  - Count: 16+ error messages (multiple occurrences)
  - Action: Add to `errors` section, update throw statements
  - Priority: HIGH

### Medium Priority Issues (Nice to Have)
- [ ] **Armenian Extra Keys** - 5+ keys not in English
  - Location: `hy.json` socialProof & landing sections
  - Keys: title, subtitle, modernHRManagement, everythingYouNeed, powerfulFeatures
  - Action: Verify if these should be in English master file
  - Priority: MEDIUM

- [ ] **File Size Discrepancy** - Russian 85% larger, Armenian 10% larger
  - Location: `/src/i18n/locales/`
  - Action: Investigate root cause after encoding fix
  - Priority: MEDIUM

---

## Hardcoded Text Migration Checklist

### Phase 1: Pomodoro Component
**File**: `src/components/productivity/PomodoroTimer.tsx`

#### Strings to migrate (13 total):
- [ ] Line 85: "Pomodoro started!" → `pomodoro.pomodoroStarted`
- [ ] Line 85: "Break started!" → `pomodoro.breakStarted`
- [ ] Line 87: "Failed to start session" → `errors.sessionStartFailed`
- [ ] Line 117: "Pomodoro completed! 🎉 Time for a break!" → `pomodoro.pomodoroComplete`
- [ ] Line 123: "🎉 Pomodoro Complete!" → `pomodoro.notificationTitle`
- [ ] Line 124: "Great work! Time for a 5-minute break." → `pomodoro.breakReadyMsg`
- [ ] Line 135: "Break over! Ready to focus? 💪" → `pomodoro.breakOver`
- [ ] Line 141: "💪 Break Over!" → `pomodoro.breakOverTitle`
- [ ] Line 142: "Feeling refreshed? Ready to focus again?" → `pomodoro.refreshedMsg`
- [ ] Line 152: "Long break complete! ✨" → `pomodoro.longBreakComplete`
- [ ] Line 158: "✨ Long Break Complete!" → `pomodoro.longBreakTitle`
- [ ] Line 159: "Time to get back to crushing your goals!" → `pomodoro.goalsMsg`
- [ ] Line 262: "Focus Time" / "Short Break" / "Long Break" → `pomodoro.focusTime`, `pomodoro.shortBreak`, `pomodoro.longBreak`
- [ ] Line 281: Button text "Start" → `buttons.start`
- [ ] Line 287: Button text "Resume" → `buttons.resume`
- [ ] Line 289: Button text "Pause" → `buttons.pause`
- [ ] Line 299: "💡 25 min focus + 5 min break = peak productivity" → `pomodoro.productivityTip`

**Status**: PENDING
**Effort**: MEDIUM
**Estimated Time**: 2-3 hours

---

### Phase 2: Task Management Component
**File**: `src/components/productivity/TodayTasksPanel.tsx`

#### Strings to migrate (2 total):
- [ ] Line 26: "Task completed! 🎉" → `tasks.taskCompleted`
- [ ] Line 26: "Task reopened" → `tasks.taskReopened`
- [ ] Line 28: "Failed to update task" → `errors.taskUpdateFailed`

**Status**: PENDING
**Effort**: LOW
**Estimated Time**: 30 minutes

---

### Phase 3: Convex Error Messages
**File**: `convex/organizationRequests.ts`

#### Unique errors to migrate (7 unique messages):
- [ ] Line 28, 120: "Invalid organization slug" → `errors.invalidOrgSlug`
- [ ] Line 35, 127: "Organization "{slug}" already exists" → `errors.orgAlreadyExists`
- [ ] Line 42, 143: "This email is already registered" → `errors.emailAlreadyRegistered`
- [ ] Line 86: "Your organization "{name}" has been created..." → `success.organizationCreatedStarter`
- [ ] Line 136: "You already have a pending organization request" → `errors.pendingReqExists`
- [ ] Line 198: "Superadmin only" → `errors.superadminOnly`
- [ ] Line 230: "Only superadmin can approve organization requests" → `errors.superadminApproveOnly`
- [ ] Line 234, 326: "Request not found" → `errors.requestNotFound`
- [ ] Line 236, 328: "This request has already been reviewed" → `errors.requestAlreadyReviewed`
- [ ] Line 243: "Organization slug is already taken" → `errors.slugTaken`
- [ ] Line 322: "Only superadmin can reject organization requests" → `errors.superadminRejectOnly`

**Status**: PENDING
**Effort**: HIGH
**Estimated Time**: 4-5 hours

---

### Phase 4: Proxy & Security Messages
**Files**: `src/proxy.ts`, `src/lib/faceApi.ts`, `src/components/LanguageSwitcher.tsx`

#### User-facing error to migrate (1 critical):
- [ ] Line 175: "Too many login attempts" → `errors.tooManyLoginAttempts`

#### Optional log messages (3 total):
- [ ] Line 70: DDoS attempt message → `security.ddosAttempt` (optional)
- [ ] Line 193: SQL injection message → `security.sqlInjectionAttempt` (optional)
- [ ] Line 32 (faceApi.ts): Model loading error → `errors.modelLoadFailed` (optional)
- [ ] Line 66 (faceApi.ts): Face detection error → `errors.faceDetectionFailed` (optional)
- [ ] Line 36 (LanguageSwitcher.tsx): Storage error → `errors.localStorageSaveFailed` (optional)

**Status**: PENDING
**Effort**: LOW (critical), MINIMAL (optional)
**Estimated Time**: 1 hour critical + 1 hour optional

---

## i18n Files Updates Checklist

### en.json Updates
- [ ] Add `pomodoro` section with 14 new keys
- [ ] Add `tasks` section with 3 new keys
- [ ] Update `errors` section with 12-16 new keys
- [ ] Update `success` section (add organization created message)
- [ ] Update `buttons` section (ensure start, resume, pause present)
- [ ] Add `security` section if logging security messages
- [ ] Verify all new keys are unique

**Checklist**:
```
New Pomodoro Keys:
  ✓ pomodoroStarted
  ✓ breakStarted
  ✓ pomodoroComplete
  ✓ breakOver
  ✓ longBreakComplete
  ✓ notificationTitle
  ✓ breakOverTitle
  ✓ longBreakTitle
  ✓ breakReadyMsg
  ✓ refreshedMsg
  ✓ goalsMsg
  ✓ focusTime
  ✓ shortBreak
  ✓ longBreak
  ✓ productivityTip

New Task Keys:
  ✓ taskCompleted
  ✓ taskReopened

New Error Keys:
  ✓ sessionStartFailed
  ✓ taskUpdateFailed
  ✓ invalidOrgSlug
  ✓ orgAlreadyExists
  ✓ emailAlreadyRegistered
  ✓ pendingReqExists
  ✓ superadminOnly
  ✓ superadminApproveOnly
  ✓ superadminRejectOnly
  ✓ requestNotFound
  ✓ requestAlreadyReviewed
  ✓ slugTaken
  ✓ tooManyLoginAttempts
  ✓ modelLoadFailed (optional)
  ✓ faceDetectionFailed (optional)
  ✓ localStorageSaveFailed (optional)

New Success Keys:
  ✓ organizationCreatedStarter

Security Keys (optional):
  ✓ ddosAttempt
  ✓ sqlInjectionAttempt
```

---

### ru.json Updates
**Prerequisites**: Fix encoding corruption first!

- [ ] Add `pomodoro` section with 14 keys (translated)
- [ ] Add `tasks` section with 3 keys (translated)
- [ ] Update `errors` section with 12-16 keys (translated)
- [ ] Update `success` section (translated)
- [ ] Update `buttons` section (translated)
- [ ] Fix corrupted keys in `socialProof` section
- [ ] Verify file encodes properly (UTF-8 without BOM)

**Priority**: HIGH (fix encoding first!)
**Status**: BLOCKED until encoding fixed

---

### hy.json Updates
- [ ] Add `pomodoro` section with 14 keys (translated)
- [ ] Add `tasks` section with 3 keys (translated)
- [ ] Update `errors` section with 12-16 keys (translated)
- [ ] Update `success` section (translated)
- [ ] Update `buttons` section (translated)
- [ ] Verify extra keys are intentional or remove if not
- [ ] Confirm Armenian encoding is UTF-8

**Priority**: MEDIUM
**Status**: PENDING

---

## Testing Checklist

### Unit Tests
- [ ] Test Pomodoro component with all three languages
- [ ] Test Task component with all three languages
- [ ] Test error messages display correctly in toast notifications
- [ ] Test fallback to English when translation key missing

### Integration Tests
- [ ] Test language switching in Pomodoro timer
- [ ] Test language switching in task panel
- [ ] Test error messages in multiple languages
- [ ] Test localStorage language preference persists

### Manual Testing
- [ ] Switch language and verify Pomodoro timer updates
- [ ] Check all toast messages appear in correct language
- [ ] Check all notification text is translated
- [ ] Check button text updates with language change
- [ ] Test on mobile devices (responsive behavior)

### Translation Quality
- [ ] Russian translations are accurate (after encoding fix)
- [ ] Armenian translations are accurate
- [ ] No truncation of UI due to translation length
- [ ] Emoji usage is consistent across languages

---

## Encoding Issue Resolution Checklist

### For Russian File (ru.json)

**Steps to Fix**:
1. [ ] Identify root cause (export encoding? file corruption?)
2. [ ] Request corrected file from translator/source
3. [ ] If re-exporting:
   - [ ] Ensure export format is JSON
   - [ ] Ensure character encoding is UTF-8 (no BOM)
   - [ ] Validate JSON syntax after export
4. [ ] Compare before/after to confirm fix
5. [ ] Verify all keys parse correctly
6. [ ] Test display in UI

**Verification**:
- [ ] `ru.json` file size returns to normal (closer to en.json size)
- [ ] No mojibake in `socialProof` section
- [ ] All Cyrillic characters display correctly
- [ ] File passes JSON validation

---

## Quality Assurance Checklist

### Pre-Deployment
- [ ] All hardcoded strings migrated to i18n
- [ ] All translation files validated (JSON syntax)
- [ ] All three languages tested
- [ ] Russian encoding verified fixed
- [ ] No console errors or warnings
- [ ] No broken layout due to translations

### Post-Deployment
- [ ] Monitor for untranslated text appearing in production
- [ ] Monitor for encoding issues in Russian
- [ ] Gather user feedback on translations
- [ ] Plan for future translation updates

---

## Prioritization Summary

### Must Do (CRITICAL)
1. Fix Russian file encoding
2. Migrate user-facing error "Too many login attempts"

### Should Do (HIGH)
3. Migrate Pomodoro component strings (13 strings)
4. Migrate Task component strings (2 strings)
5. Migrate Convex error messages (16+ occurrences)

### Nice to Have (MEDIUM)
6. Verify Armenian extra keys
7. Migrate optional log/debug messages
8. Add fallback handling for missing keys

### Can Do Later (LOW)
9. Investigate file size discrepancies
10. Add i18n linting rules
11. Create translation guidelines

---

## Effort Estimation

| Task | Priority | Effort | Time |
|------|----------|--------|------|
| Fix Russian encoding | CRITICAL | LOW | 1-2 hrs |
| Migrate Pomodoro | HIGH | MEDIUM | 2-3 hrs |
| Migrate Tasks | HIGH | LOW | 30 min |
| Migrate Convex errors | HIGH | HIGH | 4-5 hrs |
| Migrate proxy messages | HIGH | LOW | 1-2 hrs |
| Update translation files | MEDIUM | MEDIUM | 3-4 hrs |
| Testing | MEDIUM | MEDIUM | 3-4 hrs |
| **TOTAL** | — | — | **15-20 hrs** |

---

## Sign-Off

**Audit Completed**: ✅  
**Critical Issues Found**: Yes (Russian encoding)  
**Recommended Action**: Begin with encoding fix, then proceed with UI migration in parallel  
**Next Review Date**: After implementation of critical fixes

---

**Questions?** Refer to:
- `I18N_AUDIT_REPORT.md` - Detailed findings
- `I18N_HARDCODED_TEXTS_IMPLEMENTATION_GUIDE.md` - Implementation steps
- `I18N_AUDIT_SUMMARY.md` - Executive summary

