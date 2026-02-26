'use client';

import { useState, useRef, useEffect } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, visible } = useReveal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { toast.error('Please enter a valid email address'); return; }
    setIsLoading(true);
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    }, 1000);
  };

  return (
    <section className="relative z-10 px-6 md:px-12 py-20">
      <div
        ref={ref}
        className="relative max-w-3xl mx-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
          transition: 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-blue-600/15 to-slate-400/10 rounded-3xl blur-3xl" aria-hidden="true" />

        <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-12 text-center overflow-hidden">
          {/* Static orb — CSS pulse instead of JS animate */}
          <div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-blue-500/25 to-blue-600/20 blur-3xl orb-pulse-1"
            aria-hidden="true"
          />

          {/* Icon — CSS float */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 animate-float">
            <Mail size={28} className="text-white" />
          </div>

          <h3 className="text-2xl md:text-4xl font-black text-white mb-4">
            Stay in the loop
          </h3>
          <p className="text-blue-300/70 text-lg mb-8 max-w-xl mx-auto">
            Get the latest updates on HR trends, premium features, and exclusive insights delivered to your inbox.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-blue-500/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                disabled={isLoading}
                aria-label="Email address"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="cta-btn-primary px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-300 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><span>Subscribe</span><ArrowRight size={18} /></>
                )}
              </button>
            </form>
          ) : (
            /* CSS fade-in on success */
            <div className="flex items-center justify-center gap-3 text-blue-400 font-semibold success-reveal">
              <CheckCircle2 size={24} />
              <span>You&apos;re subscribed! Check your inbox.</span>
            </div>
          )}

          <p className="text-xs text-blue-300/40 mt-6">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
