'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import EmployeeProfileDetail from '@/components/employees/EmployeeProfileDetail';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShieldLoader } from '@/components/ui/ShieldLoader';
import Link from 'next/link';
import { motion } from '@/lib/cssMotion';
import { useTranslation } from 'react-i18next';
import { useUserById } from '@/hooks/useUsers';

export default function EmployeeProfilePage() {
  const { t } = useTranslation();
  const params = useParams();
  const employeeId = params.id as string;

  const { data: employee, isLoading } = useUserById(employeeId);

  if (isLoading || !employee) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ShieldLoader size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-6 bg-(--background)/95 backdrop-blur supports-[backdrop-filter]:bg-(--background)/60 border-b border-(--border)">
        <Link href="/employees">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('employees.backToEmployees')}
          </Button>
        </Link>
      </div>
      <EmployeeProfileDetail employeeId={employeeId} />
    </motion.div>
  );
}
