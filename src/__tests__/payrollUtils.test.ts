import {
  calculateEffectiveTaxRate,
  getPayrollSummary,
  filterPayrollRuns,
  getStatusColor,
  formatCurrency,
  formatDate,
  formatDateTime,
} from '@/lib/payrollUtils';

describe('calculateEffectiveTaxRate', () => {
  it('calculates correct rate', () => {
    expect(calculateEffectiveTaxRate(100000, 20000)).toBe(20);
  });

  it('returns 0 for zero gross', () => {
    expect(calculateEffectiveTaxRate(0, 5000)).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateEffectiveTaxRate(100000, 12345)).toBe(12.35);
  });

  it('handles 100% tax rate', () => {
    expect(calculateEffectiveTaxRate(50000, 50000)).toBe(100);
  });
});

describe('getPayrollSummary', () => {
  const mockRecords = [
    { grossSalary: 100000, netSalary: 80000, deductions: { total: 20000 } },
    { grossSalary: 120000, netSalary: 96000, deductions: { total: 24000 } },
  ];

  it('calculates totals correctly', () => {
    const summary = getPayrollSummary(mockRecords);
    expect(summary.totalGross).toBe(220000);
    expect(summary.totalNet).toBe(176000);
    expect(summary.totalDeductions).toBe(44000);
  });

  it('calculates average salary correctly', () => {
    const summary = getPayrollSummary(mockRecords);
    expect(summary.averageSalary).toBe(88000);
  });

  it('finds highest and lowest salaries', () => {
    const summary = getPayrollSummary(mockRecords);
    expect(summary.highestSalary).toBe(96000);
    expect(summary.lowestSalary).toBe(80000);
  });

  it('counts employees correctly', () => {
    const summary = getPayrollSummary(mockRecords);
    expect(summary.employeeCount).toBe(2);
  });

  it('handles empty array', () => {
    const summary = getPayrollSummary([]);
    expect(summary.totalGross).toBe(0);
    expect(summary.totalNet).toBe(0);
    expect(summary.averageSalary).toBe(0);
    expect(summary.highestSalary).toBe(0);
    expect(summary.lowestSalary).toBe(0);
    expect(summary.employeeCount).toBe(0);
  });
});

describe('filterPayrollRuns', () => {
  const mockRuns = [
    { status: 'completed', period: '2024-01', notes: 'Acme Corp payroll', createdAt: 1000 },
    { status: 'pending', period: '2024-02', notes: 'Beta Inc payroll', createdAt: 2000 },
    { status: 'completed', period: '2024-03', notes: 'Gamma LLC payroll', createdAt: 3000 },
  ];

  it('filters by status', () => {
    const result = filterPayrollRuns(mockRuns, { status: 'completed' });
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.status === 'completed')).toBe(true);
  });

  it('filters by period', () => {
    const result = filterPayrollRuns(mockRuns, { period: '2024-02' });
    expect(result).toHaveLength(1);
    expect(result[0].period).toBe('2024-02');
  });

  it('filters by search text (case-insensitive)', () => {
    const result = filterPayrollRuns(mockRuns, { search: 'acme' });
    expect(result).toHaveLength(1);
    expect(result[0].notes).toContain('Acme');
  });

  it('combines multiple filters', () => {
    const result = filterPayrollRuns(mockRuns, { status: 'completed', search: 'gamma' });
    expect(result).toHaveLength(1);
    expect(result[0].notes).toContain('Gamma');
  });

  it('sorts by createdAt descending', () => {
    const result = filterPayrollRuns(mockRuns, {});
    expect(result[0].createdAt).toBe(3000);
    expect(result[result.length - 1].createdAt).toBe(1000);
  });

  it('returns all runs when no filters applied', () => {
    const result = filterPayrollRuns(mockRuns, {});
    expect(result).toHaveLength(3);
  });
});

describe('getStatusColor', () => {
  it('returns green for paid', () => {
    expect(getStatusColor('paid')).toContain('emerald');
  });

  it('returns blue for calculated', () => {
    expect(getStatusColor('calculated')).toContain('blue');
  });

  it('returns red for cancelled', () => {
    expect(getStatusColor('cancelled')).toContain('red');
  });

  it('returns gray for unknown status', () => {
    expect(getStatusColor('unknown')).toContain('gray');
  });
});

describe('formatCurrency', () => {
  it('formats with AMD by default', () => {
    const result = formatCurrency(100000);
    expect(result).toContain('100');
    expect(result).toContain('AMD');
  });

  it('formats with specified currency', () => {
    const result = formatCurrency(1000, 'USD');
    expect(result).toContain('$');
  });

  it('handles zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('has no fraction digits', () => {
    const result = formatCurrency(100.5);
    expect(result).not.toContain('.50');
  });
});

describe('formatDate', () => {
  it('formats timestamp to locale date', () => {
    const result = formatDate(1704067200000);
    expect(result).toMatch(/Jan|January|1\/1\/2024|01\/01\/2024/);
  });
});

describe('formatDateTime', () => {
  it('formats timestamp to locale date and time', () => {
    const result = formatDateTime(1704067200000);
    expect(result.length).toBeGreaterThan(formatDate(1704067200000).length);
  });
});
