'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  dx: number;
}

const COLORS = [
  'rgba(96, 165, 250, 0.6)',
  'rgba(167, 139, 250, 0.6)',
  'rgba(52, 211, 153, 0.4)',
  'rgba(251, 191, 36, 0.3)',
  'rgba(248, 113, 113, 0.3)',
  'rgba(129, 140, 248, 0.5)',
];

// Fixed seed-based pseudo-random to avoid hydration mismatch
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom(i * 7) * 100,
    y: seededRandom(i * 13) * 100,
    size: seededRandom(i * 3) * 4 + 1,
    duration: seededRandom(i * 5) * 20 + 15,
    delay: seededRandom(i * 11) * 10,
    color: COLORS[Math.floor(seededRandom(i * 17) * COLORS.length)],
    dx: seededRandom(i * 19) * 40 - 20,
  }));
}

const ORB_SIZES = [5, 7, 4, 8, 6, 5, 7, 4];

export default function FloatingParticles() {
  const [mounted, setMounted] = useState(false);
  const [isReduced, setIsReduced] = useState(false);
  
  useEffect(() => { 
    setMounted(true);
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(mediaQuery.matches);
  }, []);

  const particles = generateParticles(isReduced ? 20 : 60);

  if (!mounted || isReduced) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, p.dx, 0],
            opacity: [0, 1, 0.6, 1, 0],
            scale: [0.5, 1.2, 0.8, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Larger glowing orbs */}
      {ORB_SIZES.map((size, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 30}%`,
            width: size,
            height: size,
            background: i % 2 === 0
              ? 'radial-gradient(circle, rgba(96,165,250,0.8), transparent)'
              : 'radial-gradient(circle, rgba(167,139,250,0.8), transparent)',
          }}
          animate={{
            y: [0, -120, -60, 0],
            x: [0, 30, -20, 0],
            opacity: [0.3, 0.9, 0.5, 0.3],
          }}
          transition={{
            duration: 18 + i * 3,
            delay: i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
