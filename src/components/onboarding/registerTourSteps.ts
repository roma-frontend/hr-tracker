import { TourStep } from './OnboardingTour';

export const registerTourSteps: TourStep[] = [
  {
    target: '#register-card',
    title: '🎉 Добро пожаловать в регистрацию!',
    description: 'Давайте зарегистрируем вас в системе! Это займет всего минуту.',
    placement: 'center',
    highlight: false,
  },
  {
    target: '#org-search',
    title: '🏢 Поиск организации',
    description: 'Начните вводить название вашей организации. Система найдет её автоматически!',
    placement: 'bottom',
    highlight: true,
  },
  {
    target: '#personal-details-form',
    title: '👤 Личные данные',
    description: 'Заполните свои данные. Мы добавили умные подсказки для вашего удобства!',
    placement: 'right',
    highlight: true,
  },
  {
    target: "#email-field, input[type='email']",
    title: '✨ Умный ввод Email',
    description:
      'Система автоматически проверит ваш email и предложит исправления, если найдет опечатки!',
    placement: 'bottom',
    highlight: true,
  },
  {
    target: "#password-field, div:has(input[type='password'])",
    title: '🔐 Безопасный пароль',
    description:
      'Создайте надежный пароль или используйте генератор. Индикатор покажет уровень безопасности!',
    placement: 'bottom',
    highlight: true,
  },
  {
    target: "button:has-text('🔄'), button:has-text('Сгенерировать')",
    title: '🎲 Генератор паролей',
    description:
      'Нажмите, чтобы создать надежный пароль автоматически. Он будет скопирован в буфер обмена!',
    placement: 'left',
    highlight: true,
  },
  {
    target: ".password-strength-indicator, div[class*='strength']",
    title: '📊 Индикатор силы пароля',
    description:
      'Следите за цветом: 🔴 Слабый → 🟠 Средний → 🟡 Хороший → 🟢 Надежный → 💎 Превосходный',
    placement: 'bottom',
    highlight: true,
  },
  {
    target: "div:has(svg[class*='check']), .requirements",
    title: '✅ Требования к паролю',
    description: 'Все чекбоксы должны стать зелеными. Система подскажет, что нужно добавить!',
    placement: 'right',
    highlight: true,
  },
  {
    target: '#register-card',
    title: '🚀 Готово к регистрации!',
    description:
      'Все умные помощники готовы помочь вам! Заполните форму и присоединяйтесь к команде! 🎊',
    placement: 'center',
    highlight: false,
  },
];

// Дополнительные подсказки для продвинутых функций
export const registerAdvancedTips: TourStep[] = [
  {
    target: "button:has(svg[class*='copy'])",
    title: '📋 Копирование пароля',
    description: 'Нажмите, чтобы скопировать пароль в буфер обмена для безопасного хранения.',
    placement: 'left',
    highlight: true,
  },
  {
    target: "button:has(svg[class*='eye'])",
    title: '👁️ Показать/Скрыть пароль',
    description: 'Переключайте видимость пароля для удобства ввода.',
    placement: 'left',
    highlight: true,
  },
  {
    target: "div[class*='suggestion']",
    title: '💡 Умные предложения',
    description: 'Система анализирует ваш ввод и предлагает улучшения в реальном времени!',
    placement: 'top',
    highlight: true,
  },
];
