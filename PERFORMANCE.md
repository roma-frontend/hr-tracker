# Performance Optimization Guide

## Desktop (Next.js) - Target: 100 Lighthouse Score

### ✅ Implemented Optimizations

#### 1. Next.js Configuration
- **Image Optimization**: Lazy loading, WebP/AVIF formats, 30-day cache
- **Bundle Splitting**: Framework, UI, charts, AI SDK separated
- **Tree Shaking**: Remove unused code with `usedExports: true`
- **Module Concatenation**: Smaller bundles in production
- **CSS Optimization**: `optimizeCss: true`

#### 2. Caching Strategy
```
Static Assets: 1 year (immutable)
Images: 7 days + stale-while-revalidate
Fonts: 1 year (immutable)
API Routes: no-cache
Chat Pages: 60s + 300s stale-while-revalidate
```

#### 3. Convex Optimizations
- Proper database indexing
- Pagination (limit: 50 messages)
- Query optimization with `.withIndex()`

#### 4. Code Splitting
- `framework`: React, Next.js (priority: 50)
- `ui-vendor`: Radix, Lucide (priority: 40)
- `framer-motion`: Async (priority: 35)
- `recharts`: Async (priority: 30)
- `ai-sdk`: Async (priority: 30)
- `convex`: All chunks (priority: 25)
- `i18n`: Early load (priority: 20)

### 📊 Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | 100 | - |
| First Contentful Paint | < 1.0s | - |
| Largest Contentful Paint | < 2.5s | - |
| Time to Interactive | < 3.0s | - |
| Total Blocking Time | < 200ms | - |
| Cumulative Layout Shift | < 0.1 | - |

### 🚀 Running Performance Tests

```bash
# Build with analysis
npm run build:analyze

# Run production server
npm run perf

# Lighthouse CI (add later)
npx @lhci/cli autorun
```

---

## Mobile (Expo) - Target: 60 FPS

### ✅ Implemented Optimizations

#### 1. Hermes Engine
- Enabled for Android: `enableHermes: true`
- Faster startup, smaller APK size
- Better memory management

#### 2. Babel Optimizations
- Production: Remove console.log
- Module resolver for faster imports
- React Native Reanimated plugin

#### 3. Updates Configuration
- `checkAutomatically: ON_LOAD`
- `fallbackToCacheTimeout: 0`
- Instant updates without waiting

#### 4. Asset Optimization
- Splash screen optimized (200px width)
- Asset bundling patterns configured
- Adaptive icons for Android

### 📊 Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| FPS | 60 | - |
| App Size (Android) | < 50MB | - |
| App Size (iOS) | < 100MB | - |
| Time to Interactive | < 2.0s | - |
| Memory Usage | < 200MB | - |

### 🚀 Building Optimized Builds

```bash
# Android optimized build
eas build --platform android --profile production

# iOS optimized build
eas build --platform ios --profile production

# Check bundle size
npx @react-native-community/cli build-android --mode=release
```

---

## Convex Database Optimizations

### Indexes Added

```typescript
// chatConversations
.index("by_org", ["organizationId"])
.index("by_org_last", ["organizationId", "lastMessageAt"])
.index("by_dm_key", ["dmKey"])

// chatMessages
.index("by_conversation", ["conversationId"])
.index("by_conversation_created", ["conversationId", "createdAt"])
.index("by_org", ["organizationId"])
.index("by_sender", ["senderId"])

// users
.index("by_email", ["email"])
.index("by_org", ["organizationId"])
.index("by_org_role", ["organizationId", "role"])
```

### Query Optimizations
- Use `.withIndex()` for all queries
- Implement pagination with `.take(limit)`
- Cache frequently accessed data
- Use `.first()` instead of `.take(1)`

---

## Future Optimizations

### Phase 1: Immediate (Done)
- [x] Next.js bundle optimization
- [x] Hermes engine for Android
- [x] Convex indexing
- [x] Image lazy loading

### Phase 2: Short Term
- [ ] Implement React Server Components
- [ ] Add virtual scrolling for large lists
- [ ] Service Worker for offline support
- [ ] Preload critical resources

### Phase 3: Long Term
- [ ] Edge computing for Convex functions
- [ ] CDN for static assets
- [ ] Database query caching layer
- [ ] Real-time performance monitoring

---

## Monitoring

### Desktop
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

### Mobile
```bash
# React Native Performance
npm install react-native-performance
```

### Convex
```bash
# Monitor function execution time
npx convex logs --format=json
```
