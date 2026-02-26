'use client';

import { useEffect } from 'react';
import { X, Home, Sparkles, BarChart3, DollarSign, Info } from 'lucide-react';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { name: 'Home',     href: '#home',      icon: Home },
  { name: 'Features', href: '#features',  icon: Sparkles },
  { name: 'Analytics',href: '#analytics', icon: BarChart3 },
  { name: 'Pricing',  href: '#pricing',   icon: DollarSign },
  { name: 'About',    href: '#about',     icon: Info },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop — CSS transition */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel — CSS transform transition */}
      <div
        className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-[#020817]/95 backdrop-blur-xl border-l border-white/10 z-[70] md:hidden"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
          visibility: isOpen ? 'visible' : 'hidden',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <span className="text-white font-bold text-lg">HR<span className="text-blue-400">Leave</span></span>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
              aria-label="Close menu"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Navigation — staggered CSS fade-in via custom delay */}
          <nav className="flex-1 overflow-y-auto p-6" aria-label="Mobile navigation">
            <ul className="space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.name}
                    style={{
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? 'translateX(0)' : 'translateX(20px)',
                      transition: `opacity 0.35s ease ${0.1 + index * 0.05}s, transform 0.35s cubic-bezier(0.22,1,0.36,1) ${0.1 + index * 0.05}s`,
                    }}
                  >
                    <a
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl text-blue-200/80 hover:text-white hover:bg-blue-500/10 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/5 group-hover:bg-blue-500/20 transition-colors flex items-center justify-center">
                        <Icon size={18} className="text-blue-400" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer CTA */}
          <div className="flex flex-col p-6 border-t border-white/10 space-y-3"
            style={{
              opacity: isOpen ? 1 : 0,
              transition: `opacity 0.4s ease 0.4s`,
            }}
          >
            <Link href="/login" onClick={onClose}>
              <button className="w-full px-4 py-3 rounded-xl text-blue-100 font-semibold border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all active:scale-95">
                Sign In
              </button>
            </Link>
            <Link href="/register" onClick={onClose}>
              <button className="w-full px-4 py-3 rounded-xl text-white font-bold transition-all active:scale-95 cta-btn-primary"
                style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)' }}>
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
