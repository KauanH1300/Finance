import React, { useState, useMemo } from 'react';
import { RecurringCost, Category, Transaction, RecurrenceType } from '../types/finance';
import { formatCurrency } from '../utils/financeCalculations';
import { CategoryIcon } from './CategoryIcon';
import {
  Calendar,
  CreditCard,
  Plus,
  Tv,
  Home,
  Zap,
  Smartphone,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';

interface SubscriptionsTabProps {
  recurringCosts: RecurringCost[];
  categories: Category[];
  currentMonthKey: string;
  transactions: Transaction[];
  onAddRecurringCost: (cost: Omit<RecurringCost, 'id'>) => void;
  onUpdateRecurringCost: (id: string, updates: Partial<RecurringCost>) => void;
  onDeleteRecurringCost: (id: string) => void;
  onLaunchToStatement: (cost: RecurringCost) => void;
}

// Quick presets for popular Brazilian subscriptions & fixed bills
const POPULAR_PRESETS = [
  { name: 'Netflix', amount: 44.9, dueDay: 14, type: 'subscription' as RecurrenceType, categoryId: 'streaming', color: '#ef4444', iconName: 'Tv' },
  { name: 'Spotify', amount: 21.9, dueDay: 20, type: 'subscription' as RecurrenceType, categoryId: 'streaming', color: '#10b981', iconName: 'Tv' },
  { name: 'Amazon Prime', amount: 19.9, dueDay: 25, type: 'subscription' as RecurrenceType, categoryId: 'streaming', color: '#0ea5e9', iconName: 'Tv' },
  { name: 'YouTube Premium', amount: 24.9, dueDay: 18, type: 'subscription' as RecurrenceType, categoryId: 'streaming', color: '#dc2626', iconName: 'Tv' },
  { name: 'Aluguel Casa', amount: 1350.0, dueDay: 8, type: 'fixed_cost' as RecurrenceType, categoryId: 'moradia', color: '#3b82f6', iconName: 'Home' },
  { name: 'Internet Fibra', amount: 120.0, dueDay: 11, type: 'fixed_cost' as RecurrenceType, categoryId: 'contas', color: '#06b6d4', iconName: 'Zap' },
  { name: 'Conta de Energia (Luz)', amount: 220.0, dueDay: 10, type: 'fixed_cost' as RecurrenceType, categoryId: 'contas', color: '#f59e0b', iconName: 'Zap' },
  { name: 'Plano Celular', amount: 59.9, dueDay: 15, type: 'fixed_cost' as RecurrenceType, categoryId: 'contas', color: '#8b5cf6', iconName: 'Smartphone' },
  { name: 'Academia', amount: 119.0, dueDay: 5, type: 'subscription' as RecurrenceType, categoryId: 'saude', color: '#ec4899', iconName: 'HeartPulse' },
];

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({
  recurringCosts,
  categories,
  currentMonthKey,
  transactions,
  onAddRecurringCost,
  onUpdateRecurringCost,
  onDeleteRecurringCost,
  onLaunchToStatement,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'subscription' | 'fixed_cost'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<RecurringCost | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formAmountStr, setFormAmountStr] = useState('');
  const [formDueDay, setFormDueDay] = useState<number>(10);
  const [formType, setFormType] = useState<RecurrenceType>('subscription');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formIcon, setFormIcon] = useState('Tv');
  const [formError, setFormError] = useState('');

  // Today's day of month
  const todayDay = new Date().getDate();

  // Metrics calculation
  const metrics = useMemo(() => {
    let monthlyTotal = 0;
    let subscriptionsMonthly = 0;
    let fixedCostsMonthly = 0;
    let activeCount = 0;

    recurringCosts.forEach((c) => {
      if (c.isActive) {
        activeCount++;
        const monthlyVal = c.billingCycle === 'yearly' ? c.amount / 12 : c.amount;
        monthlyTotal += monthlyVal;
        if (c.type === 'subscription') {
          subscriptionsMonthly += monthlyVal;
        } else {
          fixedCostsMonthly += monthlyVal;
        }
      }
    });

    const yearlyTotal = monthlyTotal * 12;
    const subscriptionsYearly = subscriptionsMonthly * 12;
    const fixedCostsYearly = fixedCostsMonthly * 12;

    return {
      monthlyTotal,
      yearlyTotal,
      subscriptionsMonthly,
      subscriptionsYearly,
      fixedCostsMonthly,
      fixedCostsYearly,
      activeCount,
    };
  }, [recurringCosts]);

  // Filtered and sorted recurring costs (sorted by dueDay)
  const filteredCosts = useMemo(() => {
    return recurringCosts
      .filter((c) => {
        if (filterType === 'all') return true;
        return c.type === filterType;
      })
      .sort((a, b) => a.dueDay - b.dueDay);
  }, [recurringCosts, filterType]);

  // Check which recurring costs have already been recorded in current month transactions
  const launchedTxMap = useMemo(() => {
    const map: Record<string, Transaction | undefined> = {};
    const monthTx = transactions.filter((t) => t.date.startsWith(currentMonthKey));

    recurringCosts.forEach((c) => {
      const match = monthTx.find(
        (t) =>
          t.subscriptionId === c.id ||
          (t.isRecurring && t.description.toLowerCase().includes(c.name.toLowerCase()))
      );
      map[c.id] = match;
    });

    return map;
  }, [recurringCosts, transactions, currentMonthKey]);

  // Open modal for Create or Edit
  const handleOpenModal = (cost?: RecurringCost) => {
    if (cost) {
      setEditingCost(cost);
      setFormName(cost.name);
      setFormAmountStr(cost.amount.toString());
      setFormDueDay(cost.dueDay);
      setFormType(cost.type);
      setFormCategoryId(cost.categoryId);
      setFormNotes(cost.notes || '');
      setFormColor(cost.color || '#3b82f6');
      setFormIcon(cost.iconName || 'Tv');
    } else {
      setEditingCost(null);
      setFormName('');
      setFormAmountStr('');
      setFormDueDay(10);
      setFormType('subscription');
      const defaultCat = categories.find((c) => c.type === 'expense');
      setFormCategoryId(defaultCat ? defaultCat.id : 'streaming');
      setFormNotes('');
      setFormColor('#ef4444');
      setFormIcon('Tv');
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleApplyPreset = (p: (typeof POPULAR_PRESETS)[0]) => {
    setFormName(p.name);
    setFormAmountStr(p.amount.toString());
    setFormDueDay(p.dueDay);
    setFormType(p.type);
    setFormCategoryId(p.categoryId);
    setFormColor(p.color);
    setFormIcon(p.iconName);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(formAmountStr.replace(',', '.'));
    if (!cleanAmount || cleanAmount <= 0) {
      setFormError('Informe um valor válido.');
      return;
    }
    if (!formName.trim()) {
      setFormError('Informe o nome da assinatura ou despesa.');
      return;
    }
    if (formDueDay < 1 || formDueDay > 31) {
      setFormError('Dia de vencimento deve ser entre 1 e 31.');
      return;
    }

    const selectedCat = categories.find((c) => c.id === formCategoryId);
    const bucket = selectedCat?.bucket || (formType === 'fixed_cost' ? 'necessity' : 'wants');

    if (editingCost) {
      onUpdateRecurringCost(editingCost.id, {
        name: formName.trim(),
        amount: cleanAmount,
        dueDay: formDueDay,
        type: formType,
        categoryId: formCategoryId,
        bucket,
        notes: formNotes.trim() || undefined,
        color: formColor,
        iconName: formIcon,
      });
    } else {
      onAddRecurringCost({
        name: formName.trim(),
        amount: cleanAmount,
        dueDay: formDueDay,
        type: formType,
        categoryId: formCategoryId,
        bucket,
        billingCycle: 'monthly',
        isActive: true,
        notes: formNotes.trim() || undefined,
        color: formColor,
        iconName: formIcon,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header & Title */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
            Recorrências
          </span>
          <h1 className="text-xl font-black text-white font-display">
            Assinaturas & Custos Fixos
          </h1>
          <p className="text-xs text-slate-400">
            Controle mensal e anual de tudo que você paga com data fixa
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="h-10 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo</span>
        </button>
      </div>

      {/* Top Aggregated Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Monthly Card */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Mensal
            </span>
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl font-black text-white font-display tabular-nums">
            {formatCurrency(metrics.monthlyTotal)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {metrics.activeCount} despesas fixas ativas
          </span>
        </div>

        {/* Yearly Projected Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
              Projeção Anual
            </span>
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl font-black text-emerald-400 font-display tabular-nums">
            {formatCurrency(metrics.yearlyTotal)}
          </p>
          <span className="text-[11px] text-emerald-300/80 block mt-0.5">
            Custo total em 12 meses
          </span>
        </div>
      </div>

      {/* Breakdown: Subscriptions vs Fixed Bills */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-bold text-slate-300">Assinaturas Digitais</span>
          </div>
          <p className="text-sm font-black text-purple-400 tabular-nums">
            {formatCurrency(metrics.subscriptionsMonthly)}
            <span className="text-[10px] text-slate-500 font-normal"> /mês</span>
          </p>
          <p className="text-[10px] text-slate-400">
            {formatCurrency(metrics.subscriptionsYearly)} /ano
          </p>
        </div>

        <div className="space-y-1 border-l border-slate-800 pl-3">
          <div className="flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-bold text-slate-300">Custos Fixos da Casa</span>
          </div>
          <p className="text-sm font-black text-blue-400 tabular-nums">
            {formatCurrency(metrics.fixedCostsMonthly)}
            <span className="text-[10px] text-slate-500 font-normal"> /mês</span>
          </p>
          <p className="text-[10px] text-slate-400">
            {formatCurrency(metrics.fixedCostsYearly)} /ano
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-3 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setFilterType('all')}
          className={`py-2 rounded-lg transition-all ${
            filterType === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todos ({recurringCosts.length})
        </button>
        <button
          onClick={() => setFilterType('subscription')}
          className={`py-2 rounded-lg transition-all ${
            filterType === 'subscription'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Assinaturas
        </button>
        <button
          onClick={() => setFilterType('fixed_cost')}
          className={`py-2 rounded-lg transition-all ${
            filterType === 'fixed_cost'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Custos Fixos
        </button>
      </div>

      {/* List of Recurring Costs by Due Day */}
      <div className="space-y-3">
        {filteredCosts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-3xl border border-slate-800">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">Nenhum custo fixo cadastrado nesta categoria</p>
            <p className="text-xs text-slate-500 mt-1">Toque no botão "+ Novo" para adicionar aluguel, contas ou assinaturas.</p>
          </div>
        ) : (
          filteredCosts.map((cost) => {
            const launchedTx = launchedTxMap[cost.id];
            const isLaunched = !!launchedTx;
            const isPastToday = cost.dueDay < todayDay;
            const isToday = cost.dueDay === todayDay;
            const daysLeft = cost.dueDay - todayDay;
            const cat = categories.find((c) => c.id === cost.categoryId);

            return (
              <div
                key={cost.id}
                className={`p-4 rounded-3xl bg-slate-900 border transition-all ${
                  cost.isActive
                    ? 'border-slate-800 hover:border-slate-700'
                    : 'border-slate-800/50 opacity-60 bg-slate-950/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Icon & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/10"
                      style={{ backgroundColor: `${cost.color || '#3b82f6'}20` }}
                    >
                      <CategoryIcon
                        name={cost.iconName || 'Calendar'}
                        className="w-5 h-5"
                        color={cost.color || '#3b82f6'}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white truncate">{cost.name}</h3>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            cost.type === 'subscription'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {cost.type === 'subscription' ? 'Assinatura' : 'Custo Fixo'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-300">
                          Dia {cost.dueDay < 10 ? `0${cost.dueDay}` : cost.dueDay}
                        </span>
                        <span>·</span>
                        <span>{cat?.name || 'Geral'}</span>
                        {cost.notes && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[120px] text-slate-500">{cost.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Values */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-rose-400 font-display tabular-nums">
                      {formatCurrency(cost.amount)}
                      <span className="text-[10px] text-slate-500 font-normal">/mês</span>
                    </p>
                    <p className="text-[10px] text-slate-500 tabular-nums">
                      {formatCurrency(cost.amount * 12)}/ano
                    </p>
                  </div>
                </div>

                {/* Due status & Action bar */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                  {/* Status Indicator for current month */}
                  <div className="flex items-center gap-1.5">
                    {isLaunched ? (
                      launchedTx?.status === 'completed' ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Pago no Extrato
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">
                          <Clock className="w-3.5 h-3.5 text-sky-400" />
                          No Extrato (Agendado)
                        </span>
                      )
                    ) : isToday ? (
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Vence HOJE!
                      </span>
                    ) : isPastToday ? (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Cobrança prevista no dia {cost.dueDay}
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        Vence em {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Launch into current month statement button if not already launched */}
                    {!isLaunched && cost.isActive && (
                      <button
                        type="button"
                        onClick={() => onLaunchToStatement(cost)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1"
                        title="Lançar no extrato deste mês agora"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>Lançar no Mês</span>
                      </button>
                    )}

                    {/* Toggle Active / Pause */}
                    <button
                      type="button"
                      onClick={() => onUpdateRecurringCost(cost.id, { isActive: !cost.isActive })}
                      className={`px-2 py-1 rounded-xl text-[11px] font-semibold border transition-colors ${
                        cost.isActive
                          ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                      }`}
                      title={cost.isActive ? 'Pausar este custo' : 'Reativar este custo'}
                    >
                      {cost.isActive ? 'Pausar' : 'Reativar'}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenModal(cost)}
                      className="w-8 h-8 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Deseja remover "${cost.name}" das recorrências?`)) {
                          onDeleteRecurringCost(cost.id);
                        }
                      }}
                      className="w-8 h-8 rounded-xl hover:bg-rose-500/20 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Economia Inteligente Simulator Banner */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Raio-X de Economia Recorrente
          </h4>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Você tem <strong>{metrics.activeCount} despesas fixas</strong> somando{' '}
          <strong className="text-white">{formatCurrency(metrics.monthlyTotal)}/mês</strong>. Isso representa{' '}
          <strong className="text-emerald-400">{formatCurrency(metrics.yearlyTotal)}</strong> no acumulado do ano.
          {metrics.subscriptionsMonthly > 0 && (
            <span> Se você cancelar uma assinatura de R$ 30, terá mais <strong>R$ 360,00 livres todo ano</strong> para suas metas!</span>
          )}
        </p>
      </div>

      {/* Add / Edit Recurring Cost Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white font-display">
                {editingCost ? 'Editar Recorrência' : 'Nova Assinatura ou Custo Fixo'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  {formError}
                </div>
              )}

              {/* Fast Presets (if creating new) */}
              {!editingCost && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Sugestões Populares Rápidas
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {POPULAR_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-[11px] font-bold text-slate-300 hover:text-white whitespace-nowrap transition-colors"
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Type Switcher: Subscription vs Fixed Cost */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Tipo de Custo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('subscription');
                      if (!formCategoryId) setFormCategoryId('streaming');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      formType === 'subscription'
                        ? 'border-purple-500/60 bg-purple-500/20 text-purple-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    📺 Assinatura Digital
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('fixed_cost');
                      if (!formCategoryId) setFormCategoryId('moradia');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      formType === 'fixed_cost'
                        ? 'border-blue-500/60 bg-blue-500/20 text-blue-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    🏠 Custo Fixo da Casa
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Nome do Serviço / Conta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Netflix, Aluguel, Internet Fibra, Celular..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>

              {/* Amount and Due Day in 2 Columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Valor Mensal (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 44,90"
                    value={formAmountStr}
                    onChange={(e) => setFormAmountStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-sm font-bold text-emerald-400 placeholder-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Dia de Cobrança (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formDueDay}
                    onChange={(e) => setFormDueDay(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-sm font-bold text-white text-center outline-none"
                  />
                </div>
              </div>

              {/* Category Picker */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Categoria
                </label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-sm text-white outline-none"
                >
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Observações (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cartão Nubank, Débito automático..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-300 placeholder-slate-600 outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{editingCost ? 'Salvar Alterações' : 'Adicionar Recorrência'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
