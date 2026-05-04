import { decodeJwt, isTokenExpired, getTokenExpiryTime, validateToken } from '@/lib/jwt-utils';

describe('decodeJwt', () => {
  it('decodes a valid JWT payload', () => {
    // Create a valid JWT: header.payload.signature
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: '123', name: 'Test', exp: 9999999999 }));
    const signature = 'fake-signature';
    const token = `${header}.${payload}.${signature}`;

    const result = decodeJwt(token);
    expect(result).not.toBeNull();
    expect(result?.sub).toBe('123');
    expect(result?.name).toBe('Test');
  });

  it('returns null for malformed token', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull();
  });

  it('returns null for token with less than 3 parts', () => {
    expect(decodeJwt('header.payload')).toBeNull();
  });

  it('returns null for invalid base64 payload', () => {
    const token = `header.!!!invalid!!!.signature`;
    expect(decodeJwt(token)).toBeNull();
  });

  it('returns null for invalid JSON payload', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const payload = btoa('not-json');
    const token = `${header}.${payload}.signature`;
    expect(decodeJwt(token)).toBeNull();
  });
});

describe('isTokenExpired', () => {
  it('returns true for expired token', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const payload = btoa(JSON.stringify({ exp: 1000 })); // Expired in 1970
    const token = `${header}.${payload}.sig`;

    expect(isTokenExpired(token)).toBe(true);
  });

  it('returns false for non-expired token', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const payload = btoa(JSON.stringify({ exp: futureExp }));
    const token = `${header}.${payload}.sig`;

    expect(isTokenExpired(token)).toBe(false);
  });

  it('respects buffer seconds', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const exp = Math.floor(Date.now() / 1000) + 30; // 30 seconds from now
    const payload = btoa(JSON.stringify({ exp }));
    const token = `${header}.${payload}.sig`;

    expect(isTokenExpired(token, 60)).toBe(true); // 60 second buffer
  });

  it('returns true for token without exp field', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const payload = btoa(JSON.stringify({ sub: '123' }));
    const token = `${header}.${payload}.sig`;

    expect(isTokenExpired(token)).toBe(true);
  });

  it('returns true for malformed token', () => {
    expect(isTokenExpired('invalid')).toBe(true);
  });
});

describe('getTokenExpiryTime', () => {
  it('returns milliseconds until expiry', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const payload = btoa(JSON.stringify({ exp: futureExp }));
    const token = `${header}.${payload}.sig`;

    const expiryTime = getTokenExpiryTime(token);
    expect(expiryTime).toBeGreaterThan(3500000); // ~58 minutes in ms
    expect(expiryTime).toBeLessThan(3700000); // ~62 minutes in ms
  });

  it('returns negative value for expired token', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const payload = btoa(JSON.stringify({ exp: 1000 }));
    const token = `${header}.${payload}.sig`;

    const expiryTime = getTokenExpiryTime(token);
    expect(expiryTime).toBeLessThan(0);
  });

  it('returns null for malformed token', () => {
    expect(getTokenExpiryTime('invalid')).toBeNull();
  });
});

describe('validateToken', () => {
  it('returns true for valid non-expired token', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const payload = btoa(JSON.stringify({ exp: futureExp }));
    const token = `${header}.${payload}.sig`;

    expect(validateToken(token)).toBe(true);
  });

  it('returns false for expired token', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const payload = btoa(JSON.stringify({ exp: 1000 }));
    const token = `${header}.${payload}.sig`;

    expect(validateToken(token)).toBe(false);
  });

  it('returns false for malformed token', () => {
    expect(validateToken('not-a-jwt')).toBe(false);
  });

  it('returns false for null/undefined/empty', () => {
    expect(validateToken(null as any)).toBe(false);
    expect(validateToken(undefined as any)).toBe(false);
    expect(validateToken('')).toBe(false);
  });
});
