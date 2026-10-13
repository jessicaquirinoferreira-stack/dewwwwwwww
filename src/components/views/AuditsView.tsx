import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  Sliders,
  AlertCircle,
  Clock,
  CheckCircle2,
  Award,
  ChevronRight,
  ShieldCheck,
  Building2,
  X,
  FileCheck2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatCard } from '../common/StatCard';
import { EmptyState } from '../common/EmptyState';
import { Audit, AuditStatus, AuditType } from '../../types';
import { STANDARD_NORMS } from '../../data/initialData';

interface AuditsViewProps {
  onOpenDocuments: () => void;
  onOpenSuppliers: () => void;
}

export const AuditsView: React.FC<AuditsViewProps> = ({
  onOpenDocuments,
  onOpenSuppliers,
}) => {
  const { audits, suppliers, addAudit, deleteAudit } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [warningAlert, setWarningAlert] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    supplierOrClientId: '',
    clientName: '',
    clientAddress: 'Av. Paulista, 1000 - São Paulo - SP',
    auditType: '2ª Parte (Fornecedor)' as AuditType,
    norm: 'ISO 9001',
    scope: 'Sistema de Gestão da Qualidade aplicável a projetos e prestação de serviços.',
    leadAuditor: 'Comitê de Auditoria Nexus',
    auditTeam: 'Comitê de Auditoria Nexus',
    technicalManager: 'Bruno Alvarenga',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    validityDate: new Date(Date.now() + 86400000 * 365 * 3).toISOString().split('T')[0],
    status: 'Em Andamento' as AuditStatus,
    conformityScore: 92,
    nonConformitiesCount: 0,
  });

  const totalCount = audits.length;
  const emAndamentoCount = audits.filter((a) => a.status === 'Em Andamento').length;
  const concluidasCount = audits.filter((a) => a.status === 'Concluída').length;
  const certificadasCount = audits.filter((a) => a.status === 'Certificada').length;

  const handleOpenNewAudit = () => {
    if (suppliers.length === 0) {
      setWarningAlert(
        'Você precisa cadastrar um cliente ou fornecedor antes de criar uma auditoria oficial.'
      );
      return;
    }
    setWarningAlert(null);
    const sup = suppliers[0];
    setFormData((prev) => ({
      ...prev,
      code: `AUD-2026-${Math.floor(Math.random() * 899 + 100)}`,
      supplierOrClientId: sup?.id || '',
      clientName: sup?.tradeName || '',
      clientAddress: `${sup?.city || 'São Paulo'} - ${sup?.state || 'SP'}`,
    }));
    setIsModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName) return;

    addAudit(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Auditorias de Conformidade & Ciclos Técnicos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Gestão de auditorias de 1ª parte (internas), 2ª parte (fornecedores) e 3ª parte (certificação internacional).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenDocuments}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold shadow-xs transition-all"
          >
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Personalizar Checklist</span>
          </button>

          <button
            onClick={handleOpenNewAudit}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Auditoria</span>
          </button>
        </div>
      </div>

      {/* Warning Alert if needed */}
      {warningAlert && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-700/80 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-semibold">{warningAlert}</span>
          </div>
          <button
            onClick={onOpenSuppliers}
            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-500 text-xs shrink-0"
          >
            Cadastrar Fornecedor Agora
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="TOTAL"
          value={totalCount}
          subtitle="Ciclos de auditoria"
          icon={ClipboardCheck}
          badge="Geral"
          badgeColor="stone"
        />
        <StatCard
          label="EM ANDAMENTO"
          value={emAndamentoCount}
          subtitle="Em execução"
          icon={Clock}
          badge="Ativas"
          badgeColor="yellow"
        />
        <StatCard
          label="CONCLUÍDAS"
          value={concluidasCount}
          subtitle="Relatório emitido"
          icon={CheckCircle2}
          badge="Finalizadas"
          badgeColor="blue"
        />
        <StatCard
          label="CERTIFICADAS"
          value={certificadasCount}
          subtitle="Selo aprovado"
          icon={Award}
          badge="Conforme"
          badgeColor="green"
        />
      </div>

      {/* Audits Content or Empty State */}
      {audits.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Nenhuma auditoria registrada"
          description={
            suppliers.length === 0
              ? 'Você precisa cadastrar um cliente ou fornecedor antes de criar uma auditoria. Cadastre a primeira organização no Portal de Fornecedores.'
              : 'Não há auditorias ativas no momento. Inicie um novo ciclo de avaliação técnica.'
          }
          actionLabel="+ Nova Auditoria"
          onAction={handleOpenNewAudit}
          secondaryActionLabel="Ver Modelos de Checklists"
          onSecondaryAction={onOpenDocuments}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {audits.map((a) => (
            <div
              key={a.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 text-blue-400 border border-slate-800">
                    {a.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      a.status === 'Certificada'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                        : a.status === 'Concluída'
                        ? 'bg-blue-950/80 text-blue-300 border-blue-800/80'
                        : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">
                  {a.clientName}
                </h3>
                <p className="text-xs font-semibold text-blue-400 mt-0.5 font-mono">
                  {a.norm} · {a.auditType}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Auditor Líder:</span>
                    <span className="font-medium text-slate-200">{a.leadAuditor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Período:</span>
                    <span className="font-mono text-[11px] text-slate-300">
                      {a.startDate} a {a.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Conformidade:</span>
                    <span className="font-bold text-emerald-400 tabular-nums">{a.conformityScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Não Conformidades:</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        a.nonConformitiesCount > 0 ? 'text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      {a.nonConformitiesCount} apontamento(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end text-xs">
                <button
                  onClick={() => deleteAudit(a.id)}
                  className="text-slate-500 hover:text-rose-400 text-[11px] font-medium transition-colors"
                >
                  Excluir Auditoria
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: + Nova Auditoria */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-700 overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-lg">
                  Nova Auditoria de Conformidade
                </h3>
                <p className="text-xs text-slate-400">
                  Planejamento e abertura de ciclo de avaliação técnica.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Organização / Fornecedor *
                  </label>
                  <select
                    value={formData.supplierOrClientId}
                    onChange={(e) => {
                      const selectedSup = suppliers.find((s) => s.id === e.target.value);
                      setFormData({
                        ...formData,
                        supplierOrClientId: e.target.value,
                        clientName: selectedSup ? selectedSup.tradeName : '',
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.tradeName} ({s.cnpj})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Auditoria
                  </label>
                  <select
                    value={formData.auditType}
                    onChange={(e) =>
                      setFormData({ ...formData, auditType: e.target.value as AuditType })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="1ª Parte (Interna)">1ª Parte (Interna)</option>
                    <option value="2ª Parte (Fornecedor)">2ª Parte (Fornecedor)</option>
                    <option value="3ª Parte (Certificação)">3ª Parte (Certificação)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Norma Técnica
                  </label>
                  <select
                    value={formData.norm}
                    onChange={(e) => setFormData({ ...formData, norm: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {STANDARD_NORMS.map((n) => (
                      <option key={n.code} value={n.code}>
                        {n.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data de Conclusão
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as AuditStatus })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Certificada">Certificada</option>
                    <option value="Planejada">Planejada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Índice de Conformidade (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.conformityScore}
                    onChange={(e) =>
                      setFormData({ ...formData, conformityScore: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
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
                  Registrar Auditoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
