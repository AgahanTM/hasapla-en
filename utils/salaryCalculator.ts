import { SalaryCalculation, DeductionRates } from '@/types';

export const defaultDeductionRates: DeductionRates = {
  tax: 10,
  retirement: 10,
  insurance: 5,
};

export function calculateSalary(
  grossSalary: number,
  deductionRates: DeductionRates = defaultDeductionRates
): SalaryCalculation {
  const taxAmount = (grossSalary * deductionRates.tax) / 100;
  const retirementAmount = (grossSalary * deductionRates.retirement) / 100;
  const insuranceAmount = (grossSalary * deductionRates.insurance) / 100;
  
  const totalDeductions = taxAmount + retirementAmount + insuranceAmount;
  const netSalary = grossSalary - totalDeductions;

  return {
    grossSalary,
    totalDeductions,
    netSalary,
    taxAmount,
    retirementAmount,
    insuranceAmount,
  };
}

export function calculateGrossFromDaily(dailyEarnings: number, workingDays: number): number {
  return dailyEarnings * workingDays;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}