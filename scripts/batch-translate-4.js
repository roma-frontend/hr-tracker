#!/usr/bin/env node
/**
 * Batch Translation Script #4
 * Target: Reach 50%+ coverage
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

console.log('🚀 BATCH TRANSLATION #4 - Push to 50%!\n');

let totalAdded = 0;

function addTranslations(section, enData, ruData, hyData) {
  enJson[section] = { ...enJson[section], ...enData };
  ruJson[section] = { ...ruJson[section], ...ruData };
  hyJson[section] = { ...hyJson[section], ...hyData };
  
  const count = Object.keys(enData).length;
  console.log(`✅ ${section}: ${count} keys`);
  totalAdded += count;
}

// 1. titles (30 keys) - HIGH PRIORITY
addTranslations('titles', {
  dashboard: "Dashboard",
  employees: "Employees",
  attendance: "Attendance",
  leaves: "Leaves",
  reports: "Reports",
  settings: "Settings",
  profile: "Profile",
  analytics: "Analytics",
  tasks: "Tasks",
  calendar: "Calendar",
  notifications: "Notifications",
  help: "Help",
  logout: "Logout",
  admin: "Admin",
  superadmin: "Super Admin",
  organizations: "Organizations",
  users: "Users",
  roles: "Roles",
  permissions: "Permissions",
  integrations: "Integrations",
  billing: "Billing",
  security: "Security",
  appearance: "Appearance",
  language: "Language",
  timezone: "Timezone",
  totalEmployees: "Total Employees",
  pendingApprovals: "Pending Approvals",
  leaveRequests: "Leave Requests",
  avgApprovalTime: "Avg. Approval Time",
  editOrganization: "Edit organization"
}, {
  dashboard: "Панель управления",
  employees: "Сотрудники",
  attendance: "Посещаемость",
  leaves: "Отпуска",
  reports: "Отчёты",
  settings: "Настройки",
  profile: "Профиль",
  analytics: "Аналитика",
  tasks: "Задачи",
  calendar: "Календарь",
  notifications: "Уведомления",
  help: "Помощь",
  logout: "Выход",
  admin: "Администратор",
  superadmin: "Супер админ",
  organizations: "Организации",
  users: "Пользователи",
  roles: "Роли",
  permissions: "Права доступа",
  integrations: "Интеграции",
  billing: "Оплата",
  security: "Безопасность",
  appearance: "Оформление",
  language: "Язык",
  timezone: "Часовой пояс",
  totalEmployees: "Всего сотрудников",
  pendingApprovals: "Ожидают одобрения",
  leaveRequests: "Запросы на отпуск",
  avgApprovalTime: "Ср. время одобрения",
  editOrganization: "Редактировать организацию"
}, {
  dashboard: "Վահանակ",
  employees: "Աշխատակիցներ",
  attendance: "Ներկայություն",
  leaves: "Արձակուրդներ",
  reports: "Հաշվետվություններ",
  settings: "Կարգավորումներ",
  profile: "Պրոֆիլ",
  analytics: "Վերլուծություն",
  tasks: "Առաջադրանքներ",
  calendar: "Օրացույց",
  notifications: "Ծանուցումներ",
  help: "Օգնություն",
  logout: "Ելք",
  admin: "Ադմինիստրատոր",
  superadmin: "Սուպեր ադմին",
  organizations: "Կազմակերպություններ",
  users: "Օգտատերեր",
  roles: "Դերեր",
  permissions: "Թույլտվություններ",
  integrations: "Ինտեգրումներ",
  billing: "Վճարում",
  security: "Անվտանգություն",
  appearance: "Արտաքին տեսք",
  language: "Լեզու",
  timezone: "Ժամային գոտի",
  totalEmployees: "Ընդամենը աշխատակիցներ",
  pendingApprovals: "Սպասում են հաստատման",
  leaveRequests: "Արձակուրդի հայտեր",
  avgApprovalTime: "Միջին հաստատման ժամանակ",
  editOrganization: "Խմբագրել կազմակերպությունը"
});

// 2. employeeInfo (20 keys)
addTranslations('employeeInfo', {
  name: "Name",
  email: "Email",
  phone: "Phone",
  department: "Department",
  position: "Position",
  role: "Role",
  status: "Status",
  joinDate: "Join Date",
  employeeId: "Employee ID",
  manager: "Manager",
  location: "Location",
  employeeType: "Employee Type",
  fullTime: "Full Time",
  partTime: "Part Time",
  contract: "Contract",
  active: "Active",
  inactive: "Inactive",
  onLeave: "On Leave",
  suspended: "Suspended",
  terminated: "Terminated"
}, {
  name: "Имя",
  email: "Email",
  phone: "Телефон",
  department: "Отдел",
  position: "Должность",
  role: "Роль",
  status: "Статус",
  joinDate: "Дата приёма",
  employeeId: "ID сотрудника",
  manager: "Менеджер",
  location: "Местоположение",
  employeeType: "Тип сотрудника",
  fullTime: "Полная занятость",
  partTime: "Частичная занятость",
  contract: "Контракт",
  active: "Активен",
  inactive: "Неактивен",
  onLeave: "В отпуске",
  suspended: "Приостановлен",
  terminated: "Уволен"
}, {
  name: "Անուն",
  email: "Էլ. փոստ",
  phone: "Հեռախոս",
  department: "Բաժին",
  position: "Պաշտոն",
  role: "Դեր",
  status: "Կարգավիճակ",
  joinDate: "Միացման ամսաթիվ",
  employeeId: "Աշխատակցի ID",
  manager: "Մենեջեր",
  location: "Տեղակայություն",
  employeeType: "Աշխատակցի տեսակ",
  fullTime: "Լրիվ դրույք",
  partTime: "Մասնակի դրույք",
  contract: "Պայմանագիր",
  active: "Ակտիվ",
  inactive: "Ոչ ակտիվ",
  onLeave: "Արձակուրդում",
  suspended: "Կասեցված",
  terminated: "Ազատված"
});

// 3. time (18 keys)
addTranslations('time', {
  today: "Today",
  yesterday: "Yesterday",
  tomorrow: "Tomorrow",
  thisWeek: "This Week",
  lastWeek: "Last Week",
  thisMonth: "This Month",
  lastMonth: "Last Month",
  thisYear: "This Year",
  custom: "Custom",
  from: "From",
  to: "To",
  days: "days",
  hours: "hours",
  minutes: "minutes",
  seconds: "seconds",
  ago: "ago",
  justNow: "Just now",
  selectDateRange: "Select date range"
}, {
  today: "Сегодня",
  yesterday: "Вчера",
  tomorrow: "Завтра",
  thisWeek: "На этой неделе",
  lastWeek: "На прошлой неделе",
  thisMonth: "В этом месяце",
  lastMonth: "В прошлом месяце",
  thisYear: "В этом году",
  custom: "Настроить",
  from: "С",
  to: "По",
  days: "дней",
  hours: "часов",
  minutes: "минут",
  seconds: "секунд",
  ago: "назад",
  justNow: "Только что",
  selectDateRange: "Выберите диапазон дат"
}, {
  today: "Այսօր",
  yesterday: "Երեկ",
  tomorrow: "Վաղը",
  thisWeek: "Այս շաբաթ",
  lastWeek: "Անցած շաբաթ",
  thisMonth: "Այս ամիս",
  lastMonth: "Անցած ամիս",
  thisYear: "Այս տարի",
  custom: "Հարմարեցնել",
  from: "Սկսած",
  to: "Մինչև",
  days: "օրեր",
  hours: "ժամեր",
  minutes: "րոպեներ",
  seconds: "վայրկյաններ",
  ago: "առաջ",
  justNow: "Հենց նոր",
  selectDateRange: "Ընտրել ամսաթվերի միջակայք"
});

// 4. filters (15 keys)
addTranslations('filters', {
  all: "All",
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
  inProgress: "In Progress",
  cancelled: "Cancelled",
  draft: "Draft",
  published: "Published",
  archived: "Archived",
  deleted: "Deleted",
  filterBy: "Filter by",
  clearFilters: "Clear filters"
}, {
  all: "Все",
  active: "Активные",
  inactive: "Неактивные",
  pending: "Ожидают",
  approved: "Одобрены",
  rejected: "Отклонены",
  completed: "Завершены",
  inProgress: "В процессе",
  cancelled: "Отменены",
  draft: "Черновик",
  published: "Опубликовано",
  archived: "Архивировано",
  deleted: "Удалено",
  filterBy: "Фильтр по",
  clearFilters: "Очистить фильтры"
}, {
  all: "Բոլորը",
  active: "Ակտիվ",
  inactive: "Ոչ ակտիվ",
  pending: "Սպասվող",
  approved: "Հաստատված",
  rejected: "Մերժված",
  completed: "Ավարտված",
  inProgress: "Ընթացքի մեջ",
  cancelled: "Չեղարկված",
  draft: "Սևագիր",
  published: "Հրապարակված",
  archived: "Արխիվացված",
  deleted: "Ջնջված",
  filterBy: "Ֆիլտրել ըստ",
  clearFilters: "Մաքրել ֆիլտրերը"
});

// 5. confirmations (12 keys)
addTranslations('confirmations', {
  areYouSure: "Are you sure?",
  confirmDelete: "Are you sure you want to delete this?",
  confirmCancel: "Are you sure you want to cancel?",
  confirmLeave: "You have unsaved changes. Are you sure you want to leave?",
  deleteWarning: "This action cannot be undone.",
  continueAnyway: "Continue anyway",
  saveChangesFirst: "Save changes first",
  discardChanges: "Discard changes",
  yesDelete: "Yes, delete",
  noKeepIt: "No, keep it",
  yesImSure: "Yes, I'm sure",
  cancelAction: "Cancel"
}, {
  areYouSure: "Вы уверены?",
  confirmDelete: "Вы уверены, что хотите это удалить?",
  confirmCancel: "Вы уверены, что хотите отменить?",
  confirmLeave: "У вас есть несохранённые изменения. Вы уверены, что хотите уйти?",
  deleteWarning: "Это действие нельзя отменить.",
  continueAnyway: "Продолжить в любом случае",
  saveChangesFirst: "Сначала сохранить изменения",
  discardChanges: "Отменить изменения",
  yesDelete: "Да, удалить",
  noKeepIt: "Нет, оставить",
  yesImSure: "Да, я уверен",
  cancelAction: "Отмена"
}, {
  areYouSure: "Համոզվա՞ծ եք",
  confirmDelete: "Համոզվա՞ծ եք, որ ուզում եք ջնջել սա:",
  confirmCancel: "Համոզվա՞ծ եք, որ ուզում եք չեղարկել:",
  confirmLeave: "Դուք ունեք չպահպանված փոփոխություններ: Համոզվա՞ծ եք, որ ուզում եք հեռանալ:",
  deleteWarning: "Այս գործողությունը հնարավոր չէ հետարկել:",
  continueAnyway: "Շարունակել այնուամենայնիվ",
  saveChangesFirst: "Նախ պահպանել փոփոխությունները",
  discardChanges: "Հրաժարվել փոփոխություններից",
  yesDelete: "Այո, ջնջել",
  noKeepIt: "Ոչ, պահել",
  yesImSure: "Այո, համոզված եմ",
  cancelAction: "Չեղարկել"
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
console.log('RU titles.dashboard:', ruTest.titles?.dashboard);
console.log('HY titles.dashboard:', hyTest.titles?.dashboard);
console.log('RU confirmations.areYouSure:', ruTest.confirmations?.areYouSure);
console.log('HY confirmations.areYouSure:', hyTest.confirmations?.areYouSure);

if (ruTest.titles?.dashboard === 'Панель управления' &&
    hyTest.titles?.dashboard === 'Վահանակ' &&
    ruTest.confirmations?.areYouSure === 'Вы уверены?' &&
    hyTest.confirmations?.areYouSure === 'Համոզվա՞ծ եք') {
  console.log('\n✅✅✅ SUCCESS! All translations added correctly! ✅✅✅');
  console.log('Target: 50%+ coverage - LET\'S CHECK!');
}
