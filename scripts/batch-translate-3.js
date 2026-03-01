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

console.log('🚀 BATCH TRANSLATION #3\n');

let totalAdded = 0;

function addTranslations(section, enData, ruData, hyData) {
  enJson[section] = { ...enJson[section], ...enData };
  ruJson[section] = { ...ruJson[section], ...ruData };
  hyJson[section] = { ...hyJson[section], ...hyData };
  
  const count = Object.keys(enData).length;
  console.log(`✅ ${section}: ${count} keys`);
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
    eyebrow: "Современное HR управление",
    title: "Упростите HR с помощью AI",
    subtitle: "Всё-в-одном платформа для управления отпусками, учёта посещаемости и командной работы",
    cta: "Начать бесплатно",
    secondaryCta: "Смотреть демо",
    trustedBy: "Нам доверяют 500+ компаний по всему миру"
  },
  features: {
    title: "Всё что нужно",
    subtitle: "Мощные функции для современных команд",
    feature1Title: "Умное управление отпусками",
    feature1Desc: "Автоматический учёт отпусков с AI-аналитикой",
    feature2Title: "Посещаемость в реальном времени",
    feature2Desc: "Отслеживание с распознаванием лиц и геолокацией",
    feature3Title: "Командная работа",
    feature3Desc: "Встроенный чат, задачи и управление проектами",
    feature4Title: "Расширенная аналитика",
    feature4Desc: "Получайте инсайты с AI отчётами и дашбордами"
  },
  stats: {
    stat1: "500+ компаний",
    stat2: "50K+ сотрудников",
    stat3: "99.9% время работы",
    stat4: "Поддержка 24/7"
  },
  cta: {
    title: "Готовы начать?",
    subtitle: "Присоединяйтесь к тысячам компаний, использующих нашу платформу",
    button: "Начать бесплатный период"
  }
}, {
  hero: {
    eyebrow: "Ժամանակակից HR կառավարում",
    title: "Պարզեցրեք HR-ը AI-ի օգնությամբ",
    subtitle: "Ամբողջ-մեկում հարթակ արձակուրդների կառավարման, ներկայության հաշվառման և թիմային համագործակցության համար",
    cta: "Սկսել անվճար",
    secondaryCta: "Դիտել դեմոն",
    trustedBy: "Մեզ վստահում են 500+ ընկերություններ ամբողջ աշխարհում"
  },
  features: {
    title: "Այն ամենը, ինչ ձեզ պետք է",
    subtitle: "Հզոր գործառույթներ ժամանակակից թիմերի համար",
    feature1Title: "Խելացի արձակուրդների կառավարում",
    feature1Desc: "Ավտոմատ հաշվառում AI վերլուծությամբ",
    feature2Title: "Իրական ժամանակի ներկայություն",
    feature2Desc: "Հետևեք դեմքի ճանաչմամբ և գեոտեղորոշմամբ",
    feature3Title: "Թիմային համագործակցություն",
    feature3Desc: "Ներկառուցված չատ, առաջադրանքներ և նախագծերի կառավարում",
    feature4Title: "Ընդլայնված վերլուծություն",
    feature4Desc: "Ստացեք պատկերացումներ AI հաշվետվություններով և վահանակներով"
  },
  stats: {
    stat1: "500+ ընկերություններ",
    stat2: "50K+ աշխատակիցներ",
    stat3: "99.9% աշխատանքի ժամանակ",
    stat4: "24/7 աջակցություն"
  },
  cta: {
    title: "Պատրա՞ստ եք սկսել:",
    subtitle: "Միացեք հազարավոր ընկերությունների, որոնք օգտագործում են մեր հարթակը",
    button: "Սկսել անվճար փորձաշրջան"
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
  trustedBy: "Нам доверяют",
  companies: "компаний по всему миру",
  rating: "Рейтинг 4.9/5",
  reviews: "на основе 1000+ отзывов",
  customers: "Довольных клиентов",
  growth: "Рост из года в год"
}, {
  trustedBy: "Մեզ վստահում են",
  companies: "ընկերություններ ամբողջ աշխարհում",
  rating: "Գնահատական 4.9/5",
  reviews: "1000+ վերլուծությունների հիման վրա",
  customers: "Գոհ հաճախորդներ",
  growth: "Տարեկան աճ"
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
  learnMore: "Узнать больше",
  getStarted: "Начать",
  viewAll: "Показать все",
  showMore: "Показать ещё",
  showLess: "Скрыть",
  loadMore: "Загрузить ещё"
}, {
  learnMore: "Իմանալ ավելին",
  getStarted: "Սկսել",
  viewAll: "Դիտել բոլորը",
  showMore: "Ցույց տալ ավելին",
  showLess: "Թաքցնել",
  loadMore: "Բեռնել ավելին"
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
  noData: "Нет данных",
  noResults: "Ничего не найдено",
  noEmployees: "Нет сотрудников",
  noLeaves: "Нет запросов на отпуск",
  noTasks: "Нет назначенных задач",
  noNotifications: "Нет новых уведомлений",
  noReports: "Нет доступных отчётов",
  noOrganizationsYet: "Нет организаций",
  tryDifferentSearch: "Попробуйте другой поисковый запрос",
  clearFilters: "Очистить все фильтры",
  addFirst: "Добавьте первый элемент",
  getStarted: "Начните с создания"
}, {
  noData: "Տվյալներ չկան",
  noResults: "Արդյունքներ չեն գտնվել",
  noEmployees: "Աշխատակիցներ դեռ չկան",
  noLeaves: "Արձակուրդի հայտեր չկան",
  noTasks: "Հանձնարարված առաջադրանքներ չկան",
  noNotifications: "Նոր ծանուցումներ չկան",
  noReports: "Հասանելի հաշվետվություններ չկան",
  noOrganizationsYet: "Կազմակերպություններ դեռ չկան",
  tryDifferentSearch: "Փորձեք այլ որոնում",
  clearFilters: "Մաքրել բոլոր ֆիլտրերը",
  addFirst: "Ավելացրեք ձեր առաջին տարրը",
  getStarted: "Սկսեք ստեղծելով"
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
  required: "Это поле обязательно",
  invalidEmail: "Неверный email адрес",
  invalidPhone: "Неверный номер телефона",
  passwordTooShort: "Пароль должен быть минимум 8 символов",
  passwordsDoNotMatch: "Пароли не совпадают",
  invalidDate: "Неверная дата",
  dateTooEarly: "Дата слишком ранняя",
  dateTooLate: "Дата слишком поздняя",
  invalidFormat: "Неверный формат",
  valueTooSmall: "Значение слишком маленькое",
  valueTooLarge: "Значение слишком большое",
  fileTooBig: "Размер файла слишком большой",
  invalidFileType: "Неверный тип файла",
  maxLength: "Превышена максимальная длина",
  minLength: "Не достигнута минимальная длина"
}, {
  required: "Այս դաշտը պարտադիր է",
  invalidEmail: "Անվավեր էլ. փոստի հասցե",
  invalidPhone: "Անվավեր հեռախոսահամար",
  passwordTooShort: "Գաղտնաբառը պետք է լինի նվազագույնը 8 նիշ",
  passwordsDoNotMatch: "Գաղտնաբառերը չեն համընկնում",
  invalidDate: "Անվավեր ամսաթիվ",
  dateTooEarly: "Ամսաթիվը շատ վաղ է",
  dateTooLate: "Ամսաթիվը շատ ուշ է",
  invalidFormat: "Անվավեր ձևաչափ",
  valueTooSmall: "Արժեքը շատ փոքր է",
  valueTooLarge: "Արժեքը շատ մեծ է",
  fileTooBig: "Ֆայլի չափը շատ մեծ է",
  invalidFileType: "Անվավեր ֆայլի տեսակ",
  maxLength: "Գերազանցված է առավելագույն երկարությունը",
  minLength: "Չի հասել նվազագույն երկարությանը"
});

console.log(`\n✅ Total added: ${totalAdded} keys`);

// Save
fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2), 'utf8');
fs.writeFileSync(ruPath, JSON.stringify(ruJson, null, 2), 'utf8');
fs.writeFileSync(hyPath, JSON.stringify(hyJson, null, 2), 'utf8');

console.log('✅ Files saved\n');

// Verify
const ruTest = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
const hyTest = JSON.parse(fs.readFileSync(hyPath, 'utf8'));

console.log('Verification:');
console.log('RU:', ruTest.validation?.required);
console.log('HY:', hyTest.validation?.required);

if (ruTest.validation?.required.includes('обязательно') &&
    hyTest.validation?.required.includes('պարտադիր')) {
  console.log('\n✅✅✅ SUCCESS! All translations added! ✅✅✅');
}
