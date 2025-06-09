export interface User {
  id: string;
  username: string;
  name: string;
  surname: string;
  role: 'company' | 'individual';
}

export interface Employee {
  id: string;
  name: string;
  surname: string;
  grossSalary: number;
  dailyEarnings: number;
  workingDays: number;
  companyId: string;
  createdAt: string;
}

export interface DeductionRates {
  tax: number;
  retirement: number;
  insurance: number;
}

export interface SalaryCalculation {
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  taxAmount: number;
  retirementAmount: number;
  insuranceAmount: number;
}

export interface CalculationHistory {
  id: string;
  userId: string;
  employeeId?: string;
  employeeName?: string;
  calculation: SalaryCalculation;
  deductionRates: DeductionRates;
  createdAt: string;
}

export type Theme = 'light' | 'dark';