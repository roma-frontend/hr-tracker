import * as Sentry from "@sentry/nextjs";

/**
 * Initialize Sentry on the server side
 */
export function initSentryServer() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://example@sentry.io/1234567",

    // Define how likely traces are sampled. Reduced for production to control costs.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0.1,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    // Environment
    environment: process.env.NODE_ENV,

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
  });
}
