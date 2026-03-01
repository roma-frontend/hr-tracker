# 📝 Logging System Guide

**Professional Logging for HR Office**

---

## 🎯 Overview

The new logging system replaces `console.log` with structured, environment-aware logging that provides:

- 📊 **Log Levels** (debug, info, warn, error)
- 🎨 **Colored Output** in development
- 📦 **Structured JSON** in production
- ⚡ **Performance Tracking**
- 🔍 **Error Tracking**
- 👤 **User Action Logging**

---

## 🚀 Quick Start

### Import the Logger

```typescript
import { log } from '@/lib/logger';
```

### Basic Usage

```typescript
// Instead of: console.log('User logged in')
log.info('User logged in', { userId: user.id });

// Instead of: console.error('API failed', error)
log.error('API request failed', error, { endpoint: '/api/users' });

// Instead of: console.warn('Deprecated feature')
log.warn('Using deprecated feature', { feature: 'oldAPI' });
```

---

## 📊 Log Levels

### Debug (Development Only)

Use for detailed debugging information:

```typescript
log.debug('Rendering component', { 
  component: 'UserProfile',
  props: { userId: 123 }
});
```

### Info

Use for general informational messages:

```typescript
log.info('User registration successful', {
  userId: newUser.id,
  email: newUser.email
});
```

### Warn

Use for warnings that don't break functionality:

```typescript
log.warn('API rate limit approaching', {
  remaining: 10,
  limit: 100
});
```

### Error

Use for errors and exceptions:

```typescript
try {
  await fetchData();
} catch (error) {
  log.error('Failed to fetch data', error, {
    component: 'DataLoader',
    userId: user.id
  });
}
```

---

## 🎨 Special Logging Functions

### Performance Tracking

```typescript
const endTimer = log.time('Database Query');

// ... your code ...
const users = await db.users.findMany();

endTimer(); // Logs: "Performance: Database Query - 45.32ms"
```

### API Calls

```typescript
// Log outgoing API call
log.api.call('POST', '/api/users', {
  payload: { name: 'John' }
});

// Log API response
log.api.response('POST', '/api/users', 201, {
  userId: newUser.id
});
```

### User Actions

```typescript
log.user('Clicked create button', {
  page: 'employees',
  action: 'create'
});

log.user('Form submitted', {
  form: 'employeeRegistration',
  fields: ['name', 'email', 'department']
});
```

### Component Lifecycle

```typescript
useEffect(() => {
  log.component('EmployeeList', 'mount', { count: employees.length });
  
  return () => {
    log.component('EmployeeList', 'unmount');
  };
}, []);
```

---

## 🔧 Migration Examples

### Before (console.log)

```typescript
// ❌ Old way
console.log('User logged in:', userId);
console.log('Fetching data...');
console.error('Error:', error);
console.log('Avatar upload started');
```

### After (Structured Logging)

```typescript
// ✅ New way
log.info('User logged in', { userId });
log.debug('Fetching user data', { endpoint: '/api/users' });
log.error('Failed to authenticate', error, { userId });
log.info('Avatar upload started', { userId, fileSize: file.size });
```

---

## 📁 Real-World Examples

### Example 1: Avatar Upload (from avatar-upload.tsx)

**Before:**
```typescript
console.log("📷 Avatar upload started");
console.log("📁 File:", file.name, file.type, file.size);
console.log("✅ Cloudinary upload complete!");
console.error("❌ Upload error:", err);
```

**After:**
```typescript
log.info('Avatar upload started', {
  component: 'AvatarUpload',
  fileName: file.name,
  fileType: file.type,
  fileSize: file.size
});

log.info('Cloudinary upload complete', {
  url: uploadedUrl,
  userId
});

log.error('Avatar upload failed', error, {
  component: 'AvatarUpload',
  userId,
  fileName: file.name
});
```

### Example 2: API Route (from route.ts)

**Before:**
```typescript
console.log("Creating organization:", data);
console.error("Failed to create organization:", error);
```

**After:**
```typescript
log.info('Creating organization', {
  action: 'create',
  data: { name: data.name, industry: data.industry }
});

log.error('Failed to create organization', error, {
  action: 'create',
  orgName: data.name
});
```

### Example 3: Component Lifecycle

**Before:**
```typescript
useEffect(() => {
  console.log('Component mounted');
  return () => console.log('Component unmounted');
}, []);
```

**After:**
```typescript
useEffect(() => {
  log.component('EmployeesList', 'mount', { 
    employeeCount: employees.length 
  });
  
  return () => {
    log.component('EmployeesList', 'unmount');
  };
}, []);
```

---

## 🌍 Environment Behavior

### Development Mode

- ✅ Colorful console output
- ✅ Shows debug logs
- ✅ Displays stack traces
- ✅ Detailed context information

```
[2026-03-01T14:30:45.123Z] INFO: User logged in
  Context: {
    "userId": "123",
    "email": "user@example.com"
  }
```

### Production Mode

- ✅ JSON structured logs
- ✅ Only info, warn, error levels
- ✅ Sent to error tracking service
- ✅ Optimized for log aggregation

```json
{
  "timestamp": "2026-03-01T14:30:45.123Z",
  "level": "info",
  "message": "User logged in",
  "context": {
    "userId": "123",
    "email": "user@example.com"
  }
}
```

---

## 🎯 Best Practices

### DO ✅

```typescript
// Provide context
log.info('User updated profile', {
  userId: user.id,
  fields: ['name', 'email']
});

// Use appropriate levels
log.debug('Rendering component'); // Development only
log.info('User action completed'); // General info
log.warn('API rate limit warning'); // Warnings
log.error('Database connection failed', error); // Errors

// Track performance
const endTimer = log.time('Heavy Computation');
// ... expensive operation ...
endTimer();

// Log user actions
log.user('Clicked export button', { format: 'csv' });
```

### DON'T ❌

```typescript
// Don't use console.log
console.log('Something happened'); // ❌

// Don't log sensitive data
log.info('User login', { 
  password: user.password // ❌ Never log passwords!
});

// Don't log without context
log.info('Success'); // ❌ Too vague

// Don't use wrong log level
log.error('User clicked button'); // ❌ Not an error
```

---

## 🔍 Debugging Tips

### Finding Logs in Development

All logs appear in the browser console with colors:
- 🔵 Blue = Info
- 🟠 Orange = Warn  
- 🔴 Red = Error
- ⚫ Gray = Debug

### Finding Logs in Production

Logs are output as JSON and can be:
- Collected by log aggregation services (Datadog, LogRocket)
- Searched and filtered
- Visualized in dashboards

### Filtering Logs

```typescript
// Add tags for filtering
log.info('Processing payment', {
  tag: 'payment',
  amount: 100,
  userId: '123'
});

// Later search for: tag:payment
```

---

## 🚨 Error Tracking Integration

The logger is ready for integration with error tracking services:

### Sentry Integration (Example)

```typescript
// In src/lib/logger.ts
import * as Sentry from '@sentry/nextjs';

private sendToErrorTracking(entry: LogEntry) {
  Sentry.captureException(entry.error, {
    level: entry.level,
    extra: entry.context
  });
}
```

### LogRocket Integration (Example)

```typescript
import LogRocket from 'logrocket';

private sendToErrorTracking(entry: LogEntry) {
  LogRocket.captureException(entry.error, {
    tags: entry.context
  });
}
```

---

## 📊 Common Patterns

### Pattern 1: Try-Catch with Logging

```typescript
async function fetchUserData(userId: string) {
  const endTimer = log.time('Fetch User Data');
  
  try {
    log.api.call('GET', `/api/users/${userId}`);
    const response = await fetch(`/api/users/${userId}`);
    
    log.api.response('GET', `/api/users/${userId}`, response.status);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    const data = await response.json();
    log.info('User data fetched successfully', { userId });
    
    return data;
  } catch (error) {
    log.error('Failed to fetch user data', error, { userId });
    throw error;
  } finally {
    endTimer();
  }
}
```

### Pattern 2: Form Submission

```typescript
async function handleSubmit(formData: FormData) {
  log.user('Form submitted', {
    form: 'employeeRegistration',
    fields: Object.keys(formData)
  });
  
  const endTimer = log.time('Employee Registration');
  
  try {
    const result = await createEmployee(formData);
    log.info('Employee created successfully', {
      employeeId: result.id,
      name: result.name
    });
    endTimer();
  } catch (error) {
    log.error('Employee creation failed', error, {
      formData: formData.name // Don't log sensitive data
    });
    endTimer();
    throw error;
  }
}
```

### Pattern 3: Component Effects

```typescript
useEffect(() => {
  log.component('DataTable', 'mount', {
    rowCount: data.length,
    filters: activeFilters
  });
  
  const timer = log.time('Data Processing');
  processData(data);
  timer();
  
  return () => {
    log.component('DataTable', 'unmount');
  };
}, [data]);
```

---

## 📈 Migration Progress

Track your migration from console.log:

```bash
# Count remaining console.log usage
grep -r "console.log" src/ | wc -l

# Find files still using console.log
grep -r "console.log" src/ --files-with-matches
```

---

## 🎓 Training Resources

### Quick Reference Card

```typescript
// Levels
log.debug()  // Development only
log.info()   // General information
log.warn()   // Warnings
log.error()  // Errors

// Special
log.time()         // Performance
log.user()         // User actions
log.api.call()     // API requests
log.api.response() // API responses
log.component()    // Component lifecycle
```

---

## 📝 Next Steps

1. Import logger in your files
2. Replace console.log with appropriate log level
3. Add contextual information
4. Test in development
5. Deploy to production

---

**Created:** March 1, 2026  
**Status:** ✅ Production Ready  
**Replaced Console Logs:** 0/326 (In Progress)
