'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateOrganization } from '@/hooks/useOrganizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Globe, Clock, MapPin, Briefcase, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SuperadminCreateOrgPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const createOrgMutation = useCreateOrganization();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'starter' as 'starter' | 'professional' | 'enterprise',
    timezone: 'UTC',
    country: '',
    industry: '',
    adminEmail: '',
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <div className="animate-pulse text-(--text-muted)">Loading user data...</div>
      </div>
    );
  }

  const isSuperadmin =
    user?.role === 'superadmin' || user?.email?.toLowerCase() === 'romangulanyan@gmail.com';

  if (!isSuperadmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background) p-4">
        <Card className="w-full max-w-md border-(--border) bg-(--card)">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-(--destructive)/10 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-(--destructive)" />
            </div>
            <CardTitle className="text-2xl text-(--text-primary)">{t('ui.accessDenied')}</CardTitle>
            <CardDescription className="text-(--text-secondary)">
              {t('ui.onlySuperadminCanAccess')}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2 text-sm text-(--text-muted)">
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{t('ui.role')}: {user.role}</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error(t('toasts.userIdNotFound'));
      return;
    }

    if (!formData.name || !formData.slug || !formData.adminEmail) {
      toast.error(t('toasts.pleaseFillAllFields'));
      return;
    }

    setLoading(true);

    try {
      toast.info(t('superadmin.creatingOrg', 'Creating {{name}} organization...', { name: formData.name }));

      await createOrgMutation.mutateAsync({
        name: formData.name,
        slug: formData.slug,
        plan: formData.plan,
        timezone: formData.timezone,
        country: formData.country,
        industry: formData.industry,
      });

      toast.success(t('superadmin.orgCreated', 'Organization "{{name}}" created successfully!', { name: formData.name }));
      toast.info(t('superadmin.adminInvitationSent', 'Admin invitation will be sent to {{email}}', { email: formData.adminEmail }));

      setFormData({
        name: '',
        slug: '',
        plan: 'starter',
        timezone: 'UTC',
        country: '',
        industry: '',
        adminEmail: '',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create organization';
      console.error('Full error:', error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    { value: 'starter', label: t('superadmin.organizations.planStarterFree'), description: 'Up to 50 users, Basic features' },
    { value: 'professional', label: t('superadmin.organizations.planProfessionalPaid'), description: 'Up to 500 users, Advanced features' },
    { value: 'enterprise', label: t('superadmin.organizations.planEnterpriseCustom'), description: 'Unlimited users, Custom features' },
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Yerevan', label: 'Yerevan (AMT)' },
  ];

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
            {t('superadmin.organizations.createTitle')}
          </h1>
          <p className="text-(--text-secondary)">
            {t('superadmin.organizations.createSubtitle')}
          </p>
        </div>

        <Card className="border-(--border) bg-(--card) shadow-(--shadow-lg)">
          <CardHeader>
            <CardTitle className="text-xl text-(--text-primary) flex items-center gap-2">
              <Building2 className="w-5 h-5 text-(--primary)" />
              Organization Details
            </CardTitle>
            <CardDescription className="text-(--text-secondary)">
              Fill in the information to create a new organization
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-(--primary)" />
                    {t('superadmin.organizations.nameLabel')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-(--input-border) bg-(--background) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 focus:border-(--primary) transition-colors placeholder:text-(--text-muted)"
                    placeholder={t('placeholders.acmeCorp')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                    <Globe className="w-4 h-4 text-(--primary)" />
                    {t('superadmin.organizations.slugLabel')}
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-(--input-border) bg-(--background) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 focus:border-(--primary) transition-colors placeholder:text-(--text-muted)"
                    placeholder={t('placeholders.acmeInc')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                    <Mail className="w-4 h-4 text-(--primary)" />
                    {t('superadmin.organizations.adminEmailLabel')}
                  </label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-(--input-border) bg-(--background) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 focus:border-(--primary) transition-colors placeholder:text-(--text-muted)"
                    placeholder={t('placeholders.enterYourEmail')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-(--primary)" />
                    {t('superadmin.organizations.planLabel')}
                  </label>
                  <select
                    value={formData.plan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        plan: e.target.value as 'starter' | 'professional' | 'enterprise',
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-(--input-border) bg-(--background) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 focus:border-(--primary) transition-colors"
                  >
                    {plans.map((plan) => (
                      <option key={plan.value} value={plan.value}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-(--primary)" />
                    {t('superadmin.organizations.countryLabel')}
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-(--input-border) bg-(--background) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 focus:border-(--primary) transition-colors placeholder:text-(--text-muted)"
                    placeholder={t('placeholders.unitedStates')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                    <Clock className="w-4 h-4 text-(--primary)" />
                    {t('superadmin.organizations.timezoneLabel')}
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-(--input-border) bg-(--background) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 focus:border-(--primary) transition-colors"
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-(--primary)" />
                  {t('superadmin.organizations.industryLabel')}
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-(--input-border) bg-(--background) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 focus:border-(--primary) transition-colors placeholder:text-(--text-muted)"
                  placeholder={t('placeholders.technologyHealthcare')}
                />
              </div>

              <div className="pt-4">
                <p className="text-sm font-semibold text-(--text-primary) mb-3">{t('superadmin.selectedPlan')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {plans.map((plan) => (
                    <div
                      key={plan.value}
                      onClick={() => setFormData({ ...formData, plan: plan.value as any })}
                      className={cn(
                        'p-4 rounded-lg border-2 cursor-pointer transition-all',
                        formData.plan === plan.value
                          ? 'border-(--primary) bg-(--primary)/5'
                          : 'border-(--border) bg-(--background) hover:border-(--primary)/50'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-(--text-primary)">{plan.label}</span>
                        {formData.plan === plan.value && (
                          <CheckCircle2 className="w-5 h-5 text-(--primary)" />
                        )}
                      </div>
                      <p className="text-xs text-(--text-secondary)">{plan.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-(--primary) hover:bg-(--primary-hover) text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? t('superadmin.organizations.creating')
                  : t('superadmin.organizations.createOrganization')}
              </Button>
              <p className="text-xs text-(--text-secondary) sm:ml-auto flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {t('superadmin.organizations.requiredNotice')}
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
