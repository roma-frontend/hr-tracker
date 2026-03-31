/**
 * Framer Motion wrapper - заглушка для совместимости
 */

'use client';

// Прямой импорт framer-motion без lazy loading для избежания ошибок типов
import { motion, AnimatePresence } from '@/lib/cssMotion';

// Типы для TypeScript
export type { HTMLMotionProps } from '@/lib/cssMotion';

// Re-export
export { motion, AnimatePresence };
