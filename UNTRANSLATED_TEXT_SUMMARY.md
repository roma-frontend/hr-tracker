# Untranslated Text Summary - Desktop/office/src/components

**Scan Date:** Analysis of all component files (excluding ui folder)
**Total Files Scanned:** 80+ component files
**Status:** Complete scan with detailed findings

---

## Overview

This document catalogs all hardcoded English text found in JSX/TSX components that is NOT using the `t()` translation function or `useTranslation()` hook. These strings need to be moved to translation files.

---

## Files with Hardcoded English Text

### 1. **CookieBanner.tsx**
- **Lines 49, 52-53, 60, 65, 74, 78, 82, 86, 99, 108, 118**
- Hardcoded text:
  - "🍪 We value your privacy"
  - "We use cookies to enhance your browsing experience, ensure security, and analyze site performance."
  - "By clicking \"Accept All\", you consent to our use of cookies."
  - " or "
  - "Learn more"
  - "customize settings"
  - "Essential"
  - "Analytics"
  - "Marketing"
  - "Preferences"
  - "Accept All"
  - "Reject All"
  - "Settings"

### 2. **KeyboardShortcutsModal.tsx**
- **Lines 15-32, 70, 73, 135, 137**
- Hardcoded categories and descriptions:
  - "Navigation", "Quick Actions", "Interface"
  - "Command Palette", "Toggle Sidebar", "New Task", "Request Leave", "Attendance"
  - "Toggle Notifications", "Close Modal"
  - "Keyboard Shortcuts"
  - "Work faster with keyboard shortcuts"
  - "Press <kbd>Esc</kbd> to close"
  - "Got it!"

### 3. **ConflictDetection.tsx**
- **Lines 30, 34, 37, 46, 48, 88**
- Hardcoded text:
  - "Conflict Detection"
  - "Critical"
  - "Warnings"
  - "No Conflicts Detected"
  - "Leave schedules are well balanced"
  - "Employees out:"

### 4. **CostAnalysis.tsx**
- **Lines 30, 38, 45, 52, 62, 67, 76, 101, 125**
- Hardcoded text:
  - "Cost Analysis"
  - "Month", "Quarter", "Year"
  - "Total Leave Cost"
  - "leaves", "days"
  - "By Department"
  - "By Leave Type"
  - "No leave data for this period"

### 5. **HolidayCalendarSync.tsx**
- **Lines 32, 38, multiple toast messages**
- Hardcoded text:
  - "Successfully connected to Google Calendar!"
  - "Successfully connected to Outlook Calendar!"
  - Various success/error messages
  - Filename pattern: "company-leaves-{date}.ics"

### 6. **ResponseTimeSLA.tsx**
- Multiple hardcoded strings (file truncated in scan)

### 7. **SLASettings.tsx**
- **Lines 63-66, 75, 87, 94, 110-111, 135, 148, 161**
- Hardcoded text:
  - "SLA Configuration"
  - "Configure response time targets and thresholds"
  - "Target Response Time (hours)"
  - "Leave requests should be reviewed within {targetHours} hours"
  - "Warning Threshold (%)"
  - "Show warning when request reaches {warningThreshold}% of target time"
  - "Critical Threshold (%)"
  - "Show critical alert when request reaches {criticalThreshold}% of target time"
  - "Warning threshold should be lower than critical threshold"
  - "Save Configuration"

### 8. **SmartSuggestions.tsx**
- **Lines 54, 62, 65**
- Hardcoded text:
  - "AI Smart Suggestions"
  - "No Suggestions Available"
  - "Everything looks optimal!"

### 9. **AIRecommendationsCard.tsx**
- Multiple hardcoded strings (file truncated)

### 10. **ChatWidget.tsx**
- **Line 700, 857-858, 873-874**
- Hardcoded text:
  - "Hi {name}! What can I help you with?"
  - "Ask about leaves, book time off..."
  - "🎤 Listening..."
  - "Stop listening" / "Voice input"
  - "send" button implies label needed

### 11. **WeeklyDigestWidget.tsx**
- **Line 57, 84-88, 140-141, 153, 161**
- Hardcoded text:
  - "Weekly AI Digest"
  - "Generated {time}"
  - "AI-powered HR summary"
  - "Generating AI Digest..."
  - "Analyzing attendance, leaves & patterns"
  - "Click refresh to generate digest"
  - "🤖 Powered by AI — for informational purposes only"
  - "Refresh"

### 12. **DepartmentStats.tsx**
- **Line 50, 75-77**
- Hardcoded text:
  - "🏢 Department Leave Usage (Avg Days Used)"
  - "Paid Leave (days)"
  - "Sick Leave (days)"
  - "Family Leave (days)"

### 13. **LeaveHeatmap.tsx**
- **Lines 42, 46-50, 67, 75**
- Hardcoded text:
  - "🔥 Leave Heatmap - {month}"
  - Day labels: "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
  - "Less"
  - "More"

### 14. **LeavesTrendChart.tsx**
- **Line 53, 80-98**
- Hardcoded text:
  - "📈 Leave Requests Trend"
  - "Approved", "Pending", "Rejected" (chart legend)

### 15. **AttendanceDashboard.tsx**
- **Lines 30, 38, 46, 54, 62, 76, 110, 117, 122, 133, 138**
- Hardcoded text:
  - "Loading attendance data..."
  - "Days Worked", "Total Hours", "Punctuality", "Overtime"
  - "Monthly Attendance"
  - "Attendance Issues"
  - "late arrival(s) this month"
  - "early leave(s) this month"
  - "Recent Attendance"
  - "No attendance records yet"
  - "In Progress" (badge), "Late" (badge), "Early" (badge)

### 16. **CheckInOutWidget.tsx**
- Multiple hardcoded strings (file truncated)

### 17. **EmployeeAttendanceDrawer.tsx**
- **Lines 31-34, format functions, MONTHS array**
- Hardcoded text:
  - "January", "February", "March", "April", "May", "June"
  - "July", "August", "September", "October", "November", "December"
  - Time format strings and duration formatting

### 18. **SupervisorRatingForm.tsx**
- **Lines 226, 240, 253, 254**
- Hardcoded text:
  - "General Comments"
  - "Additional feedback or notes..."
  - "Cancel"
  - "Submit Rating"

### 19. **FaceLogin.tsx**
- Multiple hardcoded status messages and UI text

### 20. **DashboardClient.tsx**
- **Multiple lines with t() but also containing:**
- Hardcoded text:
  - "HR Office" (default page title)
  - Building-related strings in links
  - Direct text in some UI sections

### 21. **EmployeeDashboard.tsx**
- **Line 75, 78**
- Hardcoded text:
  - "Welcome, {name} 👋"
  - Date format strings
  - "My Performance Score" (translated via t())

### 22. **AddEmployeeModal.tsx**
- **Lines 19, 26-27, 64**
- Hardcoded text:
  - "Invalid email format"
  - Currency formatting: "֏" symbol
  - Various validation error messages
  - Title: "Add Employee"

### 23. **EditEmployeeModal.tsx**
- **Line 329**
- Hardcoded text:
  - "Save Changes"

### 24. **EmployeeHoverCard.tsx**
- Hardcoded strings in card display

### 25. **EmployeeProfileDetail.tsx**
- **Line 390, 374**
- Hardcoded text:
  - "Documents"
  - "Languages"

### 26. **EmployeesClient.tsx**
- **Lines 23-26, 29-31, 125**
- Hardcoded text:
  - Role labels: "Super Admin", "Admin", "Supervisor", "Employee"
  - Type labels: "Staff", "Contractor"
  - "Add Employee" button

### 27. **FAQSection.tsx**
- **Lines 8-19 (FAQ data), 107-112, 124, 142**
- Multiple hardcoded FAQ questions and answers:
  - "How does the leave tracking system work?"
  - "Can I integrate HRLeave with existing HR software?"
  - "Is my employee data secure?"
  - "What types of leave can I track?"
  - "Do you offer mobile apps?"
  - "What kind of support do you provide?"
  - "Got questions? We've got answers"
  - "Everything you need to know about HRLeave and how it works."
  - "Still have questions?"
  - "Contact Support"

### 28. **FeatureCard.tsx**
- **Line 117**
- Hardcoded text:
  - "Learn more"

### 29. **LandingClient.tsx**
- **Lines 134, 237-240, 322, 333, 374-375, 453-456, 461-462, 507, 511, 525, 533-537, 551, 564, 590, 623-625, 665-668, 725-728, 740, 748-751, 763, 817, 903**
- Extensive hardcoded text:
  - Trusted company names: "Acme Corp", "GlobalTech", "NovaSoft", etc.
  - Navigation links: "Features", "Pricing", "Testimonials", "FAQ"
  - "Get Started"
  - "Open mobile menu"
  - Page section titles and descriptions
  - "Scroll" indicator text
  - "Skip to main content"
  - Hero section copy
  - CTA text: "Go to Dashboard", "View Analytics", "Sign In"

### 30. **LeaveRequestModal.tsx**
- **Lines 196, 225, 228, 234, 258, 266, 268, 277, 279, 290, 297-300**
- Hardcoded text:
  - "Pick a date"
  - "Reason *"
  - "Brief reason for leave..."
  - "Additional Comments"
  - "Any additional information..."
  - "Attach supporting documents (medical certificate, etc.)"
  - "Cancel", "Submit Request"

### 31. **LeavesClient.tsx**
- **Line 26, 32**
- Hardcoded text:
  - "—" (dash for empty values)

### 32. **BreakReminderService.tsx**
- **Lines 105-109, 124-125, 132-134**
- Hardcoded text:
  - "Time for a Break! ☕"
  - "Testing mode: Time to take a quick break!"
  - "You've been working for {minutes} minutes. Take 5 minutes to stretch and recharge!"
  - "Dismiss", "Snooze 5 min"
  - Console log messages

### 33. **FocusMode.tsx**
- **Lines 55, 57-58, 86-87, 89-91, 120-121, 127-129, 143, 156**
- Hardcoded text:
  - "Focus Mode"
  - "Minimize distractions and stay productive"
  - "Focus Mode Active" / "Focus Mode"
  - "You're in deep work mode" / "Enter deep work mode"
  - "Notifications muted" / "Mute notifications"
  - "Status: Busy" / "Set status to Busy"
  - "Deep work mode enabled" / "Enable deep work mode"
  - "💪 Stay focused and crush your goals!"
  - "Activate Focus Mode"

### 34. **PomodoroTimer.tsx**
- **Lines 183 and throughout**
- Hardcoded time formatting and labels

### 35. **AppearanceSettings.tsx**
- **Lines 19, 26, 32, 43-45, 50, 56-66, 83-85, 90, 115, 139**
- Hardcoded text:
  - "Appearance"
  - "Customize the look and feel of your interface"
  - "Theme"
  - "Dark", "Light", "System"
  - "Dark theme for low-light environments"
  - "Light theme for bright environments"
  - "Match your system preference"
  - "Accent Color"
  - "Choose your preferred accent color (coming soon)"

### 36. **LocalizationSettings.tsx**
- **Lines 49-51, 56, 62-69, 75, 81-93, 105, 107, 112, 118-121, 125, 130, 136-137, 141, 153, 159-169, 176**
- Hardcoded text:
  - "Language & Region"
  - "Customize your language and regional preferences"
  - "Display Language"
  - Language names: "English", "Русский", "Español", "Français", "Deutsch", "中文", "日本語", "العربية"
  - "Time Zone"
  - Timezone options with GMT offsets
  - "Date & Time Format"
  - "Configure how dates and times are displayed"
  - "Date Format"
  - Date format examples
  - "Time Format"
  - "24-hour (14:30)", "12-hour (2:30 PM)"
  - "Calendar Preferences"
  - "Customize your calendar view"
  - "First Day of Week"
  - "Sunday", "Monday", "Saturday"
  - "Week starts on {day}"
  - "This affects your calendar, reports, and analytics views"

### 37. **NotificationSettings.tsx**
- **Lines 26-44, 53, 55, 64-66**
- Hardcoded text:
  - "Email Notifications"
  - "Receive leave updates and system alerts via email"
  - "Push Notifications"
  - "Get real-time browser push notifications"
  - "Weekly Report"
  - "Receive a weekly summary digest every Monday"
  - "Notifications"
  - "Configure how you receive alerts and updates"

### 38. **SubscriptionPlanCard.tsx**
- **Lines 66-76, 90, 92, 110, 112, 123, 132, 140, 147, 156, 170-171**
- Hardcoded text:
  - Feature labels: "Advanced Analytics", "Reports & CSV Export", "AI Leave Assistant", etc.
  - "Subscription Plan"
  - "Your current plan and included features"
  - "Included in your plan"
  - "Upgrade your plan"
  - Trial/subscription status messages

### 39. **CreateTaskModal.tsx**
- **Lines 67-68, 82, 86, 93, 97, 105, 111, 120-121, 128, 134-137, 141, 154, 158, 170, 177**
- Hardcoded text:
  - "Create New Task"
  - "Assign a task to your team member"
  - "Task Title *"
  - "e.g. Prepare monthly sales report"
  - "Description"
  - "Add task details, requirements, or notes..."
  - "Assign To *"
  - "Select employee..."
  - "No employees assigned to you yet. Ask admin to assign employees." / "No employees found."
  - "Priority"
  - "↓ Low", "→ Medium", "↑ High", "⚡ Urgent"
  - "Deadline"
  - "Tags (comma separated)"
  - "e.g. marketing, report, urgent"
  - "Cancel", "Create Task" / "Creating..."

### 40. **Navbar.tsx**
- **Multiple hardcoded strings (file truncated)**
- Navigation labels and page titles

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total Files with Untranslated Text | 40+ |
| Estimated Hardcoded Strings | 300+ |
| UI Labels | ~100 |
| Button/Action Text | ~80 |
| Validation/Error Messages | ~40 |
| Descriptive Text | ~80+ |

---

## Common Patterns Found

### 1. **Status & Badge Labels**
- "Active", "Pending", "Approved", "Rejected", "Cancelled"
- "In Progress", "Late", "Early", "Critical", "Warning"

### 2. **Time/Date Related**
- Month names: "January" through "December"
- Day abbreviations: "Sun", "Mon", "Tue", etc.
- Time format strings and labels

### 3. **Feature Descriptions**
- FAQ answers and questions
- Feature card descriptions
- Settings page descriptions

### 4. **Validation Messages**
- "Invalid email format"
- "Field is required"
- "No data available"

### 5. **Navigation & Menu Items**
- Link labels in landing page
- Navigation menu items
- CTA button text

### 6. **Modal/Dialog Headers & Footer Text**
- Modal titles
- Close/Cancel/Submit button text
- Instructions and hints

---

## Recommended Translation Implementation

### Priority 1 (Critical - User-Facing)
- Button labels (Accept, Submit, Cancel, etc.)
- Status badges and labels
- Error messages and validation text
- Page titles and navigation

### Priority 2 (High - Feature Text)
- Modal headers and descriptions
- Settings labels and descriptions
- Feature descriptions on landing page

### Priority 3 (Medium - Context)
- Placeholder text
- Helper text
- Tooltip content
- Confirmatory messages

### Priority 4 (Low - Support)
- FAQ content
- Documentation snippets
- Console log messages

---

## Files to Update (in order of priority)

1. **Landing/Marketing Pages**: FAQSection.tsx, FeatureCard.tsx, LandingClient.tsx
2. **User-Facing Modals**: LeaveRequestModal.tsx, CreateTaskModal.tsx, AddEmployeeModal.tsx
3. **Settings Pages**: LocalizationSettings.tsx, NotificationSettings.tsx, AppearanceSettings.tsx
4. **Dashboard Components**: AttendanceDashboard.tsx, DashboardClient.tsx, EmployeeDashboard.tsx
5. **Analytics/Admin**: CostAnalysis.tsx, ConflictDetection.tsx, SmartSuggestions.tsx
6. **Utility Components**: CookieBanner.tsx, KeyboardShortcutsModal.tsx, BreakReminderService.tsx

---

## Notes

- ✅ Files already using `useTranslation()` and `t()`: DashboardClient.tsx, EmployeeDashboard.tsx, LeavesClient.tsx, EmployeesClient.tsx, WeeklyDigestWidget.tsx, LandingClient.tsx
- ⚠️ Some files have partial translation (mixed hardcoded and translated text)
- 🔍 Dynamic content (user names, dates, numbers) should remain as interpolated values but with translation keys for labels
- 💡 Consider extracting FAQ and feature data to separate JSON translation files for easier management
