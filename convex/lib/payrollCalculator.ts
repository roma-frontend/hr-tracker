export interface TaxBracket {
  min: number;
  max?: number;
  rate: number;
}

export interface Deductions {
  incomeTax: number;
  socialSecurity: number;
  healthInsurance?: number;
  pension?: number;
  other?: number;
  total: number;
}

export interface PayrollCalculation {
  country: 'armenia' | 'russia';
  baseSalary: number;
  bonuses: number;
  overtimePay: number;
  grossSalary: number;
  deductions: Deductions;
  netSalary: number;
  employerContributions?: number;
  totalCost?: number;
}

export interface PayrollInput {
  country: 'armenia' | 'russia';
  baseSalary: number;
  bonuses?: number;
  overtimeHours?: number;
  hourlyRate?: number;
}

const ARMENIA_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 3000000, rate: 0.2 },
  { min: 3000000, rate: 0.23 },
];

const RUSSIA_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 5000000, rate: 0.13 },
  { min: 5000000, rate: 0.15 },
];

const ARMENIA_SOCIAL_SECURITY_RATE = 0.05;

const RUSSIA_EMPLOYER_CONTRIBUTIONS = {
  socialInsurance: 0.029,
  pension: 0.22,
  medical: 0.051,
  accident: 0.002,
};

function calculateProgressiveTax(taxableIncome: number, brackets: TaxBracket[]): number {
  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const taxableInBracket = bracket.max
      ? Math.min(remainingIncome, bracket.max - bracket.min)
      : remainingIncome;

    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
  }

  return Math.round(tax * 100) / 100;
}

function calculateOvertimePay(hours: number, hourlyRate: number, multiplier: number = 1.5): number {
  return Math.round(hours * hourlyRate * multiplier * 100) / 100;
}

export function calculatePayroll(input: PayrollInput): PayrollCalculation {
  const { country, baseSalary, bonuses = 0, overtimeHours = 0, hourlyRate = 0 } = input;

  const overtimePay =
    overtimeHours > 0 && hourlyRate > 0 ? calculateOvertimePay(overtimeHours, hourlyRate) : 0;

  const grossSalary = baseSalary + bonuses + overtimePay;

  let deductions: Deductions;
  let employerContributions: number | undefined;
  let totalCost: number | undefined;

  if (country === 'armenia') {
    const incomeTax = calculateProgressiveTax(grossSalary, ARMENIA_TAX_BRACKETS);
    const socialSecurity = Math.round(grossSalary * ARMENIA_SOCIAL_SECURITY_RATE * 100) / 100;

    deductions = {
      incomeTax,
      socialSecurity,
      total: Math.round((incomeTax + socialSecurity) * 100) / 100,
    };

    employerContributions = 0;
    totalCost = grossSalary;
  } else {
    const incomeTax = calculateProgressiveTax(grossSalary, RUSSIA_TAX_BRACKETS);

    deductions = {
      incomeTax,
      socialSecurity: 0,
      total: incomeTax,
    };

    employerContributions =
      Math.round(
        grossSalary *
          (RUSSIA_EMPLOYER_CONTRIBUTIONS.socialInsurance +
            RUSSIA_EMPLOYER_CONTRIBUTIONS.pension +
            RUSSIA_EMPLOYER_CONTRIBUTIONS.medical +
            RUSSIA_EMPLOYER_CONTRIBUTIONS.accident) *
          100,
      ) / 100;

    totalCost = grossSalary + employerContributions;
  }

  const netSalary = Math.round((grossSalary - deductions.total) * 100) / 100;

  return {
    country,
    baseSalary,
    bonuses,
    overtimePay,
    grossSalary,
    deductions,
    netSalary,
    employerContributions,
    totalCost,
  };
}

export function formatCurrency(amount: number, country: 'armenia' | 'russia'): string {
  const currency = country === 'armenia' ? 'AMD' : 'RUB';
  return new Intl.NumberFormat(country === 'armenia' ? 'hy-AM' : 'ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getEffectiveTaxRate(grossSalary: number, deductions: Deductions): number {
  if (grossSalary === 0) return 0;
  return Math.round((deductions.total / grossSalary) * 10000) / 100;
}
