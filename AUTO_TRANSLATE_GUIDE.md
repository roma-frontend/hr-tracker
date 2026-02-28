# 🤖 Automated Translation Guide

**Дата:** 28 февраля 2026  
**Цель:** Полный перевод всего проекта на 3 языка

---

## 📊 Текущее состояние

### ✅ Переведено (100%)
- Landing Page
- Dashboard (employee + admin)
- Navigation (navbar + sidebar)
- Auth раздел (30 новых ключей добавлено)

### ⏳ Требуют перевода
- Auth Pages (login, register, forgot-password, etc.) - ~10 страниц
- Dashboard Pages (employees, leaves, attendance, settings, etc.) - ~15 страниц
- Admin Pages (analytics, approvals, reports) - ~5 страниц
- Misc Pages (profile, tasks, calendar) - ~5 страниц

**Всего:** ~35 страниц, ~100+ компонентов

---

## 🎯 Стратегия полного перевода

### Этап 1: Массовое добавление ключей
Добавить все необходимые ключи сразу для всех разделов:

```json
{
  "auth": { /* 50 ключей */ },
  "employees": { /* 50 ключей */ },
  "leaves": { /* 50 ключей */ },
  "attendance": { /* 40 ключей */ },
  "settings": { /* 40 ключей */ },
  "profile": { /* 30 ключей */ },
  "admin": { /* 40 ключей */ },
  "tasks": { /* 30 ключей */ },
  "calendar": { /* 30 ключей */ }
}
```

**Итого:** ~360 новых ключей × 3 языка = **1,080 переводов**

### Этап 2: Автоматизированная замена
Создать скрипт который:
1. Находит все `.tsx` файлы
2. Ищет паттерны захардкоженных текстов
3. Предлагает замены на `t()`
4. Сохраняет изменения

### Этап 3: Ручная проверка
Проверить каждую страницу визуально

---

## 📝 Пример полного набора ключей

### Employees (50 ключей)
```json
{
  "employees": {
    "title": "Employees",
    "addEmployee": "Add Employee",
    "editEmployee": "Edit Employee",
    "deleteEmployee": "Delete Employee",
    "viewDetails": "View Details",
    "employeeList": "Employee List",
    "search": "Search employees...",
    "filter": "Filter",
    "export": "Export",
    "import": "Import",
    "bulkActions": "Bulk Actions",
    "selected": "{{count}} selected",
    "selectAll": "Select all",
    "deselectAll": "Deselect all",
    "firstName": "First Name",
    "lastName": "Last Name",
    "email": "Email",
    "phone": "Phone",
    "position": "Position",
    "department": "Department",
    "manager": "Manager",
    "joinDate": "Join Date",
    "status": "Status",
    "active": "Active",
    "inactive": "Inactive",
    "suspended": "Suspended",
    "totalEmployees": "Total Employees",
    "activeEmployees": "Active",
    "newThisMonth": "New this month",
    "profilePicture": "Profile Picture",
    "uploadPhoto": "Upload Photo",
    "removePhoto": "Remove Photo",
    "personalInfo": "Personal Information",
    "contactInfo": "Contact Information",
    "workInfo": "Work Information",
    "dateOfBirth": "Date of Birth",
    "address": "Address",
    "city": "City",
    "country": "Country",
    "zipCode": "ZIP Code",
    "emergencyContact": "Emergency Contact",
    "emergencyPhone": "Emergency Phone",
    "relationshi": "Relationship",
    "hireDate": "Hire Date",
    "salary": "Salary",
    "bankAccount": "Bank Account",
    "documents": "Documents",
    "addDocument": "Add Document",
    "workSchedule": "Work Schedule",
    "permissions": "Permissions",
    "role": "Role",
    "supervisor": "Supervisor",
    "notes": "Notes",
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

### Leaves (50 ключей)
```json
{
  "leaves": {
    "title": "Leave Management",
    "myLeaves": "My Leaves",
    "teamLeaves": "Team Leaves",
    "requestLeave": "Request Leave",
    "leaveHistory": "Leave History",
    "upcomingLeaves": "Upcoming Leaves",
    "pendingRequests": "Pending Requests",
    "leaveBalance": "Leave Balance",
    "leaveType": "Leave Type",
    "annual": "Annual Leave",
    "sick": "Sick Leave",
    "casual": "Casual Leave",
    "maternity": "Maternity Leave",
    "paternity": "Paternity Leave",
    "unpaid": "Unpaid Leave",
    "startDate": "Start Date",
    "endDate": "End Date",
    "duration": "Duration",
    "days": "Days",
    "halfDay": "Half Day",
    "fullDay": "Full Day",
    "reason": "Reason",
    "attachment": "Attachment",
    "addAttachment": "Add Attachment",
    "submit": "Submit Request",
    "approve": "Approve",
    "reject": "Reject",
    "cancel": "Cancel",
    "pending": "Pending",
    "approved": "Approved",
    "rejected": "Rejected",
    "cancelled": "Cancelled",
    "daysAvailable": "{{days}} days available",
    "daysUsed": "{{days}} days used",
    "daysRemaining": "{{days}} days remaining",
    "requestedBy": "Requested by",
    "approvedBy": "Approved by",
    "rejectedBy": "Rejected by",
    "requestDate": "Request Date",
    "approvalDate": "Approval Date",
    "rejectionReason": "Rejection Reason",
    "comment": "Comment",
    "addComment": "Add Comment",
    "viewDetails": "View Details",
    "downloadAttachment": "Download Attachment",
    "leavePolicy": "Leave Policy",
    "conflicts": "Conflicts",
    "noConflicts": "No conflicts",
    "teamMemberOnLeave": "{{name}} will be on leave",
    "overlappingLeaves": "Overlapping leaves detected"
  }
}
```

---

## 🚀 Быстрый старт

### 1. Добавьте все ключи массово
Скопируйте полные наборы ключей в `en.json`, `hy.json`, `ru.json`

### 2. Замените тексты в компонентах
Используйте Find & Replace в VS Code:

**Найти:** `>([A-Z][a-z]+ [A-Z][a-z]+)<`  
**Заменить:** `>{t('section.key')}<`

### 3. Добавьте useTranslation
В каждый компонент:
```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  // ...
}
```

---

## 📋 Приоритет страниц

### Высокий (сделать в первую очередь)
1. Login/Register pages
2. Employees page
3. Leaves page
4. Settings page

### Средний
1. Attendance page
2. Calendar page
3. Profile page
4. Tasks page

### Низкий
1. Analytics page
2. Reports page
3. Admin pages

---

## 🎯 Следующие шаги

1. **Создать полные JSON файлы** со всеми ключами
2. **Запустить массовую замену** через VS Code
3. **Добавить useTranslation** в каждый компонент
4. **Протестировать** каждую страницу

---

**Создано:** AI Assistant  
**Дата:** 28.02.2026  
**Статус:** 🔄 В процессе
