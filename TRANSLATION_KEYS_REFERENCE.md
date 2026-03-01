# Translation Keys Quick Reference Guide

## How to Use the New Translation Keys

### Basic Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('legal.acceptance')}</h1>
      <p>{t('newsletter.stayInTheLoop')}</p>
    </div>
  );
}
```

## Key Naming Convention

All new translation keys follow this pattern:
```
{section}.{keyName}
```

Examples:
- `legal.acceptance` - Legal section, acceptance key
- `newsletter.subscribe` - Newsletter section, subscribe button
- `testimonials.sarahTestimonial` - Testimonials section, Sarah's testimonial
- `upgradeModal.unlockFeature` - Upgrade modal section, unlock feature text

## Complete Key Listing

### Legal Section Keys

#### Terms of Service Subsection
```
legal.termsTitle
legal.termsDescription
legal.acceptance
legal.acceptanceDesc
legal.useOfServices
legal.useOfServicesDesc
legal.realtimeTracking
legal.leaveManagement
legal.taskManagement
legal.employeeAnalytics
legal.aiAssistant
legal.userResponsibilities
legal.userResponsibilitiesDesc
legal.maintainConfidentiality
legal.allActivities
legal.ensureAccurate
legal.complyLaws
legal.notAttemptAccess
legal.adminResponsibilities
legal.adminResponsibilitiesDesc
legal.manageAccess
legal.ensureConsent
legal.complyLocal
legal.configureSchedules
legal.intellectualProperty
legal.intellectualPropertyDesc
legal.limitationLiability
legal.limitationLiabilityDesc
legal.serviceAvailability
legal.serviceAvailabilityDesc
legal.termination
legal.terminationDesc
legal.changesTerms
legal.changesTermsDesc
legal.contactSection
legal.contactSectionDesc
legal.legalEmail
legal.respondWithin
```

#### Privacy Policy Subsection
```
legal.privacyTitle
legal.privacyDescription
legal.privacyPolicy
legal.termsOfService
legal.legal
legal.lastUpdated
legal.infoWeCollect
legal.infoWeCollectDesc
legal.accountInfo
legal.attendanceData
legal.faceData
legal.leaveRequests
legal.taskAssignments
legal.profilePhotos
legal.howWeUse
legal.howWeUseDesc
legal.provideMaintain
legal.processAttendance
legal.sendNotifications
legal.generateAnalytics
legal.ensureSecurity
legal.cookies
legal.cookiesDesc
legal.maintainSession
legal.rememberPreferences
legal.analyzeUsage
legal.cookiesNote
legal.gdpr
legal.gdprDesc
legal.rightOfAccess
legal.rightToRectification
legal.rightToErasure
legal.rightToPortability
legal.rightToObject
legal.dataSecurity
legal.dataSecurityDesc
legal.encryption
legal.https
legal.convex
legal.vectors
legal.audits
legal.dataRetention
legal.dataRetentionDesc
legal.contactUs
legal.contactUsDesc
legal.privacyEmail
legal.respondPrivacy
```

### Newsletter Section Keys
```
newsletter.stayInTheLoop
newsletter.newsLetterDesc
newsletter.enterYourEmail
newsletter.subscribe
newsletter.subscribing
newsletter.successfullySubscribed
newsletter.youreSubscribed
newsletter.privacyRespect
newsletter.invalidEmailAddress
```

### Testimonials Section Keys
```
testimonials.testimonials
testimonials.lovedByEliteTeams
testimonials.testimonialsDesc
testimonials.sarahJohnson
testimonials.hrDirector
testimonials.techCorpInc
testimonials.sarahTestimonial
testimonials.michaelChen
testimonials.operationsManager
testimonials.globalTech
testimonials.michaelTestimonial
testimonials.emilyRodriguez
testimonials.chiefPeopleOfficer
testimonials.innovateLLC
testimonials.emilyTestimonial
```

### Social Proof Section Keys
```
socialProof.activeUsers
socialProof.customerRating
socialProof.uptime
socialProof.countries
socialProof.activeUsersValue
socialProof.ratingValue
socialProof.uptimeValue
socialProof.countriesValue
```

### Feature Card Section Keys
```
featureCard.learnMore
```

### Mobile Menu Section Keys
```
mobileMenu.home
mobileMenu.features
mobileMenu.analytics
mobileMenu.pricing
mobileMenu.about
mobileMenu.signIn
mobileMenu.getStartedFree
mobileMenu.closeMenu
mobileMenu.skipToMainContent
mobileMenu.openMobileMenu
```

### Upgrade Modal Section Keys
```
upgradeModal.unlockFeature
upgradeModal.upgradeYourPlan
upgradeModal.chooseAPlan
upgradeModal.starterPrice
upgradeModal.professionalPrice
upgradeModal.enterprisePrice
upgradeModal.upTo10Employees
upgradeModal.upTo50Employees
upgradeModal.unlimitedEmployees
upgradeModal.basicLeaveTracking
upgradeModal.advancedAnalyticsReports
upgradeModal.advancedPermissions
upgradeModal.calendarSyncGoogleOutlook
upgradeModal.everythingInProfessional
upgradeModal.customIntegrations
upgradeModal.whiteLabelSolution
upgradeModal.dedicatedAccountManager
upgradeModal.slaGuarantee
upgradeModal.upgradeTo
upgradeModal.upgradeToStarter
upgradeModal.upgradeToProfessional
upgradeModal.upgradeToEnterprise
upgradeModal.currentPlan
upgradeModal.popular
upgradeModal.paymentSecured
upgradeModal.selectPlan
```

### Plan Gate Section Keys
```
planGate.upgradeRequired
planGate.upgradeRequiredDesc
planGate.upgradeBtn
```

### Subscription Plan Card Section Keys
```
subscriptionPlanCard.subscriptionPlan
subscriptionPlanCard.currentPlanFeatures
subscriptionPlanCard.noSubscription
subscriptionPlanCard.trial
subscriptionPlanCard.active
subscriptionPlanCard.pastDue
subscriptionPlanCard.canceled
subscriptionPlanCard.advancedAnalytics
subscriptionPlanCard.reportsCSVExport
subscriptionPlanCard.aiLeaveAssistant
subscriptionPlanCard.slaManagement
subscriptionPlanCard.calendarSync
subscriptionPlanCard.integrations
subscriptionPlanCard.upToEmployees
subscriptionPlanCard.includedInYourPlan
subscriptionPlanCard.trialDaysRemaining
subscriptionPlanCard.paymentFailed
subscriptionPlanCard.cancelAtPeriodEnd
subscriptionPlanCard.upgradeYourPlan
subscriptionPlanCard.day
subscriptionPlanCard.days
```

## Template Variables

Some keys use template variables that are filled in at runtime:

### Legal Section
- `legal.lastUpdated` → Uses `{{date}}` 
  ```typescript
  t('legal.lastUpdated', { date: new Date().toLocaleDateString() })
  ```

### Upgrade Modal
- `upgradeModal.unlockFeature` → Uses `{{feature}}`
  ```typescript
  t('upgradeModal.unlockFeature', { feature: 'Advanced Analytics' })
  ```

- `upgradeModal.upgradeTo` → Uses `{{plan}}`
  ```typescript
  t('upgradeModal.upgradeTo', { plan: 'Professional' })
  ```

### Subscription Plan Card
- `subscriptionPlanCard.upToEmployees` → Uses `{{count}}`
  ```typescript
  t('subscriptionPlanCard.upToEmployees', { count: 50 })
  ```

- `subscriptionPlanCard.trialDaysRemaining` → Uses `{{days}}` and `{{plural}}`
  ```typescript
  const days = 5;
  t('subscriptionPlanCard.trialDaysRemaining', { 
    days, 
    plural: days === 1 ? '' : 's' 
  })
  ```

- `subscriptionPlanCard.cancelAtPeriodEnd` → Uses `{{date}}`
  ```typescript
  t('subscriptionPlanCard.cancelAtPeriodEnd', { 
    date: periodEndDate.toLocaleDateString() 
  })
  ```

## Component Integration Examples

### Legal Pages
```typescript
// For Terms of Service Page
<h1>{t('legal.acceptance')}</h1>
<p>{t('legal.acceptanceDesc')}</p>

// For Privacy Policy Page
<h1>{t('legal.privacyPolicy')}</h1>
<p>{t('legal.infoWeCollect')}</p>
<ul>
  <li>{t('legal.accountInfo')}</li>
  <li>{t('legal.attendanceData')}</li>
</ul>
```

### Newsletter Component
```typescript
<input 
  placeholder={t('newsletter.enterYourEmail')}
/>
<button>{t('newsletter.subscribe')}</button>
{isSubmitted && <p>{t('newsletter.youreSubscribed')}</p>}
```

### Upgrade Modal
```typescript
<h2>{t('upgradeModal.upgradeYourPlan')}</h2>
<div>
  <h3>{t('upgradeModal.starterPrice')}</h3>
  <p>{t('upgradeModal.upTo10Employees')}</p>
</div>
<button>
  {t('upgradeModal.upgradeTo', { plan: 'Professional' })}
</button>
```

### Testimonials
```typescript
{testimonials.map(testimonial => (
  <div key={testimonial.id}>
    <p>{t(`testimonials.${testimonial.key}`)}</p>
    <p>{t('testimonials.sarahJohnson')}</p>
    <p>{t('testimonials.hrDirector')}</p>
  </div>
))}
```

## File Locations

All translation files are located at:
```
Desktop/office/src/i18n/locales/
├── en.json     (English)
├── ru.json     (Russian)
└── hy.json     (Armenian)
```

## Translation Status

| Language | Keys | Status |
|----------|------|--------|
| English | 188+ | ✅ Complete |
| Russian | 160+ | ✅ Complete |
| Armenian | 150+ | ✅ Complete |

## Notes for Maintainers

1. **Adding New Keys:** Follow the naming convention `section.keyName`
2. **Editing Keys:** Edit in all three language files simultaneously
3. **Template Variables:** Use camelCase for variable names, enclosed in `{{variableName}}`
4. **Testing:** Always test translations in all three languages
5. **Missing Translations:** The app will show the key name if a translation is missing

## Support

For questions about translation keys:
- Check this reference guide
- Review the TRANSLATION_KEYS_SUMMARY.md for detailed documentation
- Search for the key in the appropriate language JSON file
