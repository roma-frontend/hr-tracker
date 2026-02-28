export interface Holiday {
  date: string; // ISO format: YYYY-MM-DD
  nameEn: string;
  nameHy: string;
  isNational: boolean;
}

export const armenianHolidays2026: Holiday[] = [
  {
    date: '2026-01-01',
    nameEn: 'New Year',
    nameHy: 'Նոր Տարի',
    isNational: true,
  },
  {
    date: '2026-01-02',
    nameEn: 'New Year Holiday',
    nameHy: 'Նոր Տարվա արձակուրդ',
    isNational: true,
  },
  {
    date: '2026-01-06',
    nameEn: 'Christmas',
    nameHy: 'Սուրբ Ծնունդ',
    isNational: true,
  },
  {
    date: '2026-03-08',
    nameEn: "Women's Day",
    nameHy: 'Կանանց տոն',
    isNational: true,
  },
  {
    date: '2026-04-07',
    nameEn: 'Motherhood and Beauty Day',
    nameHy: 'Մայրության և գեղեցկության տոն',
    isNational: true,
  },
  {
    date: '2026-04-24',
    nameEn: 'Armenian Genocide Remembrance Day',
    nameHy: 'Հայոց ցեղասպանության զոհերի հիշատակի օր',
    isNational: true,
  },
  {
    date: '2026-05-01',
    nameEn: 'Labor Day',
    nameHy: 'Աշխատանքի օր',
    isNational: true,
  },
  {
    date: '2026-05-09',
    nameEn: 'Victory and Peace Day',
    nameHy: 'Հաղթանակի և Խաղաղության տոն',
    isNational: true,
  },
  {
    date: '2026-05-28',
    nameEn: 'Republic Day',
    nameHy: 'Հանրապետության օր',
    isNational: true,
  },
  {
    date: '2026-07-05',
    nameEn: 'Constitution Day',
    nameHy: 'Սահմանադրության օր',
    isNational: true,
  },
  {
    date: '2026-09-21',
    nameEn: 'Independence Day',
    nameHy: 'Անկախության օր',
    isNational: true,
  },
  {
    date: '2026-12-31',
    nameEn: "New Year's Eve",
    nameHy: 'Նոր տարվա գիշեր',
    isNational: true,
  },
];

export const armenianHolidays2027: Holiday[] = [
  {
    date: '2027-01-01',
    nameEn: 'New Year',
    nameHy: 'Նոր Տարի',
    isNational: true,
  },
  {
    date: '2027-01-02',
    nameEn: 'New Year Holiday',
    nameHy: 'Նոր Տարվա արձակուրդ',
    isNational: true,
  },
  {
    date: '2027-01-06',
    nameEn: 'Christmas',
    nameHy: 'Սուրբ Ծնունդ',
    isNational: true,
  },
  {
    date: '2027-03-08',
    nameEn: "Women's Day",
    nameHy: 'Կանանց տոն',
    isNational: true,
  },
  {
    date: '2027-04-07',
    nameEn: 'Motherhood and Beauty Day',
    nameHy: 'Մայրության և գեղեցկության տոն',
    isNational: true,
  },
  {
    date: '2027-04-24',
    nameEn: 'Armenian Genocide Remembrance Day',
    nameHy: 'Հայոց ցեղասպանության զոհերի հիշատակի օր',
    isNational: true,
  },
  {
    date: '2027-05-01',
    nameEn: 'Labor Day',
    nameHy: 'Աշխատանքի օր',
    isNational: true,
  },
  {
    date: '2027-05-09',
    nameEn: 'Victory and Peace Day',
    nameHy: 'Հաղթանակի և Խաղաղության տոն',
    isNational: true,
  },
  {
    date: '2027-05-28',
    nameEn: 'Republic Day',
    nameHy: 'Հանրապետության օր',
    isNational: true,
  },
  {
    date: '2027-07-05',
    nameEn: 'Constitution Day',
    nameHy: 'Սահմանադրության օր',
    isNational: true,
  },
  {
    date: '2027-09-21',
    nameEn: 'Independence Day',
    nameHy: 'Անկախության օր',
    isNational: true,
  },
  {
    date: '2027-12-31',
    nameEn: "New Year's Eve",
    nameHy: 'Նոր տարվա գիշեր',
    isNational: true,
  },
];

// Combine all holidays
export const allArmenianHolidays = [
  ...armenianHolidays2026,
  ...armenianHolidays2027,
];

/**
 * Check if a given date is an Armenian national holiday
 */
export function isArmenianHoliday(date: Date | string): boolean {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  return allArmenianHolidays.some((holiday) => holiday.date === dateStr);
}

/**
 * Get Armenian holiday for a specific date
 */
export function getArmenianHoliday(date: Date | string): Holiday | null {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  return allArmenianHolidays.find((holiday) => holiday.date === dateStr) || null;
}

/**
 * Get all Armenian holidays for a specific year
 */
export function getArmenianHolidaysByYear(year: number): Holiday[] {
  return allArmenianHolidays.filter((holiday) => holiday.date.startsWith(String(year)));
}

/**
 * Get upcoming Armenian holidays (next 90 days)
 */
export function getUpcomingArmenianHolidays(daysAhead: number = 90): Holiday[] {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);

  return allArmenianHolidays.filter((holiday) => {
    const holidayDate = new Date(holiday.date);
    return holidayDate >= today && holidayDate <= futureDate;
  });
}
