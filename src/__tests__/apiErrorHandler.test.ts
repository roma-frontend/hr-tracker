/**
 * API Error Handler Tests
 * Tests for unified API error handling
 */

import { describe, it, expect, jest } from '@jest/globals';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: init?.headers,
    })),
  },
}));

import { createErrorResponse, withApiHandler, ApiErrors, ErrorCode } from '../apiErrorHandler';

describe('API Error Handler', () => {
  describe('createErrorResponse', () => {
    it('should create a standardized error response', async () => {
      const response = createErrorResponse('Test error', ErrorCode.INTERNAL_ERROR, 500);
      const data = await response.json();

      expect(data).toEqual({
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Test error',
        code: ErrorCode.INTERNAL_ERROR,
        details: undefined,
      });
      expect(response.status).toBe(500);
    });

    it('should include details when provided', async () => {
      const response = createErrorResponse('Validation failed', ErrorCode.VALIDATION_ERROR, 400, {
        field: 'email',
        reason: 'invalid format',
      });
      const data = await response.json();

      expect(data.details).toEqual({
        field: 'email',
        reason: 'invalid format',
      });
    });

    it('should set correct cache headers', () => {
      const response = createErrorResponse('Error', ErrorCode.BAD_REQUEST, 400);
      expect(response.headers).toEqual({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      });
    });
  });

  describe('withApiHandler', () => {
    it('should return handler result on success', async () => {
      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));

      const result = await withApiHandler(mockHandler);
      const data = await (result as any).json();

      expect(data).toEqual({ success: true });
      expect(mockHandler).toHaveBeenCalled();
    });

    it('should catch and format validation errors', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Required field is missing'));

      const result = await withApiHandler(mockHandler, { operation: 'test' });
      const data = await (result as any).json();

      expect(data.error).toBe(ErrorCode.VALIDATION_ERROR);
      expect(data.message).toContain('Required field is missing');
    });

    it('should catch and format authentication errors', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Unauthorized access'));

      const result = await withApiHandler(mockHandler);
      const data = await (result as any).json();

      expect(data.error).toBe(ErrorCode.UNAUTHORIZED);
    });

    it('should catch and format not found errors', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Resource not found'));

      const result = await withApiHandler(mockHandler);
      const data = await (result as any).json();

      expect(data.error).toBe(ErrorCode.NOT_FOUND);
    });

    it('should catch and format conflict errors', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Email already exists'));

      const result = await withApiHandler(mockHandler);
      const data = await (result as any).json();

      expect(data.error).toBe(ErrorCode.CONFLICT);
    });

    it('should default to internal error for unknown errors', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Random error'));

      const result = await withApiHandler(mockHandler, { operation: 'test' });
      const data = await (result as any).json();

      expect(data.error).toBe(ErrorCode.INTERNAL_ERROR);
      expect(data.message).toContain('Operation failed: test');
    });
  });

  describe('ApiErrors convenience methods', () => {
    it('should create bad request error', async () => {
      const response = ApiErrors.badRequest('Invalid input');
      const data = await response.json();

      expect(data.error).toBe(ErrorCode.BAD_REQUEST);
      expect(data.message).toBe('Invalid input');
      expect(response.status).toBe(400);
    });

    it('should create unauthorized error', async () => {
      const response = ApiErrors.unauthorized();
      const data = await response.json();

      expect(data.error).toBe(ErrorCode.UNAUTHORIZED);
      expect(response.status).toBe(401);
    });

    it('should create forbidden error', async () => {
      const response = ApiErrors.forbidden('Admin only');
      const data = await response.json();

      expect(data.error).toBe(ErrorCode.FORBIDDEN);
      expect(data.message).toBe('Admin only');
    });

    it('should create not found error', async () => {
      const response = ApiErrors.notFound('User not found');
      const data = await response.json();

      expect(data.error).toBe(ErrorCode.NOT_FOUND);
      expect(data.message).toBe('User not found');
    });

    it('should create rate limit error', async () => {
      const response = ApiErrors.rateLimit('Too many requests');
      const data = await response.json();

      expect(data.error).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
      expect(response.status).toBe(429);
    });

    it('should create validation error with details', async () => {
      const response = ApiErrors.validation('Invalid email', {
        field: 'email',
        value: 'invalid',
      });
      const data = await response.json();

      expect(data.error).toBe(ErrorCode.VALIDATION_ERROR);
      expect(data.details).toEqual({
        field: 'email',
        value: 'invalid',
      });
    });
  });

  describe('ErrorCode enum', () => {
    it('should have all expected error codes', () => {
      expect(ErrorCode.BAD_REQUEST).toBe('BAD_REQUEST');
      expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.CONFLICT).toBe('CONFLICT');
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(ErrorCode.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE');
      expect(ErrorCode.DATABASE_ERROR).toBe('DATABASE_ERROR');
      expect(ErrorCode.EXTERNAL_SERVICE_ERROR).toBe('EXTERNAL_SERVICE_ERROR');
    });
  });
});
