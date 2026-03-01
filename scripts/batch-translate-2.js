#!/usr/bin/env node
/**
 * Batch Translation Script #2
 * Adds multiple sections at once for efficiency
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

console.log('🚀 BATCH TRANSLATION #2\n');

let totalAdded = 0;

// Helper function
function addTranslations(section, enData, ruData, hyData) {
  enJson[section] = { ...enJson[section], ...enData };
  ruJson[section] = { ...ruJson[section], ...ruData };
  hyJson[section] = { ...hyJson[section], ...hyData };
  
  const count = Object.keys(enData).length;
  console.log(`✅ ${section}: ${count} keys`);
  totalAdded += count;
}

// 1. placeholders (34 keys) - PRIORITY
addTranslations('placeholders', {
  searchEmployee: "Search employees...",
  searchYourOrganization: "Search your organization...",
  selectDepartment: "Select department",
  selectRole: "Select role",
  selectStatus: "Select status",
  selectType: "Select type",
  enterName: "Enter name",
  enterEmail: "Enter email address",
  enterPassword: "Enter password",
  enterReason: "Enter reason",
  selectDate: "Select date",
  selectStartDate: "Select start date",
  selectEndDate: "Select end date",
  searchTasks: "Search tasks...",
  searchReports: "Search reports...",
  typeMessage: "Type a message...",
  johnDoe: "John Doe",
  minCharacters: "Min. 8 characters",
  newYorkUSA: "New York, USA",
  companyName: "Company Name",
  yourMessage: "Your message here...",
  phoneNumber: "+1 234 567 8900",
  website: "https://example.com",
  selectCountry: "Select country",
  selectTimezone: "Select timezone",
  selectLanguage: "Select language",
  searchSettings: "Search settings...",
  filterBy: "Filter by...",
  sortBy: "Sort by...",
  enterAmount: "Enter amount",
  selectPriority: "Select priority",
  addNote: "Add a note...",
  enterTitle: "Enter title",
  enterDescription: "Enter description"
}, {
  searchEmployee: "Поиск сотрудников...",
  searchYourOrganization: "Поиск вашей организации...",
  selectDepartment: "Выберите отдел",
  selectRole: "Выберите роль",
  selectStatus: "Выберите статус",
  selectType: "Выберите тип",
  enterName: "Введите имя",
  enterEmail: "Введите email",
  enterPassword: "Введите пароль",
  enterReason: "Введите причину",
  selectDate: "Выберите дату",
  selectStartDate: "Выберите дату начала",
  selectEndDate: "Выберите дату окончания",
  searchTasks: "Поиск задач...",
  searchReports: "Поиск отчётов...",
  typeMessage: "Введите сообщение...",
  johnDoe: "Иван Иванов",
  minCharacters: "Мин. 8 символов",
  newYorkUSA: "Москва, Россия",
  companyName: "Название компании",
  yourMessage: "Ваше сообщение...",
  phoneNumber: "+7 123 456 7890",
  website: "https://example.com",
  selectCountry: "Выберите страну",
  selectTimezone: "Выберите часовой пояс",
  selectLanguage: "Выберите язык",
  searchSettings: "Поиск настроек...",
  filterBy: "Фильтр по...",
  sortBy: "Сортировка по...",
  enterAmount: "Введите сумму",
  selectPriority: "Выберите приоритет",
  addNote: "Добавить заметку...",
  enterTitle: "Введите заголовок",
  enterDescription: "Введите описание"
}, {
  searchEmployee: "Որոնել աշխատակիցներ...",
  searchYourOrganization: "Որոնել ձեր կազմակերպությունը...",
  selectDepartment: "Ընտրել բաժին",
  selectRole: "Ընտրել դեր",
  selectStatus: "Ընտրել կարգավիճակ",
  selectType: "Ընտրել տեսակ",
  enterName: "Մուտքագրել անուն",
  enterEmail: "Մուտքագրել էլ. փոստ",
  enterPassword: "Մուտքագրել գաղտնաբառ",
  enterReason: "Մուտքագրել պատճառ",
  selectDate: "Ընտրել ամսաթիվ",
  selectStartDate: "Ընտրել սկսման ամսաթիվ",
  selectEndDate: "Ընտրել ավարտի ամսաթիվ",
  searchTasks: "Որոնել առաջադրանքներ...",
  searchReports: "Որոնել հաշվետվություններ...",
  typeMessage: "Մուտքագրել հաղորդագրություն...",
  johnDoe: "Անուն Ազգանուն",
  minCharacters: "Նվազ. 8 նիշ",
  newYorkUSA: "Երևան, Հայաստան",
  companyName: "Ընկերության անուն",
  yourMessage: "Ձեր հաղորդագրությունը...",
  phoneNumber: "+374 12 345678",
  website: "https://example.com",
  selectCountry: "Ընտրել երկիր",
  selectTimezone: "Ընտրել ժամային գոտի",
  selectLanguage: "Ընտրել լեզու",
  searchSettings: "Որոնել կարգավորումներ...",
  filterBy: "Ֆիլտրել ըստ...",
  sortBy: "Դասավորել ըստ...",
  enterAmount: "Մուտքագրել գումար",
  selectPriority: "Ընտրել առաջնահերթություն",
  addNote: "Ավելացնել նշում...",
  enterTitle: "Մուտքագրել վերնագիր",
  enterDescription: "Մուտքագրել նկարագրություն"
});

// 2. labels (22 keys)
addTranslations('labels', {
  fullName: "Full Name",
  emailAddress: "Email Address",
  phoneNumber: "Phone Number",
  department: "Department",
  position: "Position",
  role: "Role",
  status: "Status",
  startDate: "Start Date",
  endDate: "End Date",
  duration: "Duration",
  reason: "Reason",
  type: "Type",
  priority: "Priority",
  assignee: "Assignee",
  dueDate: "Due Date",
  location: "Location",
  timezone: "Timezone",
  language: "Language",
  country: "Country",
  description: "Description",
  notes: "Notes",
  attachments: "Attachments"
}, {
  fullName: "Полное имя",
  emailAddress: "Email адрес",
  phoneNumber: "Номер телефона",
  department: "Отдел",
  position: "Должность",
  role: "Роль",
  status: "Статус",
  startDate: "Дата начала",
  endDate: "Дата окончания",
  duration: "Длительность",
  reason: "Причина",
  type: "Тип",
  priority: "Приоритет",
  assignee: "Исполнитель",
  dueDate: "Срок",
  location: "Местоположение",
  timezone: "Часовой пояс",
  language: "Язык",
  country: "Страна",
  description: "Описание",
  notes: "Заметки",
  attachments: "Вложения"
}, {
  fullName: "Լրիվ անուն",
  emailAddress: "Էլ. փոստի հասցե",
  phoneNumber: "Հեռախոսահամար",
  department: "Բաժին",
  position: "Պաշտոն",
  role: "Դեր",
  status: "Կարգավիճակ",
  startDate: "Սկսման ամսաթիվ",
  endDate: "Ավարտի ամսաթիվ",
  duration: "Տևողություն",
  reason: "Պատճառ",
  type: "Տեսակ",
  priority: "Առաջնահերթություն",
  assignee: "Կատարող",
  dueDate: "Ժամկետ",
  location: "Տեղակայություն",
  timezone: "Ժամային գոտի",
  language: "Լեզու",
  country: "Երկիր",
  description: "Նկարագրություն",
  notes: "Նշումներ",
  attachments: "Կցորդներ"
});

// 3. ariaLabels (22 keys)
addTranslations('ariaLabels', {
  closeMenu: "Close menu",
  openMenu: "Open menu",
  changeAvatar: "Change avatar",
  deleteAvatar: "Delete avatar",
  editProfile: "Edit profile",
  viewProfile: "View profile",
  logout: "Logout",
  switchTheme: "Switch theme",
  switchLanguage: "Switch language",
  notifications: "Notifications",
  search: "Search",
  filter: "Filter",
  sort: "Sort",
  export: "Export",
  import: "Import",
  refresh: "Refresh",
  settings: "Settings",
  help: "Help",
  close: "Close",
  expand: "Expand",
  collapse: "Collapse",
  more: "More options"
}, {
  closeMenu: "Закрыть меню",
  openMenu: "Открыть меню",
  changeAvatar: "Изменить аватар",
  deleteAvatar: "Удалить аватар",
  editProfile: "Редактировать профиль",
  viewProfile: "Посмотреть профиль",
  logout: "Выйти",
  switchTheme: "Сменить тему",
  switchLanguage: "Сменить язык",
  notifications: "Уведомления",
  search: "Поиск",
  filter: "Фильтр",
  sort: "Сортировка",
  export: "Экспорт",
  import: "Импорт",
  refresh: "Обновить",
  settings: "Настройки",
  help: "Помощь",
  close: "Закрыть",
  expand: "Развернуть",
  collapse: "Свернуть",
  more: "Больше опций"
}, {
  closeMenu: "Փակել մենյուն",
  openMenu: "Բացել մենյուն",
  changeAvatar: "Փոխել ավատարը",
  deleteAvatar: "Ջնջել ավատարը",
  editProfile: "Խմբագրել պրոֆիլը",
  viewProfile: "Դիտել պրոֆիլը",
  logout: "Ելք",
  switchTheme: "Փոխել թեման",
  switchLanguage: "Փոխել լեզուն",
  notifications: "Ծանուցումներ",
  search: "Որոնում",
  filter: "Ֆիլտր",
  sort: "Դասավորում",
  export: "Արտահանում",
  import: "Ներմուծում",
  refresh: "Թարմացնել",
  settings: "Կարգավորումներ",
  help: "Օգնություն",
  close: "Փակել",
  expand: "Ընդարձակել",
  collapse: "Կծկել",
  more: "Ավելի շատ"
});

// 4. actions (13 keys)
addTranslations('actions', {
  create: "Create",
  update: "Update",
  delete: "Delete",
  edit: "Edit",
  view: "View",
  download: "Download",
  upload: "Upload",
  export: "Export",
  import: "Import",
  filter: "Filter",
  sort: "Sort",
  refresh: "Refresh",
  reset: "Reset"
}, {
  create: "Создать",
  update: "Обновить",
  delete: "Удалить",
  edit: "Редактировать",
  view: "Просмотр",
  download: "Скачать",
  upload: "Загрузить",
  export: "Экспортировать",
  import: "Импортировать",
  filter: "Фильтровать",
  sort: "Сортировать",
  refresh: "Обновить",
  reset: "Сбросить"
}, {
  create: "Ստեղծել",
  update: "Թարմացնել",
  delete: "Ջնջել",
  edit: "Խմբագրել",
  view: "Դիտել",
  download: "Ներբեռնել",
  upload: "Վերբեռնել",
  export: "Արտահանել",
  import: "Ներմուծել",
  filter: "Ֆիլտրել",
  sort: "Դասավորել",
  refresh: "Թարմացնել",
  reset: "Վերակայել"
});

console.log(`\n✅ Total added: ${totalAdded} keys`);

// Save
fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2), 'utf8');
fs.writeFileSync(ruPath, JSON.stringify(ruJson, null, 2), 'utf8');
fs.writeFileSync(hyPath, JSON.stringify(hyJson, null, 2), 'utf8');

console.log('✅ Files saved\n');

// Verify Unicode
const ruTest = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
const hyTest = JSON.parse(fs.readFileSync(hyPath, 'utf8'));

console.log('Verification:');
console.log('RU:', ruTest.placeholders.searchEmployee);
console.log('HY:', hyTest.placeholders.searchEmployee);

if (ruTest.placeholders.searchEmployee.includes('Поиск') &&
    hyTest.placeholders.searchEmployee.includes('Որոնել')) {
  console.log('\n✅✅✅ SUCCESS! Unicode preserved! ✅✅✅');
}
