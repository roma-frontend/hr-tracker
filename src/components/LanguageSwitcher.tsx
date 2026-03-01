'use client';

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const languages = {
  en: { name: 'English', flag: '🇬🇧' },
  hy: { name: 'Հայերեն', flag: '🇦🇲' },
  ru: { name: 'Русский', flag: '🇷🇺' },
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const changeLanguage = (lng: string) => {
    console.log('🔄 LanguageSwitcher: Changing language from', i18n.language, 'to', lng);
    i18n.changeLanguage(lng);
    console.log('✅ Language changed to:', i18n.language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {languages[currentLang as keyof typeof languages]?.flag}{' '}
            {languages[currentLang as keyof typeof languages]?.name || 'English'}
          </span>
          <span className="sm:hidden">
            {languages[currentLang as keyof typeof languages]?.flag || '🇬🇧'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, { name, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLanguage(code)}
            className={currentLang === code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{flag}</span>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
