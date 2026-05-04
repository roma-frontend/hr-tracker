import {
  getErrorMessage,
  getErrorCode,
  getErrorStatusCode,
  toAppError,
  isError,
  isAppError,
  isUserError,
  isAuthError,
  isNetworkError,
  AppError,
  UserError,
  AuthError,
  PermissionError,
  NotFoundError,
  NetworkError,
  ServerError,
  ValidationError,
} from '@/lib/error-handler';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('creates error with message and code', () => {
      const error = new AppError('Something went wrong', { code: 'INTERNAL_ERROR' });
      expect(error.message).toBe('Something went wrong');
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.statusCode).toBe(500);
    });

    it('creates error with custom status code', () => {
      const error = new AppError('Bad request', { code: 'BAD_REQUEST', statusCode: 400 });
      expect(error.statusCode).toBe(400);
    });
  });

  describe('UserError', () => {
    it('creates user-friendly error', () => {
      const error = new UserError('Invalid input');
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('USER_ERROR');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('AuthError', () => {
    it('creates authentication error', () => {
      const error = new AuthError('Not authenticated');
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('PermissionError', () => {
    it('creates permission error', () => {
      const error = new PermissionError('Access denied');
      expect(error.code).toBe('PERMISSION_ERROR');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('creates not found error', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('NetworkError', () => {
    it('creates network error', () => {
      const error = new NetworkError('Connection failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBe(503);
    });
  });

  describe('ServerError', () => {
    it('creates server error', () => {
      const error = new ServerError('Internal server error');
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('ValidationError', () => {
    it('creates validation error with details', () => {
      const details = { email: 'Invalid email' };
      const error = new ValidationError('Validation failed', details);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.fieldErrors).toEqual(details);
    });
  });
});

describe('getErrorMessage', () => {
  it('extracts message from Error instance', () => {
    expect(getErrorMessage(new Error('Test error'))).toBe('Test error');
  });

  it('returns string input as-is', () => {
    expect(getErrorMessage('String error')).toBe('String error');
  });

  it('returns fallback for unknown types', () => {
    expect(getErrorMessage(123 as any)).toBe('An unexpected error occurred');
    expect(getErrorMessage(null as any)).toBe('An unexpected error occurred');
  });
});

describe('getErrorCode', () => {
  it('returns code from AppError', () => {
    const error = new AppError('Test', { code: 'CUSTOM_CODE' });
    expect(getErrorCode(error)).toBe('CUSTOM_CODE');
  });

  it('returns UNKNOWN_ERROR for regular Error', () => {
    expect(getErrorCode(new Error('Test'))).toBe('UNKNOWN_ERROR');
  });

  it('returns UNKNOWN_ERROR for non-Error', () => {
    expect(getErrorCode('string error')).toBe('UNKNOWN_ERROR');
  });
});

describe('getErrorStatusCode', () => {
  it('returns status from AppError', () => {
    const error = new AppError('Test', { code: 'CODE', statusCode: 404 });
    expect(getErrorStatusCode(error)).toBe(404);
  });

  it('returns undefined for regular Error', () => {
    expect(getErrorStatusCode(new Error('Test'))).toBeUndefined();
  });
});

describe('toAppError', () => {
  it('returns AppError as-is', () => {
    const original = new AppError('Test', 'CODE');
    expect(toAppError(original)).toBe(original);
  });

  it('converts string to AppError', () => {
    const error = toAppError('Something broke');
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Something broke');
  });

  it('converts Error to AppError with message', () => {
    const error = toAppError(new Error('Original error'));
    expect(error.message).toBe('Original error');
  });

  it('creates AuthError for unauthorized messages', () => {
    const error = toAppError(new Error('Unauthorized access'));
    expect(error).toBeInstanceOf(AuthError);
  });

  it('creates PermissionError for permission messages', () => {
    const error = toAppError(new Error('Permission denied'));
    expect(error).toBeInstanceOf(PermissionError);
  });

  it('creates NetworkError for network messages', () => {
    const error = toAppError(new Error('Network error occurred'));
    expect(error).toBeInstanceOf(NetworkError);
  });

  it('creates ServerError for unknown errors', () => {
    const error = toAppError(new Error('Something weird happened'));
    expect(error).toBeInstanceOf(ServerError);
  });
});

describe('Type Guards', () => {
  it('isError returns true for Error instances', () => {
    expect(isError(new Error())).toBe(true);
    expect(isError(new AppError('Test', 'CODE'))).toBe(true);
  });

  it('isError returns false for non-Errors', () => {
    expect(isError('string')).toBe(false);
    expect(isError(123)).toBe(false);
    expect(isError(null)).toBe(false);
  });

  it('isAppError returns true for AppError instances', () => {
    expect(isAppError(new AppError('Test', 'CODE'))).toBe(true);
    expect(isAppError(new UserError('Test'))).toBe(true);
    expect(isAppError(new AuthError('Test'))).toBe(true);
  });

  it('isAppError returns false for regular Error', () => {
    expect(isAppError(new Error('Test'))).toBe(false);
  });

  it('isUserError returns true for UserError', () => {
    expect(isUserError(new UserError('Test'))).toBe(true);
  });

  it('isUserError returns false for other errors', () => {
    expect(isUserError(new AppError('Test', 'CODE'))).toBe(false);
    expect(isUserError(new Error('Test'))).toBe(false);
  });

  it('isAuthError returns true for AuthError', () => {
    expect(isAuthError(new AuthError('Test'))).toBe(true);
  });

  it('isNetworkError returns true for NetworkError', () => {
    expect(isNetworkError(new NetworkError('Test'))).toBe(true);
  });
});
