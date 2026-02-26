import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | HR Office",
  description: "HR Office Terms of Service - Rules and conditions for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">Legal</span>
          <h1 className="text-4xl font-black text-white mt-2 mb-4">Terms of Service</h1>
          <p className="text-white/50 text-sm">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using HR Office, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Use of Services</h2>
            <p>HR Office provides workforce management tools including:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Real-time attendance tracking with optional face recognition</li>
              <li>Leave management and approval workflows</li>
              <li>Task management with Kanban boards</li>
              <li>Employee analytics and performance ratings</li>
              <li>AI-powered HR assistant</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. User Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring accurate information is provided</li>
              <li>Complying with applicable laws and regulations</li>
              <li>Not attempting to access unauthorized areas of the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Administrator Responsibilities</h2>
            <p>Administrators are responsible for:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Managing user access and permissions appropriately</li>
              <li>Ensuring employee consent for face recognition features</li>
              <li>Complying with local labor laws and data protection regulations</li>
              <li>Properly configuring work schedules and leave policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Intellectual Property</h2>
            <p>All content, features, and functionality of HR Office are owned by HR Office and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any part of our platform without written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Limitation of Liability</h2>
            <p>HR Office shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the platform, including but not limited to loss of data, business interruption, or loss of profits.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Service Availability</h2>
            <p>We strive for 99.9% uptime but cannot guarantee uninterrupted service. We reserve the right to modify, suspend, or discontinue services with reasonable notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Termination</h2>
            <p>We reserve the right to terminate or suspend access to our services immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. We will notify users of significant changes via email or in-app notification. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Contact</h2>
            <p>For questions about these Terms of Service:</p>
            <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-blue-400 font-medium">legal@hroffice.app</p>
              <p className="text-white/50 text-sm mt-1">We respond to all inquiries within 48 hours.</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex gap-4">
          <Link href="/privacy" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">Privacy Policy</Link>
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
