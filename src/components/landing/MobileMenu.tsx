'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Sparkles, BarChart3, DollarSign, Info } from 'lucide-react';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { name: 'Home', href: '#home', icon: Home },
  { name: 'Features', href: '#features', icon: Sparkles },
  { name: 'Analytics', href: '#analytics', icon: BarChart3 },
  { name: 'Pricing', href: '#pricing', icon: DollarSign },
  { name: 'About', href: '#about', icon: Info },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-[#020817]/95 backdrop-blur-xl border-l border-white/10 z-[70] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <span className="text-white font-bold text-lg">
                  HR<span className="text-[#d4af37]">Leave</span>
                </span>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto p-6" aria-label="Mobile navigation">
                <ul className="space-y-2">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.li
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <a
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center gap-4 px-4 py-3 rounded-xl text-[#f7e7ce]/80 hover:text-white hover:bg-[#d4af37]/10 transition-all duration-200 group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white/5 group-hover:bg-[#d4af37]/20 transition-colors flex items-center justify-center">
                            <Icon size={18} className="text-[#d4af37]" />
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </a>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Footer CTA */}
              <div className="p-6 border-t border-white/10 space-y-3">
                <Link href="/login" onClick={onClose}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="w-full px-4 py-3 rounded-xl text-[#f7e7ce] font-semibold border border-[#d4af37]/20 bg-[#d4af37]/5 hover:bg-[#d4af37]/10 transition-all"
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link href="/register" onClick={onClose}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="w-full px-4 py-3 rounded-xl text-black font-bold transition-all"
                    style={{ background: 'linear-gradient(135deg, #d4af37, #f4e5a8)' }}
                  >
                    Get Started Free
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
