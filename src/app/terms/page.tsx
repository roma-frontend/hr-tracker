'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function TermsPage() {
  const { t } = useTranslation();

  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          {t('legal.backToHome')}
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">{t('legal.legal')}</span>
          <h1 className="text-4xl font-black text-white mt-2 mb-4">{t('legal.termsTitle').split(' | ')[0]}</h1>
          <p className="text-white/50 text-sm">{t('legal.lastUpdated', { date: currentDate })}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.acceptance')}</h2>
            <p>{t('legal.acceptanceDesc')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.useOfServices')}</h2>
            <p>{t('legal.useOfServicesDesc')}</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>{t('legal.realtimeTracking')}</li>
              <li>{t('legal.leaveManagement')}</li>
              <li>{t('legal.taskManagement')}</li>
              <li>{t('legal.employeeAnalytics')}</li>
              <li>{t('legal.aiAssistant')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.userResponsibilities')}</h2>
            <p>{t('legal.userResponsibilitiesDesc')}</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>{t('legal.maintainConfidentiality')}</li>
              <li>{t('legal.allActivities')}</li>
              <li>{t('legal.ensureAccurate')}</li>
              <li>{t('legal.complyLaws')}</li>
              <li>{t('legal.notAttemptAccess')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.adminResponsibilities')}</h2>
            <p>{t('legal.adminResponsibilitiesDesc')}</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>{t('legal.manageAccess')}</li>
              <li>{t('legal.ensureConsent')}</li>
              <li>{t('legal.complyLocal')}</li>
              <li>{t('legal.configureSchedules')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.intellectualProperty')}</h2>
            <p>{t('legal.intellectualPropertyDesc')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.limitationLiability')}</h2>
            <p>{t('legal.limitationLiabilityDesc')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.serviceAvailability')}</h2>
            <p>{t('legal.serviceAvailabilityDesc')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.termination')}</h2>
            <p>{t('legal.terminationDesc')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.changesTerms')}</h2>
            <p>{t('legal.changesTermsDesc')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.contactSection')}</h2>
            <p>{t('legal.contactSectionDesc')}</p>
            <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-blue-400 font-medium">{t('legal.legalEmail')}</p>
              <p className="text-white/50 text-sm mt-1">{t('legal.respondWithin')}</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex gap-4">
          <Link href="/privacy" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">{t('legal.privacyPolicy')}</Link>
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">{t('legal.backToHome')}</Link>
        </div>
      </div>
    </div>
  );
}
