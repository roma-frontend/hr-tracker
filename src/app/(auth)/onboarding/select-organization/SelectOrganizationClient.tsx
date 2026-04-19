'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRequestJoinOrganization } from '@/hooks/useOrganizations';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Search, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShieldLoader } from '@/components/ui/ShieldLoader';

interface Organization {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  logoUrl?: string;
  country?: string;
}

async function fetchCurrentUser(email: string) {
  const params = new URLSearchParams({ action: 'get-current-user' });
  const res = await fetch(`/api/users?${params}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  const json = await res.json();
  return json.data;
}

async function fetchActiveOrganizations() {
  const params = new URLSearchParams({ action: 'get-for-picker' });
  const res = await fetch(`/api/org?${params}`);
  if (!res.ok) throw new Error('Failed to fetch organizations');
  const json = await res.json();
  return json.data as Organization[];
}

export default function SelectOrganizationClient() {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();

  const { data: freshUserData } = useQuery({
    queryKey: ['current-user', user?.email],
    queryFn: () => fetchCurrentUser(user!.email),
    enabled: !!user?.email,
  });

  React.useEffect(() => {
    if (freshUserData?.organizationId && freshUserData?.isApproved) {
      setUser({
        id: freshUserData.id,
        name: freshUserData.name,
        email: freshUserData.email,
        role: freshUserData.role,
        organizationId: freshUserData.organizationId,
        isApproved: freshUserData.isApproved,
      });

      const params = new URLSearchParams(window.location.search);
      const nextUrl = params.get('next');
      const redirectUrl = nextUrl || '/dashboard';
      window.location.href = redirectUrl;
      return;
    }

    if (user?.organizationId && user?.isApproved) {
      const params = new URLSearchParams(window.location.search);
      const nextUrl = params.get('next');
      const redirectUrl = nextUrl || '/dashboard';
      window.location.href = redirectUrl;
    }
  }, [user, freshUserData, setUser]);

  const { data: organizations } = useQuery({
    queryKey: ['organizations-for-picker'],
    queryFn: fetchActiveOrganizations,
  });
  const requestJoin = useRequestJoinOrganization();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRequesting, setIsRequesting] = useState<string | null>(null);

  const filteredOrgs = organizations?.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRequestJoin = async (organizationId: string) => {
    if (!user?.id) {
      return;
    }

    setIsRequesting(organizationId);
    try {
      await requestJoin.mutateAsync({
        userId: user.id,
        organizationId,
      });

      window.location.href = '/onboarding/pending';
    } catch (_error) {
    } finally {
      setIsRequesting(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {t('onboarding.selectOrganization', 'Select Your Organization')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t(
              'onboarding.selectOrgDesc',
              'Choose the organization you want to join. Your request will be sent to administrators for approval.',
            )}
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder={t('onboarding.searchOrg', 'Search organizations...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {!organizations ? (
            <div className="flex items-center justify-center py-12">
              <ShieldLoader size="md" variant="inline" />
            </div>
          ) : filteredOrgs?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                {searchQuery
                  ? t('onboarding.noOrgFound', 'No organizations found matching your search')
                  : t('onboarding.noOrgs', 'No organizations available')}
              </CardContent>
            </Card>
          ) : (
            filteredOrgs?.map((org) => (
              <Card
                key={org.id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                        {org.logoUrl ? (
                          <img
                            src={org.logoUrl}
                            alt={org.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          org.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                          {org.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>@{org.slug}</span>
                          {org.industry && (
                            <>
                              <span>•</span>
                              <span>{org.industry}</span>
                            </>
                          )}
                          {org.country && (
                            <>
                              <span>•</span>
                              <span>{org.country}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRequestJoin(org.id);
                      }}
                      disabled={isRequesting === org.id || !user?.id}
                      className="min-w-[120px]"
                    >
                      {isRequesting === org.id ? (
                        <>
                          <ShieldLoader size="xs" variant="inline" />
                          {t('onboarding.sending', 'Sending...')}
                        </>
                      ) : !user?.id ? (
                        <ShieldLoader size="xs" variant="inline" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {t('onboarding.join', 'Join')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            {t(
              'onboarding.afterJoin',
              "After joining, you'll need to wait for administrator approval before accessing the dashboard.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
