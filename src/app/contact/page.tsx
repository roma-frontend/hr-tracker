'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import {
  Building2, Mail, MessageSquare, Users, ArrowRight,
  CheckCircle, ChevronLeft, Shield, Zap, Star, Phone,
  Globe, Clock,
} from 'lucide-react';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const TEAM_SIZES = ['1–10', '11–50', '51–200', '201–500', '500+'];

const ENTERPRISE_FEATURES = [
  { icon: <Users size={18} />,   text: '100+ employees supported' },
  { icon: <Shield size={18} />,  text: 'Dedicated security review' },
  { icon: <Zap size={18} />,     text: 'Custom integrations & API' },
  { icon: <Star size={18} />,    text: 'Priority 24/7 support' },
  { icon: <Globe size={18} />,   text: 'On-premise deployment option' },
  { icon: <Clock size={18} />,   text: '99.99% uptime SLA' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', teamSize: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setError('Please fill in all required fields.'); return; }
    setLoading(true); setError('');
    try {
      await convex.mutation(api.subscriptions.saveContactInquiry, {
        name:     form.name,
        email:    form.email,
        company:  form.company || undefined,
        teamSize: form.teamSize || undefined,
        message:  form.message,
        plan:     'enterprise',
      });
      setSent(true);
    } catch (e: any) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/4 rounded-full blur-[160px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">

        {/* Back link */}
        <Link href="/#pricing" className="inline-flex items-center gap-2 text-blue-400/70 hover:text-blue-300 text-sm mb-12 transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Pricing
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ── Left — Info ─────────────────────────────────────────────────── */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-6">
              <Building2 size={12} />
              Enterprise Plan
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              Let's build something{' '}
              <span style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                great together
              </span>
            </h1>

            <p className="text-blue-200/60 text-lg leading-relaxed mb-10">
              Get a custom plan tailored to your organization's needs.
              Our team will reach out within <strong className="text-blue-300/80">24 hours</strong> to
              schedule a personalized demo.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
              {ENTERPRISE_FEATURES.map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(99,102,241,0.1))', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8' }}>
                    {icon}
                  </div>
                  <span className="text-blue-100/70 text-sm">{text}</span>
                </div>
              ))}
            </div>

            {/* Contact info */}
            <div className="space-y-4">
              <p className="text-blue-200/40 text-xs uppercase tracking-widest font-semibold mb-3">Or reach us directly</p>
              {[
                { icon: <Mail size={15} />, label: 'sales@hrleave.io', href: 'mailto:sales@hrleave.io' },
                { icon: <Phone size={15} />, label: '+1 (800) 555-0199', href: 'tel:+18005550199' },
              ].map(({ icon, label, href }) => (
                <a key={label} href={href}
                  className="flex items-center gap-3 text-blue-300/60 hover:text-blue-200 transition-colors text-sm">
                  <span className="text-blue-400/50">{icon}</span>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Right — Form ─────────────────────────────────────────────────── */}
          <div className="relative">
            {/* Card glow */}
            <div className="absolute -inset-1 rounded-3xl blur-2xl opacity-30"
              style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)' }} />

            <div className="relative rounded-3xl border border-white/[0.1] overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))' }}>

              {/* Top accent */}
              <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #38bdf8, #6366f1, transparent)' }} />

              <div className="p-8 md:p-10">
                {sent ? (
                  /* ── Success state ── */
                  <div className="flex flex-col items-center text-center py-8 gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl scale-150" />
                      <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 16px 48px rgba(34,197,94,0.3)' }}>
                        <CheckCircle size={40} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Message received! 🎉</h2>
                      <p className="text-blue-200/60 text-sm leading-relaxed">
                        Thanks, <strong className="text-blue-200">{form.name}</strong>! Our sales team
                        will reach out to <strong className="text-blue-200">{form.email}</strong> within 24 hours.
                      </p>
                    </div>
                    <Link href="/"
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)', boxShadow: '0 8px 24px rgba(56,189,248,0.25)' }}>
                      Back to Home <ArrowRight size={15} />
                    </Link>
                  </div>
                ) : (
                  /* ── Form ── */
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">Contact Sales</h2>
                      <p className="text-blue-200/50 text-sm">Fill in the form and we'll be in touch shortly.</p>
                    </div>

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Full Name *" icon={<Users size={14} />}>
                        <input
                          type="text" placeholder="John Smith" required
                          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full bg-transparent text-white placeholder-blue-200/25 text-sm outline-none"
                        />
                      </Field>
                      <Field label="Work Email *" icon={<Mail size={14} />}>
                        <input
                          type="email" placeholder="john@company.com" required
                          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full bg-transparent text-white placeholder-blue-200/25 text-sm outline-none"
                        />
                      </Field>
                    </div>

                    {/* Company + Team size */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Company" icon={<Building2 size={14} />}>
                        <input
                          type="text" placeholder="Acme Corp"
                          value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                          className="w-full bg-transparent text-white placeholder-blue-200/25 text-sm outline-none"
                        />
                      </Field>
                      <Field label="Team Size" icon={<Users size={14} />}>
                        <select
                          value={form.teamSize} onChange={e => setForm(f => ({ ...f, teamSize: e.target.value }))}
                          className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
                          style={{ colorScheme: 'dark' }}
                        >
                          <option value="" className="bg-[#0f172a]">Select size</option>
                          {TEAM_SIZES.map(s => <option key={s} value={s} className="bg-[#0f172a]">{s} employees</option>)}
                        </select>
                      </Field>
                    </div>

                    {/* Message */}
                    <Field label="Message *" icon={<MessageSquare size={14} />}>
                      <textarea
                        placeholder="Tell us about your requirements, current challenges, or any specific features you need..."
                        required rows={4}
                        value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        className="w-full bg-transparent text-white placeholder-blue-200/25 text-sm outline-none resize-none"
                      />
                    </Field>

                    {error && (
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                        {error}
                      </p>
                    )}

                    <button
                      type="submit" disabled={loading}
                      className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)', boxShadow: '0 8px 32px rgba(56,189,248,0.25)' }}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <MessageSquare size={16} />
                          Send Message
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>

                    <p className="text-center text-blue-200/30 text-xs flex items-center justify-center gap-1.5">
                      <Shield size={11} />
                      Your data is encrypted and never shared.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-blue-200/50 text-xs font-medium mb-2">
        <span className="text-blue-400/60">{icon}</span>
        {label}
      </label>
      <div className="px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus-within:border-blue-500/40 focus-within:bg-white/[0.06] transition-all">
        {children}
      </div>
    </div>
  );
}
