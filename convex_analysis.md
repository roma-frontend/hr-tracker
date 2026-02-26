# Convex TypeScript Files Analysis

## Directory Overview
**Location:** `Desktop/office/convex/`

**All .ts files found:**
- admin.ts
- aiEvaluator.ts
- analytics.ts
- auth.ts
- employeeNotes.ts
- employeeProfiles.ts
- faceRecognition.ts
- leaves.ts
- migrations.ts
- notifications.ts
- schema.ts
- sla.ts
- supervisorRatings.ts
- tasks.ts
- timeTracking.ts
- users.ts

**Cloudinary Integration:** ❌ **NOT FOUND** - No references to 'cloudinary' in any files.

---

## 1. tasks.ts

### Exported Mutations:
```typescript
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    assignedTo: v.id("users"),
    assignedBy: v.id("users"),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    deadline: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => { ... }
})

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("review"), v.literal("completed"), v.literal("cancelled")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => { ... }
})

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(...)),
    deadline: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(...)),
  },
  handler: async (ctx, args) => { ... }
})

export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => { ... }
})

export const addComment = mutation({
  args: {
    taskId: v.id("tasks"),
    authorId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => { ... }
})

export const assignSupervisor = mutation({
  args: {
    employeeId: v.id("users"),
    supervisorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => { ... }
})

export const addAttachment = mutation({
  args: {
    taskId: v.id("tasks"),
    url: v.string(),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    uploadedBy: v.id("users"),
  },
  handler: async (ctx, args) => { ... }
})

export const removeAttachment = mutation({
  args: {
    taskId: v.id("tasks"),
    url: v.string(),
  },
  handler: async (ctx, args) => { ... }
})
```

### Exported Queries:
```typescript
export const getTasksForEmployee = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => { ... }
})

export const getTasksAssignedBy = query({
  args: { supervisorId: v.id("users") },
  handler: async (ctx, args) => { ... }
})

export const getAllTasks = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getTeamTasks = query({
  args: { supervisorId: v.id("users") },
  handler: async (ctx, args) => { ... }
})

export const getMyEmployees = query({
  args: { supervisorId: v.id("users") },
  handler: async (ctx, args) => { ... }
})

export const getUsersForAssignment = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getSupervisors = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getTaskComments = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => { ... }
})
```

---

## 2. analytics.ts

### Exported Queries:
```typescript
export const getAnalyticsOverview = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getDepartmentStats = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getLeaveTrends = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getUserAnalytics = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => { ... }
})

export const getTeamCalendar = query({
  args: {},
  handler: async (ctx) => { ... }
})
```

---

## 3. timeTracking.ts

### Exported Mutations:
```typescript
export const checkIn = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => { ... }
})

export const checkOut = mutation({
  args: {
    userId: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => { ... }
})

export const markAbsent = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => { ... }
})
```

### Exported Queries:
```typescript
export const getTodayStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => { ... }
})

export const getUserHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => { ... }
})

export const getCurrentlyAtWork = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getRecentAttendance = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => { ... }
})

export const getTodayAllAttendance = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getTodayAttendanceSummary = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getMonthlyStats = query({
  args: {
    userId: v.id("users"),
    month: v.string(), // "2026-02"
  },
  handler: async (ctx, args) => { ... }
})

export const getAllEmployeesAttendanceOverview = query({
  args: { month: v.string() },
  handler: async (ctx, args) => { ... }
})

export const getEmployeeAttendanceHistory = query({
  args: {
    userId: v.id("users"),
    month: v.string(),
  },
  handler: async (ctx, args) => { ... }
})
```

---

## 4. supervisorRatings.ts

### Exported Mutations:
```typescript
export const createRating = mutation({
  args: {
    employeeId: v.id("users"),
    supervisorId: v.id("users"),
    qualityOfWork: v.number(), // 1-5
    efficiency: v.number(), // 1-5
    teamwork: v.number(), // 1-5
    initiative: v.number(), // 1-5
    communication: v.number(), // 1-5
    reliability: v.number(), // 1-5
    strengths: v.optional(v.string()),
    areasForImprovement: v.optional(v.string()),
    generalComments: v.optional(v.string()),
    ratingPeriod: v.optional(v.string()), // e.g., "2026-02"
  },
  handler: async (ctx, args) => { ... }
})
```

### Exported Queries:
```typescript
export const getEmployeeRatings = query({
  args: {
    employeeId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => { ... }
})

export const getLatestRating = query({
  args: { employeeId: v.id("users") },
  handler: async (ctx, args) => { ... }
})

export const getAverageRatings = query({
  args: {
    employeeId: v.id("users"),
    months: v.optional(v.number()), // Last N months, default 3
  },
  handler: async (ctx, args) => { ... }
})

export const getRatingsBySupervisor = query({
  args: {
    supervisorId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => { ... }
})

export const getRatingTrends = query({
  args: {
    employeeId: v.id("users"),
    months: v.optional(v.number()),
  },
  handler: async (ctx, args) => { ... }
})

export const getEmployeesNeedingRating = query({
  args: { supervisorId: v.id("users") },
  handler: async (ctx, args) => { ... }
})
```

### Helper Functions:
```typescript
async function updatePerformanceMetrics(
  ctx: any,
  employeeId: Id<"users">,
  updatedBy: Id<"users">
)
```

---

## 5. users.ts

### Exported Queries:
```typescript
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => { ... }
})

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => { ... }
})

export const getWebauthnCredentials = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => { ... }
})

export const getWebauthnCredential = query({
  args: { credentialId: v.string() },
  handler: async (ctx, { credentialId }) => { ... }
})

export const getSupervisors = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getAuditLogs = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getPendingApprovalUsers = query({
  args: {},
  handler: async (ctx) => { ... }
})
```

### Exported Mutations:
```typescript
export const seedAdmin = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, { name, email, passwordHash }) => { ... }
})

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("admin"), v.literal("supervisor"), v.literal("employee")),
    employeeType: v.union(v.literal("staff"), v.literal("contractor")),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    phone: v.optional(v.string()),
    supervisorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => { ... }
})

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(...)),
    employeeType: v.optional(v.union(...)),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    supervisorId: v.optional(v.id("users")),
    isActive: v.optional(v.boolean()),
    paidLeaveBalance: v.optional(v.number()),
    sickLeaveBalance: v.optional(v.number()),
    familyLeaveBalance: v.optional(v.number()),
  },
  handler: async (ctx, { userId, ...updates }) => { ... }
})

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => { ... }
})

export const migrateFaceToAvatar = mutation({
  args: {},
  handler: async (ctx) => { ... }
})

export const updatePresenceStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(v.literal("available"), v.literal("in_meeting"), v.literal("in_call"), v.literal("out_of_office"), v.literal("busy")),
  },
  handler: async (ctx, args) => { ... }
})

export const updateAvatar = mutation({
  args: {
    userId: v.id("users"),
    avatarUrl: v.string(),
  },
  handler: async (ctx, { userId, avatarUrl }) => { ... }
})

export const updateSession = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    sessionExpiry: v.number(),
  },
  handler: async (ctx, { userId, sessionToken, sessionExpiry }) => { ... }
})

export const clearSession = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => { ... }
})

export const setWebauthnChallenge = mutation({
  args: {
    userId: v.id("users"),
    challenge: v.string(),
  },
  handler: async (ctx, { userId, challenge }) => { ... }
})

export const addWebauthnCredential = mutation({
  args: {
    userId: v.id("users"),
    credentialId: v.string(),
    publicKey: v.string(),
    counter: v.number(),
    deviceName: v.optional(v.string()),
  },
  handler: async (ctx, args) => { ... }
})

export const updateWebauthnCounter = mutation({
  args: {
    credentialId: v.string(),
    counter: v.number(),
  },
  handler: async (ctx, { credentialId, counter }) => { ... }
})

export const logAudit = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    target: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => { ... }
})

export const approveUser = mutation({
  args: {
    userId: v.id("users"),
    adminId: v.id("users"),
  },
  handler: async (ctx, { userId, adminId }) => { ... }
})

export const rejectUser = mutation({
  args: {
    userId: v.id("users"),
    adminId: v.id("users"),
  },
  handler: async (ctx, { userId, adminId }) => { ... }
})
```

---

## 6. admin.ts

### Exported Queries:
```typescript
export const getCostAnalysis = query({
  args: {
    period: v.optional(v.union(v.literal("month"), v.literal("quarter"), v.literal("year"))),
  },
  handler: async (ctx, args) => { ... }
})

export const detectConflicts = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getSmartSuggestions = query({
  args: {},
  handler: async (ctx) => { ... }
})

export const getCalendarExportData = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => { ... }
})
```

---

## 7. aiEvaluator.ts

### Exported Queries:
```typescript
export const calculateEmployeeScore = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => { ... }
})

export const evaluateLeaveRequest = query({
  args: { leaveRequestId: v.id("leaveRequests") },
  handler: async (ctx, args) => { ... }
})
```

### Helper Functions:
```typescript
function calculatePerformanceScore(metrics: any): number
function calculateAttendanceScore(metrics: any, leaves: any[], timeRecords?: any[]): number
function calculateBehaviorScore(notes: any[]): number
function calculateLeaveHistoryScore(leaves: any[], user: any): number
function calculateWorkloadScore(overlappingLeaves: any[]): number
function generateFactors(perfScore, attScore, behScore, leaveScore, workScore, metrics, notes, leaves, overlapping, user): object
function generateReasoning(score: number, recommendation: string, factors: any): string
```

---

## 8. auth.ts

### Exported Mutations:
```typescript
export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(), // actually a passwordHash
    phone: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("supervisor"), v.literal("employee"))),
    employeeType: v.optional(v.union(v.literal("staff"), v.literal("contractor"))),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
  },
  handler: async (ctx, { name, email, password, phone, role, employeeType, department, position }) => { ... }
})

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(), // actually a hash
    sessionToken: v.string(),
    sessionExpiry: v.number(),
  },
  handler: async (ctx, { email, password, sessionToken, sessionExpiry }) => { ... }
})

export const logout = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => { ... }
})

export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => { ... }
})

export const resetPassword = mutation({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { token, newPassword }) => { ... }
})

export const registerWebauthn = mutation({
  args: {
    userId: v.id("users"),
    credentialId: v.string(),
    publicKey: v.string(),
    counter: v.number(),
    deviceName: v.optional(v.string()),
  },
  handler: async (ctx, args) => { ... }
})

export const loginWebauthn = mutation({
  args: {
    credentialId: v.string(),
    counter: v.number(),
    sessionToken: v.string(),
    sessionExpiry: v.number(),
  },
  handler: async (ctx, { credentialId, counter, sessionToken, sessionExpiry }) => { ... }
})
```

### Exported Queries:
```typescript
export const verifySession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => { ... }
})

export const getSession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => { ... }
})

export const verifyResetToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => { ... }
})

export const getWebauthnCredential = query({
  args: { credentialId: v.string() },
  handler: async (ctx, { credentialId }) => { ... }
})
```

---

## 9. employeeNotes.ts

### Exported Mutations:
```typescript
export const addNote = mutation({
  args: {
    employeeId: v.id("users"),
    authorId: v.id("users"),
    type: v.union(v.literal("performance"), v.literal("behavior"), v.literal("achievement"), v.literal("concern"), v.literal("general")),
    visibility: v.union(v.literal("private"), v.literal("hr_only"), v.literal("manager_only"), v.literal("employee_visible")),
    content: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => { ... }
})

export const updateNote = mutation({
  args: {
    noteId: v.id("employeeNotes"),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => { ... }
})

export const deleteNote = mutation({
  args: { noteId: v.id("employeeNotes") },
  handler: async (ctx, args) => { ... }
})
```

### Exported Queries:
```typescript
export const getNotes = query({
  args: {
    employeeId: v.id("users"),
    viewerId: v.id("users"),
  },
  handler: async (ctx, args) => { ... }
})

export const getNotesSummary = query({
  args: { employeeId: v.id("users") },
  handler: async (ctx, args) => { ... }
})
```

---

## 10. employeeProfiles.ts

### Exported Queries:
```typescript
export const getEmployeeProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => { ... }
})

export const getDocuments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => { ... }
})

export const getPerformanceHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => { ... }
})
```

### Exported Mutations:
```typescript
export const updateBiography = mutation({
  args: {
    userId: v.id("users"),
    biography: v.object({
      education: v.optional(v.array(v.string())),
      certifications: v.optional(v.array(v.string())),
      workHistory: v.optional(v.array(v.string())),
      skills: v.optional(v.array(v.string())),
      languages: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => { ... }
})

export const uploadDocument = mutation({
  args: {
    userId: v.id("users"),
    uploaderId: v.id("users"),
    category: v.union(v.literal("resume"), v.literal("contract"), v.literal("certificate"), v.literal("performance_review"), v.literal("id_document"), v.literal("other")),
    fileName: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => { ... }
})

export const deleteDocument = mutation({
  args: { documentId: v.id("employeeDocuments") },
  handler: async (ctx, args) => { ... }
})

export const updatePerformanceMetrics = mutation({
  args: {
    userId: v.id("users"),
    updatedBy: v.id("users"),
    metrics: v.object({
      punctualityScore: v.number(),
      absenceRate: v.number(),
      lateArrivals: v.number(),
      kpiScore: v.number(),
      projectCompletion: v.number(),
      deadlineAdherence: v.number(),
      teamworkRating: v.number(),
      communicationScore: v.number(),
      conflictIncidents: v.number(),
    }),
  },
  handler: async (ctx, args) => { ... }
})
```

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total .ts files | 16 |
| Files analyzed | 10 (core functionality) |
| Total exported functions | 100+ |
| Queries | ~50 |
| Mutations | ~50 |
| Cloudinary integration | ❌ None found |

## Key Features Covered

- ✅ Task Management (create, update, delete, comments, attachments)
- ✅ Time Tracking (check-in/out, attendance, history)
- ✅ Analytics (overview, department stats, leave trends)
- ✅ Performance Ratings (supervisor ratings, trends, averages)
- ✅ User Management (CRUD, authentication, WebAuthn)
- ✅ Employee Notes (with sentiment analysis)
- ✅ Employee Profiles (biography, documents, metrics)
- ✅ Authentication (login, register, password reset, WebAuthn)
- ✅ Admin Functions (cost analysis, conflict detection, suggestions)
- ✅ AI Evaluation (employee scoring, leave request evaluation)

## Important Notes

1. **Authentication:** Uses session tokens and WebAuthn support
2. **Admin Access:** Only `romangulanyan@gmail.com` can be admin
3. **Avatar Handling:** Uses both `avatarUrl` and `faceImageUrl` (legacy migration support)
4. **Timezone:** Time tracking uses Armenia timezone (UTC+4)
5. **No Cloudinary:** File uploads use generic `fileUrl` approach without Cloudinary integration
