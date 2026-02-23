'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatsCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return count;
}

export default function StatsCard({ value, label, icon, color, delay = 0 }: StatsCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // Parse numeric portion from value string like "500+", "99%", "24/7"
  const numericMatch = value.match(/^(\d+)/);
  const numericTarget = numericMatch ? parseInt(numericMatch[1]) : 0;
  const suffix = value.replace(/^\d+/, '');
  const count = useCountUp(numericTarget, 2000, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="relative group"
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
        style={{ background: color }}
      />

      {/* Card */}
      <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col items-center text-center gap-3 overflow-hidden">
        {/* Shimmer top border */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${color.replace('0.15', '0.8')}, transparent)` }}
        />

        {/* Icon */}
        <motion.div
          className="flex items-center justify-center w-12 h-12 rounded-xl"
          style={{ background: color }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {icon}
        </motion.div>

        {/* Counter */}
        <div className="text-3xl font-bold text-white tracking-tight">
          {numericTarget > 0 ? `${count}${suffix}` : value}
        </div>

        {/* Label */}
        <div className="text-sm text-blue-200/70 font-medium">{label}</div>

        {/* Background decoration */}
        <div
          className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-2xl"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
}
