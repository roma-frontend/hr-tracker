'use client';

import { useRef, useEffect, useState } from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  accentColor: string;
  delay?: number;
  badge?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  gradient,
  accentColor,
  delay = 0,
  badge,
}: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1, rootMargin: '-40px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative group cursor-default card-reveal"
      style={{
        perspective: '1000px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) rotateX(0deg)' : 'translateY(50px) rotateX(8deg)',
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {/* Glow on hover — CSS only */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl -z-10"
        style={{ background: gradient }}
        aria-hidden="true"
      />

      {/* Glass card */}
      <div
        className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden h-full"
        style={{ transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)' }}
      >
        {/* Top shimmer border */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`, opacity: 0.6 }}
          aria-hidden="true"
        />

        {/* Gradient mesh on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ background: gradient }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative p-7 flex flex-col gap-4 h-full">
          {/* Badge — CSS pulse */}
          {badge && (
            <span
              className="self-start text-xs font-semibold px-3 py-1 rounded-full border badge-pulse"
              style={{
                borderColor: `${accentColor}40`,
                backgroundColor: `${accentColor}15`,
                color: accentColor,
              }}
            >
              {badge}
            </span>
          )}

          {/* Icon container — CSS wiggle on hover */}
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
            style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
          >
            <div style={{ color: accentColor }}>{icon}</div>
          </div>

          {/* Text */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2 transition-colors">
              {title}
            </h3>
            <p className="text-[#f7e7ce]/60 text-sm leading-relaxed group-hover:text-[#f7e7ce]/80 transition-colors">
              {description}
            </p>
          </div>

          {/* Hover arrow — CSS slide-in */}
          <div
            className="mt-auto flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300"
            style={{ color: accentColor }}
          >
            <span>Learn more</span>
            <span className="arrow-bounce">→</span>
          </div>
        </div>

        {/* Corner glow decoration */}
        <div
          className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-25 transition-opacity duration-700"
          style={{ background: accentColor }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
