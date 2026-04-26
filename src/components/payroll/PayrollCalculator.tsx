'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from '@/lib/cssMotion';
import { Calculator, DollarSign, TrendingDown, TrendingUp, Info, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculatePayroll, type PayrollInput } from '../../../convex/lib/payrollCalculator';

export default function PayrollCalculator() {
  const { t } = useTranslation();
  const [country, setCountry] = useState<'armenia' | 'russia'>('armenia');
  const [baseSalary, setBaseSalary] = useState('');
  const [bonuses, setBonuses] = useState('');
  const [overtimeHours, setOvertimeHours] = useState('');

  const calculation = useMemo(() => {
    const base = parseFloat(baseSalary) || 0;
    const bonus = parseFloat(bonuses) || 0;
    const overtime = parseFloat(overtimeHours) || 0;
    const hourlyRate = base > 0 ? base / 160 : 0;

    if (base === 0) return null;

    const input: PayrollInput = {
      country,
      baseSalary: base,
      bonuses: bonus,
      overtimeHours: overtime,
      hourlyRate,
    };

    return calculatePayroll(input);
  }, [country, baseSalary, bonuses, overtimeHours]);

  const handleReset = () => {
    setBaseSalary('');
    setBonuses('');
    setOvertimeHours('');
    setCountry('armenia');
  };

  const formatCurrency = (amount: number) => {
    const currency = country === 'armenia' ? 'AMD' : 'RUB';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-(--text-primary)" />
              <CardTitle>{t('payroll.calculatorTitle')}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('payroll.reset')}
            </Button>
          </div>
          <p className="text-sm text-(--text-muted) mt-1">{t('payroll.calculatorSubtitle')}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('payroll.countryLabel')}</Label>
              <Select value={country} onValueChange={(v) => setCountry(v as 'armenia' | 'russia')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="armenia">{t('payroll.armenia')}</SelectItem>
                  <SelectItem value="russia">{t('payroll.russia')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{t('payroll.baseSalary')}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-(--text-muted)" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('payroll.baseSalaryPlaceholder')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                type="number"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                placeholder={t('payroll.baseSalaryPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('payroll.bonuses')}</Label>
              <Input
                type="number"
                value={bonuses}
                onChange={(e) => setBonuses(e.target.value)}
                placeholder={t('payroll.bonusesPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('payroll.overtimeHours')}</Label>
              <Input
                type="number"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(e.target.value)}
                placeholder={t('payroll.overtimePlaceholder')}
              />
            </div>
          </div>

          <Separator />

          {calculation ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-(--text-muted)">
                        {t('payroll.grossSalary')}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-(--text-primary)">
                      {formatCurrency(calculation.grossSalary)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-(--text-muted)">
                        {t('payroll.totalDeductions')}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-red-500">
                      {formatCurrency(calculation.deductions.total)}
                    </p>
                    <div className="text-xs text-(--text-muted) mt-1">
                      {calculation.deductions.incomeTax > 0 && (
                        <span>
                          {t('payroll.incomeTax')}:{' '}
                          {formatCurrency(calculation.deductions.incomeTax)}
                        </span>
                      )}
                      {calculation.deductions.socialSecurity > 0 && (
                        <span className="ml-2">
                          {t('payroll.socialSecurity')}:{' '}
                          {formatCurrency(calculation.deductions.socialSecurity)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-(--text-muted)">{t('payroll.netSalary')}</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-500">
                      {formatCurrency(calculation.netSalary)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('payroll.breakdown')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-(--text-muted)">{t('payroll.baseSalary')}</span>
                      <span className="font-medium">{formatCurrency(calculation.baseSalary)}</span>
                    </div>
                    {calculation.bonuses > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-(--text-muted)">{t('payroll.bonuses')}</span>
                        <span className="font-medium text-emerald-500">
                          +{formatCurrency(calculation.bonuses)}
                        </span>
                      </div>
                    )}
                    {calculation.overtimePay > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-(--text-muted)">{t('payroll.overtimePay')}</span>
                        <span className="font-medium text-emerald-500">
                          +{formatCurrency(calculation.overtimePay)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-sm font-medium">
                      <span>{t('payroll.grossSalary')}</span>
                      <span>{formatCurrency(calculation.grossSalary)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-(--text-muted)">{t('payroll.incomeTax')}</span>
                      <span className="text-red-500">
                        -{formatCurrency(calculation.deductions.incomeTax)}
                      </span>
                    </div>
                    {calculation.deductions.socialSecurity > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-(--text-muted)">{t('payroll.socialSecurity')}</span>
                        <span className="text-red-500">
                          -{formatCurrency(calculation.deductions.socialSecurity)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-base font-bold">
                      <span>{t('payroll.netSalary')}</span>
                      <span className="text-blue-500">{formatCurrency(calculation.netSalary)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {country === 'russia' && calculation.employerContributions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t('payroll.taxInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-(--text-muted)">{t('payroll.effectiveTaxRate')}</span>
                        <span className="font-medium">
                          {(
                            (calculation.deductions.incomeTax / calculation.grossSalary) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-(--text-muted)">{t('payroll.totalCost')}</span>
                        <span className="font-medium">
                          {formatCurrency(calculation.totalCost || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-(--text-muted)">
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>{t('payroll.calculatorSubtitle')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
