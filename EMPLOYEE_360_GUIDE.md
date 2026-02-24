# 🎯 Employee 360° Management System - User Guide

## 📋 Overview

Добро пожаловать в **Employee 360° Management System** - комплексную AI-powered систему для управления сотрудниками, включающую детальные профили, анализ производительности, и умные рекомендации по одобрению отпусков.

---

## 🚀 Новые Функции

### 1️⃣ **Расширенные профили сотрудников**

#### **Что включает:**
- 📝 Биография (образование, сертификаты, навыки, языки)
- 📄 Хранилище документов (резюме, контракты, сертификаты)
- 📊 Метрики производительности
- 💬 Заметки менеджеров
- 🤖 AI-скоринг сотрудника

#### **Как использовать:**
1. Перейдите в раздел **Employees**
2. Нажмите на любого сотрудника
3. Откроется детальный профиль с AI-анализом

---

### 2️⃣ **AI Leave Approval Assistant**

#### **Что делает:**
- ✅ Анализирует заявку на отпуск
- 📊 Оценивает сотрудника по 5 критериям
- 💡 Дает рекомендацию (Approve/Review/Reject)
- 🎯 Показывает уровень уверенности (High/Medium/Low)

#### **Критерии оценки:**
1. **Performance** (30%) - KPI, завершенность проектов, соблюдение дедлайнов
2. **Attendance** (20%) - Пунктуальность, отсутствия, опоздания
3. **Behavior** (20%) - Отзывы менеджеров, дисциплина, сотрудничество
4. **Leave History** (15%) - Использование отпусков, паттерны
5. **Workload** (15%) - Текущая загрузка команды, покрытие

#### **Пример оценки:**
```
Eligibility Score: 87/100
Recommendation: APPROVE
Confidence: HIGH

Breakdown:
- Performance: 92%
- Attendance: 85%
- Behavior: 95%
- Leave History: 88%
- Workload: 78%

Reasoning: Employee demonstrates strong performance and 
responsible leave usage. Current workload permits absence.
```

---

### 3️⃣ **Manager Notes System**

#### **Типы заметок:**
- 🎯 **Performance** - Результаты работы
- 😊 **Behavior** - Поведение
- 🏆 **Achievement** - Достижения
- ⚠️ **Concern** - Проблемы
- 📝 **General** - Общие заметки

#### **Уровни видимости:**
- 🔒 **Private** - Только автор
- 👔 **Manager Only** - Менеджеры и админы
- 🏢 **HR Only** - Только HR/Админы
- 👁️ **Employee Visible** - Видно сотруднику

#### **Как добавить заметку:**
1. Откройте профиль сотрудника
2. Найдите секцию "Manager Notes"
3. Нажмите "Add Note"
4. Выберите тип и видимость
5. Напишите комментарий

**AI автоматически анализирует sentiment (позитивный/нейтральный/негативный)!**

---

### 4️⃣ **Performance Metrics Dashboard**

#### **Метрики посещаемости:**
- Punctuality Score (0-100)
- Absence Rate (%)
- Late Arrivals (количество)

#### **Метрики производительности:**
- KPI Score (0-5)
- Project Completion (%)
- Deadline Adherence (%)

#### **Метрики сотрудничества:**
- Teamwork Rating (0-5)
- Communication Score (0-5)
- Conflict Incidents (количество)

---

### 5️⃣ **Document Management**

#### **Поддерживаемые категории:**
- 📄 Resume
- 📋 Contract
- 🎓 Certificate
- ⭐ Performance Review
- 🆔 ID Document
- 📁 Other

#### **Как загрузить документ:**
1. Откройте профиль сотрудника
2. Перейдите в "Documents"
3. Нажмите "Upload Document"
4. Выберите категорию и файл
5. Добавьте описание (опционально)

---

## 🔧 Backend API Functions

### **Employee Profiles**
```typescript
// Получить полный профиль
api.employeeProfiles.getEmployeeProfile({ userId })

// Обновить биографию
api.employeeProfiles.updateBiography({ userId, biography })

// Загрузить документ
api.employeeProfiles.uploadDocument({ 
  userId, uploaderId, category, fileName, fileUrl, fileSize 
})

// Получить документы
api.employeeProfiles.getDocuments({ userId })
```

### **Employee Notes**
```typescript
// Добавить заметку
api.employeeNotes.addNote({ 
  employeeId, authorId, type, visibility, content, tags 
})

// Получить заметки (с фильтрацией по правам)
api.employeeNotes.getNotes({ employeeId, viewerId })

// Статистика заметок
api.employeeNotes.getNotesSummary({ employeeId })
```

### **Performance Metrics**
```typescript
// Обновить метрики
api.employeeProfiles.updatePerformanceMetrics({ 
  userId, updatedBy, metrics 
})

// История метрик
api.employeeProfiles.getPerformanceHistory({ userId, limit })
```

### **AI Evaluator**
```typescript
// Получить AI-скор сотрудника
api.aiEvaluator.calculateEmployeeScore({ userId })

// Оценить заявку на отпуск
api.aiEvaluator.evaluateLeaveRequest({ leaveRequestId })
```

---

## 🎨 UI Components

### **EmployeeProfileDetail**
Детальный профиль сотрудника с:
- Основная информация
- Leave balances
- AI performance breakdown
- Биография
- Документы

**Использование:**
```tsx
import EmployeeProfileDetail from "@/components/employees/EmployeeProfileDetail";

<EmployeeProfileDetail employeeId={userId} />
```

### **AILeaveAssistant**
AI-ассистент для одобрения отпусков

**Использование:**
```tsx
import AILeaveAssistant from "@/components/leaves/AILeaveAssistant";

<AILeaveAssistant leaveRequestId={leaveId} />
```

---

## 📊 Database Schema

### **employeeProfiles**
```typescript
{
  userId: Id<"users">,
  biography: {
    education?: string[],
    certifications?: string[],
    workHistory?: string[],
    skills?: string[],
    languages?: string[]
  },
  createdAt: number,
  updatedAt: number
}
```

### **employeeDocuments**
```typescript
{
  userId: Id<"users">,
  uploaderId: Id<"users">,
  category: "resume" | "contract" | "certificate" | ...,
  fileName: string,
  fileUrl: string,
  fileSize: number,
  description?: string,
  uploadedAt: number
}
```

### **employeeNotes**
```typescript
{
  employeeId: Id<"users">,
  authorId: Id<"users">,
  type: "performance" | "behavior" | "achievement" | "concern" | "general",
  visibility: "private" | "hr_only" | "manager_only" | "employee_visible",
  content: string,
  sentiment: "positive" | "neutral" | "negative",
  tags: string[],
  createdAt: number
}
```

### **performanceMetrics**
```typescript
{
  userId: Id<"users">,
  updatedBy: Id<"users">,
  // Attendance
  punctualityScore: number,
  absenceRate: number,
  lateArrivals: number,
  // Performance
  kpiScore: number,
  projectCompletion: number,
  deadlineAdherence: number,
  // Collaboration
  teamworkRating: number,
  communicationScore: number,
  conflictIncidents: number,
  createdAt: number
}
```

---

## 🔐 Security & Privacy

### **Access Control**
- **Employee**: Видит свой профиль, публичные заметки
- **Manager**: Видит профили команды, может добавлять заметки
- **HR/Admin**: Полный доступ ко всем данным

### **GDPR Compliance**
- Audit logs для просмотра профилей
- 7-летний retention policy
- Sensitive data protection

---

## 🎯 Best Practices

### **Для Менеджеров:**
1. ✅ Регулярно обновляйте заметки о сотрудниках
2. ✅ Используйте конкретные примеры в заметках
3. ✅ Балансируйте позитивные и конструктивные отзывы
4. ✅ Проверяйте AI-рекомендации, но принимайте собственные решения
5. ✅ Обновляйте performance metrics раз в квартал

### **Для HR:**
1. ✅ Поддерживайте документы актуальными
2. ✅ Мониторьте AI scores для выявления проблем
3. ✅ Используйте insights для планирования развития
4. ✅ Настройте автоматические напоминания об обновлении метрик

### **Для Сотрудников:**
1. ✅ Регулярно обновляйте свою биографию
2. ✅ Добавляйте новые skills и сертификаты
3. ✅ Загружайте важные документы
4. ✅ Проверяйте employee-visible заметки

---

## 🚦 Workflow Examples

### **Scenario 1: Одобрение отпуска**
1. Сотрудник подает заявку на отпуск
2. Менеджер открывает заявку
3. AI Assistant показывает рекомендацию (87/100 - Approve)
4. Менеджер проверяет детали:
   - Performance: 92% ✅
   - Team coverage: 2 других в отпуске ⚠️
5. Менеджер одобряет с условием backup plan

### **Scenario 2: Performance Review**
1. HR открывает профиль сотрудника
2. Видит AI Score: 65/100 (снижение с 78)
3. Проверяет breakdown:
   - Attendance: 55% ⚠️ (10 опозданий)
   - Manager notes: 3 concerns
4. HR планирует встречу для обсуждения

### **Scenario 3: Promotion Decision**
1. Менеджер рассматривает кандидата на повышение
2. AI Score: 94/100
3. Проверяет:
   - 8 positive manager notes
   - KPI: 4.8/5
   - 0 conflicts
4. Рекомендует для promotion

---

## 📈 Roadmap

### **Планируемые улучшения:**
- [ ] Email notifications при критических AI scores
- [ ] Автоматические performance reviews
- [ ] Skills gap analysis
- [ ] Burnout prediction
- [ ] Integration с training platforms
- [ ] Mobile app для quick notes

---

## 🆘 Troubleshooting

### **AI Assistant не показывается**
- Проверьте, что заявка в статусе "pending"
- Убедитесь, что у сотрудника есть performance metrics

### **Document upload failed**
- Проверьте размер файла (< 10MB)
- Убедитесь, что формат поддерживается

### **Notes не отображаются**
- Проверьте уровень видимости
- Убедитесь в наличии прав доступа

---

## 📞 Support

Для вопросов и поддержки:
- 📧 Email: hr-support@company.com
- 💬 Slack: #hr-system-help
- 📚 Wiki: https://wiki.company.com/hr-system

---

**Версия:** 2.0.0  
**Последнее обновление:** 2026-02-24  
**Автор:** HR Tech Team
