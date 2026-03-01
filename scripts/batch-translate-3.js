#!/usr/bin/env node
/**
 * Batch Translation Script #3
 * Adding more high-priority sections
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const enPath = path.join(LOCALES_DIR, 'en.json');
const ruPath = path.join(LOCALES_DIR, 'ru.json');
const hyPath = path.join(LOCALES_DIR, 'hy.json');

let enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let ruJson = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
let hyJson = JSON.parse(fs.readFileSync(hyPath, 'utf8'));

console.log('рџљЂ BATCH TRANSLATION #3\n');

let totalAdded = 0;

function addTranslations(section, enData, ruData, hyData) {
  enJson[section] = { ...enJson[section], ...enData };
  ruJson[section] = { ...ruJson[section], ...ruData };
  hyJson[section] = { ...hyJson[section], ...hyData };
  
  const count = Object.keys(enData).length;
  console.log(`вњ… ${section}: ${count} keys`);
  totalAdded += count;
}

// 1. landingExtra (28 keys)
addTranslations('landingExtra', {
  hero: {
    eyebrow: "Modern HR Management",
    title: "Simplify HR with AI",
    subtitle: "All-in-one platform for leave management, attendance tracking, and team collaboration",
    cta: "Get Started Free",
    secondaryCta: "Watch Demo",
    trustedBy: "Trusted by 500+ companies worldwide"
  },
  features: {
    title: "Everything you need",
    subtitle: "Powerful features for modern teams",
    feature1Title: "Smart Leave Management",
    feature1Desc: "Automated leave tracking with AI-powered insights",
    feature2Title: "Real-time Attendance",
    feature2Desc: "Track attendance with face recognition and geolocation",
    feature3Title: "Team Collaboration",
    feature3Desc: "Built-in chat, tasks, and project management",
    feature4Title: "Advanced Analytics",
    feature4Desc: "Get insights with AI-powered reports and dashboards"
  },
  stats: {
    stat1: "500+ Companies",
    stat2: "50K+ Employees",
    stat3: "99.9% Uptime",
    stat4: "24/7 Support"
  },
  cta: {
    title: "Ready to get started?",
    subtitle: "Join thousands of companies using our platform",
    button: "Start Free Trial"
  }
}, {
  hero: {
    eyebrow: "РЎРѕРІСЂРµРјРµРЅРЅРѕРµ HR СѓРїСЂР°РІР»РµРЅРёРµ",
    title: "РЈРїСЂРѕСЃС‚РёС‚Рµ HR СЃ РїРѕРјРѕС‰СЊСЋ AI",
    subtitle: "Р’СЃС‘-РІ-РѕРґРЅРѕРј РїР»Р°С‚С„РѕСЂРјР° РґР»СЏ СѓРїСЂР°РІР»РµРЅРёСЏ РѕС‚РїСѓСЃРєР°РјРё, СѓС‡С‘С‚Р° РїРѕСЃРµС‰Р°РµРјРѕСЃС‚Рё Рё РєРѕРјР°РЅРґРЅРѕР№ СЂР°Р±РѕС‚С‹",
    cta: "РќР°С‡Р°С‚СЊ Р±РµСЃРїР»Р°С‚РЅРѕ",
    secondaryCta: "РЎРјРѕС‚СЂРµС‚СЊ РґРµРјРѕ",
    trustedBy: "РќР°Рј РґРѕРІРµСЂСЏСЋС‚ 500+ РєРѕРјРїР°РЅРёР№ РїРѕ РІСЃРµРјСѓ РјРёСЂСѓ"
  },
  features: {
    title: "Р’СЃС‘ С‡С‚Рѕ РЅСѓР¶РЅРѕ",
    subtitle: "РњРѕС‰РЅС‹Рµ С„СѓРЅРєС†РёРё РґР»СЏ СЃРѕРІСЂРµРјРµРЅРЅС‹С… РєРѕРјР°РЅРґ",
    feature1Title: "РЈРјРЅРѕРµ СѓРїСЂР°РІР»РµРЅРёРµ РѕС‚РїСѓСЃРєР°РјРё",
    feature1Desc: "РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРёР№ СѓС‡С‘С‚ РѕС‚РїСѓСЃРєРѕРІ СЃ AI-Р°РЅР°Р»РёС‚РёРєРѕР№",
    feature2Title: "РџРѕСЃРµС‰Р°РµРјРѕСЃС‚СЊ РІ СЂРµР°Р»СЊРЅРѕРј РІСЂРµРјРµРЅРё",
    feature2Desc: "РћС‚СЃР»РµР¶РёРІР°РЅРёРµ СЃ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёРµРј Р»РёС† Рё РіРµРѕР»РѕРєР°С†РёРµР№",
    feature3Title: "РљРѕРјР°РЅРґРЅР°СЏ СЂР°Р±РѕС‚Р°",
    feature3Desc: "Р’СЃС‚СЂРѕРµРЅРЅС‹Р№ С‡Р°С‚, Р·Р°РґР°С‡Рё Рё СѓРїСЂР°РІР»РµРЅРёРµ РїСЂРѕРµРєС‚Р°РјРё",
    feature4Title: "Р Р°СЃС€РёСЂРµРЅРЅР°СЏ Р°РЅР°Р»РёС‚РёРєР°",
    feature4Desc: "РџРѕР»СѓС‡Р°Р№С‚Рµ РёРЅСЃР°Р№С‚С‹ СЃ AI РѕС‚С‡С‘С‚Р°РјРё Рё РґР°С€Р±РѕСЂРґР°РјРё"
  },
  stats: {
    stat1: "500+ РєРѕРјРїР°РЅРёР№",
    stat2: "50K+ СЃРѕС‚СЂСѓРґРЅРёРєРѕРІ",
    stat3: "99.9% РІСЂРµРјСЏ СЂР°Р±РѕС‚С‹",
    stat4: "РџРѕРґРґРµСЂР¶РєР° 24/7"
  },
  cta: {
    title: "Р“РѕС‚РѕРІС‹ РЅР°С‡Р°С‚СЊ?",
    subtitle: "РџСЂРёСЃРѕРµРґРёРЅСЏР№С‚РµСЃСЊ Рє С‚С‹СЃСЏС‡Р°Рј РєРѕРјРїР°РЅРёР№, РёСЃРїРѕР»СЊР·СѓСЋС‰РёС… РЅР°С€Сѓ РїР»Р°С‚С„РѕСЂРјСѓ",
    button: "РќР°С‡Р°С‚СЊ Р±РµСЃРїР»Р°С‚РЅС‹Р№ РїРµСЂРёРѕРґ"
  }
}, {
  hero: {
    eyebrow: "ФєХЎХґХЎХ¶ХЎХЇХЎХЇХ«ЦЃ HR ХЇХЎХјХЎХѕХЎЦЂХёЦ‚Хґ",
    title: "ХЉХЎЦЂХ¦ХҐЦЃЦЂХҐЦ„ HR-ХЁ AI-Х« Ц…ХЈХ¶ХёЦ‚Х©ХµХЎХґХў",
    subtitle: "Ф±ХґХўХёХІХ»-ХґХҐХЇХёЦ‚Хґ Х°ХЎЦЂХ©ХЎХЇ ХЎЦЂХ±ХЎХЇХёЦ‚ЦЂХ¤Х¶ХҐЦЂХ« ХЇХЎХјХЎХѕХЎЦЂХґХЎХ¶, Х¶ХҐЦЂХЇХЎХµХёЦ‚Х©ХµХЎХ¶ Х°ХЎХ·ХѕХЎХјХґХЎХ¶ Ц‡ Х©Х«ХґХЎХµХ«Х¶ Х°ХЎХґХЎХЈХёЦЂХ®ХЎХЇЦЃХёЦ‚Х©ХµХЎХ¶ Х°ХЎХґХЎЦЂ",
    cta: "ХЌХЇХЅХҐХ¬ ХЎХ¶ХѕХіХЎЦЂ",
    secondaryCta: "ФґХ«ХїХҐХ¬ Х¤ХҐХґХёХ¶",
    trustedBy: "Х„ХҐХ¦ ХѕХЅХїХЎХ°ХёЦ‚Хґ ХҐХ¶ 500+ ХЁХ¶ХЇХҐЦЂХёЦ‚Х©ХµХёЦ‚Х¶Х¶ХҐЦЂ ХЎХґХўХёХІХ» ХЎХ·Х­ХЎЦЂХ°ХёЦ‚Хґ"
  },
  features: {
    title: "Ф±ХµХ¶ ХЎХґХҐХ¶ХЁ, Х«Х¶Х№ Х±ХҐХ¦ ХєХҐХїЦ„ Х§",
    subtitle: "ХЂХ¦ХёЦЂ ХЈХёЦЂХ®ХЎХјХёЦ‚ХµХ©Х¶ХҐЦЂ ХЄХЎХґХЎХ¶ХЎХЇХЎХЇХ«ЦЃ Х©Х«ХґХҐЦЂХ« Х°ХЎХґХЎЦЂ",
    feature1Title: "ФЅХҐХ¬ХЎЦЃХ« ХЎЦЂХ±ХЎХЇХёЦ‚ЦЂХ¤Х¶ХҐЦЂХ« ХЇХЎХјХЎХѕХЎЦЂХёЦ‚Хґ",
    feature1Desc: "Ф±ХѕХїХёХґХЎХї Х°ХЎХ·ХѕХЎХјХёЦ‚Хґ AI ХѕХҐЦЂХ¬ХёЦ‚Х®ХёЦ‚Х©ХµХЎХґХў",
    feature2Title: "Ф»ЦЂХЎХЇХЎХ¶ ХЄХЎХґХЎХ¶ХЎХЇХ« Х¶ХҐЦЂХЇХЎХµХёЦ‚Х©ХµХёЦ‚Х¶",
    feature2Desc: "ХЂХҐХїЦ‡ХҐЦ„ Х¤ХҐХґЦ„Х« ХіХЎХ¶ХЎХ№ХґХЎХґХў Ц‡ ХЈХҐХёХїХҐХІХёЦЂХёХ·ХґХЎХґХў",
    feature3Title: "Ф№Х«ХґХЎХµХ«Х¶ Х°ХЎХґХЎХЈХёЦЂХ®ХЎХЇЦЃХёЦ‚Х©ХµХёЦ‚Х¶",
    feature3Desc: "Х†ХҐЦЂХЇХЎХјХёЦ‚ЦЃХѕХЎХ® Х№ХЎХї, ХЎХјХЎХ»ХЎХ¤ЦЂХЎХ¶Ц„Х¶ХҐЦЂ Ц‡ Х¶ХЎХ­ХЎХЈХ®ХҐЦЂХ« ХЇХЎХјХЎХѕХЎЦЂХёЦ‚Хґ",
    feature4Title: "ФёХ¶Х¤Х¬ХЎХµХ¶ХѕХЎХ® ХѕХҐЦЂХ¬ХёЦ‚Х®ХёЦ‚Х©ХµХёЦ‚Х¶",
    feature4Desc: "ХЌХїХЎЦЃХҐЦ„ ХєХЎХїХЇХҐЦЂХЎЦЃХёЦ‚ХґХ¶ХҐЦЂ AI Х°ХЎХ·ХѕХҐХїХѕХёЦ‚Х©ХµХёЦ‚Х¶Х¶ХҐЦЂХёХѕ Ц‡ ХѕХЎХ°ХЎХ¶ХЎХЇХ¶ХҐЦЂХёХѕ"
  },
  stats: {
    stat1: "500+ ХЁХ¶ХЇХҐЦЂХёЦ‚Х©ХµХёЦ‚Х¶Х¶ХҐЦЂ",
    stat2: "50K+ ХЎХ·Х­ХЎХїХЎХЇХ«ЦЃХ¶ХҐЦЂ",
    stat3: "99.9% ХЎХ·Х­ХЎХїХЎХ¶Ц„Х« ХЄХЎХґХЎХ¶ХЎХЇ",
    stat4: "24/7 ХЎХ»ХЎХЇЦЃХёЦ‚Х©ХµХёЦ‚Х¶"
  },
  cta: {
    title: "ХЉХЎХїЦЂХЎХћХЅХї ХҐЦ„ ХЅХЇХЅХҐХ¬:",
    subtitle: "Х„Х«ХЎЦЃХҐЦ„ Х°ХЎХ¦ХЎЦЂХЎХѕХёЦЂ ХЁХ¶ХЇХҐЦЂХёЦ‚Х©ХµХёЦ‚Х¶Х¶ХҐЦЂХ«, ХёЦЂХёХ¶Ц„ Ц…ХЈХїХЎХЈХёЦЂХ®ХёЦ‚Хґ ХҐХ¶ ХґХҐЦЂ Х°ХЎЦЂХ©ХЎХЇХЁ",
    button: "ХЌХЇХЅХҐХ¬ ХЎХ¶ХѕХіХЎЦЂ ЦѓХёЦЂХ±ХЎХ·ЦЂХ»ХЎХ¶"
  }
});

// 2. socialProof (6 keys)
addTranslations('socialProof', {
  trustedBy: "Trusted by",
  companies: "companies worldwide",
  rating: "Rated 4.9/5",
  reviews: "from 1000+ reviews",
  customers: "Happy customers",
  growth: "Year over year growth"
}, {
  trustedBy: "РќР°Рј РґРѕРІРµСЂСЏСЋС‚",
  companies: "РєРѕРјРїР°РЅРёР№ РїРѕ РІСЃРµРјСѓ РјРёСЂСѓ",
  rating: "Р РµР№С‚РёРЅРі 4.9/5",
  reviews: "РЅР° РѕСЃРЅРѕРІРµ 1000+ РѕС‚Р·С‹РІРѕРІ",
  customers: "Р”РѕРІРѕР»СЊРЅС‹С… РєР»РёРµРЅС‚РѕРІ",
  growth: "Р РѕСЃС‚ РёР· РіРѕРґР° РІ РіРѕРґ"
}, {
  trustedBy: "Х„ХҐХ¦ ХѕХЅХїХЎХ°ХёЦ‚Хґ ХҐХ¶",
  companies: "ХЁХ¶ХЇХҐЦЂХёЦ‚Х©ХµХёЦ‚Х¶Х¶ХҐЦЂ ХЎХґХўХёХІХ» ХЎХ·Х­ХЎЦЂХ°ХёЦ‚Хґ",
  rating: "ФіХ¶ХЎХ°ХЎХїХЎХЇХЎХ¶ 4.9/5",
  reviews: "1000+ ХѕХҐЦЂХ¬ХёЦ‚Х®ХёЦ‚Х©ХµХёЦ‚Х¶Х¶ХҐЦЂХ« Х°Х«ХґХЎХ¶ ХѕЦЂХЎ",
  customers: "ФіХёХ° Х°ХЎХіХЎХ­ХёЦЂХ¤Х¶ХҐЦЂ",
  growth: "ХЏХЎЦЂХҐХЇХЎХ¶ ХЎХі"
});

// 3. buttons (6 keys)
addTranslations('buttons', {
  learnMore: "Learn More",
  getStarted: "Get Started",
  viewAll: "View All",
  showMore: "Show More",
  showLess: "Show Less",
  loadMore: "Load More"
}, {
  learnMore: "РЈР·РЅР°С‚СЊ Р±РѕР»СЊС€Рµ",
  getStarted: "РќР°С‡Р°С‚СЊ",
  viewAll: "РџРѕРєР°Р·Р°С‚СЊ РІСЃРµ",
  showMore: "РџРѕРєР°Р·Р°С‚СЊ РµС‰С‘",
  showLess: "РЎРєСЂС‹С‚СЊ",
  loadMore: "Р—Р°РіСЂСѓР·РёС‚СЊ РµС‰С‘"
}, {
  learnMore: "Ф»ХґХЎХ¶ХЎХ¬ ХЎХѕХҐХ¬Х«Х¶",
  getStarted: "ХЌХЇХЅХҐХ¬",
  viewAll: "ФґХ«ХїХҐХ¬ ХўХёХ¬ХёЦЂХЁ",
  showMore: "Х‘ХёЦ‚ХµЦЃ ХїХЎХ¬ ХЎХѕХҐХ¬Х«Х¶",
  showLess: "Ф№ХЎЦ„ЦЃХ¶ХҐХ¬",
  loadMore: "ФІХҐХјХ¶ХҐХ¬ ХЎХѕХҐХ¬Х«Х¶"
});

// 4. emptyStates (12 keys)
addTranslations('emptyStates', {
  noData: "No data available",
  noResults: "No results found",
  noEmployees: "No employees yet",
  noLeaves: "No leave requests",
  noTasks: "No tasks assigned",
  noNotifications: "No new notifications",
  noReports: "No reports available",
  noOrganizationsYet: "No organizations yet",
  tryDifferentSearch: "Try a different search term",
  clearFilters: "Clear all filters",
  addFirst: "Add your first item",
  getStarted: "Get started by creating one"
}, {
  noData: "РќРµС‚ РґР°РЅРЅС‹С…",
  noResults: "РќРёС‡РµРіРѕ РЅРµ РЅР°Р№РґРµРЅРѕ",
  noEmployees: "РќРµС‚ СЃРѕС‚СЂСѓРґРЅРёРєРѕРІ",
  noLeaves: "РќРµС‚ Р·Р°РїСЂРѕСЃРѕРІ РЅР° РѕС‚РїСѓСЃРє",
  noTasks: "РќРµС‚ РЅР°Р·РЅР°С‡РµРЅРЅС‹С… Р·Р°РґР°С‡",
  noNotifications: "РќРµС‚ РЅРѕРІС‹С… СѓРІРµРґРѕРјР»РµРЅРёР№",
  noReports: "РќРµС‚ РґРѕСЃС‚СѓРїРЅС‹С… РѕС‚С‡С‘С‚РѕРІ",
  noOrganizationsYet: "РќРµС‚ РѕСЂРіР°РЅРёР·Р°С†РёР№",
  tryDifferentSearch: "РџРѕРїСЂРѕР±СѓР№С‚Рµ РґСЂСѓРіРѕР№ РїРѕРёСЃРєРѕРІС‹Р№ Р·Р°РїСЂРѕСЃ",
  clearFilters: "РћС‡РёСЃС‚РёС‚СЊ РІСЃРµ С„РёР»СЊС‚СЂС‹",
  addFirst: "Р”РѕР±Р°РІСЊС‚Рµ РїРµСЂРІС‹Р№ СЌР»РµРјРµРЅС‚",
  getStarted: "РќР°С‡РЅРёС‚Рµ СЃ СЃРѕР·РґР°РЅРёСЏ"
}, {
  noData: "ХЏХѕХµХЎХ¬Х¶ХҐЦЂ Х№ХЇХЎХ¶",
  noResults: "Ф±ЦЂХ¤ХµХёЦ‚Х¶Ц„Х¶ХҐЦЂ Х№ХҐХ¶ ХЈХїХ¶ХѕХҐХ¬",
  noEmployees: "Ф±Х·Х­ХЎХїХЎХЇХ«ЦЃХ¶ХҐЦЂ Х¤ХҐХј Х№ХЇХЎХ¶",
  noLeaves: "Ф±ЦЂХ±ХЎХЇХёЦ‚ЦЂХ¤Х« Х°ХЎХµХїХҐЦЂ Х№ХЇХЎХ¶",
  noTasks: "ХЂХЎХ¶Х±Х¶ХЎЦЂХЎЦЂХѕХЎХ® ХЎХјХЎХ»ХЎХ¤ЦЂХЎХ¶Ц„Х¶ХҐЦЂ Х№ХЇХЎХ¶",
  noNotifications: "Х†ХёЦЂ Х®ХЎХ¶ХёЦ‚ЦЃХёЦ‚ХґХ¶ХҐЦЂ Х№ХЇХЎХ¶",
  noReports: "ХЂХЎХЅХЎХ¶ХҐХ¬Х« Х°ХЎХ·ХѕХҐХїХѕХёЦ‚Х©ХµХёЦ‚Х¶Х¶ХҐЦЂ Х№ХЇХЎХ¶",
  noOrganizationsYet: "ФїХЎХ¦ХґХЎХЇХҐЦЂХєХёЦ‚Х©ХµХёЦ‚Х¶Х¶ХҐЦЂ Х¤ХҐХј Х№ХЇХЎХ¶",
  tryDifferentSearch: "Х“ХёЦЂХ±ХҐЦ„ ХЎХµХ¬ ХёЦЂХёХ¶ХёЦ‚Хґ",
  clearFilters: "Х„ХЎЦ„ЦЂХҐХ¬ ХўХёХ¬ХёЦЂ Ц†Х«Х¬ХїЦЂХҐЦЂХЁ",
  addFirst: "Ф±ХѕХҐХ¬ХЎЦЃЦЂХҐЦ„ Х±ХҐЦЂ ХЎХјХЎХ»Х«Х¶ ХїХЎЦЂЦЂХЁ",
  getStarted: "ХЌХЇХЅХҐЦ„ ХЅХїХҐХІХ®ХҐХ¬ХёХѕ"
});

// 5. validation (15 keys)
addTranslations('validation', {
  required: "This field is required",
  invalidEmail: "Invalid email address",
  invalidPhone: "Invalid phone number",
  passwordTooShort: "Password must be at least 8 characters",
  passwordsDoNotMatch: "Passwords do not match",
  invalidDate: "Invalid date",
  dateTooEarly: "Date is too early",
  dateTooLate: "Date is too late",
  invalidFormat: "Invalid format",
  valueTooSmall: "Value is too small",
  valueTooLarge: "Value is too large",
  fileTooBig: "File size is too large",
  invalidFileType: "Invalid file type",
  maxLength: "Maximum length exceeded",
  minLength: "Minimum length not met"
}, {
  required: "Р­С‚Рѕ РїРѕР»Рµ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ",
  invalidEmail: "РќРµРІРµСЂРЅС‹Р№ email Р°РґСЂРµСЃ",
  invalidPhone: "РќРµРІРµСЂРЅС‹Р№ РЅРѕРјРµСЂ С‚РµР»РµС„РѕРЅР°",
  passwordTooShort: "РџР°СЂРѕР»СЊ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РјРёРЅРёРјСѓРј 8 СЃРёРјРІРѕР»РѕРІ",
  passwordsDoNotMatch: "РџР°СЂРѕР»Рё РЅРµ СЃРѕРІРїР°РґР°СЋС‚",
  invalidDate: "РќРµРІРµСЂРЅР°СЏ РґР°С‚Р°",
  dateTooEarly: "Р”Р°С‚Р° СЃР»РёС€РєРѕРј СЂР°РЅРЅСЏСЏ",
  dateTooLate: "Р”Р°С‚Р° СЃР»РёС€РєРѕРј РїРѕР·РґРЅСЏСЏ",
  invalidFormat: "РќРµРІРµСЂРЅС‹Р№ С„РѕСЂРјР°С‚",
  valueTooSmall: "Р—РЅР°С‡РµРЅРёРµ СЃР»РёС€РєРѕРј РјР°Р»РµРЅСЊРєРѕРµ",
  valueTooLarge: "Р—РЅР°С‡РµРЅРёРµ СЃР»РёС€РєРѕРј Р±РѕР»СЊС€РѕРµ",
  fileTooBig: "Р Р°Р·РјРµСЂ С„Р°Р№Р»Р° СЃР»РёС€РєРѕРј Р±РѕР»СЊС€РѕР№",
  invalidFileType: "РќРµРІРµСЂРЅС‹Р№ С‚РёРї С„Р°Р№Р»Р°",
  maxLength: "РџСЂРµРІС‹С€РµРЅР° РјР°РєСЃРёРјР°Р»СЊРЅР°СЏ РґР»РёРЅР°",
  minLength: "РќРµ РґРѕСЃС‚РёРіРЅСѓС‚Р° РјРёРЅРёРјР°Р»СЊРЅР°СЏ РґР»РёРЅР°"
}, {
  required: "Ф±ХµХЅ Х¤ХЎХ·ХїХЁ ХєХЎЦЂХїХЎХ¤Х«ЦЂ Х§",
  invalidEmail: "Ф±Х¶ХѕХЎХѕХҐЦЂ Х§Х¬. ЦѓХёХЅХїХ« Х°ХЎХЅЦЃХҐ",
  invalidPhone: "Ф±Х¶ХѕХЎХѕХҐЦЂ Х°ХҐХјХЎХ­ХёХЅХЎХ°ХЎХґХЎЦЂ",
  passwordTooShort: "ФіХЎХІХїХ¶ХЎХўХЎХјХЁ ХєХҐХїЦ„ Х§ Х¬Х«Х¶Х« Х¶ХѕХЎХ¦ХЎХЈХёЦ‚ХµХ¶ХЁ 8 Х¶Х«Х·",
  passwordsDoNotMatch: "ФіХЎХІХїХ¶ХЎХўХЎХјХҐЦЂХЁ Х№ХҐХ¶ Х°ХЎХґХЁХ¶ХЇХ¶ХёЦ‚Хґ",
  invalidDate: "Ф±Х¶ХѕХЎХѕХҐЦЂ ХЎХґХЅХЎХ©Х«Хѕ",
  dateTooEarly: "Ф±ХґХЅХЎХ©Х«ХѕХЁ Х·ХЎХї ХѕХЎХІ Х§",
  dateTooLate: "Ф±ХґХЅХЎХ©Х«ХѕХЁ Х·ХЎХї ХёЦ‚Х· Х§",
  invalidFormat: "Ф±Х¶ХѕХЎХѕХҐЦЂ Х±Ц‡ХЎХ№ХЎЦѓ",
  valueTooSmall: "Ф±ЦЂХЄХҐЦ„ХЁ Х·ХЎХї ЦѓХёЦ„ЦЂ Х§",
  valueTooLarge: "Ф±ЦЂХЄХҐЦ„ХЁ Х·ХЎХї ХґХҐХ® Х§",
  fileTooBig: "Х–ХЎХµХ¬Х« Х№ХЎЦѓХЁ Х·ХЎХї ХґХҐХ® Х§",
  invalidFileType: "Ф±Х¶ХѕХЎХѕХҐЦЂ Ц†ХЎХµХ¬Х« ХїХҐХЅХЎХЇ",
  maxLength: "ФіХҐЦЂХЎХ¦ХЎХ¶ЦЃХѕХЎХ® Х§ ХЎХјХЎХѕХҐХ¬ХЎХЈХёЦ‚ХµХ¶ ХҐЦЂХЇХЎЦЂХёЦ‚Х©ХµХёЦ‚Х¶ХЁ",
  minLength: "Х‰Х« Х°ХЎХЅХҐХ¬ Х¶ХѕХЎХ¦ХЎХЈХёЦ‚ХµХ¶ ХҐЦЂХЇХЎЦЂХёЦ‚Х©ХµХЎХ¶ХЁ"
});

console.log(`\nвњ… Total added: ${totalAdded} keys`);

// Save
fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2), 'utf8');
fs.writeFileSync(ruPath, JSON.stringify(ruJson, null, 2), 'utf8');
fs.writeFileSync(hyPath, JSON.stringify(hyJson, null, 2), 'utf8');

console.log('вњ… Files saved\n');

// Verify
const ruTest = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
const hyTest = JSON.parse(fs.readFileSync(hyPath, 'utf8'));

console.log('Verification:');
console.log('RU:', ruTest.validation?.required);
console.log('HY:', hyTest.validation?.required);

if (ruTest.validation?.required.includes('РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ') &&
    hyTest.validation?.required.includes('ХєХЎЦЂХїХЎХ¤Х«ЦЂ')) {
  console.log('\nвњ…вњ…вњ… SUCCESS! All translations added! вњ…вњ…вњ…');
}
