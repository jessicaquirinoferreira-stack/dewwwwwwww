import React, { useState } from 'react';
import {
  BarChart3,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  PieChart,
  Target,
  Sparkles,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { EmptyState } from '../common/EmptyState';
import { MetricIndicator } from '../../types';

export const IndicatorsView: React.FC = () => {
  const { indicators, addIndicator, deleteIndicator, suppliers, audits } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    target: 90,
    currentValue: 85,
    unit: '%',
    category: 'Qualidade' as 'Qualidade' | 'Segurança' | 'Meio Ambiente' | 'Compliance' | 'ESG',
    trend: 'up' as 'up' | 'down' | 'stable',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addIndicator(formData);
    setIsModalOpen(false);
    setFormData({
      name: '',
      target: 90,
      currentValue: 85,
      unit: '%',
      category: 'Qualidade',
      trend: 'up',
    });
  };

  // Calculations for sections
  const averageIQF =
    suppliers.length > 0
      ? Math.round(
          suppliers.reduce((acc, curr) => acc + curr.iqfScore, 0) / suppliers.length
        )
      : null;

  const averageAuditScore =
    audits.length > 0
      ? Math.round(
          audits.reduce((acc, curr) => acc + curr.conformityScore, 0) / audits.length
        )
      : null;

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Indicadores & Métricas de Conformidade
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Acompanhamento contínuo de metas de qualidade, ESG e evolução do IQF da cadeia de fornecedores.
          </p>
        </div>

        {/* Botão “+ Novo indicador” */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Indicador</span>
        </button>
      </div>

      {/* Grid of Key Indicators */}
      {indicators.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Nenhum indicador cadastrado"
          description="Monitore metas estratégicas de conformidade, taxas de aprovação de auditorias e pontuação média de fornecedores criando seu primeiro indicador."
          actionLabel="+ Novo indicador"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {indicators.map((ind) => {
            const isTargetMet = ind.currentValue >= ind.target;
            const progress = Math.min(Math.round((ind.currentValue / ind.target) * 100), 100);

            return (
              <div
                key={ind.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      {ind.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                        ind.trend === 'up'
                          ? 'text-emerald-400'
                          : ind.trend === 'down'
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {ind.trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                      {ind.trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                      {ind.trend === 'stable' && <Minus className="w-3.5 h-3.5" />}
                      <span>{ind.trend === 'up' ? '+ Positivo' : ind.trend === 'down' ? '- Alerta' : 'Estável'}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm leading-snug">
                    {ind.name}
                  </h3>

                  <div className="flex items-baseline gap-2 my-3">
                    <span className="text-3xl font-extrabold text-white">
                      {ind.currentValue}
                      <span className="text-lg font-normal text-slate-400 ml-0.5">{ind.unit}</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      / Meta: <strong className="text-slate-200">{ind.target}{ind.unit}</strong>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden mb-2 border border-slate-800">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isTargetMet ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[10px]">Atualizado em {ind.lastUpdated}</span>
                  <button
                    onClick={() => deleteIndicator(ind.id)}
                    className="hover:text-rose-400 text-[11px] transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Seções: “Evolução da pontuação” e “Distribuição de conformidade” */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Seção: Evolução da pontuação */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">
                Evolução da Pontuação IQF
              </h2>
              <p className="text-xs text-slate-400">
                Histórico comparativo do Índice de Qualificação de Fornecedores.
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>

          {suppliers.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
              <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">
                Sem histórico de pontuação suficiente
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Cadastre fornecedores e conclua auditorias para gerar a curva temporal.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400">IQF Médio Global Atual:</span>
                <span className="font-extrabold text-blue-400 text-sm">
                  {averageIQF} / 100 pontos
                </span>
              </div>

              <div className="space-y-2.5">
                {suppliers.slice(0, 4).map((sup) => (
                  <div key={sup.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300 truncate max-w-[200px]">
                        {sup.tradeName}
                      </span>
                      <span className="font-bold text-white font-mono">{sup.iqfScore} pts</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className={`h-1.5 rounded-full ${
                          sup.iqfScore >= 80
                            ? 'bg-emerald-500'
                            : sup.iqfScore >= 70
                            ? 'bg-blue-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${sup.iqfScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Seção: Distribuição de conformidade */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">
                Distribuição de Conformidade
              </h2>
              <p className="text-xs text-slate-400">
                Aderência às normas auditadas e taxa de aprovação geral.
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>

          {audits.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
              <PieChart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">
                Nenhum relatório de auditoria consolidado
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                A distribuição de conformidade é calculada a partir dos laudos de auditoria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400">Índice Médio de Conformidade:</span>
                <span className="font-extrabold text-emerald-400 text-sm font-mono">
                  {averageAuditScore}% Conforme
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-emerald-950/50 rounded-xl border border-emerald-800/80">
                  <span className="text-xl font-extrabold text-emerald-300">
                    {audits.filter((a) => a.status === 'Certificada' || a.status === 'Concluída').length}
                  </span>
                  <span className="block text-[10px] text-emerald-400 uppercase font-semibold mt-0.5">
                    Aprovadas / Conformes
                  </span>
                </div>
                <div className="p-3 bg-amber-950/50 rounded-xl border border-amber-800/80">
                  <span className="text-xl font-extrabold text-amber-300">
                    {audits.reduce((acc, curr) => acc + curr.nonConformitiesCount, 0)}
                  </span>
                  <span className="block text-[10px] text-amber-400 uppercase font-semibold mt-0.5">
                    Não Conformidades Apontadas
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: + Novo Indicador */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-700 overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base">
                  Novo Indicador de Gestão
                </h3>
                <p className="text-xs text-slate-400">Métrica chave para monitoramento executivo.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Indicador *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Taxa de Resolução de Não Conformidades"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Qualidade">Qualidade</option>
                    <option value="Compliance">Compliance</option>
                    <option value="ESG">ESG</option>
                    <option value="Segurança">Segurança</option>
                    <option value="Meio Ambiente">Meio Ambiente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Unidade de Medida
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="%, pts, dias"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Meta Estabelecida
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor Realizado Atual
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.currentValue}
                    onChange={(e) =>
                      setFormData({ ...formData, currentValue: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all"
                >
                  Criar Indicador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
