/**
 * Test Script for Security Alerts and Suspension System
 * 
 * This script helps test:
 * 1. Suspicious activity detection
 * 2. Superadmin notification
 * 3. User suspension
 * 4. User unsuspension
 * 
 * Run from browser console on /superadmin/security page
 */

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Test 1: Simulate suspicious login and notify superadmin
export async function testSuspiciousActivityAlert() {
  console.log("🧪 Testing Suspicious Activity Alert...");
  
  // This would typically be called from the login flow
  // For testing, we'll call it manually with test data
  
  const testData = {
    userId: "YOUR_TEST_USER_ID", // Replace with actual user ID
    email: "test@example.com",
    reason: "Multiple failed login attempts",
    riskScore: 85,
    riskFactors: ["New device", "Unusual hour", "Failed attempts"],
    ip: "192.168.1.100",
    deviceInfo: "Chrome on Windows 11",
  };
  
  try {
    const result = await fetch('/api/test-security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'notify_suspicious',
        ...testData
      })
    });
    
    const data = await result.json();
    console.log("✅ Notification sent:", data);
    console.log("📧 Check your notifications for the security alert!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Test 2: Suspend a user
export async function testSuspendUser(userId: string, adminId: string) {
  console.log("🧪 Testing User Suspension...");
  
  try {
    const result = await fetch('/api/security/quick-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'suspend',
        userId,
        adminId,
        reason: 'TEST: Suspicious activity detected',
        duration: 1, // 1 hour for testing
      })
    });
    
    const data = await result.json();
    console.log("✅ User suspended:", data);
    console.log("🔒 User will be unsuspended in 1 hour");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Test 3: Unsuspend a user
export async function testUnsuspendUser(userId: string, adminId: string) {
  console.log("🧪 Testing User Unsuspension...");
  
  try {
    const result = await fetch('/api/security/quick-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'unsuspend',
        userId,
        adminId,
      })
    });
    
    const data = await result.json();
    console.log("✅ User unsuspended:", data);
    console.log("🔓 User can now log in again");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Instructions for manual testing
console.log(`
╔════════════════════════════════════════════════════════════════╗
║          SECURITY ALERTS TESTING INSTRUCTIONS                  ║
╔════════════════════════════════════════════════════════════════╝

📋 STEP-BY-STEP TESTING GUIDE:

1️⃣  GET YOUR USER IDS:
   Open browser console (F12) and run:
   
   const storage = JSON.parse(localStorage.getItem('hr-auth-storage'));
   const myUserId = storage.state.user.id;
   console.log('My User ID (superadmin):', myUserId);
   
2️⃣  CREATE A TEST USER (or use existing):
   Go to /employees and create a test user
   Note down their user ID from the database

3️⃣  TEST SUSPICIOUS ACTIVITY ALERT:
   In Convex dashboard (dashboard.convex.dev):
   - Go to Functions
   - Run: security.notifySuperadminSuspiciousActivity
   - Parameters:
     {
       "userId": "<test-user-id>",
       "email": "test@example.com",
       "reason": "Testing security alert",
       "riskScore": 85,
       "riskFactors": ["New device", "Unusual hour"],
       "ip": "192.168.1.1",
       "deviceInfo": "Chrome on Windows"
     }
   - Check your notifications bell 🔔

4️⃣  TEST USER SUSPENSION:
   Method A - Via API:
   fetch('/api/security/quick-action', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       action: 'suspend',
       userId: '<test-user-id>',
       adminId: '<your-superadmin-id>',
       reason: 'Test suspension',
       duration: 1
     })
   }).then(r => r.json()).then(console.log);
   
   Method B - Via Convex Dashboard:
   - Go to Functions → users.suspendUser
   - Parameters:
     {
       "adminId": "<your-id>",
       "userId": "<test-user-id>",
       "reason": "Testing suspension system",
       "duration": 1
     }

5️⃣  VERIFY SUSPENSION:
   - Check test user's notifications
   - Try to login as test user (should be blocked)
   - Check audit logs in /superadmin/security

6️⃣  TEST UNSUSPENSION:
   fetch('/api/security/quick-action', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       action: 'unsuspend',
       userId: '<test-user-id>',
       adminId: '<your-superadmin-id>'
     })
   }).then(r => r.json()).then(console.log);

7️⃣  TEST AUTO-UNSUSPENSION:
   - Suspend user for 1 minute (duration: 0.0167)
   - Wait 1 minute
   - Run in Convex: users.autoUnsuspendExpired
   - User should be automatically unsuspended

═══════════════════════════════════════════════════════════════

🔍 WHAT TO CHECK:

✅ Superadmin receives notification
✅ Notification contains all details (risk score, IP, etc.)
✅ User gets suspended successfully
✅ User receives suspension notification
✅ Suspended user cannot login
✅ Audit log created for suspension
✅ User gets unsuspended successfully
✅ User receives unsuspension notification
✅ User can login after unsuspension
✅ Audit log created for unsuspension

═══════════════════════════════════════════════════════════════
`);
