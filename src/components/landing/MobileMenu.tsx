'use client';

import { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { X, Home, Sparkles, BarChart3, DollarSign, Info } from 'lucide-react';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItemsConfig = [
  { key: 'home',      href: '#home',      icon: Home },
  { key: 'features',  href: '#features',  icon: Sparkles },
  { key: 'analytics', href: '#analytics', icon: BarChart3 },
  { key: 'pricing',   href: '#pricing',   icon: DollarSign },
  { key: 'about',     href: '#about',     icon: Info },
];

export default function MobileMenu({ 
isOpen, onClose }: MobileMenuProps) {
  const { t } = useTranslation();
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
        className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm backdrop-blur-xl border-l z-[70] md:hidden"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
          visibility: isOpen ? 'visible' : 'hidden',
          backgroundColor: 'var(--background)',
          borderColor: 'var(--landing-card-border)'
        }}
        role="dialog"
        aria-modal="true"
        aria-label={t('mobileMenu.closeMenu')}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--landing-card-border)' }}>
            <span className="font-bold text-lg" style={{ color: 'var(--landing-text-primary)' }}>{t('departments.hr')}<span style={{ color: 'var(--primary)' }}>Leave</span></span>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl transition-colors flex items-center justify-center"
              style={{ backgroundColor: 'var(--landing-card-bg)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--landing-card-bg)'}
              aria-label={t('mobileMenu.closeMenu')}
            >
              <X size={20} style={{ color: 'var(--landing-text-primary)' }} />
            </button>
          </div>

          {/* Navigation — staggered CSS fade-in via custom delay */}
          <nav className="flex-1 overflow-y-auto p-6" aria-label="Mobile navigation">
            <ul className="space-y-2">
              {menuItemsConfig.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.key}
                    style={{
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? 'translateX(0)' : 'translateX(20px)',
                      transition: `opacity 0.35s ease ${0.1 + index * 0.05}s, transform 0.35s cubic-bezier(0.22,1,0.36,1) ${0.1 + index * 0.05}s`,
                    }}
                  >
                    <a
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group"
                      style={{ color: 'var(--landing-text-secondary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--landing-text-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--landing-card-bg)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--landing-text-secondary)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg transition-colors flex items-center justify-center" style={{ backgroundColor: 'var(--landing-card-bg)' }}>
                        <Icon size={18} style={{ color: 'var(--primary)' }} />
                      </div>
                      <span className="font-medium">{t(`mobileMenu.${item.key}`)}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer CTA */}
          <div className="flex flex-col p-6 border-t space-y-3"
            style={{
              opacity: isOpen ? 1 : 0,
              transition: `opacity 0.4s ease 0.4s`,
              borderColor: 'var(--landing-card-border)'
            }}
          >
            <Link href="/login" onClick={onClose}>
              <button className="w-full px-4 py-3 rounded-xl font-semibold border transition-all active:scale-95"
                style={{ 
                  color: 'var(--landing-text-primary)',
                  borderColor: 'var(--landing-card-border)',
                  backgroundColor: 'var(--landing-card-bg)'
                }}>
                {t('mobileMenu.signIn')}
              </button>
            </Link>
            <Link href="/register" onClick={onClose}>
              <button className="w-full px-4 py-3 rounded-xl font-bold transition-all active:scale-95 cta-btn-primary"
                style={{ 
                  background: 'linear-gradient(135deg, #2563eb, #93c5fd)',
                  color: '#ffffff'
                }}>
                {t('mobileMenu.getStartedFree')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
