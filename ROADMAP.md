# 🗺️ HR Office — Roadmap интеграции новых модулей

> Сравнение с топовыми HR-платформами (Rippling, HiBob, BambooHR, Leapsome, Deel)
> Дата создания: 2026-05-01

---

## 📊 Статус

- ✅ = Реализовано
- 🔲 = Запланировано
- 🚧 = В процессе

---

## 🏆 Фаза 1 — Высокий приоритет (Core HR Features)

### 1.1 Performance Reviews / 360° Feedback
- ✅ Создать схему `convex/schema/performance.ts` (reviewCycles, reviewTemplates, reviewAssignments, reviewResponses, reviewRatings)
- ✅ Backend `convex/performance.ts`: listCycles, getCycleDetails, getMyAssignments, getRevieweeResults, getCycleSummary, listTemplates + createTemplate, createCycle, launchCycle, addPeerAssignment, submitReview, closeCycle, cancelCycle, deleteCycle, getEligibleParticipants
- ✅ UI: PerformanceClient (My Reviews, Cycles, Results tabs)
- ✅ CreateCycleWizard (3-step: Basic Info → Review Types → Competencies)
- ✅ FillReviewDialog (per-competency 1-5 rating + comments + strengths/improvements)
- ✅ LaunchCycleDialog (select participants, auto-assign self/manager)
- ✅ ResultsDialog (overall score, competency bars, grouped by type)
- ✅ CycleSummaryCard (all employees ranked by score)
- ✅ Mirror manager reviews → supervisorRatings (backward compat)
- ✅ Immutable competency snapshot at cycle creation
- ✅ Peer anonymity threshold (configurable, default 2)
- ✅ Sidebar nav item добавлен
- ✅ i18n: EN + RU переводы
- 🔲 Создать `src/app/(dashboard)/performance/page.tsx` (нужен mkdir)
- 🔲 Уведомления о дедлайнах ревью
- 🔲 Экспорт результатов

### 1.2 OKR / Goals Management
- ✅ Схема Convex: objectives, keyResults, goalCheckins (convex/schema/goals.ts)
- ✅ Backend convex/goals.ts: listObjectives, getObjective, getMyObjectives, getTeamProgress, getCheckinHistory + createObjective, updateObjective, deleteObjective, addKeyResult, updateKeyResult, deleteKeyResult, checkin, completeObjective, cancelObjective
- ✅ UI: GoalsClient (My Goals, Team, Company tabs)
- ✅ CreateObjectiveWizard (3-step: Basic Info → Key Results → Review)
- ✅ CheckinDialog (update KR value + confidence + note)
- ✅ ObjectiveDetailDialog (KRs с прогресс-барами + check-in history + aligned goals)
- ✅ Прогресс-бар для каждого KR (0-100%) с direction (increase/decrease)
- ✅ Дерево целей (company → team → individual) через parentObjectiveId
- ✅ Фильтрация по периоду (Q1-Q4, H1-H2, FY) и году
- ✅ Визуализация прогресса команды (stats cards)
- ✅ Team scope через department field
- ✅ Sidebar nav item добавлен (Crosshair icon)
- ✅ i18n: EN + RU переводы
- 🔲 Создать `src/app/(dashboard)/goals/page.tsx` (нужен mkdir)
- 🔲 i18n: HY переводы
- 🔲 Связь OKR с Performance Reviews
- 🔲 Check-in обновления (еженедельные напоминания)

### 1.3 Recruitment / ATS (Applicant Tracking System)
- ✅ Создать модуль `src/app/(dashboard)/recruitment/`
- ✅ Схема Convex: vacancies, candidateProfiles, applications, applicationEvents, interviews, interviewScorecards
- ✅ UI: список вакансий (CRUD)
- ✅ Kanban pipeline кандидатов (Applied → Screening → Interview → Offer → Hired)
- ✅ Карточка кандидата (резюме, контакты, заметки)
- ✅ Планирование интервью (scheduling)
- ✅ Scorecard для интервьюеров
- 🔲 Email-шаблоны для кандидатов (через Resend)
- ✅ Карьерная страница (публичная) — `/careers/[slug]` с формой подачи заявки
- 🔲 Аналитика воронки найма

### 1.4 Onboarding Workflows
- ✅ Создать модуль `src/app/(dashboard)/onboarding/`
- ✅ Схема Convex: onboardingTemplates, onboardingPrograms, onboardingTasks
- ✅ Шаблоны онбординга (по отделу/должности)
- ✅ Автоматические чеклисты для нового сотрудника (spawn from template)
- ✅ Назначение buddy/mentor
- ✅ Прогресс-трекер (% завершения, computed server-side)
- ✅ Автоматические задачи для IT/HR/менеджера (assigneeType + dayOffset)
- ✅ Welcome-страница для нового сотрудника (My Onboarding tab)
- 🔲 Интеграция с Tasks (автосоздание задач)
- 🔲 Связь с Recruitment (auto-trigger при hired)

### 1.5 Offboarding Workflows
- ✅ Создать модуль `src/app/(dashboard)/offboarding/`
- ✅ Схема Convex: offboardingPrograms, offboardingTasks, exitInterviews (convex/schema/offboarding.ts)
- ✅ Backend: listPrograms, getProgram, getRetentionInsights + startOffboarding, completeTask, skipTask, addTask, submitExitInterview, completeProgram, cancelProgram
- ✅ Чеклист увольнения (8 default tasks: access revoke, equipment return, knowledge transfer, etc.)
- ✅ Exit Interview форма (5-point experience, recommend, feedback, improvements)
- ✅ Аналитика причин увольнения (retention insights: reason breakdown, avg experience, recommend rate)
- ✅ StartOffboardingWizard (3-step: Employee → Details → Confirm)
- ✅ ProgramDetailDialog (checklist + exit interview panel)
- ✅ Sidebar nav + i18n (EN/RU)

### 1.6 E-Signatures
- ✅ Собственная реализация (без DocuSign)
- ✅ Схема Convex: documentTemplates, signatureDocuments, signatureRequests, signatureAuditLog
- ✅ Backend: listTemplates, listDocuments, getDocument, getMyPendingSignatures, getAuditLog, getStats + createTemplate, createDocument, signDocument, declineDocument, cancelDocument, sendReminder, deleteTemplate
- ✅ UI: ESignaturesClient (Tabs: My Signatures, Documents)
- ✅ CreateDocumentWizard (3-step: Doc Info → Signers → Review)
- ✅ SignDocumentDialog (document preview + Canvas signature pad + sign/decline)
- ✅ DocumentDetailDialog (status, signers progress, audit log)
- ✅ TemplateManager (CRUD шаблонов с категориями)
- ✅ Canvas/Pad для рисования подписи (mouse + touch)
- ✅ Аудит-лог (created, sent, viewed, signed, declined, cancelled, reminder_sent)
- ✅ Шаблоны документов (NDA, Offer, Contract, Policy, Custom)
- ✅ Иммутабельный снапшот документа при отправке (content hash)
- ✅ Последовательная подпись (signing order enforcement)
- ✅ Sidebar nav item добавлен (admin, supervisor, employee)
- ✅ i18n: EN + RU переводы
- 🔲 Создать `src/app/(dashboard)/signatures/page.tsx` (нужен mkdir)
- 🔲 i18n: HY nav key (не удалось из-за ограничений инструмента)
- 🔲 PDF-генерация подписанного документа (отложено)

### 1.7 Employee Engagement / Pulse Surveys
- ✅ Схема Convex: surveys, surveyQuestions, surveyResponses, surveyAnswers (convex/schema/surveys.ts)
- ✅ Backend: listSurveys, getSurveyWithQuestions, getSurveyResults, hasUserResponded
- ✅ Backend mutations: createSurvey, publishSurvey, closeSurvey, deleteSurvey, submitResponse
- ✅ UI: SurveysClient (list, filter tabs, wizard создания, TakeSurveyDialog, ResultsDialog)
- ✅ Типы вопросов: rating, multiple_choice, text, yes_no, nps
- ✅ Анонимные ответы
- ✅ eNPS (Employee Net Promoter Score) — тип вопроса nps (0-10)
- ✅ Sidebar nav item добавлен (для всех ролей)
- ✅ i18n: EN + RU переводы
- 🔲 Создать `src/app/(dashboard)/surveys/page.tsx` (нужен mkdir)
- 🔲 Конструктор опросов (drag-and-drop порядок вопросов)
- 🔲 Автоматические pulse-опросы (cron: еженедельно/ежемесячно)
- 🔲 Дашборд результатов с трендами
- 🔲 Сегментация по отделам

### 1.8 Recognition & Kudos
- ✅ Схема Convex: kudos, kudosBadges, kudosBadgeAwards (convex/schema/recognition.ts)
- ✅ Backend queries: getKudosFeed, getKudosForUser, getLeaderboard, getUserKudosStats, getBadges
- ✅ Backend mutations: sendKudos, reactToKudos, deleteKudos, createBadge, awardBadge
- ✅ UI: RecognitionClient (Feed, Leaderboard tabs, Stats cards)
- ✅ SendKudos Wizard (3-step: Recipient → Category → Message+Confirm)
- ✅ Sidebar nav item добавлен (для всех ролей)
- ✅ i18n: EN + RU переводы
- ✅ Points Economy: userPoints + pointTransactions схема
- ✅ Points: баланс отображается в UI (wizard header + stats card)
- ✅ Points: sendKudos списывает 3 очка (с проверкой баланса)
- ✅ Points: +1 за посещаемость (интеграция в timeTracking.checkIn)
- ✅ Points: +3 за положительный отзыв ≥4★ (интеграция в supervisorRatings.createRating)
- 🔲 i18n: HY перевод (нужны армянские переводы)
- 🔲 Создать `src/app/(dashboard)/recognition/page.tsx` (нужен mkdir)
- 🔲 Переместить компонент из `src/components/RecognitionClient.tsx` → `src/components/recognition/`

---

## 🥈 Фаза 2 — Средний приоритет (Competitive Edge)

### 2.1 Learning Management System (LMS)
- 🔲 Создать модуль `src/app/(dashboard)/learning/`
- 🔲 Схема Convex: courses, lessons, enrollments, certificates
- 🔲 Каталог курсов (внутренних и внешних)
- 🔲 Видео/текстовые уроки
- 🔲 Тесты и квизы
- 🔲 Прогресс обучения (% завершения)
- 🔲 Сертификаты по завершении
- 🔲 Обязательные тренинги (compliance)
- 🔲 Назначение курсов менеджером
- 🔲 Отчёт по обучению команды

### 2.2 Compensation Management
- 🔲 Создать модуль `src/app/(dashboard)/compensation/`
- 🔲 Схема Convex: salary_bands, compensation_reviews, bonuses
- 🔲 Salary bands по должностям (min/mid/max)
- 🔲 Визуализация: позиция сотрудника в salary band
- 🔲 Циклы пересмотра зарплат
- 🔲 Бонусы и премии
- 🔲 Бюджетирование повышений
- 🔲 Сравнение с рынком (benchmarking)
- 🔲 История изменений compensation

### 2.3 Benefits Administration
- 🔲 Создать модуль `src/app/(dashboard)/benefits/`
- 🔲 Схема Convex: benefit_plans, enrollments, claims
- 🔲 Каталог бенефитов (страховка, фитнес, обучение)
- 🔲 Self-service enrollment
- 🔲 Баланс бенефитов (flexible benefits budget)
- 🔲 Подтверждение/одобрение claims
- 🔲 Интеграция с payroll

### 2.4 Visual Org Chart
- 🔲 Создать модуль `src/app/(dashboard)/org-chart/`
- 🔲 Интерактивная визуализация (D3.js или React Flow)
- 🔲 Уровни: company → department → team → person
- 🔲 Поиск и фильтрация
- 🔲 Клик на человека → мини-профиль
- 🔲 Drag-and-drop для реорганизации (admin)
- 🔲 Экспорт в PDF/PNG

### 2.5 Document Management System
- 🔲 Создать модуль `src/app/(dashboard)/documents/`
- 🔲 Схема Convex: documents, folders, document_access
- 🔲 Иерархия папок (по отделу, типу, сотруднику)
- 🔲 Загрузка/скачивание файлов
- 🔲 Контроль доступа (кто может видеть)
- 🔲 Версионирование документов
- 🔲 Шаблоны документов
- 🔲 Поиск по содержимому
- 🔲 Интеграция с E-Signatures

### 2.6 Expense Management
- 🔲 Создать модуль `src/app/(dashboard)/expenses/`
- 🔲 Схема Convex: expense_reports, expense_items, receipts
- 🔲 Подача расходов (фото чека, сумма, категория)
- 🔲 Одобрение менеджером
- 🔲 Политики расходов (лимиты по категориям)
- 🔲 Отчёты по расходам (по отделу, периоду)
- 🔲 Интеграция с payroll (reimbursement)

### 2.7 Succession Planning
- 🔲 Создать модуль `src/app/(dashboard)/succession/`
- 🔲 Схема Convex: key_positions, successors, development_plans
- 🔲 9-Box Grid (Performance vs Potential)
- 🔲 Определение ключевых позиций
- 🔲 Назначение потенциальных преемников
- 🔲 Планы развития (linked to LMS)
- 🔲 Risk assessment (что если человек уйдёт)

---

## 🥉 Фаза 3 — Дополнительные фичи (Differentiation)

### 3.1 Mobile App (PWA)
- 🔲 Настроить PWA manifest + service worker
- 🔲 Responsive design для всех модулей
- 🔲 Push-уведомления (Web Push API)
- 🔲 Offline mode (кэширование)
- 🔲 Быстрые действия: одобрить leave, отметить attendance
- 🔲 Или: React Native app (iOS + Android)

### 3.2 Compliance & Audit Trail
- 🔲 Схема Convex: audit_logs (who, what, when, IP, before/after)
- 🔲 Автоматическое логирование ВСЕХ действий
- 🔲 UI: просмотр аудит-лога (фильтры по user, action, date)
- 🔲 GDPR-инструменты (data export, right to delete)
- 🔲 Compliance дашборд
- 🔲 Retention policies для данных

### 3.3 Asset / IT Equipment Management
- 🔲 Создать модуль `src/app/(dashboard)/assets/`
- 🔲 Схема Convex: assets, asset_assignments, asset_categories
- 🔲 Инвентарь оборудования (ноутбуки, телефоны, ключи)
- 🔲 Выдача/возврат (связь с onboarding/offboarding)
- 🔲 Статусы: available, assigned, repair, retired
- 🔲 QR-коды для быстрого scan
- 🔲 Напоминания о возврате

### 3.4 Company News Feed / Announcements
- 🔲 Создать модуль `src/app/(dashboard)/news/`
- 🔲 Схема Convex: announcements, reactions, comments
- 🔲 Лента новостей компании
- 🔲 Категории: news, events, birthdays, achievements
- 🔲 Rich-text editor для постов
- 🔲 Реакции и комментарии
- 🔲 Pin важных объявлений
- 🔲 Таргетинг (по отделу, роли)

### 3.5 Custom Workflow Builder (Visual)
- 🔲 Визуальный конструктор (React Flow / xyflow)
- 🔲 Drag-and-drop ноды (trigger → condition → action)
- 🔲 Триггеры: new employee, leave approved, birthday, etc.
- 🔲 Действия: send email, create task, notify, update field
- 🔲 Шаблоны готовых workflow
- 🔲 Логирование выполнения

### 3.6 Employee Directory
- 🔲 Создать модуль `src/app/(dashboard)/directory/`
- 🔲 Поиск по имени, отделу, должности, навыкам
- 🔲 Карточки сотрудников (фото, контакты, department)
- 🔲 Фильтрация и сортировка
- 🔲 Quick actions (написать в чат, позвонить)
- 🔲 Карта офиса (кто где сидит) — опционально

### 3.7 PDF Reports / Export
- 🔲 Библиотека генерации PDF (react-pdf или puppeteer)
- 🔲 Экспорт: employee profile, payslip, leave report
- 🔲 Экспорт: attendance report, team report
- 🔲 Шаблоны отчётов (customizable)
- 🔲 Bulk export (несколько сотрудников)
- 🔲 Scheduled reports (автоматическая отправка по email)

### 3.8 Career Development Paths
- 🔲 Создать модуль `src/app/(dashboard)/careers/`
- 🔲 Skill Matrix (навыки по должностям)
- 🔲 Career tracks (Junior → Mid → Senior → Lead)
- 🔲 Gap analysis (что нужно для повышения)
- 🔲 Связь с LMS (рекомендованные курсы)
- 🔲 Менторство (назначение менторов)

### 3.9 Shift Scheduling
- 🔲 Создать модуль `src/app/(dashboard)/shifts/`
- 🔲 Схема Convex: shifts, shift_templates, shift_swaps
- 🔲 Визуальное расписание смен (week/month view)
- 🔲 Шаблоны смен (утренняя, вечерняя, ночная)
- 🔲 Запросы на замену (swap requests)
- 🔲 Автоматическое распределение
- 🔲 Уведомления об изменениях
- 🔲 Связь с attendance tracking

---

## 📈 Порядок реализации (рекомендация)

```
Фаза 1 (MVP фичи — делают платформу полноценной):
  1.8 Recognition & Kudos ............ ~2-3 дня  (простая, быстрый результат)
  1.7 Pulse Surveys .................. ~3-4 дня
  1.4 Onboarding Workflows ........... ~4-5 дней
  1.1 Performance Reviews ............ ~5-7 дней
  1.2 OKR / Goals .................... ~4-5 дней
  1.6 E-Signatures ................... ~3-4 дня
  1.3 Recruitment / ATS .............. ~7-10 дней
  1.5 Offboarding .................... ~2-3 дня

Фаза 2 (конкурентное преимущество):
  2.4 Visual Org Chart ............... ~2-3 дня
  2.5 Document Management ............ ~4-5 дней
  2.6 Expense Management ............. ~3-4 дня
  2.2 Compensation Management ........ ~4-5 дней
  2.1 LMS ............................ ~7-10 дней
  2.3 Benefits ....................... ~3-4 дня
  2.7 Succession Planning ............ ~3-4 дня

Фаза 3 (differentiation):
  3.7 PDF Reports .................... ~2-3 дня
  3.4 Company News Feed .............. ~2-3 дня
  3.6 Employee Directory ............. ~2-3 дня
  3.2 Compliance & Audit Trail ....... ~3-4 дня
  3.1 Mobile App (PWA) ............... ~5-7 дней
  3.3 Asset Management ............... ~3-4 дня
  3.5 Custom Workflow Builder ......... ~7-10 дней
  3.8 Career Development ............. ~4-5 дней
  3.9 Shift Scheduling ............... ~4-5 дней
```

---

## 🔧 Технические заметки

- **Все модули** используют существующий стек: Next.js 16 + Convex + Shadcn/ui + Tailwind
- **Схемы БД** добавляются в `convex/schema/` или `convex/schema.ts`
- **i18n** — каждый новый модуль должен поддерживать EN/RU/HY
- **RBAC** — каждый модуль имеет permission checks (Superadmin/Admin/Supervisor/Employee)
- **Real-time** — использовать Convex subscriptions для live-updates
- **Тесты** — unit tests (Jest) + E2E (Playwright) для каждого нового модуля

---

> 💡 Чтобы продолжить — просто скажи номер фичи (например "1.1") и я начну реализацию.
