'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-black text-white mt-2 mb-4">{t('legal.privacyTitle').split(' | ')[0]}</h1>
          <p className="text-white/50 text-sm">{t('legal.lastUpdated', { date: currentDate })}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.infoWeCollect')}</h2>
            <p>{t('legal.infoWeCollectDesc')}</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>{t('legal.accountInfo')}</li>
              <li>{t('legal.attendanceData')}</li>
              <li>{t('legal.faceData')}</li>
              <li>{t('legal.leaveRequests')}</li>
              <li>{t('legal.taskAssignments')}</li>
              <li>{t('legal.profilePhotos')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.howWeUse')}</h2>
            <p>{t('legal.howWeUseDesc')}</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>{t('legal.provideMaintain')}</li>
              <li>{t('legal.processAttendance')}</li>
              <li>{t('legal.sendNotifications')}</li>
              <li>{t('legal.generateAnalytics')}</li>
              <li>{t('legal.ensureSecurity')}</li>
            </ul>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.cookies')}</h2>
            <p>{t('legal.cookiesDesc')}</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>{t('legal.maintainSession')}</li>
              <li>{t('legal.rememberPreferences')}</li>
              <li>{t('legal.analyzeUsage')}</li>
            </ul>
            <p className="mt-3">{t('legal.cookiesNote')}</p>
          </section>

          <section id="gdpr">
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.gdpr')}</h2>
            <p>{t('legal.gdprDesc')}</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li><strong className="text-white">{t('legal.rightOfAccess')}</strong></li>
              <li><strong className="text-white">{t('legal.rightToRectification')}</strong></li>
              <li><strong className="text-white">{t('legal.rightToErasure')}</strong></li>
              <li><strong className="text-white">{t('legal.rightToPortability')}</strong></li>
              <li><strong className="text-white">{t('legal.rightToObject')}</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.dataSecurity')}</h2>
            <p>{t('legal.dataSecurityDesc')}</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>{t('legal.encryption')}</li>
              <li>{t('legal.https')}</li>
              <li>{t('legal.convex')}</li>
              <li>{t('legal.vectors')}</li>
              <li>{t('legal.audits')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.dataRetention')}</h2>
            <p>{t('legal.dataRetentionDesc')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('legal.contactUs')}</h2>
            <p>{t('legal.contactUsDesc')}</p>
            <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-blue-400 font-medium">{t('legal.privacyEmail')}</p>
              <p className="text-white/50 text-sm mt-1">{t('legal.respondPrivacy')}</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex gap-4">
          <Link href="/terms" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">{t('legal.termsTitle').split(' | ')[0]}</Link>
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">{t('legal.backToHome')}</Link>
        </div>
      </div>
    </div>
  );
}
