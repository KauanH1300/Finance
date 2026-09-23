export type TransactionType = 'income' | 'expense';

export type PlanBucket = 'necessity' | 'wants' | 'savings';

export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash' | 'transfer' | 'boleto';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  bucket: PlanBucket;
  iconName: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'pending';
  bucket: PlanBucket;
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
  installmentId?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  installmentTotalAmount?: number;
  subscriptionId?: string;
}

export type RecurrenceType = 'subscription' | 'fixed_cost';
export type BillingCycle = 'monthly' | 'yearly';

export interface RecurringCost {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1 to 31
  type: RecurrenceType; // 'subscription' (Netflix, Spotify, apps) vs 'fixed_cost' (Aluguel, Luz, Internet)
  categoryId: string;
  bucket: PlanBucket;
  billingCycle: BillingCycle;
  isActive: boolean;
  notes?: string;
  iconName?: string;
  color?: string;
  serviceBrand?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  categoryIcon: string;
  color: string;
  deadline?: string;
  monthlyDeposit?: number;
}

export interface BudgetLimit {
  categoryId: string;
  limit: number;
}

export interface MonthSummary {
  totalIncome: number;
  totalExpense: number;
  completedIncome: number;
  completedExpense: number;
  pendingExpense: number;
  pendingIncome: number;
  currentBalance: number; // completedIncome - completedExpense
  projectedLeftover: number; // totalIncome - totalExpense (quanto vai sobrar)
  daysRemainingInMonth: number;
  dailySafeSpend: number; // leftover / daysRemaining
  savingsRate: number; // percent of income saved
}

export interface Rule503020Stats {
  incomeBase: number;
  necessities: {
    actual: number;
    recommended: number;
    percent: number;
    status: 'optimal' | 'warning' | 'danger';
  };
  wants: {
    actual: number;
    recommended: number;
    percent: number;
    status: 'optimal' | 'warning' | 'danger';
  };
  savings: {
    actual: number;
    recommended: number;
    percent: number;
    status: 'optimal' | 'warning' | 'danger';
  };
}

export type ComparisonPeriod = 'bimestre' | 'trimestre' | 'semestre' | 'ano';

export interface MonthComparisonStats {
  monthKey: string; // YYYY-MM
  monthLabel: string; // "setembro de 2026"
  shortLabel: string; // "Set/26"
  totalIncome: number;
  totalExpense: number;
  sobra: number;
  savingsRate: number; // %
  categoryBreakdown: Record<string, number>;
  transactionsCount: number;
}

export interface PeriodAnalyticsSummary {
  period: ComparisonPeriod;
  months: MonthComparisonStats[];
  totalIncomePeriod: number;
  totalExpensePeriod: number;
  totalSobraPeriod: number;
  averageMonthlyIncome: number;
  averageMonthlyExpense: number;
  averageMonthlySobra: number;
  averageSavingsRate: number;
  bestSavingsMonth: MonthComparisonStats | null;
  highestSpendingMonth: MonthComparisonStats | null;
  highestIncomeMonth: MonthComparisonStats | null;
  worstSavingsMonth: MonthComparisonStats | null;
}
