import React from 'react';
import {
  Transaction,
  MonthSummary,
  Rule503020Stats,
  SavingsGoal,
  Category,
} from '../types/finance';
import { formatCurrency, formatDateBR, generateFinancialTips } from '../utils/financeCalculations';
import { CategoryIcon } from './CategoryIcon';
import {
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Plus,
  Compass,
  ShieldCheck,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

interface OverviewTabProps {
  summary: MonthSummary;
  ruleStats: Rule503020Stats;
  recentTransactions: Transaction[];
  savingsGoals: SavingsGoal[];
  categories: Category[];
  currentMonthLabel: string;
  onOpenNewTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onToggleStatus: (id: string) => void;
  onGoToPlanning: () => void;
  onGoToGoals: () => void;
  onGoToTransactions: () => void;
  onGoToAnalytics?: () => void;
  onDepositToGoal: (goalId: string, amount: number) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  summary,
  ruleStats,
  recentTransactions,
  savingsGoals,
  categories,
  currentMonthLabel,
  onOpenNewTransaction,
  onEditTransaction,
  onToggleStatus,
  onGoToPlanning,
  onGoToGoals,
  onGoToTransactions,
  onGoToAnalytics,
  onDepositToGoal,
}) => {
  const tips = generateFinancialTips(summary, ruleStats);
  const primaryTip = tips[0];

  const isPositiveLeftover = summary.projectedLeftover >= 0;

  return (
    <div className="space-y-5 pb-24">
      {/* Month Header Banner */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
            Mês de Referência
          </span>
          <h1 className="text-xl font-black text-white capitalize font-display">
            {currentMonthLabel}
          </h1>
        </div>
        <button
          onClick={onOpenNewTransaction}
          className="h-10 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Registro</span>
        </button>
      </div>

      {/* Hero Financial Health Card: QUANTO SOBRA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/90 p-5 shadow-xl">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Current Balance / Sobra Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Previsão no Fim do Mês</span>
            <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              isPositiveLeftover
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {isPositiveLeftover ? 'Vai Sobrar' : 'Faltará'}
            </div>
          </div>
          <span className="text-xs text-slate-500">Saldo Atual: {formatCurrency(summary.currentBalance)}</span>
        </div>

        {/* The Big Highlight: Quanto Sobra */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 mb-0.5">Quanto Sobra Livre Este Mês</p>
            {summary.totalSavedInGoals > 0 && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <PiggyBank className="w-3 h-3 text-emerald-400" />
                Caixinhas Deduzidas
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-3xl sm:text-4xl font-black font-display tabular-nums tracking-tight ${
              isPositiveLeftover ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {formatCurrency(summary.projectedLeftover)}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {summary.totalSavedInGoals > 0 ? (
              <span>
                Você já guardou <strong className="text-emerald-400 font-bold">{formatCurrency(summary.totalSavedInGoals)}</strong> em caixinhas. Sobra 100% livre sem comprometer suas metas.
              </span>
            ) : isPositiveLeftover ? (
              `Taxa de economia de ${Math.round(summary.savingsRate)}% da sua renda total.`
            ) : (
              'Gastos totais estão maiores que as receitas deste mês.'
            )}
          </p>
        </div>

        {/* Safe Daily Spend Indicator */}
        {summary.daysRemainingInMonth > 0 && (
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Disponível por Dia (Livre)</p>
                <p className="text-[11px] text-slate-400">
                  Faltam {summary.daysRemainingInMonth} dias para fechar o mês
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white tabular-nums">
                {formatCurrency(summary.dailySafeSpend)}
              </p>
              <p className="text-[10px] text-emerald-400 font-medium">Teto diário seguro</p>
            </div>
          </div>
        )}

        {/* Income vs Expenses vs Caixinhas Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entradas</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 tabular-nums">
              {formatCurrency(summary.totalIncome)}
            </span>
          </div>

          <div className="flex flex-col border-x border-slate-800/60 px-2">
            <div className="flex items-center gap-1.5 text-rose-400 mb-0.5">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Contas/Gastos</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-rose-400 tabular-nums">
              {formatCurrency(summary.expensesExcludingSavings)}
            </span>
          </div>

          <div className="flex flex-col pl-1">
            <div className="flex items-center gap-1.5 text-indigo-400 mb-0.5">
              <PiggyBank className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Caixinhas</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-indigo-400 tabular-nums">
              {formatCurrency(summary.totalSavedInGoals)}
            </span>
          </div>
        </div>
      </div>

      {/* 50-30-20 Planning Snapshot Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">Planejamento 50/30/20</h2>
              <p className="text-[11px] text-slate-400">Distribuição recomendada da sua renda</p>
            </div>
          </div>
          <button
            onClick={onGoToPlanning}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            Detalhes
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Pillars Progress */}
        <div className="space-y-3.5">
          {/* Necessities */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-300">
                50% Necessidades (Essencial)
              </span>
              <div className="flex items-center gap-1.5 tabular-nums">
                <span className="font-bold text-white">{formatCurrency(ruleStats.necessities.actual)}</span>
                <span className="text-slate-500">/ {formatCurrency(ruleStats.necessities.recommended)}</span>
                <span className={`text-[11px] font-bold ${
                  ruleStats.necessities.percent <= 50 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  ({ruleStats.necessities.percent}%)
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  ruleStats.necessities.percent <= 50 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, ruleStats.necessities.percent)}%` }}
              />
            </div>
          </div>

          {/* Wants */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-300">
                30% Desejos (Lazer & Estilo)
              </span>
              <div className="flex items-center gap-1.5 tabular-nums">
                <span className="font-bold text-white">{formatCurrency(ruleStats.wants.actual)}</span>
                <span className="text-slate-500">/ {formatCurrency(ruleStats.wants.recommended)}</span>
                <span className={`text-[11px] font-bold ${
                  ruleStats.wants.percent <= 30 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  ({ruleStats.wants.percent}%)
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  ruleStats.wants.percent <= 30 ? 'bg-purple-400' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, ruleStats.wants.percent)}%` }}
              />
            </div>
          </div>

          {/* Savings / Sobra */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-300">
                20% Futuro (Reserva & Sobra)
              </span>
              <div className="flex items-center gap-1.5 tabular-nums">
                <span className="font-bold text-white">{formatCurrency(ruleStats.savings.actual)}</span>
                <span className="text-slate-500">/ {formatCurrency(ruleStats.savings.recommended)}</span>
                <span className={`text-[11px] font-bold ${
                  ruleStats.savings.percent >= 20 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  ({ruleStats.savings.percent}%)
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, ruleStats.savings.percent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Tip / Insight */}
      {primaryTip && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
          primaryTip.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
            : primaryTip.type === 'warning'
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
            : 'bg-blue-950/40 border-blue-800/60 text-blue-200'
        }`}>
          <div className="p-2 rounded-xl bg-white/10 shrink-0">
            {primaryTip.type === 'success' ? (
              <Sparkles className="w-5 h-5 text-emerald-400" />
            ) : primaryTip.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <Lightbulb className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-white mb-0.5">{primaryTip.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{primaryTip.message}</p>
            {primaryTip.actionText && (
              <button
                onClick={onGoToGoals}
                className="mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-1"
              >
                {primaryTip.actionText} →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Historical Comparison Teaser Card */}
      {onGoToAnalytics && (
        <div
          onClick={onGoToAnalytics}
          className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all shadow-lg flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Dashboard Comparativo
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-md">
                  Novo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Compare Bimestre, Trimestre, Semestre e Ano. Descubra onde mais economizou!
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </div>
      )}

      {/* Savings Goals Snapshot */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white font-display">Cofrinhos & Metas</h2>
          </div>
          <button
            onClick={onGoToGoals}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Ver todos ({savingsGoals.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {savingsGoals.slice(0, 2).map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            return (
              <div
                key={goal.id}
                onClick={onGoToGoals}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${goal.color}25` }}
                    >
                      <CategoryIcon name={goal.categoryIcon} className="w-4 h-4" color={goal.color} />
                    </div>
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">
                      {goal.title}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 tabular-nums">{percent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${percent}%`, backgroundColor: goal.color }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
                  <span>{formatCurrency(goal.currentAmount)}</span>
                  <span>Meta: {formatCurrency(goal.targetAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-white font-display">Últimos Lançamentos</h2>
          <button
            onClick={onGoToTransactions}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Extrato Completo
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-sm font-medium text-slate-400">Nenhum lançamento neste mês.</p>
            <button
              onClick={onOpenNewTransaction}
              className="mt-3 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
            >
              Adicionar Primeiro Registro
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
            {recentTransactions.slice(0, 5).map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              const isExpense = t.type === 'expense';
              return (
                <div
                  key={t.id}
                  onClick={() => onEditTransaction(t)}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat?.color || '#64748b'}20` }}
                    >
                      <CategoryIcon
                        name={cat?.iconName || 'Wallet'}
                        className="w-4 h-4"
                        color={cat?.color}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[170px] sm:max-w-xs">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>{cat?.name || 'Geral'}</span>
                        <span>·</span>
                        <span>{formatDateBR(t.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xs font-bold tabular-nums ${
                        isExpense ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatCurrency(t.amount)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(t.id);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white mt-0.5"
                    >
                      {t.status === 'completed' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400/90">Pago</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-400/90">Pendente</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
