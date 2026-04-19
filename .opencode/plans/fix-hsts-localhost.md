# Plan: Fix HSTS ERR_SSL_PROTOCOL_ERROR on localhost

## Problem
The middleware applies HSTS (`Strict-Transport-Security`) header on ALL requests, including localhost.
Browsers cache this header and force HTTPS for localhost, but the Docker container only serves HTTP.
Result: `ERR_SSL_PROTOCOL_ERROR` when accessing `http://localhost:3000/dashboard`.

## Root Cause
File: `src/middleware.ts` lines 186-189
The HSTS header is applied unconditionally:
```typescript
response.headers.set(
  'Strict-Transport-Security',
  'max-age=31536000; includeSubDomains; preload',
);
```

## Solution

### Step 1: Modify `src/middleware.ts`
**File:** `src/middleware.ts`
**Lines:** 186-189

**Current code:**
```typescript
  // HSTS — enforce HTTPS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload',
  );
```

**Replace with:**
```typescript
  // HSTS — enforce HTTPS (only in production or non-localhost)
  if (isProduction || !request.nextUrl.hostname.includes('localhost')) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }
```

**Rationale:**
- `isProduction` is already defined at line 158 as `process.env.NODE_ENV === 'production'`
- The Docker build sets `NODE_ENV=production` (Dockerfile line 18), so we also check hostname
- This ensures HSTS is never applied when accessing via `localhost`

### Step 2: Rebuild Docker container
**Commands:**
```bash
docker-compose -f docker-compose.full.yml down
docker-compose -f docker-compose.full.yml up -d --build
```

**Rationale:**
- Next.js middleware is compiled during `npm run build`
- The Dockerfile builds the app in the `builder` stage, so we need a full rebuild
- `--build` flag ensures the new middleware code is compiled into the image

### Step 3: User must clear HSTS cache in browser
The browser has already cached the HSTS policy for localhost. Even after the fix, the browser will continue forcing HTTPS until the cache is cleared.

**Chrome/Edge:**
1. Navigate to `chrome://net-internals/#hsts`
2. Scroll to "Delete domain security policies"
3. Enter `localhost` in the Domain field
4. Click "Delete"

**Firefox:**
1. Navigate to `about:preferences#privacy`
2. Scroll to "Certificates" → click "View Certificates"
3. Go to "Servers" tab
4. Find and delete any `localhost` entries

**Alternative:** Use incognito/private mode or a different browser for testing.

### Step 4: Verify
1. Open `http://localhost:3000/dashboard` (note: explicitly use `http://`)
2. Confirm the page loads without `ERR_SSL_PROTOCOL_ERROR`
3. Check browser DevTools → Network tab → Response Headers to confirm `Strict-Transport-Security` is NOT present

## Files Changed
| File | Lines | Change |
|------|-------|--------|
| `src/middleware.ts` | 186-189 | Wrap HSTS header in conditional check |

## Risks
- **Low risk:** The change only affects localhost/non-production environments
- Production deployments (Vercel) will continue to have HSTS enforced
- No database or data migration needed

## Alternative Considered
Could also add `NEXT_PUBLIC_SITE_URL` to `docker-compose.full.yml` environment, but this doesn't solve the HSTS issue since the header is set in middleware regardless of env vars.
