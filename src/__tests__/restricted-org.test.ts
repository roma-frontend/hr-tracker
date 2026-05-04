import { isRestrictedOrganization, validateRestrictedAccess } from '@/lib/restricted-org';

describe('isRestrictedOrganization', () => {
  it('returns true for exact match "ADB-ARRM"', () => {
    expect(isRestrictedOrganization('ADB-ARRM')).toBe(true);
  });

  it('returns true for case-insensitive match', () => {
    expect(isRestrictedOrganization('adb-arrm')).toBe(true);
    expect(isRestrictedOrganization('Adb-Arrm')).toBe(true);
    expect(isRestrictedOrganization('ADB-ARRM')).toBe(true);
  });

  it('returns true for match with whitespace', () => {
    expect(isRestrictedOrganization('  ADB-ARRM  ')).toBe(true);
    expect(isRestrictedOrganization('ADB-ARRM ')).toBe(true);
    expect(isRestrictedOrganization(' ADB-ARRM')).toBe(true);
  });

  it('returns false for non-matching names', () => {
    expect(isRestrictedOrganization('OtherOrg')).toBe(false);
    expect(isRestrictedOrganization('ADB')).toBe(false);
    expect(isRestrictedOrganization('')).toBe(false);
  });
});

describe('validateRestrictedAccess', () => {
  it('returns allowed when org name matches', () => {
    const result = validateRestrictedAccess('ADB-ARRM', 'other-slug');
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('returns allowed when org slug matches', () => {
    const result = validateRestrictedAccess('OtherOrg', 'adb-arrm');
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('returns not allowed when neither matches', () => {
    const result = validateRestrictedAccess('OtherOrg', 'other-slug');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('handles case-insensitive matching', () => {
    const result = validateRestrictedAccess('adb-arrm', 'other-slug');
    expect(result.allowed).toBe(true);
  });

  it('handles empty inputs', () => {
    const result = validateRestrictedAccess('', '');
    expect(result.allowed).toBe(false);
  });
});
