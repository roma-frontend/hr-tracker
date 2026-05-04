import { getInitials, formatFileSize } from '@/lib/stringUtils';

describe('getInitials', () => {
  it('returns initials for full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('returns first letter for single word', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('handles extra whitespace', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD');
  });

  it('returns ? for empty input', () => {
    expect(getInitials('')).toBe('?');
  });

  it('handles multiple words (first + last)', () => {
    expect(getInitials('John William Doe')).toBe('JD');
  });

  it('lowercases properly', () => {
    expect(getInitials('JOHN DOE')).toBe('JD');
  });
});

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1500)).toBe('1.46 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1500000)).toBe('1.43 MB');
  });

  it('formats gigabytes', () => {
    expect(formatFileSize(1500000000)).toBe('1.4 GB');
  });

  it('formats terabytes', () => {
    expect(formatFileSize(1500000000000)).toBe('1.36 TB');
  });

  it('handles zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });
});
