import { Transaction, SavingsGoal, BudgetLimit, RecurringCost } from '../types/finance';

export const STORAGE_KEYS = {
  INITIALIZED: 'sobramais_initialized_v2',
  TRANSACTIONS: 'sobramais_transactions_v2',
  GOALS: 'sobramais_goals_v1',
  BUDGETS: 'sobramais_budgets_v1',
  RECURRING: 'sobramais_recurring_v1',
} as const;

/**
 * Checks whether this is the very first time the user has accessed the application.
 * Returns true ONLY if neither the initialized flag nor any existing data key is stored.
 */
export function isFirstVisit(): boolean {
  try {
    if (localStorage.getItem(STORAGE_KEYS.INITIALIZED) !== null) {
      return false;
    }
    const hasTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) !== null;
    const hasGoals = localStorage.getItem(STORAGE_KEYS.GOALS) !== null;
    const hasBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS) !== null;
    const hasRecurring = localStorage.getItem(STORAGE_KEYS.RECURRING) !== null;

    if (hasTx || hasGoals || hasBudgets || hasRecurring) {
      // Mark as initialized so subsequent runs recognize existing user
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      return false;
    }

    return true;
  } catch (e) {
    console.error('Error checking first visit in localStorage:', e);
    return false;
  }
}

/**
 * Safely parses an array from localStorage.
 * Returns the parsed array (even if empty []), or null if the key doesn't exist or is invalid.
 */
export function loadArrayFromStorage<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as T[];
      }
    }
  } catch (e) {
    console.error(`Error loading key "${key}" from localStorage:`, e);
  }
  return null;
}

/**
 * Safely saves data to localStorage as JSON.
 */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save key "${key}" to localStorage:`, e);
  }
}

/**
 * Loads transactions:
 * - If first visit: seeds initial demo data to localStorage and marks initialized.
 * - If not first visit: loads whatever is saved in localStorage (including empty []).
 */
export function getStoredTransactions(fallbackDemo: () => Transaction[]): Transaction[] {
  const isFirst = isFirstVisit();
  if (isFirst) {
    const demo = fallbackDemo();
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, demo);
    try {
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } catch {
      // Ignore
    }
    return demo;
  }

  const saved = loadArrayFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
  if (saved !== null) {
    return saved; // User's saved data (even if empty []!)
  }
  return []; // If key not set, remain empty
}

/**
 * Loads savings goals with first-visit seeding support.
 */
export function getStoredGoals(fallbackDemo: SavingsGoal[]): SavingsGoal[] {
  const isFirst = isFirstVisit();
  if (isFirst) {
    saveToStorage(STORAGE_KEYS.GOALS, fallbackDemo);
    try {
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } catch {
      // Ignore
    }
    return fallbackDemo;
  }

  const saved = loadArrayFromStorage<SavingsGoal>(STORAGE_KEYS.GOALS);
  if (saved !== null) {
    return saved;
  }
  return [];
}

/**
 * Loads budget limits with first-visit seeding support.
 */
export function getStoredBudgets(fallbackDemo: BudgetLimit[]): BudgetLimit[] {
  const isFirst = isFirstVisit();
  if (isFirst) {
    saveToStorage(STORAGE_KEYS.BUDGETS, fallbackDemo);
    try {
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } catch {
      // Ignore
    }
    return fallbackDemo;
  }

  const saved = loadArrayFromStorage<BudgetLimit>(STORAGE_KEYS.BUDGETS);
  if (saved !== null) {
    return saved;
  }
  return [];
}

/**
 * Loads recurring costs with first-visit seeding support.
 */
export function getStoredRecurring(fallbackDemo: RecurringCost[]): RecurringCost[] {
  const isFirst = isFirstVisit();
  if (isFirst) {
    saveToStorage(STORAGE_KEYS.RECURRING, fallbackDemo);
    try {
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } catch {
      // Ignore
    }
    return fallbackDemo;
  }

  const saved = loadArrayFromStorage<RecurringCost>(STORAGE_KEYS.RECURRING);
  if (saved !== null) {
    return saved;
  }
  return [];
}

/**
 * Clears all user data and keeps localStorage explicitly empty.
 * Sets initialized to true so the app remains empty on reload.
 */
export function clearAllStorageData(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  } catch (e) {
    console.error('Failed to clear storage data:', e);
  }
}

/**
 * Restores demo data in localStorage and marks as initialized.
 */
export function restoreDemoStorageData(
  demoTransactions: Transaction[],
  demoGoals: SavingsGoal[],
  demoBudgets: BudgetLimit[],
  demoRecurring: RecurringCost[]
): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(demoTransactions));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(demoGoals));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(demoBudgets));
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(demoRecurring));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  } catch (e) {
    console.error('Failed to restore demo data in storage:', e);
  }
}
