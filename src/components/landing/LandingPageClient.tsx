'use client';

import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import('@/components/landing/HeroSection'), {
  loading: () => (
    <div className="min-h-screen animate-pulse" style={{ background: 'var(--landing-bg)' }} />
  ),
  ssr: false,
});

const NavbarWrapper = dynamic(() => import('@/components/landing/NavbarWrapper'), {
  loading: () => null,
  ssr: false,
});

const LandingBelowFold = dynamic(() => import('@/components/landing/LandingBelowFold'), {
  loading: () => null,
  ssr: false,
});

export default function LandingPageClient() {
  return (
    <>
      <NavbarWrapper />
      <HeroSection />
      <LandingBelowFold />
    </>
  );
}
