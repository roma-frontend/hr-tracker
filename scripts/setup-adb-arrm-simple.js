/**
 * Simple setup for ADB-ARRM organization
 * 
 * This script calls the API endpoints directly
 * 
 * Usage:
 * 1. Login to the app as romangulanyan@gmail.com
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Press Enter
 */

(async function setupAdbArrm() {
  console.log("🚀 Setting up ADB-ARRM organization...");

  // Get current user from Zustand store
  const userStr = localStorage.getItem("user-storage");
  if (!userStr) {
    console.error("❌ User not found. Please login first.");
    return;
  }

  let user;
  try {
    const storage = JSON.parse(userStr);
    user = storage.state?.user;
    if (!user) {
      console.error("❌ User not found in storage.");
      return;
    }
  } catch (e) {
    console.error("❌ Error parsing user data:", e);
    return;
  }

  console.log("✅ Current user:", user.email);

  if (user.email.toLowerCase() !== "romangulanyan@gmail.com") {
    console.error("❌ Only superadmin can create organizations.");
    return;
  }

  console.log("\n📝 INSTRUCTIONS:");
  console.log("Since direct Convex access is not available from console,");
  console.log("please use the UI to create the organization:\n");
  console.log("1. Go to: http://localhost:3000/register-org/create");
  console.log("2. Fill in the form:");
  console.log("   - Organization Name: ADB-ARRM");
  console.log("   - Slug: adb-arrm");
  console.log("   - Plan: Starter");
  console.log("   - Timezone: Asia/Yerevan");
  console.log("   - Country: Armenia");
  console.log("   - Industry: Technology");
  console.log("3. Click 'Create Organization'");
  console.log("\n✅ You will be automatically added as admin!");
  console.log("\n🎉 That's it!");

})();
