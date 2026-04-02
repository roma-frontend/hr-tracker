import { SignJWT, jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET;

// Validate JWT_SECRET in production
if (process.env.NODE_ENV === 'production' && (!jwtSecret || jwtSecret.length < 32)) {
  throw new Error('JWT_SECRET must be at least 32 characters in production');
}

const secret = new TextEncoder().encode(
  jwtSecret || 'dev-secret-change-me-in-production-min-32-chars',
);

export interface JWTPayload {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'employee' | 'superadmin';
  organizationId?: string;
  isApproved?: boolean;
  department?: string;
  position?: string;
  employeeType?: 'staff' | 'contractor';
  avatar?: string;
  type?: '2fa-pending';
}

export async function signJWT(payload: JWTPayload, expiresIn: string = '7d'): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
