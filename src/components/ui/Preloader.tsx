'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from '@/lib/cssMotion';
import { Shield } from 'lucide-react';

interface PreloaderProps {
  isLoading: boolean;
}

export function Preloader({ isLoading }: PreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    // Simulate initial loading steps
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 15;
        const next = prev + increment;
        if (next >= 90) return 90; // Cap at 90% until actually loaded
        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (isLoading && progress >= 90) {
      setProgress(100);
    }
  }, [isLoading, progress]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: 'var(--background)',
          }}
        >
          <div className="flex flex-col items-center gap-8 w-full max-w-xs">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative"
            >
              <div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ background: 'var(--primary)', opacity: 0.2 }}
              />
              <div
                className="p-6 rounded-2xl flex items-center justify-center relative z-10"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, white))',
                  boxShadow: '0 20px 50px -12px rgba(0,0,0,0.25)',
                }}
              >
                <Shield className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1
                className="text-2xl font-bold tracking-tight mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                HR Office
              </h1>
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                Human Resource Management System
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="h-1 rounded-full overflow-hidden w-48"
              style={{ background: 'var(--border)' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.4 }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, var(--primary), #60a5fa)',
                  boxShadow: '0 0 10px var(--primary)',
                }}
              />
            </motion.div>

            {/* Loading percentage */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              {Math.round(progress)}%
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
