/**
 * Smart Password Validation System
 * Provides real-time password strength analysis with helpful suggestions
 */

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  feedback: {
    type: 'error' | 'warning' | 'success' | 'info';
    message: string;
    icon?: string;
  }[];
  suggestions: string[];
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
  required: boolean;
}

/**
 * Comprehensive password validation with smart feedback
 */
export function validatePassword(password: string): PasswordValidationResult {
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'Минимум 8 символов',
      met: password.length >= 8,
      required: true,
    },
    {
      id: 'uppercase',
      label: 'Хотя бы одна заглавная буква (A-Z)',
      met: /[A-Z]/.test(password),
      required: true,
    },
    {
      id: 'lowercase',
      label: 'Хотя бы одна строчная буква (a-z)',
      met: /[a-z]/.test(password),
      required: true,
    },
    {
      id: 'number',
      label: 'Хотя бы одна цифра (0-9)',
      met: /[0-9]/.test(password),
      required: true,
    },
    {
      id: 'special',
      label: 'Специальный символ (!@#$%^&*)',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      required: false,
    },
    {
      id: 'long',
      label: '12+ символов для дополнительной безопасности',
      met: password.length >= 12,
      required: false,
    },
  ];

  const requiredMet = requirements
    .filter(r => r.required)
    .every(r => r.met);

  const allMet = requirements.every(r => r.met);

  // Calculate strength score (0-100)
  let score = 0;
  requirements.forEach(req => {
    if (req.met) {
      score += req.required ? 20 : 10;
    }
  });

  // Additional scoring factors
  if (password.length >= 16) score += 10;
  if (/[А-Яа-я]/.test(password)) score += 5; // Cyrillic bonus
  
  // Penalty for common patterns
  if (/^[0-9]+$/.test(password)) score -= 20; // All numbers
  if (/^[a-zA-Z]+$/.test(password)) score -= 10; // Only letters
  if (/(.)\1{2,}/.test(password)) score -= 15; // Repeated characters (aaa, 111)
  if (/^(password|qwerty|123456|admin)/i.test(password)) score -= 50; // Common passwords

  score = Math.max(0, Math.min(100, score));

  // Determine strength level
  let strength: PasswordValidationResult['strength'];
  if (score >= 90) strength = 'excellent';
  else if (score >= 70) strength = 'strong';
  else if (score >= 50) strength = 'good';
  else if (score >= 30) strength = 'fair';
  else strength = 'weak';

  // Generate feedback messages
  const feedback: PasswordValidationResult['feedback'] = [];
  const suggestions: string[] = [];

  if (!password) {
    feedback.push({
      type: 'info',
      message: 'Введите пароль для проверки',
      icon: '💡',
    });
  } else if (score >= 90) {
    feedback.push({
      type: 'success',
      message: 'Превосходный пароль! Очень безопасный! 🎉',
      icon: '✅',
    });
  } else if (score >= 70) {
    feedback.push({
      type: 'success',
      message: 'Надежный пароль! Хорошая защита.',
      icon: '✅',
    });
  } else if (score >= 50) {
    feedback.push({
      type: 'warning',
      message: 'Неплохо, но можно лучше.',
      icon: '⚠️',
    });
    suggestions.push('Добавьте специальные символы для большей надежности');
  } else if (score >= 30) {
    feedback.push({
      type: 'warning',
      message: 'Слабоватый пароль. Усильте его!',
      icon: '⚠️',
    });
    suggestions.push('Используйте комбинацию букв, цифр и символов');
    suggestions.push('Увеличьте длину до 12+ символов');
  } else {
    feedback.push({
      type: 'error',
      message: 'Очень слабый пароль! Легко взломать.',
      icon: '❌',
    });
    suggestions.push('Используйте минимум 8 символов');
    suggestions.push('Добавьте заглавные и строчные буквы');
    suggestions.push('Включите цифры и специальные символы');
  }

  // Common password detection
  const commonPasswords = [
    'password', 'qwerty', '123456', '12345678', 'admin', 'letmein',
    'welcome', 'monkey', '1234567890', 'password123'
  ];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    feedback.push({
      type: 'error',
      message: 'Этот пароль слишком распространен! Хакеры его знают.',
      icon: '🚨',
    });
    suggestions.push('Избегайте популярных паролей типа "password123"');
  }

  // Repeated characters
  if (/(.)\1{2,}/.test(password)) {
    feedback.push({
      type: 'warning',
      message: 'Избегайте повторяющихся символов (aaa, 111)',
      icon: '🔁',
    });
  }

  // Sequential characters
  if (/abc|bcd|cde|123|234|345|456/i.test(password)) {
    feedback.push({
      type: 'warning',
      message: 'Избегайте последовательностей (abc, 123)',
      icon: '🔢',
    });
  }

  // Add smart suggestions based on what's missing
  if (!requirements.find(r => r.id === 'uppercase')?.met) {
    suggestions.push('Добавьте заглавную букву');
  }
  if (!requirements.find(r => r.id === 'number')?.met) {
    suggestions.push('Добавьте цифру');
  }
  if (!requirements.find(r => r.id === 'special')?.met && score < 70) {
    suggestions.push('Добавьте спецсимвол (!@#$%^&*)');
  }

  return {
    isValid: requiredMet,
    score,
    strength,
    feedback,
    suggestions: [...new Set(suggestions)], // Remove duplicates
    requirements,
  };
}

/**
 * Validate email with smart suggestions
 */
export interface EmailValidationResult {
  isValid: boolean;
  feedback?: {
    type: 'error' | 'warning' | 'success' | 'info';
    message: string;
  };
  suggestion?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  if (!email) {
    return {
      isValid: false,
      feedback: {
        type: 'info',
        message: 'Введите email адрес',
      },
    };
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      feedback: {
        type: 'error',
        message: 'Неверный формат email',
      },
      suggestion: 'Пример: user@example.com',
    };
  }

  // Check for common typos
  const domain = email.split('@')[1]?.toLowerCase();
  const typoCorrections: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outloo.com': 'outlook.com',
    'outlok.com': 'outlook.com',
  };

  if (domain && typoCorrections[domain]) {
    return {
      isValid: false,
      feedback: {
        type: 'warning',
        message: `Возможно, вы имели в виду ${typoCorrections[domain]}?`,
      },
      suggestion: email.replace(domain, typoCorrections[domain]),
    };
  }

  // Check for missing TLD
  if (domain && !domain.includes('.')) {
    return {
      isValid: false,
      feedback: {
        type: 'error',
        message: 'Отсутствует доменная зона (.com, .ru, и т.д.)',
      },
      suggestion: `${email}.com`,
    };
  }

  return {
    isValid: true,
    feedback: {
      type: 'success',
      message: 'Email корректен ✓',
    },
  };
}

/**
 * Get password strength color
 */
export function getStrengthColor(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'weak': return '#ef4444'; // red
    case 'fair': return '#f59e0b'; // orange
    case 'good': return '#eab308'; // yellow
    case 'strong': return '#22c55e'; // green
    case 'excellent': return '#10b981'; // emerald
    default: return '#6b7280'; // gray
  }
}

/**
 * Generate a secure password suggestion
 */
export function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}';
  
  const all = uppercase + lowercase + numbers + special;
  
  let password = '';
  // Ensure at least one of each required type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly (total 16 chars)
  for (let i = password.length; i < 16; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
