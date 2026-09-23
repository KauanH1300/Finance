import React, { useRef } from 'react';
import { X, RefreshCw, Trash2, Download, Upload, Shield, Calendar, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonthKey: string;
  onChangeMonth: (monthKey: string) => void;
  onResetToDemoData: () => void;
  onClearAllData: () => void;
  onExportJSON: () => void;
  onImportJSON: (jsonStr: string) => void;
  onOpenInstallModal: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentMonthKey,
  onChangeMonth,
  onResetToDemoData,
  onClearAllData,
  onExportJSON,
  onImportJSON,
  onOpenInstallModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportJSON(content);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white font-display">Ajustes & Dados</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Change Month */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Mês de Análise
          </label>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={currentMonthKey}
              onChange={(e) => onChangeMonth(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none flex-1 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Backup & Export */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Backup & Segurança
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onExportJSON}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400 mb-1" />
              <p className="text-xs font-bold text-white">Baixar Backup</p>
              <p className="text-[10px] text-slate-400">Salvar arquivo JSON</p>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors"
            >
              <Upload className="w-4 h-4 text-blue-400 mb-1" />
              <p className="text-xs font-bold text-white">Restaurar Backup</p>
              <p className="text-[10px] text-slate-400">Importar arquivo</p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Data Reset & Sample Data */}
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Gerenciamento de Dados
          </label>

          <button
            onClick={() => {
              if (window.confirm('Deseja recarregar os dados de exemplo ilustrativos?')) {
                onResetToDemoData();
                onClose();
              }
            }}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              Restaurar Dados de Exemplo
            </span>
            <span className="text-[10px] text-slate-500">Demonstração</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Tem certeza que deseja apagar todos os registros e começar do zero?')) {
                onClearAllData();
                onClose();
              }
            }}
            className="w-full p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 flex items-center justify-between text-xs text-rose-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              Limpar Tudo (Começar do Zero)
            </span>
            <span className="text-[10px] text-rose-400 font-bold">Apagar</span>
          </button>
        </div>

        {/* Install on Mobile / APK Option */}
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Aplicativo de Celular
          </label>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenInstallModal();
            }}
            className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 flex items-center justify-between text-xs text-emerald-300 transition-colors"
          >
            <span className="flex items-center gap-2 font-bold">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Instalar no Celular / Gerar APK
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
              PWA & APK
            </span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-2.5 text-[11px] text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Seus dados ficam 100% salvos no seu aparelho (LocalStorage local). Nenhuma informação é enviada para servidores externos.</span>
        </div>
      </div>
    </div>
  );
};
