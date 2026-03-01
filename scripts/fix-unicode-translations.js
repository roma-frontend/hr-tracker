#!/usr/bin/env node

/**
 * Fix Unicode Translations
 * 
 * This script reads the English translations and recreates
 * Russian and Armenian translations with proper Unicode encoding.
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

// Read English file (this one should be OK)
const enPath = path.join(LOCALES_DIR, 'en.json');
const enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));

console.log('✅ English file loaded successfully');
console.log(`   Keys: ${Object.keys(enJson).length}`);

// Create Russian translations template based on English structure
const createRussianTranslations = (enObj) => {
  const ruObj = {};
  
  for (const key in enObj) {
    if (typeof enObj[key] === 'object' && !Array.isArray(enObj[key])) {
      ruObj[key] = createRussianTranslations(enObj[key]);
    } else {
      // For now, keep English values - we'll need to manually translate these
      // or restore from a backup if available
      ruObj[key] = enObj[key];
    }
  }
  
  return ruObj;
};

// Core Russian translations (manually recreating the most important ones)
const russianTranslations = {
  "landing": {
    "scroll": "Прокрутка",
    "leaveTypes": "Типы отпусков",
    "hrLeave": "HRLeave"
  },
  "socialProof": {
    "trustedBy": "Нам доверяют",
    "companies": "компаний по всему миру"
  },
  "nav": {
    "features": "Возможности",
    "pricing": "Цены",
    "about": "О нас",
    "contact": "Контакты",
    "login": "Войти",
    "getStarted": "Начать",
    "dashboard": "Панель",
    "employees": "Сотрудники",
    "attendance": "Посещаемость",
    "leaves": "Отпуска",
    "reports": "Отчёты",
    "settings": "Настройки",
    "profile": "Профиль",
    "logout": "Выйти"
  },
  "common": {
    "save": "Сохранить",
    "cancel": "Отмена",
    "delete": "Удалить",
    "edit": "Редактировать",
    "add": "Добавить",
    "remove": "Удалить",
    "search": "Поиск",
    "filter": "Фильтр",
    "export": "Экспорт",
    "import": "Импорт",
    "close": "Закрыть",
    "submit": "Отправить",
    "confirm": "Подтвердить",
    "back": "Назад",
    "next": "Далее",
    "previous": "Назад",
    "loading": "Загрузка...",
    "yes": "Да",
    "no": "Нет"
  },
  "auth": {
    "login": "Вход",
    "register": "Регистрация",
    "email": "Email",
    "password": "Пароль",
    "forgotPassword": "Забыли пароль?",
    "forgotPasswordDesc": "Не беспокойтесь! Введите email и мы отправим вам ссылку для сброса.",
    "sending": "Отправка...",
    "sendResetLink": "Отправить ссылку для сброса",
    "checkYourEmail": "Проверьте email!",
    "resetLinkSent": "Если аккаунт с {{email}} существует, мы отправили ссылку для сброса пароля. Срок действия 1 час.",
    "didntReceive": "Не получили? Проверьте спам или",
    "tryAgain": "попробуйте снова",
    "getStartedFree": "Начать бесплатно",
    "requestAccess": "Запросить доступ",
    "alreadyHaveOrg": "Уже есть организация?",
    "joinExistingTeam": "Присоединиться к команде"
  },
  "checkout": {
    "allSet": "Всё готово!",
    "welcomeToPlan": "Добро пожаловать в план {{plan}}",
    "trialStarted": "Ваш 14-дневный пробный период начался. Оплата только после окончания.",
    "instantAccess": "Мгновенный доступ",
    "sslSecured": "SSL защита",
    "trial14Days": "14 дней пробно",
    "createAccount": "Создать аккаунт",
    "redirecting": "Автоматическое перенаправление через {{count}}с…"
  },
  "profile": {
    "daysActive": "Дней активен",
    "tasksCompleted": "Задач выполнено",
    "leavesTaken": "Отпусков взято",
    "projects": "Проекты"
  },
  "reports": {
    "totalRequests": "Всего запросов",
    "approvalRate": "Процент одобрения"
  },
  "organization": {
    "totalEmployees": "Всего сотрудников",
    "activeEmployees": "Активные сотрудники",
    "createFirstOrg": "Создайте свою первую организацию для начала работы",
    "creatingOrganization": "Создание организации...",
    "createOrganization": "Создать организацию"
  },
  "analytics": {
    "analyticsDashboard": "Панель аналитики",
    "hrMetricsOverview": "Обзор ваших HR метрик и аналитики",
    "pendingLeaves": "Ожидающие отпуска",
    "approvedLeaves": "Одобренные отпуска",
    "approvalRate": "Процент одобрения"
  },
  "employees": {
    "backToEmployees": "Вернуться к сотрудникам",
    "employeeNotFound": "Сотрудник не найден",
    "employeeNotFoundDesc": "Сотрудник, которого вы ищете, не существует или был удалён.",
    "employee": "Сотрудник"
  },
  "ui": {
    "saving": "Сохранение...",
    "saveChanges": "Сохранить изменения",
    "skipToContent": "Перейти к содержимому",
    "deleting": "Удаление...",
    "deletePicture": "Удалить фото"
  },
  "buttons": {
    "saving": "Сохранение...",
    "saveChanges": "Сохранить изменения"
  }
};

// Armenian translations
const armenianTranslations = {
  "landing": {
    "scroll": "Ոլորել",
    "leaveTypes": "Արձակուրդի տեսակներ",
    "hrLeave": "HRLeave"
  },
  "socialProof": {
    "trustedBy": "Մեզ վստահում են",
    "companies": "ընկերություններ ամբողջ աշխարհում"
  },
  "nav": {
    "features": "Հնարավորություններ",
    "pricing": "Գներ",
    "about": "Մեր մասին",
    "contact": "Կապ",
    "login": "Մուտք",
    "getStarted": "Սկսել",
    "dashboard": "Վահանակ",
    "employees": "Աշխատակիցներ",
    "attendance": "Ներկայություն",
    "leaves": "Արձակուրդներ",
    "reports": "Հաշվետվություններ",
    "settings": "Կարգավորումներ",
    "profile": "Պրոֆիլ",
    "logout": "Ելք"
  },
  "common": {
    "save": "Պահպանել",
    "cancel": "Չեղարկել",
    "delete": "Ջնջել",
    "edit": "Խմբագրել",
    "add": "Ավելացնել",
    "remove": "Հեռացնել",
    "search": "Որոնել",
    "filter": "Ֆիլտր",
    "export": "Արտահանել",
    "import": "Ներմուծել",
    "close": "Փակել",
    "submit": "Ուղարկել",
    "confirm": "Հաստատել",
    "back": "Հետ",
    "next": "Հաջորդ",
    "previous": "Նախորդ",
    "loading": "Բեռնվում է...",
    "yes": "Այո",
    "no": "Ոչ"
  },
  "auth": {
    "login": "Մուտք",
    "register": "Գրանցում",
    "email": "Էլ. փոստ",
    "password": "Գաղտնաբառ",
    "forgotPassword": "Մոռացե՞լ եք գաղտնաբառը",
    "forgotPasswordDesc": "Մի անհանգստացեք։ Մուտքագրեք էլ. փոստը և մենք կուղարկենք վերականգնման հղում։",
    "sending": "Ուղարկում...",
    "sendResetLink": "Ուղարկել վերականգնման հղում",
    "checkYourEmail": "Ստուգեք էլ. փոստը!",
    "resetLinkSent": "Եթե {{email}} հասցեով հաշիվ կա, մենք ուղարկել ենք վերականգնման հղում։ Վավեր է 1 ժամ։",
    "didntReceive": "Չստացա՞ք։ Ստուգեք սպամը կամ",
    "tryAgain": "փորձեք կրկին",
    "getStartedFree": "Սկսել անվճար",
    "requestAccess": "Խնդրել մուտք",
    "alreadyHaveOrg": "Արդեն ունե՞ք կազմակերպություն",
    "joinExistingTeam": "Միանալ թիմին"
  },
  "checkout": {
    "allSet": "Ամեն ինչ պատրաստ է!",
    "welcomeToPlan": "Բարի գալուստ {{plan}} պլան",
    "trialStarted": "Ձեր 14-օրյա փորձաշրջանը սկսվել է։ Վճարում միայն ավարտից հետո։",
    "instantAccess": "Ակնթարթային մուտք",
    "sslSecured": "SSL պաշտպանություն",
    "trial14Days": "14-օրյա փորձաշրջան",
    "createAccount": "Ստեղծել հաշիվ",
    "redirecting": "Ավտոմատ վերահղում {{count}}վ…"
  },
  "profile": {
    "daysActive": "Ակտիվ օրեր",
    "tasksCompleted": "Կատարված առաջադրանքներ",
    "leavesTaken": "Վերցված արձակուրդներ",
    "projects": "Նախագծեր"
  },
  "reports": {
    "totalRequests": "Ընդամենը հարցումներ",
    "approvalRate": "Հաստատման տոկոս"
  },
  "organization": {
    "totalEmployees": "Ընդամենը աշխատակիցներ",
    "activeEmployees": "Ակտիվ աշխատակիցներ",
    "createFirstOrg": "Ստեղծեք ձեր առաջին կազմակերպությունը սկսելու համար",
    "creatingOrganization": "Կազմակերպության ստեղծում...",
    "createOrganization": "Ստեղծել կազմակերպություն"
  },
  "analytics": {
    "analyticsDashboard": "Վերլուծության վահանակ",
    "hrMetricsOverview": "Ձեր HR ցուցանիշների և վերլուծության ակնարկ",
    "pendingLeaves": "Սպասվող արձակուրդներ",
    "approvedLeaves": "Հաստատված արձակուրդներ",
    "approvalRate": "Հաստատման տոկոս"
  },
  "employees": {
    "backToEmployees": "Վերադառնալ աշխատակիցներին",
    "employeeNotFound": "Աշխատակիցը չի գտնվել",
    "employeeNotFoundDesc": "Աշխատակիցը, որին փնտրում եք, գոյություն չունի կամ ջնջվել է։",
    "employee": "Աշխատակից"
  },
  "ui": {
    "saving": "Պահպանում...",
    "saveChanges": "Պահպանել փոփոխությունները",
    "skipToContent": "Անցնել բովանդակությանը",
    "deleting": "Ջնջում...",
    "deletePicture": "Ջնջել նկարը"
  },
  "buttons": {
    "saving": "Պահպանում...",
    "saveChanges": "Պահպանել փոփոխությունները"
  }
};

console.log('\n📝 Note: This script recreates the core translations.');
console.log('   You may need to manually add additional translations.');
console.log('   Check the English file for the complete structure.\n');

// Merge with English structure to ensure we have all keys
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else if (!(key in result)) {
      // If key doesn't exist in translation, use English as fallback
      result[key] = source[key];
    }
  }
  
  return result;
}

const ruComplete = deepMerge(russianTranslations, enJson);
const hyComplete = deepMerge(armenianTranslations, enJson);

// Write files with proper UTF-8 encoding
const ruPath = path.join(LOCALES_DIR, 'ru.json');
const hyPath = path.join(LOCALES_DIR, 'hy.json');

fs.writeFileSync(ruPath, JSON.stringify(ruComplete, null, 2), 'utf8');
fs.writeFileSync(hyPath, JSON.stringify(hyComplete, null, 2), 'utf8');

console.log('✅ Russian translations recreated');
console.log('✅ Armenian translations recreated');
console.log('\n🔍 Verifying Unicode...');

// Verify
const ruTest = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
const hyTest = JSON.parse(fs.readFileSync(hyPath, 'utf8'));

console.log('Russian sample:', ruTest.auth?.login);
console.log('Armenian sample:', hyTest.auth?.login);

if (ruTest.auth?.login === 'Вход' && hyTest.auth?.login === 'Մուտք') {
  console.log('\n✅ Unicode characters preserved correctly!');
} else {
  console.log('\n❌ Unicode issue detected');
}
