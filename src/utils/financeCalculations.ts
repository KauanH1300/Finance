import { Transaction, MonthSummary, Rule503020Stats, Category } from '../types/finance';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).replace('.', '');
}

export function getMonthLabel(monthKey: string): string {
  // monthKey is YYYY-MM
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getDaysRemainingInMonth(monthKey: string): number {
  const now = new Date();
  const currentKey = getCurrentMonthKey();
  
  const [year, month] = monthKey.split('-').map(Number);
  const lastDayOfMonth = new Date(year, month, 0).getDate();

  if (monthKey === currentKey) {
    const currentDay = now.getDate();
    return Math.max(1, lastDayOfMonth - currentDay);
  }
  
  if (monthKey > currentKey) {
    return lastDayOfMonth;
  }
  
  return 0; // Past month
}

export function calculateSummary(transactions: Transaction[], monthKey: string): MonthSummary {
  const monthTransactions = transactions.filter((t) => t.date.startsWith(monthKey));

  let totalIncome = 0;
  let totalExpense = 0;
  let completedIncome = 0;
  let completedExpense = 0;
  let pendingIncome = 0;
  let pendingExpense = 0;

  for (const t of monthTransactions) {
    if (t.type === 'income') {
      totalIncome += t.amount;
      if (t.status === 'completed') {
        completedIncome += t.amount;
      } else {
        pendingIncome += t.amount;
      }
    } else {
      totalExpense += t.amount;
      if (t.status === 'completed') {
        completedExpense += t.amount;
      } else {
        pendingExpense += t.amount;
      }
    }
  }

  const currentBalance = completedIncome - completedExpense;
  const projectedLeftover = totalIncome - totalExpense;
  const daysRemainingInMonth = getDaysRemainingInMonth(monthKey);
  
  // Safe daily spend: if projected leftover > 0 and days remaining > 0, how much can be spent per day
  const dailySafeSpend = daysRemainingInMonth > 0 ? Math.max(0, projectedLeftover / daysRemainingInMonth) : 0;
  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  return {
    totalIncome,
    totalExpense,
    completedIncome,
    completedExpense,
    pendingIncome,
    pendingExpense,
    currentBalance,
    projectedLeftover,
    daysRemainingInMonth,
    dailySafeSpend,
    savingsRate,
  };
}

export function calculate503020(transactions: Transaction[], monthKey: string): Rule503020Stats {
  const monthTransactions = transactions.filter((t) => t.date.startsWith(monthKey));

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // If no income this month, use 0 base
  const baseIncome = Math.max(totalIncome, 1);

  let necessityTotal = 0;
  let wantsTotal = 0;
  let savingsAporteTotal = 0;

  for (const t of monthTransactions) {
    if (t.type === 'expense') {
      if (t.bucket === 'necessity') {
        necessityTotal += t.amount;
      } else if (t.bucket === 'wants') {
        wantsTotal += t.amount;
      } else if (t.bucket === 'savings') {
        savingsAporteTotal += t.amount;
      }
    }
  }

  // Also include the projected leftover as savings capability if positive
  const netLeftover = totalIncome - (necessityTotal + wantsTotal + savingsAporteTotal);
  const effectiveSavings = savingsAporteTotal + Math.max(0, netLeftover);

  const necPercent = (necessityTotal / baseIncome) * 100;
  const wantsPercent = (wantsTotal / baseIncome) * 100;
  const savPercent = (effectiveSavings / baseIncome) * 100;

  return {
    incomeBase: totalIncome,
    necessities: {
      actual: necessityTotal,
      recommended: totalIncome * 0.5,
      percent: Math.round(necPercent),
      status: necPercent <= 50 ? 'optimal' : necPercent <= 60 ? 'warning' : 'danger',
    },
    wants: {
      actual: wantsTotal,
      recommended: totalIncome * 0.3,
      percent: Math.round(wantsPercent),
      status: wantsPercent <= 30 ? 'optimal' : wantsPercent <= 40 ? 'warning' : 'danger',
    },
    savings: {
      actual: effectiveSavings,
      recommended: totalIncome * 0.2,
      percent: Math.round(savPercent),
      status: savPercent >= 20 ? 'optimal' : savPercent >= 10 ? 'warning' : 'danger',
    },
  };
}

export interface FinancialTip {
  id: string;
  type: 'success' | 'warning' | 'tip';
  title: string;
  message: string;
  actionText?: string;
}

export function generateFinancialTips(summary: MonthSummary, ruleStats: Rule503020Stats): FinancialTip[] {
  const tips: FinancialTip[] = [];

  // Leftover analysis
  if (summary.projectedLeftover > 0) {
    tips.push({
      id: 'tip-leftover-pos',
      type: 'success',
      title: `Previsão de Sobra: ${formatCurrency(summary.projectedLeftover)}`,
      message: `Você terminará o mês no verde! Você pode guardar essa sobra de ${formatCurrency(summary.projectedLeftover)} no seu cofrinho de emergência ou investimentos.`,
      actionText: 'Guardar no Cofrinho',
    });
  } else if (summary.projectedLeftover < 0) {
    tips.push({
      id: 'tip-leftover-neg',
      type: 'warning',
      title: 'Atenção: Saldo Projetado Negativo',
      message: `Seus gastos superam suas receitas em ${formatCurrency(Math.abs(summary.projectedLeftover))}. Tente cortar ou adiar compras supérfluas este mês para evitar dívidas no cartão.`,
    });
  }

  // Daily budget check
  if (summary.daysRemainingInMonth > 0 && summary.projectedLeftover > 0) {
    tips.push({
      id: 'tip-daily',
      type: 'tip',
      title: `Teto diário seguro: ${formatCurrency(summary.dailySafeSpend)}/dia`,
      message: `Faltam ${summary.daysRemainingInMonth} dias para o fim do mês. Mantendo seus gastos abaixo desse valor por dia, você garante a sobra estimada.`,
    });
  }

  // 50-30-20 alerts
  if (ruleStats.necessities.percent > 55) {
    tips.push({
      id: 'tip-nec-high',
      type: 'warning',
      title: 'Custos Fixos Altos (Necessidades)',
      message: `Suas contas essenciais estão consumindo ${ruleStats.necessities.percent}% da renda (o ideal é até 50%). Renegocie planos de internet, energia ou pesquise preços de mercado.`,
    });
  }

  if (ruleStats.wants.percent > 35) {
    tips.push({
      id: 'tip-wants-high',
      type: 'warning',
      title: 'Gastos com Desejos & Lazer Elevados',
      message: `Você já comprometeu ${ruleStats.wants.percent}% em lazer/estilo de vida (o teto recomendado é 30%). Fique de olho em delivery e compras por impulso.`,
    });
  }

  if (ruleStats.savings.percent >= 20) {
    tips.push({
      id: 'tip-savings-high',
      type: 'success',
      title: 'Meta de Poupança Atingida! 🎯',
      message: `Parabéns! Sua taxa de economia e sobras está em ${ruleStats.savings.percent}%, superando a meta dos 20% da regra de ouro financeira.`,
    });
  }

  return tips;
}
