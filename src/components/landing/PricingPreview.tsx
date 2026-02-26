'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Zap, Building2, Rocket } from 'lucide-react';
import Link from 'next/link';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  gradient: string;
  buttonText: string;
  popular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for small teams',
    icon: <Zap size={24} />,
    features: [
      'Up to 50 employees',
      'Basic leave tracking',
      'Email notifications',
      'Mobile app access',
      'Standard support',
    ],
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(129,140,248,0.06))',
    buttonText: 'Start Free Trial',
  },
  {
    name: 'Professional',
    price: '$79',
    description: 'For growing businesses',
    icon: <Building2 size={24} />,
    features: [
      'Up to 200 employees',
      'Advanced analytics',
      'Custom leave policies',
      'API access',
      'Priority support',
      'Slack integration',
    ],
    gradient: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(99,102,241,0.1))',
    buttonText: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    icon: <Rocket size={24} />,
    features: [
      'Unlimited employees',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations',
      '24/7 phone support',
      'SLA guarantee',
    ],
    gradient: 'linear-gradient(135deg, rgba(129,140,248,0.12), rgba(99,102,241,0.06))',
    buttonText: 'Contact Sales',
  },
];

function PricingCard({ tier, delay }: { tier: PricingTier; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative group ${tier.popular ? 'md:scale-105 md:z-10' : ''}`}
    >
      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#6366f1]/30 z-20">
          Most Popular
        </div>
      )}

      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
        style={{ background: tier.gradient }}
      />

      {/* Card */}
      <div className={`relative h-full rounded-2xl border ${tier.popular ? 'border-[#6366f1]/30' : 'border-white/10'} bg-white/5 backdrop-blur-xl p-8 flex flex-col`}>
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
          style={{ background: tier.gradient }}
        >
          <div className="text-white">{tier.icon}</div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
        <p className="text-[#e2e8f0]/60 text-sm mb-6">{tier.description}</p>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-white">{tier.price}</span>
            {tier.price !== 'Custom' && (
              <span className="text-[#e2e8f0]/50 text-sm">/month</span>
            )}
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-1">
          {tier.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check size={18} className="text-[#6366f1] flex-shrink-0 mt-0.5" />
              <span className="text-[#e2e8f0]/80 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link href={tier.price === 'Custom' ? '/contact' : '/register'}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3.5 rounded-xl font-bold transition-all ${
              tier.popular
                ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-lg shadow-[#6366f1]/40'
                : 'bg-[#6366f1]/10 text-[#e2e8f0] border border-[#6366f1]/20 hover:bg-[#6366f1]/15'
            }`}
          >
            {tier.buttonText}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function PricingPreview() {
  return (
    <section id="pricing" className="relative z-10 px-6 md:px-12 py-20">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <span className="text-xs text-[#818cf8] font-semibold uppercase tracking-widest">
          Pricing
        </span>
        <h2 className="mt-3 text-3xl md:text-5xl font-black text-white leading-tight">
          Simple,{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            transparent pricing
          </span>
        </h2>
        <p className="mt-4 text-[#e2e8f0]/60 max-w-2xl mx-auto text-lg">
          Choose the plan that's right for your organization. All plans include a 14-day free trial.
        </p>
      </motion.div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto pt-8">
        {pricingTiers.map((tier, i) => (
          <PricingCard key={tier.name} tier={tier} delay={i * 0.15} />
        ))}
      </div>

      {/* Additional info */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-center text-[#e2e8f0]/50 text-sm mt-10"
      >
        All plans include SSL security, premium backups, and GDPR compliance.
      </motion.p>
    </section>
  );
}
