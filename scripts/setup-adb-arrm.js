/**
 * Quick setup script for creating ADB-ARRM organization
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
    console.log("💡 Hint: Make sure you're logged in to the app.");
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
    console.error("❌ Only superadmin can create organizations. Please login as romangulanyan@gmail.com");
    return;
  }

  // Get convex client from React app
  const convex = window.__CONVEX_CLIENT__;
  if (!convex) {
    console.error("❌ Convex client not found.");
    console.log("💡 Alternative: Use the UI to create organization");
    console.log("   Go to: /register-org/create");
    return;
  }

  try {
    // Step 1: Create organization
    console.log("📦 Creating organization...");
    const { orgId } = await convex.mutation("organizations:createOrganization", {
      superadminUserId: user._id,
      name: "ADB-ARRM",
      slug: "adb-arrm",
      plan: "starter", // Free plan with all features enabled
      timezone: "Asia/Yerevan",
      country: "Armenia",
      industry: "Technology",
    });

    console.log("✅ Organization created:", orgId);

    // Step 2: Assign superadmin to this organization
    console.log("👤 Assigning you as organization admin...");
    await convex.mutation("organizations:assignOrgAdmin", {
      superadminUserId: user._id,
      userId: user._id,
      organizationId: orgId
    });

    console.log("✅ You have been added as admin of ADB-ARRM!");

    // Update localStorage to refresh user data
    console.log("🔄 Refreshing user data...");
    
    console.log("\n📝 Organization setup complete!");
    console.log("Organization ID:", orgId);
    console.log("Organization Slug: adb-arrm");
    console.log("\n⚠️ IMPORTANT: Please refresh the page (F5) to see your organization data!");
    
    console.log("\n🎉 Setup complete!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
})();
