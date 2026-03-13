import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface JWTPayload {
  userId: string;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "employee" | "superadmin";
  organizationId?: string;
  isApproved?: boolean;
  department?: string;
  position?: string;
  employeeType?: "staff" | "contractor";
  avatar?: string;
  type?: "2fa-pending";
}

export async function signJWT(payload: JWTPayload, expiresIn: string = "7d"): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
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
