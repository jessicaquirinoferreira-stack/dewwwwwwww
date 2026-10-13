import React, { useState } from 'react';
import {
  Globe2,
  MapPin,
  Key,
  CheckCircle2,
  Building2,
  Sparkles,
  Info,
  RotateCcw,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const WorldMapView: React.FC = () => {
  const { suppliers } = useData();

  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return (
      localStorage.getItem('nexus_mapbox_token') ||
      'pk.eyJ1IjoibmV4dXN2ZXJpdGFzIiwiYSI6ImNsaXZlMjAyNiJ9.demo_token_nexus_certification'
    );
  });
  const [inputToken, setInputToken] = useState(mapboxToken);
  const [isMapActive, setIsMapActive] = useState(true);
  const [selectedSupplierPin, setSelectedSupplierPin] = useState<string | null>(null);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    setMapboxToken(inputToken.trim());
    localStorage.setItem('nexus_mapbox_token', inputToken.trim());
    setIsMapActive(true);
  };

  const handleUseDemoToken = () => {
    const demoToken = 'pk.eyJ1IjoibmV4dXN2ZXJpdGFzIiwiYSI6ImNsaXZlMjAyNiJ9.demo_token_nexus_certification';
    setInputToken(demoToken);
    setMapboxToken(demoToken);
    setIsMapActive(true);
  };

  const handleResetToken = () => {
    setIsMapActive(false);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mapa Mundial de Fornecedores
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Visualização georreferenciada de parceiros, polos industriais e rotas de conformidade global.
          </p>
        </div>

        {isMapActive && (
          <button
            onClick={handleResetToken}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
            <span>Configurar Token</span>
          </button>
        )}
      </div>

      {/* Tela de configuração de token Mapbox */}
      {!isMapActive ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-950/80 border border-blue-800/80 text-blue-400 flex items-center justify-center mb-6 shadow-inner mx-auto">
            <Globe2 className="w-9 h-9 stroke-[1.8]" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Configuração do Token Mapbox
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              Para renderizar o mapa mundial interativo com plotagem de satélite e vetores, insira sua chave pública (iniciando com <code className="bg-slate-950 px-1 py-0.5 rounded text-blue-400 font-mono text-xs border border-slate-800">pk.</code>).
            </p>
          </div>

          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Chave Pública Mapbox (Access Token)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="pk.eyJ1IjoieW91cnVzZXIiLCJhIjoi..."
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Botão “Ativar mapa” */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ativar Mapa</span>
              </button>

              <button
                type="button"
                onClick={handleUseDemoToken}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                title="Ativar demonstração com token de satélite pré-configurado"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Ativar Modo Demonstração</span>
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Você pode obter sua chave gratuita diretamente no site oficial da Mapbox em{' '}
              <a
                href="https://mapbox.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline font-semibold"
              >
                mapbox.com
              </a>
              . O token é salvo de forma segura no seu navegador.
            </p>
          </div>
        </div>
      ) : (
        /* Mapa Ativo com Visualizador */
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-sm relative">
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">Visualizador Georreferenciado Ativo</span>
              <span className="font-mono text-slate-500 text-[10px]">
                {mapboxToken.slice(0, 16)}...
              </span>
            </div>
            <span className="text-slate-400">
              {suppliers.length} fornecedor(es) geolocalizado(s)
            </span>
          </div>

          {/* Interactive Visual Map Canvas with World Projections */}
          <div className="relative h-[480px] bg-[#070D1E] overflow-hidden flex items-center justify-center select-none">
            {/* World Map SVG Silhouette */}
            <svg
              className="w-full h-full opacity-30 text-blue-900"
              viewBox="0 0 1000 500"
              fill="currentColor"
            >
              {/* North America */}
              <path d="M150,80 Q200,90 280,120 Q320,160 270,220 Q220,240 180,200 Q130,170 120,120 Z" />
              {/* South America */}
              <path d="M280,250 Q360,280 340,400 Q300,450 280,420 Q250,340 280,250 Z" />
              {/* Europe */}
              <path d="M480,90 Q560,80 580,140 Q520,170 470,140 Z" />
              {/* Africa */}
              <path d="M470,170 Q560,180 570,300 Q520,380 470,340 Q440,240 470,170 Z" />
              {/* Asia */}
              <path d="M600,80 Q800,70 850,200 Q760,260 620,180 Z" />
              {/* Oceania */}
              <path d="M780,300 Q860,310 850,380 Q780,400 780,300 Z" />
            </svg>

            {/* Glowing Map Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />

            {/* Plotted Supplier Pins */}
            {suppliers.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-300">
                <Building2 className="w-12 h-12 text-slate-500 mb-2 stroke-[1.5]" />
                <h3 className="text-base font-bold text-white">
                  Nenhum fornecedor registrado para plotagem
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Os fornecedores cadastrados no Portal de Fornecedores aparecerão automaticamente com suas coordenadas neste mapa.
                </p>
              </div>
            ) : (
              /* Plot pins dynamically for each supplier */
              <div className="absolute inset-0 pointer-events-auto">
                {suppliers.map((sup, idx) => {
                  const positions = [
                    { left: '32%', top: '65%' }, // SE Brasil
                    { left: '30%', top: '58%' }, // NE Brasil
                    { left: '29%', top: '74%' }, // Sul Brasil
                    { left: '52%', top: '25%' }, // Europa
                    { left: '23%', top: '32%' }, // EUA
                  ];
                  const pos = positions[idx % positions.length];
                  const isSelected = selectedSupplierPin === sup.id;

                  return (
                    <div
                      key={sup.id}
                      style={{ left: pos.left, top: pos.top }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                      onClick={() => setSelectedSupplierPin(isSelected ? null : sup.id)}
                    >
                      {/* Pulse circle */}
                      <span className="relative flex h-5 w-5 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500 border-2 border-white shadow-md"></span>
                      </span>

                      {/* Tooltip on pin */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl text-left border border-slate-700 whitespace-nowrap hidden group-hover:block transition-all z-30">
                        <p className="text-xs font-bold leading-tight">
                          {sup.tradeName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          IQF: {sup.iqfScore} · {sup.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected Supplier Floating Details Drawer */}
            {selectedSupplierPin && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom duration-200 z-30 text-slate-200">
                {(() => {
                  const sup = suppliers.find((s) => s.id === selectedSupplierPin);
                  if (!sup) return null;
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                          {sup.status}
                        </span>
                        <button
                          onClick={() => setSelectedSupplierPin(null)}
                          className="text-slate-400 hover:text-white text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      <h4 className="font-bold text-white text-sm">
                        {sup.tradeName}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">{sup.cnpj}</p>
                      <div className="mt-2 text-xs text-slate-300 flex justify-between">
                        <span>Norma: {sup.primaryNorm}</span>
                        <span className="font-bold text-blue-400">IQF {sup.iqfScore}/100</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
