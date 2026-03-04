"use client";

import { useEffect } from "react";
import { initSentryClient } from "../../../sentry.client.config";

/**
 * Monitoring Provider Component
 * Initializes Sentry and OpenTelemetry on the client side
 * Uses requestIdleCallback to defer non-critical monitoring initialization
 */
export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Defer Sentry initialization to idle time to avoid blocking main thread
    // TBT (Total Blocking Time) optimization
    if ('requestIdleCallback' in window) {
      requestIdleCallback(
        () => {
          initSentryClient();
        },
        { timeout: 3000 } // Max wait 3 seconds
      );
    } else {
      // Fallback for browsers without requestIdleCallback support
      setTimeout(() => {
        initSentryClient();
      }, 1000);
    }

    // Initialize OpenTelemetry client-side (also deferred)
    if (process.env.NEXT_PUBLIC_ENABLE_OTEL === "true") {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(
          () => {
            import("../../../opentelemetry.client.config").then(({ initOpenTelemetryClient }) => {
              try {
                initOpenTelemetryClient();
                console.log("✅ OpenTelemetry initialized in browser");
              } catch (error) {
                console.error("Failed to initialize OpenTelemetry:", error);
              }
            });
          },
          { timeout: 5000 }
        );
      } else {
        setTimeout(() => {
          import("../../../opentelemetry.client.config").then(({ initOpenTelemetryClient }) => {
            try {
              initOpenTelemetryClient();
              console.log("✅ OpenTelemetry initialized in browser");
            } catch (error) {
              console.error("Failed to initialize OpenTelemetry:", error);
            }
          });
        }, 2000);
      }
    }
  }, []);

  return <>{children}</>;
}
