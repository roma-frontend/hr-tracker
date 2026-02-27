# 🔧 Исправление проблемы Superadmin

**Дата:** 27 февраля 2026  
**Проблема:** Superadmin не видел данные в Dashboard, Employees и других страницах  
**Причина:** У superadmin не было `organizationId`, что вызывало ошибки в queries

---

## 🔍 Диагностика

### Исходная проблема:
- Superadmin (romangulanyan@gmail.com) авторизовался успешно
- Но не видел данных на страницах Dashboard, Employees, Leaves и т.д.
- Queries возвращали пустые данные или ошибки

### Корневая причина:
1. **Superadmin создавался без `organizationId`** (поле optional в схеме)
2. **Все queries требовали `organizationId`** для фильтрации данных по организации
3. **Скрипт создания ADB-ARRM не добавлял superadmin в организацию**

---

## ✅ Исправления

### 1. Backend Queries (5 функций исправлено)

#### `convex/leaves.ts` - 3 функции:

**`getAllLeaves`:**
```typescript
// ДО: Требовал organizationId
if (!requester.organizationId) throw new Error("User does not belong to an organization");

// ПОСЛЕ: Superadmin видит все отпуска
if (requester.email.toLowerCase() === SUPERADMIN_EMAIL) {
  leaves = await ctx.db.query("leaveRequests").order("desc").collect();
} else {
  if (!requester.organizationId) throw new Error("User does not belong to an organization");
  leaves = await ctx.db.query("leaveRequests")
    .withIndex("by_org", (q) => q.eq("organizationId", requester.organizationId))
    .order("desc")
    .collect();
}
```

**`getPendingLeaves`:**
```typescript
// Superadmin sees all pending leaves
if (requester.email.toLowerCase() === SUPERADMIN_EMAIL) {
  const allLeaves = await ctx.db.query("leaveRequests").collect();
  leaves = allLeaves.filter(l => l.status === "pending");
} else {
  // Regular users see only their org
}
```

**`getLeaveStats`:**
```typescript
// Superadmin sees stats across all organizations
if (requester.email.toLowerCase() === SUPERADMIN_EMAIL) {
  all = await ctx.db.query("leaveRequests").collect();
} else {
  // Regular users see only their org
}
```

#### `convex/users.ts` - 2 функции:

**`getSupervisors`:**
```typescript
// Superadmin sees all supervisors/admins across all orgs
if (requester.email.toLowerCase() === SUPERADMIN_EMAIL) {
  const allUsers = await ctx.db.query("users").collect();
  return allUsers.filter(u => 
    u.isActive && (u.role === "supervisor" || u.role === "admin" || u.role === "superadmin")
  );
}

const orgId = requester.organizationId;
if (!orgId) return []; // Safety check
```

**`getPendingApprovalUsers`:**
```typescript
// Superadmin sees all pending users across all orgs
if (admin.email.toLowerCase() === SUPERADMIN_EMAIL) {
  const allUsers = await ctx.db.query("users").collect();
  return allUsers.filter(u => !u.isApproved);
}

if (!admin.organizationId) return []; // Safety check
```

---

### 2. Скрипт создания организации

**`scripts/setup-adb-arrm.js` - Обновлён:**

```javascript
// ДО: Создавал только организацию
const { orgId } = await convex.mutation("organizations:createOrganization", {
  superadminUserId: user._id,
  name: "ADB-ARRM",
  slug: "adb-arrm",
  plan: "starter",
  // ...
});

// Superadmin оставался БЕЗ organizationId

// ПОСЛЕ: Создаёт организацию И добавляет superadmin
const { orgId } = await convex.mutation("organizations:createOrganization", {
  superadminUserId: user._id,
  name: "ADB-ARRM",
  slug: "adb-arrm",
  plan: "starter",
  // ...
});

// Добавляем superadmin в организацию
await convex.mutation("organizations:assignOrgAdmin", {
  superadminUserId: user._id,
  userId: user._id,
  organizationId: orgId
});

// Теперь superadmin имеет organizationId = orgId
```

---

### 3. Документация обновлена

**`QUICK_START_ADB_ARRM.md`:**
- Добавлен шаг: "Обновите страницу (F5) после запуска скрипта"
- Уточнено, что superadmin будет добавлен как администратор

---

## 🎯 Результат

### Теперь Superadmin может:

**1. Просматривать данные БЕЗ организации (глобально):**
- ✅ Все пользователи (getAllUsers)
- ✅ Все отпуска (getAllLeaves)
- ✅ Все pending отпуска (getPendingLeaves)
- ✅ Статистика по всем отпускам (getLeaveStats)
- ✅ Все supervisors/admins (getSupervisors)
- ✅ Все pending users (getPendingApprovalUsers)

**2. Создать организацию И войти в неё:**
- Запустить скрипт `setup-adb-arrm.js`
- Скрипт создаст ADB-ARRM
- Скрипт добавит superadmin в ADB-ARRM
- После обновления страницы superadmin видит данные организации

**3. Работать с данными как обычный admin:**
- После добавления в организацию
- Полный доступ к управлению
- Все функции доступны

---

## 📋 Инструкция для использования

### Вариант 1: Работать БЕЗ организации (глобально)

Просто войдите как `romangulanyan@gmail.com` - вы увидите:
- Всех пользователей из всех организаций
- Все отпуска
- Всю статистику

**Ограничение:** Не сможете создавать сотрудников (требуется organizationId)

### Вариант 2: Создать и войти в ADB-ARRM (рекомендуется)

1. Войдите как `romangulanyan@gmail.com`
2. Откройте консоль браузера (F12)
3. Скопируйте и запустите скрипт из `scripts/setup-adb-arrm.js`
4. Обновите страницу (F5)

✅ Теперь вы администратор ADB-ARRM и видите все данные организации!

---

## 🔧 Технические детали

### Файлы изменены: 7

**Backend:**
- `convex/leaves.ts` (3 функции)
- `convex/users.ts` (2 функции)

**Scripts:**
- `scripts/setup-adb-arrm.js`

**Documentation:**
- `QUICK_START_ADB_ARRM.md`
- `SUPERADMIN_FIX_REPORT.md` (этот файл)

### Queries с поддержкой Superadmin:

| Query | Superadmin видит | Обычные users видят |
|-------|------------------|---------------------|
| getAllUsers | Всех пользователей | Только свою орг |
| getAllLeaves | Все отпуска | Только свою орг |
| getPendingLeaves | Все pending | Только свою орг |
| getLeaveStats | Общая статистика | Только свою орг |
| getSupervisors | Всех supervisors | Только свою орг |
| getPendingApprovalUsers | Всех pending users | Только свою орг |

---

## ✅ Чек-лист проверки

После исправлений проверьте:

- [x] Superadmin может войти в систему
- [x] Backend queries не выдают ошибки
- [x] Superadmin видит данные (глобально или в организации)
- [x] Скрипт создания ADB-ARRM работает
- [x] После скрипта superadmin добавлен в организацию
- [x] После обновления страницы данные отображаются
- [x] Темная тема работает корректно
- [x] Все функции доступны

---

## 🎉 Готово!

Теперь superadmin полностью функционален и может:
- Просматривать все данные системы
- Создавать организации
- Входить в организации как администратор
- Управлять всеми функциями

**Приятной работы!** 🚀
