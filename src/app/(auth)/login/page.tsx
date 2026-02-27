"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2, Fingerprint, AlertCircle, Building2, ScanFace } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { WebAuthnButton } from "@/components/auth/WebAuthnButton";
import { FaceLogin } from "@/components/auth/FaceLogin";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loginMode, setLoginMode] = useState<"email" | "face">("email");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.append("email", formData.email);
    fd.append("password", formData.password);

    startTransition(async () => {
      try {
        console.log("🔐 Attempting login...");
        const result = await loginAction(fd);
        console.log("✅ Login successful, result:", result);
        
        const userData = {
          id: result.userId,
          name: result.name,
          email: result.email,
          role: result.role,
          department: result.department,
          position: result.position,
          employeeType: result.employeeType,
          avatar: result.avatar,
        };
        
        console.log("💾 Saving user to store:", userData);
        login(userData);
        
        // Verify it was saved
        setTimeout(() => {
          const stored = localStorage.getItem('hr-auth-storage');
          console.log("🔍 Verification - localStorage:", stored);
        }, 100);
        
        toast.success(`Welcome back, ${result.name}! 👋`);
        router.push("/dashboard");
      } catch (err) {
        console.error("❌ Login failed:", err);
        setError(err instanceof Error ? err.message : "Login failed");
      }
    });
  };

  const handleWebAuthnSuccess = (credentialId: string) => {
    // For demo: redirect to dashboard after biometric
    toast.success("Biometric login successful!");
    router.push("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--background)" }}
    >
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #2563eb, transparent)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #0ea5e9, transparent)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-2xl border"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)" }}
            >
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Welcome back
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Sign in to HR Office Leave Monitor
            </p>
          </div>

          {/* Login Mode Tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: "var(--muted)" }}>
            <button
              type="button"
              onClick={() => setLoginMode("email")}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                loginMode === "email" ? "shadow-sm" : ""
              }`}
              style={{
                background: loginMode === "email" ? "var(--background)" : "transparent",
                color: loginMode === "email" ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMode("face")}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                loginMode === "face" ? "shadow-sm" : ""
              }`}
              style={{
                background: loginMode === "face" ? "var(--background)" : "transparent",
                color: loginMode === "face" ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              <ScanFace className="w-4 h-4 inline mr-2" />
              Face ID
            </button>
          </div>

          {/* Face ID Login */}
          {loginMode === "face" && (
            <div className="mb-6">
              <FaceLogin />
            </div>
          )}

          {/* Email Login */}
          {loginMode === "email" && (
            <>
              {/* WebAuthn */}
              <div className="mb-6">
                <WebAuthnButton mode="login" onSuccess={handleWebAuthnSuccess} />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  or continue with email
                </span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>
            </>
          )}

          {/* Form - Only show for email mode */}
          {loginMode === "email" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    background: "var(--input)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs hover:underline"
                  style={{ color: "#2563eb" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    background: "var(--input)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl text-sm"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isPending}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)" }}
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>
          )}

          {/* Footer */}
          <div className="text-center mt-6 space-y-3">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold hover:underline" style={{ color: "#2563eb" }}>
                Join existing team
              </Link>
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>
            <Link href="/register-org">
              <button
                className="text-sm font-semibold hover:underline"
                style={{ color: "#10b981" }}
              >
                🏢 Create New Organization
              </button>
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-4">
          <Link href="/" className="text-sm hover:underline" style={{ color: "var(--text-muted)" }}>
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
