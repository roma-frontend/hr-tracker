# Desktop/office Theme System - Quick Reference

## Overview
The application uses a **CSS Variables + next-themes** approach for dark/light theme switching. The default theme is **dark mode**, with full localStorage persistence.

---

## Key Files & Locations

| Purpose | File | Key Lines |
|---------|------|-----------|
| **Theme Variables** | `src/app/globals.css` | 54-215 |
| **Theme Provider** | `src/app/layout.tsx` | 191-206 |
| **Theme Toggle Button** | `src/components/layout/Navbar.tsx` | 287-303 |
| **Config** | `postcss.config.mjs` | All |

---

## Theme Definition

### How Themes are Defined

1. **ThemeProvider Setup** (`src/app/layout.tsx`):
   ```tsx
   <ThemeProvider
     attribute="class"           // Adds/removes .dark class on <html>
     defaultTheme="dark"         // Default to dark
     enableSystem={false}        // Don't follow OS preference
     disableTransitionOnChange   // No flash on switch
   >
   ```

2. **CSS Variables** (`src/app/globals.css`):
   - Light theme: `:root { --variable: value; }` (lines 54-133)
   - Dark theme: `.dark { --variable: value; }` (lines 136-215)

3. **All components use**: `className="bg-[var(--card)] text-[var(--text-primary)]"`

---

## Dark Theme Color Palette

| Category | Variable | Value | Purpose |
|----------|----------|-------|---------|
| **Base** | `--background` | `#0f172a` | Main page background |
| | `--background-subtle` | `#1e293b` | Subtle bg (sidebar) |
| | `--foreground` | `#f1f5f9` | Foreground text |
| **Cards** | `--card` | `#1e293b` | Card surfaces |
| | `--card-hover` | `#243044` | Hover state |
| | `--card-border` | `#334155` | Card borders |
| **Text** | `--text-primary` | `#f1f5f9` | Main text |
| | `--text-secondary` | `#cbd5e1` | Secondary text |
| | `--text-muted` | `#94a3b8` | Disabled text |
| **UI Elements** | `--primary` | `#818cf8` | Buttons (light indigo) |
| | `--primary-hover` | `#6366f1` | Button hover |
| | `--border` | `#334155` | Borders |
| **Status** | `--success` | `#34d399` | Success (light green) |
| | `--destructive` | `#f87171` | Error (light red) |
| | `--warning` | `#fbbf24` | Warning (light amber) |
| **Sidebar** | `--sidebar-bg` | `#0f172a` | Sidebar bg |
| | `--sidebar-item-active` | `rgba(129,140,248,0.15)` | Active item bg |
| | `--sidebar-item-active-text` | `#818cf8` | Active item text |
| **Navbar** | `--navbar-bg` | `rgba(15,23,42,0.85)` | Semi-transparent bg |
| **Shadows** | `--shadow` | `0 1px 3px rgba(0,0,0,0.3)` | Subtle shadow |
| | `--shadow-md` | `0 4px 6px rgba(0,0,0,0.4)` | Medium shadow |
| | `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.5)` | Large shadow |

---

## Light Theme Color Palette (for comparison)

| Variable | Light Value | Dark Value |
|----------|------------|-----------|
| `--background` | `#f8fafc` | `#0f172a` |
| `--card` | `#ffffff` | `#1e293b` |
| `--text-primary` | `#0f172a` | `#f1f5f9` |
| `--primary` | `#6366f1` | `#818cf8` |
| `--border` | `#e2e8f0` | `#334155` |
| `--success` | `#10b981` | `#34d399` |
| `--destructive` | `#ef4444` | `#f87171` |
| `--warning` | `#f59e0b` | `#fbbf24` |

---

## How Theme Switching Works

### User Interaction Flow

```
1. User clicks theme toggle button (Navbar.tsx:295)
   ↓
2. Calls: setTheme(theme === "dark" ? "light" : "dark")
   ↓
3. next-themes updates internal state & localStorage
   ↓
4. Adds/removes .dark class on <html> element
   ↓
5. CSS cascade: .dark {...} overrides :root {...}
   ↓
6. All var(--color-name) references instantly update
   ↓
7. Components re-render with new colors (smooth 200ms transition)
```

### Key Hook

```tsx
// In any component
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  );
}
```

### Storage

- **Location**: Browser `localStorage` key: `theme`
- **Values**: `"dark"` or `"light"`
- **Persistence**: Syncs across tabs automatically
- **Hydration**: Safe hydration check via `mounted` state

---

## Component Usage Examples

### Button Component
```tsx
// src/components/ui/button.tsx
const buttonVariants = cva("...", {
  variants: {
    variant: {
      default: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]",
      destructive: "bg-[var(--destructive)] text-[var(--destructive-foreground)]",
      ghost: "text-[var(--text-secondary)] hover:bg-[var(--background-subtle)]",
    },
  },
});
```

### Card Component
```tsx
// src/components/ui/card.tsx
<div className="bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)] rounded-xl shadow-sm">
  {children}
</div>
```

### Any Component
```tsx
// All components use this pattern
<div className="bg-[var(--background)] text-[var(--text-primary)]">
  Content here
</div>
```

---

## Key Features

✅ **40+ CSS variables** per theme (80+ total)
✅ **Instant switching** with 200ms smooth transitions
✅ **localStorage persistence** - survives page reload
✅ **No system preference** - forced default (dark)
✅ **Tailwind v4 integration** with arbitrary values `[var(...)]`
✅ **Hydration-safe** - uses `mounted` state to prevent mismatches
✅ **Glassmorphism** - separate styles for `.glass` in each theme
✅ **Status colors** - semantic colors for success/error/warning

---

## Design Principles

### Color Harmony
- **Dark theme uses lighter variants** of colors (e.g., `#818cf8` instead of `#6366f1`)
- **Ensures sufficient contrast** on dark backgrounds
- **Primary color**: Indigo (#6366f1/#818cf8)

### Accessibility
- All text colors meet WCAG AA contrast requirements
- Focus rings use the `--ring` variable
- Disabled states clearly distinguished

### Performance
- **No JavaScript overhead** - CSS handles theme switching
- **CSS variables** are native & instantaneous
- **Tailwind v4** - no config file needed
- **Single HTML class toggle** - minimal DOM changes

---

## Viewport/Browser Integration

**From `src/app/layout.tsx`:**
```tsx
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },   // Light mode
    { media: "(prefers-color-scheme: dark)", color: "#818cf8" },    // Dark mode
  ],
  colorScheme: "dark light",  // Support both schemes
};
```

This sets the browser's address bar and tab color based on the current theme.

---

## Quick Implementation Checklist

If implementing a new component:

1. ✅ Use `bg-[var(--card)]` for backgrounds
2. ✅ Use `text-[var(--text-primary)]` for text
3. ✅ Use `border-[var(--border)]` for borders
4. ✅ Use `hover:bg-[var(--background-subtle)]` for hover states
5. ✅ Use semantic colors: `--success`, `--destructive`, `--warning`
6. ✅ Add `transition-colors duration-200` to elements with color changes

---

## Stack Summary

| Tool | Version | Purpose |
|------|---------|---------|
| next-themes | 0.4.6 | Theme state management |
| Tailwind CSS | v4 | Utility-first styling |
| @tailwindcss/postcss | v4 | PostCSS plugin |
| Next.js | 16.1.6 | React framework |
| React | 19.2.3 | UI library |

---

## Debugging Tips

**Check current theme:**
```tsx
const { theme } = useTheme();
console.log(theme); // "dark" or "light"
```

**Check HTML element:**
```javascript
// In browser console
document.documentElement.classList.contains('dark'); // true/false
```

**Check CSS variables:**
```javascript
// Get all --card values
getComputedStyle(document.documentElement).getPropertyValue('--card').trim();
// Light: "#ffffff", Dark: "#1e293b"
```

**Reset theme to default:**
```javascript
localStorage.removeItem('theme');
location.reload();
```
