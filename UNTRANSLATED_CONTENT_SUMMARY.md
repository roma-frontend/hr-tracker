# Untranslated Content Summary - Desktop/office/src/app/(auth)

## Overview
Scanned 9 files in the `(auth)` directory for hardcoded English text that is not using `t()` or `useTranslation()` hooks.

---

## Files with Untranslated Content

### 1. **forgot-password/page.tsx**
**Status:** ❌ Multiple untranslated strings

| Line | Text | Type | Note |
|------|------|------|------|
| 68 | "HR Office" | Logo text | Hardcoded brand name |
| 69 | "Leave Monitoring" | Tagline | Hardcoded subtitle |
| 78 | "Forgot your password?" | Heading | Should be translated |
| 81 | "No worries! Enter your email and we'll send you a reset link." | Help text | Should be translated |
| 136 | "Sending..." | Loading state | Should be translated |
| 138 | "Send Reset Link" | Button text | Should be translated |
| 154 | "Check your email!" | Success heading | Should be translated |
| 158 | "If an account with [email] exists, we've sent a password reset link. It expires in 1 hour." | Message | Multiple sentences, should be translated |
| 161 | "Didn't receive it? Check your spam folder or" | Text | Should be translated |
| 167 | "try again" | Link text | Should be translated |
| 183 | "Back to login" | Link text | Should be translated |

---

### 2. **login/page.tsx**
**Status:** ❌ Multiple untranslated strings

| Line | Text | Type | Note |
|------|------|------|------|
| 68 | "HR Office" | Logo text | Hardcoded brand name |
| 69 | "Leave Monitoring" | Tagline | Hardcoded subtitle |
| 155 | "Face ID" | Button label | Should be translated |
| 178 | "or continue with email" | Divider text | Should be translated |
| 223 | "Forgot password?" | Link text | Should be translated |
| 283 | "Signing in..." | Loading state | Should be translated |
| 294 | "Don't have an account?" | Text | Should be translated |
| 296 | "Join existing team" | Link text | Should be translated |
| 301 | "or" | Divider text | Should be translated |
| 309 | "🏢 Create New Organization" | Button text | Should be translated |
| 318 | "← Back to home" | Link text | Should be translated |

---

### 3. **register-org/page.tsx**
**Status:** ❌ Multiple untranslated strings (Plan data)

| Line | Text | Type | Note |
|------|------|------|------|
| 13 | "Starter" | Plan name | Should be translated |
| 14 | "Free" | Price | Should be translated |
| 15 | "Perfect for small teams getting started" | Description | Should be translated |
| 19-24 | Feature list (6 items): "Up to 10 employees", "Basic leave management", "Time tracking", "Employee profiles", "Email notifications", "Community support" | Features | All should be translated |
| 30 | "Professional" | Plan name | Should be translated |
| 31 | "$29/mo" | Price | Should be translated |
| 32 | "For growing teams with advanced needs" | Description | Should be translated |
| 36-42 | Feature list (7 items): "Up to 50 employees", "Everything in Starter", "Advanced analytics", "Custom workflows", "Priority support", "API access", "Integrations" | Features | All should be translated |
| 49 | "Enterprise" | Plan name | Should be translated |
| 50 | "Custom" | Price | Should be translated |
| 51 | "Unlimited scale for large organizations" | Description | Should be translated |
| 54-61 | Feature list (7 items): "100+ employees", "Everything in Professional", "Dedicated support", "Custom integrations", "SLA guarantee", "Advanced security", "Training & onboarding" | Features | All should be translated |
| 176 | "Get Started Free" / "Request Access" | Button text (conditional) | Should be translated |
| 182 | "Approval within 24 hours" | Info text | Should be translated |
| 193 | "Already have an organization?" | Text | Should be translated |
| 195 | "Join existing team" | Link text | Should be translated |
| 199 | "← Back to login" | Link text | Should be translated |

---

### 4. **register-org/pending/page.tsx**
**Status:** ❌ Multiple untranslated strings (No useTranslation imported)

| Line | Text | Type | Note |
|------|------|------|------|
| 47 | "Request Submitted!" | Heading | Should be translated |
| 50 | "Thank you for your interest in OfficeHub." | Message | Should be translated |
| 62 | "Request Received" | Timeline step title | Should be translated |
| 65 | "We've received your organization creation request." | Timeline step description | Should be translated |
| 77 | "Under Review" | Timeline step title | Should be translated |
| 80 | "Our team is reviewing your request. This typically takes up to 24 hours." | Timeline step description | Should be translated |
| 92 | "Email Notification" | Timeline step title | Should be translated |
| 95 | "You'll receive an email with login instructions once approved." | Timeline step description | Should be translated |
| 104 | "💡 Next Steps: Check your email for updates. We'll notify you as soon as your organization is ready." | Info box | Should be translated |
| 117 | "Go to Login" | Button text | Should be translated |
| 127 | "Back to Home" | Button text | Should be translated |
| 134 | "Questions? Contact us at support@officehub.com" | Contact text | Should be translated |

---

### 5. **register-org/request/page.tsx**
**Status:** ❌ Multiple untranslated strings

| Line | Text | Type | Note |
|------|------|------|------|
| 40 | "Weak", "Fair", "Good", "Strong" | Password strength labels | Should be translated |
| 503 | "Submitting request..." | Loading state | Should be translated |
| 507 | "Submit Request" | Button text | Should be translated |
| 513 | "We'll review your request and get back to you within 24 hours." | Info text | Should be translated |
| 524 | "Back to plans" | Link text | Should be translated |
| Plus field labels and form validation messages | Various | Not shown due to space |

---

### 6. **register-org/create/page.tsx**
**Status:** ❌ Multiple untranslated strings

| Line | Text | Type | Note |
|------|------|------|------|
| 39 | "Weak", "Fair", "Good", "Strong" | Password strength labels | Should be translated |
| 430 | "Creating organization..." | Loading state | Should be translated |
| 434 | "Create Free Organization" | Button text | Should be translated |
| 441 | "By creating an organization, you agree to our Terms of Service and Privacy Policy." | Legal text | Should be translated |
| 447 | "Back to plans" | Link text | Should be translated |
| Plus field labels and form validation messages | Various | Not shown due to space |

---

### 7. **register/page.tsx**
**Status:** ❌ Multiple untranslated strings

| Line | Text | Type | Note |
|------|------|------|------|
| 41 | "Weak", "Fair", "Good", "Strong" | Password strength labels | Should be translated |
| 183 | "Type at least 2 characters to search for your organization" | Hint text | Should be translated |
| 219 | "Please select your organization" | Error message | Should be translated |
| 251 | "You'll be notified when your account is approved." | Toast message | Should be translated |
| 299 | "Find your organization" / "Create account" | Step title (conditional) | Should be translated |
| 303 | "Search for your company to get started" | Help text | Should be translated |
| 323 | "Organization" / "Your details" | Step label (conditional) | Should be translated |
| 523 | "Creating account…" | Loading state | Should be translated |
| 525 | "Request to Join" | Button text | Should be translated |
| 533 | "Already have an account?" | Text | Should be translated |
| 539 | "or" | Divider text | Should be translated |
| 547 | "🏢 Create New Organization" | Button text | Should be translated |
| 555 | "← Back to home" | Link text | Should be translated |

---

### 8. **reset-password/page.tsx**
**Status:** ❌ Multiple untranslated strings

| Line | Text | Type | Note |
|------|------|------|------|
| 85 | "HR Office" | Logo text | Hardcoded brand name |
| 86 | "Leave Monitoring" | Tagline | Hardcoded subtitle |
| 95 | "Verifying reset link..." | Loading message | Should be translated |
| 105 | "Invalid or expired link" | Error heading | Should be translated |
| 107 | "This reset link has expired or is invalid. Please request a new one." | Error message | Should be translated |
| 112 | "Request new link" | Button text | Should be translated |
| 123 | "Password updated!" | Success heading | Should be translated |
| 125 | "Your password has been reset successfully. Redirecting to login..." | Success message | Should be translated |
| 134 | "Set new password" | Form heading | Should be translated |
| 135 | "Choose a strong password for your account." | Form description | Should be translated |
| 141 | "New password" | Label | Should be translated |
| 165 | "Confirm password" | Label | Should be translated |
| 205 | "Updating..." | Loading state | Should be translated |
| 205 | "Update Password" | Button text | Should be translated |
| 215 | "← Back to login" | Link text | Should be translated |

---

### 9. **layout.tsx**
**Status:** ✅ No untranslated content
- This file only contains a basic layout wrapper with no user-facing text.

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **Total files scanned** | 9 |
| **Files with untranslated content** | 8 |
| **Files using i18n correctly** | 1 |
| **Estimated untranslated strings** | 100+ |

---

## Priority Categories for Translation

### 🔴 **Critical (User-facing UI)**
- Button texts
- Form labels and placeholders
- Headings and page titles
- Error messages
- Success messages
- Loading states

### 🟠 **High (Important Content)**
- Help text and descriptions
- Plan features and pricing
- Timeline/step descriptions
- Navigation links
- Form validation messages

### 🟡 **Medium (Brand/Contact)**
- Logo text ("HR Office", "Leave Monitoring")
- Contact information
- Legal/Terms of Service references

---

## Recommendations

1. **Immediate Action Needed:**
   - `register-org/pending/page.tsx` - Completely missing `useTranslation()` hook
   - `register-org/create/page.tsx` - Partially implemented (has import but missing in some areas)
   - `register-org/request/page.tsx` - Partially implemented

2. **Refactoring Needed:**
   - Extract plan data and features into a translatable constant/config file
   - Create translation keys for all error messages and validation messages
   - Consider moving brand name ("HR Office", "Leave Monitoring") to a centralized config

3. **Translation Keys to Create:**
   - `auth.forgotPassword.title`
   - `auth.forgotPassword.description`
   - `auth.forgotPassword.sendButton`
   - `auth.login.signInButton`
   - `auth.register.stepTitles.*`
   - `auth.resetPassword.*`
   - `plans.*.name`, `plans.*.description`, `plans.*.features.*`
   - And many more...
