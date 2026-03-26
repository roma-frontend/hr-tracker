import { NextResponse } from 'next/server';

/**
 * Unified API Error Handler
 * Provides consistent error responses across all API endpoints
 */

export interface ApiError {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Error codes for programmatic handling
 */
export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  code: ErrorCode = ErrorCode.INTERNAL_ERROR,
  status: number = 500,
  details?: Record<string, any>
): NextResponse<ApiError> {
  const error: ApiError = {
    error: code,
    message,
    code,
    details,
  };

  return NextResponse.json(error, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

/**
 * Handle errors in API routes with consistent formatting
 * 
 * @example
 * export async function GET(request: Request) {
 *   return withApiHandler(async () => {
 *     // Your code here
 *     return NextResponse.json({ data: 'ok' });
 *   });
 * }
 */
export async function withApiHandler<T extends NextResponse>(
  handler: () => Promise<T> | T,
  options?: {
    operation?: string;
    logError?: boolean;
  }
): Promise<T | NextResponse<ApiError>> {
  try {
    return await handler();
  } catch (error) {
    const operation = options?.operation ?? 'API operation';
    const shouldLog = options?.logError ?? true;

    if (shouldLog) {
      console.error(`[API Error] ${operation}:`, error);
    }

    // Handle known error types
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Validation errors
      if (message.includes('required') || message.includes('invalid') || message.includes('validation')) {
        return createErrorResponse(error.message, ErrorCode.VALIDATION_ERROR, 400);
      }

      // Authentication errors
      if (message.includes('unauthorized') || message.includes('authentication')) {
        return createErrorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
      }

      // Authorization errors
      if (message.includes('forbidden') || message.includes('permission') || message.includes('not allowed')) {
        return createErrorResponse('Access forbidden', ErrorCode.FORBIDDEN, 403);
      }

      // Not found errors
      if (message.includes('not found') || message.includes('does not exist')) {
        return createErrorResponse('Resource not found', ErrorCode.NOT_FOUND, 404);
      }

      // Conflict errors
      if (message.includes('already exists') || message.includes('duplicate') || message.includes('conflict')) {
        return createErrorResponse('Resource conflict', ErrorCode.CONFLICT, 409);
      }

      // Rate limit errors
      if (message.includes('rate limit') || message.includes('too many')) {
        return createErrorResponse('Rate limit exceeded', ErrorCode.RATE_LIMIT_EXCEEDED, 429);
      }
    }

    // Default to internal server error
    return createErrorResponse(
      `Operation failed: ${operation}`,
      ErrorCode.INTERNAL_ERROR,
      500
    );
  }
}

/**
 * Convenience methods for common error responses
 */
export const ApiErrors = {
  badRequest: (message: string = 'Bad request', details?: Record<string, any>) =>
    createErrorResponse(message, ErrorCode.BAD_REQUEST, 400, details),

  unauthorized: (message: string = 'Authentication required', details?: Record<string, any>) =>
    createErrorResponse(message, ErrorCode.UNAUTHORIZED, 401, details),

  forbidden: (message: string = 'Access forbidden', details?: Record<string, any>) =>
    createErrorResponse(message, ErrorCode.FORBIDDEN, 403, details),

  notFound: (message: string = 'Resource not found', details?: Record<string, any>) =>
    createErrorResponse(message, ErrorCode.NOT_FOUND, 404, details),

  conflict: (message: string = 'Resource conflict', details?: Record<string, any>) =>
    createErrorResponse(message, ErrorCode.CONFLICT, 409, details),

  validation: (message: string = 'Validation failed', details?: Record<string, any>) =>
    createErrorResponse(message, ErrorCode.VALIDATION_ERROR, 400, details),

  rateLimit: (message: string = 'Rate limit exceeded', details?: Record<string, any>) =>
    createErrorResponse(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429, details),

  internal: (message: string = 'Internal server error', details?: Record<string, any>) =>
    createErrorResponse(message, ErrorCode.INTERNAL_ERROR, 500, details),

  serviceUnavailable: (message: string = 'Service unavailable', details?: Record<string, any>) =>
    createErrorResponse(message, ErrorCode.SERVICE_UNAVAILABLE, 503, details),
};

export default {
  createErrorResponse,
  withApiHandler,
  ApiErrors,
  ErrorCode,
};
