# User Presence Status System

## Overview
Complete user presence status management system with automatic status updates during calls, beautiful modal UI, and multi-language support (EN, RU, HY).

## Features

### 1. **Status Types**
- **Available** ✓ - User is available and ready to help
- **In Meeting** 🚫 - Currently in a meeting, notifications muted
- **In Call** ☎️ - On phone/video call, do not disturb
- **Out of Office** ✈️ - Away from office, optional message
- **Busy** ⏱️ - Focused work, only urgent notifications

### 2. **Automatic Status Management**
- When a user starts a **video/audio call**, status automatically changes to **"In Call"**
- When the **call ends**, status automatically reverts to **"Available"**
- Each status change triggers a notification

### 3. **UI Components**

#### StatusModal.tsx
Beautiful modal for selecting user status with:
- 5 status options with icons
- Detailed descriptions for each status
- Confirmation dialog with what-happens explanation
- Optional message for "Out of Office" status
- Full support for EN, RU, HY languages

**Usage:**
```tsx
import { StatusModal } from "@/components/status/StatusModal";

<StatusModal
  isOpen={isStatusModalOpen}
  onClose={() => setIsStatusModalOpen(false)}
  currentUserId={userId}
  currentStatus={userStatus}
  onStatusChange={(newStatus) => console.log(newStatus)}
/>
```

#### StatusIndicator.tsx
Compact status indicator component with:
- Visual icon + label
- Colored backgrounds matching status type
- Clickable to open status selection modal
- Size variants: sm, md, lg
- Optional label display

**Usage:**
```tsx
import { StatusIndicator } from "@/components/status/StatusIndicator";

<StatusIndicator
  status={userStatus}
  onClick={() => setIsStatusModalOpen(true)}
  size="md"
  showLabel={true}
/>
```

### 4. **Hooks**

#### usePresenceStatus.ts
Hook for managing presence status state and mutations:

```tsx
const {
  isStatusModalOpen,
  openStatusModal,
  closeStatusModal,
  updateStatus,
  currentStatus,
} = usePresenceStatus(userId);

// Open modal
openStatusModal();

// Update status programmatically
await updateStatus("busy", "Working on critical task");
```

### 5. **Convex Mutations**

#### updatePresenceStatus
Update user's presence status:
```typescript
await updatePresenceStatus({
  userId: "user_id",
  presenceStatus: "busy",
  outOfOfficeMessage: "Back tomorrow"
});
```

#### setInCallStatus
Automatically called when call starts - sets status to "in_call"

#### resetFromCallStatus
Automatically called when call ends - reverts from "in_call" to "available"

### 6. **Translations**
All status messages translated to EN, RU, HY in:
- `src/i18n/locales/en.json`
- `src/i18n/locales/ru.json`
- `src/i18n/locales/hy.json`

Translation keys:
```
status.selectStatus
status.available.label
status.available.description
status.available.notification
status.in_meeting.label
... (and so on for all 5 statuses)
```

## Implementation Example

### In Chat Component
```tsx
import { StatusModal } from "@/components/status/StatusModal";
import { StatusIndicator } from "@/components/status/StatusIndicator";
import { usePresenceStatus } from "@/hooks/usePresenceStatus";

export function ChatHeader({ userId, userStatus }) {
  const { isStatusModalOpen, openStatusModal, closeStatusModal } =
    usePresenceStatus(userId);

  return (
    <div className="flex items-center gap-4">
      {/* Show current status */}
      <StatusIndicator
        status={userStatus}
        onClick={openStatusModal}
      />

      {/* Modal for changing status */}
      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={closeStatusModal}
        currentUserId={userId}
        currentStatus={userStatus}
        onStatusChange={(status) => {
          console.log("Status changed to:", status);
          // User status will be updated automatically via mutation
        }}
      />
    </div>
  );
}
```

### Automatic Call Status
The CallModal automatically handles status:
- When call connects → sets "in_call"
- When call ends → resets to "available"

No manual intervention needed!

## Database Schema

User record includes:
```typescript
presenceStatus: "available" | "in_meeting" | "in_call" | "out_of_office" | "busy"
```

Notifications created for:
- status_change events
- Indexed by user and read status

## Testing

1. **Test Status Selection**
   - Click StatusIndicator to open modal
   - Select different statuses
   - Confirm changes

2. **Test Auto Status in Call**
   - Start a video/audio call
   - Verify status changes to "In Call"
   - End call, verify status returns to "Available"

3. **Test Multi-language**
   - Switch app language
   - Open status modal
   - Verify all text is translated

4. **Test Out of Office**
   - Select "Out of Office"
   - Add optional message
   - Confirm status change

## Future Enhancements

- [ ] Auto-reset status after meeting ends
- [ ] Show user's OOO message in chat preview
- [ ] Schedule automatic status changes
- [ ] Status history/logs
- [ ] Away timeout (auto-set after inactivity)
- [ ] Integration with calendar (auto-busy during events)
