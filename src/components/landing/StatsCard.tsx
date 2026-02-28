'use client';

import { useEffect, useRef, useState } from 'react';

interface StatsCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

export default function StatsCard({ value, label, icon, color, delay = 0 }: StatsCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15, rootMargin: '-30px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const numericMatch = value.match(/^(\d+)/);
  const numericTarget = numericMatch ? parseInt(numericMatch[1]) : 0;
  const suffix = value.replace(/^\d+/, '');
  const count = useCountUp(numericTarget, 2000, visible);

  return (
    <div
      ref={ref}
      className="relative group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.9)',
        transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
        style={{ background: color }}
        aria-hidden="true"
      />

      {/* Card — CSS lift on hover */}
      <div
        className="relative rounded-2xl border backdrop-blur-xl p-6 flex flex-col items-center text-center gap-3 overflow-hidden group-hover:-translate-y-2 group-hover:scale-[1.03] transition-transform duration-300"
        style={{
          borderColor: 'var(--landing-card-border)',
          backgroundColor: 'var(--landing-card-bg)'
        }}
      >
        {/* Shimmer top border */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${color.replace('0.15', '0.8')}, transparent)` }}
          aria-hidden="true"
        />

        {/* Icon — CSS wiggle */}
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl logo-spin"
          style={{ background: color }}
          aria-hidden="true"
        >
          {icon}
        </div>

        {/* Count-up number */}
        <div className="text-3xl font-bold tracking-tight tabular-nums" style={{ color: 'var(--landing-text-primary)' }}>
          {numericTarget > 0 ? `${count}${suffix}` : value}
        </div>

        {/* Label */}
        <div className="text-sm font-medium" style={{ color: 'var(--landing-text-muted)' }}>{label}</div>

        {/* Corner glow */}
        <div
          className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-2xl"
          style={{ background: color }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
