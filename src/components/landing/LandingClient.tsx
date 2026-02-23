'use client';

import { Suspense, useRef } from 'react';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Calendar,
  Heart,
  Users,
  Activity,
  Stethoscope,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
} from 'lucide-react';

import FloatingParticles from './FloatingParticles';
import StatsCard from './StatsCard';
import FeatureCard from './FeatureCard';
import { SphereMesh } from './SphereMesh';
import { useAuthStore } from '@/store/useAuthStore';
import { logoutAction } from '@/actions/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

// ─── Stats Data ───────────────────────────────────────────────────────────────
const STATS = [
  {
    value: '500+',
    label: 'Employees Tracked',
    icon: <Users size={22} className="text-white" />,
    color: 'rgba(59,130,246,0.15)',
  },
  {
    value: '99%',
    label: 'Accuracy Rate',
    icon: <CheckCircle2 size={22} className="text-white" />,
    color: 'rgba(167,139,250,0.15)',
  },
  {
    value: '24',
    label: 'Real-time Tracking',
    icon: <Activity size={22} className="text-white" />,
    color: 'rgba(52,211,153,0.15)',
  },
  {
    value: '360',
    label: 'Smart Analytics',
    icon: <BarChart3 size={22} className="text-white" />,
    color: 'rgba(251,191,36,0.15)',
  },
];

// ─── Features Data ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Calendar size={26} />,
    title: 'Vacation Tracking',
    description:
      'Seamlessly manage annual leave requests, approvals, and balances with an intuitive calendar-based interface and instant notifications.',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.08) 100%)',
    accentColor: '#60a5fa',
    badge: 'Most Used',
  },
  {
    icon: <Heart size={26} />,
    title: 'Sick Leave',
    description:
      'Track employee sick days with automated policy enforcement, wellness insights, and HR-friendly reporting to keep your team healthy.',
    gradient: 'linear-gradient(135deg, rgba(248,113,113,0.12) 0%, rgba(239,68,68,0.06) 100%)',
    accentColor: '#f87171',
    badge: 'Policy-Aware',
  },
  {
    icon: <Users size={26} />,
    title: 'Family Leave',
    description:
      'Full support for parental, maternity, and paternity leave with compliance tracking for labor regulations and seamless HR workflows.',
    gradient: 'linear-gradient(135deg, rgba(52,211,153,0.12) 0%, rgba(16,185,129,0.06) 100%)',
    accentColor: '#34d399',
    badge: 'Compliance-Ready',
  },
  {
    icon: <Stethoscope size={26} />,
    title: "Doctor Visits",
    description:
      "Log medical appointments and short absences without dipping into sick leave quotas. Keeps records clean and employees satisfied.",
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.06) 100%)',
    accentColor: '#fbbf24',
    badge: 'New',
  },
];

// ─── Trusted By Logos (text placeholders) ────────────────────────────────────
const TRUSTED = ['Acme Corp', 'GlobalTech', 'NovaSoft', 'Meridian Co.', 'Apex Industries'];

// ─── Gradient Orbs ────────────────────────────────────────────────────────────
function GradientOrbs() {
  return (
    <>
      <motion.div
        className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [1, 1.2, 1], x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [1, 1.1, 1], x: [0, 25, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
    </>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    logout();
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
    >
      {/* Glassmorphism nav background */}
      <div className="absolute inset-0 bg-[#020817]/60 backdrop-blur-xl border-b border-white/5" />

      {/* Logo */}
      <div className="relative flex items-center gap-3">
        <motion.div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Shield size={18} className="text-white" />
        </motion.div>
        <span className="text-white font-bold text-lg tracking-tight">
          HR<span className="text-blue-400">Leave</span>
        </span>
      </div>

      {/* Nav links */}
      <div className="relative hidden md:flex items-center gap-8">
        {['Features', 'Analytics', 'Pricing', 'About'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-sm text-blue-200/70 hover:text-white transition-colors duration-200 font-medium"
          >
            {item}
          </a>
        ))}
      </div>

      {/* Auth buttons / User menu */}
      <div className="relative flex items-center gap-3">
        {user ? (
          // Logged in - show user menu
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all outline-none">
                <Avatar className="w-8 h-8">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                  <AvatarFallback className="text-xs bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-white font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-blue-200/70 capitalize">{user.role}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-blue-200/70 hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-[#020817]/95 backdrop-blur-xl border-white/10"
            >
              <DropdownMenuLabel className="text-blue-200/70 text-xs">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="text-white cursor-pointer hover:bg-white/10 focus:bg-white/10 gap-2"
                onClick={() => router.push('/dashboard')}
              >
                <UserIcon className="w-4 h-4 text-blue-200/70" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-white cursor-pointer hover:bg-white/10 focus:bg-white/10 gap-2"
                onClick={() => router.push('/settings')}
              >
                <SettingsIcon className="w-4 h-4 text-blue-200/70" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Not logged in - show auth buttons
          <>
            <Link
              href="/login"
              className="hidden md:inline-flex text-sm text-blue-200/80 hover:text-white transition-colors font-medium px-4 py-2 rounded-xl hover:bg-white/5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}

// ─── 3D Canvas Section ────────────────────────────────────────────────────────
function ThreeScene() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Stars radius={80} depth={50} count={3000} factor={4} saturation={0.5} fade speed={0.5} />
          <SphereMesh />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.4}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const titleWords = ['HR', 'Leave', 'Monitor'];

  return (
    <motion.div
      ref={containerRef}
      style={{ y, opacity }}
      className="relative z-10 flex flex-col items-center text-center pt-40 pb-20 px-6 min-h-screen justify-center"
    >
      {/* Eyebrow badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm mb-8"
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-blue-400"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <Sparkles size={14} className="text-blue-400" />
        <span className="text-xs font-semibold text-blue-300 tracking-widest uppercase">
          Next-Gen HR Platform
        </span>
      </motion.div>

      {/* Main title */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-6">
        {titleWords.map((word, i) => (
          <motion.span
            key={word}
            initial={{ opacity: 0, y: 60, rotateX: -20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-8xl font-black tracking-tight leading-none"
            style={{
              background:
                i === 0
                  ? 'linear-gradient(135deg, #ffffff, #93c5fd)'
                  : i === 1
                  ? 'linear-gradient(135deg, #93c5fd, #a78bfa)'
                  : 'linear-gradient(135deg, #a78bfa, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {word}
          </motion.span>
        ))}
      </div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.8 }}
        className="max-w-2xl text-lg md:text-xl text-blue-200/70 leading-relaxed mb-12 font-light"
      >
        Intelligent leave management that empowers HR teams with{' '}
        <span className="text-blue-300 font-medium">real-time tracking</span>,{' '}
        <span className="text-purple-300 font-medium">smart analytics</span>, and{' '}
        <span className="text-emerald-300 font-medium">seamless workflows</span> — all in one
        stunning platform.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="flex flex-col sm:flex-row items-center gap-4 mb-16"
      >
        <Link href="/register">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(59,130,246,0.5)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
          >
            <Zap size={20} />
            Get Started Free
            <ArrowRight size={18} />
          </motion.button>
        </Link>
        <Link href="/login">
          <motion.button
            whileHover={{ scale: 1.05, borderColor: 'rgba(147,197,253,0.6)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-blue-200 font-semibold text-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
          >
            Sign In
            <ArrowRight size={18} />
          </motion.button>
        </Link>
      </motion.div>

      {/* Trusted by */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="flex flex-col items-center gap-4"
      >
        <p className="text-xs text-blue-200/40 uppercase tracking-widest font-medium">
          Trusted by leading companies
        </p>
        <div className="flex flex-wrap justify-center gap-8">
          {TRUSTED.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 + i * 0.1 }}
              className="text-sm font-semibold text-blue-200/30 hover:text-blue-200/60 transition-colors cursor-default"
            >
              {name}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-blue-200/30 uppercase tracking-widest">Scroll</span>
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-blue-400/50 to-transparent"
          animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────
function StatsSection() {
  return (
    <section className="relative z-10 px-6 md:px-12 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">
          By the Numbers
        </span>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">
          Trusted at <span className="text-blue-400">scale</span>
        </h2>
      </motion.div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {STATS.map((stat, i) => (
          <StatsCard key={stat.label} {...stat} delay={i * 0.1} />
        ))}
      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 px-6 md:px-12 py-20">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <span className="text-xs text-purple-400 font-semibold uppercase tracking-widest">
          Leave Types
        </span>
        <h2 className="mt-3 text-3xl md:text-5xl font-black text-white leading-tight">
          Every leave type,{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            perfectly managed
          </span>
        </h2>
        <p className="mt-4 text-blue-200/60 max-w-xl mx-auto text-lg">
          From vacation days to medical appointments — track and manage every absence with precision.
        </p>
      </motion.div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.title} {...feature} delay={i * 0.12} />
        ))}
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="relative z-10 px-6 md:px-12 py-20">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden"
      >
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(139,92,246,0.25) 50%, rgba(52,211,153,0.15) 100%)',
          }}
        />
        <div className="absolute inset-0 backdrop-blur-xl border border-white/10 rounded-3xl" />

        {/* Animated orb inside */}
        <motion.div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <div className="relative px-10 py-16 text-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <Sparkles size={32} className="text-yellow-400" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Ready to transform your{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              HR operations?
            </span>
          </h2>

          <p className="text-blue-200/60 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of HR professionals who rely on HRLeave to manage their teams effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(59,130,246,0.6)' }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-lg"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
              >
                <Zap size={20} />
                Start for Free
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-blue-200 font-bold text-lg border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all"
              >
                Sign In to Dashboard
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative z-10 px-6 md:px-12 py-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
          >
            <Shield size={15} className="text-white" />
          </div>
          <span className="text-white font-bold">
            HR<span className="text-blue-400">Leave</span>
          </span>
        </div>
        <p className="text-blue-200/30 text-sm">
          © {new Date().getFullYear()} HRLeave Monitor. All rights reserved.
        </p>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Support'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm text-blue-200/30 hover:text-blue-200/70 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function LandingClient() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #020817 0%, #0a0f2e 40%, #120820 70%, #020817 100%)',
      }}
    >
      {/* Background layers */}
      <GradientOrbs />
      <FloatingParticles />

      {/* 3D Canvas — hero area */}
      <div className="absolute top-0 left-0 right-0 h-screen pointer-events-none">
        <ThreeScene />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Page content */}
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <CTABanner />
      </main>

      <Footer />
    </div>
  );
}
