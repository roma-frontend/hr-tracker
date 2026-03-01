/**
 * Professional Logging System
 * 
 * Replaces console.log with structured logging
 * Features:
 * - Log levels (debug, info, warn, error)
 * - Contextual information
 * - Environment-aware (dev vs prod)
 * - Performance tracking
 * - Error tracking
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  data?: any;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;
  private minLevel: LogLevel;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(level);
    const minLevelIndex = levels.indexOf(this.minLevel);
    return currentLevelIndex >= minLevelIndex;
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase();
    let output = `[${timestamp}] ${level}: ${entry.message}`;

    if (entry.context) {
      output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack && this.isDevelopment) {
        output += `\n  Stack: ${entry.error.stack}`;
      }
    }

    return output;
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    // In development, use colorful console output
    if (this.isDevelopment) {
      const styles = {
        [LogLevel.DEBUG]: 'color: gray',
        [LogLevel.INFO]: 'color: blue',
        [LogLevel.WARN]: 'color: orange',
        [LogLevel.ERROR]: 'color: red',
      };

      console.log(`%c${entry.level.toUpperCase()}`, styles[level], message);
      if (context) console.log('Context:', context);
      if (error) console.error('Error:', error);
    } else {
      // In production, use structured logging
      console.log(JSON.stringify(entry));
    }

    // Send to external logging service in production
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      this.sendToErrorTracking(entry);
    }
  }

  /**
   * Send error to external tracking service
   * (Placeholder for Sentry, LogRocket, etc.)
   */
  private sendToErrorTracking(entry: LogEntry) {
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(entry.error, { extra: entry.context });
  }

  /**
   * Debug level logging
   * Use for detailed debugging information
   */
  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info level logging
   * Use for general informational messages
   */
  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning level logging
   * Use for warning messages
   */
  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Error level logging
   * Use for error messages
   */
  error(message: string, error?: Error, context?: LogContext) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Performance tracking
   */
  startTimer(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.info(`Performance: ${label}`, { duration: `${duration.toFixed(2)}ms` });
    };
  }

  /**
   * API call logging
   */
  apiCall(method: string, url: string, context?: LogContext) {
    this.info(`API Call: ${method} ${url}`, context);
  }

  /**
   * API response logging
   */
  apiResponse(method: string, url: string, status: number, context?: LogContext) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API Response: ${method} ${url} - ${status}`, context);
  }

  /**
   * User action logging
   */
  userAction(action: string, context?: LogContext) {
    this.info(`User Action: ${action}`, context);
  }

  /**
   * Component lifecycle logging
   */
  component(name: string, lifecycle: 'mount' | 'unmount' | 'update', context?: LogContext) {
    this.debug(`Component ${lifecycle}: ${name}`, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context),
  
  // Performance
  time: (label: string) => logger.startTimer(label),
  
  // API
  api: {
    call: (method: string, url: string, context?: LogContext) => logger.apiCall(method, url, context),
    response: (method: string, url: string, status: number, context?: LogContext) => 
      logger.apiResponse(method, url, status, context),
  },
  
  // User actions
  user: (action: string, context?: LogContext) => logger.userAction(action, context),
  
  // Component lifecycle
  component: (name: string, lifecycle: 'mount' | 'unmount' | 'update', context?: LogContext) =>
    logger.component(name, lifecycle, context),
};

export default logger;
