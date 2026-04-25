/**
 * Shared auth helpers — centralizes superadmin email check
 * Replace all hardcoded "romangulanyan@gmail.com" with this module.
 */
import type { QueryCtx, MutationCtx } from '../_generated/server';

/** The single source of truth for the superadmin email (from env or fallback) */
export const SUPERADMIN_EMAIL = process.env.MANAGER_EMAIL ?? 'romangulanyan@gmail.com';

/**
 * Returns true if the given email belongs to the superadmin.
 */
export function isSuperadminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return email.toLowerCase() === SUPERADMIN_EMAIL;
}

/**
 * Requires the caller to be authenticated (via Convex auth).
 * Returns the identity email (lowercased).
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) throw new Error('Not authenticated');
  return identity.email.toLowerCase();
}

/**
 * Checks if a user record is the superadmin (by role OR email).
 */
export function isSuperadmin(user: { role?: string; email: string }): boolean {
  return user.role === 'superadmin' || isSuperadminEmail(user.email);
}
