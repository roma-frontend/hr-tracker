import {
  isArmenianHoliday,
  getArmenianHoliday,
  getArmenianHolidaysByYear,
} from '@/lib/armenian-holidays';

describe('isArmenianHoliday', () => {
  it('returns true for New Year (January 1)', () => {
    expect(isArmenianHoliday('2026-01-01')).toBe(true);
  });

  it('returns true for Christmas (January 6)', () => {
    expect(isArmenianHoliday('2026-01-06')).toBe(true);
  });

  it('returns true for Womens Day (March 8)', () => {
    expect(isArmenianHoliday('2026-03-08')).toBe(true);
  });

  it('returns true for Republic Day (May 28)', () => {
    expect(isArmenianHoliday('2026-05-28')).toBe(true);
  });

  it('returns true for Independence Day (September 21)', () => {
    expect(isArmenianHoliday('2026-09-21')).toBe(true);
  });

  it('returns false for regular day', () => {
    expect(isArmenianHoliday('2026-02-15')).toBe(false);
  });

  it('handles Date objects', () => {
    const date = new Date('2026-01-01');
    expect(isArmenianHoliday(date)).toBe(true);
  });
});

describe('getArmenianHoliday', () => {
  it('returns holiday object for valid date', () => {
    const holiday = getArmenianHoliday('2026-01-01');
    expect(holiday).not.toBeNull();
    expect(holiday?.nameEn).toContain('New Year');
  });

  it('returns null for non-holiday', () => {
    expect(getArmenianHoliday('2026-02-15')).toBeNull();
  });

  it('returns correct holiday for Christmas', () => {
    const holiday = getArmenianHoliday('2026-01-06');
    expect(holiday?.nameEn).toContain('Christmas');
  });
});

describe('getArmenianHolidaysByYear', () => {
  it('returns all holidays for a given year', () => {
    const holidays = getArmenianHolidaysByYear(2026);
    expect(holidays.length).toBeGreaterThan(0);
    holidays.forEach((h) => {
      expect(h.date).toMatch(/^2026-/);
    });
  });

  it('returns empty array for year with no holidays', () => {
    const holidays = getArmenianHolidaysByYear(1900);
    expect(holidays).toEqual([]);
  });

  it('returns correct number of fixed holidays', () => {
    const holidays = getArmenianHolidaysByYear(2026);
    expect(holidays.length).toBeGreaterThanOrEqual(10);
  });
});
