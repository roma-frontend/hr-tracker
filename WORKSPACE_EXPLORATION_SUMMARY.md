# Desktop/office Workspace Exploration Summary

## 1. Folder Structure Overview

### Root Level
- **package.json**: Project dependencies and scripts
- **convex/**: Backend functions and database schema (Convex backend-as-a-service)
- **src/**: Next.js frontend application
- **public/**: Static assets and ML models for face recognition
- **scripts/**: Utility scripts (currently empty)

### Key Directories

#### `/src/app/` - Next.js App Router Structure
```
src/app/
├── (auth)/                 # Auth pages (login, register, forgot-password, reset-password)
├── (dashboard)/            # Main application pages
│   ├── analytics/
│   ├── approvals/
│   ├── attendance/
│   ├── calendar/
│   ├── dashboard/
│   ├── employees/
│   ├── leaves/
│   ├── reports/
│   ├── settings/          # USER SETTINGS PAGE
│   ├── tasks/
│   └── layout.tsx         # Dashboard layout wrapper
├── api/                   # API routes (next.js API)
│   ├── stripe/
│   │   ├── checkout/
│   │   └── webhook/
│   ├── calendar/          # Google & Outlook sync
│   ├── chat/              # AI chat endpoints
│   ├── auth/              # Auth endpoints
│   └── admin/
├── checkout/              # Stripe checkout flow
│   └── success/           # Success page after checkout
└── [public pages]         # contact, privacy, terms, landing
```

#### `/src/components/` - React Components
```
src/components/
├── admin/                 # Admin-only components (SLA, conflict detection, etc.)
├── ai/                    # AI features (chat, recommendations)
├── analytics/             # Analytics visualizations
├── attendance/
├── auth/                  # Auth components (Face, WebAuthn)
├── calendar/
├── dashboard/
├── employees/
├── landing/               # Landing page components
│   └── PricingPreview.tsx # PRICING PAGE
├── layout/                # Global layout (Navbar, Sidebar)
├── leaves/
├── tasks/
└── ui/                    # Shadcn UI primitives
```

#### `/src/lib/` - Utilities & Types
- `types.ts`: Leave, User, Department types
- `convex.tsx`: Convex client setup
- `utils.ts`: General utilities
- `jwt.ts`: JWT handling
- `calendar-sync.ts`: Calendar integration
- `faceApi.ts`: Face recognition setup

#### `/src/store/` - Zustand State Management
- `useAuthStore.ts`: User authentication state
- `useSidebarStore.ts`: Sidebar UI state
- `useUIStore.ts`: General UI state

#### `/convex/` - Backend (Convex Framework)
```
convex/
├── schema.ts              # Database schema definitions
├── subscriptions.ts       # SUBSCRIPTION LOGIC
├── users.ts               # User management & mutations
├── auth.ts                # Auth mutations & queries
├── admin.ts               # Admin operations
├── analytics.ts           # Analytics queries
├── employeeProfiles.ts
├── employeeNotes.ts
├── leaves.ts
├── tasks.ts
├── notifications.ts
├── timeTracking.ts
├── supervisorRatings.ts
├── sla.ts
├── faceRecognition.ts
├── migrations.ts
└── _generated/            # Auto-generated Convex API types
```

---

## 2. Dashboard/Settings Pages

### Settings Page
**Location**: `src/app/(dashboard)/settings/page.tsx`

**Features**:
- Profile Information (name, email, role, department, avatar upload)
- Notifications Settings (email, push, weekly report toggles)
- Security Settings
  - WebAuthn (Touch ID / Fingerprint)
  - Face ID registration/removal
- Appearance (Dark/Light/System theme)
- Admin-Only: SLA Settings (dynamically imported)
- Save/Update functionality

**Key Components**:
- `AvatarUpload`: Upload profile picture
- `WebAuthnButton`: Biometric registration
- `FaceRegistration`: Face ID setup
- `SLASettings`: Admin configuration (lazy loaded)

### Other Dashboard Pages
- `/analytics` - Leave trends, department stats
- `/attendance` - Check-in/out, attendance records
- `/leaves` - Leave request management
- `/tasks` - Task assignment and tracking
- `/employees` - Employee directory
- `/approvals` - Leave approval workflow
- `/reports` - HR reports

---

## 3. Subscription/Plan Related Code

### Stripe Integration

#### Pricing Plans
**Location**: `src/components/landing/PricingPreview.tsx`

Three pricing tiers defined:
1. **Starter** - $29/month
   - Up to 50 employees
   - Basic leave tracking
   - Email notifications
   - Mobile app access
   - Standard support
   - 14-day free trial

2. **Professional** - $79/month (Most Popular)
   - Up to 200 employees
   - Advanced analytics
   - Custom leave policies
   - API access
   - Priority support
   - Slack & calendar integrations
   - AI-powered insights
   - 14-day free trial

3. **Enterprise** - Custom pricing
   - Unlimited employees
   - White-label solution
   - Dedicated account manager
   - Custom integrations
   - 24/7 phone support
   - SLA guarantee
   - On-premise option
   - Contact Sales flow

#### Stripe API Routes

**Checkout Route**: `src/app/api/stripe/checkout/route.ts`
```typescript
- POST endpoint for creating Stripe checkout sessions
- Accepts: plan ('starter' or 'professional'), email
- Creates subscription with 14-day trial
- Redirects to Stripe hosted checkout
- Returns success_url to /checkout/success?session_id=...&plan=...
- Cancel URL redirects to /#pricing
```

**Webhook Route**: `src/app/api/stripe/webhook/route.ts`
```typescript
- Handles Stripe webhook events
- Events handled:
  1. checkout.session.completed - Create/update subscription
  2. customer.subscription.updated - Update status
  3. customer.subscription.deleted - Mark as canceled
  4. invoice.payment_failed - Set to past_due
- Calls Convex mutations to persist subscription data
```

#### Checkout Success Page
**Location**: `src/app/checkout/success/SuccessClient.tsx`
- Shows success message with plan name
- Displays 14-day trial notice
- Auto-redirects to /register after 5 seconds
- Shows trust badges (Instant Access, SSL Secured, 14-day Trial)

---

## 4. Convex Backend Structure

### Database Schema (`convex/schema.ts`)

#### Subscriptions Table
```typescript
subscriptions: {
  stripeCustomerId: string       // Stripe customer ID
  stripeSubscriptionId: string   // Stripe subscription ID
  stripeSessionId?: string       // Stripe checkout session
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
  email?: string                 // Customer email
  userId?: v.id('users')         // Link to user (optional until registered)
  currentPeriodStart?: number    // Unix timestamp (ms)
  currentPeriodEnd?: number      // Unix timestamp (ms)
  cancelAtPeriodEnd: boolean     // Pending cancellation
  trialEnd?: number              // Trial end timestamp
  createdAt: number
  updatedAt: number
  
  Indexes:
  - by_stripe_customer (for lookup by customer)
  - by_stripe_subscription (for lookup by subscription)
  - by_status (for filtering by status)
  - by_user (for user's subscription)
  - by_email (for email-based lookup)
}
```

#### Contact Inquiries Table
```typescript
contactInquiries: {
  name: string
  email: string
  company?: string
  teamSize?: string
  message: string
  plan?: string                  // Which plan interested in
  createdAt: number
  
  Indexes:
  - by_created
}
```

### Subscription Functions (`convex/subscriptions.ts`)

**Mutations**:
1. `upsertSubscription(args)` - Insert or update subscription after checkout
   - Checks for existing by stripeSubscriptionId
   - Updates or inserts subscription record
   - Links to user if email matches

2. `updateSubscriptionStatus(args)` - Update status from Stripe events
   - Finds subscription by stripeSubscriptionId
   - Updates: status, cancelAtPeriodEnd, currentPeriod dates

3. `saveContactInquiry(args)` - Save enterprise contact inquiry
   - Stores inquiry for sales team follow-up

4. `linkSubscriptionToUser(args)` - Link subscription to user after registration
   - Finds unlinked subscription by email
   - Attaches userId to subscription
   - Called during registration flow

**Queries**:
1. `getByCustomer(stripeCustomerId)` - Get subscription by Stripe customer ID
2. `getSubscriptionByUserId(userId)` - Get user's subscription
3. `getSubscriptionByEmail(email)` - Get subscription by email
4. `listInquiries()` - List all contact inquiries (admin)

---

## 5. Package.json Dependencies

### Key Packages

**Authentication & Security**:
- `jose` (^6.1.3) - JWT handling
- `@simplewebauthn/browser` (^13.2.2) - WebAuthn
- `@simplewebauthn/server` (^13.2.3) - WebAuthn server

**Payments**:
- `stripe` (^20.4.0) - Stripe server SDK
- `@stripe/stripe-js` (^8.8.0) - Stripe browser SDK

**Backend**:
- `convex` (^1.32.0) - Backend-as-a-service
- `ai` (^6.0.97) - AI SDK (Vercel AI)

**AI Providers**:
- `@ai-sdk/openai` (^3.0.30)
- `@ai-sdk/groq` (^3.0.24)
- `@ai-sdk/xai` (^3.0.57)
- `@ai-sdk/react` (^3.0.99)
- `openai` (^6.22.0)

**Frontend Framework**:
- `next` (^16.1.6)
- `react` (^19.2.3)
- `react-dom` (^19.2.3)

**UI & Styling**:
- `tailwindcss` (^4) - CSS framework
- `@tailwindcss/postcss` (^4)
- `framer-motion` (^12.34.3) - Animations
- `lucide-react` (^0.575.0) - Icons

**UI Components**:
- `@radix-ui/*` - Accessible component library (dialogs, menus, tabs, etc.)
- `recharts` (^3.7.0) - Charts & graphs
- `react-day-picker` (^9.13.2) - Date picker

**Features**:
- `face-api.js` (^0.22.2) - Face recognition
- `canvas` (^3.2.1) - Canvas support for face detection
- `three` (^0.183.1) - 3D graphics
- `@react-three/fiber` (^9.5.0) - React Three.js
- `@react-three/drei` (^10.7.7) - Three.js helpers
- `date-fns` (^4.1.0) - Date utilities
- `cloudinary` (^2.9.0) - Image hosting
- `resend` (^6.9.2) - Email sending
- `sonner` (^2.0.7) - Toast notifications
- `next-themes` (^0.4.6) - Theme switching
- `zustand` (^5.0.11) - State management
- `clsx` (^2.1.1) - Class name utilities

**Drag & Drop**:
- `@dnd-kit/core` (^6.3.1)
- `@dnd-kit/sortable` (^10.0.0)

---

## 6. Type Definitions

### User Interface (`src/store/useAuthStore.ts`)
```typescript
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'supervisor' | 'employee'
  avatar?: string
  department?: string
  position?: string
  employeeType?: 'staff' | 'contractor'
}
```

### Convex User Table Schema (`convex/schema.ts`)
```typescript
users: {
  // Basic info
  name: string
  email: string
  passwordHash: string
  role: 'admin' | 'supervisor' | 'employee'
  employeeType: 'staff' | 'contractor'
  department?: string
  position?: string
  phone?: string
  avatarUrl?: string
  
  // Presence & Status
  presenceStatus?: 'available' | 'in_meeting' | 'in_call' | 'out_of_office' | 'busy'
  supervisorId?: v.id('users')
  isActive: boolean
  
  // Approval System
  isApproved: boolean
  approvedBy?: v.id('users')
  approvedAt?: number
  
  // Leave Balances
  travelAllowance: number (12000 or 20000 AMD based on employeeType)
  paidLeaveBalance: number
  sickLeaveBalance: number
  familyLeaveBalance: number
  
  // Security
  webauthnChallenge?: string
  resetPasswordToken?: string
  resetPasswordExpiry?: number
  sessionToken?: string
  sessionExpiry?: number
  
  // Face Recognition
  faceDescriptor?: number[] (128-dimensional embedding)
  faceImageUrl?: string
  faceRegisteredAt?: number
  
  // Metadata
  createdAt: number
  lastLoginAt?: number
  
  Indexes:
  - by_email
  - by_role
  - by_supervisor
  - by_approval
}
```

### Subscription Type (from schema & mutations)
```typescript
type Subscription = {
  _id: string                    // Convex document ID
  stripeCustomerId: string
  stripeSubscriptionId: string
  stripeSessionId?: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
  email?: string
  userId?: Id<'users'>
  currentPeriodStart?: number
  currentPeriodEnd?: number
  cancelAtPeriodEnd: boolean
  trialEnd?: number
  createdAt: number
  updatedAt: number
}
```

### Types File (`src/lib/types.ts`)
```typescript
type LeaveType = 'paid' | 'unpaid' | 'sick' | 'family' | 'doctor'
type LeaveStatus = 'pending' | 'approved' | 'rejected'
type EmployeeType = 'staff' | 'contractor'
type UserRole = 'admin' | 'manager' | 'employee'

// Helper functions
- getTravelAllowance(email: string): number
- getInitials(name: string): string
- calculateDays(start: string, end: string): number
- formatCurrency(amount: number): string
```

---

## 7. Authentication Flow

### Registration (`convex/auth.ts`)
1. User registers with email, password, name
2. Email must be unique
3. Only `romangulanyan@gmail.com` can register as admin
4. First user is auto-approved
5. Subsequent users need admin approval
6. Travel allowance set based on employeeType (contractor=12000, staff=20000 AMD)

### Login
1. Verify email/password
2. Check account is active and approved
3. Set session token and expiry
4. Return user info

### Subscription Link (during registration)
- `linkSubscriptionToUser()` called during registration
- Searches for unlinked subscription by email
- Attaches userId to subscription record
- Enables tracking subscription owner

---

## 8. Navigation & Sidebar

### Sidebar Components (`src/components/layout/Sidebar.tsx`)
- Main navigation menu with role-based routing
- Links to all dashboard pages
- User presence status indicators
- Supervisor/manager selection UI

### Navbar Components (`src/components/layout/Navbar.tsx`)
- Page title display
- Notification center with toast sounds
- Theme switcher (Dark/Light/System)
- User dropdown menu (Profile, Settings, Logout)
- Mobile menu toggle

---

## 9. Key Integration Points

### Subscription Lifecycle
1. **Pricing Page** (`PricingPreview.tsx`) → Shows 3 plans
2. **Checkout** (`/api/stripe/checkout`) → Creates Stripe session
3. **Stripe Payment** → User completes payment
4. **Webhook** (`/api/stripe/webhook`) → Receives event
5. **Convex Save** → `upsertSubscription` stores in DB
6. **Success Page** (`/checkout/success`) → Shows confirmation
7. **Registration** (`/register`) → User creates account
8. **Link Subscription** → `linkSubscriptionToUser` associates with user

### User Role Hierarchy
- **Admin** (only romangulanyan@gmail.com)
  - Can approve users
  - Can manage all employees
  - Access to SLA settings
  - Receives admin notifications

- **Supervisor**
  - Can rate employees
  - Can assign tasks
  - Can approve leaves

- **Employee**
  - Can request leaves
  - Can view own analytics
  - Can check in/out

---

## 10. File Paths Summary

| Component | Path |
|-----------|------|
| Pricing Page | `src/components/landing/PricingPreview.tsx` |
| Settings Page | `src/app/(dashboard)/settings/page.tsx` |
| Checkout Route | `src/app/api/stripe/checkout/route.ts` |
| Webhook Route | `src/app/api/stripe/webhook/route.ts` |
| Success Page | `src/app/checkout/success/` |
| Subscription Schema | `convex/schema.ts` (lines 346-371) |
| Subscription Mutations | `convex/subscriptions.ts` |
| User Schema | `convex/schema.ts` (lines 4-52) |
| User Mutations | `convex/users.ts` |
| Auth Mutations | `convex/auth.ts` |
| Type Definitions | `src/lib/types.ts` |
| Auth Store | `src/store/useAuthStore.ts` |
| Navbar | `src/components/layout/Navbar.tsx` |
| Sidebar | `src/components/layout/Sidebar.tsx` |

