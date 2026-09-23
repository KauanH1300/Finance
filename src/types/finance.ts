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
