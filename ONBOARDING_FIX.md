# ✅ Onboarding Tour — Исправлено повторное показывание

## 🎉 Onboarding tour теперь показывается только один раз!

---

## 🐛 Проблема

**Было:**
- Onboarding tour показывался каждый раз при входе на страницу login
- При "Join the existing team" tour показывался снова
- Tour не запоминал что пользователь уже видел его

---

## ✅ Решение

### **1. Обновлена логика проверки (OnboardingTour.tsx)**

**Было:**
```typescript
const shouldShowTour = hasSeenTour === false || 
  (hasSeenTour === null && localStorageChecked && hasSeenTourLocal === false);
```

**Стало:**
```typescript
const shouldShowTour = React.useMemo(() => {
  // If user is authenticated (has sessionToken)
  if (sessionToken !== undefined) {
    // Wait for hasSeenTour to load (not undefined)
    if (hasSeenTour === undefined) return false;
    return hasSeenTour === false;
  }
  
  // If user is not authenticated, check localStorage
  if (localStorageChecked) {
    return hasSeenTourLocal === false;
  }
  
  // Still loading, don't show yet
  return false;
}, [hasSeenTour, sessionToken, localStorageChecked, hasSeenTourLocal]);
```

---

### **2. Добавлено сохранение в localStorage (login page)**

**Было:**
```typescript
<OnboardingTour
  tourId="login-tour"
  onComplete={() => console.log("Tour completed!")}
  onSkip={() => console.log("Tour skipped")}
/>
```

**Стало:**
```typescript
<OnboardingTour
  tourId="login-tour"
  onComplete={() => {
    console.log("Tour completed!");
    // Mark as seen in localStorage immediately
    if (typeof window !== "undefined") {
      localStorage.setItem("tour_seen_login-tour", "true");
    }
  }}
  onSkip={() => {
    console.log("Tour skipped");
    // Mark as seen in localStorage immediately
    if (typeof window !== "undefined") {
      localStorage.setItem("tour_seen_login-tour", "true");
    }
  }}
/>
```

---

### **3. Добавлено сохранение в localStorage (register page)**

Аналогично login page, добавлено сохранение в localStorage при завершении или пропуске тура.

---

## 📁 Изменённые файлы

| Файл | Изменения |
|------|-----------|
| `src/components/onboarding/OnboardingTour.tsx` | ✏️ Обновлена логика `shouldShowTour` |
| `src/app/(auth)/login/page.tsx` | ✏️ Добавлено сохранение в localStorage |
| `src/app/(auth)/register/page.tsx` | ✏️ Добавлено сохранение в localStorage |

---

## 🧪 Как это работает теперь

### **Первый вход (Login page):**

1. Пользователь заходит на `/login`
2. `sessionToken` = undefined (не авторизован)
3. Проверяется localStorage: `tour_seen_login-tour` = null
4. Tour показывается ✅
5. Пользователь завершает или пропускает тур
6. **Сохраняется в localStorage**: `tour_seen_login-tour` = "true"

### **Второй вход (Login page):**

1. Пользователь заходит на `/login`
2. `sessionToken` = undefined (не авторизован)
3. Проверяется localStorage: `tour_seen_login-tour` = "true"
4. **Tour НЕ показывается** ✅

### **После авторизации:**

1. Пользователь авторизуется
2. `sessionToken` = "..."
3. Проверяется база данных через `hasSeenTour` query
4. Если `hasSeenTour === false` → tour показывается
5. Если `hasSeenTour === true` → tour НЕ показывается

### **Join the existing team:**

1. Пользователь нажимает "Join the existing team"
2. Переходит на `/register`
3. Проверяется localStorage: `tour_seen_register-tour`
4. Если не видел → показывается register tour
5. Если видел → tour НЕ показывается

---

## 🎯 Ключевые моменты

### **1. Двойная проверка:**
- ✅ Проверка в базе данных (для авторизованных)
- ✅ Проверка в localStorage (для неавторизованных)

### **2. Мгновенное сохранение:**
- ✅ При завершении тура → сразу сохраняется в localStorage
- ✅ При пропуске тура → сразу сохраняется в localStorage
- ✅ При авторизации → сохраняется в базе данных

### **3. Защита от повторного показа:**
- ✅ Tour не показывается если `hasSeenTour === true`
- ✅ Tour не показывается если localStorage = "true"
- ✅ Tour не показывается пока данные загружаются (`hasSeenTour === undefined`)

---

## 🧪 Тестирование

### **Тест 1: Первый вход**
```
1. Откройте http://localhost:3000/login
2. Должен показаться Onboarding tour ✅
3. Завершите или пропустите тур
4. Проверьте localStorage: tour_seen_login-tour = "true"
```

### **Тест 2: Второй вход**
```
1. Обновите страницу или зайдите снова
2. Tour НЕ должен показаться ✅
```

### **Тест 3: Join the existing team**
```
1. Нажмите "Join the existing team"
2. Перейдите на /register
3. Проверьте localStorage: tour_seen_register-tour
4. Если null → tour покажется
5. Если "true" → tour НЕ покажется
```

### **Тест 4: После авторизации**
```
1. Авторизуйтесь
2. Выйдите из системы
3. Зайдите снова
4. Tour НЕ должен показаться (если уже видели) ✅
```

---

## 📊 localStorage ключи

| Ключ | Значение | Когда устанавливается |
|------|----------|----------------------|
| `tour_seen_login-tour` | "true" | После завершения/пропуска login tour |
| `tour_seen_register-tour` | "true" | После завершения/пропуска register tour |

---

## ✅ Checklist

- [x] Обновлена логика `shouldShowTour`
- [x] Добавлено сохранение в localStorage при завершении
- [x] Добавлено сохранение в localStorage при пропуске
- [x] Проверка для login page
- [x] Проверка для register page
- [x] Tour показывается только один раз

---

**Версия:** 1.0.1  
**Дата:** 2026-03-12  
**Статус:** ✅ ИСПРАВЛЕНО

🎉 Onboarding tour теперь показывается только один раз!
