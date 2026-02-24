import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    // Request reset token from Convex
    const result = await convexMutation("auth:requestPasswordReset", { email });

    // If user not found, still return success (security)
    if (!result.token) {
      return NextResponse.json({ success: true });
    }

    const resetLink = `${APP_URL}/reset-password?token=${result.token}`;

    // Send email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "HR Office <onboarding@resend.dev>",
        to: result.email,
        subject: "Reset your HR Office password",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f14; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto;">
              <!-- Logo -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 12px 20px; border-radius: 12px;">
                  <span style="color: white; font-weight: 700; font-size: 18px;">🏢 HR Office</span>
                </div>
              </div>

              <!-- Card -->
              <div style="background: #1a1a2e; border: 1px solid rgba(99,102,241,0.2); border-radius: 16px; padding: 40px 36px;">
                <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Reset your password</h1>
                <p style="color: #9ca3af; font-size: 15px; margin: 0 0 28px; line-height: 1.5;">
                  Hi ${result.name},<br><br>
                  We received a request to reset your password. Click the button below to choose a new one.
                </p>

                <!-- Button -->
                <a href="${resetLink}" style="display: block; text-align: center; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
                  Reset Password →
                </a>

                <!-- Warning -->
                <div style="background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.15); border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
                  <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.5;">
                    ⏱️ This link expires in <strong style="color: #a5b4fc;">1 hour</strong>.<br>
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </div>

                <!-- Link fallback -->
                <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.6;">
                  If the button doesn't work, copy and paste this link:<br>
                  <a href="${resetLink}" style="color: #6366f1; word-break: break-all;">${resetLink}</a>
                </p>
              </div>

              <!-- Footer -->
              <p style="text-align: center; color: #4b5563; font-size: 12px; margin-top: 24px;">
                © ${new Date().getFullYear()} HR Office • Leave Monitoring System
              </p>
            </div>
          </body>
          </html>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
