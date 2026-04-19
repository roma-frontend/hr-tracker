// Server Component — SSR renders the full landing page instantly.
// HeroSection is now a Server Component (renders without JS).
// Client islands handle interactivity (auth, theme, animations).

import { Suspense } from 'react';
import {
  SoftwareApplicationJsonLd,
  OrganizationJsonLd,
  FAQPageJsonLd,
} from '@/components/seo/JsonLd';
import HeroSection from '@/components/landing/HeroSection';
import LandingBelowFold from '@/components/landing/LandingBelowFold';
import NavbarWrapper from '@/components/landing/NavbarWrapper';

export default function RootPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--landing-bg)' }}>
      <SoftwareApplicationJsonLd />
      <OrganizationJsonLd />
      <FAQPageJsonLd />

      <NavbarWrapper />

      <HeroSection />

      <Suspense fallback={null}>
        <LandingBelowFold />
      </Suspense>
    </div>
  );
}
