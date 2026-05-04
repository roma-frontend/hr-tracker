import { getTravelAllowance, getInitials, calculateDays, formatCurrency } from '@/lib/types';

describe('getTravelAllowance', () => {
  it('returns 12000 for contractor email', () => {
    expect(getTravelAllowance('john@contractor.com')).toBe(12000);
  });

  it('returns 20000 for staff email', () => {
    expect(getTravelAllowance('john@company.com')).toBe(20000);
  });

  it('is case-insensitive for contractor check', () => {
    expect(getTravelAllowance('john@CONTRACTOR.com')).toBe(12000);
  });

  it('handles email without contractor keyword', () => {
    expect(getTravelAllowance('john@example.com')).toBe(20000);
  });
});

describe('getInitials (types)', () => {
  it('returns first two word initials', () => {
    expect(getInitials('John William Doe')).toBe('JW');
  });

  it('handles single word', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('uppercases result', () => {
    expect(getInitials('john doe')).toBe('JD');
  });

  it('handles empty string', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('calculateDays', () => {
  it('calculates inclusive days between dates', () => {
    expect(calculateDays('2024-01-01', '2024-01-05')).toBe(5);
  });

  it('returns 1 when start equals end', () => {
    expect(calculateDays('2024-01-01', '2024-01-01')).toBe(1);
  });

  it('returns 1 when end is before start', () => {
    expect(calculateDays('2024-01-05', '2024-01-01')).toBe(1);
  });

  it('handles month boundaries', () => {
    expect(calculateDays('2024-01-31', '2024-02-02')).toBe(3);
  });
});

describe('formatCurrency (types)', () => {
  it('formats number with AMD symbol', () => {
    const result = formatCurrency(100000);
    expect(result).toContain('100');
    expect(result).toContain('֏');
  });

  it('handles zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('handles negative values', () => {
    const result = formatCurrency(-5000);
    expect(result).toContain('-');
  });
});
