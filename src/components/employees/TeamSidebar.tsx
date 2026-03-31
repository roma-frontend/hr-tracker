/**
import Image from 'next/image';
 * Team Sidebar — Боковая панель с информацией о команде
 * Компактная сворачиваемая панель с accordion для виджетов
 */

"use client";

import { useQuery } from "convex/react";
import { useTranslation } from "react-i18next";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from '@/lib/cssMotion';
import {
  Users, UserCheck, UserX, Briefcase, Calendar, Award,
  TrendingUp, Clock, Star, Zap, ChevronDown, ChevronUp, X, PanelRightClose, PanelRightOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TeamSidebarProps {
  userId?: Id<"users">;
  onToggle?: (isOpen: boolean) => void;
}

interface CollapsibleSectionProps {
  title: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  defaultIcon?: React.ReactNode;
}

function CollapsibleSection({ title, isCollapsed, onToggle, children, defaultIcon }: CollapsibleSectionProps) {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-[var(--card)] to-[var(--background-subtle)] overflow-hidden">
      <CardHeader className="pb-0 cursor-pointer" onClick={onToggle}>
        <CardTitle className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between gap-2 py-3">
          <div className="flex items-center gap-2">
            {title}
          </div>
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ 
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1]
            }}
          >
            <ChevronUp className="w-4 h-4" />
          </motion.div>
        </CardTitle>
      </CardHeader>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1]
            }}
          >
            <CardContent className="space-y-3 pt-3">
              {children}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export function TeamSidebar({ userId, onToggle }: TeamSidebarProps) {
  const { t } = useTranslation();
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(true); // Закрыт по умолчанию
  const [collapsedSections, setCollapsedSections] = useState({
    overview: true, // Свернут по умолчанию
    recent: true,
    quickStats: true,
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Get all users for stats
  const allUsers = useQuery(
    api.users.getAllUsers,
    userId ? { requesterId: userId } : "skip"
  );

  // Calculate stats
  const stats = allUsers?.reduce((acc, user) => {
    if (!user.isActive) {
      acc.inactive++;
      return acc;
    }

    acc.total++;
    if (user.role === "admin") acc.admins++;
    else if (user.role === "supervisor") acc.supervisors++;
    else if (user.role === "employee") acc.employees++;
    else if (user.role === "driver") acc.drivers++;

    if ((user as any).employeeType === "contractor") acc.contractors++;
    else acc.staff++;

    return acc;
  }, {
    total: 0,
    admins: 0,
    supervisors: 0,
    employees: 0,
    drivers: 0,
    contractors: 0,
    staff: 0,
    inactive: 0,
  }) || {
    total: 0,
    admins: 0,
    supervisors: 0,
    employees: 0,
    drivers: 0,
    contractors: 0,
    staff: 0,
    inactive: 0,
  };

  // Recent employees (by createdAt)
  const recentEmployees = allUsers
    ?.filter((u: any) => u.isActive)
    .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5) || [];

  const overviewTitle = (
    <span className="flex items-center gap-2">
      <Users className="w-4 h-4" />
      {t('employees.teamOverview')}
    </span>
  );

  const recentTitle = (
    <span className="flex items-center gap-2">
      <TrendingUp className="w-4 h-4" />
      {t('employees.newMembers')}
    </span>
  );

  const quickStatsTitle = (
    <span className="flex items-center gap-2">
      <Award className="w-4 h-4" />
      {t('dashboard.quickStats')}
    </span>
  );

  return (
    <>
      {/* Кнопка сворачивания/разворачивания панели - вверху справа */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
        onClick={() => {
          const newCollapsedState = !isPanelCollapsed;
          setIsPanelCollapsed(newCollapsedState);
          onToggle?.(!newCollapsedState);
        }}
        className="fixed top-8 right-6 z-50 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors"
        style={{ 
          background: "var(--primary)",
          color: "var(--primary-foreground)"
        }}
      >
        {isPanelCollapsed ? (
          <PanelRightOpen className="w-5 h-5" />
        ) : (
          <PanelRightClose className="w-5 h-5" />
        )}
      </motion.button>

      {/* Боковая панель */}
      <AnimatePresence>
        {!isPanelCollapsed && (
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ 
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className="fixed top-24 right-6 z-40 w-64 max-h-[calc(100vh-180px)] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[var(--muted-foreground)] scrollbar-track-transparent"
            style={{
              willChange: 'transform, opacity'
            }}
          >
            {/* Team Overview */}
            <CollapsibleSection
              title={overviewTitle}
              isCollapsed={collapsedSections.overview}
              onToggle={() => toggleSection('overview')}
              defaultIcon={<Users className="w-4 h-4" />}
            >
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: 0.05, 
                    duration: 0.4,
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                  className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs text-blue-600 font-medium">{t('employees.active')}</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: 0.1, 
                    duration: 0.4,
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                  className="p-3 rounded-xl bg-gray-500/10 border border-gray-500/20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <UserX className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs text-gray-600 font-medium">{t('employees.inactive')}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                </motion.div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                    <Award className="w-3 h-3" /> {t('roles.admin')}
                  </span>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-600 border-purple-500/30">
                    {stats.admins}
                  </Badge>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                    <Star className="w-3 h-3" /> {t('roles.supervisor')}
                  </span>
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                    {stats.supervisors}
                  </Badge>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                    <UserCheck className="w-3 h-3" /> {t('roles.employee')}
                  </span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-500/30">
                    {stats.employees}
                  </Badge>
                </motion.div>
                {stats.drivers > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                      <Zap className="w-3 h-3" /> {t('roles.driver')}
                    </span>
                    <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-600 border-cyan-500/30">
                      {stats.drivers}
                    </Badge>
                  </motion.div>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--border)]">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3" /> {t('employeeTypes.staff')}
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{stats.staff}</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex items-center justify-between text-xs mt-1.5"
                >
                  <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {t('employeeTypes.contractor')}
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{stats.contractors}</span>
                </motion.div>
              </div>
            </CollapsibleSection>

            {/* Recent Members */}
            {recentEmployees.length > 0 && (
              <CollapsibleSection
                title={recentTitle}
                isCollapsed={collapsedSections.recent}
                onToggle={() => toggleSection('recent')}
                defaultIcon={<TrendingUp className="w-4 h-4" />}
              >
                <div className="space-y-2">
                  {recentEmployees.map((emp: any, index) => (
                    <motion.div
                      key={emp._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white text-xs bg-gradient-to-br from-blue-500 to-sky-500">
                        {emp.avatarUrl ? (
                          <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          emp.name.split(" ").map((n: any[]) => n[0]).join("").toUpperCase().slice(0, 2)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--text-primary)] truncate">{emp.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{emp.position || t('common.noPosition')}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-green-500/20 text-green-600 border-green-500/30">
                        New
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Quick Stats */}
            <CollapsibleSection
              title={quickStatsTitle}
              isCollapsed={collapsedSections.quickStats}
              onToggle={() => toggleSection('quickStats')}
              defaultIcon={<Award className="w-4 h-4" />}
            >
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-[var(--success)]">{t('employees.supervisors')}</span>
                  <span className="text-sm font-bold text-[var(--success)]">{stats.supervisors}</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-[var(--success)]">{t('employees.contractors')}</span>
                  <span className="text-sm font-bold text-[var(--success)]">{stats.contractors}</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="pt-2 border-t border-[var(--border)]"
                >
                  <p className="text-[10px] text-[var(--text-muted)] text-center">
                    💡 {t('employees.teamHealthGood')}
                  </p>
                </motion.div>
              </div>
            </CollapsibleSection>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
