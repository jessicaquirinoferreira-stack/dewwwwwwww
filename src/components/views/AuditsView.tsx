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
  FileCheck2,
  Calendar,
  AlertTriangle,
  Search,
  ExternalLink,
  Printer,
  FileText,
  CheckSquare,
  Lock,
  Layers,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { StatCard } from '../common/StatCard';
import { EmptyState } from '../common/EmptyState';
import {
  Audit,
  AuditStatus,
  AuditType,
  AuditChecklistItem,
  AuditFindingSeverity,
  AuditTechnicalApproval
} from '../../types';
import { STANDARD_NORMS } from '../../data/initialData';
import { calculateAuditComplianceScore } from '../../utils/isoMath';

interface AuditsViewProps {
  onOpenDocuments: () => void;
  onOpenSuppliers: () => void;
}

// Preset standard checklists by norm
const DEFAULT_CHECKLIST_TEMPLATES: Record<string, { requirement: string; processOrArea: string }[]> = {
  'ISO 9001': [
    { requirement: 'Cláusula 4.1 - Compreensão da organização e de seu contexto', processOrArea: 'Planejamento Estratégico' },
    { requirement: 'Cláusula 5.1 - Liderança e comprometimento com o SGQ', processOrArea: 'Alta Direção' },
    { requirement: 'Cláusula 6.1 - Ações para abordar riscos e oportunidades', processOrArea: 'Gestão de Riscos' },
    { requirement: 'Cláusula 7.1.5 - Recursos de monitoramento e medição (Calibração)', processOrArea: 'Metrologia / Qualidade' },
    { requirement: 'Cláusula 8.4 - Controle de processos, produtos e serviços de fornecedores', processOrArea: 'Suprimentos / Compras' },
    { requirement: 'Cláusula 8.5.1 - Controle de produção e fornecimento de serviço', processOrArea: 'Operações / Manufatura' },
    { requirement: 'Cláusula 9.2 - Auditorias internas da qualidade', processOrArea: 'Garantia da Qualidade' },
    { requirement: 'Cláusula 10.2 - Não conformidade e ação corretiva (CAPA)', processOrArea: 'Melhoria Contínua' },
  ],
  'FSSC 22000': [
    { requirement: 'Cláusula 4.2 - Identificação de perigos e pontos críticos (HACCP / APPCC)', processOrArea: 'Segurança de Alimentos' },
    { requirement: 'Cláusula 7.2 - Competência e treinamento da equipe de food safety', processOrArea: 'Recursos Humanos' },
    { requirement: 'Cláusula 8.2 - Programas de Pré-requisitos (PRPs) e higienização', processOrArea: 'Operação Fabril' },
    { requirement: 'Cláusula 8.5 - Rastreabilidade e recall de lotes', processOrArea: 'Logística & Expedição' },
  ],
  'ISO 27001': [
    { requirement: 'Controle A.5.1 - Políticas para segurança da informação', processOrArea: 'Segurança Corporativa' },
    { requirement: 'Controle A.9.2 - Gestão de acessos e privilégios administrativos', processOrArea: 'Infraestrutura de TI' },
    { requirement: 'Controle A.12.3 - Gestão de cópias de segurança (Backup & Restore)', processOrArea: 'Data Center' },
    { requirement: 'Controle A.16.1 - Gestão de incidentes de segurança da informação', processOrArea: 'SOC / Cyber' },
  ],
};

export const AuditsView: React.FC<AuditsViewProps> = ({
  onOpenDocuments,
  onOpenSuppliers,
}) => {
  const { theme } = useTheme();
  const {
    audits,
    suppliers,
    addAudit,
    updateAudit,
    deleteAudit,
    createActionPlanFromAuditNC,
    submitAuditTechnicalApproval
  } = useData();

  const [activeTypeFilter, setActiveTypeFilter] = useState<'Todos' | AuditType>('Todos');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'Todos' | AuditStatus>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewAuditModalOpen, setIsNewAuditModalOpen] = useState(false);
  const [warningAlert, setWarningAlert] = useState<string | null>(null);

  // Selected audit for workspace modal
  const [selectedAuditForWorkspace, setSelectedAuditForWorkspace] = useState<Audit | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<'checklist' | 'escopo' | 'evidencias' | 'aprovacao'>('checklist');

  // Quick Action Plan opening from NC
  const [selectedNCForPlan, setSelectedNCForPlan] = useState<{ auditId: string; item: AuditChecklistItem } | null>(null);
  const [planResponsible, setPlanResponsible] = useState('Gestor de Qualidade do Fornecedor');
  const [planDeadline, setPlanDeadline] = useState(new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0]);
  const [planPriority, setPlanPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Alta');

  // New Audit Form State
  const [formData, setFormData] = useState({
    code: '',
    supplierOrClientId: '',
    clientName: '',
    clientAddress: 'Av. Paulista, 1000 - São Paulo - SP',
    auditType: '2ª Parte (Fornecedor)' as AuditType,
    norm: 'ISO 9001',
    scope: 'Sistema de Gestão da Qualidade aplicável a projeto, fabricação e fornecimento crítico.',
    leadAuditor: 'Dra. Carolina Mendes (IRCA-604218)',
    auditTeam: 'Dra. Carolina Mendes, Eng. Roberto Albuquerque',
    technicalManager: 'Bruno Alvarenga',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    validityDate: new Date(Date.now() + 86400000 * 365 * 3).toISOString().split('T')[0],
    status: 'Em Andamento' as AuditStatus,
    conformityScore: 90,
    nonConformitiesCount: 0,
  });

  // Current selected audit in workspace kept fresh from state
  const currentAudit = selectedAuditForWorkspace
    ? audits.find((a) => a.id === selectedAuditForWorkspace.id) || selectedAuditForWorkspace
    : null;

  // Filtered Audits
  const filteredAudits = audits.filter((a) => {
    const matchesType = activeTypeFilter === 'Todos' ? true : a.auditType === activeTypeFilter;
    const matchesStatus = activeStatusFilter === 'Todos' ? true : a.status === activeStatusFilter;
    const matchesSearch =
      a.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.norm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.leadAuditor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  // Stats
  const totalCount = audits.length;
  const emAndamentoCount = audits.filter((a) => a.status === 'Em Andamento').length;
  const concluidasCount = audits.filter((a) => a.status === 'Concluída' || a.status === 'Aprovada').length;
  const certificadasCount = audits.filter((a) => a.status === 'Certificada').length;
  const averageConformity =
    audits.length > 0
      ? Math.round(audits.reduce((acc, curr) => acc + curr.conformityScore, 0) / audits.length)
      : 0;

  // Open New Audit modal with automatic code
  const handleOpenNewAudit = () => {
    if (suppliers.length === 0) {
      setWarningAlert('Você precisa cadastrar ao menos uma empresa fornecedora antes de agendar uma auditoria oficial.');
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
    setIsNewAuditModalOpen(true);
  };

  // Create Audit
  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName) return;

    // Build default checklist items from norm
    const templateItems = DEFAULT_CHECKLIST_TEMPLATES[formData.norm] || DEFAULT_CHECKLIST_TEMPLATES['ISO 9001'];
    const checklistItems: AuditChecklistItem[] = templateItems.map((item, idx) => ({
      id: `chk-${Date.now()}-${idx}`,
      requirement: item.requirement,
      processOrArea: item.processOrArea,
      conformity: 'Conforme',
      evidence: 'Evidência objetiva em conformidade com o procedimento operacional verificado.',
      actionPlanCreated: false,
    }));

    addAudit({
      ...formData,
      checklistItems,
    });

    setIsNewAuditModalOpen(false);
  };

  // Update Checklist Item Conformity
  const handleUpdateChecklistItem = (
    auditId: string,
    itemId: string,
    conformity: AuditFindingSeverity,
    evidence?: string
  ) => {
    const audit = audits.find((a) => a.id === auditId);
    if (!audit || !audit.checklistItems) return;

    const updatedItems = audit.checklistItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          conformity,
          evidence: evidence !== undefined ? evidence : item.evidence,
        };
      }
      return item;
    });

    // Recálculo formal de Score Ponderado ISO 19011 via motor normativo
    const scoreRes = calculateAuditComplianceScore(updatedItems);

    updateAudit(auditId, {
      checklistItems: updatedItems,
      conformityScore: scoreRes.score,
      nonConformitiesCount: scoreRes.nonConformitiesCount,
    });
  };

  // Create Action Plan from NC item
  const handleConfirmCreatePlanFromNC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNCForPlan) return;

    createActionPlanFromAuditNC(
      selectedNCForPlan.auditId,
      selectedNCForPlan.item,
      planResponsible,
      planDeadline,
      planPriority
    );

    setSelectedNCForPlan(null);
  };

  const getStatusBadge = (status: AuditStatus) => {
    switch (status) {
      case 'Certificada':
      case 'Aprovada':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'Concluída':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'Em Andamento':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'Em Análise Técnica':
      case 'Relatório Emitido':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className={`space-y-6 transition-colors duration-200 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              CICLOS DE AUDITORIA 1ª, 2ª E 3ª PARTES
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">Rastreabilidade & CAPA Integrado</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Auditorias de Conformidade & Ciclos Técnicos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Planejamento, checklists por norma com classificação de constatações, registro de evidências e abertura automática de planos de ação sem retrabalho.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenDocuments}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-orange-400" />
            <span>Biblioteca SGQ</span>
          </button>

          <button
            onClick={handleOpenNewAudit}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Auditoria</span>
          </button>
        </div>
      </div>

      {/* Warning Alert if no suppliers */}
      {warningAlert && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-700/80 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-semibold">{warningAlert}</span>
          </div>
          <button
            onClick={onOpenSuppliers}
            className="px-3 py-1.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 text-xs shrink-0 cursor-pointer"
          >
            Cadastrar Fornecedor Agora
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          label="TOTAL AUDITORIAS"
          value={totalCount}
          subtitle="Ciclos cadastrados"
          icon={ClipboardCheck}
          badge="Total"
          badgeColor="stone"
          active={activeStatusFilter === 'Todos'}
          onClick={() => setActiveStatusFilter('Todos')}
        />
        <StatCard
          label="EM ANDAMENTO"
          value={emAndamentoCount}
          subtitle="Coleta de evidências"
          icon={Clock}
          badge="Em Campo"
          badgeColor="yellow"
          active={activeStatusFilter === 'Em Andamento'}
          onClick={() => setActiveStatusFilter('Em Andamento')}
        />
        <StatCard
          label="CONCLUÍDAS / APROVADAS"
          value={concluidasCount}
          subtitle="Relatórios homologados"
          icon={CheckCircle2}
          badge="Aprovadas"
          badgeColor="blue"
          active={activeStatusFilter === 'Concluída'}
          onClick={() => setActiveStatusFilter('Concluída')}
        />
        <StatCard
          label="CERTIFICADAS"
          value={certificadasCount}
          subtitle="Selo emitido"
          icon={Award}
          badge="Certificadas"
          badgeColor="green"
          active={activeStatusFilter === 'Certificada'}
          onClick={() => setActiveStatusFilter('Certificada')}
        />
        <StatCard
          label="TAXA CONFORMIDADE"
          value={`${averageConformity}%`}
          subtitle="Média ponderada geral"
          icon={ShieldCheck}
          badge={averageConformity >= 90 ? 'Excelente' : 'Regular'}
          badgeColor={averageConformity >= 90 ? 'green' : 'yellow'}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border transition-colors ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {(['Todos', '1ª Parte (Interna)', '2ª Parte (Fornecedor)', '3ª Parte (Certificação)'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTypeFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTypeFilter === t
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por código, empresa, norma..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:border-orange-500 ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Audits Cards List */}
      {filteredAudits.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Nenhuma auditoria encontrada"
          description={
            audits.length === 0
              ? 'Não há auditorias cadastradas. Agende o primeiro ciclo técnico com checklist multinorma para avaliar requisitos operacionais.'
              : 'Nenhuma auditoria corresponde aos filtros selecionados.'
          }
          actionLabel="+ Nova Auditoria"
          onAction={handleOpenNewAudit}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAudits.map((a) => (
            <div
              key={a.id}
              onClick={() => {
                setSelectedAuditForWorkspace(a);
                setWorkspaceTab('checklist');
              }}
              className={`border rounded-2xl p-5 shadow-sm transition-all relative flex flex-col justify-between cursor-pointer group hover:scale-[1.01] ${
                theme === 'light'
                  ? 'bg-white border-slate-200 hover:border-orange-500/50 hover:shadow-md'
                  : 'bg-slate-900/90 border-slate-800 hover:border-orange-500/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-orange-400 border border-slate-700 font-mono">
                    {a.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(a.status)}`}>
                      {a.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {a.conformityScore}%
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors leading-tight">
                  {a.clientName}
                </h3>
                <p className="text-xs text-orange-400 font-semibold mt-0.5">{a.norm} • {a.auditType}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 italic">"{a.scope}"</p>

                {/* Audit checklist & NC counters */}
                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Auditor Líder</span>
                    <span className="font-semibold text-slate-200 truncate block">{a.leadAuditor}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Não Conformidades</span>
                    <span className={`font-bold font-mono ${a.nonConformitiesCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {a.nonConformitiesCount} NCs registradas
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {a.startDate} a {a.endDate}
                  </span>
                  <span className="text-orange-400 font-bold group-hover:underline flex items-center gap-1">
                    Abrir Checklist ({a.checklistItems?.length || 0})
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[10px]">Gestor Técnico: {a.technicalManager}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Excluir auditoria ${a.code}?`)) {
                      deleteAudit(a.id);
                    }
                  }}
                  className="text-slate-500 hover:text-rose-400 text-[11px] font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: CENTRAL DE EXECUÇÃO DA AUDITORIA (WORKSPACE TÉCNICO) */}
      {currentAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-200">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <ClipboardCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-orange-400 border border-slate-700">
                      {currentAudit.code}
                    </span>
                    <h2 className="text-xl font-extrabold text-white leading-tight">
                      {currentAudit.clientName}
                    </h2>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(currentAudit.status)}`}>
                      {currentAudit.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentAudit.norm} • {currentAudit.auditType} • Auditor: {currentAudit.leadAuditor}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right sm:border-r border-slate-800 sm:pr-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Conformidade</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    {currentAudit.conformityScore}%
                  </span>
                </div>
                <button
                  onClick={() => setSelectedAuditForWorkspace(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Workspace Sub-Tabs */}
            <div className="px-5 border-b border-slate-800 bg-slate-950/70 flex items-center gap-1 overflow-x-auto scrollbar-none">
              {[
                { id: 'checklist' as const, label: `Checklist & Constatações (${currentAudit.checklistItems?.length || 0})`, icon: FileCheck2 },
                { id: 'escopo' as const, label: 'Planejamento & Escopo', icon: Calendar },
                { id: 'evidencias' as const, label: 'Evidências & Laudo', icon: Printer },
                { id: 'aprovacao' as const, label: 'Aprovação Técnica Formal', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = workspaceTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setWorkspaceTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'border-orange-500 text-orange-400'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Workspace Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* 1. ABA CHECKLIST & CONSTATAÇÕES */}
              {workspaceTab === 'checklist' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                        Checklist Normativo - {currentAudit.norm}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Avalie cada requisito. Ao marcar <strong>NC Menor</strong> ou <strong>NC Maior</strong>, utilize o botão direto para gerar Plano de Ação integrado.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-emerald-400 font-bold">
                        {currentAudit.checklistItems?.filter((i) => i.conformity === 'Conforme').length || 0} Conformes
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-amber-400 font-bold">
                        {currentAudit.checklistItems?.filter((i) => i.conformity.includes('NC')).length || 0} NCs
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(currentAudit.checklistItems || []).map((item) => {
                      const isNC = item.conformity === 'NC Menor' || item.conformity === 'NC Maior';
                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isNC
                              ? 'bg-slate-950 border-amber-600/60'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div>
                              <span className="text-xs font-bold text-white block">{item.requirement}</span>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">Processo: {item.processOrArea}</span>
                            </div>

                            {/* Conformity Selector */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {(['Conforme', 'Oportunidade de Melhoria', 'NC Menor', 'NC Maior'] as AuditFindingSeverity[]).map((sev) => (
                                <button
                                  key={sev}
                                  type="button"
                                  onClick={() => handleUpdateChecklistItem(currentAudit.id, item.id, sev)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                    item.conformity === sev
                                      ? sev === 'Conforme'
                                        ? 'bg-emerald-600 text-white border-emerald-500'
                                        : sev === 'Oportunidade de Melhoria'
                                        ? 'bg-blue-600 text-white border-blue-500'
                                        : sev === 'NC Menor'
                                        ? 'bg-amber-600 text-white border-amber-500'
                                        : 'bg-rose-600 text-white border-rose-500'
                                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {sev}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Evidence input */}
                          <div className="mt-2">
                            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                              Evidência Objetiva / Registro do Auditor:
                            </label>
                            <input
                              type="text"
                              value={item.evidence || ''}
                              onChange={(e) => handleUpdateChecklistItem(currentAudit.id, item.id, item.conformity, e.target.value)}
                              placeholder="Descreva a amostra analisada, procedimento ou desvio encontrado..."
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          {/* Rastreabilidade e Botão de Ação Direta para NC */}
                          {isNC && (
                            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                              <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                {item.actionPlanCreated
                                  ? 'Plano de Ação (CAPA) já gerado e vinculado para esta ocorrência.'
                                  : 'Não conformidade requer plano de ação formal (CAPA).'}
                              </span>

                              {!item.actionPlanCreated ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedNCForPlan({ auditId: currentAudit.id, item })}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                                >
                                  <CheckSquare className="w-3.5 h-3.5" />
                                  <span>Abrir Plano de Ação Vinculado</span>
                                </button>
                              ) : (
                                <span className="text-xs text-emerald-400 font-bold font-mono">
                                  ✓ Vinculado aos Planos de Ação
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. ABA PLANEJAMENTO & ESCOPO */}
              {workspaceTab === 'escopo' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">Planejamento do Ciclo</h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Organização Auditada</span>
                          <span className="font-bold text-white">{currentAudit.clientName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Endereço / Unidade Operacional</span>
                          <span className="text-slate-300">{currentAudit.clientAddress}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Data Início</span>
                            <span className="font-mono text-slate-200">{currentAudit.startDate}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Data Encerramento</span>
                            <span className="font-mono text-slate-200">{currentAudit.endDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">Equipe Auditora</h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Auditor Líder IRCA</span>
                          <span className="font-bold text-white">{currentAudit.leadAuditor}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Equipe Técnica</span>
                          <span className="text-slate-300">{currentAudit.auditTeam}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Gestor Técnico Homologador</span>
                          <span className="text-slate-200">{currentAudit.technicalManager}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">Escopo da Certificação</h4>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "{currentAudit.scope}"
                    </p>
                  </div>
                </div>
              )}

              {/* 3. ABA EVIDÊNCIAS & LAUDO */}
              {workspaceTab === 'evidencias' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">Laudo Técnico da Auditoria</h4>
                      <p className="text-xs text-slate-400">Síntese executiva dos achados, pontuação consolidada e laudo emitido.</p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-orange-400" />
                      <span>Imprimir Laudo Oficial</span>
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="font-mono text-orange-400 font-bold">REL-{currentAudit.code}</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">Score: {currentAudit.conformityScore}%</span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">
                      Auditoria de conformidade executada com base na norma <strong>{currentAudit.norm}</strong> para a organização <strong>{currentAudit.clientName}</strong>.
                      Foram verificados processos de liderança, operação e controle de riscos com {currentAudit.nonConformitiesCount} apontamentos de não conformidade.
                    </p>
                  </div>
                </div>
              )}

              {/* 4. ABA APROVAÇÃO TÉCNICA FORMAL */}
              {workspaceTab === 'aprovacao' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      Aprovação Técnica Formal do Comitê Deliberativo
                    </h4>
                    <p className="text-xs text-slate-400">
                      Homologação do relatório com chave criptográfica SHA-256 e avanço para o ciclo de certificação.
                    </p>
                  </div>

                  {currentAudit.technicalApproval ? (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 uppercase font-semibold text-[10px]">Parecer Registrado:</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          currentAudit.technicalApproval.decision === 'Aprovado'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {currentAudit.technicalApproval.decision}
                        </span>
                      </div>
                      <p className="text-slate-300 italic">"{currentAudit.technicalApproval.comments}"</p>
                      <div className="pt-3 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
                        <span>Homologador: {currentAudit.technicalApproval.approvedBy}</span>
                        <span className="font-mono">{currentAudit.technicalApproval.approvedAt}</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-xl text-[10px] font-mono text-emerald-400 truncate">
                        Hash: {currentAudit.technicalApproval.signatureHash}
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                      <p className="text-slate-300">
                        Esta auditoria ainda não possui parecer técnico emitido. Você pode deliberar agora para emitir aprovação formal:
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            submitAuditTechnicalApproval(currentAudit.id, {
                              approvedBy: 'Bruno Alvarenga - Gerente Técnico Sênior (IRCA)',
                              approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                              decision: 'Aprovado',
                              comments: `Auditoria homologada com base no índice de conformidade de ${currentAudit.conformityScore}%. Apto para certificação.`,
                              signatureHash: `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}:${Date.now()}`,
                            });
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                        >
                          Aprovar Auditoria Tecnicamente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedAuditForWorkspace(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
              >
                Fechar Painel Técnico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ABERTURA RÁPIDA DE PLANO DE AÇÃO A PARTIR DE NC */}
      {selectedNCForPlan && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base">Abrir Plano de Ação Vinculado (CAPA)</h3>
                <p className="text-xs text-slate-400">Integrando diretamente da constatação de auditoria sem retrabalho.</p>
              </div>
              <button onClick={() => setSelectedNCForPlan(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreatePlanFromNC} className="p-5 space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-500 block text-[10px] uppercase">Requisito Auditado</span>
                <span className="font-bold text-white block mt-0.5">{selectedNCForPlan.item.requirement}</span>
                <span className="text-amber-400 font-semibold text-[11px] block mt-1">Gravidade: {selectedNCForPlan.item.conformity}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Responsável pela Ação Corretiva *</label>
                <input
                  type="text"
                  required
                  value={planResponsible}
                  onChange={(e) => setPlanResponsible(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prazo de Fechamento</label>
                  <input
                    type="date"
                    required
                    value={planDeadline}
                    onChange={(e) => setPlanDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prioridade</label>
                  <select
                    value={planPriority}
                    onChange={(e) => setPlanPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedNCForPlan(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 cursor-pointer"
                >
                  Criar e Vincular Ação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA AUDITORIA */}
      {isNewAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base">Nova Auditoria de Conformidade</h3>
                <p className="text-xs text-slate-400">Planejamento e abertura de ciclo de avaliação técnica.</p>
              </div>
              <button onClick={() => setIsNewAuditModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAudit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Organização Auditada *</label>
                  <select
                    value={formData.supplierOrClientId}
                    onChange={(e) => {
                      const sel = suppliers.find((s) => s.id === e.target.value);
                      setFormData({
                        ...formData,
                        supplierOrClientId: e.target.value,
                        clientName: sel ? sel.tradeName : '',
                        clientAddress: sel ? `${sel.city} - ${sel.state}` : formData.clientAddress,
                      });
                    }}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.tradeName} ({s.cnpj})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Auditoria</label>
                  <select
                    value={formData.auditType}
                    onChange={(e) => setFormData({ ...formData, auditType: e.target.value as AuditType })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="1ª Parte (Interna)">1ª Parte (Interna)</option>
                    <option value="2ª Parte (Fornecedor)">2ª Parte (Fornecedor)</option>
                    <option value="3ª Parte (Certificação)">3ª Parte (Certificação)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Norma de Referência</label>
                  <select
                    value={formData.norm}
                    onChange={(e) => setFormData({ ...formData, norm: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    {STANDARD_NORMS.map((n) => (
                      <option key={n.code} value={n.code}>{n.code} - {n.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data Conclusão</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Auditor Líder IRCA</label>
                  <input
                    type="text"
                    value={formData.leadAuditor}
                    onChange={(e) => setFormData({ ...formData, leadAuditor: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Inicial</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AuditStatus })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Planejada">Planejada</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Escopo Auditado</label>
                  <textarea
                    rows={2}
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAuditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 cursor-pointer"
                >
                  Abrir Ciclo de Auditoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
