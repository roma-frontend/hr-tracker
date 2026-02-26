'use client';

// Pure CSS floating particles — replaces 23 framer-motion animated divs
// that were causing continuous JS-driven repaints on the GPU compositor thread.
// CSS animations run entirely on the compositor — zero JS runtime cost.

// Seeded values so SSR and client render identically (no hydration mismatch)
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const PARTICLE_COUNT = 12; // Reduced from 23 total (15 particles + 8 orbs)

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  left: seededRandom(i * 7) * 100,
  top: seededRandom(i * 13) * 100,
  size: Math.round(seededRandom(i * 3) * 4 + 1),
  duration: Math.round(seededRandom(i * 5) * 20 + 15),
  delay: -(seededRandom(i * 11) * 10), // negative delay = pre-started animation
  color: i % 3 === 0
    ? 'rgba(96,165,250,0.6)'
    : i % 3 === 1
    ? 'rgba(167,139,250,0.5)'
    : 'rgba(52,211,153,0.4)',
  animClass: `particle-float-${(i % 3) + 1}`,
}));

export default function FloatingParticles() {
  // No useEffect/useState needed — pure CSS, no hydration issues
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0, contain: 'strict' }}
      aria-hidden="true"
    >
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${p.animClass}`}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}
