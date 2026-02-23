'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

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
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="relative group cursor-default"
      style={{ perspective: '1000px' }}
    >
      {/* Animated glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl -z-10"
        style={{ background: gradient }}
      />

      {/* Glass card */}
      <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden h-full">
        {/* Top shimmer border */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            opacity: 0.6,
          }}
        />

        {/* Gradient mesh background */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ background: gradient }}
        />

        {/* Content */}
        <div className="relative p-7 flex flex-col gap-4 h-full">
          {/* Badge */}
          {badge && (
            <motion.span
              className="self-start text-xs font-semibold px-3 py-1 rounded-full border"
              style={{
                borderColor: `${accentColor}40`,
                backgroundColor: `${accentColor}15`,
                color: accentColor,
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {badge}
            </motion.span>
          )}

          {/* Icon container */}
          <motion.div
            className="flex items-center justify-center w-14 h-14 rounded-2xl"
            style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ color: accentColor }}>{icon}</div>
          </motion.div>

          {/* Text */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">
              {title}
            </h3>
            <p className="text-[#f7e7ce]/60 text-sm leading-relaxed group-hover:text-[#f7e7ce]/80 transition-colors">
              {description}
            </p>
          </div>

          {/* Hover arrow */}
          <motion.div
            className="mt-auto flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ color: accentColor }}
            initial={{ x: -10 }}
            whileInView={{ x: 0 }}
          >
            <span>Learn more</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.div>
        </div>

        {/* Corner decoration */}
        <div
          className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-700"
          style={{ background: accentColor }}
        />
      </div>
    </motion.div>
  );
}
