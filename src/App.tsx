import React, { useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  Category,
  SavingsGoal,
  BudgetLimit,
  RecurringCost,
} from './types/finance';
import {
  DEFAULT_CATEGORIES,
  getInitialTransactions,
  INITIAL_SAVINGS_GOALS,
  INITIAL_BUDGET_LIMITS,
  INITIAL_RECURRING_COSTS,
} from './data/initialData';
import {
  calculateSummary,
  calculate503020,
  getCurrentMonthKey,
  getMonthLabel,
  formatCurrency,
} from './utils/financeCalculations';
import { OverviewTab } from './components/OverviewTab';
import { TransactionsTab } from './components/TransactionsTab';
import { PlanningTab } from './components/PlanningTab';
import { GoalsTab } from './components/GoalsTab';
import { AnalyticsDashboardTab } from './components/AnalyticsDashboardTab';
import { SubscriptionsTab } from './components/SubscriptionsTab';
import { TransactionModal } from './components/TransactionModal';
import { SettingsModal } from './components/SettingsModal';
import {
  Wallet,
  TrendingUp,
  Receipt,
  PiggyBank,
  Plus,
  Settings,
  Smartphone,
  Maximize2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  CalendarClock,
} from 'lucide-react';

const STORAGE_KEYS = {
  TRANSACTIONS: 'sobramais_transactions_v2',
  GOALS: 'sobramais_goals_v1',
  BUDGETS: 'sobramais_budgets_v1',
  RECURRING: 'sobramais_recurring_v1',
};

export default function App() {
  // Load state from localStorage or initialize with defaults
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 15) return parsed;
      }
    } catch (e) {
      console.error('Error loading transactions:', e);
    }
    return getInitialTransactions();
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading goals:', e);
    }
    return INITIAL_SAVINGS_GOALS;
  });

  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading budgets:', e);
    }
    return INITIAL_BUDGET_LIMITS;
  });

  const [recurringCosts, setRecurringCosts] = useState<RecurringCost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading recurring costs:', e);
    }
    return INITIAL_RECURRING_COSTS;
  });

  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(getCurrentMonthKey);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'transactions' | 'subscriptions' | 'analytics' | 'planning' | 'goals'
  >('overview');

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Desktop view toggle: Phone frame vs Expanded full-width
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(savingsGoals));
    } catch (e) {
      console.error('Failed to save goals', e);
    }
  }, [savingsGoals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgetLimits));
    } catch (e) {
      console.error('Failed to save budgets', e);
    }
  }, [budgetLimits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringCosts));
    } catch (e) {
      console.error('Failed to save recurring costs', e);
    }
  }, [recurringCosts]);

  // Calculations for current month
  const summary = useMemo(() => {
    return calculateSummary(transactions, currentMonthKey);
  }, [transactions, currentMonthKey]);

  const ruleStats = useMemo(() => {
    return calculate503020(transactions, currentMonthKey);
  }, [transactions, currentMonthKey]);

  const monthLabel = useMemo(() => {
    return getMonthLabel(currentMonthKey);
  }, [currentMonthKey]);

  // Handlers for transactions
  const handleSaveTransaction = (txData: Omit<Transaction, 'id'>, existingId?: string) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...txData, id: existingId } : t))
      );
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
    setEditingTransaction(null);
  };

  const handleSaveBatchTransactions = (batch: Array<Omit<Transaction, 'id'>>) => {
    const newItems: Transaction[] = batch.map((item, idx) => ({
      ...item,
      id: `tx-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
    }));
    setTransactions((prev) => [...newItems, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    );
  };

  // Handlers for Recurring Costs (Assinaturas & Custos Fixos)
  const handleAddRecurringCost = (costData: Omit<RecurringCost, 'id'>) => {
    const newCost: RecurringCost = {
      ...costData,
      id: `rec-${Date.now()}`,
    };
    setRecurringCosts((prev) => [...prev, newCost]);
  };

  const handleUpdateRecurringCost = (id: string, updates: Partial<RecurringCost>) => {
    setRecurringCosts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleDeleteRecurringCost = (id: string) => {
    setRecurringCosts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleLaunchRecurringToStatement = (cost: RecurringCost) => {
    const [year, month] = currentMonthKey.split('-');
    const dayStr = String(cost.dueDay).padStart(2, '0');
    const txDate = `${year}-${month}-${dayStr}`;

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: 'expense',
      amount: cost.amount,
      description: cost.name,
      categoryId: cost.categoryId,
      date: txDate,
      status: 'completed',
      bucket: cost.bucket,
      paymentMethod: cost.type === 'fixed_cost' ? 'boleto' : 'credit',
      isRecurring: true,
      subscriptionId: cost.id,
      notes: cost.notes ? `${cost.notes} · Lançamento Recorrente` : 'Lançamento Recorrente',
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  // Handlers for goals
  const handleAddGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const handleUpdateGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cofrinho?')) {
      setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleDepositToGoal = (goalId: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newAmount = Math.max(0, g.currentAmount + amount);
          return { ...g, currentAmount: newAmount };
        }
        return g;
      })
    );
  };

  // Handlers for Budget Limits
  const handleSaveBudgetLimit = (categoryId: string, limit: number) => {
    setBudgetLimits((prev) => {
      const exists = prev.find((b) => b.categoryId === categoryId);
      if (exists) {
        return prev.map((b) => (b.categoryId === categoryId ? { ...b, limit } : b));
      }
      return [...prev, { categoryId, limit }];
    });
  };

  // Month navigation
  const handlePrevMonth = () => {
    const [year, month] = currentMonthKey.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setCurrentMonthKey(`${newYear}-${newMonth}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonthKey.split('-').map(Number);
    const date = new Date(year, month, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setCurrentMonthKey(`${newYear}-${newMonth}`);
  };

  // Data management
  const handleResetToDemoData = () => {
    setTransactions(getInitialTransactions());
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setBudgetLimits(INITIAL_BUDGET_LIMITS);
    setRecurringCosts(INITIAL_RECURRING_COSTS);
    setCurrentMonthKey(getCurrentMonthKey());
  };

  const handleClearAllData = () => {
    setTransactions([]);
    setSavingsGoals([]);
    setBudgetLimits([]);
    setRecurringCosts([]);
  };

  const handleExportJSON = () => {
    const data = {
      transactions,
      savingsGoals,
      budgetLimits,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sobramais_backup_${currentMonthKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
      }
      if (Array.isArray(parsed.savingsGoals)) {
        setSavingsGoals(parsed.savingsGoals);
      }
      if (Array.isArray(parsed.budgetLimits)) {
        setBudgetLimits(parsed.budgetLimits);
      }
    } catch (e) {
      alert('Arquivo de backup inválido.');
    }
  };

  const handleExportCSV = () => {
    const monthTx = transactions.filter((t) => t.date.startsWith(currentMonthKey));
    if (monthTx.length === 0) {
      alert('Não há lançamentos no mês atual para exportar.');
      return;
    }

    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor (R$)', 'Status', 'Forma de Pagamento', 'Classificação', 'Notas'];
    const rows = monthTx.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId)?.name || t.categoryId;
      const typeLabel = t.type === 'income' ? 'Receita' : 'Despesa';
      const statusLabel = t.status === 'completed' ? 'Pago' : 'Pendente';
      const bucketLabel = t.bucket === 'necessity' ? 'Necessidade 50%' : t.bucket === 'wants' ? 'Desejo 30%' : 'Reserva 20%';
      return [
        t.date,
        typeLabel,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${cat}"`,
        t.amount.toFixed(2),
        statusLabel,
        t.paymentMethod,
        bucketLabel,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extrato_${currentMonthKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render actual app content
  const renderAppContent = () => (
    <div className="flex flex-col min-h-full bg-slate-950 text-slate-100">
      {/* Top Mobile App Bar (Compact 54px) */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
            <Wallet className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-white text-base tracking-tight font-display">
            Sobra<span className="text-emerald-400">Mais</span>
          </span>
        </div>

        {/* Month Selector Carousel in Top Bar */}
        <div className="flex items-center bg-slate-900 border border-slate-800/90 rounded-full px-2 py-1">
          <button
            onClick={handlePrevMonth}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white"
            title="Mês anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-semibold text-slate-200 capitalize px-2 tabular-nums">
            {monthLabel.split(' de ')[0]}
          </span>
          <button
            onClick={handleNextMonth}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white"
            title="Próximo mês"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Settings Action */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-9 h-9 rounded-xl hover:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            title="Ajustes e Dados"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 pt-4 pb-20 overflow-y-auto">
        {activeTab === 'overview' && (
          <OverviewTab
            summary={summary}
            ruleStats={ruleStats}
            recentTransactions={transactions.filter((t) => t.date.startsWith(currentMonthKey))}
            savingsGoals={savingsGoals}
            categories={categories}
            currentMonthLabel={monthLabel}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsTxModalOpen(true);
            }}
            onToggleStatus={handleToggleStatus}
            onGoToPlanning={() => setActiveTab('planning')}
            onGoToGoals={() => setActiveTab('goals')}
            onGoToTransactions={() => setActiveTab('transactions')}
            onGoToAnalytics={() => setActiveTab('analytics')}
            onDepositToGoal={handleDepositToGoal}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab
            transactions={transactions.filter((t) => t.date.startsWith(currentMonthKey))}
            categories={categories}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onToggleStatus={handleToggleStatus}
            onExportCSV={handleExportCSV}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionsTab
            recurringCosts={recurringCosts}
            categories={categories}
            currentMonthKey={currentMonthKey}
            transactions={transactions}
            onAddRecurringCost={handleAddRecurringCost}
            onUpdateRecurringCost={handleUpdateRecurringCost}
            onDeleteRecurringCost={handleDeleteRecurringCost}
            onLaunchToStatement={handleLaunchRecurringToStatement}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboardTab
            transactions={transactions}
            categories={categories}
            currentMonthKey={currentMonthKey}
          />
        )}

        {activeTab === 'planning' && (
          <PlanningTab
            summary={summary}
            ruleStats={ruleStats}
            transactions={transactions.filter((t) => t.date.startsWith(currentMonthKey))}
            categories={categories}
            budgetLimits={budgetLimits}
            onSaveBudgetLimit={handleSaveBudgetLimit}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
            onGoToGoals={() => setActiveTab('goals')}
            savingsGoals={savingsGoals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onDepositToGoal={handleDepositToGoal}
            initialSubTab="rule"
          />
        )}

        {activeTab === 'goals' && (
          <PlanningTab
            summary={summary}
            ruleStats={ruleStats}
            transactions={transactions.filter((t) => t.date.startsWith(currentMonthKey))}
            categories={categories}
            budgetLimits={budgetLimits}
            onSaveBudgetLimit={handleSaveBudgetLimit}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
            onGoToGoals={() => setActiveTab('goals')}
            savingsGoals={savingsGoals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onDepositToGoal={handleDepositToGoal}
            initialSubTab="goals"
          />
        )}
      </main>

      {/* Fixed Bottom Tab Navigation (Mobile Ergonomic Pattern) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 max-w-md mx-auto sm:rounded-b-3xl">
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {/* Tab 1: Início */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'overview' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Início</span>
          </button>

          {/* Tab 2: Extrato */}
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'transactions' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Extrato</span>
          </button>

          {/* Tab 3: Assinaturas & Fixos */}
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'subscriptions' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarClock className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Assinaturas</span>
          </button>

          {/* Tab 4: Dashboard Comparativo */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'analytics' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Dashboard</span>
          </button>

          {/* Tab 5: Planejamento */}
          <button
            onClick={() => setActiveTab('planning')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'planning' || activeTab === 'goals' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Planejar</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onSaveInstallments={handleSaveBatchTransactions}
        editingTransaction={editingTransaction}
        categories={categories}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentMonthKey={currentMonthKey}
        onChangeMonth={setCurrentMonthKey}
        onResetToDemoData={handleResetToDemoData}
        onClearAllData={handleClearAllData}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center antialiased">
      {/* Viewport Mode Switcher for Desktop */}
      <div className="hidden md:flex items-center justify-between w-full max-w-4xl px-6 py-3 border-b border-slate-900 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white font-display">
            SobraMais Mobile
          </span>
          <span className="text-[11px] text-slate-400">
            Aplicativo de Organização Financeira Pessoal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            {isPhoneFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Modo Tela Cheia</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Moldura de Smartphone</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container: either smartphone mockup or full responsive container */}
      <div className="w-full flex-1 flex items-center justify-center p-0 md:p-6">
        {isPhoneFrame ? (
          <div className="w-full max-w-md h-full md:h-[844px] md:max-h-[92vh] md:rounded-[44px] md:border-[10px] md:border-slate-800 md:ring-1 md:ring-slate-700/50 shadow-2xl overflow-hidden relative flex flex-col bg-slate-950">
            {/* Realistic iPhone Notch / Island on desktop */}
            <div className="hidden md:flex items-center justify-between px-7 pt-3 pb-1 bg-slate-950 select-none">
              <span className="text-[11px] font-bold text-slate-300">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-300">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* App screen viewport */}
            <div className="flex-1 overflow-hidden relative">
              {renderAppContent()}
            </div>

            {/* Bottom Home indicator */}
            <div className="hidden md:flex justify-center pb-2 pt-1 bg-slate-950">
              <div className="w-32 h-1 bg-slate-700 rounded-full" />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl min-h-[90vh] bg-slate-950 md:rounded-3xl md:border md:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {renderAppContent()}
          </div>
        )}
      </div>
    </div>
  );
}
