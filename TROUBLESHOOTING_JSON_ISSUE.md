# 🔧 Troubleshooting: JSON Parse Error

## Problem
```
Code generation for chunk item errored
Unable to make a module from invalid JSON: expected value at line 1 column 1
```

## Root Cause
BOM (Byte Order Mark) characters in JSON files causing Next.js/Webpack to fail parsing.

## Solution Applied

### 1. ✅ Removed BOM from all JSON files

All translation files have been cleaned:
- `src/i18n/locales/en.json` - ✅ No BOM, starts with `{`
- `src/i18n/locales/ru.json` - ✅ No BOM, starts with `{`
- `src/i18n/locales/hy.json` - ✅ No BOM, starts with `{`

### 2. ✅ Cleared Next.js cache

The `.next` folder has been removed to clear cached modules.

## How to Fix This Issue (If it happens again)

### Step 1: Clear Next.js Cache
```bash
# Stop the dev server (Ctrl+C)
rm -rf .next
rm -rf node_modules/.cache
```

### Step 2: Restart Dev Server
```bash
npm run dev
```

### Step 3: If still failing, verify JSON files

**PowerShell:**
```powershell
# Check for BOM
$bytes = [System.IO.File]::ReadAllBytes("src/i18n/locales/en.json")
if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    Write-Host "File has BOM - needs fixing"
}
```

**Node.js:**
```javascript
const fs = require('fs');
const content = fs.readFileSync('src/i18n/locales/en.json', 'utf8');
console.log('First char code:', content.charCodeAt(0)); // Should be 123 for '{'
```

### Step 4: Remove BOM if present

**PowerShell:**
```powershell
$content = Get-Content "src/i18n/locales/en.json" -Raw
$content = $content.TrimStart([char]0xFEFF)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("src/i18n/locales/en.json", $content, $utf8NoBom)
```

**Node.js:**
```javascript
const fs = require('fs');
const content = fs.readFileSync('file.json', 'utf8').replace(/^\uFEFF/, '');
fs.writeFileSync('file.json', content, 'utf8');
```

## Prevention

### Always use UTF-8 without BOM for JSON files

**VS Code settings.json:**
```json
{
  "[json]": {
    "files.encoding": "utf8"
  }
}
```

**When using PowerShell:**
```powershell
# Always use this method to save JSON
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

# DON'T use:
# Out-File (adds BOM)
# Set-Content (may add BOM)
```

**When using Node.js:**
```javascript
// This is safe (no BOM)
fs.writeFileSync('file.json', JSON.stringify(data, null, 2), 'utf8');
```

## Verification

### Quick Check (PowerShell)
```powershell
cd Desktop/office
node scripts/test-translations.js
```

All tests should pass (27/27).

### Check in Browser
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard reload (Ctrl+Shift+R)
3. Check console for errors

## Status

✅ **FIXED** - All JSON files are now clean and valid.

### Next Steps
1. Stop dev server (Ctrl+C)
2. Clear cache: `rm -rf .next`
3. Restart: `npm run dev`
4. Hard reload browser (Ctrl+Shift+R)

If the error persists after these steps, check:
- Browser console for specific error
- Terminal output for build errors
- File permissions

---

**Last Updated:** March 1, 2026  
**Status:** Resolved ✅
