'use client';

import Script from 'next/script';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'HR Office',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
    },
  ],
};

export function JsonLdScript() {
  return (
    <Script
      id="json-ld-structured-data"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
