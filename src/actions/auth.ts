"use server";

import { cookies } from "next/headers";
import { signJWT, verifyJWT } from "@/lib/jwt";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

async function convexMutation(name: string, args: Record<string, unknown>) {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: name, args }),
  });
  const data = await res.json();
  if (data.status === "error") throw new Error(data.errorMessage ?? "Convex error");
  return data.value;
}

async function convexQuery(name: string, args: Record<string, unknown>) {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: name, args }),
  });
  const data = await res.json();
  if (data.status === "error") throw new Error(data.errorMessage ?? "Convex error");
  return data.value;
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string | undefined;
  const organizationId = formData.get("organizationId") as string | undefined;
  const inviteToken = formData.get("inviteToken") as string | undefined;

  if (!name || !email || !password) throw new Error("All fields required");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");

  const result = await convexMutation("auth:register", {
    name,
    email,
    password,
    phone: phone || undefined,
    organizationId: organizationId || undefined,
    inviteToken: inviteToken || undefined,
  });

  // If user needs approval, don't auto-login
  if (result.needsApproval) {
    // Still try to link subscription even if pending approval
    if (result.userId) {
      try {
        await convexMutation("subscriptions:linkSubscriptionToUser", {
          email,
          userId: result.userId,
        });
      } catch {
        // Non-critical — subscription linking can fail silently
      }
    }
    return { 
      success: true, 
      role: result.role, 
      needsApproval: true,
      message: "Your account has been created and is pending admin approval. You will be notified once approved."
    };
  }

  // Auto-login after register (for admin users)
  const sessionToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const sessionExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;

  const loginResult = await convexMutation("auth:login", {
    email,
    password, // Convex handles hashing internally
    sessionToken,
    sessionExpiry,
  });

  // Link subscription to user (non-critical, fails silently)
  try {
    await convexMutation("subscriptions:linkSubscriptionToUser", {
      email,
      userId: loginResult.userId,
    });
  } catch {
    // Subscription linking is optional — user can still register
  }

  const jwt = await signJWT({
    userId: loginResult.userId,
    name: loginResult.name,
    email: loginResult.email,
    role: loginResult.role,
    department: loginResult.department,
    position: loginResult.position,
    employeeType: loginResult.employeeType,
    avatar: loginResult.avatarUrl,
  });

  const cookieStore = await cookies();
  cookieStore.set("hr-auth-token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  cookieStore.set("hr-session-token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return { 
    success: true, 
    role: result.role,
    needsApproval: false,
    userId: loginResult.userId,
    name: loginResult.name,
    email: loginResult.email,
    department: loginResult.department,
    position: loginResult.position,
    employeeType: loginResult.employeeType,
    avatar: loginResult.avatarUrl,
  };
}

export async function loginAction(formData: FormData | { email: string; password: string; isFaceLogin?: boolean }) {
  let email: string;
  let password: string;
  let isFaceLogin = false;

  try {
    console.log("🔐 loginAction called with:", formData instanceof FormData ? "FormData" : "Object");
    
    if (formData instanceof FormData) {
      email = formData.get("email") as string;
      password = formData.get("password") as string;
    } else {
      email = formData.email;
      password = formData.password;
      isFaceLogin = formData.isFaceLogin || false;
    }

    console.log("📧 Email:", email);
    console.log("🔑 Has password:", !!password);
    console.log("👤 isFaceLogin:", isFaceLogin);

    // For Face ID login, we don't need password validation
    if (!isFaceLogin && (!email || !password)) {
      throw new Error("Email and password required");
    }

    const sessionToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const sessionExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;

    console.log("📡 Calling Convex mutation auth:login...");
    const result = await convexMutation("auth:login", {
      email,
      password: password || "", // Empty password for Face ID login
      sessionToken,
      sessionExpiry,
      isFaceLogin, // Pass Face ID login flag
    });
    console.log("✅ Convex mutation successful:", result);

    console.log("🔐 Creating JWT...");
    const jwt = await signJWT({
      userId: result.userId,
      name: result.name,
      email: result.email,
      role: result.role,
      department: result.department,
      position: result.position,
      employeeType: result.employeeType,
      avatar: result.avatarUrl,
    });
    console.log("✅ JWT created");

    console.log("🍪 Setting cookies...");
    const cookieStore = await cookies();
    cookieStore.set("hr-auth-token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    cookieStore.set("hr-session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    console.log("✅ Cookies set successfully");

    return {
      success: true,
      userId: result.userId,
      name: result.name,
      email: result.email,
      role: result.role,
      department: result.department,
      position: result.position,
      employeeType: result.employeeType,
      avatar: result.avatarUrl,
      travelAllowance: result.travelAllowance,
    };
  } catch (error: any) {
    console.error("❌ Error in loginAction:", error);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    throw error;
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("hr-session-token")?.value;
  const jwt = cookieStore.get("hr-auth-token")?.value;

  if (jwt) {
    try {
      const payload = await verifyJWT(jwt);
      if (payload && sessionToken) {
        await convexMutation("auth:logout", { userId: payload.userId });
      }
    } catch {}
  }

  cookieStore.delete("hr-auth-token");
  cookieStore.delete("hr-session-token");
}

export async function getSessionAction() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("hr-auth-token")?.value;
  if (!jwt) return null;
  return await verifyJWT(jwt);
}

export async function updateSessionProfileAction(userId: string, name: string, email: string) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("hr-auth-token")?.value;
  if (!jwt) throw new Error("Not authenticated");

  const payload = await verifyJWT(jwt);
  if (!payload || payload.userId !== userId) throw new Error("Unauthorized");

  const newJwt = await signJWT({
    userId: payload.userId,
    name,
    email,
    role: payload.role,
    department: payload.department,
    position: payload.position,
    employeeType: payload.employeeType,
    avatar: payload.avatar,
  });

  cookieStore.set("hr-auth-token", newJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return { success: true };
}

export async function updateSessionAvatarAction(userId: string, avatarUrl: string) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("hr-auth-token")?.value;
  if (!jwt) throw new Error("Not authenticated");

  const payload = await verifyJWT(jwt);
  if (!payload || payload.userId !== userId) throw new Error("Unauthorized");

  // Update JWT with new avatar
  const newJwt = await signJWT({
    userId: payload.userId,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    department: payload.department,
    position: payload.position,
    employeeType: payload.employeeType,
    avatar: avatarUrl,
  });

  cookieStore.set("hr-auth-token", newJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return { success: true, avatar: avatarUrl };
}
