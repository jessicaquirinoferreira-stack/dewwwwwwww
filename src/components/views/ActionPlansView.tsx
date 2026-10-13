import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  Filter,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatCard } from '../common/StatCard';
import { EmptyState } from '../common/EmptyState';
import { ActionPlan, ActionPlanStatus } from '../../types';

export const ActionPlansView: React.FC = () => {
  const { actionPlans, audits, addActionPlan, updateActionPlan, deleteActionPlan } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    auditCode: '',
    responsible: '',
    deadline: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
    status: 'Aberto' as ActionPlanStatus,
    priority: 'Alta' as 'Alta' | 'Média' | 'Baixa',
    correctiveAction: '',
    rootCause: '',
  });

  // Cards: TOTAL, ABERTOS, EM ANDAMENTO, ATRASADOS
  const totalCount = actionPlans.length;
  const abertosCount = actionPlans.filter((p) => p.status === 'Aberto').length;
  const emAndamentoCount = actionPlans.filter((p) => p.status === 'Em Andamento').length;
  const atrasadosCount = actionPlans.filter((p) => p.status === 'Atrasado').length;

  const filteredPlans = actionPlans.filter((p) => {
    if (filterStatus === 'Todos') return true;
    return p.status === filterStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.responsible) return;
    addActionPlan(formData);
    setIsModalOpen(false);
    setFormData({
      title: '',
      description: '',
      auditCode: '',
      responsible: '',
      deadline: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
      status: 'Aberto',
      priority: 'Alta',
      correctiveAction: '',
      rootCause: '',
    });
  };

  const getStatusColor = (status: ActionPlanStatus) => {
    switch (status) {
      case 'Aberto':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'Em Andamento':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'Atrasado':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      case 'Concluído':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Planos de Ação (CAPA & 5W2H)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Contenção, análise de causa-raiz e verificação de eficácia de não conformidades.
          </p>
        </div>

        {/* Botão “+ Novo plano” */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Plano</span>
        </button>
      </div>

      {/* Cards: TOTAL, ABERTOS, EM ANDAMENTO, ATRASADOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="TOTAL"
          value={totalCount}
          subtitle="Ações mapeadas"
          icon={CheckSquare}
          badge="Total"
          badgeColor="stone"
          active={filterStatus === 'Todos'}
          onClick={() => setFilterStatus('Todos')}
        />
        <StatCard
          label="ABERTOS"
          value={abertosCount}
          subtitle="Aguardando contenção"
          icon={AlertTriangle}
          badge="Pendentes"
          badgeColor="yellow"
          active={filterStatus === 'Aberto'}
          onClick={() => setFilterStatus('Aberto')}
        />
        <StatCard
          label="EM ANDAMENTO"
          value={emAndamentoCount}
          subtitle="Em implementação"
          icon={Clock}
          badge="Em curso"
          badgeColor="blue"
          active={filterStatus === 'Em Andamento'}
          onClick={() => setFilterStatus('Em Andamento')}
        />
        <StatCard
          label="ATRASADOS"
          value={atrasadosCount}
          subtitle="Prazo expirado"
          icon={AlertTriangle}
          badge="Críticos"
          badgeColor="red"
          active={filterStatus === 'Atrasado'}
          onClick={() => setFilterStatus('Atrasado')}
        />
      </div>

      {/* Empty State or Content */}
      {filteredPlans.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Nenhum plano de ação"
          description={
            actionPlans.length === 0
              ? 'Não há planos de ação cadastrados. Registre uma nova ação corretiva ou preventiva (CAPA) para mitigar riscos na cadeia.'
              : 'Nenhum plano encontrado para o status selecionado.'
          }
          actionLabel="+ Novo plano"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlans.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(
                      p.status
                    )}`}
                  >
                    {p.status}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      p.priority === 'Alta'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                        : p.priority === 'Média'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    Prioridade {p.priority}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-1">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {p.description}
                </p>

                {p.correctiveAction && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <span className="font-semibold text-blue-400 block text-[11px] uppercase mb-0.5">
                      Ação Corretiva Proposta:
                    </span>
                    <p className="text-slate-300">{p.correctiveAction}</p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Responsável</span>
                    <span className="font-medium text-slate-200 truncate block">
                      {p.responsible}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Prazo Final</span>
                    <span className="font-mono text-slate-200">{p.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <select
                  value={p.status}
                  onChange={(e) =>
                    updateActionPlan(p.id, { status: e.target.value as ActionPlanStatus })
                  }
                  className="text-xs font-semibold py-1 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Aberto">Aberto</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Atrasado">Atrasado</option>
                  <option value="Concluído">Concluído</option>
                </select>

                <button
                  onClick={() => deleteActionPlan(p.id)}
                  className="text-slate-400 hover:text-rose-400 text-[11px] font-medium transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: + Novo Plano */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-700 overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base">
                  Novo Plano de Ação (CAPA)
                </h3>
                <p className="text-xs text-slate-400">
                  Definição do tratamento para não conformidade identificada.
                </p>
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
                  Título da Ação *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Calibração dos instrumentos de medição térmica"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição do Desvio / Não Conformidade
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes da evidência identificada..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ação Corretiva Proposta (O que fazer)
                </label>
                <textarea
                  rows={2}
                  value={formData.correctiveAction}
                  onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })}
                  placeholder="Descreva as medidas de correção e prevenção..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    placeholder="Ex: Engenharia da Qualidade"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prazo Limite *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Inicial
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ActionPlanStatus })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Aberto">Aberto</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Atrasado">Atrasado</option>
                    <option value="Concluído">Concluído</option>
                  </select>
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
                  Registrar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
