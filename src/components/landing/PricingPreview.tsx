'use client';

import { useRef, useEffect, useState } from 'react';
import { Check, Zap, Building2, Rocket, Sparkles, ArrowRight, Shield, Star, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSubscription } from '@/hooks/useSubscription';

// ── Types ─────────────────────────────────────────────────────────────────────
interface PricingTier {
  id: string;
  name: string;
  price: string;
  priceMonthly?: number;
  description: string;
  icon: React.ReactNode;
  features: string[];
  buttonText: string;
  popular?: boolean;
  badge?: string;
  accentFrom: string;
  accentTo: string;
  glowColor: string;
}

// ── Plans ─────────────────────────────────────────────────────────────────────
const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    priceMonthly: 0,
    description: 'Perfect for small teams getting started',
    icon: <Zap size={22} />,
    features: [
      'Up to 50 employees',
      'Basic leave management',
      'Time tracking',
      'Employee profiles',
      'Email notifications',
      'Community support',
    ],
    buttonText: 'Start Free Trial',
    accentFrom: '#10b981',
    accentTo: '#059669',
    glowColor: 'rgba(16,185,129,0.35)',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$49',
    priceMonthly: 49,
    description: 'For growing teams with advanced needs',
    icon: <Building2 size={22} />,
    features: [
      'Up to 200 employees',
      'Everything in Starter',
      'Advanced analytics',
      'Custom workflows',
      'Priority support',
      'API access',
      'Integrations',
    ],
    buttonText: 'Start Free Trial',
    popular: true,
    badge: 'Most Popular',
    accentFrom: '#3b82f6',
    accentTo: '#2563eb',
    glowColor: 'rgba(59,130,246,0.4)',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'Tailored for large organizations',
    icon: <Rocket size={22} />,
    features: [
      'Unlimited employees',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations',
      '24/7 phone support',
      'SLA guarantee',
      'On-premise option',
    ],
    buttonText: 'Contact Sales',
    accentFrom: '#0ea5e9',
    accentTo: '#06b6d4',
    glowColor: 'rgba(14,165,233,0.35)',
  },
];

// ── Reveal hook ───────────────────────────────────────────────────────────────
function useReveal(delay = '0s') {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: '-30px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(48px) scale(0.97)',
      transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}`,
    },
  };
}

// ── PricingCard ───────────────────────────────────────────────────────────────
function PricingCard({ tier, delay, currentPlan }: { tier: PricingTier; delay: number; currentPlan?: string }) {
  const { ref, style } = useReveal(`${delay}s`);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isCurrentPlan = currentPlan === tier.id;

  const handleCheckout = async () => {
    if (tier.id === 'enterprise') {
      window.location.href = '/contact';
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: tier.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error('[Stripe]', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={ref}
      style={style}
      className={`relative group flex flex-col ${tier.popular ? 'md:-mt-4 md:mb-4' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute -top-5 inset-x-0 flex justify-center z-20">
          <div
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg"
            style={{ background: `linear-gradient(90deg, ${tier.accentFrom}, ${tier.accentTo})`, boxShadow: `0 4px 20px ${tier.glowColor}` }}
          >
            <Star size={11} fill="currentColor" />
            {tier.badge}
          </div>
        </div>
      )}

      {/* Glow effect */}
      <div
        className="absolute -inset-px rounded-3xl transition-opacity duration-500 -z-10 blur-2xl"
        style={{
          background: `radial-gradient(ellipse at center, ${tier.glowColor}, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Card border gradient */}
      <div
        className="absolute -inset-px rounded-3xl -z-[1] transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${tier.accentFrom}55, ${tier.accentTo}22, transparent)`,
          opacity: hovered || tier.popular ? 1 : 0.4,
        }}
      />

      {/* Main card */}
      <div
        className={`relative h-full rounded-3xl flex flex-col overflow-hidden
          ${tier.popular
            ? 'border border-white/20 bg-gradient-to-b from-white/[0.08] to-white/[0.03]'
            : 'border border-white/[0.08] bg-white/[0.03]'}
          backdrop-blur-xl transition-transform duration-500
          ${hovered ? '-translate-y-2' : 'translate-y-0'}
        `}
      >
        {/* Top accent line */}
        <div
          className="h-[2px] w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${tier.accentFrom}, ${tier.accentTo}, transparent)` }}
        />

        <div className="p-8 flex flex-col flex-1">
          {/* Icon + name */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${tier.accentFrom}33, ${tier.accentTo}22)`,
                  border: `1px solid ${tier.accentFrom}44`,
                  boxShadow: `0 8px 24px ${tier.glowColor}`,
                  color: tier.accentFrom,
                }}
              >
                {tier.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{tier.name}</h3>
              <p className="text-blue-200/50 text-sm mt-1">{tier.description}</p>
            </div>
          </div>

          {/* Price */}
          <div className="mb-8">
            <div className="flex items-end gap-2">
              <span
                className="text-5xl font-black leading-none"
                style={{ background: `linear-gradient(135deg, #fff 60%, ${tier.accentFrom})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                {tier.price}
              </span>
              {tier.priceMonthly !== undefined && (
                <span className="text-blue-200/40 text-sm pb-1.5">/month</span>
              )}
            </div>
            {tier.priceMonthly !== undefined && tier.priceMonthly >= 0 && (
              <p className="text-blue-200/40 text-xs mt-2 flex items-center gap-1.5">
                <Shield size={11} />
                14-day free trial · No credit card required
              </p>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8 flex-1">
            {tier.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${tier.accentFrom}22`, border: `1px solid ${tier.accentFrom}44` }}
                >
                  <Check size={11} style={{ color: tier.accentFrom }} />
                </div>
                <span className="text-blue-100/70 text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <button
            onClick={handleCheckout}
            disabled={loading || isCurrentPlan}
            className={`relative w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group/btn
              ${loading || isCurrentPlan ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}
            `}
            style={tier.popular || isCurrentPlan ? {
              background: `linear-gradient(135deg, ${tier.accentFrom}, ${tier.accentTo})`,
              boxShadow: `0 8px 32px ${tier.glowColor}`,
              color: '#fff',
            } : {
              background: `${tier.accentFrom}15`,
              border: `1px solid ${tier.accentFrom}33`,
              color: '#e0e7ff',
            }}
          >
            {/* Shimmer effect */}
            {!loading && !isCurrentPlan && (
              <div
                className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            )}
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isCurrentPlan ? (
              <>
                <CheckCircle2 size={15} />
                Current Plan
              </>
            ) : (
              <>
                <Sparkles size={15} />
                {tier.buttonText}
                <ArrowRight size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function PricingPreview() {
  const { ref, style } = useReveal();
  const { user } = useAuthStore();
  const { plan } = useSubscription();
  
  // Only show current plan if user is logged in
  const currentPlan = user ? plan : undefined;

  return (
    <section id="pricing" className="relative z-10 px-6 md:px-12 py-24 overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div ref={ref} className="text-center mb-20" style={style}>
        <span className="section-eyebrow">Pricing</span>
        <h2 className="mt-3 text-3xl md:text-5xl font-black text-white leading-tight">
          Exclusive,{' '}
          <span className="heading-gradient">transparent pricing</span>
        </h2>
        <p className="mt-4 text-blue-200/60 max-w-2xl mx-auto text-lg">
          Choose the plan that&apos;s right for your organization.{' '}
          <span className="text-blue-300/80">All plans include a 14-day free trial.</span>
        </p>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
          {[
            { icon: <Shield size={14} />, text: 'SSL Secured' },
            { icon: <Check size={14} />, text: 'No setup fees' },
            { icon: <Zap size={14} />, text: 'Cancel anytime' },
            { icon: <Star size={14} />, text: 'GDPR compliant' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-blue-200/50 text-sm">
              <span className="text-blue-400/70">{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start pt-6">
        {pricingTiers.map((tier, i) => (
          <PricingCard key={tier.id} tier={tier} delay={i * 0.12} currentPlan={currentPlan} />
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-blue-200/30 text-sm mt-14 flex items-center justify-center gap-2">
        <Shield size={13} className="text-blue-400/40" />
        All plans include SSL security, premium backups, and GDPR compliance.
        Payments powered by{' '}
        <span className="text-blue-300/50 font-semibold">Stripe</span>.
      </p>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </section>
  );
}
