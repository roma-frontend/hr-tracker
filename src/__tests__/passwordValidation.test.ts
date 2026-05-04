import { validatePassword, validateEmail, getStrengthColor } from '@/lib/passwordValidation';

describe('validatePassword', () => {
  it('returns score 0 for empty string', () => {
    const result = validatePassword('');
    expect(result.score).toBe(0);
    expect(result.strength).toBe('weak');
  });

  it('penalizes all-numeric passwords', () => {
    const result = validatePassword('12345678');
    expect(result.score).toBeLessThan(50);
    expect(result.suggestions.some((s) => s.includes('цифры') || s.includes('буквы'))).toBe(true);
  });

  it('penalizes all-letter passwords', () => {
    const result = validatePassword('abcdefgh');
    expect(result.score).toBeLessThan(70);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('penalizes common passwords', () => {
    const result = validatePassword('password');
    expect(result.score).toBeLessThan(30);
  });

  it('detects repeated characters', () => {
    const result = validatePassword('aaaaaaaa');
    expect(result.feedback.some((f) => f.message.includes('повторяющихся'))).toBe(true);
  });

  it('gives bonus for Cyrillic characters', () => {
    const cyrillicResult = validatePassword('Пароль123!');
    const latinResult = validatePassword('Password123!');
    expect(cyrillicResult.score).toBeGreaterThanOrEqual(latinResult.score);
  });

  it('gives bonus for 16+ character passwords', () => {
    const longResult = validatePassword('VeryLongPassword12345!');
    const shortResult = validatePassword('Short1!');
    expect(longResult.score).toBeGreaterThan(shortResult.score);
  });

  it('returns excellent for strong password', () => {
    const result = validatePassword('MyStr0ng!P@ssw0rd');
    expect(result.strength).toBe('excellent');
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  it('clamps score to 0-100 range', () => {
    const result = validatePassword('a'.repeat(100));
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('deduplicates suggestions', () => {
    const result = validatePassword('aaa');
    const uniqueSuggestions = new Set(result.suggestions);
    expect(result.suggestions.length).toBe(uniqueSuggestions.size);
  });
});

describe('validateEmail', () => {
  it('returns valid for correct email', () => {
    const result = validateEmail('user@example.com');
    expect(result.isValid).toBe(true);
  });

  it('detects gmail typo', () => {
    const result = validateEmail('user@gmial.com');
    expect(result.isValid).toBe(false);
    expect(result.suggestion).toBe('user@gmail.com');
  });

  it('detects yahoo typo', () => {
    const result = validateEmail('user@yaho.com');
    expect(result.isValid).toBe(false);
    expect(result.suggestion).toBe('user@yahoo.com');
  });

  it('rejects invalid format', () => {
    const result = validateEmail('invalid-email');
    expect(result.isValid).toBe(false);
  });

  it('rejects empty string', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
  });
});

describe('getStrengthColor', () => {
  it('returns red for weak', () => {
    expect(getStrengthColor('weak')).toBe('#ef4444');
  });

  it('returns orange for fair', () => {
    expect(getStrengthColor('fair')).toBe('#f59e0b');
  });

  it('returns yellow for good', () => {
    expect(getStrengthColor('good')).toBe('#eab308');
  });

  it('returns light green for strong', () => {
    expect(getStrengthColor('strong')).toBe('#22c55e');
  });

  it('returns green for excellent', () => {
    expect(getStrengthColor('excellent')).toBe('#10b981');
  });

  it('returns gray for unknown strength', () => {
    expect(getStrengthColor('unknown' as any)).toBe('#6b7280');
  });
});
