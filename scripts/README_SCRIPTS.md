# 🤖 Auto-Translation Scripts

**Назначение:** Автоматическая замена захардкоженных текстов на `t()` переводы

---

## 📦 Файлы

### `auto-translate.js`
Основной скрипт для автоматизации перевода

**Что делает:**
1. ✅ Находит все `.tsx` и `.jsx` файлы
2. ✅ Добавляет `import { useTranslation } from 'react-i18next'`
3. ✅ Добавляет `const { t } = useTranslation()` в компоненты
4. ✅ Заменяет захардкоженные тексты на `t('key')`

**Поддерживаемые паттерны:**
- `>Text<` → `>{t('key')}<`
- `"Text"` → `{t('key')}`
- `placeholder="Text"` → `placeholder={t('key')}`
- `aria-label="Text"` → `aria-label={t('key')}`

---

## 🚀 Использование

### 1. Запуск для Auth страниц
```bash
cd Desktop/office
node scripts/auto-translate.js src/app/(auth)
```

### 2. Запуск для Dashboard страниц
```bash
node scripts/auto-translate.js src/app/(dashboard)
```

### 3. Запуск для всех компонентов
```bash
node scripts/auto-translate.js src/components
```

### 4. Запуск для всего проекта
```bash
node scripts/auto-translate.js src
```

---

## ⚙️ Настройка

### Добавление новых фраз

Откройте `auto-translate.js` и добавьте в `COMMON_PHRASES`:

```javascript
const COMMON_PHRASES = {
  'Your Phrase': 'section.yourKey',
  'Another Phrase': 'section.anotherKey',
  // ...
};
```

### Добавление новых паттернов

Добавьте в `TEXT_PATTERNS`:

```javascript
const TEXT_PATTERNS = [
  {
    pattern: /your-regex-pattern/g,
    type: 'your-type'
  }
];
```

---

## 📊 Пример вывода

```
🤖 AUTO-TRANSLATE SCRIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Target directory: src/app/(auth)
🔍 Looking for .tsx and .jsx files...

📝 Processing: src/app/(auth)/login/page.tsx
✅ Modified! Changes:
   - Email → t('auth.email')
   - Password → t('auth.password')
   - Sign In → t('auth.signIn')

📝 Processing: src/app/(auth)/register/page.tsx
✅ Modified! Changes:
   - Email address → t('auth.emailAddress')
   - Create Account → t('auth.createAccount')

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 SUMMARY:
   Files processed: 10
   Files modified: 8
   Files skipped: 2

✅ Done!
```

---

## ⚠️ Важно

### Перед запуском:

1. **Сделайте backup** или используйте Git:
   ```bash
   git add .
   git commit -m "Before auto-translation"
   ```

2. **Проверьте ключи переводов** в JSON файлах:
   - `src/i18n/locales/en.json`
   - `src/i18n/locales/hy.json`
   - `src/i18n/locales/ru.json`

3. **Убедитесь** что все нужные ключи существуют

### После запуска:

1. **Проверьте изменения:**
   ```bash
   git diff
   ```

2. **Протестируйте** каждую измененную страницу

3. **Исправьте** любые некорректные замены вручную

---

## 🎯 Рекомендуемый порядок

### Этап 1: Auth страницы (приоритет #1)
```bash
node scripts/auto-translate.js src/app/(auth)
```

### Этап 2: Dashboard страницы
```bash
node scripts/auto-translate.js src/app/(dashboard)
```

### Этап 3: Компоненты
```bash
node scripts/auto-translate.js src/components/dashboard
node scripts/auto-translate.js src/components/employees
node scripts/auto-translate.js src/components/leaves
```

### Этап 4: Остальное
```bash
node scripts/auto-translate.js src/components
```

---

## 🔧 Расширенное использование

### Сухой прогон (без изменений)
Измените в скрипте:
```javascript
// Закомментируйте эту строку:
// fs.writeFileSync(filePath, result.modified, 'utf-8');

// Добавьте:
console.log('DRY RUN - no files modified');
```

### Только определенные типы файлов
```javascript
const result = processDirectory(targetDir, ['.tsx']); // Только .tsx
```

---

## 📝 Ограничения

Скрипт **НЕ** заменяет:
- Тексты короче 3 символов
- Тексты внутри `console.log()`
- Комментарии
- Переменные и константы
- Динамические строки с переменными

Эти случаи нужно обработать вручную.

---

## ✅ Что делать после

1. Запустите dev сервер:
   ```bash
   npm run dev
   ```

2. Проверьте каждую страницу визуально

3. Переключите язык на 🇷🇺 Русский и 🇦🇲 Հայերեն

4. Убедитесь что все переводится

5. Исправьте любые проблемы

---

## 🎉 Результат

После запуска скрипта у вас будет:
- ✅ Все тексты заменены на `t()`
- ✅ `useTranslation` добавлен во все компоненты
- ✅ Готово к переводу на 3 языка

---

**Создано:** AI Assistant  
**Дата:** 28.02.2026  
**Версия:** 1.0.0
