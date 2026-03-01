"use client";

import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { Globe, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LocalizationSettingsProps {
  user: any;
  onSettingsChange: (settings: any) => void;
}

export function LocalizationSettings({ 
user, onSettingsChange }: LocalizationSettingsProps) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState(user?.language ?? "en");
  const [timezone, setTimezone] = useState(user?.timezone ?? "UTC");
  const [dateFormat, setDateFormat] = useState(user?.dateFormat ?? "DD/MM/YYYY");
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(user?.firstDayOfWeek ?? "monday");
  const [timeFormat, setTimeFormat] = useState(user?.timeFormat ?? "24h");

  // Update parent when settings change
  useEffect(() => {
    onSettingsChange({
      language,
      timezone,
      dateFormat,
      timeFormat,
      firstDayOfWeek,
    });
  }, [language, timezone, dateFormat, timeFormat, firstDayOfWeek]);

  // Sync when user data changes
  useEffect(() => {
    if (user) {
      setLanguage(user.language ?? "en");
      setTimezone(user.timezone ?? "UTC");
      setDateFormat(user.dateFormat ?? "DD/MM/YYYY");
      setFirstDayOfWeek(user.firstDayOfWeek ?? "monday");
      setTimeFormat(user.timeFormat ?? "24h");
    }
  }, [user?.language, user?.timezone, user?.dateFormat, user?.timeFormat, user?.firstDayOfWeek]);

  return (
    <div className="space-y-6">
      {/* Language & Region */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>{t('settingsLocalization.languageRegion')}</CardTitle>
          </div>
          <CardDescription>{t('settingsLocalization.customizeLanguage')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t('labels.displayLanguage')}</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                  <SelectItem value="zh">🇨🇳 中文</SelectItem>
                  <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                  <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">{t('labels.timeZone')}</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (GMT-5)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (GMT-6)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (GMT-8)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                  <SelectItem value="Europe/Moscow">Moscow (GMT+3)</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                  <SelectItem value="Asia/Kolkata">India (GMT+5:30)</SelectItem>
                  <SelectItem value="Asia/Shanghai">China (GMT+8)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                  <SelectItem value="Australia/Sydney">Sydney (GMT+11)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Format */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>{t('settingsLocalization.dateTimeFormat')}</CardTitle>
          </div>
          <CardDescription>{t('settingsLocalization.configureDatetime')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-format">{t('labels.dateFormat')}</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (25/12/2024)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/25/2024)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-25)</SelectItem>
                  <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (25.12.2024)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[var(--text-muted)]">
                Preview: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-format">{t('labels.timeFormat')}</Label>
              <Select value={timeFormat} onValueChange={setTimeFormat}>
                <SelectTrigger id="time-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">{t('settingsLocalization.hour24')}</SelectItem>
                  <SelectItem value="12h">{t('settingsLocalization.hour12')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[var(--text-muted)]">
                Preview: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>{t('settingsLocalization.calendarPreferences')}</CardTitle>
          </div>
          <CardDescription>{t('settingsLocalization.customizeCalendar')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first-day">{t('labels.firstDayOfWeek')}</Label>
            <Select value={firstDayOfWeek} onValueChange={setFirstDayOfWeek}>
              <SelectTrigger id="first-day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">{t('weekdays.sunday')}</SelectItem>
                <SelectItem value="monday">{t('weekdays.monday')}</SelectItem>
                <SelectItem value="saturday">{t('weekdays.saturday')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Week starts on {firstDayOfWeek}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {t('settingsLocalization.weekStartNote')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
