/**
 * 🚀 CONVEX QUERY CACHE
 * 
 * Server-side caching for Convex queries using Redis
 * Reduces database load and improves response times
 * 
 * Usage:
 * ```typescript
 * const cached = await withCache(
 *   'users:all:org123',
 *   async () => await ctx.db.query('users').collect(),
 *   300 // 5 minutes TTL
 * );
 * ```
 */

import { getCache, setCache } from '@/lib/redis';

export interface CacheOptions {
  ttl?: number; // TTL in seconds (default: 300 = 5 minutes)
  prefix?: string; // Key prefix (default: 'convex')
  enabled?: boolean; // Enable/disable cache (default: true)
}

const DEFAULT_TTL = 300; // 5 minutes
const DEFAULT_PREFIX = 'convex';

/**
 * Execute function with caching
 * Returns cached result if available, otherwise executes function and caches result
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const {
    ttl = DEFAULT_TTL,
    prefix = DEFAULT_PREFIX,
    enabled = true,
  } = options;

  if (!enabled) {
    return fn();
  }

  const cacheKey = `${prefix}:${key}`;

  try {
    // Try to get from cache
    const cached = await getCache<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn();

    // Cache result
    await setCache(cacheKey, result, ttl);

    return result;
  } catch (error) {
    console.error(`Cache error for key ${cacheKey}:`, error);
    // Fallback: execute function without caching
    return fn();
  }
}

/**
 * Invalidate cache by key
 */
export async function invalidateCache(key: string, prefix: string = DEFAULT_PREFIX): Promise<void> {
  const cacheKey = `${prefix}:${key}`;
  try {
    const { deleteCache } = await import('@/lib/redis');
    await deleteCache(cacheKey);
  } catch (error) {
    console.error(`Cache invalidation error for key ${cacheKey}:`, error);
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCachePattern(
  pattern: string,
  prefix: string = DEFAULT_PREFIX
): Promise<void> {
  const fullPattern = `${prefix}:${pattern}`;
  try {
    const { invalidateCachePattern: redisInvalidate } = await import('@/lib/redis');
    await redisInvalidate(fullPattern);
  } catch (error) {
    console.error(`Cache pattern invalidation error for pattern ${fullPattern}:`, error);
  }
}

/**
 * Cache key generators
 */
export const CacheKey = {
  users: {
    all: (orgId?: string) => `users:all:${orgId || 'global'}`,
    byId: (id: string) => `users:id:${id}`,
    byEmail: (email: string) => `users:email:${email}`,
  },
  leaves: {
    all: (orgId?: string) => `leaves:all:${orgId || 'global'}`,
    byUser: (userId: string) => `leaves:user:${userId}`,
    pending: (orgId?: string) => `leaves:pending:${orgId || 'global'}`,
  },
  tasks: {
    all: (orgId?: string) => `tasks:all:${orgId || 'global'}`,
    byUser: (userId: string) => `tasks:user:${userId}`,
    byStatus: (status: string, orgId?: string) => `tasks:status:${status}:${orgId || 'global'}`,
  },
  organizations: {
    members: (orgId: string) => `org:members:${orgId}`,
    details: (orgId: string) => `org:details:${orgId}`,
  },
};
