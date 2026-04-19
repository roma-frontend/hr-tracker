const fs = require('fs');

const en = JSON.parse(fs.readFileSync('./src/i18n/locales/en.json', 'utf8'));
const ru = JSON.parse(fs.readFileSync('./src/i18n/locales/ru.json', 'utf8'));

function setNested(obj, pathParts, value) {
  let current = obj;
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (!current[pathParts[i]] || typeof current[pathParts[i]] !== 'object' || Array.isArray(current[pathParts[i]])) {
      current[pathParts[i]] = {};
    }
    current = current[pathParts[i]];
  }
  current[pathParts[pathParts.length - 1]] = value;
}

function getNested(obj, pathParts) {
  let current = obj;
  for (const part of pathParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

// All new translation keys needed for component updates
const translations = {
  // Password strength
  'passwordStrength.weak': 'Weak',
  'passwordStrength.fair': 'Fair',
  'passwordStrength.good': 'Good',
  'passwordStrength.strong': 'Strong',

  // Validation
  'validation.planNotSelected': 'Plan not selected',

  // Toasts
  'toasts.requestSubmitted': '🎉 Request submitted successfully!',

  // Errors
  'errors.submitRequestFailed': 'Failed to submit request',
  'errors.failedToFetch': 'Failed to fetch',
  'errors.failedToFetchData': 'Failed to fetch data',

  // Register Org
  'registerOrg.requestPlan': 'Request {{plan}} Plan',
  'registerOrg.customPricing': 'Custom pricing • 100+ employees',
  'registerOrg.pricing79': '$79/mo • Up to 50 employees',
  'registerOrg.approved24h': 'Approved within 24h',
  'registerOrg.orgDetails': 'Organization Details',
  'registerOrg.orgName': 'Organization Name',
  'registerOrg.orgUrl': 'Organization URL',
  'registerOrg.industry': 'Industry',
  'registerOrg.teamSize': 'Team Size',
  'registerOrg.selectSize': 'Select size',
  'registerOrg.sizeEmployees': '{{size}} employees',
  'registerOrg.yourDetails': 'Your Details (Admin Account)',
  'registerOrg.yourName': 'Your Name',
  'registerOrg.phone': 'Phone',
  'registerOrg.country': 'Country',
  'registerOrg.tellUsNeeds': 'Tell us about your needs (optional)',
  'registerOrg.submitting': 'Submitting request...',
  'registerOrg.submitRequest': 'Submit Request',
  'registerOrg.reviewMessage': "We'll review your request and get back to you within 24 hours.",

  // Placeholders
  'placeholders.acmeCorp': 'acme-corp',
  'placeholders.yourOrg': 'your-org',
  'placeholders.youAtCompany': 'you@company.com',
  'placeholders.phone': '+1 234 567 890',
  'placeholders.userExampleEmail': 'user@example.com',
  'placeholders.johnExampleEmail': 'john@example.com',
  'placeholders.phoneFormat': '+1 (555) 123-4567',
  'placeholders.eventName': 'Event name...',
  'placeholders.briefDescription': 'Brief description...',

  // Stripe
  'stripe.id': 'ID',
  'stripe.customer': 'Customer',
  'stripe.amount': 'Amount',
  'stripe.status': 'Status',
  'stripe.date': 'Date',
  'stripe.card': 'Card',
  'stripe.description': 'Description',
  'stripe.supportStudio': 'Stripe Support Studio',
  'stripe.excel': 'Excel',

  // Auth
  'auth.pleaseLogin': 'Please log in',

  // Events
  'events.noConflicts': 'No conflicts found',
  'events.noMatchFilters': 'No events match your filters',
  'events.noEventsCreated': 'No events created yet',
  'events.noDescription': 'No description',
  'events.departmentRequired': 'At least one department is required',

  // Superadmin
  'superadmin.selectedPlan': 'Selected Plan',
  'superadmin.onlyOwnOrg': 'You can only manage your own organization',

  // Plan
  'plan.starter': 'Starter',
  'plan.professional': 'Professional',
  'plan.enterprise': 'Enterprise',

  // Checkout
  'checkout.verifying': 'Verifying...',
  'checkout.invalidSession': 'Invalid Session',
  'checkout.verifyFailed': "We couldn't verify your payment session.",

  // Contact
  'contact.salesEmail': 'sales@hroffice.io',

  // Onboarding
  'onboarding.noReason': 'No reason provided',
  'onboarding.noPendingRequests': 'No pending requests found',
  'onboarding.noOrgsFound': 'No organizations found matching your search',
  'onboarding.noOrgsAvailable': 'No organizations available',

  // Register
  'register.noOrgFound': 'No organization found for',

  // AI Chat
  'aiChat.noConversations': 'No conversations yet',

  // Drivers
  'drivers.noPendingRequests': 'No pending requests',
  'drivers.noTripsToday': 'No trips scheduled for today',
  'drivers.noDriversFound': 'No drivers found',
  'drivers.noFavorites': 'No favorites yet',
  'drivers.noDriversAvailable': 'No Drivers Available',
  'drivers.noDriversMessage': 'There are no drivers available right now. Try again later.',
  'drivers.noRequestsYet': 'No Requests Yet',
  'drivers.trips': 'trips',
  'drivers.seats': 'seats',
  'drivers.book': 'Book',
  'drivers.minSeats': 'Min seats',
  'drivers.anyCapacity': 'Any capacity',
  'drivers.seatsPlus': '{{count}}+ seats',
  'drivers.sortBy': 'Sort by',
  'drivers.byRating': 'By Rating',
  'drivers.byName': 'By Name',
  'drivers.byAvailability': 'By Availability',
  'drivers.todayTrips': "Today's Trips",
  'drivers.pendingRequests': 'Pending Requests',
  'drivers.totalCompleted': 'Total Completed',
  'drivers.rating': 'Rating',
  'drivers.availableDrivers': 'Available Drivers',
  'drivers.totalTrips': 'Total Trips',
  'drivers.driverSchedule': 'Driver Schedule',
  'drivers.rateDriver': 'Rate Driver',
  'drivers.howWasTrip': 'How was your trip?',
  'drivers.comment': 'Comment',
  'drivers.experiencePlaceholder': 'Tell us about your experience...',
  'drivers.noDriverEmployees': 'No employees with driver role found',
  'drivers.active': 'Active',
  'drivers.history': 'History',
  'drivers.recurring': 'Recurring',
  'drivers.noActiveRequests': 'No active requests',
  'drivers.noHistory': 'No history yet',
  'drivers.noRecurring': 'No recurring trips',
  'drivers.noActiveShift': 'No active shift',
  'drivers.noShiftHistory': 'No shift history yet',
  'drivers.map': 'Map',

  // Calendar
  'calendar.driverBookings': 'Driver Bookings',
  'calendar.driverBooking': 'Driver Booking',
  'calendar.from': 'From',
  'calendar.day': 'd',
  'calendar.to': 'To',
  'calendar.reason': 'Reason',
  'calendar.route': 'Route',
  'calendar.pickup': 'Pickup',
  'calendar.dropoff': 'Dropoff',
  'calendar.purpose': 'Purpose',
  'calendar.passengers': 'Passengers',
  'calendar.notes': 'Notes',
  'calendar.vehicle': 'Vehicle',
  'calendar.openInGoogle': 'Open in Google Calendar',

  // Chat
  'chat.unread': 'Unread',
  'chat.edit': 'Edit',

  // Dashboard
  'dashboard.leaveBalances': 'Leave Balances',
  'dashboard.productiveDay': 'Have a productive day ahead!',
  'dashboard.unusualLogin': 'Unusual login activity detected',
  'dashboard.extendSession': 'Save your work and extend your session to avoid losing changes.',
  'dashboard.welcome': 'Welcome to the team! We are excited to have you here.',
  'dashboard.welcomeMessage': 'Start by exploring the dashboard, setting up your profile, and checking your leave balances.',
  'dashboard.lowBalance': 'Your leave balance is running low',

  // Join Requests
  'joinRequests.noRequests': 'No join requests yet',

  // Automation
  'automation.noActiveWorkflows': 'No active workflows',
  'automation.noRecentTasks': 'No recent tasks',

  // Common additions
  'common.create': 'Create',
  'common.exit': 'Exit',
  'common.confirm': 'Confirm',
  'common.delete': 'Delete',

  // Subscription
  'subscription.perMonth': '/mo',

  // Landing
  'landing.platformFeatures': 'Platform features',
  'landing.hr': 'HR',
  'landing.office': 'Office',

  // Performance
  'performance.ratingTitle': 'Performance Rating',
  'performance.evaluate': 'Evaluate {{name}}\'s performance',
  'performance.ratePerformance': 'Rate Performance (1-5)',
  'performance.overallAverage': 'Overall Average',
  'performance.writtenFeedback': 'Written Feedback (Optional)',
  'performance.strengthsPlaceholder': 'What does this employee do well?',
  'performance.improvementsPlaceholder': 'What areas can be improved?',
  'performance.additionalFeedbackPlaceholder': 'Any additional feedback or notes...',
  'performance.submitRating': 'Submit Rating',

  // Face Login
  'faceLogin.title': 'Face ID Login',
  'faceLogin.subtitle': 'Position your face in the camera to login',
  'faceLogin.cameraNotActive': 'Camera not active',
  'faceLogin.faceDetected': 'Face Detected',
  'faceLogin.noFace': 'No Face',
  'faceLogin.searching': 'Searching for match...',
  'faceLogin.welcome': 'Welcome, {{name}}!',
  'faceLogin.notRecognized': 'Face not recognized',
  'faceLogin.scanning': 'Scanning',
  'faceLogin.failedAttempts': 'Failed attempts: {{attempts}} of 3',
  'faceLogin.blocked': 'Face ID Blocked',
  'faceLogin.blockedMessage': 'Too many failed attempts. Please use email/password login.',
  'faceLogin.startButton': 'Start Face Login',
  'faceLogin.authenticating': 'Authenticating...',
  'faceLogin.usePassword': 'Use Email/Password Login',
  'faceLogin.noFaces': 'No Registered Faces',
  'faceLogin.noFacesMessage': 'No users have registered their face yet',
  'faceLogin.registeredFace': 'registered face',
  'faceLogin.inSystem': 'in the system',

  // Face Registration
  'faceRegistration.title': 'Register Face ID',
  'faceRegistration.cameraNotActive': 'Camera not active',
  'faceRegistration.faceDetected': 'Face Detected',
  'faceRegistration.noFace': 'No Face',
  'faceRegistration.selectCamera': 'Select Camera:',
  'faceRegistration.startCamera': 'Start Camera',
  'faceRegistration.processing': 'Processing...',
  'faceRegistration.captureAndRegister': 'Capture & Register',
  'faceRegistration.instructions': 'Instructions:',
  'faceRegistration.instruction1': 'Position your face within the frame',
  'faceRegistration.instruction2': 'Ensure good lighting on your face',
  'faceRegistration.instruction3': 'Look directly at the camera',
  'faceRegistration.instruction4': 'Remove glasses or hats if possible',
  'faceRegistration.instruction5': 'Wait for "Face Detected" indicator',

  // Broadcast
  'broadcast.priorityWarning': 'Warning',
  'broadcast.priorityUpdate': 'Update',
  'broadcast.serviceBroadcast': 'Service Broadcast',

  // SLA
  'sla.priorityWarning': 'Warning',

  // Security
  'security.noFaceDetected': 'No face detected in continuous check',
};

// Russian translations for all new keys
const ruTranslations = {
  'passwordStrength.weak': 'Слабый',
  'passwordStrength.fair': 'Средний',
  'passwordStrength.good': 'Хороший',
  'passwordStrength.strong': 'Сильный',
  'validation.planNotSelected': 'Тариф не выбран',
  'toasts.requestSubmitted': '🎉 Запрос успешно отправлен!',
  'errors.submitRequestFailed': 'Не удалось отправить запрос',
  'errors.failedToFetch': 'Не удалось загрузить',
  'errors.failedToFetchData': 'Не удалось загрузить данные',
  'registerOrg.requestPlan': 'Запросить тариф {{plan}}',
  'registerOrg.customPricing': 'Индивидуальная цена • 100+ сотрудников',
  'registerOrg.pricing79': '$79/мес • До 50 сотрудников',
  'registerOrg.approved24h': 'Одобрение в течение 24ч',
  'registerOrg.orgDetails': 'Детали организации',
  'registerOrg.orgName': 'Название организации',
  'registerOrg.orgUrl': 'URL организации',
  'registerOrg.industry': 'Отрасль',
  'registerOrg.teamSize': 'Размер команды',
  'registerOrg.selectSize': 'Выберите размер',
  'registerOrg.sizeEmployees': '{{size}} сотрудников',
  'registerOrg.yourDetails': 'Ваши данные (Аккаунт администратора)',
  'registerOrg.yourName': 'Ваше имя',
  'registerOrg.phone': 'Телефон',
  'registerOrg.country': 'Страна',
  'registerOrg.tellUsNeeds': 'Расскажите о ваших потребностях (необязательно)',
  'registerOrg.submitting': 'Отправка запроса...',
  'registerOrg.submitRequest': 'Отправить запрос',
  'registerOrg.reviewMessage': 'Мы рассмотрим ваш запрос и свяжемся с вами в течение 24 часов.',
  'placeholders.acmeCorp': 'acme-corp',
  'placeholders.yourOrg': 'ваша-организация',
  'placeholders.youAtCompany': 'вы@компания.com',
  'placeholders.phone': '+1 234 567 890',
  'placeholders.userExampleEmail': 'пользователь@example.com',
  'placeholders.johnExampleEmail': 'ivan@example.com',
  'placeholders.phoneFormat': '+1 (555) 123-4567',
  'placeholders.eventName': 'Название события...',
  'placeholders.briefDescription': 'Краткое описание...',
  'stripe.id': 'ID',
  'stripe.customer': 'Клиент',
  'stripe.amount': 'Сумма',
  'stripe.status': 'Статус',
  'stripe.date': 'Дата',
  'stripe.card': 'Карта',
  'stripe.description': 'Описание',
  'stripe.supportStudio': 'Студия поддержки Stripe',
  'stripe.excel': 'Excel',
  'auth.pleaseLogin': 'Пожалуйста, войдите',
  'events.noConflicts': 'Конфликтов не найдено',
  'events.noMatchFilters': 'Нет событий, соответствующих фильтрам',
  'events.noEventsCreated': 'События еще не созданы',
  'events.noDescription': 'Нет описания',
  'events.departmentRequired': 'Требуется хотя бы один отдел',
  'superadmin.selectedPlan': 'Выбранный тариф',
  'superadmin.onlyOwnOrg': 'Вы можете управлять только своей организацией',
  'plan.starter': 'Стартовый',
  'plan.professional': 'Профессиональный',
  'plan.enterprise': 'Корпоративный',
  'checkout.verifying': 'Проверка...',
  'checkout.invalidSession': 'Неверная сессия',
  'checkout.verifyFailed': 'Не удалось проверить вашу платежную сессию.',
  'contact.salesEmail': 'sales@hroffice.io',
  'onboarding.noReason': 'Причина не указана',
  'onboarding.noPendingRequests': 'Нет ожидающих запросов',
  'onboarding.noOrgsFound': 'Организации не найдены по вашему запросу',
  'onboarding.noOrgsAvailable': 'Нет доступных организаций',
  'register.noOrgFound': 'Организация не найдена для',
  'aiChat.noConversations': 'Разговоров пока нет',
  'drivers.noPendingRequests': 'Нет ожидающих запросов',
  'drivers.noTripsToday': 'Нет поездок на сегодня',
  'drivers.noDriversFound': 'Водители не найдены',
  'drivers.noFavorites': 'Избранного пока нет',
  'drivers.noDriversAvailable': 'Нет доступных водителей',
  'drivers.noDriversMessage': 'Сейчас нет доступных водителей. Попробуйте позже.',
  'drivers.noRequestsYet': 'Запросов пока нет',
  'drivers.trips': 'поездок',
  'drivers.seats': 'мест',
  'drivers.book': 'Забронировать',
  'drivers.minSeats': 'Мин. мест',
  'drivers.anyCapacity': 'Любая вместимость',
  'drivers.seatsPlus': '{{count}}+ мест',
  'drivers.sortBy': 'Сортировать по',
  'drivers.byRating': 'По рейтингу',
  'drivers.byName': 'По имени',
  'drivers.byAvailability': 'По доступности',
  'drivers.todayTrips': 'Поездки сегодня',
  'drivers.pendingRequests': 'Ожидающие запросы',
  'drivers.totalCompleted': 'Всего выполнено',
  'drivers.rating': 'Рейтинг',
  'drivers.availableDrivers': 'Доступные водители',
  'drivers.totalTrips': 'Всего поездок',
  'drivers.driverSchedule': 'Расписание водителя',
  'drivers.rateDriver': 'Оценить водителя',
  'drivers.howWasTrip': 'Как прошла ваша поездка?',
  'drivers.comment': 'Комментарий',
  'drivers.experiencePlaceholder': 'Расскажите о вашем опыте...',
  'drivers.noDriverEmployees': 'Сотрудники с ролью водителя не найдены',
  'drivers.active': 'Активные',
  'drivers.history': 'История',
  'drivers.recurring': 'Регулярные',
  'drivers.noActiveRequests': 'Нет активных запросов',
  'drivers.noHistory': 'Истории пока нет',
  'drivers.noRecurring': 'Нет регулярных поездок',
  'drivers.noActiveShift': 'Нет активной смены',
  'drivers.noShiftHistory': 'Истории смен пока нет',
  'drivers.map': 'Карта',
  'calendar.driverBookings': 'Бронирования водителя',
  'calendar.driverBooking': 'Бронирование водителя',
  'calendar.from': 'Откуда',
  'calendar.day': 'д',
  'calendar.to': 'Куда',
  'calendar.reason': 'Причина',
  'calendar.route': 'Маршрут',
  'calendar.pickup': 'Посадка',
  'calendar.dropoff': 'Высадка',
  'calendar.purpose': 'Цель',
  'calendar.passengers': 'Пассажиры',
  'calendar.notes': 'Заметки',
  'calendar.vehicle': 'Транспорт',
  'calendar.openInGoogle': 'Открыть в Google Календаре',
  'chat.unread': 'Непрочитанные',
  'chat.edit': 'Редактировать',
  'dashboard.leaveBalances': 'Остатки отпусков',
  'dashboard.productiveDay': 'Продуктивного дня!',
  'dashboard.unusualLogin': 'Обнаружена необычная активность входа',
  'dashboard.extendSession': 'Сохраните работу и продлите сессию, чтобы не потерять изменения.',
  'dashboard.welcome': 'Добро пожаловать в команду! Мы рады видеть вас здесь.',
  'dashboard.welcomeMessage': 'Начните с изучения панели управления, настройки профиля и проверки остатков отпусков.',
  'dashboard.lowBalance': 'Ваш остаток отпусков заканчивается',
  'joinRequests.noRequests': 'Запросов на вступление пока нет',
  'automation.noActiveWorkflows': 'Нет активных рабочих процессов',
  'automation.noRecentTasks': 'Нет недавних задач',
  'common.create': 'Создать',
  'common.exit': 'Выйти',
  'common.confirm': 'Подтвердить',
  'common.delete': 'Удалить',
  'subscription.perMonth': '/мес',
  'landing.platformFeatures': 'Функции платформы',
  'landing.hr': 'HR',
  'landing.office': 'Офис',
  'performance.ratingTitle': 'Оценка производительности',
  'performance.evaluate': 'Оценить производительность {{name}}',
  'performance.ratePerformance': 'Оценить производительность (1-5)',
  'performance.overallAverage': 'Общий средний балл',
  'performance.writtenFeedback': 'Письменный отзыв (необязательно)',
  'performance.strengthsPlaceholder': 'Что у этого сотрудника получается хорошо?',
  'performance.improvementsPlaceholder': 'Какие области можно улучшить?',
  'performance.additionalFeedbackPlaceholder': 'Любые дополнительные комментарии или заметки...',
  'performance.submitRating': 'Отправить оценку',
  'faceLogin.title': 'Вход по Face ID',
  'faceLogin.subtitle': 'Расположите лицо в камере для входа',
  'faceLogin.cameraNotActive': 'Камера не активна',
  'faceLogin.faceDetected': 'Лицо обнаружено',
  'faceLogin.noFace': 'Лицо не обнаружено',
  'faceLogin.searching': 'Поиск совпадения...',
  'faceLogin.welcome': 'Добро пожаловать, {{name}}!',
  'faceLogin.notRecognized': 'Лицо не распознано',
  'faceLogin.scanning': 'Сканирование',
  'faceLogin.failedAttempts': 'Неудачных попыток: {{attempts}} из 3',
  'faceLogin.blocked': 'Face ID заблокирован',
  'faceLogin.blockedMessage': 'Слишком много неудачных попыток. Пожалуйста, используйте вход по email/паролю.',
  'faceLogin.startButton': 'Начать вход по Face ID',
  'faceLogin.authenticating': 'Аутентификация...',
  'faceLogin.usePassword': 'Использовать вход по Email/Паролю',
  'faceLogin.noFaces': 'Нет зарегистрированных лиц',
  'faceLogin.noFacesMessage': 'Пользователи еще не зарегистрировали свои лица',
  'faceLogin.registeredFace': 'зарегистрированное лицо',
  'faceLogin.inSystem': 'в системе',
  'faceRegistration.title': 'Регистрация Face ID',
  'faceRegistration.cameraNotActive': 'Камера не активна',
  'faceRegistration.faceDetected': 'Лицо обнаружено',
  'faceRegistration.noFace': 'Лицо не обнаружено',
  'faceRegistration.selectCamera': 'Выберите камеру:',
  'faceRegistration.startCamera': 'Запустить камеру',
  'faceRegistration.processing': 'Обработка...',
  'faceRegistration.captureAndRegister': 'Захватить и зарегистрировать',
  'faceRegistration.instructions': 'Инструкции:',
  'faceRegistration.instruction1': 'Расположите лицо в кадре',
  'faceRegistration.instruction2': 'Обеспечьте хорошее освещение лица',
  'faceRegistration.instruction3': 'Смотрите прямо в камеру',
  'faceRegistration.instruction4': 'Снимите очки или головной убор, если возможно',
  'faceRegistration.instruction5': 'Дождитесь индикатора "Лицо обнаружено"',
  'broadcast.priorityWarning': 'Предупреждение',
  'broadcast.priorityUpdate': 'Обновление',
  'broadcast.serviceBroadcast': 'Сервисное объявление',
  'sla.priorityWarning': 'Предупреждение',
  'security.noFaceDetected': 'Лицо не обнаружено при непрерывной проверке',
};

// Apply English translations
let enAdded = 0;
for (const [path, value] of Object.entries(translations)) {
  const parts = path.split('.');
  if (getNested(en, parts) === undefined) {
    setNested(en, parts, value);
    enAdded++;
  }
}

// Apply Russian translations
let ruAdded = 0;
for (const [path, value] of Object.entries(ruTranslations)) {
  const parts = path.split('.');
  if (getNested(ru, parts) === undefined) {
    setNested(ru, parts, value);
    ruAdded++;
  }
}

// Write back
fs.writeFileSync('./src/i18n/locales/en.json', JSON.stringify(en, null, 2) + '\n', 'utf8');
fs.writeFileSync('./src/i18n/locales/ru.json', JSON.stringify(ru, null, 2) + '\n', 'utf8');

console.log(`✅ Added ${enAdded} keys to en.json`);
console.log(`✅ Added ${ruAdded} keys to ru.json`);

// Verify
function findMissing(enObj, ruObj, path = '') {
  const missing = [];
  for (const key in enObj) {
    const fullPath = path ? path + '.' + key : key;
    if (!(key in ruObj)) {
      missing.push(fullPath);
    } else if (typeof enObj[key] === 'object' && enObj[key] !== null && !Array.isArray(enObj[key])) {
      if (typeof ruObj[key] !== 'object' || ruObj[key] === null) {
        missing.push(fullPath);
      } else {
        missing.push(...findMissing(enObj[key], ruObj[key], fullPath));
      }
    }
  }
  return missing;
}

const missing = findMissing(en, ru);
console.log(`\n🔍 Missing keys remaining: ${missing.length}`);
if (missing.length > 0 && missing.length <= 50) {
  missing.forEach(k => console.log('  - ' + k));
} else if (missing.length > 50) {
  console.log('  ... (too many to list)');
} else {
  console.log('🎉 All keys synchronized! Zero missing keys.');
}
