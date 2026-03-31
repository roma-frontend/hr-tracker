# Lighthouse 100/100 Optimization Plan

## Current Status (After Phase 1)
- ✅ Font preloading optimized (5 fonts → 2 fonts)
- ✅ Preconnect hints optimized (removed duplicates)
- ✅ CSS animation utilities created (replacement for framer-motion)
- ✅ Removed framer-motion from optimizePackageImports
- ✅ Build successful (33.6s)

## Remaining Work for 100/100 Scores

### PHASE 2: Replace Framer Motion with CSS (HIGH PRIORITY)
**Impact:** Save ~40KB gzipped on every page

**Files to update (44 total):**
1. `src/app/(auth)/login/page.tsx` - Replace motion.div/button with CSS classes
2. `src/components/dashboard/DashboardClient.tsx` - Replace motion components
3. `src/components/calendar/CalendarClient.tsx` - Replace motion components
4. `src/components/ai/ChatWidget.tsx` - Replace motion components
5. `src/components/employees/EmployeesClient.tsx` - Replace motion components
6. ... (39 more files)

**Strategy:**
- Replace `motion.div` with `<div className="animate-fade-in-up">`
- Replace `whileHover={{ scale: 1.05 }}` with `className="hover-scale"`
- Replace `whileTap={{ scale: 0.95 }}` with `className="tap-scale"`
- Replace `AnimatePresence` with CSS transitions
- Use `stagger-item` class for list animations

**Example transformation:**
```tsx
// Before (framer-motion)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>

// After (CSS)
<div className="animate-fade-in-up">
  Content
</div>
```

---

### PHASE 3: Optimize Images (MEDIUM PRIORITY)
**Impact:** Save ~20% image bandwidth, improve LCP

**68 unoptimized `<img>` tags found in:**
- Avatar components (multiple files)
- Face recognition components
- Landing page images
- Employee profile images
- Chat message images

**Strategy:**
- Replace `<img>` with Next.js `<Image>` component
- Add proper `width`, `height`, `alt` attributes
- Use `priority` prop for above-the-fold images
- Use `loading="lazy"` for below-the-fold images
- Configure proper `sizes` attribute for responsive images

**Example transformation:**
```tsx
// Before
<img src={user.avatar} alt={user.name} />

// After
<Image
  src={user.avatar}
  alt={user.name}
  width={40}
  height={40}
  className="rounded-full"
  loading="lazy"
/>
```

---

### PHASE 4: Add React.memo to Expensive Components (MEDIUM PRIORITY)
**Impact:** Reduce unnecessary re-renders, improve TTI

**Top 20 components to memoize:**
1. `ChatWidget.tsx` (1,155 lines) - ✅ Already memoized
2. `ChatWindow.tsx` (1,057 lines) - ✅ Already memoized
3. `CalendarClient.tsx` (1,019 lines) - ✅ Already memoized
4. `LandingClient.tsx` (970 lines) - Needs memoization
5. `MessageBubble.tsx` (924 lines) - ✅ Already memoized
6. `FaceLogin.tsx` (849 lines) - Needs memoization
7. `EmployeesClient.tsx` (728 lines) - Needs memoization
8. `Sidebar.tsx` (710 lines) - Needs memoization
9. `DriverRequestModal.tsx` (621 lines) - Needs memoization
10. `CallModal.tsx` (600 lines) - Needs memoization
11. `DashboardClient.tsx` - Needs memoization
12. `StatsCard.tsx` - Needs memoization
13. `FeatureCard.tsx` - Needs memoization
14. `EmployeeCard.tsx` - Needs memoization
15. `TaskCard.tsx` - Needs memoization
16. `LeaveRequestModal.tsx` - Needs memoization
17. `AttendanceDashboard.tsx` - Needs memoization
18. `TeamSidebar.tsx` - Needs memoization
19. `QuickActions.tsx` - Needs memoization
20. `AIRecommendationsCard.tsx` - Needs memoization

**Strategy:**
```tsx
export const ComponentName = React.memo(function ComponentName(props) {
  // component code
});
```

---

### PHASE 5: Lazy Load Heavy Libraries (HIGH PRIORITY)
**Impact:** Reduce initial bundle size by ~200KB

**Libraries to lazy load:**
1. **face-api.js** (1.5MB) - Only used on auth pages
   - Current: Always loaded
   - Target: Dynamic import on `/login` and `/register` pages only

2. **Three.js** (600KB) - Only used on landing page
   - Current: Loaded on landing page
   - Target: Conditional loading with IntersectionObserver

3. **Recharts** (300KB) - Only used on analytics/reports pages
   - Current: ✅ Already lazy loaded with dynamic imports
   - Status: DONE

**Strategy for face-api.js:**
```tsx
// In FaceLogin.tsx
const [faceApi, setFaceApi] = useState(null);

useEffect(() => {
  import('face-api.js').then(module => {
    setFaceApi(module);
  });
}, []);
```

**Strategy for Three.js:**
```tsx
// In landing page
const [showSphere, setShowSphere] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setShowSphere(true);
    }
  });
  observer.observe(sphereRef.current);
}, []);

{showSphere && <LazyCanvas>...</LazyCanvas>}
```

---

### PHASE 6: Split Large Pages (MEDIUM PRIORITY)
**Impact:** Reduce initial JS parse time

**Pages to split:**
1. **drivers/page.tsx** (2,926 lines) - CRITICAL
   - Extract: DriverList, DriverCard, DriverFilters, DriverMap components
   - Use dynamic imports for map component

2. **ai-chat/page.tsx** (823 lines)
   - Extract: ChatSidebar, ChatMessages, ChatInput components

3. **login/page.tsx** (797 lines)
   - Extract: LoginForm, FaceLoginTab, TouchIDTab components

4. **help/page.tsx** (704 lines)
   - Extract: HelpCategory, HelpArticle, HelpSearch components

**Strategy:**
- Create separate component files
- Use dynamic imports for below-the-fold sections
- Add Suspense boundaries with loading states

---

### PHASE 7: Add Dynamic Metadata (LOW PRIORITY - SEO)
**Impact:** Improve SEO score from 92 to 100

**Pages needing metadata:**
1. `/employees/[id]` - Employee profile metadata
2. `/superadmin/organizations/[id]/edit` - Organization metadata
3. `/superadmin/users/[userId]` - User profile metadata
4. All dashboard pages - Custom titles and descriptions

**Strategy:**
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const employee = await getEmployee(params.id);
  return {
    title: `${employee.name} - Employee Profile`,
    description: `View ${employee.name}'s profile, attendance, and performance.`,
  };
}
```

---

### PHASE 8: Add Comprehensive ARIA Attributes (LOW PRIORITY - A11Y)
**Impact:** Maintain Accessibility 100 score

**Current status:**
- Only 10 ARIA attributes found
- 68 images without verified alt text

**Strategy:**
- Add `aria-label` to all interactive elements
- Add `aria-describedby` for form inputs
- Add `role` attributes where needed
- Verify all images have descriptive alt text
- Add `aria-live` regions for dynamic content

---

## Performance Budget Targets

### Bundle Size
- **Current:** 14MB static chunks
- **Target:** <10MB static chunks
- **Strategy:** Code splitting, tree shaking, lazy loading

### JavaScript
- **Current:** 282 KiB unused JS
- **Target:** <150 KiB unused JS
- **Strategy:** Remove framer-motion, optimize imports

### Images
- **Current:** 68 unoptimized images
- **Target:** 0 unoptimized images
- **Strategy:** Migrate to Next.js Image

### Fonts
- **Current:** 5 Google Fonts
- **Target:** 2-3 Google Fonts
- **Strategy:** Remove Montserrat, Work Sans, Noto Sans Armenian (or lazy load)

---

## Expected Lighthouse Scores After All Phases

### Before Optimization
- Performance: 87
- Accessibility: 100
- Best Practices: 100
- SEO: 92

### After Phase 1 (Current)
- Performance: ~89 (+2)
- Accessibility: 100
- Best Practices: 100
- SEO: 92

### After Phase 2 (Remove framer-motion)
- Performance: ~93 (+4)
- Accessibility: 100
- Best Practices: 100
- SEO: 92

### After Phase 3 (Optimize images)
- Performance: ~95 (+2)
- Accessibility: 100
- Best Practices: 100
- SEO: 92

### After Phase 4-6 (Memoization + Lazy loading + Code splitting)
- Performance: ~98 (+3)
- Accessibility: 100
- Best Practices: 100
- SEO: 92

### After Phase 7 (Dynamic metadata)
- Performance: ~98
- Accessibility: 100
- Best Practices: 100
- SEO: 100 (+8)

### Final Target (Production with CDN)
- Performance: 100
- Accessibility: 100
- Best Practices: 100
- SEO: 100

---

## Implementation Priority

### Immediate (This Week)
1. ✅ Phase 1: Font and preconnect optimization - DONE
2. Phase 2: Replace framer-motion with CSS (44 files)
3. Phase 5: Lazy load face-api.js and Three.js

### Short-term (Next Week)
4. Phase 3: Optimize images to Next.js Image (68 images)
5. Phase 4: Add React.memo to top 20 components
6. Phase 6: Split drivers page (2,926 lines)

### Medium-term (Next 2 Weeks)
7. Phase 7: Add dynamic metadata for all pages
8. Phase 8: Add comprehensive ARIA attributes

---

## Testing Strategy

### After Each Phase
1. Run `npm run build` to verify no errors
2. Run Lighthouse audit on localhost
3. Test on mobile device (Chrome DevTools)
4. Verify no visual regressions
5. Test accessibility with screen reader

### Before Production Deploy
1. Run full Lighthouse audit suite
2. Test on real devices (iOS, Android)
3. Verify Core Web Vitals
4. Check bundle size with `ANALYZE=true npm run build`
5. Test with slow 3G network throttling

---

## Notes

- Localhost Lighthouse scores are always lower than production
- Production with CDN, HTTP/2, and proper caching will score higher
- Server response time (777ms) is backend issue (Convex) - cannot fix on frontend
- Legacy JavaScript (24 KiB) is Next.js polyfills - necessary for browser support
- Focus on what we can control: bundle size, images, animations, code splitting

---

## Resources

- CSS Animation Utilities: `src/styles/animations.css`
- Lazy Import Utilities: `src/lib/lazy-imports.ts`
- Performance Monitoring: `src/lib/performance.ts`
- Bundle Analyzer: `ANALYZE=true npm run build`
- Lighthouse CI: Can be integrated for automated testing

---

**Last Updated:** 2026-03-31
**Status:** Phase 1 Complete ✅
**Next Step:** Phase 2 - Replace framer-motion with CSS animations
