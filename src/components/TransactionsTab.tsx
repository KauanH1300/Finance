import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType } from '../types/finance';
import { formatCurrency, formatDateBR } from '../utils/financeCalculations';
import { CategoryIcon } from './CategoryIcon';
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Download,
  Calendar,
  CreditCard,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

interface TransactionsTabProps {
  transactions: Transaction[];
  categories: Category[];
  onOpenNewTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onExportCSV: () => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  categories,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onToggleStatus,
  onExportCSV,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'pending'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filtered transactions
  const filteredList = useMemo(() => {
    return transactions.filter((t) => {
      // Type or pending filter
      if (filterType === 'income' && t.type !== 'income') return false;
      if (filterType === 'expense' && t.type !== 'expense') return false;
      if (filterType === 'pending' && t.status !== 'pending') return false;

      // Category filter
      if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const cat = categories.find((c) => c.id === t.categoryId);
        const matchDesc = t.description.toLowerCase().includes(query);
        const matchCat = cat?.name.toLowerCase().includes(query) || false;
        const matchAmount = t.amount.toString().includes(query);
        const matchNotes = t.notes?.toLowerCase().includes(query) || false;
        if (!matchDesc && !matchCat && !matchAmount && !matchNotes) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, categories, filterType, selectedCategory, searchQuery]);

  // Totals for filtered list
  const filteredIncome = filteredList
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filteredList
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    for (const t of filteredList) {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    }
    return groups;
  }, [filteredList]);

  const datesSorted = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
            Controle de Registros
          </span>
          <h1 className="text-2xl font-black text-white font-display">
            Extrato Financeiro
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            title="Exportar Extrato em CSV"
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="h-10 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por descrição, valor ou observação..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Filter Tabs (Segmented Button Group) */}
      <div className="grid grid-cols-4 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setFilterType('all')}
          className={`py-2 rounded-lg transition-all ${
            filterType === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={`py-2 rounded-lg transition-all ${
            filterType === 'income'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Entradas
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`py-2 rounded-lg transition-all ${
            filterType === 'expense'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Saídas
        </button>
        <button
          onClick={() => setFilterType('pending')}
          className={`py-2 rounded-lg transition-all ${
            filterType === 'pending'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pendentes
        </button>
      </div>

      {/* Category Dropdown Filter */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium text-slate-400 shrink-0">Filtrar categoria:</span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5 outline-none truncate"
        >
          <option value="all">Todas as Categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.type === 'income' ? '🟢 Receita:' : '🔴 Despesa:'} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Summary Mini Bar */}
      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          {filteredList.length} {filteredList.length === 1 ? 'registro' : 'registros'}
        </span>
        <div className="flex items-center gap-3 tabular-nums font-bold">
          <span className="text-emerald-400">+{formatCurrency(filteredIncome)}</span>
          <span className="text-rose-400">-{formatCurrency(filteredExpense)}</span>
        </div>
      </div>

      {/* Transactions List Grouped by Date */}
      {datesSorted.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-sm font-semibold text-slate-300">Nenhum registro encontrado.</p>
          <p className="text-xs text-slate-500 mt-1">Tente remover filtros ou adicione uma nova movimentação.</p>
          <button
            onClick={onOpenNewTransaction}
            className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
          >
            Adicionar Registro
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {datesSorted.map((dateStr) => {
            const items = groupedByDate[dateStr];
            return (
              <div key={dateStr} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {formatDateBR(dateStr)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {items.length} {items.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
                  {items.map((t) => {
                    const cat = categories.find((c) => c.id === t.categoryId);
                    const isExpense = t.type === 'expense';
                    const isConfirmingDelete = confirmDeleteId === t.id;

                    return (
                      <div
                        key={t.id}
                        className="p-3.5 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3"
                      >
                        <div
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                          onClick={() => onEditTransaction(t)}
                        >
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

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-white truncate">
                                {t.description}
                              </p>
                              {t.totalInstallments && (
                                <span className="text-[10px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/25 px-1.5 py-0.2 rounded shrink-0">
                                  {t.installmentNumber}/{t.totalInstallments}x
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <span>{cat?.name || 'Geral'}</span>
                              <span>·</span>
                              <span className="uppercase text-[10px] text-slate-500">
                                {t.paymentMethod}
                              </span>
                              {t.notes && (
                                <>
                                  <span>·</span>
                                  <span className="truncate max-w-[90px] italic">{t.notes}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Value & Quick Status Toggle */}
                        <div className="text-right shrink-0">
                          <p
                            className={`text-xs font-bold tabular-nums ${
                              isExpense ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {isExpense ? '-' : '+'}
                            {formatCurrency(t.amount)}
                          </p>

                          <div className="flex items-center justify-end gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => onToggleStatus(t.id)}
                              className={`text-[10px] font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded ${
                                t.status === 'completed'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-amber-500/15 text-amber-400'
                              }`}
                            >
                              {t.status === 'completed' ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Pago</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  <span>Pendente</span>
                                </>
                              )}
                            </button>

                            {/* Delete button or confirmation */}
                            {isConfirmingDelete ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => onDeleteTransaction(t.id)}
                                  className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded font-bold"
                                >
                                  Excluir?
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-[10px] text-slate-400 px-1 py-0.5"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(t.id)}
                                className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors"
                                title="Excluir lançamento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
