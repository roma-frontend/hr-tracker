// Server Component — SSR renders the full landing page instantly.
// JSON-LD structured data for SEO.
// Dynamic imports with ssr: false are handled in LandingPageClient to avoid hydration mismatch.

import {
  SoftwareApplicationJsonLd,
  OrganizationJsonLd,
  FAQPageJsonLd,
} from '@/components/seo/JsonLd';
import LandingPageClient from '@/components/landing/LandingPageClient';

export default function RootPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--landing-bg)' }}>
      <SoftwareApplicationJsonLd />
      <OrganizationJsonLd />
      <FAQPageJsonLd />

      {/* All dynamic sections with ssr: false */}
      <LandingPageClient />
    </div>
  );
}
