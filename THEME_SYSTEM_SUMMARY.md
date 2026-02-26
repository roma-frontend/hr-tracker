# Desktop/office Theme System - Detailed Summary

## Overview
The Desktop/office application implements a comprehensive dark/light theme system using **CSS variables** and the **next-themes** library. The theme is fully dynamic with instant switching capability and supports both dark and light modes.

---

## 1. Folder Structure

```
Desktop/office/src/
├── app/
│   ├── globals.css          ← Theme variables & CSS definitions
│   ├── layout.tsx           ← Root layout with ThemeProvider
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx       ← Theme toggle button
│   │   ├── Sidebar.tsx      ← Theme-aware sidebar
│   │   └── Providers.tsx    ← Layout wrapper
│   ├── ui/
│   │   ├── button.tsx       ← Uses CSS variables
│   │   ├── card.tsx         ← Uses CSS variables
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   └── [other UI components]
│   ├── dashboard/
│   ├── employees/
│   ├── leaves/
│   ├── tasks/
│   └── [other feature components]
├── lib/
│   └── utils.ts
└── store/
    └── useUIStore.ts        ← UI state management (not theme-specific)

Desktop/office/
├── package.json             ← Dependencies
├── next.config.js           ← Next.js configuration
├── postcss.config.mjs       ← PostCSS with Tailwind v4
└── tsconfig.json
```

---

## 2. Key Dependencies

**From package.json:**
```json
{
  "dependencies": {
    "next-themes": "^0.4.6",     ← Theme management
    "tailwindcss": "^4",          ← CSS utility framework
    "react": "19.2.3",
    "next": "16.1.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4", ← Tailwind v4 PostCSS plugin
    "typescript": "^5"
  }
}
```

---

## 3. Theme Configuration Files

### 3.1 Root Layout (`src/app/layout.tsx`)

**ThemeProvider Setup:**
```tsx
<ThemeProvider
  attribute="class"           // Uses 'class' attribute on <html> element
  defaultTheme="dark"         // Default to dark theme
  enableSystem={false}        // Don't follow system preference
  disableTransitionOnChange   // No transition when switching
>
  {children}
  <Toaster ... />
</ThemeProvider>
```

**Viewport Configuration:**
```tsx
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },  // Indigo
    { media: "(prefers-color-scheme: dark)", color: "#818cf8" },   // Light indigo
  ],
  colorScheme: "dark light",
};
```

### 3.2 PostCSS Configuration (`postcss.config.mjs`)

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},  // Tailwind v4 with PostCSS
  },
};
```

**Note:** No separate `tailwind.config.js` file exists. Tailwind v4 uses inline configuration through `@import "tailwindcss"` in CSS.

### 3.3 Global Styles (`src/app/globals.css`)

#### Import Statement
```css
@import "tailwindcss";  /* Loads Tailwind v4 */
```

#### Premium Color Palette (unused decorative colors)
```css
:root {
  --color-premium-black: #000000;
  --color-rich-black: #0a0a0a;
  --color-deep-charcoal: #0f0f0f;
  --color-gold: #d4af37;
  --color-gold-light: #f4e5a8;
  --color-gold-dark: #aa8b2e;
  --color-bronze: #cd7f32;
  --color-silver: #c0c0c0;
  --color-champagne: #f7e7ce;
}
```

---

## 4. CSS Variables System

The theme system uses **two complete sets of CSS variables**: one for light mode and one for dark mode.

### 4.1 Light Theme Variables (Default)

**Location:** `src/app/globals.css` lines 54-133

```css
:root {
  /* Base */
  --background:          #f8fafc;       /* Light blue-gray */
  --background-subtle:   #f1f5f9;       /* Slightly darker blue-gray */
  --foreground:          #0f172a;       /* Very dark slate */

  /* Card / Surface */
  --card:                #ffffff;       /* Pure white */
  --card-hover:          #f8fafc;       /* Hover state */
  --card-foreground:     #0f172a;       /* Dark text */
  --card-border:         #e2e8f0;       /* Light gray border */

  /* Popover */
  --popover:             #ffffff;       /* White */
  --popover-foreground:  #0f172a;       /* Dark text */

  /* Border */
  --border:              #e2e8f0;       /* Light gray */
  --border-subtle:       #f1f5f9;       /* Very light gray */
  --input:               #ffffff;       /* White input bg */
  --input-border:        #cbd5e1;       /* Gray input border */
  --ring:                #6366f1;       /* Indigo focus ring */

  /* Primary Button */
  --primary:             #6366f1;       /* Indigo */
  --primary-hover:       #4f46e5;       /* Darker indigo */
  --primary-foreground:  #ffffff;       /* White text */

  /* Secondary */
  --secondary:           #f1f5f9;       /* Light gray */
  --secondary-foreground:#475569;       /* Dark gray text */

  /* Muted */
  --muted:               #f1f5f9;       /* Light gray */
  --muted-foreground:    #64748b;       /* Medium gray */

  /* Accent */
  --accent:              #6366f1;       /* Indigo */
  --accent-foreground:   #ffffff;       /* White */

  /* Semantic Colors */
  --destructive:         #ef4444;       /* Red */
  --destructive-foreground: #ffffff;    /* White text */
  --success:             #10b981;       /* Green */
  --success-foreground:  #ffffff;       /* White text */
  --warning:             #f59e0b;       /* Amber */
  --warning-foreground:  #ffffff;       /* White text */

  /* Text */
  --text-primary:        #0f172a;       /* Dark slate */
  --text-secondary:      #334155;       /* Medium slate */
  --text-muted:          #64748b;       /* Gray */
  --text-disabled:       #94a3b8;       /* Light gray */

  /* Sidebar */
  --sidebar-bg:          #ffffff;       /* White */
  --sidebar-border:      #e2e8f0;       /* Light border */
  --sidebar-item-hover:  #f1f5f9;       /* Light background */
  --sidebar-item-active: rgba(99,102,241,0.1);     /* Indigo with 10% opacity */
  --sidebar-item-active-text: #6366f1;  /* Indigo */
  --sidebar-text:        #475569;       /* Dark gray */
  --sidebar-text-muted:  #94a3b8;       /* Light gray */

  /* Navbar */
  --navbar-bg:           rgba(255,255,255,0.85);   /* Semi-transparent white */
  --navbar-border:       #e2e8f0;       /* Light border */

  /* Shadows */
  --shadow:              0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:           0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg:           0 10px 15px rgba(0,0,0,0.07), 0 4px 6px rgba(0,0,0,0.04);

  /* Status Badges */
  --status-approved-bg:    rgba(16,185,129,0.1);   /* Green with 10% opacity */
  --status-approved-text:  #059669;                 /* Green */
  --status-pending-bg:     rgba(245,158,11,0.1);   /* Amber with 10% opacity */
  --status-pending-text:   #d97706;                 /* Amber */
  --status-rejected-bg:    rgba(239,68,68,0.1);    /* Red with 10% opacity */
  --status-rejected-text:  #dc2626;                 /* Red */
}
```

### 4.2 Dark Theme Variables

**Location:** `src/app/globals.css` lines 136-215

```css
.dark {
  /* Base */
  --background:          #0f172a;       /* Very dark slate */
  --background-subtle:   #1e293b;       /* Slightly lighter slate */
  --foreground:          #f1f5f9;       /* Light blue-gray */

  /* Card / Surface */
  --card:                #1e293b;       /* Dark blue-gray */
  --card-hover:          #243044;       /* Slightly lighter for hover */
  --card-foreground:     #f1f5f9;       /* Light text */
  --card-border:         #334155;       /* Dark border */

  /* Popover */
  --popover:             #1e293b;       /* Dark card */
  --popover-foreground:  #f1f5f9;       /* Light text */

  /* Border */
  --border:              #334155;       /* Dark gray */
  --border-subtle:       #1e293b;       /* Very dark */
  --input:               #1e293b;       /* Dark input */
  --input-border:        #475569;       /* Medium gray border */
  --ring:                #818cf8;       /* Light indigo focus ring */

  /* Primary Button */
  --primary:             #818cf8;       /* Light indigo */
  --primary-hover:       #6366f1;       /* Standard indigo */
  --primary-foreground:  #ffffff;       /* White text */

  /* Secondary */
  --secondary:           #1e293b;       /* Dark */
  --secondary-foreground:#94a3b8;       /* Light gray text */

  /* Muted */
  --muted:               #1e293b;       /* Dark */
  --muted-foreground:    #94a3b8;       /* Light gray */

  /* Accent */
  --accent:              #818cf8;       /* Light indigo */
  --accent-foreground:   #ffffff;       /* White */

  /* Semantic Colors - Lighter variants for visibility */
  --destructive:         #f87171;       /* Light red */
  --destructive-foreground: #ffffff;    /* White text */
  --success:             #34d399;       /* Light green */
  --success-foreground:  #ffffff;       /* White text */
  --warning:             #fbbf24;       /* Light amber */
  --warning-foreground:  #ffffff;       /* White text */

  /* Text */
  --text-primary:        #f1f5f9;       /* Light blue-gray */
  --text-secondary:      #cbd5e1;       /* Medium blue-gray */
  --text-muted:          #94a3b8;       /* Light gray */
  --text-disabled:       #64748b;       /* Medium gray */

  /* Sidebar */
  --sidebar-bg:          #0f172a;       /* Very dark */
  --sidebar-border:      #1e293b;       /* Dark border */
  --sidebar-item-hover:  #1e293b;       /* Dark hover bg */
  --sidebar-item-active: rgba(129,140,248,0.15);    /* Light indigo with 15% opacity */
  --sidebar-item-active-text: #818cf8;  /* Light indigo */
  --sidebar-text:        #94a3b8;       /* Light gray */
  --sidebar-text-muted:  #64748b;       /* Medium gray */

  /* Navbar */
  --navbar-bg:           rgba(15,23,42,0.85);       /* Semi-transparent dark */
  --navbar-border:       #1e293b;       /* Dark border */

  /* Shadows - Darker and more visible */
  --shadow:              0 1px 3px rgba(0,0,0,0.3);
  --shadow-md:           0 4px 6px rgba(0,0,0,0.4);
  --shadow-lg:           0 10px 15px rgba(0,0,0,0.5);

  /* Status Badges - Lighter variants */
  --status-approved-bg:    rgba(52,211,153,0.15);   /* Light green with 15% */
  --status-approved-text:  #34d399;                  /* Light green */
  --status-pending-bg:     rgba(251,191,36,0.15);   /* Light amber with 15% */
  --status-pending-text:   #fbbf24;                  /* Light amber */
  --status-rejected-bg:    rgba(248,113,113,0.15);  /* Light red with 15% */
  --status-rejected-text:  #f87171;                  /* Light red */
}
```

---

## 5. How Theme Switching Works

### 5.1 Theme Toggle Button Location

**File:** `src/components/layout/Navbar.tsx` (lines 290-303)

```tsx
// Import hook from next-themes
const { theme, setTheme } = useTheme();

// Theme toggle button
<Button
  variant="ghost"
  size="icon"
  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  title={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
>
  {mounted ? (
    theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
  ) : (
    <Moon className="w-5 h-5" />
  )}
</Button>
```

**How it works:**
1. The `useTheme()` hook from `next-themes` provides `theme` and `setTheme`
2. Button click triggers `setTheme(theme === "dark" ? "light" : "dark")`
3. `next-themes` automatically:
   - Updates the `class` attribute on the `<html>` element
   - Adds/removes the `.dark` class to trigger CSS variable switching
   - Persists the choice to localStorage
4. Icon changes based on current theme (Sun for dark mode, Moon for light mode)
5. `mounted` state prevents hydration mismatch on first render

### 5.2 Theme Application Flow

```
User clicks theme toggle
        ↓
setTheme() updates next-themes internal state
        ↓
next-themes sets class="dark" or removes it from <html>
        ↓
CSS cascade: .dark selector overrides :root variables
        ↓
All CSS variable references update instantly
        ↓
Components using var(--color-name) re-render with new colors
        ↓
localStorage stores preference for next session
```

### 5.3 How CSS Variables Switch

**Light Mode (Default):**
```html
<html>  <!-- .dark class NOT present -->
  <body>
    <!-- All :root variables apply (light theme) -->
  </body>
</html>
```

**Dark Mode:**
```html
<html class="dark">  <!-- .dark class added by next-themes -->
  <body>
    <!-- All .dark variables override :root (dark theme) -->
  </body>
</html>
```

---

## 6. Component Integration

### 6.1 How UI Components Use Theme Variables

**Example: Button Component** (`src/components/ui/button.tsx`)
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2...",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-[var(--primary-foreground)] shadow hover:bg-[var(--primary-hover)]",
        destructive: "bg-[var(--destructive)] text-[var(--destructive-foreground)]",
        outline: "border border-[var(--border)] bg-transparent hover:bg-[var(--background-subtle)]",
        ghost: "text-[var(--text-secondary)] hover:bg-[var(--background-subtle)]",
        // ...
      },
    },
  }
);
```

**Example: Card Component** (`src/components/ui/card.tsx`)
```tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border shadow-sm transition-colors duration-200",
        "bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)]",
        className
      )}
      {...props}
    />
  )
);
```

### 6.2 Tailwind CSS Integration

All components use Tailwind's arbitrary value syntax with CSS variables:
- `bg-[var(--card)]` - Background color
- `text-[var(--text-primary)]` - Text color
- `border-[var(--border)]` - Border color
- `hover:bg-[var(--background-subtle)]` - Hover states
- `shadow-[var(--shadow)]` - Shadows (not used in Tailwind syntax, used directly in CSS)

### 6.3 Base Element Styles

**Universal Transition** (`src/app/globals.css` line 220):
```css
* {
  border-color: var(--border);
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease;
}
```

All elements automatically animate color changes when theme switches.

### 6.4 Glassmorphism Effect

**Light Mode:**
```css
.glass {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(99, 102, 241, 0.12);  /* Indigo-tinted */
}
```

**Dark Mode:**
```css
.dark .glass {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(99, 102, 241, 0.15);  /* Indigo-tinted */
}
```

---

## 7. Key Color Variables Used in Dark Theme

| Variable | Dark Value | Purpose |
|----------|-----------|---------|
| `--background` | `#0f172a` | Main page background |
| `--card` | `#1e293b` | Card/surface background |
| `--text-primary` | `#f1f5f9` | Main text color |
| `--text-secondary` | `#cbd5e1` | Secondary text |
| `--text-muted` | `#94a3b8` | Disabled/muted text |
| `--primary` | `#818cf8` | Primary button color (light indigo) |
| `--border` | `#334155` | Border color |
| `--sidebar-bg` | `#0f172a` | Sidebar background |
| `--navbar-bg` | `rgba(15,23,42,0.85)` | Semi-transparent navbar |
| `--success` | `#34d399` | Success state (light green) |
| `--destructive` | `#f87171` | Error state (light red) |
| `--warning` | `#fbbf24` | Warning state (light amber) |

---

## 8. Animation & Transitions

### 8.1 Smooth Transitions

All transitions happen smoothly due to:
1. **Tailwind's transition classes:** `transition-colors duration-200`
2. **CSS universal transition:** `transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease`
3. **Framer Motion animations** used in Navbar/Sidebar for complex animations

### 8.2 Keyframe Animations Defined

```css
@keyframes shimmer { /* Loading skeleton animation */ }
@keyframes pulse-ring { /* Notification pulse */ }
@keyframes float { /* Floating elements */ }
@keyframes gradient-shift { /* Gradient animation */ }
```

---

## 9. Theme Provider Setup Details

### 9.1 Full Root Layout Setup

**File:** `src/app/layout.tsx` (lines 191-206)

```tsx
<ConvexClientProvider>
  <ThemeProvider
    attribute="class"              // Store theme in HTML class attribute
    defaultTheme="dark"            // Start with dark theme
    enableSystem={false}           // Ignore system preference
    disableTransitionOnChange      // No transition on theme change
  >
    {children}
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      duration={4000}
    />
  </ThemeProvider>
</ConvexClientProvider>
```

### 9.2 Providers Component

**File:** `src/components/layout/Providers.tsx`

```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  // ... authentication setup ...
  
  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden transition-colors duration-300">
      <Sidebar />
      <MobileSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
```

---

## 10. Storage & Persistence

**next-themes automatically handles:**
- Storing theme preference in `localStorage` key `theme`
- Reading from localStorage on app load
- Syncing across browser tabs
- Respecting `disableTransitionOnChange` flag to prevent flash

---

## 11. Tailwind v4 Features Used

The project uses **Tailwind CSS v4** with:
- **PostCSS plugin:** `@tailwindcss/postcss`
- **CSS Variables:** Direct CSS custom properties in `globals.css`
- **Arbitrary values:** `[var(--color-name)]` syntax
- **Color-scheme:** Set via `<html color-scheme="light">` and `<html color-scheme="dark">`

No `tailwind.config.js` needed - all configuration done through `@import "tailwindcss"` and CSS variables.

---

## 12. Summary of Implementation

| Aspect | Details |
|--------|---------|
| **Theme Library** | `next-themes` v0.4.6 |
| **CSS Framework** | Tailwind CSS v4 with PostCSS |
| **Storage Method** | CSS Custom Properties (variables) |
| **Switching Mechanism** | `.dark` class on `<html>` element |
| **Default Theme** | Dark mode |
| **System Preference** | Disabled (forced default) |
| **Persistence** | localStorage |
| **Transition Duration** | 200ms for colors, 150ms for text |
| **Primary Color** | Indigo (#6366f1 light, #818cf8 dark) |
| **Status Colors** | Green (success), Red (destructive), Amber (warning) |
| **Total CSS Variables** | 40+ per theme (80+ total) |
| **Main Files** | `globals.css`, `layout.tsx`, `Navbar.tsx` |

---

## 13. File References Quick Guide

| Task | File | Lines |
|------|------|-------|
| View all CSS variables | `src/app/globals.css` | 54-215 |
| Toggle theme button | `src/components/layout/Navbar.tsx` | 290-303 |
| Theme provider config | `src/app/layout.tsx` | 191-206 |
| UI component examples | `src/components/ui/button.tsx` | 7-27 |
| Layout wrapper | `src/components/layout/Providers.tsx` | 40-61 |
| Sidebar theme usage | `src/components/layout/Sidebar.tsx` | 70-384 |
| PostCSS config | `postcss.config.mjs` | 0-6 |
| Viewport settings | `src/app/layout.tsx` | 16-20 |
