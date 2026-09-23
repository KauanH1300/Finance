import React, { useState } from 'react';
import { SavingsGoal, MonthSummary } from '../types/finance';
import { formatCurrency } from '../utils/financeCalculations';
import { CategoryIcon } from './CategoryIcon';
import {
  PiggyBank,
  Plus,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Check,
  Trash2,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface GoalsTabProps {
  savingsGoals: SavingsGoal[];
  summary: MonthSummary;
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  onDeleteGoal: (id: string) => void;
  onDepositToGoal: (goalId: string, amount: number) => void;
}

export const GoalsTab: React.FC<GoalsTabProps> = ({
  savingsGoals,
  summary,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDepositToGoal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositType, setDepositType] = useState<'deposit' | 'withdraw'>('deposit');

  // New Goal Form State
  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [initialAmountStr, setInitialAmountStr] = useState('');
  const [iconName, setIconName] = useState('PiggyBank');
  const [color, setColor] = useState('#10b981');
  const [deadLine, setDeadLine] = useState('');

  const availableIcons = [
    'PiggyBank',
    'ShieldAlert',
    'Compass',
    'Smartphone',
    'Home',
    'Car',
    'Coins',
    'HeartPulse',
    'GraduationCap',
  ];

  const availableColors = [
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
  ];

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmountStr.replace(',', '.'));
    const initial = parseFloat(initialAmountStr.replace(',', '.')) || 0;

    if (!title.trim() || isNaN(target) || target <= 0) {
      return;
    }

    onAddGoal({
      title: title.trim(),
      targetAmount: target,
      currentAmount: initial,
      categoryIcon: iconName,
      color,
      deadline: deadLine || undefined,
    });

    // Reset & close
    setTitle('');
    setTargetAmountStr('');
    setInitialAmountStr('');
    setDeadLine('');
    setIsModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal) return;
    const amount = parseFloat(depositAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    const multiplier = depositType === 'deposit' ? 1 : -1;
    onDepositToGoal(depositModalGoal.id, amount * multiplier);

    setDepositModalGoal(null);
    setDepositAmount('');
  };

  const totalSavedAcrossGoals = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTargetAcrossGoals = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPercent = totalTargetAcrossGoals > 0 ? Math.round((totalSavedAcrossGoals / totalTargetAcrossGoals) * 100) : 0;

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
            Metas & Cofrinhos
          </span>
          <h1 className="text-2xl font-black text-white font-display">
            Seu Futuro Financeiro
          </h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Cofrinho</span>
        </button>
      </div>

      {/* Hero Card Total Saved */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Acumulado em Metas</span>
            <h2 className="text-2xl font-black text-white font-display tabular-nums mt-0.5">
              {formatCurrency(totalSavedAcrossGoals)}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Progresso Geral ({savingsGoals.length} metas)</span>
            <span className="font-bold text-emerald-400 tabular-nums">{overallPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, overallPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 tabular-nums">
            <span>Alvo Total: {formatCurrency(totalTargetAcrossGoals)}</span>
            <span>Faltam: {formatCurrency(Math.max(0, totalTargetAcrossGoals - totalSavedAcrossGoals))}</span>
          </div>
        </div>

        {summary.projectedLeftover > 0 && (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Você tem uma sobra estimada de {formatCurrency(summary.projectedLeftover)} este mês.</span>
            </div>
          </div>
        )}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {savingsGoals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="rounded-3xl bg-slate-900 border border-slate-800/90 p-5 space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${goal.color}25` }}
                  >
                    <CategoryIcon name={goal.categoryIcon} className="w-5 h-5" color={goal.color} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">{goal.title}</h3>
                    {goal.deadline && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Prazo: {goal.deadline}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 flex items-center justify-center transition-colors"
                  title="Excluir meta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-white tabular-nums">
                    {formatCurrency(goal.currentAmount)}
                  </span>
                  <span className="font-bold tabular-nums" style={{ color: goal.color }}>
                    {percent}% da meta
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, backgroundColor: goal.color }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 tabular-nums">
                  <span>Alvo: {formatCurrency(goal.targetAmount)}</span>
                  <span>Falta guardar: {formatCurrency(remaining)}</span>
                </div>
              </div>

              {/* Quick Actions (Depositar / Resgatar) */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={() => {
                    setDepositModalGoal(goal);
                    setDepositType('deposit');
                    setDepositAmount('');
                  }}
                  className="flex-1 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Guardar Dinheiro
                </button>

                <button
                  onClick={() => {
                    setDepositModalGoal(goal);
                    setDepositType('withdraw');
                    setDepositAmount('');
                  }}
                  className="h-9 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  Resgatar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-display">Novo Cofrinho / Meta</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Nome da Meta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Viagem de Férias, Reserva 6 Meses, Celular..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Valor Alvo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 5000"
                    value={targetAmountStr}
                    onChange={(e) => setTargetAmountStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Já guardado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={initialAmountStr}
                    onChange={(e) => setInitialAmountStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Icon & Color selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                  Ícone & Cor
                </label>
                <div className="flex items-center gap-2 mb-3">
                  {availableColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {availableIcons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIconName(ic)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                        iconName === ic
                          ? 'border-emerald-500 bg-emerald-500/20 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <CategoryIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Prazo Desejado (Opcional)
                </label>
                <input
                  type="date"
                  value={deadLine}
                  onChange={(e) => setDeadLine(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Check className="w-4 h-4" />
                Criar Cofrinho
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deposit / Withdraw Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full sm:max-w-sm bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  {depositType === 'deposit' ? 'Guardar Dinheiro' : 'Resgatar Dinheiro'}
                </h3>
                <p className="text-xs text-slate-400">{depositModalGoal.title}</p>
              </div>
              <button
                onClick={() => setDepositModalGoal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                  Valor (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-12 pr-4 text-xl font-bold text-white outline-none"
                    autoFocus
                    required
                  />
                </div>

                {depositType === 'deposit' && summary.projectedLeftover > 0 && (
                  <button
                    type="button"
                    onClick={() => setDepositAmount(summary.projectedLeftover.toFixed(2))}
                    className="mt-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 block"
                  >
                    Usar sobra total do mês: {formatCurrency(summary.projectedLeftover)}
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Check className="w-4 h-4" />
                {depositType === 'deposit' ? 'Confirmar Aporte' : 'Confirmar Resgate'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
