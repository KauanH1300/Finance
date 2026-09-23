import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType, PlanBucket, PaymentMethod } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { X, Check, ArrowDownLeft, ArrowUpRight, Calendar, CreditCard, Tag } from 'lucide-react';
import { formatCurrency } from '../utils/financeCalculations';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>, id?: string) => void;
  onSaveInstallments?: (transactions: Array<Omit<Transaction, 'id'>>) => void;
  editingTransaction?: Transaction | null;
  categories: Category[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveInstallments,
  editingTransaction,
  categories,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [status, setStatus] = useState<'completed' | 'pending'>('completed');
  const [bucket, setBucket] = useState<PlanBucket>('necessity');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Installment State (Parcelas)
  const [isInstallment, setIsInstallment] = useState<boolean>(false);
  const [installmentCount, setInstallmentCount] = useState<number>(5);
  const [installmentAmountInput, setInstallmentAmountInput] = useState<string>('');
  const [totalAmountInput, setTotalAmountInput] = useState<string>('');

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(editingTransaction.amount.toString());
      setDescription(editingTransaction.description);
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setStatus(editingTransaction.status);
      setBucket(editingTransaction.bucket);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
      setIsInstallment(false);
    } else {
      // Defaults for new entry
      setType('expense');
      setAmountStr('');
      setDescription('');
      const defaultCat = categories.find((c) => c.type === 'expense');
      setCategoryId(defaultCat ? defaultCat.id : '');
      setBucket(defaultCat ? defaultCat.bucket : 'necessity');
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setStatus('completed');
      setPaymentMethod('pix');
      setNotes('');
      setIsInstallment(false);
      setInstallmentCount(5);
      setInstallmentAmountInput('');
      setTotalAmountInput('');
    }
    setError('');
  }, [editingTransaction, isOpen, categories]);

  // When type changes, ensure valid category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setIsInstallment(false);
    }
    const validCat = categories.find((c) => c.type === newType);
    if (validCat) {
      setCategoryId(validCat.id);
      setBucket(validCat.bucket);
    }
  };

  const handleCategorySelect = (catId: string) => {
    setCategoryId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      setBucket(cat.bucket);
    }
  };

  const handleAmountQuickAdd = (add: number) => {
    const current = parseFloat(amountStr) || 0;
    const next = (current + add).toFixed(2);
    setAmountStr(next);
    if (isInstallment && installmentCount > 0) {
      setInstallmentAmountInput(next);
      setTotalAmountInput((parseFloat(next) * installmentCount).toFixed(2));
    }
  };

  // Synchronize installment calculation
  const handleInstallmentCountChange = (count: number) => {
    setInstallmentCount(count);
    const perInst = parseFloat(installmentAmountInput.replace(',', '.'));
    if (perInst && perInst > 0) {
      setTotalAmountInput((perInst * count).toFixed(2));
    } else {
      const tot = parseFloat(totalAmountInput.replace(',', '.'));
      if (tot && tot > 0) {
        setInstallmentAmountInput((tot / count).toFixed(2));
      }
    }
  };

  const handleInstallmentAmountInputChange = (val: string) => {
    setInstallmentAmountInput(val);
    setAmountStr(val);
    const perInst = parseFloat(val.replace(',', '.'));
    if (perInst && !isNaN(perInst)) {
      setTotalAmountInput((perInst * installmentCount).toFixed(2));
    }
  };

  const handleTotalAmountInputChange = (val: string) => {
    setTotalAmountInput(val);
    const tot = parseFloat(val.replace(',', '.'));
    if (tot && !isNaN(tot) && installmentCount > 0) {
      const perInst = (tot / installmentCount).toFixed(2);
      setInstallmentAmountInput(perInst);
      setAmountStr(perInst);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amountStr.replace(',', '.'));
    if (!cleanAmount || cleanAmount <= 0) {
      setError('Por favor, informe um valor maior que zero.');
      return;
    }
    if (!description.trim()) {
      setError('Por favor, dê uma breve descrição.');
      return;
    }
    if (!categoryId) {
      setError('Selecione uma categoria.');
      return;
    }
    if (!date) {
      setError('Selecione uma data.');
      return;
    }

    // Installments batch creation
    if (isInstallment && type === 'expense' && !editingTransaction) {
      const cleanInstallmentAmount = parseFloat(installmentAmountInput.replace(',', '.'));
      if (!cleanInstallmentAmount || cleanInstallmentAmount <= 0) {
        setError('Por favor, informe o valor de cada parcela.');
        return;
      }
      if (installmentCount < 2) {
        setError('O número de parcelas deve ser de pelo menos 2.');
        return;
      }

      const installmentGroupId = 'inst-' + Date.now();
      const [yearStr, monthStr, dayStr] = date.split('-');
      const baseYear = parseInt(yearStr, 10);
      const baseMonth = parseInt(monthStr, 10); // 1-12
      const baseDay = parseInt(dayStr, 10);

      const batch: Array<Omit<Transaction, 'id'>> = [];

      for (let i = 0; i < installmentCount; i++) {
        // Safe month addition
        const targetDate = new Date(baseYear, baseMonth - 1 + i, baseDay);
        const y = targetDate.getFullYear();
        const m = String(targetDate.getMonth() + 1).padStart(2, '0');
        const d = String(targetDate.getDate()).padStart(2, '0');
        const installmentDateStr = `${y}-${m}-${d}`;

        batch.push({
          type: 'expense',
          amount: cleanInstallmentAmount,
          description: `${description.trim()} (${i + 1}/${installmentCount})`,
          categoryId,
          date: installmentDateStr,
          status: i === 0 ? status : 'pending',
          bucket,
          paymentMethod: paymentMethod === 'pix' ? 'credit' : paymentMethod,
          notes: notes.trim()
            ? `${notes.trim()} · Parcela ${i + 1} de ${installmentCount}`
            : `Parcela ${i + 1} de ${installmentCount}`,
          installmentId: installmentGroupId,
          installmentNumber: i + 1,
          totalInstallments: installmentCount,
          installmentTotalAmount: cleanInstallmentAmount * installmentCount,
        });
      }

      if (onSaveInstallments) {
        onSaveInstallments(batch);
      } else {
        batch.forEach((tx) => onSave(tx));
      }
      onClose();
      return;
    }

    onSave(
      {
        type,
        amount: cleanAmount,
        description: description.trim(),
        categoryId,
        date,
        status,
        bucket,
        paymentMethod,
        notes: notes.trim() || undefined,
      },
      editingTransaction?.id
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header handle for mobile */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <h2 className="text-lg font-bold text-white font-display">
            {editingTransaction ? 'Editar Registro' : 'Novo Registro'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Segmented Type Toggle (Despesa / Receita) */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              Despesa (Saída)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Receita (Entrada)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Valor
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl py-3.5 pl-14 pr-4 text-2xl font-bold text-white tabular-nums outline-none transition-colors"
              />
            </div>
            {/* Quick amount presets */}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleAmountQuickAdd(20)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                +R$20
              </button>
              <button
                type="button"
                onClick={() => handleAmountQuickAdd(50)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                +R$50
              </button>
              <button
                type="button"
                onClick={() => handleAmountQuickAdd(100)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                +R$100
              </button>
              <button
                type="button"
                onClick={() => handleAmountQuickAdd(500)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                +R$500
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Descrição
            </label>
            <input
              type="text"
              placeholder={
                categoryId === 'terreiro'
                  ? 'Ex: Velas de 7 dias, bebidas, tecidos para entidades...'
                  : categoryId === 'atendimento'
                  ? 'Ex: Consulta com cartas, atendimento com entidade, passe...'
                  : type === 'expense'
                  ? 'Ex: Compras no Supermercado, Aluguel...'
                  : 'Ex: Salário Empresa, Venda freelance...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
            {categoryId === 'terreiro' && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'Velas de 7 dias',
                  'Bebidas das entidades',
                  'Roupas & Tecidos',
                  'Ervas e Defumação',
                  'Pembas e Guias',
                  'Mensalidade Terreiro',
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setDescription(sug)}
                    className="px-2 py-0.5 text-[11px] rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            )}
            {categoryId === 'atendimento' && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'Consulta com Cartas / Tarô',
                  'Consulta com Entidade',
                  'Atendimento Espiritual',
                  'Passe & Limpeza Energética',
                  'Trabalho Espiritual',
                  'Jogo de Búzios',
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setDescription(sug)}
                    className="px-2 py-0.5 text-[11px] rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}25` }}
                    >
                      <CategoryIcon name={cat.iconName} className="w-4 h-4" color={cat.color} />
                    </div>
                    <span className="text-xs font-medium truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Planning Bucket (50-30-20) if Expense */}
          {type === 'expense' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Classificação no Planejamento
                </label>
                <span className="text-[11px] text-slate-500">Regra 50/30/20</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBucket('necessity')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    bucket === 'necessity'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold">50% Essencial</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Necessidade</p>
                </button>
                <button
                  type="button"
                  onClick={() => setBucket('wants')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    bucket === 'wants'
                      ? 'border-purple-500 bg-purple-500/15 text-purple-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold">30% Estilo</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Lazer/Desejo</p>
                </button>
                <button
                  type="button"
                  onClick={() => setBucket('savings')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    bucket === 'savings'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold">20% Reserva</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Futuro</p>
                </button>
              </div>
            </div>
          )}

          {/* Installments Option (Parcelamento no Cartão/Carnê) */}
          {type === 'expense' && !editingTransaction && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Compra Parcelada?</span>
                    <span className="text-[11px] text-slate-400">Dividir e lançar parcelas nos próximos meses</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextState = !isInstallment;
                    setIsInstallment(nextState);
                    if (nextState) {
                      setPaymentMethod('credit');
                      const currentVal = parseFloat(amountStr.replace(',', '.')) || 0;
                      if (currentVal > 0) {
                        setInstallmentAmountInput(currentVal.toFixed(2));
                        setTotalAmountInput((currentVal * installmentCount).toFixed(2));
                      }
                    }
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    isInstallment ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isInstallment ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isInstallment && (
                <div className="space-y-3 pt-2.5 border-t border-slate-800/80">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Número de Parcelas
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[2, 3, 4, 5, 6, 10, 12].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleInstallmentCountChange(num)}
                          className={`flex-1 min-w-[40px] py-1.5 rounded-xl text-xs font-black transition-all ${
                            installmentCount === num
                              ? 'bg-emerald-500 text-slate-950 shadow-sm'
                              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {num}x
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-slate-400">Outra quantidade:</span>
                      <input
                        type="number"
                        min="2"
                        max="60"
                        value={installmentCount}
                        onChange={(e) => handleInstallmentCountChange(Math.max(2, parseInt(e.target.value) || 2))}
                        className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-bold text-center outline-none focus:border-emerald-500"
                      />
                      <span className="text-[11px] text-slate-400">parcelas</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                        Valor de Cada Parcela
                      </label>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-emerald-400 font-bold">R$</span>
                        <input
                          type="text"
                          value={installmentAmountInput}
                          onChange={(e) => handleInstallmentAmountInputChange(e.target.value)}
                          placeholder="140,00"
                          className="w-full bg-transparent text-sm font-black text-emerald-400 outline-none"
                        />
                      </div>
                    </div>

                    <div className="border-l border-slate-800 pl-3">
                      <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                        Total da Compra
                      </label>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-slate-400 font-bold">R$</span>
                        <input
                          type="text"
                          value={totalAmountInput}
                          onChange={(e) => handleTotalAmountInputChange(e.target.value)}
                          placeholder="700,00"
                          className="w-full bg-transparent text-sm font-black text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 space-y-1">
                    <p className="font-semibold">
                      Serão geradas <strong>{installmentCount} parcelas de R$ {installmentAmountInput || '0,00'}</strong> (Total: R$ {totalAmountInput || '0,00'}).
                    </p>
                    <p className="text-slate-400">
                      A 1ª parcela será lançada na data selecionada e as próximas {installmentCount - 1} parcelas serão distribuídas automaticamente nos meses subsequentes!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-xs text-white outline-none"
              >
                <option value="pix">Pix</option>
                <option value="credit">Cartão de Crédito</option>
                <option value="debit">Cartão de Débito</option>
                <option value="boleto">Boleto Bancário</option>
                <option value="cash">Dinheiro em Espécie</option>
                <option value="transfer">Transferência / TED</option>
              </select>
            </div>
          </div>

          {/* Status (Concluído / Pendente) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Status do Pagamento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  status === 'completed'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                {type === 'expense' ? '✓ Já Pago' : '✓ Já Recebido'}
              </button>
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  status === 'pending'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                {type === 'expense' ? '⏳ A Pagar (Previsão)' : '⏳ A Receber'}
              </button>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Observação (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Parcela 2/3, compra na feira..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 outline-none"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              {error}
            </p>
          )}

          {/* Submit CTA */}
          <div className="pt-2 pb-4">
            <button
              type="submit"
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
            >
              <Check className="w-4 h-4" />
              {editingTransaction ? 'Salvar Alterações' : 'Adicionar ao Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
