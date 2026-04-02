/**
 * Environment Variable Validation
 * Validates all required environment variables at app startup
 */

interface EnvConfig {
  required: string[];
  optional: string[];
}

const ENV_CONFIG: EnvConfig = {
  required: ['CONVEX_DEPLOYMENT', 'NEXT_PUBLIC_CONVEX_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'],
  optional: [
    'GROQ_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'REDIS_URL',
    'SENTRY_DSN',
    'CSRF_SECRET',
  ],
};

/**
 * Validate all required environment variables
 * Throws error if any are missing
 */
export function validateEnvironment(): void {
  const missing = ENV_CONFIG.required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    console.error('❌ Environment Validation Failed:', message);
    throw new Error(message);
  }

  const warnings: string[] = [];
  ENV_CONFIG.optional.forEach((key) => {
    if (!process.env[key]) {
      warnings.push(`⚠️ Optional env var missing: ${key}`);
    }
  });

  if (warnings.length > 0) {
    warnings.forEach((w) => console.warn(w));
  }

  console.log('✅ Environment validation passed');
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value || defaultValue || '';
}
