"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export default function SuperadminCreateOrgPage() {
  const { user } = useAuthStore();
  const createOrg = useMutation(api.organizations.createOrganization);
  const assignAdmin = useMutation(api.organizations.assignOrgAdmin);

  const [loading, setLoading] = useState(false);

  console.log("Current user:", user);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (user?.email?.toLowerCase() !== "romangulanyan@gmail.com") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p>Only superadmin can access this page.</p>
          <p className="text-sm mt-2">Your email: {user.email}</p>
        </div>
      </div>
    );
  }

  const handleClick = async () => {
    console.log("Button clicked!");
    
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    setLoading(true);
    
    try {
      toast.info("Creating ADB-ARRM organization...");
      
      const result = await createOrg({
        superadminUserId: user.id,
        name: "ADB-ARRM",
        slug: "adb-arrm",
        plan: "starter",
        timezone: "Asia/Yerevan",
        country: "Armenia",
        industry: "Technology",
      });

      console.log("Organization created:", result);
      toast.success("Organization created!");

      toast.info("Adding you as admin...");
      
      await assignAdmin({
        superadminUserId: user.id,
        userId: user.id,
        organizationId: result.orgId,
      });

      toast.success("Done! Redirecting...");
      
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);

    } catch (error: any) {
      console.error("Full error:", error);
      toast.error(error.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-xl p-8" style={{ background: "var(--card)" }}>
          <h1 className="text-3xl font-bold text-center mb-6">
            🔧 Create ADB-ARRM
          </h1>

          <div className="space-y-3 mb-6 text-sm">
            <p><strong>Name:</strong> ADB-ARRM</p>
            <p><strong>Slug:</strong> adb-arrm</p>
            <p><strong>Plan:</strong> Starter (Free)</p>
            <p><strong>Timezone:</strong> Asia/Yerevan</p>
            <p><strong>Country:</strong> Armenia</p>
            <p><strong>Industry:</strong> Technology</p>
          </div>

          <button
            onClick={handleClick}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Organization & Join as Admin"}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            This will create the organization and add you as admin.
          </p>
        </div>
      </div>
    </div>
  );
}
