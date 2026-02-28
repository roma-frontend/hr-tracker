# 🇦🇲 Armenian Translation Guide

## ✅ What's Done

**Translation Files:**
- ✅ `src/i18n/locales/en.json` - 500+ English strings
- ✅ `src/i18n/locales/hy.json` - 500+ Armenian strings
- ✅ Organized in sections: landing, common, nav, auth, dashboard, leave, attendance, employees, reports, settings, notifications, errors, success

**Components Translated:**
- ✅ Landing page (Navbar + Features section)
- ✅ Test page (`/test-i18n`)
- ✅ Language Switcher (🇬🇧 🇦🇲)

**Infrastructure:**
- ✅ react-i18next configured
- ✅ I18nProvider added to root layout
- ✅ Auto language detection + localStorage
- ✅ Armenian holidays calendar

---

## 📋 How to Translate a Component

### Step 1: Import useTranslation

```tsx
'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export default function MyComponent() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome')}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Step 2: Replace Hardcoded Text

**Before:**
```tsx
<h1>Dashboard</h1>
<button>Save</button>
```

**After:**
```tsx
<h1>{t('dashboard.title')}</h1>
<button>{t('common.save')}</button>
```

---

## 🗂️ Translation Keys Structure

### Common Actions
```typescript
t('common.save')        // Պահպանել
t('common.cancel')      // Չեղարկել
t('common.delete')      // Ջնջել
t('common.edit')        // Խմբագրել
t('common.submit')      // Ուղարկել
t('common.search')      // Փնտրել
t('common.filter')      // Զտիչ
```

### Navigation
```typescript
t('nav.dashboard')      // Վահանակ
t('nav.employees')      // Աշխատակիցներ
t('nav.leave')          // Արձակուրդ
t('nav.attendance')     // Ներկայություն
t('nav.reports')        // Հաշվետվություններ
t('nav.settings')       // Կարգավորումներ
```

### Dashboard
```typescript
t('dashboard.title')            // Վահանակ
t('dashboard.welcome')          // Բարի գալուստ HR Office
t('dashboard.quickActions')     // Արագ գործողություններ
t('dashboard.recentActivity')   // Վերջին գործողությունները
```

### Leave Management
```typescript
t('leave.title')            // Արձակուրդների կառավարում
t('leave.requestLeave')     // Արձակուրդի հայտ
t('leave.myLeaves')         // Իմ արձակուրդները
t('leave.pending')          // Սպասվող
t('leave.approved')         // Հաստատված
t('leave.rejected')         // Մերժված
```

### Employees
```typescript
t('employees.title')           // Աշխատակիցներ
t('employees.addEmployee')     // Ավելացնել աշխատակից
t('employees.totalEmployees')  // Ընդամենը աշխատակիցներ
```

---

## 📄 Components To Translate (Priority Order)

### High Priority (Core Features)
1. ✅ **Landing Page** - Partially done
2. ⏳ **Dashboard** (`src/components/dashboard/DashboardClient.tsx`)
3. ⏳ **Leave Management** (`src/app/(dashboard)/leaves/`)
4. ⏳ **Employees** (`src/app/(dashboard)/employees/`)
5. ⏳ **Attendance** (`src/app/(dashboard)/attendance/`)

### Medium Priority
6. ⏳ **Reports** (`src/app/(dashboard)/reports/`)
7. ⏳ **Settings** (`src/app/(dashboard)/settings/`)
8. ⏳ **Profile** (`src/app/(dashboard)/profile/`)

### Low Priority
9. ⏳ **Notifications**
10. ⏳ **Calendar**
11. ⏳ **Tasks**

---

## 🎯 Quick Win Components

Start with these simple components for quick results:

### 1. Dashboard Welcome Message
```tsx
// src/components/dashboard/DashboardClient.tsx
const { t } = useTranslation();

<h1>{t('dashboard.welcome')}, {user.name}!</h1>
```

### 2. Quick Actions
```tsx
<h3>{t('dashboard.quickActions')}</h3>
<button>{t('leave.requestLeave')}</button>
<button>{t('attendance.checkIn')}</button>
```

### 3. Employee List
```tsx
<h1>{t('employees.title')}</h1>
<button>{t('employees.addEmployee')}</button>
<p>{t('employees.totalEmployees')}: {count}</p>
```

---

## 🔧 Adding New Translations

If you need a translation that doesn't exist:

1. **Add to English** (`src/i18n/locales/en.json`):
```json
{
  "mySection": {
    "myKey": "My English Text"
  }
}
```

2. **Add to Armenian** (`src/i18n/locales/hy.json`):
```json
{
  "mySection": {
    "myKey": "Իմ հայերեն տեքստը"
  }
}
```

3. **Use in component**:
```tsx
{t('mySection.myKey')}
```

---

## 🧪 Testing Translations

1. Open http://localhost:3000/test-i18n
2. Click Language Switcher (🌐) in navbar
3. Select **Հայերեն 🇦🇲**
4. Verify all texts change to Armenian

---

## 🚀 Next Steps

1. Translate **Dashboard** components
2. Translate **Leave Management** pages
3. Translate **Employees** pages
4. Test all pages with Armenian
5. Fix any missing translations
6. Commit and push

---

## 💡 Tips

- **Use existing keys** before creating new ones
- **Keep keys organized** by section
- **Test frequently** - switch language often
- **Check hydration** - use `mounted` state for client components
- **Reuse translations** - don't duplicate similar strings

---

## 📚 Full Translation Reference

See complete list of 500+ translations in:
- `src/i18n/locales/en.json`
- `src/i18n/locales/hy.json`

Sections available:
- `landing.*` - Landing page
- `common.*` - Common buttons/actions
- `nav.*` - Navigation
- `auth.*` - Authentication
- `dashboard.*` - Dashboard
- `leave.*` - Leave management
- `attendance.*` - Attendance tracking
- `employees.*` - Employee management
- `reports.*` - Reports & analytics
- `settings.*` - Settings
- `notifications.*` - Notifications
- `errors.*` - Error messages
- `success.*` - Success messages

---

**Ready to translate! Start with Dashboard components and work your way through the list.** 🇦🇲
