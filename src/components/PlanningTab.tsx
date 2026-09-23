import React, { useState } from 'react';
import {
  Transaction,
  MonthSummary,
  Rule503020Stats,
  Category,
  BudgetLimit,
} from '../types/finance';
import { formatCurrency } from '../utils/financeCalculations';
import { CategoryIcon } from './CategoryIcon';
import {
  TrendingUp,
  Sparkles,
  PieChart,
  Target,
  ShieldCheck,
  Coffee,
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  Calculator,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface PlanningTabProps {
  summary: MonthSummary;
  ruleStats: Rule503020Stats;
  transactions: Transaction[];
  categories: Category[];
  budgetLimits: BudgetLimit[];
  onSaveBudgetLimit: (categoryId: string, limit: number) => void;
  onOpenNewTransaction: () => void;
  onGoToGoals: () => void;
}

export const PlanningTab: React.FC<PlanningTabProps> = ({
  summary,
  ruleStats,
  transactions,
  categories,
  budgetLimits,
  onSaveBudgetLimit,
  onOpenNewTransaction,
  onGoToGoals,
}) => {
  const [activeBucketDetails, setActiveBucketDetails] = useState<'necessity' | 'wants' | 'savings' | null>(null);
  const [editingBudgetCat, setEditingBudgetCat] = useState<string | null>(null);
  const [budgetLimitInput, setBudgetLimitInput] = useState<string>('');

  // Compound Interest Projection for the leftover
  const monthlySobra = Math.max(0, summary.projectedLeftover);
  const annualRate = 0.105; // 10.5% a.a. (aprox 100% CDI no Brasil)
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

  const calculateFutureValue = (months: number, monthlyDeposit: number) => {
    let balance = 0;
    for (let i = 0; i < months; i++) {
      balance = (balance + monthlyDeposit) * (1 + monthlyRate);
    }
    return balance;
  };

  const calculateSimpleSavings = (months: number, monthlyDeposit: number) => {
    return months * monthlyDeposit;
  };

  const proj6mInvest = calculateFutureValue(6, monthlySobra);
  const proj6mSimple = calculateSimpleSavings(6, monthlySobra);

  const proj12mInvest = calculateFutureValue(12, monthlySobra);
  const proj12mSimple = calculateSimpleSavings(12, monthlySobra);

  const proj36mInvest = calculateFutureValue(36, monthlySobra);
  const proj36mSimple = calculateSimpleSavings(36, monthlySobra);

  // Group expenses by category to compare with budget limits
  const categorySpending = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const limitObj = budgetLimits.find((b) => b.categoryId === cat.id);
      const limit = limitObj ? limitObj.limit : 0;
      const percent = limit > 0 ? Math.min(150, Math.round((spent / limit) * 100)) : 0;

      return {
        cat,
        spent,
        limit,
        percent,
      };
    })
    .filter((item) => item.spent > 0 || item.limit > 0);

  const handleOpenEditBudget = (catId: string, currentLimit: number) => {
    setEditingBudgetCat(catId);
    setBudgetLimitInput(currentLimit > 0 ? currentLimit.toString() : '');
  };

  const handleSaveBudget = (catId: string) => {
    const val = parseFloat(budgetLimitInput.replace(',', '.'));
    onSaveBudgetLimit(catId, isNaN(val) ? 0 : val);
    setEditingBudgetCat(null);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
          Organização Inteligente
        </span>
        <h1 className="text-2xl font-black text-white font-display">
          Planejamento Financeiro
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          A regra clássica 50-30-20 ajustada para sua renda real e controle de sobras.
        </p>
      </div>

      {/* 50-30-20 Interactive Pillars */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">Diagnóstico 50 / 30 / 20</h2>
              <p className="text-[11px] text-slate-400">
                Base calculada na renda de {formatCurrency(ruleStats.incomeBase)}
              </p>
            </div>
          </div>
        </div>

        {/* 1. Necessidades (50%) */}
        <div
          onClick={() => setActiveBucketDetails(activeBucketDetails === 'necessity' ? null : 'necessity')}
          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white">50% Gastos Essenciais</span>
                <span className="text-[10px] text-slate-400 block">Moradia, supermercado, contas, saúde</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold ${
                ruleStats.necessities.percent <= 50 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {ruleStats.necessities.percent}% da renda
              </span>
              <span className="text-[10px] text-slate-500 block">Meta: até 50%</span>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                ruleStats.necessities.percent <= 50 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, ruleStats.necessities.percent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 tabular-nums">
            <span>Gasto Atual: {formatCurrency(ruleStats.necessities.actual)}</span>
            <span>Teto Recomendado: {formatCurrency(ruleStats.necessities.recommended)}</span>
          </div>

          {activeBucketDetails === 'necessity' && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 animate-in fade-in duration-150">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Itens inclusos neste pilar:</p>
              {transactions
                .filter((t) => t.type === 'expense' && t.bucket === 'necessity')
                .map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs py-1 text-slate-300">
                    <span className="truncate pr-2">{t.description}</span>
                    <span className="font-semibold text-white tabular-nums">{formatCurrency(t.amount)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 2. Desejos & Lazer (30%) */}
        <div
          onClick={() => setActiveBucketDetails(activeBucketDetails === 'wants' ? null : 'wants')}
          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white">30% Estilo de Vida & Desejos</span>
                <span className="text-[10px] text-slate-400 block">Lazer, restaurantes, compras, streaming</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold ${
                ruleStats.wants.percent <= 30 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {ruleStats.wants.percent}% da renda
              </span>
              <span className="text-[10px] text-slate-500 block">Meta: até 30%</span>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                ruleStats.wants.percent <= 30 ? 'bg-purple-400' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, ruleStats.wants.percent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 tabular-nums">
            <span>Gasto Atual: {formatCurrency(ruleStats.wants.actual)}</span>
            <span>Teto Recomendado: {formatCurrency(ruleStats.wants.recommended)}</span>
          </div>

          {activeBucketDetails === 'wants' && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 animate-in fade-in duration-150">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Itens inclusos neste pilar:</p>
              {transactions
                .filter((t) => t.type === 'expense' && t.bucket === 'wants')
                .map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs py-1 text-slate-300">
                    <span className="truncate pr-2">{t.description}</span>
                    <span className="font-semibold text-white tabular-nums">{formatCurrency(t.amount)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 3. Futuro, Reserva & Sobra (20%) */}
        <div
          onClick={() => setActiveBucketDetails(activeBucketDetails === 'savings' ? null : 'savings')}
          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white">20% Futuro, Reserva & Sobra</span>
                <span className="text-[10px] text-slate-400 block">Reserva de emergência, investimentos, quitação</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold ${
                ruleStats.savings.percent >= 20 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {ruleStats.savings.percent}% da renda
              </span>
              <span className="text-[10px] text-slate-500 block">Meta: min. 20%</span>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, ruleStats.savings.percent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 tabular-nums">
            <span>Sobra + Aportes: {formatCurrency(ruleStats.savings.actual)}</span>
            <span>Meta Mínima: {formatCurrency(ruleStats.savings.recommended)}</span>
          </div>

          {activeBucketDetails === 'savings' && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 animate-in fade-in duration-150">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Itens inclusos neste pilar:</p>
              {transactions
                .filter((t) => t.type === 'expense' && t.bucket === 'savings')
                .map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs py-1 text-slate-300">
                    <span className="truncate pr-2">{t.description}</span>
                    <span className="font-semibold text-white tabular-nums">{formatCurrency(t.amount)}</span>
                  </div>
                ))}
              <div className="flex items-center justify-between text-xs py-1 text-emerald-400 font-semibold border-t border-slate-800/80">
                <span>Previsão de Sobra no Fim do Mês:</span>
                <span className="tabular-nums">{formatCurrency(summary.projectedLeftover)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulator: O Poder de Economizar a Sobra */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-display">
              Simulador da Sobra: O Poder do Tempo
            </h2>
            <p className="text-[11px] text-slate-400">
              Se você guardar a sobra mensal de {formatCurrency(monthlySobra)} todo mês:
            </p>
          </div>
        </div>

        {monthlySobra <= 0 ? (
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <p className="text-xs text-amber-300 font-medium">
              No momento você não possui sobra positiva projetada.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Reduza despesas supérfluas ou aumente receitas para desbloquear a simulação de patrimônio!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 6 Meses */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Em 6 Meses</span>
              <p className="text-lg font-bold text-white tabular-nums mt-0.5">
                {formatCurrency(proj6mInvest)}
              </p>
              <div className="flex items-center justify-between text-[10px] text-emerald-400 mt-2">
                <span>Rendimento CDB 100%:</span>
                <span className="font-bold">+{formatCurrency(proj6mInvest - proj6mSimple)}</span>
              </div>
            </div>

            {/* 1 Ano */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase">Em 1 Ano</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">12x</span>
              </div>
              <p className="text-lg font-bold text-emerald-400 tabular-nums mt-0.5">
                {formatCurrency(proj12mInvest)}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                <span>Juros compostos:</span>
                <span className="font-bold text-emerald-400">+{formatCurrency(proj12mInvest - proj12mSimple)}</span>
              </div>
            </div>

            {/* 3 Anos */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Em 3 Anos</span>
              <p className="text-lg font-bold text-white tabular-nums mt-0.5">
                {formatCurrency(proj36mInvest)}
              </p>
              <div className="flex items-center justify-between text-[10px] text-emerald-400 mt-2">
                <span>Juros compostos:</span>
                <span className="font-bold">+{formatCurrency(proj36mInvest - proj36mSimple)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-slate-400">
            Deseja destinar essa sobra para uma meta específica?
          </p>
          <button
            onClick={onGoToGoals}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Ir para Cofrinhos
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Budget Limits (Tetos de Gastos) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">
                Tetos de Gastos por Categoria
              </h2>
              <p className="text-[11px] text-slate-400">Defina limites para não estourar o orçamento</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {categorySpending.map(({ cat, spent, limit, percent }) => {
            const isEditing = editingBudgetCat === cat.id;
            const isOverBudget = limit > 0 && spent > limit;

            return (
              <div
                key={cat.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}25` }}
                    >
                      <CategoryIcon name={cat.iconName} className="w-4 h-4" color={cat.color} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{cat.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {cat.bucket === 'necessity' ? 'Essencial (50%)' : 'Lazer & Desejos (30%)'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="Limite R$"
                          value={budgetLimitInput}
                          onChange={(e) => setBudgetLimitInput(e.target.value)}
                          className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveBudget(cat.id)}
                          className="px-2 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-right tabular-nums">
                          <span className="text-xs font-bold text-white">
                            {formatCurrency(spent)}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {limit > 0 ? `Teto: ${formatCurrency(limit)}` : 'Sem teto'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenEditBudget(cat.id, limit)}
                          className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {limit > 0 && (
                  <>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOverBudget
                            ? 'bg-rose-500'
                            : percent >= 80
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={isOverBudget ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {isOverBudget ? '⚠️ Limite ultrapassado!' : `${percent}% do teto usado`}
                      </span>
                      <span className="text-slate-400 tabular-nums">
                        {isOverBudget
                          ? `Estourou em ${formatCurrency(spent - limit)}`
                          : `Resta: ${formatCurrency(Math.max(0, limit - spent))}`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
