import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | HR Office",
  description: "HR Office Privacy Policy - How we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-widest">Legal</span>
          <h1 className="text-4xl font-black text-white mt-2 mb-4">Privacy Policy</h1>
          <p className="text-white/50 text-sm">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>HR Office collects information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Account information (name, email, role, department)</li>
              <li>Attendance data (check-in/out times, location if enabled)</li>
              <li>Face recognition data for biometric check-in (stored as encrypted vectors only)</li>
              <li>Leave requests and approvals</li>
              <li>Task assignments and progress</li>
              <li>Profile photos uploaded to Cloudinary</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Provide, maintain, and improve HR Office services</li>
              <li>Process attendance tracking and leave management</li>
              <li>Send notifications about tasks, leaves, and attendance</li>
              <li>Generate analytics and reports for administrators</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-bold text-white mb-3">3. Cookies</h2>
            <p>We use cookies and similar tracking technologies to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Maintain your session and authentication state</li>
              <li>Remember your preferences (theme, language)</li>
              <li>Analyze usage patterns to improve the platform</li>
            </ul>
            <p className="mt-3">You can control cookies through your browser settings. Disabling cookies may affect platform functionality.</p>
          </section>

          <section id="gdpr">
            <h2 className="text-xl font-bold text-white mb-3">4. GDPR Compliance</h2>
            <p>For users in the European Economic Area, you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li><strong className="text-white">Right of Access</strong> - Request a copy of your personal data</li>
              <li><strong className="text-white">Right to Rectification</strong> - Correct inaccurate data</li>
              <li><strong className="text-white">Right to Erasure</strong> - Request deletion of your data</li>
              <li><strong className="text-white">Right to Portability</strong> - Receive your data in a portable format</li>
              <li><strong className="text-white">Right to Object</strong> - Object to processing of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>End-to-end encryption for sensitive data</li>
              <li>Secure HTTPS connections (TLS 1.3)</li>
              <li>Convex database with row-level security</li>
              <li>Face recognition data stored as non-reversible vectors</li>
              <li>Regular security audits and penetration testing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Retention</h2>
            <p>We retain your data for as long as your account is active. Upon account deletion, your data is permanently deleted within 30 days, except where required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contact Us</h2>
            <p>For privacy-related inquiries, contact us at:</p>
            <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-indigo-400 font-medium">privacy@hroffice.app</p>
              <p className="text-white/50 text-sm mt-1">We respond to all requests within 48 hours.</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex gap-4">
          <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">Terms of Service</Link>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
