/**
 * Security Utilities Tests
 * Tests for CSRF, validation, and sanitization functions
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock crypto for testing
jest.mock('crypto', () => {
  const actualCrypto = jest.requireActual('crypto');
  return {
    ...actualCrypto,
    randomBytes: jest.fn((size) => Buffer.from('a'.repeat(size), 'hex')),
  };
});

import {
  generateCSRFToken,
  verifyCSRFToken,
  sanitizeString,
  validateEmail,
  validatePassword,
  containsXSS,
  containsSQLInjection,
  maskSensitiveData,
} from '../security';

describe('Security Utilities', () => {
  describe('CSRF Token', () => {
    it('should generate a valid CSRF token', () => {
      const token = generateCSRFToken();
      expect(token).toBeDefined();
      expect(token).toContain('.');
      const [tokenPart, signature] = token.split('.');
      expect(tokenPart).toHaveLength(64);
      expect(signature).toHaveLength(64);
    });

    it('should verify a valid CSRF token', () => {
      const token = generateCSRFToken();
      expect(verifyCSRFToken(token)).toBe(true);
    });

    it('should reject an invalid CSRF token', () => {
      expect(verifyCSRFToken('invalid.token')).toBe(false);
      expect(verifyCSRFToken('')).toBe(false);
      expect(verifyCSRFToken(null as any)).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('should remove dangerous HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")');
      expect(sanitizeString('<b>bold</b>')).toBe('bold');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizeString('JAVASCRIPT:void(0)')).toBe('void(0)');
    });

    it('should remove event handlers', () => {
      expect(sanitizeString('onclick=alert(1)')).toBe('alert(1)');
      expect(sanitizeString('onload="malicious()"')).toBe('');
    });
  });

  describe('Email Validation', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('test@sub.domain.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('a'.repeat(250) + '@test.com')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should accept strong passwords', () => {
      const result = validatePassword('SecurePass123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject weak passwords', () => {
      const result1 = validatePassword('short');
      expect(result1.valid).toBe(false);
      expect(result1.errors).toContain('Password must be at least 8 characters long');

      const result2 = validatePassword('alllowercase123!');
      expect(result2.valid).toBe(false);
      expect(result2.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject common passwords', () => {
      const result = validatePassword('password');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('This password is too common and not secure');
    });
  });

  describe('XSS Detection', () => {
    it('should detect script tags', () => {
      expect(containsXSS('<script>alert(1)</script>')).toBe(true);
      expect(containsXSS('<SCRIPT>bad()</SCRIPT>')).toBe(true);
    });

    it('should detect iframe tags', () => {
      expect(containsXSS('<iframe src="evil.com"></iframe>')).toBe(true);
    });

    it('should detect javascript: URLs', () => {
      expect(containsXSS('javascript:alert(1)')).toBe(true);
      expect(containsXSS('JAVASCRIPT:void(0)')).toBe(true);
    });

    it('should allow safe content', () => {
      expect(containsXSS('Hello World')).toBe(false);
      expect(containsXSS('<b>bold text</b>')).toBe(false);
    });
  });

  describe('SQL Injection Detection', () => {
    it('should detect SQL keywords', () => {
      expect(containsSQLInjection("SELECT * FROM users")).toBe(true);
      expect(containsSQLInjection("DROP TABLE users")).toBe(true);
      expect(containsSQLInjection("1' OR '1'='1")).toBe(true);
    });

    it('should detect SQL comments', () => {
      expect(containsSQLInjection("admin'--")).toBe(true);
    });

    it('should allow normal text', () => {
      expect(containsSQLInjection('Hello World')).toBe(false);
      expect(containsSQLInjection('Select a color')).toBe(false);
    });
  });

  describe('Sensitive Data Masking', () => {
    it('should mask credit card numbers', () => {
      expect(maskSensitiveData('1234567890123456', 4)).toBe('************3456');
    });

    it('should mask short strings', () => {
      expect(maskSensitiveData('123', 4)).toBe('123');
    });

    it('should handle empty strings', () => {
      expect(maskSensitiveData('', 4)).toBe('***');
    });
  });
});
