'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldLoader } from '@/components/ui/ShieldLoader';

export default function CareersIndexPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.organizationSlug) {
      router.replace(`/careers/${user.organizationSlug}`);
    }
  }, [user, router]);

  // If not logged in or no org slug, show a fallback
  if (!user?.organizationSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--landing-bg)' }}>
        <div className="text-center">
          <p className="text-lg font-medium" style={{ color: 'var(--landing-text-primary)' }}>
            Visit <code className="px-2 py-1 rounded" style={{ background: 'var(--landing-card-bg)' }}>/careers/your-org-slug</code> to see open positions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--landing-bg)' }}>
      <ShieldLoader />
    </div>
  );
}
