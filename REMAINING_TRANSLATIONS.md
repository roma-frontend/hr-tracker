# 📋 Оставшиеся тексты для перевода

**Проблема:** Многие тексты в Landing все еще захардкожены

---

## 🔍 Что осталось заменить в LandingClient.tsx

### 1. FeaturesSection - строки 666-703

**Найти:**
```tsx
Every leave type,
```

**Заменить на:**
```tsx
{t('landing.everyLeaveType')},
```

**Найти:**
```tsx
From vacation days to sick leave, maternity to sabbaticals — configure unlimited leave categories with custom rules, balances, and approval workflows that match your unique policies.
```

**Заменить на:**
```tsx
{t('landing.everyLeaveTypeDesc')}
```

---

**Найти:**
```tsx
Automated compliance
```

**Заменить на:**
```tsx
{t('landing.automatedCompliance')}
```

**Найти:**
```tsx
Stay audit-ready with automated policy enforcement, accrual calculations, and regulatory reporting. Built-in compliance frameworks for FMLA, FLSA, and international labor laws.
```

**Заменить на:**
```tsx
{t('landing.automatedComplianceDesc')}
```

---

**Найти:**
```tsx
Real-time analytics
```

**Заменить на:**
```tsx
{t('landing.realTimeAnalytics')}
```

**Найти:**
```tsx
Predictive insights on leave patterns, team coverage gaps, and budget forecasting. Interactive dashboards with drill-down metrics for strategic workforce planning.
```

**Заменить на:**
```tsx
{t('landing.realTimeAnalyticsDesc')}
```

---

**Найти:**
```tsx
Enterprise integrations
```

**Заменить на:**
```tsx
{t('landing.enterpriseIntegrations')}
```

**Найти:**
```tsx
Seamless sync with Workday, BambooHR, ADP, and 50+ HRIS platforms. SSO via Okta, Azure AD. Slack & Teams notifications. REST API for custom workflows.
```

**Заменить на:**
```tsx
{t('landing.enterpriseIntegrationsDesc')}
```

---

### 2. CTABanner - строки 707-758

**Найти:**
```tsx
Ready to elevate your HR operations?
```

**Заменить на:**
```tsx
{t('landing.readyToElevate')}
```

**Найти:**
```tsx
Join elite organizations already leveraging <span className="...">HRLeave</span> to transform leave management into a competitive advantage.
```

**Заменить на:**
```tsx
{t('landing.joinEliteOrgs')} <span className="...">{t('landing.hrLeave')}</span> {t('landing.toTransform')}
```

---

**Найти:**
```tsx
Enterprise-grade reliability
```

**Заменить на:**
```tsx
{t('landing.enterpriseReliability')}
```

**Найти:**
```tsx
99.9% uptime SLA
```

**Заменить на:**
```tsx
{t('landing.uptimeSLA')}
```

**Найти:**
```tsx
SOC 2 Type II certified
```

**Заменить на:**
```tsx
{t('landing.soc2Certified')}
```

**Найти:**
```tsx
24/7 priority support
```

**Заменить на:**
```tsx
{t('landing.prioritySupport')}
```

---

### 3. Footer Categories - строки 867-872

**Найти:**
```tsx
<h3 ...>Product</h3>
<h3 ...>Account</h3>
```

**Заменить на:**
```tsx
<h3 ...>{t('landing.product')}</h3>
<h3 ...>{t('landing.account')}</h3>
```

---

### 4. Footer Copyright - строка 827

**Найти:**
```tsx
Premium HR leave management built for modern teams.
```

**Заменить на:**
```tsx
{t('landing.footerDescription')}
```

**Найти:**
```tsx
© 2024 HRLeave. All rights reserved.
```

**Заменить на:**
```tsx
{t('landing.copyright', { year: 2024 })}
```

---

## 📦 Ключи для добавления

### В en.json, hy.json, ru.json добавьте в раздел "landing":

```json
{
  "landing": {
    // ... существующие ключи
    "everyLeaveType": "Every leave type",
    "everyLeaveTypeDesc": "From vacation days to sick leave, maternity to sabbaticals — configure unlimited leave categories with custom rules, balances, and approval workflows that match your unique policies.",
    "automatedCompliance": "Automated compliance",
    "automatedComplianceDesc": "Stay audit-ready with automated policy enforcement, accrual calculations, and regulatory reporting. Built-in compliance frameworks for FMLA, FLSA, and international labor laws.",
    "realTimeAnalytics": "Real-time analytics",
    "realTimeAnalyticsDesc": "Predictive insights on leave patterns, team coverage gaps, and budget forecasting. Interactive dashboards with drill-down metrics for strategic workforce planning.",
    "enterpriseIntegrations": "Enterprise integrations",
    "enterpriseIntegrationsDesc": "Seamless sync with Workday, BambooHR, ADP, and 50+ HRIS platforms. SSO via Okta, Azure AD. Slack & Teams notifications. REST API for custom workflows.",
    "readyToElevate": "Ready to elevate your HR operations?",
    "joinEliteOrgs": "Join elite organizations already leveraging",
    "toTransform": "to transform leave management into a competitive advantage.",
    "enterpriseReliability": "Enterprise-grade reliability",
    "uptimeSLA": "99.9% uptime SLA",
    "soc2Certified": "SOC 2 Type II certified",
    "prioritySupport": "24/7 priority support",
    "product": "Product",
    "account": "Account",
    "footerDescription": "Premium HR leave management built for modern teams.",
    "copyright": "© {{year}} HRLeave. All rights reserved."
  }
}
```

### Переводы на армянский (hy.json):

```json
{
  "everyLeaveType": "Բոլոր արձակուրդի տեսակները",
  "everyLeaveTypeDesc": "Արձակուրդների օրերից մինչև հիվանդության արձակուրդ, մայրության մինչև արձակուրդ - կարգավորեք անսահմանափակ արձակուրդի կատեգորիաներ հատուկ կանոններով, մնացորդներով և հաստատման աշխատանքային հոսքերով, որոնք համապատասխանում են ձեր եզակի քաղաքականությանը:",
  "automatedCompliance": "Ավտոմատացված համապատասխանություն",
  "automatedComplianceDesc": "Մնացեք աուդիտի համար պատրաստ ավտոմատացված քաղաքականության կիրառմամբ, կուտակման հաշվարկներով և կարգավորող հաշվետվություններով: Ներդրված համապատասխանության շրջանակներ FMLA, FLSA և միջազգային աշխատանքային օրենքների համար:",
  "realTimeAnalytics": "Իրական ժամանակի վերլուծություն",
  "realTimeAnalyticsDesc": "Կանխատեսող պատկերացումներ արձակուրդների օրինաչափությունների, թիմի ծածկույթի բացերի և բյուջեի կանխատեսման վերաբերյալ: Ինտերակտիվ վահանակներ մանրամասն մետրիկայով՝ աշխատուժի ռազմավարական պլանավորման համար:",
  "enterpriseIntegrations": "Ձեռնարկատիրական ինտեգրացիաներ",
  "enterpriseIntegrationsDesc": "Անխափան սինխրոնիզացիա Workday, BambooHR, ADP և 50+ HRIS հարթակների հետ: SSO Okta, Azure AD-ի միջոցով: Slack և Teams ծանուցումներ: REST API հատուկ աշխատանքային հոսքերի համար:",
  "readyToElevate": "Պատրա՞ստ եք բարձրացնել ձեր HR գործառնությունները:",
  "joinEliteOrgs": "Միացեք էլիտար կազմակերպություններին, որոնք արդեն օգտագործում են",
  "toTransform": "արձակուրդների կառավարումը վերածելու մրցակցային առավելության:",
  "enterpriseReliability": "Ձեռնարկատիրական մակարդակի հուսալիություն",
  "uptimeSLA": "99.9% uptime SLA",
  "soc2Certified": "SOC 2 Type II սերտիֆիկացված",
  "prioritySupport": "24/7 առաջնահերթ աջակցություն",
  "product": "Արտադրանք",
  "account": "Հաշիվ",
  "footerDescription": "Պրեմիում HR արձակուրդների կառավարում ժամանակակից թիմերի համար:",
  "copyright": "© {{year}} HRLeave: Բոլոր իրավունքները պաշտպանված են:"
}
```

### Переводы на русский (ru.json):

```json
{
  "everyLeaveType": "Все типы отпусков",
  "everyLeaveTypeDesc": "От отпускных дней до больничного, от декретного до творческого отпуска - настройте неограниченное количество категорий отпусков с пользовательскими правилами, балансами и процессами утверждения, соответствующими вашим уникальным политикам.",
  "automatedCompliance": "Автоматизированное соответствие",
  "automatedComplianceDesc": "Будьте готовы к аудиту с автоматическим применением политик, расчетами начислений и регуляторной отчетностью. Встроенные фреймворки соответствия для FMLA, FLSA и международного трудового законодательства.",
  "realTimeAnalytics": "Аналитика в реальном времени",
  "realTimeAnalyticsDesc": "Прогнозные данные о шаблонах отпусков, пробелах в покрытии команды и прогнозировании бюджета. Интерактивные панели с детализированными метриками для стратегического планирования персонала.",
  "enterpriseIntegrations": "Корпоративные интеграции",
  "enterpriseIntegrationsDesc": "Бесшовная синхронизация с Workday, BambooHR, ADP и более чем 50 HRIS платформами. SSO через Okta, Azure AD. Уведомления в Slack и Teams. REST API для пользовательских рабочих процессов.",
  "readyToElevate": "Готовы поднять ваши HR операции на новый уровень?",
  "joinEliteOrgs": "Присоединяйтесь к элитным организациям, которые уже используют",
  "toTransform": "для превращения управления отпусками в конкурентное преимущество.",
  "enterpriseReliability": "Корпоративная надежность",
  "uptimeSLA": "99.9% uptime SLA",
  "soc2Certified": "SOC 2 Type II сертифицировано",
  "prioritySupport": "24/7 приоритетная поддержка",
  "product": "Продукт",
  "account": "Аккаунт",
  "footerDescription": "Премиум управление отпусками HR для современных команд.",
  "copyright": "© {{year}} HRLeave. Все права защищены."
}
```

---

## 🚀 Как применить

1. **Скопируйте ключи** в соответствующие файлы
2. **Выполните замены** в LandingClient.tsx по списку выше
3. **Перезагрузите страницу**
4. **Переключите язык** - все должно переводиться!

---

**Создано:** AI Assistant  
**Итераций осталось:** 2  
**Всего осталось заменить:** ~20 текстов
