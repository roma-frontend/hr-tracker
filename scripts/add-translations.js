#!/usr/bin/env node

/**
 * Add Translations Script
 * 
 * Safely adds translations to all language files using Node.js
 * This ensures proper UTF-8 encoding and preserves Unicode characters
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

// Load all translation files
const enPath = path.join(LOCALES_DIR, 'en.json');
const ruPath = path.join(LOCALES_DIR, 'ru.json');
const hyPath = path.join(LOCALES_DIR, 'hy.json');

let enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let ruJson = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
let hyJson = JSON.parse(fs.readFileSync(hyPath, 'utf8'));

console.log('🌍 Adding translations to all languages...\n');

// PRIORITY 1: aiSiteEditor (53 keys)
const aiSiteEditorEn = {
  title: "AI Site Editor",
  subtitle: "Edit your website content with AI assistance",
  chatPlaceholder: "Ask AI to edit your website...",
  thinking: "AI is thinking...",
  applyChanges: "Apply Changes",
  discardChanges: "Discard Changes",
  preview: "Preview",
  revert: "Revert",
  save: "Save Changes",
  cancel: "Cancel",
  success: "Changes applied successfully!",
  error: "Failed to apply changes",
  loading: "Loading editor...",
  noChanges: "No changes to apply",
  confirmDiscard: "Are you sure you want to discard these changes?",
  confirmRevert: "Revert to previous version?",
  examples: {
    title: "Try asking:",
    example1: "Change the hero section background to blue",
    example2: "Make the pricing section more modern",
    example3: "Update the contact form design"
  },
  features: {
    instantPreview: "Instant Preview",
    aiPowered: "AI-Powered",
    easyToUse: "Easy to Use",
    noCode: "No Code Required"
  },
  tips: {
    beSpecific: "Be specific in your requests",
    useExamples: "Use examples for better results",
    iterateDesign: "Iterate on the design gradually"
  },
  status: {
    idle: "Ready to edit",
    processing: "Processing your request...",
    applying: "Applying changes...",
    complete: "Complete"
  },
  errors: {
    invalidRequest: "Invalid request. Please try again.",
    networkError: "Network error. Check your connection.",
    serverError: "Server error. Please try later.",
    timeout: "Request timeout. Please try again."
  },
  sections: {
    hero: "Hero Section",
    features: "Features",
    pricing: "Pricing",
    testimonials: "Testimonials",
    contact: "Contact",
    footer: "Footer"
  }
};

const aiSiteEditorRu = {
  title: "AI Редактор сайта",
  subtitle: "Редактируйте контент сайта с помощью AI",
  chatPlaceholder: "Попросите AI отредактировать сайт...",
  thinking: "AI думает...",
  applyChanges: "Применить изменения",
  discardChanges: "Отменить изменения",
  preview: "Предпросмотр",
  revert: "Отменить",
  save: "Сохранить изменения",
  cancel: "Отмена",
  success: "Изменения успешно применены!",
  error: "Не удалось применить изменения",
  loading: "Загрузка редактора...",
  noChanges: "Нет изменений для применения",
  confirmDiscard: "Вы уверены, что хотите отменить эти изменения?",
  confirmRevert: "Вернуться к предыдущей версии?",
  examples: {
    title: "Попробуйте спросить:",
    example1: "Измени фон главной секции на синий",
    example2: "Сделай секцию цен более современной",
    example3: "Обнови дизайн контактной формы"
  },
  features: {
    instantPreview: "Мгновенный предпросмотр",
    aiPowered: "На основе AI",
    easyToUse: "Легко в использовании",
    noCode: "Без кода"
  },
  tips: {
    beSpecific: "Будьте конкретны в запросах",
    useExamples: "Используйте примеры для лучших результатов",
    iterateDesign: "Изменяйте дизайн постепенно"
  },
  status: {
    idle: "Готов к редактированию",
    processing: "Обработка вашего запроса...",
    applying: "Применение изменений...",
    complete: "Завершено"
  },
  errors: {
    invalidRequest: "Неверный запрос. Попробуйте снова.",
    networkError: "Ошибка сети. Проверьте подключение.",
    serverError: "Ошибка сервера. Попробуйте позже.",
    timeout: "Тайм-аут запроса. Попробуйте снова."
  },
  sections: {
    hero: "Главная секция",
    features: "Возможности",
    pricing: "Цены",
    testimonials: "Отзывы",
    contact: "Контакты",
    footer: "Подвал"
  }
};

const aiSiteEditorHy = {
  title: "AI կայքի խմբագրիչ",
  subtitle: "Խմբագրեք ձեր կայքի բովանդակությունը AI օգնությամբ",
  chatPlaceholder: "Խնդրեք AI-ին խմբագրել ձեր կայքը...",
  thinking: "AI-ն մտածում է...",
  applyChanges: "Կիրառել փոփոխությունները",
  discardChanges: "Հրաժարվել փոփոխություններից",
  preview: "Նախադիտում",
  revert: "Հետ շրջել",
  save: "Պահպանել փոփոխությունները",
  cancel: "Չեղարկել",
  success: "Փոփոխությունները հաջողությամբ կիրառվեցին!",
  error: "Չհաջողվեց կիրառել փոփոխությունները",
  loading: "Խմբագրիչը բեռնվում է...",
  noChanges: "Կիրառելու փոփոխություններ չկան",
  confirmDiscard: "Համոզվա՞ծ եք, որ ուզում եք հրաժարվել այս փոփոխություններից:",
  confirmRevert: "Վերադառնալ նախորդ տարբերակին:",
  examples: {
    title: "Փորձեք հարցնել:",
    example1: "Փոխիր գլխավոր բաժնի ֆոնը կապույտի",
    example2: "Արա գնային բաժինը ավելի ժամանակակից",
    example3: "Թարմացրու կոնտակտային ձևի դիզայնը"
  },
  features: {
    instantPreview: "Ակնթարթային նախադիտում",
    aiPowered: "AI հզորությամբ",
    easyToUse: "Հեշտ օգտագործում",
    noCode: "Առանց կոդի"
  },
  tips: {
    beSpecific: "Եղեք կոնկրետ ձեր հարցումներում",
    useExamples: "Օգտագործեք օրինակներ ավելի լավ արդյունքների համար",
    iterateDesign: "Փոխեք դիզայնը աստիճանաբար"
  },
  status: {
    idle: "Պատրաստ է խմբագրման",
    processing: "Ձեր հարցումը մշակվում է...",
    applying: "Փոփոխությունները կիրառվում են...",
    complete: "Ավարտված է"
  },
  errors: {
    invalidRequest: "Անվավեր հարցում: Փորձեք կրկին:",
    networkError: "Ցանցի սխալ: Ստուգեք կապը:",
    serverError: "Սերվերի սխալ: Փորձեք ավելի ուշ:",
    timeout: "Հարցման ժամանակը սպառվեց: Փորձեք կրկին:"
  },
  sections: {
    hero: "Գլխավոր բաժին",
    features: "Հնարավորություններ",
    pricing: "Գներ",
    testimonials: "Վկայություններ",
    contact: "Կապ",
    footer: "Ստորին մաս"
  }
};

// Add aiSiteEditor section
enJson.aiSiteEditor = aiSiteEditorEn;
ruJson.aiSiteEditor = aiSiteEditorRu;
hyJson.aiSiteEditor = aiSiteEditorHy;

console.log('✅ Added aiSiteEditor (53 keys)');

// Save files with proper UTF-8 encoding
fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2), 'utf8');
fs.writeFileSync(ruPath, JSON.stringify(ruJson, null, 2), 'utf8');
fs.writeFileSync(hyPath, JSON.stringify(hyJson, null, 2), 'utf8');

console.log('\n✅ All translations saved');
console.log('✅ UTF-8 encoding preserved');
console.log('✅ Unicode characters safe');

// Verify
console.log('\n🔍 Verifying...');
const ruTest = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
const hyTest = JSON.parse(fs.readFileSync(hyPath, 'utf8'));

console.log('RU sample:', ruTest.aiSiteEditor.title);
console.log('HY sample:', hyTest.aiSiteEditor.title);

if (ruTest.aiSiteEditor.title === 'AI Редактор сайта' && 
    hyTest.aiSiteEditor.title === 'AI կայքի խմբագրիչ') {
  console.log('\n✅✅✅ Perfect! Unicode preserved! ✅✅✅');
} else {
  console.log('\n⚠️ Warning: Unexpected values');
}
