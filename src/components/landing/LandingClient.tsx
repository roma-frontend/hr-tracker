'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
// framer-motion removed — all animations now use CSS + IntersectionObserver
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

import StatsCard from './StatsCard';
import FeatureCard from './FeatureCard';
import MobileMenu from './MobileMenu';

const FloatingParticles = dynamic(() => import('./FloatingParticles'), { ssr: false, loading: () => null });


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
    icon: <Users size={22} className="text-white" />,
    color: 'rgba(37,99,235,0.2)',
  },
  {
    value: '99%',
    label: 'Accuracy Rate',
    icon: <CheckCircle2 size={22} className="text-white" />,
    color: 'rgba(96,165,250,0.2)',
  },
  {
    value: '24',
    label: 'Real-time Tracking',
    icon: <Activity size={22} className="text-white" />,
    color: 'rgba(96,165,250,0.15)',
  },
  {
    value: '360',
    label: 'Smart Analytics',
    icon: <BarChart3 size={22} className="text-white" />,
    color: 'rgba(56,189,248,0.18)',
  },
];

// ─── Features Data ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Calendar size={26} />,
    title: 'Vacation Tracking',
    description:
      'Seamlessly manage annual leave requests, approvals, and balances with an intuitive calendar-based interface and instant notifications.',
    gradient: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(96,165,250,0.08) 100%)',
    accentColor: '#2563eb',
    badge: 'Most Used',
  },
  {
    icon: <Heart size={26} />,
    title: 'Sick Leave',
    description:
      'Track employee sick days with automated policy enforcement, wellness insights, and HR-friendly reporting to keep your team healthy.',
    gradient: 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(14,165,233,0.06) 100%)',
    accentColor: '#60a5fa',
    badge: 'Policy-Aware',
  },
  {
    icon: <Users size={26} />,
    title: 'Family Leave',
    description:
      'Full support for parental, maternity, and paternity leave with compliance tracking for labor regulations and seamless HR workflows.',
    gradient: 'linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(14,165,233,0.06) 100%)',
    accentColor: '#94a3b8',
    badge: 'Compliance-Ready',
  },
  {
    icon: <Stethoscope size={26} />,
    title: "Doctor Visits",
    description:
      "Log medical appointments and short absences without dipping into sick leave quotas. Keeps records clean and employees satisfied.",
    gradient: 'linear-gradient(135deg, rgba(96,165,250,0.12) 0%, rgba(37,99,235,0.06) 100%)',
    accentColor: '#93c5fd',
    badge: 'Premium',
  },
];

// ─── Trusted By Logos (text placeholders) ────────────────────────────────────
const TRUSTED = ['Acme Corp', 'GlobalTech', 'NovaSoft', 'Meridian Co.', 'Apex Industries'];

// ─── Gradient Orbs ────────────────────────────────────────────────────────────
function GradientOrbs() {
  return (
    <>
      {/* Static orbs — no JS animation = zero CPU/GPU overhead, pure CSS */}
      <div
        className="fixed top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full pointer-events-none orb-pulse-1"
        style={{
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
          willChange: 'transform',
        }}
      />
      <div
        className="fixed top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none orb-pulse-2"
        style={{
          background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
          willChange: 'transform',
        }}
      />
      <div
        className="fixed bottom-[10%] left-[20%] w-[500px] h-[500px] rounded-full pointer-events-none orb-pulse-3"
        style={{
          background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
          willChange: 'transform',
        }}
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
      {/* nav-animate class uses CSS animation — zero JS cost vs framer-motion */}
      <nav
        className="nav-animate fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Glassmorphism nav background */}
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl border-b border-blue-500/20" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 group">
          {/* CSS animation instead of framer-motion — zero JS cost */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center logo-spin"
            style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)' }}
            aria-hidden="true"
          >
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight group-hover:text-blue-400 transition-colors">
            HR<span className="text-blue-400">Leave</span>
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
              className="text-sm text-blue-200/60 hover:text-blue-400 transition-colors duration-200 font-medium focus:outline-none focus:text-blue-400 focus:underline underline-offset-4"
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
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all outline-none focus:ring-2 focus:ring-blue-500/50"
                  aria-label="User menu"
                >
                  <Avatar className="w-8 h-8">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
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
                className="w-48 bg-slate-950/95 backdrop-blur-xl border border-blue-500/20 shadow-xl shadow-black/50 rounded-xl"
              >
                <DropdownMenuLabel className="text-blue-400/60 text-xs font-semibold tracking-widest uppercase px-2 py-1.5">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#2563eb]/10" />
                <DropdownMenuItem
                  className="text-blue-200 cursor-pointer hover:bg-blue-500/10 hover:text-blue-200 focus:bg-blue-500/10 focus:text-blue-200 focus:outline-none focus-visible:outline-none outline-none border-0 focus:border-0 focus:ring-0 focus-visible:ring-0 gap-2 rounded-lg transition-colors"
                  style={{ boxShadow: 'none' }}
                  onClick={() => router.push('/dashboard')}
                >
                  <UserIcon className="w-4 h-4 text-blue-400/70" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-blue-200 cursor-pointer hover:bg-blue-500/10 hover:text-blue-200 focus:bg-blue-500/10 focus:text-blue-200 focus:outline-none focus-visible:outline-none outline-none border-0 focus:border-0 focus:ring-0 focus-visible:ring-0 gap-2 rounded-lg transition-colors"
                  style={{ boxShadow: 'none' }}
                  onClick={() => router.push('/settings')}
                >
                  <SettingsIcon className="w-4 h-4 text-blue-400/70" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#2563eb]/10" />
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
                className="hidden md:inline-flex text-sm text-blue-200/70 hover:text-blue-400 transition-colors font-medium px-4 py-2 rounded-xl hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="hidden md:inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)' }}
              >
                Get Started
                <ArrowRight size={14} />
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
      </nav>

      {/* Mobile Menu Component */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}


// ─── Hero Section ─────────────────────────────────────────────────────────────
// Replaced framer-motion scroll parallax + per-element JS animations with
// pure CSS keyframe animations — same visual result, zero runtime JS cost.
function HeroSection() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <div
      className="relative z-10 flex flex-col items-center text-center pt-40 pb-20 px-6 min-h-screen justify-center"
      role="banner"
      aria-label="Hero section"
    >
      {/* Skip to content link for accessibility */}
      <a
        href="#features"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Badge — CSS shimmer, no JS */}
      <div
        className="hero-fade-1 relative inline-flex items-center gap-3 px-6 py-3 rounded-full border border-blue-500/40 bg-gradient-to-r from-blue-500/10 via-blue-300/5 to-blue-500/10 backdrop-blur-sm mb-8 overflow-hidden"
        role="status"
        aria-label="Premium HR platform"
      >
        <div className="badge-shimmer absolute inset-0" aria-hidden="true" />
        <div className="w-2 h-2 rounded-full bg-[#2563eb] pulse-dot" aria-hidden="true" />
        <span className="relative text-xs font-bold text-blue-300 tracking-[0.2em] uppercase">
          Exclusive HR Excellence
        </span>
        <Sparkles size={16} className="text-blue-400 spin-slow" aria-hidden="true" />
      </div>

      {/* Title — CSS fade-up stagger */}
      <h1 className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-6 relative">
        {(['HR', 'Leave', 'Monitor'] as const).map((word, i) => (
          <span
            key={word}
            className={`hero-word-${i + 1} relative text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-none`}
          >
            <span
              className="relative inline-block"
              style={{
                background:
                  i === 0
                    ? 'linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)'
                    : i === 1
                    ? 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)'
                    : 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {word}
            </span>
          </span>
        ))}
        <div className="hero-line absolute -bottom-4 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </h1>

      {/* Subtitle */}
      <div className="hero-fade-3 max-w-3xl mx-auto mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-blue-500" />
          <div className="w-2 h-2 rounded-full bg-blue-500 pulse-dot" />
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-blue-500" />
        </div>
        <p className="text-lg md:text-xl text-blue-200/80 leading-relaxed font-light text-center">
          Sophisticated leave management that empowers{' '}
          <span className="text-blue-400 font-semibold">elite HR teams</span>{' '}
          with{' '}
          <span className="text-blue-300 font-medium">real-time precision</span>,{' '}
          <span className="text-slate-400 font-medium">intelligent insights</span>, and{' '}
          <span className="text-blue-500 font-medium">seamless automation</span> — all in one
          exclusive platform.
        </p>
        <div className="flex items-center justify-center gap-2 mt-6">
          {[0, 1, 2, 1, 0].map((size, idx) => (
            <div
              key={idx}
              className="rounded-full bg-blue-500 pulse-dot"
              style={{
                width: size === 0 ? 4 : size === 1 ? 6 : 8,
                height: size === 0 ? 4 : size === 1 ? 6 : 8,
                animationDelay: `${idx * 0.15}s`,
                opacity: 0.6 + size * 0.15,
              }}
            />
          ))}
        </div>
      </div>

      {/* CTA Buttons — CSS hover only, no framer-motion */}
      <div className="hero-fade-2 flex flex-col sm:flex-row items-center gap-4 mb-16">
        {user ? (
          <>
            <button
              onClick={() => router.push('/dashboard')}
              className="cta-btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)' }}
              aria-label="Go to Dashboard"
            >
              <Activity size={20} aria-hidden="true" />
              Go to Dashboard
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="cta-btn-secondary inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-blue-200 font-semibold text-lg border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="View analytics"
            >
              <BarChart3 size={20} aria-hidden="true" />
              View Analytics
            </button>
          </>
        ) : (
          <>
            <Link href="/register">
              <button
                className="cta-btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)' }}
                aria-label="Get started for free"
              >
                <Zap size={20} aria-hidden="true" />
                Get Started Free
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </Link>
            <Link href="/login">
              <button
                className="cta-btn-secondary inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-blue-200 font-semibold text-lg border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label="Sign in to your account"
              >
                Sign In
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </Link>
          </>
        )}
      </div>

      {/* Trusted companies */}
      <div className="hero-fade-4 flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-blue-500/40" />
          <p className="text-xs text-blue-400/60 uppercase tracking-[0.3em] font-semibold">
            Trusted by Elite Organizations
          </p>
          <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-blue-500/40" />
        </div>
        <div className="flex flex-wrap justify-center gap-10">
          {TRUSTED.map((name) => (
            <span
              key={name}
              className="relative text-sm font-bold text-blue-200/25 hover:text-blue-200/50 transition-colors cursor-default group"
            >
              {name}
              <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 hidden md:flex"
        aria-hidden="true"
      >
        <span className="text-xs text-blue-500/40 uppercase tracking-widest">Scroll</span>
        <div className="scroll-line w-px h-12 bg-gradient-to-b from-blue-500/50 to-transparent" />
      </div>
    </div>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────
function StatsSection() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative z-10 px-6 md:px-12 py-20" id="stats" aria-label="Platform statistics">
      <div
        ref={ref}
        className="text-center mb-12"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <span className="section-eyebrow">By the Numbers</span>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">
          Trusted at <span className="heading-gradient">scale</span>
        </h2>
      </div>
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
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="features" className="relative z-10 px-6 md:px-12 py-20" aria-label="Platform features">
      {/* Section header */}
      <div
        ref={ref}
        className="text-center mb-16"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <span className="section-eyebrow">Leave Types</span>
        <h2 className="mt-3 text-3xl md:text-5xl font-black text-white leading-tight">
          Every leave type,{' '}
          <span className="heading-gradient">perfectly managed</span>
        </h2>
        <p className="mt-4 text-blue-200/60 max-w-xl mx-auto text-lg">
          From vacation days to medical appointments — track and manage every absence with precision and elegance.
        </p>
      </div>

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
    <section className="relative z-10 py-28" aria-label="Call to action">
      {/* Static CSS glows — no JS animation needed */}
      <div className="absolute -top-24 right-0 w-[600px] h-[600px] rounded-full pointer-events-none orb-pulse-1"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none orb-pulse-2"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none orb-pulse-3"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div className="section-fade relative max-w-5xl mx-auto px-6 md:px-12">
        <div className="relative px-10 py-20 text-center flex flex-col items-center">
          {/* Icon — CSS float animation */}
          <div className="animate-float inline-flex mb-8">
            <Sparkles size={48} className="text-blue-400" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Ready to elevate your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #93c5fd 50%, #60a5fa 100%)',
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
                <button
                  onClick={() => router.push('/dashboard')}
                  className="cta-btn-primary inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)' }}
                >
                  <Calendar size={20} />
                  Manage Leaves
                </button>
                <button
                  onClick={() => router.push('/employees')}
                  className="cta-btn-secondary inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-lg border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10"
                >
                  <Users size={20} />
                  View Team
                </button>
              </>
            ) : (
              <>
                <Link href="/register">
                  <button
                    className="cta-btn-primary inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)' }}
                  >
                    <Zap size={20} />
                    Start for Free
                  </button>
                </Link>
                <Link href="/login">
                  <button
                    className="cta-btn-secondary inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-lg border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10"
                  >
                    Sign In to Dashboard
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
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
      { name: 'Dashboard', href: '/login' },
      { name: 'Attendance', href: '/login' },
      { name: 'Tasks', href: '/login' },
      { name: 'Employees', href: '/login' },
      { name: 'Analytics', href: '/login' },
      { name: 'Calendar', href: '/login' },
    ],
    account: [
      { name: 'Sign In', href: '/login' },
      { name: 'Register', href: '/register' },
      { name: 'Settings', href: '/login' },
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
                style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)' }}
              >
                <Shield size={18} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">
                HR<span className="text-blue-400">Leave</span>
              </span>
            </Link>
            <p className="text-blue-200/50 text-sm leading-relaxed mb-4">
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
                    className="w-4 h-4 text-blue-400/50 group-hover:text-blue-400 transition-colors"
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
                        className="text-blue-200/50 hover:text-blue-400 text-sm transition-colors focus:outline-none focus:text-blue-400 focus:underline underline-offset-4"
                      >
                        {link.name}
                      </a>
                    ) : link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-blue-200/50 hover:text-blue-400 text-sm transition-colors focus:outline-none focus:text-blue-400 focus:underline underline-offset-4"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-blue-200/50 hover:text-blue-400 text-sm transition-colors focus:outline-none focus:text-blue-400 focus:underline underline-offset-4"
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
          <p className="text-blue-400/40 text-sm">
            © {new Date().getFullYear()} HRLeave Monitor. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-blue-400/40">
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

      {/* Navigation */}
      <Navbar />

      {/* Page content */}
      <main className="relative z-10">
        <HeroSection />
        <div className="section-lazy">
          <SocialProof />
        </div>
        <div className="section-lazy">
          <StatsSection />
        </div>
        <div className="section-lazy">
          <FeaturesSection />
        </div>
        <div className="section-lazy">
          <PricingPreview />
        </div>
        <section id="testimonials" className="section-lazy">
          <TestimonialsSection />
        </section>
        <div className="section-lazy">
          <FAQSection />
        </div>
        <div className="section-lazy">
          <NewsletterSection />
        </div>
        <div className="section-lazy">
          <CTABanner />
        </div>
      </main>

      <Footer />
    </div>
  );
}
