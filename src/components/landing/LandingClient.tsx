'use client';

import React, { Suspense, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
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
import MobileMenu from './MobileMenu';

// Lazy load heavy 3D components for better initial load performance
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), {
  ssr: false,
  loading: () => null,
});

const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })), {
  ssr: false,
});

const Stars = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.Stars })), {
  ssr: false,
});

const SphereMesh = dynamic(() => import('./SphereMesh').then(mod => ({ default: mod.SphereMesh })), {
  ssr: false,
});

// Lazy load sections that appear below the fold
const TestimonialsSection = dynamic(() => import('./TestimonialsSection'), {
  loading: () => <div className="h-96 animate-pulse bg-white/5 rounded-3xl" />,
});

const FAQSection = dynamic(() => import('./FAQSection'), {
  loading: () => <div className="h-96 animate-pulse bg-white/5 rounded-3xl" />,
});

const NewsletterSection = dynamic(() => import('./NewsletterSection'), {
  loading: () => <div className="h-64 animate-pulse bg-white/5 rounded-3xl" />,
});

const PricingPreview = dynamic(() => import('./PricingPreview'), {
  loading: () => <div className="h-96 animate-pulse bg-white/5 rounded-3xl" />,
});

const SocialProof = dynamic(() => import('./SocialProof'), {
  loading: () => <div className="h-32 animate-pulse bg-white/5" />,
});
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
    icon: <Users size={22} className="text-black" />,
    color: 'rgba(212,175,55,0.2)',
  },
  {
    value: '99%',
    label: 'Accuracy Rate',
    icon: <CheckCircle2 size={22} className="text-black" />,
    color: 'rgba(244,229,168,0.2)',
  },
  {
    value: '24',
    label: 'Real-time Tracking',
    icon: <Activity size={22} className="text-black" />,
    color: 'rgba(192,192,192,0.15)',
  },
  {
    value: '360',
    label: 'Smart Analytics',
    icon: <BarChart3 size={22} className="text-black" />,
    color: 'rgba(205,127,50,0.18)',
  },
];

// ─── Features Data ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Calendar size={26} />,
    title: 'Vacation Tracking',
    description:
      'Seamlessly manage annual leave requests, approvals, and balances with an intuitive calendar-based interface and instant notifications.',
    gradient: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(244,229,168,0.08) 100%)',
    accentColor: '#d4af37',
    badge: 'Most Used',
  },
  {
    icon: <Heart size={26} />,
    title: 'Sick Leave',
    description:
      'Track employee sick days with automated policy enforcement, wellness insights, and HR-friendly reporting to keep your team healthy.',
    gradient: 'linear-gradient(135deg, rgba(205,127,50,0.12) 0%, rgba(170,139,46,0.06) 100%)',
    accentColor: '#cd7f32',
    badge: 'Policy-Aware',
  },
  {
    icon: <Users size={26} />,
    title: 'Family Leave',
    description:
      'Full support for parental, maternity, and paternity leave with compliance tracking for labor regulations and seamless HR workflows.',
    gradient: 'linear-gradient(135deg, rgba(192,192,192,0.12) 0%, rgba(169,169,169,0.06) 100%)',
    accentColor: '#c0c0c0',
    badge: 'Compliance-Ready',
  },
  {
    icon: <Stethoscope size={26} />,
    title: "Doctor Visits",
    description:
      "Log medical appointments and short absences without dipping into sick leave quotas. Keeps records clean and employees satisfied.",
    gradient: 'linear-gradient(135deg, rgba(244,229,168,0.12) 0%, rgba(212,175,55,0.06) 100%)',
    accentColor: '#f4e5a8',
    badge: 'Premium',
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
          background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(205,127,50,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{ scale: [1, 1.2, 1], x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(192,192,192,0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logoutAction();
    logout();
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Glassmorphism nav background */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-b border-[#d4af37]/20" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 group">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d4af37, #f4e5a8)' }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            aria-hidden="true"
          >
            <Shield size={18} className="text-black" />
          </motion.div>
          <span className="text-white font-bold text-lg tracking-tight group-hover:text-[#d4af37] transition-colors">
            HR<span className="text-[#d4af37]">Leave</span>
          </span>
        </Link>

        {/* Desktop Nav links */}
        <div className="relative hidden md:flex items-center gap-8">
          {[
            { name: 'Features', href: '#features' },
            { name: 'Pricing', href: '#pricing' },
            { name: 'Testimonials', href: '#testimonials' },
            { name: 'FAQ', href: '#faq' },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm text-[#f7e7ce]/60 hover:text-[#d4af37] transition-colors duration-200 font-medium focus:outline-none focus:text-[#d4af37] focus:underline underline-offset-4"
              aria-label={`Navigate to ${item.name}`}
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Auth buttons / User menu */}
        <div className="relative flex items-center gap-3">
          {user ? (
            // Logged in - show user menu
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                  aria-label="User menu"
                >
                  <Avatar className="w-8 h-8">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback className="text-xs bg-gradient-to-br from-[#d4af37] to-[#cd7f32] text-black font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] text-[#f7e7ce]/70 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#f7e7ce]/70 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-[#0a0a0f]/95 backdrop-blur-xl border border-[#d4af37]/20 shadow-xl shadow-black/50 rounded-xl"
              >
                <DropdownMenuLabel className="text-[#d4af37]/60 text-xs font-semibold tracking-widest uppercase px-2 py-1.5">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#d4af37]/10" />
                <DropdownMenuItem
                  className="text-[#f7e7ce] cursor-pointer hover:bg-[#f7e7ce]/10 hover:text-[#f7e7ce] focus:bg-[#f7e7ce]/10 focus:text-[#f7e7ce] focus:outline-none focus-visible:outline-none outline-none border-0 focus:border-0 focus:ring-0 focus-visible:ring-0 gap-2 rounded-lg transition-colors"
                  style={{ boxShadow: 'none' }}
                  onClick={() => router.push('/dashboard')}
                >
                  <UserIcon className="w-4 h-4 text-[#d4af37]/70" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-[#f7e7ce] cursor-pointer hover:bg-[#f7e7ce]/10 hover:text-[#f7e7ce] focus:bg-[#f7e7ce]/10 focus:text-[#f7e7ce] focus:outline-none focus-visible:outline-none outline-none border-0 focus:border-0 focus:ring-0 focus-visible:ring-0 gap-2 rounded-lg transition-colors"
                  style={{ boxShadow: 'none' }}
                  onClick={() => router.push('/settings')}
                >
                  <SettingsIcon className="w-4 h-4 text-[#d4af37]/70" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#d4af37]/10" />
                <DropdownMenuItem
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10 focus:outline-none focus-visible:outline-none outline-none cursor-pointer gap-2 rounded-lg transition-colors"
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
                className="hidden md:inline-flex text-sm text-[#f7e7ce]/70 hover:text-[#d4af37] transition-colors font-medium px-4 py-2 rounded-xl hover:bg-[#d4af37]/10 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="hidden md:inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-black transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#d4af37]/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                style={{ background: 'linear-gradient(135deg, #d4af37, #f4e5a8)' }}
              >
                Get Started
                <ArrowRight size={14} />
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                aria-label="Open mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </motion.nav>

      {/* Mobile Menu Component */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}

// ─── 3D Canvas Section ────────────────────────────────────────────────────────
function ThreeScene() {
  const [isLowPerformance, setIsLowPerformance] = React.useState(false);

  React.useEffect(() => {
    // Detect low-performance devices
    const checkPerformance = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
      setIsLowPerformance(isMobile || Boolean(isLowEnd));
    };
    checkPerformance();
  }, []);

  if (isLowPerformance) {
    // Return simplified version for low-performance devices
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
          dpr={[1, 2]} // Limit pixel ratio for performance
        >
          <Suspense fallback={null}>
            <Stars radius={80} depth={50} count={2000} factor={4} saturation={0.5} fade speed={0.5} />
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
      </Suspense>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const router = useRouter();
  const { user } = useAuthStore();

  const titleWords = ['HR', 'Leave', 'Monitor'];

  return (
    <motion.div
      ref={containerRef}
      style={{ y, opacity }}
      className="relative z-10 flex flex-col items-center text-center pt-40 pb-20 px-6 min-h-screen justify-center"
      role="banner"
      aria-label="Hero section"
    >
      {/* Skip to content link for accessibility */}
      <a
        href="#features"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#d4af37] focus:text-black focus:rounded-lg"
      >
        Skip to main content
      </a>
      {/* Elegant badge with shimmer effect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#d4af37]/40 bg-gradient-to-r from-[#d4af37]/10 via-[#f4e5a8]/5 to-[#d4af37]/10 backdrop-blur-sm mb-8 overflow-hidden"
        role="status"
        aria-label="Premium HR platform"
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f4e5a8]/20 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
        
        <motion.div
          className="w-2 h-2 rounded-full bg-[#d4af37]"
          animate={{ 
            scale: [1, 1.3, 1],
            boxShadow: [
              '0 0 0px rgba(212,175,55,0.5)',
              '0 0 15px rgba(212,175,55,0.8)',
              '0 0 0px rgba(212,175,55,0.5)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-hidden="true"
        />
        <span className="relative text-xs font-bold text-[#f4e5a8] tracking-[0.2em] uppercase">
          Exclusive HR Excellence
        </span>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        >
          <Sparkles size={16} className="text-[#d4af37]" />
        </motion.div>
      </motion.div>

      {/* Elegant title with luxury animations */}
      <h1 className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-6 relative">
        {titleWords.map((word, i) => (
          <motion.span
            key={word}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
            }}
            transition={{ 
              delay: 0.4 + i * 0.2, 
              duration: 1, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="relative text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-none"
          >
            {/* Glowing background effect */}
            <motion.span
              className="absolute inset-0 blur-2xl opacity-40"
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                delay: i * 0.3
              }}
              style={{
                background:
                  i === 0
                    ? 'linear-gradient(135deg, #ffffff, #f4e5a8)'
                    : i === 1
                    ? 'linear-gradient(135deg, #f4e5a8, #d4af37)'
                    : 'linear-gradient(135deg, #d4af37, #cd7f32)',
              }}
              aria-hidden="true"
            />
            
            {/* Main text with gradient */}
            <span
              className="relative inline-block"
              style={{
                background:
                  i === 0
                    ? 'linear-gradient(135deg, #ffffff 0%, #f4e5a8 100%)'
                    : i === 1
                    ? 'linear-gradient(135deg, #f4e5a8 0%, #d4af37 100%)'
                    : 'linear-gradient(135deg, #d4af37 0%, #cd7f32 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 60px rgba(212,175,55,0.3)',
              }}
            >
              {word}
            </span>
          </motion.span>
        ))}
        
        {/* Elegant decorative lines */}
        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 128, opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        />
      </h1>

      {/* Elegant subtitle with decorative elements */}
      <div className="max-w-3xl mx-auto mb-12">
        {/* Top decorative element */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <motion.div
            className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-[#d4af37]"
            animate={{ 
              scale: [1, 1.3, 1],
              boxShadow: [
                '0 0 0px rgba(212,175,55,0.5)',
                '0 0 20px rgba(212,175,55,1)',
                '0 0 0px rgba(212,175,55,0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-lg md:text-xl text-[#f7e7ce]/80 leading-relaxed font-light text-center"
        >
          Sophisticated leave management that empowers{' '}
          <motion.span 
            className="text-[#d4af37] font-semibold inline-block"
            animate={{ 
              textShadow: [
                '0 0 10px rgba(212,175,55,0.3)',
                '0 0 20px rgba(212,175,55,0.6)',
                '0 0 10px rgba(212,175,55,0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            elite HR teams
          </motion.span>{' '}
          with{' '}
          <span className="text-[#f4e5a8] font-medium">real-time precision</span>,{' '}
          <span className="text-[#c0c0c0] font-medium">intelligent insights</span>, and{' '}
          <span className="text-[#cd7f32] font-medium">seamless automation</span> — all in one
          exclusive platform.
        </motion.p>

        {/* Bottom decorative element */}
        <motion.div
          className="flex items-center justify-center gap-2 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <motion.div
            className="w-1 h-1 rounded-full bg-[#d4af37]/60"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/80"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-[#d4af37]"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          />
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/80"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <motion.div
            className="w-1 h-1 rounded-full bg-[#d4af37]/60"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          />
        </motion.div>
      </div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="flex flex-col sm:flex-row items-center gap-4 mb-16"
      >
        {user ? (
          // Authenticated user - show dashboard buttons
          <>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(212,175,55,0.6)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-black font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
              style={{ background: 'linear-gradient(135deg, #d4af37, #f4e5a8)' }}
              aria-label="Go to Dashboard"
            >
              <Activity size={20} aria-hidden="true" />
              Go to Dashboard
              <ArrowRight size={18} aria-hidden="true" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, borderColor: 'rgba(212,175,55,0.6)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-[#f7e7ce] font-semibold text-lg border border-[#d4af37]/20 bg-[#d4af37]/5 backdrop-blur-sm transition-all duration-300 hover:bg-[#d4af37]/10 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
              aria-label="View analytics"
            >
              <BarChart3 size={20} aria-hidden="true" />
              View Analytics
            </motion.button>
          </>
        ) : (
          // Non-authenticated user - show sign up buttons
          <>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(212,175,55,0.6)' }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-black font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                style={{ background: 'linear-gradient(135deg, #d4af37, #f4e5a8)' }}
                aria-label="Get started for free"
              >
                <Zap size={20} aria-hidden="true" />
                Get Started Free
                <ArrowRight size={18} aria-hidden="true" />
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05, borderColor: 'rgba(212,175,55,0.6)' }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-[#f7e7ce] font-semibold text-lg border border-[#d4af37]/20 bg-[#d4af37]/5 backdrop-blur-sm transition-all duration-300 hover:bg-[#d4af37]/10 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                aria-label="Sign in to your account"
              >
                Sign In
                <ArrowRight size={18} aria-hidden="true" />
              </motion.button>
            </Link>
          </>
        )}
      </motion.div>

      {/* Trusted companies with luxury styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]/40"
            initial={{ width: 0 }}
            animate={{ width: 32 }}
            transition={{ delay: 1.7, duration: 0.6 }}
          />
          <p className="text-xs text-[#d4af37]/60 uppercase tracking-[0.3em] font-semibold">
            Trusted by Elite Organizations
          </p>
          <motion.div
            className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]/40"
            initial={{ width: 0 }}
            animate={{ width: 32 }}
            transition={{ delay: 1.7, duration: 0.6 }}
          />
        </div>
        
        <div className="flex flex-wrap justify-center gap-10">
          {TRUSTED.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 + i * 0.1, duration: 0.5 }}
              whileHover={{ 
                scale: 1.05,
                color: '#d4af37',
              }}
              className="relative text-sm font-bold text-[#f7e7ce]/25 transition-all cursor-default group"
            >
              {name}
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator - hidden on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 hidden md:flex"
        aria-hidden="true"
      >
        <span className="text-xs text-[#d4af37]/40 uppercase tracking-widest">Scroll</span>
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-[#d4af37]/50 to-transparent"
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
    <section className="relative z-10 px-6 md:px-12 py-20" id="stats" aria-label="Platform statistics">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <span className="text-xs text-[#d4af37] font-semibold uppercase tracking-widest">
          By the Numbers
        </span>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">
          Trusted at <span className="text-[#d4af37]">scale</span>
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
    <section id="features" className="relative z-10 px-6 md:px-12 py-20" aria-label="Platform features">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <span className="text-xs text-[#cd7f32] font-semibold uppercase tracking-widest">
          Leave Types
        </span>
        <h2 className="mt-3 text-3xl md:text-5xl font-black text-white leading-tight">
          Every leave type,{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f4e5a8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            perfectly managed
          </span>
        </h2>
        <p className="mt-4 text-[#f7e7ce]/60 max-w-xl mx-auto text-lg">
          From vacation days to medical appointments — track and manage every absence with precision and elegance.
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
  const router = useRouter();
  const { user } = useAuthStore();
  
  return (
    <section className="relative z-10 px-6 md:px-12 py-20" aria-label="Call to action">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden"
        style={{ minHeight: 380 }}
      >
        {/* Deep dark gradient background - matches screenshot */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0d0d1a 0%, #12103a 30%, #1a0a2e 60%, #0f1a2e 100%)',
        }} />
        {/* Purple glow top-right */}
        <motion.div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)', filter: 'blur(40px)' }}
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 7, repeat: Infinity }} />
        {/* Gold glow bottom-left */}
        <motion.div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }}
          animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 9, repeat: Infinity, delay: 2 }} />
        {/* Teal glow bottom-right */}
        <motion.div className="absolute -bottom-10 right-1/4 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)', filter: 'blur(30px)' }}
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }} />
        {/* Subtle border */}
        <div className="absolute inset-0 rounded-3xl border border-white/[0.06]" />

        <div className="relative px-10 py-20 text-center flex flex-col items-center">
          {/* Icon */}
          <motion.div className="inline-flex mb-8"
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="relative">
              <Sparkles size={48} className="text-[#d4af37]" />
              <motion.div className="absolute inset-0 blur-xl"
                style={{ background: 'rgba(212,175,55,0.4)' }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }} />
            </div>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Ready to elevate your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #f4e5a8 50%, #cd7f32 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              HR operations?
            </span>
          </h2>

          <p className="text-white/50 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Join elite HR professionals who rely on HRLeave to manage their teams with sophistication.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(212,175,55,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-black font-bold text-lg shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #d4af37, #f4e5a8)' }}
                >
                  <Calendar size={20} />
                  Manage Leaves
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/employees')}
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-lg border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all"
                >
                  <Users size={20} />
                  View Team
                </motion.button>
              </>
            ) : (
              <>
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(212,175,55,0.5)' }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-black font-bold text-lg shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #d4af37, #f4e5a8)' }}
                  >
                    <Zap size={20} />
                    Start for Free
                  </motion.button>
                </Link>
                <Link href="/auth/login">
                  <motion.button
                    whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-lg border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all"
                  >
                    Sign In to Dashboard
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Testimonials', href: '#testimonials' },
      { name: 'FAQ', href: '#faq' },
    ],
    platform: [
      { name: 'Dashboard', href: '/auth/login' },
      { name: 'Attendance', href: '/auth/login' },
      { name: 'Tasks', href: '/auth/login' },
      { name: 'Employees', href: '/auth/login' },
      { name: 'Analytics', href: '/auth/login' },
      { name: 'Calendar', href: '/auth/login' },
    ],
    account: [
      { name: 'Sign In', href: '/auth/login' },
      { name: 'Register', href: '/auth/register' },
      { name: 'Settings', href: '/auth/login' },
      { name: 'Help', href: '#faq' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/privacy#cookies' },
      { name: 'GDPR', href: '/privacy#gdpr' },
    ],
  };

  return (
    <footer className="relative z-10 border-t border-white/5" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #d4af37, #f4e5a8)' }}
              >
                <Shield size={18} className="text-black" />
              </div>
              <span className="text-white font-bold text-lg group-hover:text-[#d4af37] transition-colors">
                HR<span className="text-[#d4af37]">Leave</span>
              </span>
            </Link>
            <p className="text-[#f7e7ce]/50 text-sm leading-relaxed mb-4">
              Premium HR leave management platform for sophisticated teams.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {[
                { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', href: 'https://twitter.com' },
                { name: 'LinkedIn', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z', href: 'https://linkedin.com' },
                { name: 'GitHub', icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22', href: 'https://github.com' },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
                  aria-label={social.name}
                >
                  <svg
                    className="w-4 h-4 text-[#d4af37]/50 group-hover:text-[#d4af37] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                {category === 'product' ? 'Product' : category === 'platform' ? 'Platform' : category === 'account' ? 'Account' : 'Legal'}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#f7e7ce]/50 hover:text-[#d4af37] text-sm transition-colors focus:outline-none focus:text-[#d4af37] focus:underline underline-offset-4"
                      >
                        {link.name}
                      </a>
                    ) : link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-[#f7e7ce]/50 hover:text-[#d4af37] text-sm transition-colors focus:outline-none focus:text-[#d4af37] focus:underline underline-offset-4"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[#f7e7ce]/50 hover:text-[#d4af37] text-sm transition-colors focus:outline-none focus:text-[#d4af37] focus:underline underline-offset-4"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#d4af37]/40 text-sm">
            © {new Date().getFullYear()} HRLeave Monitor. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[#d4af37]/40">
            <span>🔒 SSL Secured</span>
            <span>✓ GDPR Compliant</span>
            <span>✓ SOC 2 Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function LandingClient() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black">
      {/* Background layers - lowest z-index */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <GradientOrbs />
        <FloatingParticles />
      </div>

      {/* 3D Canvas — hero area */}
      <div className="fixed top-0 left-0 right-0 h-screen pointer-events-none -z-10">
        <ThreeScene />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Page content */}
      <main className="relative z-10">
        <HeroSection />
        <SocialProof />
        <StatsSection />
        <FeaturesSection />
        <PricingPreview />
        <section id="testimonials">
          <TestimonialsSection />
        </section>
        <FAQSection />
        <NewsletterSection />
        <CTABanner />
      </main>

      <Footer />
    </div>
  );
}
