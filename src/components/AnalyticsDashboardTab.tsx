import React, { useState, useMemo, useEffect } from 'react';
import {
  Transaction,
  Category,
  ComparisonPeriod,
  MonthComparisonStats,
} from '../types/finance';
import {
  formatCurrency,
  calculatePeriodAnalytics,
  calculateMonthStats,
} from '../utils/financeCalculations';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Scale,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  DollarSign,
  PieChart,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowLeftRight,
} from 'lucide-react';

interface AnalyticsDashboardTabProps {
  transactions: Transaction[];
  categories: Category[];
  currentMonthKey: string;
}

export const AnalyticsDashboardTab: React.FC<AnalyticsDashboardTabProps> = ({
  transactions,
  categories,
  currentMonthKey,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<ComparisonPeriod>('semestre');

  // Multi-month analytics for the selected period
  const periodAnalytics = useMemo(() => {
    return calculatePeriodAnalytics(transactions, currentMonthKey, selectedPeriod);
  }, [transactions, currentMonthKey, selectedPeriod]);

  // List of all unique month keys present in transactions (sorted descending)
  const availableMonthKeys = useMemo(() => {
    const keys = new Set<string>();
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        keys.add(t.date.substring(0, 7));
      }
    });
    // Ensure current month is always present
    keys.add(currentMonthKey);
    return Array.from(keys).sort().reverse();
  }, [transactions, currentMonthKey]);

  // Default comparison months: Month A and Month B must be distinct
  const initialKeyA = availableMonthKeys[0] || currentMonthKey;
  const initialKeyB = availableMonthKeys.find((k) => k !== initialKeyA) || initialKeyA;

  const [monthKeyA, setMonthKeyA] = useState<string>(initialKeyA);
  const [monthKeyB, setMonthKeyB] = useState<string>(initialKeyB);

  // Synchronize if available months change and ensure monthKeyA !== monthKeyB
  useEffect(() => {
    if (monthKeyA === monthKeyB && availableMonthKeys.length > 1) {
      const alt = availableMonthKeys.find((k) => k !== monthKeyA);
      if (alt) setMonthKeyB(alt);
    }
  }, [monthKeyA, monthKeyB, availableMonthKeys]);

  const handleSelectMonthA = (newA: string) => {
    setMonthKeyA(newA);
    if (newA === monthKeyB) {
      const alt = availableMonthKeys.find((k) => k !== newA);
      if (alt) setMonthKeyB(alt);
    }
  };

  const handleSelectMonthB = (newB: string) => {
    setMonthKeyB(newB);
    if (newB === monthKeyA) {
      const alt = availableMonthKeys.find((k) => k !== newB);
      if (alt) setMonthKeyA(alt);
    }
  };

  const handleSwapMonths = () => {
    if (monthKeyA !== monthKeyB) {
      const temp = monthKeyA;
      setMonthKeyA(monthKeyB);
      setMonthKeyB(temp);
    }
  };

  // Compute stats for Month A and Month B
  const statsA = useMemo(
    () => calculateMonthStats(transactions, monthKeyA),
    [transactions, monthKeyA]
  );
  const statsB = useMemo(
    () => calculateMonthStats(transactions, monthKeyB),
    [transactions, monthKeyB]
  );

  // Category map for easy lookups
  const categoryMap = useMemo(() => {
    return new Map<string, Category>(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Max expense / income across period months for relative bar scaling
  const maxPeriodValue = useMemo(() => {
    let max = 1;
    periodAnalytics.months.forEach((m) => {
      if (m.totalIncome > max) max = m.totalIncome;
      if (m.totalExpense > max) max = m.totalExpense;
    });
    return max;
  }, [periodAnalytics]);

  // Categories comparison between A and B
  const categoryComparison = useMemo(() => {
    const allCatIds = new Set([
      ...Object.keys(statsA.categoryBreakdown),
      ...Object.keys(statsB.categoryBreakdown),
    ]);

    const items = Array.from(allCatIds).map((catId) => {
      const cat = categoryMap.get(catId);
      const spentA = statsA.categoryBreakdown[catId] || 0;
      const spentB = statsB.categoryBreakdown[catId] || 0;
      const diff = spentA - spentB;
      const percentDiff = spentB > 0 ? ((diff / spentB) * 100) : spentA > 0 ? 100 : 0;

      return {
        id: catId,
        name: cat ? cat.name : catId,
        color: cat ? cat.color : '#94a3b8',
        spentA,
        spentB,
        diff,
        percentDiff,
      };
    });

    // Sort by highest expense in Month A + Month B combined
    return items.sort((a, b) => (b.spentA + b.spentB) - (a.spentA + a.spentB));
  }, [statsA, statsB, categoryMap]);

  // Comparison differences
  const diffIncome = statsA.totalIncome - statsB.totalIncome;
  const diffIncomePercent = statsB.totalIncome > 0 ? (diffIncome / statsB.totalIncome) * 100 : 0;

  const diffExpense = statsA.totalExpense - statsB.totalExpense;
  const diffExpensePercent = statsB.totalExpense > 0 ? (diffExpense / statsB.totalExpense) * 100 : 0;

  const diffSobra = statsA.sobra - statsB.sobra;
  const diffSobraPercent = statsB.sobra !== 0 ? (diffSobra / Math.abs(statsB.sobra)) * 100 : 0;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Tab Header & Period Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Painel Comparativo Multimeses</span>
            </div>
            <h2 className="text-xl font-black text-white font-display">Dashboard de Histórico & Sobra</h2>
            <p className="text-xs text-slate-400">
              Analise a evolução das suas finanças, descubra em qual mês guardou mais e compare períodos lado a lado.
            </p>
          </div>
        </div>

        {/* Period Buttons (Bimestre, Trimestre, Semestre, Ano) */}
        <div className="grid grid-cols-4 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 gap-1">
          {(
            [
              { key: 'bimestre', label: 'Bimestre', desc: '2 meses' },
              { key: 'trimestre', label: 'Trimestre', desc: '3 meses' },
              { key: 'semestre', label: 'Semestre', desc: '6 meses' },
              { key: 'ano', label: 'Ano', desc: '12 meses' },
            ] as const
          ).map((p) => {
            const isActive = selectedPeriod === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelectedPeriod(p.key)}
                className={`py-2 px-1 rounded-xl text-center transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="text-xs sm:text-sm font-bold">{p.label}</div>
                <div className={`text-[10px] ${isActive ? 'text-slate-900/80 font-medium' : 'text-slate-500'}`}>
                  {p.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Highlights / Best & Worst Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Mês que mais guardou */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              Mês que Mais Guardou
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full">
              Recorde
            </span>
          </div>

          <div className="text-lg font-black text-white font-display">
            {periodAnalytics.bestSavingsMonth?.monthLabel || 'Nenhum'}
          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400 font-display">
              {formatCurrency(periodAnalytics.bestSavingsMonth?.sobra || 0)}
            </span>
            <span className="text-xs text-slate-400">de sobra</span>
          </div>

          <div className="mt-2 text-xs text-emerald-300/90 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Taxa de poupança: <strong>{periodAnalytics.bestSavingsMonth?.savingsRate || 0}%</strong> da renda</span>
          </div>
        </div>

        {/* Card 2: Mês que mais gastou */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 border border-rose-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              Mês que Mais Gastou
            </span>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 font-extrabold px-2 py-0.5 rounded-full">
              Pico de Gastos
            </span>
          </div>

          <div className="text-lg font-black text-white font-display">
            {periodAnalytics.highestSpendingMonth?.monthLabel || 'Nenhum'}
          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-400 font-display">
              {formatCurrency(periodAnalytics.highestSpendingMonth?.totalExpense || 0)}
            </span>
            <span className="text-xs text-slate-400">em saídas</span>
          </div>

          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span>Sobra restante no mês: </span>
            <strong className={(periodAnalytics.highestSpendingMonth?.sobra || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {formatCurrency(periodAnalytics.highestSpendingMonth?.sobra || 0)}
            </strong>
          </div>
        </div>

        {/* Card 3: Total guardado no período */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Sobra Acumulada no {selectedPeriod.toUpperCase()}
            </span>
          </div>

          <div className="text-2xl font-black text-white font-display mt-2">
            {formatCurrency(periodAnalytics.totalSobraPeriod)}
          </div>

          <div className="mt-2 text-xs text-slate-400 space-y-0.5">
            <div>Média mensal poupada: <strong className="text-emerald-400">{formatCurrency(periodAnalytics.averageMonthlySobra)}</strong></div>
            <div>Taxa média de poupança: <strong className="text-white">{periodAnalytics.averageSavingsRate}%</strong></div>
          </div>
        </div>

        {/* Card 4: Faturamento / Entradas no período */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Total de Receitas no Período
            </span>
          </div>

          <div className="text-2xl font-black text-white font-display mt-2">
            {formatCurrency(periodAnalytics.totalIncomePeriod)}
          </div>

          <div className="mt-2 text-xs text-slate-400 space-y-0.5">
            <div>Média mensal de renda: <strong className="text-white">{formatCurrency(periodAnalytics.averageMonthlyIncome)}</strong></div>
            <div>Mês com maior receita: <strong className="text-blue-400">{periodAnalytics.highestIncomeMonth?.shortLabel || '-'}</strong></div>
          </div>
        </div>
      </div>

      {/* Visual Evolution Chart / Bar Comparison of each Month */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Evolução Mensal: Receitas vs Despesas vs Sobra
            </h3>
            <p className="text-xs text-slate-400">
              Veja a proporção de cada mês no período selecionado ({selectedPeriod})
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              Receita
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              Despesa
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              Sobra
            </span>
          </div>
        </div>

        {/* Bars for each month */}
        <div className="space-y-4 pt-1">
          {periodAnalytics.months.map((m) => {
            const incomePercent = Math.min(100, Math.round((m.totalIncome / maxPeriodValue) * 100));
            const expensePercent = Math.min(100, Math.round((m.totalExpense / maxPeriodValue) * 100));
            const isBest = periodAnalytics.bestSavingsMonth?.monthKey === m.monthKey && m.sobra > 0;
            const isHighestExpense = periodAnalytics.highestSpendingMonth?.monthKey === m.monthKey;

            return (
              <div
                key={m.monthKey}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{m.monthLabel}</span>
                    {isBest && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-400" />
                        Maior Sobra
                      </span>
                    )}
                    {isHighestExpense && !isBest && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-400" />
                        Mais Gastou
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">Sobra: </span>
                      <span
                        className={`text-sm font-black font-display ${
                          m.sobra >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatCurrency(m.sobra)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMonthKeyA(m.monthKey);
                        // smooth scroll down to comparison
                        const el = document.getElementById('raio-x-comparador');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-colors"
                      title="Comparar este mês"
                    >
                      Comparar
                    </button>
                  </div>
                </div>

                {/* Progress Visual Bars */}
                <div className="space-y-1.5">
                  {/* Income bar */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span className="text-blue-300">Entradas</span>
                      <span className="font-semibold text-slate-200">{formatCurrency(m.totalIncome)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${incomePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Expense bar */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span className="text-rose-300">Saídas</span>
                      <span className="font-semibold text-slate-200">{formatCurrency(m.totalExpense)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${expensePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer pills: savings rate & transactions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    Taxa guardada: <strong className="text-emerald-400">{m.savingsRate}%</strong>
                  </span>
                  <span>{m.transactionsCount} lançamentos</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RAIO-X COMPARATIVO: Compare Two Specific Months Side-by-Side */}
      <div id="raio-x-comparador" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
        <div className="border-b border-slate-800/80 pb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-1.5">
            <Scale className="w-3.5 h-3.5" />
            <span>Raio-X Comparativo</span>
          </div>
          <h3 className="text-lg font-black text-white font-display">Comparar Dois Meses Lado a Lado</h3>
          <p className="text-xs text-slate-400">
            Escolha dois meses para confrontar receitas, despesas, sobra e entender exatamente onde o dinheiro foi mais gasto.
          </p>
        </div>

        {/* Month Selectors (Month A vs Month B) */}
        {availableMonthKeys.length < 2 ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            Você possui lançamentos em apenas 1 mês. Registre transações em outros meses para comparar a evolução financeira!
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
              {/* Selector Month A */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-blue-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center font-black text-[10px]">A</span>
                    Primeiro Mês (Mês A):
                  </label>
                  <span className="text-[10px] text-slate-400">Referência</span>
                </div>
                <select
                  value={monthKeyA}
                  onChange={(e) => handleSelectMonthA(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold outline-none focus:border-blue-500"
                >
                  {availableMonthKeys.map((k) => {
                    const isSelectedInB = k === monthKeyB;
                    return (
                      <option key={`a-${k}`} value={k} disabled={isSelectedInB}>
                        {calculateMonthStats(transactions, k).monthLabel} {isSelectedInB ? '(selecionado no Mês B)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Selector Month B */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px]">B</span>
                    Segundo Mês (Mês B):
                  </label>
                  <span className="text-[10px] text-slate-400">Comparação</span>
                </div>
                <select
                  value={monthKeyB}
                  onChange={(e) => handleSelectMonthB(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold outline-none focus:border-amber-500"
                >
                  {availableMonthKeys.map((k) => {
                    const isSelectedInA = k === monthKeyA;
                    return (
                      <option key={`b-${k}`} value={k} disabled={isSelectedInA}>
                        {calculateMonthStats(transactions, k).monthLabel} {isSelectedInA ? '(selecionado no Mês A)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Quick Swap Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwapMonths}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
                title="Inverter ordem dos meses na comparação"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Inverter Mês A ⇄ Mês B</span>
              </button>
            </div>
          </div>
        )}

        {/* Verdict / Key takeaway banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Diagnóstico do Confronto ({statsA.shortLabel} vs {statsB.shortLabel})
            </h4>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed space-y-1">
            {statsA.sobra > statsB.sobra ? (
              <p>
                🎯 <strong>Você guardou mais em {statsA.shortLabel}!</strong> A sobra foi de{' '}
                <span className="text-emerald-400 font-bold">{formatCurrency(statsA.sobra)}</span> contra{' '}
                <span className="text-slate-400 font-bold">{formatCurrency(statsB.sobra)}</span> em {statsB.shortLabel}{' '}
                (uma diferença positiva de <span className="text-emerald-400 font-bold">+{formatCurrency(diffSobra)}</span>).
              </p>
            ) : statsB.sobra > statsA.sobra ? (
              <p>
                🎯 <strong>Você guardou mais em {statsB.shortLabel}!</strong> A sobra foi de{' '}
                <span className="text-emerald-400 font-bold">{formatCurrency(statsB.sobra)}</span> contra{' '}
                <span className="text-slate-400 font-bold">{formatCurrency(statsA.sobra)}</span> em {statsA.shortLabel}{' '}
                (diferença de <span className="text-amber-400 font-bold">+{formatCurrency(Math.abs(diffSobra))}</span> a favor de {statsB.shortLabel}).
              </p>
            ) : (
              <p>Ambos os meses tiveram a mesma sobra exata de {formatCurrency(statsA.sobra)}.</p>
            )}

            {statsA.totalExpense > statsB.totalExpense ? (
              <p className="text-slate-400">
                💸 <strong>Você gastou mais em {statsA.shortLabel}:</strong> Gastou{' '}
                <span className="text-rose-400 font-bold">+{formatCurrency(diffExpense)}</span> (+{Math.abs(Math.round(diffExpensePercent))}%) a mais do que em {statsB.shortLabel}.
              </p>
            ) : statsB.totalExpense > statsA.totalExpense ? (
              <p className="text-slate-400">
                💸 <strong>Você gastou mais em {statsB.shortLabel}:</strong> Gastou{' '}
                <span className="text-rose-400 font-bold">+{formatCurrency(Math.abs(diffExpense))}</span> a mais em {statsB.shortLabel}.
              </p>
            ) : null}
          </div>
        </div>

        {/* Side-by-side metric tables */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Receitas */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">Total de Entradas</span>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-blue-400 font-bold">A ({statsA.shortLabel}):</span>
                <span className="font-extrabold text-white">{formatCurrency(statsA.totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-bold">B ({statsB.shortLabel}):</span>
                <span className="font-extrabold text-white">{formatCurrency(statsB.totalIncome)}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Diferença (A - B):</span>
              <span className={`font-bold ${diffIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {diffIncome >= 0 ? '+' : ''}{formatCurrency(diffIncome)}
              </span>
            </div>
          </div>

          {/* Despesas */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">Total de Saídas</span>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-blue-400 font-bold">A ({statsA.shortLabel}):</span>
                <span className="font-extrabold text-white">{formatCurrency(statsA.totalExpense)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-bold">B ({statsB.shortLabel}):</span>
                <span className="font-extrabold text-white">{formatCurrency(statsB.totalExpense)}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Diferença (A - B):</span>
              <span className={`font-bold ${diffExpense <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {diffExpense >= 0 ? '+' : ''}{formatCurrency(diffExpense)}
              </span>
            </div>
          </div>

          {/* Sobra Líquida */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-2">
            <span className="text-xs font-semibold text-emerald-400 block">Sobra Líquida (Guardado)</span>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-blue-400 font-bold">A ({statsA.shortLabel}):</span>
                <span className={`font-extrabold ${statsA.sobra >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(statsA.sobra)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-bold">B ({statsB.shortLabel}):</span>
                <span className={`font-extrabold ${statsB.sobra >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(statsB.sobra)}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Diferença (A - B):</span>
              <span className={`font-bold ${diffSobra >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {diffSobra >= 0 ? '+' : ''}{formatCurrency(diffSobra)}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Category-by-Category Shift: Where did you spend more? */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-emerald-400" />
              Onde Mais Gastou: Comparativo por Categoria
            </h4>
            <span className="text-[10px] text-slate-500">Valores em {statsA.shortLabel} vs {statsB.shortLabel}</span>
          </div>

          <div className="space-y-2">
            {categoryComparison.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 text-center">Nenhuma despesa para comparar nestes meses.</p>
            ) : (
              categoryComparison.map((cat) => {
                const spentMoreInA = cat.diff > 0;
                const spentLessInA = cat.diff < 0;

                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-bold text-white">{cat.name}</span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                      {/* Month A spend */}
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-blue-400 block font-semibold">A: {statsA.shortLabel}</span>
                        <span className="font-bold text-slate-200">{formatCurrency(cat.spentA)}</span>
                      </div>

                      {/* Month B spend */}
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-amber-400 block font-semibold">B: {statsB.shortLabel}</span>
                        <span className="font-bold text-slate-200">{formatCurrency(cat.spentB)}</span>
                      </div>

                      {/* Difference Badge */}
                      <div className="min-w-[90px] text-right">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            spentMoreInA
                              ? 'bg-rose-500/15 text-rose-300'
                              : spentLessInA
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {spentMoreInA ? (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-rose-400" />
                              +{formatCurrency(cat.diff)}
                            </>
                          ) : spentLessInA ? (
                            <>
                              <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                              {formatCurrency(cat.diff)}
                            </>
                          ) : (
                            'Igual'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
