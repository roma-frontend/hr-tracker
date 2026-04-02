'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Users,
  Ticket,
  CheckCircle,
  AlertTriangle,
  Wrench,
  MessageSquare,
  User,
  FileText,
  Shield,
  Zap,
  X,
  Command,
  ArrowRight,
  HelpCircle,
  HelpCircleIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { GlobalSearch } from './GlobalSearch';
import type { Id } from '@/convex/_generated/dataModel';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  category: 'action' | 'navigation' | 'user';
  action: () => void;
  requiresSelection?: boolean;
  superadminOnly?: boolean;
}

export function QuickActionsPalette() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Check if user is superadmin
  const isSuperadmin =
    user?.role === 'superadmin' || user?.email?.toLowerCase() === 'romangulanyan@gmail.com';

  // Quick actions list - filtered by role
  const allActions: QuickAction[] = [
    {
      id: 'find-user',
      label: t('superadmin.quickActions.findUser'),
      icon: <Search className="w-4 h-4" />,
      shortcut: '⌘U',
      category: 'action',
      action: () => {
        setIsOpen(false);
        // Focus global search if on superadmin page
        document.getElementById('global-search-input')?.focus();
      },
    },
    {
      id: 'create-ticket',
      label: t('superadmin.quickActions.createTicket'),
      icon: <Ticket className="w-4 h-4" />,
      shortcut: '⌘T',
      category: 'action',
      action: () => {
        setIsOpen(false);
        router.push('/help?new=true');
      },
    },
    // Superadmin-only actions
    {
      id: 'bulk-approve',
      label: t('superadmin.quickActions.bulkApprove'),
      icon: <CheckCircle className="w-4 h-4" />,
      shortcut: '⌘A',
      category: 'action',
      action: () => {
        setIsOpen(false);
        router.push('/superadmin/bulk-actions');
      },
      superadminOnly: true,
    },
    {
      id: 'emergency',
      label: t('superadmin.quickActions.emergencyMode'),
      icon: <AlertTriangle className="w-4 h-4" />,
      shortcut: '⌘E',
      category: 'action',
      action: () => {
        setIsOpen(false);
        router.push('/superadmin/emergency');
      },
      superadminOnly: true,
    },
    {
      id: 'broadcast',
      label: t('superadmin.quickActions.broadcast'),
      icon: <MessageSquare className="w-4 h-4" />,
      shortcut: '⌘B',
      category: 'action',
      action: () => {
        setIsOpen(false);
        router.push('/superadmin/organizations?tab=announcements');
      },
      superadminOnly: true,
    },
    {
      id: 'maintenance',
      label: t('superadmin.quickActions.maintenanceMode'),
      icon: <Wrench className="w-4 h-4" />,
      shortcut: '⌘M',
      category: 'action',
      action: () => {
        setIsOpen(false);
        router.push('/superadmin/organizations?tab=maintenance');
      },
      superadminOnly: true,
    },
    {
      id: 'impersonate',
      label: t('superadmin.quickActions.impersonate'),
      icon: <User className="w-4 h-4" />,
      shortcut: '⌘I',
      category: 'action',
      action: () => {
        setIsOpen(false);
        router.push('/superadmin/impersonate');
      },
      superadminOnly: true,
    },
    {
      id: 'automation',
      label: t('superadmin.quickActions.automation'),
      icon: <Zap className="w-4 h-4" />,
      shortcut: '⌘L',
      category: 'action',
      action: () => {
        setIsOpen(false);
        router.push('/superadmin/automation');
      },
      superadminOnly: true,
    },
    {
      id: 'reports',
      label: t('superadmin.quickActions.reports'),
      icon: <FileText className="w-4 h-4" />,
      shortcut: '⌘R',
      category: 'action',
      action: () => {
        setIsOpen(false);
        router.push('/reports');
      },
    },
    {
      id: 'security',
      label: t('superadmin.quickActions.security'),
      icon: <Shield className="w-4 h-4" />,
      shortcut: '⌘S',
      category: 'action',
      action: () => {
        setIsOpen(false);
        router.push('/superadmin/security');
      },
      superadminOnly: true,
    },
    {
      id: 'dashboard',
      label: t('superadmin.quickActions.dashboard'),
      icon: <Command className="w-4 h-4" />,
      shortcut: '⌘D',
      category: 'navigation',
      action: () => {
        setIsOpen(false);
        router.push('/dashboard');
      },
    },
    {
      id: 'organizations',
      label: t('superadmin.quickActions.organizations'),
      icon: <Users className="w-4 h-4" />,
      shortcut: '⌘O',
      category: 'navigation',
      action: () => {
        setIsOpen(false);
        router.push('/superadmin/organizations');
      },
      superadminOnly: true,
    },
    {
      id: 'support',
      label: t('superadmin.quickActions.support'),
      icon: <Ticket className="w-4 h-4" />,
      shortcut: '⌘P',
      category: 'navigation',
      action: () => {
        setIsOpen(false);
        router.push(isSuperadmin ? '/superadmin/support' : '/help');
      },
    },
    {
      id: 'help',
      label: t('superadmin.quickActions.help'),
      icon: <HelpCircleIcon className="w-4 h-4" />,
      shortcut: '⌘H',
      category: 'navigation',
      action: () => {
        setIsOpen(false);
        router.push('/help');
      },
    },
  ];

  // Filter actions based on user role
  const actions = allActions.filter((action) => {
    if (action.superadminOnly && !isSuperadmin) {
      return false;
    }
    return true;
  });

  // Filter actions by search query
  const filteredActions = actions.filter((action) =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
      }

      // Arrow down to navigate
      if (e.key === 'ArrowDown' && isOpen) {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredActions.length - 1));
      }

      // Arrow up to navigate
      if (e.key === 'ArrowUp' && isOpen) {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }

      // Enter to select
      if (e.key === 'Enter' && isOpen && selectedIndex >= 0) {
        e.preventDefault();
        filteredActions[selectedIndex]?.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Use requestAnimationFrame to avoid cascading renders warning
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        setSelectedIndex(-1);
      });
    }
  }, [isOpen]);

  // Group actions by category
  const groupedActions = filteredActions.reduce(
    (acc, action) => {
      acc[action.category].push(action);
      return acc;
    },
    { action: [] as QuickAction[], navigation: [] as QuickAction[], user: [] as QuickAction[] },
  );

  const allGroupedActions = [
    ...groupedActions.action,
    ...groupedActions.navigation,
    ...groupedActions.user,
  ];

  return (
    <>
      {/* Trigger button (optional, can also use keyboard shortcut) */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        <Command className="w-4 h-4" />
        <span className="hidden md:inline">{t('superadmin.quickActions.title') || 'Команды'}</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 bg-[var(--background-subtle)] border border-[var(--border)] rounded text-[10px] font-medium text-[var(--muted-foreground)]">
          <span>⌘K</span>
        </kbd>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 dark:bg-black/50 z-50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Palette */}
      {isOpen && (
        <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-in fade-in zoom-in duration-200">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden">
            {/* Header with search */}
            <div className="border-b border-[var(--border)] p-4 bg-[var(--background-subtle)]/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] opacity-60" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder={
                    t('superadmin.quickActions.placeholder') || 'Type a command or search...'
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  className="pl-9 pr-12 h-11 bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--background-subtle)] rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-[var(--muted-foreground)]" />
                  </button>
                )}
              </div>
            </div>

            {/* Actions list */}
            <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
              {searchQuery ? (
                // Show filtered results
                filteredActions.length > 0 ? (
                  <div className="space-y-1">
                    {filteredActions.map((action, index) => (
                      <ActionButton
                        key={action.id}
                        action={action}
                        index={index}
                        selectedIndex={selectedIndex}
                        onSelect={() => {
                          action.action();
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <p>{t('superadmin.quickActions.noResults') || 'Ничего не найдено'}</p>
                  </div>
                )
              ) : (
                // Show grouped actions
                <>
                  {groupedActions.action.length > 0 && (
                    <ActionGroup
                      title={t('superadmin.quickActions.actions')}
                      actions={groupedActions.action}
                      selectedIndex={selectedIndex}
                      setSelectedIndex={setSelectedIndex}
                    />
                  )}
                  {groupedActions.navigation.length > 0 && (
                    <ActionGroup
                      title={t('superadmin.quickActions.navigation')}
                      actions={groupedActions.navigation}
                      selectedIndex={selectedIndex}
                      setSelectedIndex={setSelectedIndex}
                    />
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--border)] p-3 text-xs text-[var(--muted-foreground)] flex items-center justify-between bg-[var(--background-subtle)]/50">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded text-[10px] font-medium">
                    ↑↓
                  </kbd>
                  {t('superadmin.quickActions.navigate')}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded text-[10px] font-medium">
                    ↵
                  </kbd>
                  {t('superadmin.quickActions.select')}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded text-[10px] font-medium">
                    esc
                  </kbd>
                  {t('superadmin.quickActions.close')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <Command className="w-3 h-3" />
                <span className="font-medium">K</span>
                <span className="mx-1">{t('superadmin.quickActions.toClose')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Action Group Component
function ActionGroup({
  title,
  actions,
  selectedIndex,
  setSelectedIndex,
}: {
  title: string;
  actions: QuickAction[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}) {
  const router = useRouter();
  const groupRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={groupRef} className="mb-4">
      <h3 className="px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {actions.map((action, index) => (
          <ActionButton
            key={action.id}
            action={action}
            index={index}
            selectedIndex={selectedIndex}
            onSelect={() => {
              action.action();
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Action Button Component
function ActionButton({
  action,
  index,
  selectedIndex,
  onSelect,
}: {
  action: QuickAction;
  index: number;
  selectedIndex: number;
  onSelect: () => void;
}) {
  const isSelected = index === selectedIndex;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left',
        isSelected
          ? 'bg-[var(--primary)]/10 text-[var(--foreground)]'
          : 'hover:bg-[var(--background-subtle)]/50 text-[var(--foreground)]',
      )}
    >
      <span
        className={cn(
          'shrink-0',
          isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]',
        )}
      >
        {action.icon}
      </span>
      <span className="flex-1 font-medium">{action.label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <kbd
          className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-mono border',
            isSelected
              ? 'bg-[var(--primary)]/20 border-[var(--primary)]/30 text-[var(--primary)]'
              : 'bg-[var(--background-subtle)] border-[var(--border)] text-[var(--muted-foreground)]',
          )}
        >
          {action.shortcut}
        </kbd>
        <ArrowRight
          className={cn('w-4 h-4 transition-opacity', isSelected ? 'opacity-100' : 'opacity-0')}
        />
      </div>
    </button>
  );
}
