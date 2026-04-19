'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRequestJoinOrganization } from '@/hooks/useOrganizations';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Search, CheckCircle2, Globe, Briefcase } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-(--card-border) shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--secondary)] border border-(--border-subtle) mx-auto mb-4">
              <Building2 className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <CardTitle as="h1" className="text-2xl">
              {t('onboarding.selectOrganization', 'Select Your Organization')}
            </CardTitle>
            <CardDescription className="max-w-md mx-auto">
              {t(
                'onboarding.selectOrgDesc',
                'Choose the organization you want to join. Your request will be sent to administrators for approval.',
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <Input
                type="text"
                placeholder={t('onboarding.searchOrg', 'Search organizations...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[var(--background-subtle)] border-(--input-border) focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]"
              />
            </div>

            <div className="space-y-3">
              {!organizations ? (
                <div className="flex items-center justify-center py-12">
                  <ShieldLoader size="md" variant="inline" />
                </div>
              ) : filteredOrgs?.length === 0 ? (
                <Card variant="subtle">
                  <CardContent className="py-8 text-center text-[var(--text-muted)]">
                    {searchQuery
                      ? t('onboarding.noOrgFound', t('onboarding.noOrgsFound'))
                      : t('onboarding.noOrgs', t('onboarding.noOrgsAvailable'))}
                  </CardContent>
                </Card>
              ) : (
                filteredOrgs?.map((org) => (
                  <Card
                    key={org.id}
                    className="group hover:shadow-md hover:border-(--card-border-elevated) transition-all duration-200 cursor-pointer border-(--card-border)"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0 w-12 h-12 rounded-lg bg-[var(--secondary)] border border-(--border-subtle) flex items-center justify-center overflow-hidden">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-semibold text-[var(--primary)]">
                              {org.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
                            {org.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] mt-0.5">
                            <span className="truncate">@{org.slug}</span>
                            {org.industry && (
                              <>
                                <span className="shrink-0">·</span>
                                <span className="flex items-center gap-1 truncate">
                                  <Briefcase className="w-3 h-3 shrink-0" />
                                  {org.industry}
                                </span>
                              </>
                            )}
                            {org.country && (
                              <>
                                <span className="shrink-0">·</span>
                                <span className="flex items-center gap-1 truncate">
                                  <Globe className="w-3 h-3 shrink-0" />
                                  {org.country}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRequestJoin(org.id);
                          }}
                          disabled={isRequesting === org.id || !user?.id}
                          variant="secondary"
                          size="sm"
                          className="shrink-0"
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
                              <CheckCircle2 className="w-4 h-4" />
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

            <div className="text-center text-sm text-[var(--text-muted)] pt-2 border-t border-(--border-subtle)">
              <p>
                {t(
                  'onboarding.afterJoin',
                  "After joining, you'll need to wait for administrator approval before accessing the dashboard.",
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
