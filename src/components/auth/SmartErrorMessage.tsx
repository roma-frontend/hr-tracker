'use client';

import { motion, AnimatePresence } from '@/lib/cssMotion';
import { AlertCircle, Info, CheckCircle, XCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type ErrorType = 'error' | 'warning' | 'info' | 'success';

export interface SmartError {
  type: ErrorType;
  message: string;
  suggestion?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SmartErrorMessageProps {
  error: SmartError | string | null;
  className?: string;
}

export function SmartErrorMessage({ error, className = '' }: SmartErrorMessageProps) {
  if (!error) return null;

  // Convert string to SmartError object
  const errorObj: SmartError =
    typeof error === 'string' ? { type: 'error', message: error } : error;

  const icons = {
    error: XCircle,
    warning: AlertCircle,
    info: Info,
    success: CheckCircle,
  };

  const Icon = icons[errorObj.type];

  const colorClasses = {
    error: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
    success: 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400',
  };

  const iconColors = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    success: 'text-green-500',
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`relative overflow-hidden border p-4 ${colorClasses[errorObj.type]} ${className}`}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, currentColor 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, currentColor 0%, transparent 50%)',
              'radial-gradient(circle at 0% 0%, currentColor 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative flex gap-3">
          {/* Animated icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="shrink-0"
          >
            <Icon className={`w-5 h-5 ${iconColors[errorObj.type]}`} />
          </motion.div>

          <div className="flex-1 space-y-2">
            {/* Main message */}
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-medium leading-relaxed"
            >
              {errorObj.message}
            </motion.p>

            {/* Suggestion */}
            {errorObj.suggestion && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-2 text-xs opacity-90"
              >
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorObj.suggestion}</p>
              </motion.div>
            )}

            {/* Action button */}
            {errorObj.action && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={errorObj.action.onClick}
                className="flex items-center gap-1.5 text-xs font-medium underline underline-offset-2 hover:no-underline transition-all group"
              >
                {errorObj.action.label}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Smart error parser - converts common API errors to user-friendly messages
 */
export function parseAuthError(error: string) {
  const errorLower = error.toLowerCase();

  // Wrong password
  if (
    errorLower.includes('invalid credentials') ||
    errorLower.includes('wrong password') ||
    errorLower.includes('incorrect password')
  ) {
    return {
      type: 'error',
      message: 'Invalid email or password',
      suggestion: 'Check your input. Is Caps Lock on?',
      action: {
        label: 'Forgot password?',
        onClick: () => (window.location.href = '/forgot-password'),
      },
    };
  }

  // User not found
  if (
    errorLower.includes('user not found') ||
    errorLower.includes('no user') ||
    errorLower.includes('does not exist')
  ) {
    return {
      type: 'error',
      message: 'User not found',
      suggestion: 'You may not be registered in the system yet',
      action: {
        label: 'Create account',
        onClick: () => (window.location.href = '/register'),
      },
    };
  }

  // Email already exists
  if (
    errorLower.includes('already exists') ||
    errorLower.includes('already registered') ||
    errorLower.includes('email taken')
  ) {
    return {
      type: 'error',
      message: 'This email is already registered',
      suggestion: 'Try to login or reset your password',
      action: {
        label: 'Go to login',
        onClick: () => (window.location.href = '/login'),
      },
    };
  }

  // Weak password
  if (
    errorLower.includes('weak password') ||
    errorLower.includes('password too short') ||
    errorLower.includes('password must be')
  ) {
    return {
      type: 'warning',
      message: 'Password not strong enough',
      suggestion: 'Use at least 8 characters, including letters, numbers and special characters',
    };
  }

  // Network error
  if (
    errorLower.includes('network') ||
    errorLower.includes('fetch') ||
    errorLower.includes('connection')
  ) {
    return {
      type: 'warning',
      message: 'Connection problem',
      suggestion: 'Check your internet connection and try again',
    };
  }

  // Server error
  if (
    errorLower.includes('500') ||
    errorLower.includes('server error') ||
    errorLower.includes('internal error')
  ) {
    return {
      type: 'error',
      message: 'Server error',
      suggestion: 'We are working on fixing this. Please try again in a few minutes',
    };
  }

  // Too many attempts
  if (
    errorLower.includes('too many') ||
    errorLower.includes('rate limit') ||
    errorLower.includes('blocked')
  ) {
    return {
      type: 'warning',
      message: 'Too many attempts',
      suggestion: 'Wait a few minutes before trying again',
    };
  }

  // Account blocked/suspended
  if (
    errorLower.includes('blocked') ||
    errorLower.includes('suspended') ||
    errorLower.includes('disabled')
  ) {
    return {
      type: 'error',
      message: 'Account blocked',
      suggestion: 'Contact your administrator to unblock',
    };
  }

  // Email not verified
  if (
    errorLower.includes('verify') ||
    errorLower.includes('not verified') ||
    errorLower.includes('confirm email')
  ) {
    return {
      type: 'warning',
      message: 'Email not confirmed',
      suggestion: 'Check your email and click the confirmation link',
    };
  }

  // Session expired
  if (
    errorLower.includes('session') ||
    errorLower.includes('expired') ||
    errorLower.includes('timeout')
  ) {
    return {
      type: 'info',
      message: 'Session expired',
      suggestion: 'Login again to continue',
    };
  }

  // Default error
  return {
    type: 'error',
    message: error || 'An error occurred',
    suggestion: 'Try again or contact support',
  };
}
