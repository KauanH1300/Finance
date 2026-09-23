import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'direct' | 'apk'>('direct');

  if (!isOpen) return null;

  const appUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Instalar no Celular</h3>
              <p className="text-[11px] text-slate-400">Tenha o SobraMais na palma da mão</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedTab('direct')}
            className={`py-2 rounded-lg transition-all ${
              selectedTab === 'direct'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Instalação Direta (PWA)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('apk')}
            className={`py-2 rounded-lg transition-all ${
              selectedTab === 'apk'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gerar Arquivo APK
          </button>
        </div>

        {/* Tab 1: Direct Mobile Install */}
        {selectedTab === 'direct' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>
                <strong>Sem complicação:</strong> O aplicativo já está 100% preparado como PWA (Progressive Web App). Ele é instalado como um aplicativo nativo no seu Android ou iPhone, com ícone próprio e funcionando em tela cheia!
              </span>
            </div>

            {/* If ready to install via browser prompt */}
            {isInstallable && (
              <button
                onClick={handleDirectInstall}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                Instalar Aplicativo Agora
              </button>
            )}

            {isInstalled && (
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                O aplicativo já está instalado no seu dispositivo!
              </div>
            )}

            {/* Android Instructions */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">
                  🤖
                </span>
                No Celular Android (Google Chrome):
              </div>
              <ol className="text-xs text-slate-300 space-y-1.5 pl-2 list-decimal list-inside">
                <li>Abra o link deste app no Google Chrome do celular.</li>
                <li>Toque nos <strong>três pontinhos (⋮)</strong> no canto superior direito.</li>
                <li>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                <li>Pronto! Ele aparece junto com todos os outros apps do seu celular.</li>
              </ol>
            </div>

            {/* iPhone Instructions */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">
                  🍏
                </span>
                No iPhone / iPad (Safari):
              </div>
              <ol className="text-xs text-slate-300 space-y-1.5 pl-2 list-decimal list-inside">
                <li>Abra este site no navegador <strong>Safari</strong> do iPhone.</li>
                <li>Toque no botão de <strong>Compartilhar</strong> (ícone com quadrado e seta para cima <Share2 className="w-3 h-3 inline text-blue-400" />).</li>
                <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
              </ol>
            </div>

            {/* Copy Link to open on phone */}
            <div className="pt-1">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Link do seu App para abrir no celular:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 flex-1 truncate outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="h-9 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: How to generate an APK */}
        {selectedTab === 'apk' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm">Como obter o arquivo .APK:</h4>
              <p className="text-slate-300 leading-relaxed">
                Como este é um aplicativo web progressivo (PWA), você pode convertê-lo diretamente em um arquivo <strong>.APK instalado no Android</strong> ou pronto para a Google Play usando a ferramenta gratuita oficial da Microsoft e Google:
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <p className="font-bold text-white">Copie o link do seu app</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Use o botão abaixo para copiar a URL deste aplicativo.</p>
                  <button
                    onClick={handleCopyLink}
                    className="mt-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-400 font-bold text-xs flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Link Copiado!' : 'Copiar Link do App'}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <p className="font-bold text-white">Abra o PWABuilder (Gratuito)</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    O <strong>PWABuilder.com</strong> gera pacotes APK e AAB para Android instantaneamente.
                  </p>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400"
                  >
                    <span>Acessar PWABuilder</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <p className="font-bold text-white">Cole o link e baixe o APK</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Cole o link do app no campo de busca, clique em <strong>Start</strong> e depois em <strong>Package for Android</strong> para baixar o pacote APK!
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
              <span>💡</span>
              <span>
                <strong>Dica:</strong> A "Instalação Direta (PWA)" da aba ao lado dispensa o APK e já instala no seu celular com 1 clique!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
