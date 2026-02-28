#!/usr/bin/env node
/**
 * Auto-Translate Script
 * Автоматически заменяет захардкоженные тексты на t() во всех компонентах
 */

const fs = require('fs');
const path = require('path');

// Паттерны для поиска захардкоженных текстов
const TEXT_PATTERNS = [
  // Простые тексты между тегами: >Text<
  {
    pattern: />([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+)*)</g,
    type: 'tag-content'
  },
  // Тексты в кавычках для aria-label, placeholder и т.д.
  {
    pattern: /(placeholder|aria-label|title)="([^"]+)"/g,
    type: 'attribute'
  },
  // Кнопки и лейблы
  {
    pattern: /<(?:button|label)[^>]*>([A-Z][^<]+)</g,
    type: 'button-label'
  }
];

// Маппинг общих фраз на ключи переводов
const COMMON_PHRASES = {
  // Auth
  'Email': 'auth.email',
  'Email address': 'auth.emailAddress',
  'Password': 'auth.password',
  'Sign In': 'auth.signIn',
  'Sign in': 'auth.signIn',
  'Login': 'auth.login',
  'Register': 'auth.register',
  'Sign Up': 'auth.signUp',
  'Forgot Password': 'auth.forgotPassword',
  'Reset Password': 'auth.resetPassword',
  'Create Account': 'auth.createAccount',
  'Enter your email': 'auth.enterEmail',
  'Enter your password': 'auth.enterPassword',
  
  // Common
  'Save': 'common.save',
  'Cancel': 'common.cancel',
  'Delete': 'common.delete',
  'Edit': 'common.edit',
  'Submit': 'common.submit',
  'Search': 'common.search',
  'Filter': 'common.filter',
  'Loading': 'common.loading',
  'Loading...': 'common.loading',
  
  // Dashboard
  'Dashboard': 'nav.dashboard',
  'Employees': 'nav.employees',
  'Leaves': 'nav.leaves',
  'Attendance': 'nav.attendance',
  'Settings': 'nav.settings',
  'Profile': 'nav.profile',
  'Analytics': 'nav.analytics',
  'Reports': 'nav.reports',
  'Calendar': 'nav.calendar',
  'Tasks': 'nav.tasks'
};

// Функция для добавления useTranslation если его нет
function addUseTranslation(content) {
  // Проверяем, есть ли уже useTranslation
  if (content.includes('useTranslation')) {
    return content;
  }
  
  // Ищем импорт из react
  const reactImportMatch = content.match(/import\s+(?:React|\{[^}]+\})\s+from\s+['"]react['"]/);
  if (!reactImportMatch) {
    // Если нет импорта из react, добавляем в начало
    const importStatement = "import { useTranslation } from 'react-i18next';\n";
    return importStatement + content;
  }
  
  // Добавляем импорт после импорта react
  const insertIndex = reactImportMatch.index + reactImportMatch[0].length;
  const beforeImport = content.substring(0, insertIndex);
  const afterImport = content.substring(insertIndex);
  
  return beforeImport + "\nimport { useTranslation } from 'react-i18next';" + afterImport;
}

// Функция для добавления const { t } в компонент
function addTranslationHook(content) {
  // Ищем определение функции компонента
  const functionPattern = /^(?:export\s+)?(?:default\s+)?function\s+(\w+)\s*\([^)]*\)\s*{/gm;
  
  let modified = content;
  let match;
  
  while ((match = functionPattern.exec(content)) !== null) {
    const funcName = match[1];
    const funcStart = match.index + match[0].length;
    
    // Проверяем, есть ли уже const { t }
    const nextLines = content.substring(funcStart, funcStart + 500);
    if (nextLines.includes('const { t } = useTranslation()')) {
      continue;
    }
    
    // Добавляем const { t } в начало функции
    const before = modified.substring(0, funcStart);
    const after = modified.substring(funcStart);
    modified = before + "\n  const { t } = useTranslation();" + after;
  }
  
  return modified;
}

// Функция для замены текстов на t()
function replaceTextsWithT(content, filePath) {
  let modified = content;
  let changesMade = false;
  const changes = [];
  
  // Заменяем известные фразы
  for (const [phrase, key] of Object.entries(COMMON_PHRASES)) {
    const patterns = [
      new RegExp(`>\\s*${phrase}\\s*<`, 'g'),
      new RegExp(`"${phrase}"`, 'g'),
      new RegExp(`'${phrase}'`, 'g')
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(modified)) {
        const replacement = pattern.source.includes('>') 
          ? `>{t('${key}')}<`
          : `{t('${key}')}`;
        
        modified = modified.replace(pattern, replacement);
        changes.push({ phrase, key, pattern: pattern.source });
        changesMade = true;
      }
    }
  }
  
  return { modified, changesMade, changes };
}

// Функция для обработки одного файла
function processFile(filePath) {
  console.log(`\n📝 Processing: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Шаг 1: Добавить импорт useTranslation
  let modified = addUseTranslation(content);
  
  // Шаг 2: Добавить const { t } в компоненты
  modified = addTranslationHook(modified);
  
  // Шаг 3: Заменить тексты на t()
  const result = replaceTextsWithT(modified, filePath);
  
  if (result.changesMade) {
    // Сохранить изменения
    fs.writeFileSync(filePath, result.modified, 'utf-8');
    console.log(`✅ Modified! Changes:`);
    result.changes.forEach(c => console.log(`   - ${c.phrase} → t('${c.key}')`));
    return true;
  } else {
    console.log(`⏭️  Skipped (no changes needed)`);
    return false;
  }
}

// Функция для обработки всех файлов в директории
function processDirectory(dirPath, extensions = ['.tsx', '.jsx']) {
  const files = fs.readdirSync(dirPath);
  let processed = 0;
  let modified = 0;
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Рекурсивно обрабатываем поддиректории
      const result = processDirectory(fullPath, extensions);
      processed += result.processed;
      modified += result.modified;
    } else {
      // Проверяем расширение файла
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        processed++;
        if (processFile(fullPath)) {
          modified++;
        }
      }
    }
  }
  
  return { processed, modified };
}

// Главная функция
function main() {
  console.log('\n🤖 AUTO-TRANSLATE SCRIPT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const targetDir = process.argv[2] || path.join(__dirname, '../src/app/(auth)');
  
  console.log(`📂 Target directory: ${targetDir}`);
  console.log(`🔍 Looking for .tsx and .jsx files...\n`);
  
  const result = processDirectory(targetDir);
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 SUMMARY:');
  console.log(`   Files processed: ${result.processed}`);
  console.log(`   Files modified: ${result.modified}`);
  console.log(`   Files skipped: ${result.processed - result.modified}`);
  console.log('\n✅ Done!\n');
}

// Запуск
if (require.main === module) {
  main();
}

module.exports = { processFile, processDirectory };
