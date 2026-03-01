# 🌍 Translation System Guide

**HR Office Leave Management System**  
Complete guide for developers and translators

---

## 📊 Quick Stats

- **Languages:** 3 (English, Russian, Armenian)
- **Translation Keys:** 1,130 per language
- **Coverage:** 100% across all languages
- **Components Using Translations:** 80+

---

## 🚀 Quick Start

### Using Translations in Components

```tsx
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.welcome')}</h1>
      <button>{t('common.save')}</button>
      <p>{t('errors.required')}</p>
    </div>
  );
}
```

### Adding New Translations

1. **Add to English** (`src/i18n/locales/en.json`):
   ```json
   {
     "myFeature": {
       "title": "My Feature Title"
     }
   }
   ```

2. **Add to Russian** (`src/i18n/locales/ru.json`):
   ```json
   {
     "myFeature": {
       "title": "Заголовок моей функции"
     }
   }
   ```

3. **Add to Armenian** (`src/i18n/locales/hy.json`):
   ```json
   {
     "myFeature": {
       "title": "Իմ գործառույթի վերնագիր"
     }
   }
   ```

---

## 📁 File Structure

```
src/
├── i18n/
│   ├── config.ts              # i18next configuration
│   └── locales/
│       ├── en.json            # English (base)
│       ├── ru.json            # Russian
│       └── hy.json            # Armenian
├── components/
│   └── I18nProvider.tsx       # Translation provider
└── __tests__/
    └── i18n.test.ts           # Automated tests
```

---

## 🗂️ Translation Sections

| Section | Purpose | Example Keys |
|---------|---------|--------------|
| `common` | Shared UI | `save`, `cancel`, `delete` |
| `nav` | Navigation | `dashboard`, `employees` |
| `auth` | Authentication | `login`, `register` |
| `employees` | Employee mgmt | `addEmployee`, `backToEmployees` |
| `analytics` | Analytics | `analyticsDashboard`, `approvalRate` |
| `organization` | Organization | `totalEmployees`, `activeEmployees` |
| `buttons` | Button text | `saving`, `saveChanges` |
| `placeholders` | Form inputs | `searchEmployee`, `enterEmail` |
| `errors` | Error messages | `required`, `invalidEmail` |
| `ariaLabels` | Accessibility | `changeAvatar`, `closeMenu` |
| `titles` | Title attributes | `refresh`, `editOrganization` |

---

## ✅ Best Practices

### DO ✅

```tsx
// Use translation keys
<button>{t('common.save')}</button>

// Use for accessibility
<button title={t('ariaLabels.edit')}>...</button>

// Use semantic keys
t('employees.addEmployee')

// Group related translations
{
  "employees": {
    "add": "Add Employee",
    "edit": "Edit Employee"
  }
}
```

### DON'T ❌

```tsx
// Don't hardcode text
<button>Save</button> // ❌

// Don't use vague keys
t('button1') // ❌

// Don't create duplicates
{
  "save": "Save",
  "saveButton": "Save" // ❌ Use common.save instead
}
```

---

## 🧪 Testing

### Run Tests

```bash
npm test -- i18n.test.ts
```

### What Gets Tested

- ✅ All translation files exist
- ✅ Valid JSON structure
- ✅ Same number of keys in all languages
- ✅ Identical key structure
- ✅ No empty values
- ✅ No missing translations

---

## 🛠️ Common Tasks

### Switching Languages

```tsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="ru">Русский</option>
      <option value="hy">Հայերեն</option>
    </select>
  );
}
```

### Using Variables

```tsx
// Translation file:
{
  "greeting": "Hello, {{name}}!"
}

// Component:
<p>{t('greeting', { name: 'John' })}</p>
// Output: "Hello, John!"
```

### Pluralization

```tsx
// Translation file:
{
  "itemCount": "{{count}} item",
  "itemCount_plural": "{{count}} items"
}

// Component:
<p>{t('itemCount', { count: 5 })}</p>
// Output: "5 items"
```

---

## 🔍 Finding Hardcoded Text

### PowerShell Script

```powershell
# Find hardcoded text in components
Get-ChildItem -Path "src" -Include "*.tsx" -Recurse | 
  Select-String -Pattern '>[A-Z][a-z]{5,}</' |
  Where-Object { $_.Line -notmatch 't\(' }
```

### Manual Search

```bash
# Search for potential hardcoded strings
grep -r ">" src/components/ | grep -v "t(" | grep "[A-Z]"
```

---

## 📝 Translation Workflow

### For Developers

1. ✍️ Write component (can use hardcoded text initially)
2. 🔍 Extract all user-facing text
3. ➕ Add keys to all 3 translation files
4. 🧪 Test with different languages
5. ✅ Run translation tests
6. 💾 Commit changes

### For Translators

1. 📥 Receive English translation file
2. 🌍 Translate to target language
3. 📐 Maintain JSON structure
4. 🔍 Review for accuracy and context
5. 📤 Submit translated file
6. ✅ Developer integrates and tests

---

## 🚨 Troubleshooting

### Issue: Missing Translation Key

**Error:**
```
Missing translation for key: "myKey"
```

**Solution:**
Add the key to all three translation files (en, ru, hy).

---

### Issue: Translations Not Loading

**Check:**
1. Is `I18nProvider` wrapping your app?
2. Are files in `src/i18n/locales/`?
3. Is i18next config correct?

**Debug:**
```tsx
const { i18n } = useTranslation();
console.log('Language:', i18n.language);
console.log('Key exists:', i18n.exists('myKey'));
```

---

### Issue: Language Not Switching

**Solution:**
```tsx
// Force language change
i18n.changeLanguage('ru');

// Clear localStorage
localStorage.removeItem('i18nextLng');
```

---

## 📊 Current Status (March 2026)

### Translation Coverage

- ✅ **English:** 1,130 keys
- ✅ **Russian:** 1,130 keys (100%)
- ✅ **Armenian:** 1,130 keys (100%)

### Recent Additions

- ✅ `analytics` section (5 keys)
- ✅ `employees.backToEmployees`
- ✅ `employees.employeeNotFound`
- ✅ `employees.employeeNotFoundDesc`
- ✅ `organization.totalEmployees`
- ✅ `organization.activeEmployees`
- ✅ `organization.createFirstOrg`
- ✅ `buttons.saving`
- ✅ `buttons.saveChanges`
- ✅ `ui.skipToContent`

### Files Updated (Latest Session)

1. `src/app/(dashboard)/employees/[id]/page.tsx`
2. `src/app/(dashboard)/superadmin/organizations/[id]/edit/page.tsx`
3. `src/app/(dashboard)/superadmin/organizations/page.tsx`
4. `src/app/(dashboard)/reports/page.tsx`
5. `src/app/(dashboard)/analytics/page.tsx`
6. `src/app/(auth)/register/page.tsx`
7. `src/components/ui/avatar-upload.tsx`
8. `src/components/ai/WeeklyDigestWidget.tsx`
9. `src/components/ai/AIRecommendationsCard.tsx`

---

## 📚 Resources

- [react-i18next Docs](https://react.i18next.com/)
- [i18next Docs](https://www.i18next.com/)
- Project Tests: `src/__tests__/i18n.test.ts`

---

**Maintained by:** Development Team  
**Last Updated:** March 1, 2026  
**Status:** ✅ Production Ready
