import {
  sanitizeString,
  sanitizeHTML,
  validateEmail,
  validatePhone,
  validateURL,
  containsSQLInjection,
  containsXSS,
  validatePassword,
  maskSensitiveData,
  containsSensitiveData,
  generateSecurePassword,
  validateAPIKeyFormat,
  generateAPIKey,
  hashAPIKey,
} from '@/lib/security';

describe('sanitizeString', () => {
  it('removes HTML tags', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).not.toContain('<script>');
  });

  it('removes javascript: protocol', () => {
    expect(sanitizeString('javascript:alert(1)')).not.toContain('javascript:');
  });

  it('removes event handlers', () => {
    expect(sanitizeString('<img onerror="alert(1)">')).not.toContain('onerror');
  });

  it('removes data:text/html', () => {
    expect(sanitizeString('data:text/html;base64,PHNjcmlwdD4=')).not.toContain('data:text/html');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeString(123 as any)).toBe('');
    expect(sanitizeString(null as any)).toBe('');
  });
});

describe('sanitizeHTML', () => {
  it('allows whitelisted tags', () => {
    const result = sanitizeHTML('<p>Hello <strong>world</strong></p>');
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });

  it('removes non-whitelisted tags', () => {
    const result = sanitizeHTML('<p>Hello <script>alert("xss")</script></p>');
    expect(result).not.toContain('<script>');
  });

  it('preserves case of allowed tags', () => {
    const result = sanitizeHTML('<P>Hello</P>');
    expect(result).toContain('Hello');
  });
});

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@domain.org')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
  });

  it('rejects emails with double dots', () => {
    expect(validateEmail('user..name@example.com')).toBe(false);
  });

  it('rejects emails longer than 254 chars', () => {
    const longEmail = `${'a'.repeat(250)}@example.com`;
    expect(validateEmail(longEmail)).toBe(false);
  });
});

describe('validatePhone', () => {
  it('accepts valid phone numbers', () => {
    expect(validatePhone('+12345678901')).toBe(true);
    expect(validatePhone('1234567890')).toBe(true);
  });

  it('rejects phones with invalid characters', () => {
    expect(validatePhone('abc1234567')).toBe(false);
  });

  it('rejects phones that are too short', () => {
    expect(validatePhone('123456789')).toBe(false);
  });

  it('rejects phones that are too long', () => {
    expect(validatePhone('1234567890123456')).toBe(false);
  });
});

describe('validateURL', () => {
  it('accepts valid HTTP URLs', () => {
    expect(validateURL('http://example.com')).toBe(true);
    expect(validateURL('https://example.com/path?query=1')).toBe(true);
  });

  it('rejects invalid protocols', () => {
    expect(validateURL('ftp://example.com')).toBe(false);
    expect(validateURL('javascript:alert(1)')).toBe(false);
  });

  it('rejects malformed URLs', () => {
    expect(validateURL('not-a-url')).toBe(false);
  });
});

describe('containsSQLInjection', () => {
  it('detects SELECT statements', () => {
    expect(containsSQLInjection("'; SELECT * FROM users --")).toBe(true);
  });

  it('detects UNION statements', () => {
    expect(containsSQLInjection('1 UNION SELECT 1,2,3')).toBe(true);
  });

  it('detects DROP statements', () => {
    expect(containsSQLInjection("'; DROP TABLE users; --")).toBe(true);
  });

  it('detects OR-based injection', () => {
    expect(containsSQLInjection("' OR '1'='1")).toBe(true);
  });

  it('allows normal text', () => {
    expect(containsSQLInjection('Hello world')).toBe(false);
  });
});

describe('containsXSS', () => {
  it('detects script tags', () => {
    expect(containsXSS('<script>alert("xss")</script>')).toBe(true);
  });

  it('detects iframe tags', () => {
    expect(containsXSS('<iframe src="evil.com"></iframe>')).toBe(true);
  });

  it('detects javascript: protocol', () => {
    expect(containsXSS('javascript:alert(1)')).toBe(true);
  });

  it('detects event handlers', () => {
    expect(containsXSS('<img onerror="alert(1)">')).toBe(true);
  });

  it('detects eval()', () => {
    expect(containsXSS('eval("malicious")')).toBe(true);
  });

  it('allows normal HTML', () => {
    expect(containsXSS('<p>Hello world</p>')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('rejects passwords shorter than 8 chars', () => {
    const result = validatePassword('Ab1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
  });

  it('rejects passwords without uppercase', () => {
    const result = validatePassword('password1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  });

  it('rejects passwords without lowercase', () => {
    const result = validatePassword('PASSWORD1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
  });

  it('rejects passwords without numbers', () => {
    const result = validatePassword('Password!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  });

  it('rejects passwords without special chars', () => {
    const result = validatePassword('Password1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one special character');
  });

  it('rejects common passwords', () => {
    const result = validatePassword('password');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('This password is too common and not secure');
  });

  it('accepts strong passwords', () => {
    const result = validatePassword('MyStr0ng!P@ss');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('maskSensitiveData', () => {
  it('masks all but last N characters', () => {
    expect(maskSensitiveData('1234567890', 4)).toBe('******7890');
  });

  it('returns *** for empty string', () => {
    expect(maskSensitiveData('', 4)).toBe('***');
  });

  it('handles string shorter than showLast', () => {
    expect(maskSensitiveData('abc', 5)).toBe('abc');
  });

  it('shows full mask when showLast is 0', () => {
    expect(maskSensitiveData('secret', 0)).toBe('******secret');
  });
});

describe('containsSensitiveData', () => {
  it('detects credit card numbers', () => {
    expect(containsSensitiveData('Card: 4111111111111111')).toBe(true);
  });

  it('detects SSN patterns', () => {
    expect(containsSensitiveData('SSN: 123-45-6789')).toBe(true);
  });

  it('detects email addresses', () => {
    expect(containsSensitiveData('Contact: user@example.com')).toBe(true);
  });

  it('allows normal text', () => {
    expect(containsSensitiveData('Hello world')).toBe(false);
  });
});

describe('generateSecurePassword', () => {
  it('generates password of correct length', () => {
    const password = generateSecurePassword(16);
    expect(password.length).toBe(16);
  });

  it('contains at least one uppercase letter', () => {
    const password = generateSecurePassword(16);
    expect(/[A-Z]/.test(password)).toBe(true);
  });

  it('contains at least one lowercase letter', () => {
    const password = generateSecurePassword(16);
    expect(/[a-z]/.test(password)).toBe(true);
  });

  it('contains at least one number', () => {
    const password = generateSecurePassword(16);
    expect(/[0-9]/.test(password)).toBe(true);
  });

  it('contains at least one special character', () => {
    const password = generateSecurePassword(16);
    expect(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)).toBe(true);
  });
});

describe('generateAPIKey', () => {
  it('generates key with correct format', () => {
    const key = generateAPIKey();
    expect(key).toMatch(/^sk_live_[a-f0-9]{64}$/);
  });
});

describe('validateAPIKeyFormat', () => {
  it('accepts valid API key format', () => {
    const key = 'sk_live_' + 'a'.repeat(64);
    expect(validateAPIKeyFormat(key)).toBe(true);
  });

  it('rejects invalid prefix', () => {
    expect(validateAPIKeyFormat('sk_test_' + 'a'.repeat(64))).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(validateAPIKeyFormat('sk_live_' + 'a'.repeat(32))).toBe(false);
  });

  it('rejects non-hex characters', () => {
    expect(validateAPIKeyFormat('sk_live_' + 'g'.repeat(64))).toBe(false);
  });
});

describe('hashAPIKey', () => {
  it('produces consistent hash for same input', () => {
    const key = 'sk_live_' + 'a'.repeat(64);
    const hash1 = hashAPIKey(key);
    const hash2 = hashAPIKey(key);
    expect(hash1).toBe(hash2);
  });

  it('produces different hash for different input', () => {
    const key1 = 'sk_live_' + 'a'.repeat(64);
    const key2 = 'sk_live_' + 'b'.repeat(64);
    expect(hashAPIKey(key1)).not.toBe(hashAPIKey(key2));
  });
});
