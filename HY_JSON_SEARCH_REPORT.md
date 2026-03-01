# hy.json Generation and Usage Report

## Summary
The Armenian locale file (`hy.json`) is imported and used in the i18n configuration but **no build scripts or code generators currently write to or generate it**. The file is a static JSON asset that must be manually maintained.

---

## File Locations Found

### 1. **Armenian Locale File (Primary Asset)**
- **Path**: `C:\Users\namel\Desktop\office\src\i18n\locales\hy.json`
- **Type**: Static JSON locale file
- **Size**: ~5KB (contains translation keys for Armenian language)
- **Status**: Manually maintained (no auto-generation)

### 2. **i18n Configuration (Imports hy.json)**
- **Path**: `C:\Users\namel\Desktop\office\src\i18n\config.ts`
- **Type**: TypeScript configuration file
- **Key Code**:
```typescript
import hyTranslations from './locales/hy.json';

export const resources = {
  en: {
    translation: enTranslations,
  },
  hy: {
    translation: hyTranslations,
  },
  ru: {
    translation: ruTranslations,
  },
} as const;
```
- **Purpose**: Registers Armenian translations for i18next

### 3. **Language Switcher Component**
- **Path**: `C:\Users\namel\Desktop\office\src\components\LanguageSwitcher.tsx`
- **Type**: React component (TSX)
- **Key Code**:
```typescript
const languages = {
  en: { name: 'English', flag: '🇬🇧' },
  hy: { name: 'Հայերեն', flag: '🇦🇲' },  // Armenian
  ru: { name: 'Русский', flag: '🇷🇺' },
};
```
- **Purpose**: Provides UI for language selection including Armenian

### 4. **i18n Provider Component**
- **Path**: `C:\Users\namel\Desktop\office\src\components\I18nProvider.tsx`
- **Type**: React component (TSX)
- **Purpose**: Manages i18n initialization and language persistence

---

## Translation Generation Scripts

### 1. **Auto-Translate Script**
- **Path**: `C:\Users\namel\Desktop\office\scripts\auto-translate.js`
- **Type**: Node.js script
- **Purpose**: Automatically replaces hardcoded text with `t()` translation function calls
- **Key Features**:
  - Searches for hardcoded text in `.tsx` and `.jsx` files
  - Adds `useTranslation` import if missing
  - Replaces known phrases with translation keys (e.g., "Email" → `t('auth.email')`)
  - Maps common phrases to predefined keys via `COMMON_PHRASES` object
  - **Does NOT write to hy.json** - only modifies component files

**Common Phrases Mapped** (excerpt):
```javascript
const COMMON_PHRASES = {
  // Auth
  'Email': 'auth.email',
  'Email address': 'auth.emailAddress',
  'Password': 'auth.password',
  'Sign In': 'auth.signIn',
  // ... and more
};
```

### 2. **Setup Scripts (Not Translation-Related)**
- `C:\Users\namel\Desktop\office\scripts\setup-adb-arrm.js` - Creates ADB-ARRM organization
- `C:\Users\namel\Desktop\office\scripts\setup-adb-arrm-simple.js` - Simplified setup script
- **Note**: These are for organization setup, NOT locale generation

---

## Package.json Scripts

- **Path**: `C:\Users\namel\Desktop\office\package.json`
- **Scripts Section**:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```
- **Finding**: No custom scripts for locale generation or hy.json writing

---

## Next.js Configuration

- **Path**: `C:\Users\namel\Desktop\office\next.config.js`
- **Finding**: No locale-specific configuration found
- **No webpack/build hooks** that write to hy.json

---

## Key Findings

| Aspect | Status | Details |
|--------|--------|---------|
| **hy.json Location** | ✅ Found | `src/i18n/locales/hy.json` |
| **hy.json Imports** | ✅ Found | `src/i18n/config.ts` (line 6) |
| **hy.json Usage** | ✅ Found | Registered in i18next resources |
| **hy.json Generation** | ❌ NOT FOUND | No scripts write to it |
| **hy.json Auto-update** | ❌ NOT FOUND | Must be manually edited |
| **Translation Key Scripts** | ⚠️ Partial | `auto-translate.js` adds `t()` calls but doesn't generate translations |

---

## How hy.json is Currently Used

1. **Imported in config.ts** as `hyTranslations`
2. **Registered with i18next** under the `hy` language code
3. **Accessed via useTranslation() hook** in components:
   ```typescript
   const { t } = useTranslation();
   const text = t('common.save');  // Looks up in hy.json for Armenian
   ```
4. **Selected via LanguageSwitcher** when user chooses Armenian language

---

## What's Missing / Not Automated

❌ **No script generates hy.json entries**
- Locale file must be manually created/updated
- No integration with translation APIs (Google Translate, DeepL, etc.)
- No extraction of untranslated keys to hy.json

❌ **No validation that hy.json has all keys**
- Could have missing translations for new features
- No type checking against en.json structure

❌ **No i18n build-time processing**
- No webpack plugin or Next.js middleware that writes locale files
- No dynamic locale generation from database or API

---

## File References Summary

### Files That Reference hy.json:
1. `src/i18n/config.ts` - **Primary import location**
2. `src/components/LanguageSwitcher.tsx` - **Uses 'hy' language code**
3. `src/components/I18nProvider.tsx` - **Loads via config.ts**

### Files That Could Write to hy.json (Currently Don't):
- None found in workspace

### Scripts Related to Localization:
- `scripts/auto-translate.js` - Adds translation function calls (doesn't generate translations)

---

## Recommendations

If you need to automate hy.json generation, consider:

1. **Add a locale generation script** that:
   - Extracts all translation keys from en.json
   - Fetches Armenian translations from a translation API
   - Generates/updates hy.json

2. **Add validation** to ensure hy.json has all keys from en.json

3. **Integrate with CI/CD** to regenerate locales on each commit

4. **Consider external tools**:
   - `i18next-scanner` - Extracts translation keys
   - Translation APIs: Google Translate, DeepL, Crowdin
