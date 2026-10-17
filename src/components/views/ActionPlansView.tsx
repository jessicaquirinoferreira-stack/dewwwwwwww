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
  X,
  ShieldCheck,
  Search,
  ExternalLink,
  History,
  AlertOctagon,
  HelpCircle,
  FileText,
  BadgeAlert,
  ArrowRight,
  Check,
  RotateCcw
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { StatCard } from '../common/StatCard';
import { EmptyState } from '../common/EmptyState';
import {
  ActionPlan,
  ActionPlanStatus,
  ActionPlan5W2H,
  ActionPlanRootCauseIshikawa
} from '../../types';

export const ActionPlansView: React.FC = () => {
  const { theme } = useTheme();
  const {
    actionPlans,
    addActionPlan,
    updateActionPlan,
    deleteActionPlan,
    updateActionPlan5W2H,
    updateActionPlanIshikawa,
    updateActionPlan5Whys,
    verifyActionPlanEffectiveness,
    audits,
    suppliers
  } = useData();

  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [priorityFilter, setPriorityFilter] = useState<'Todos' | 'Alta' | 'Média' | 'Baixa'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);

  // Selected plan for full workspace modal (5W2H, Ishikawa, 5 Whys, Effectiveness)
  const [selectedPlanForWorkspace, setSelectedPlanForWorkspace] = useState<ActionPlan | null>(null);
  const [planWorkspaceTab, setPlanWorkspaceTab] = useState<'geral' | 'contencao' | 'causa-raiz' | '5w2h' | 'eficacia' | 'historico'>('geral');

  // Form State for new plan
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    auditCode: '',
    supplierName: '',
    ncRequirement: 'Cláusula 10.2 - Não Conformidade e Ação Corretiva',
    responsible: 'Coordenação de Qualidade',
    deadline: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
    status: 'Aberto' as ActionPlanStatus,
    priority: 'Alta' as 'Alta' | 'Média' | 'Baixa',
    correctiveAction: '',
    rootCause: '',
    containmentAction: '',
  });

  // Current selected plan from state
  const currentPlan = selectedPlanForWorkspace
    ? actionPlans.find((p) => p.id === selectedPlanForWorkspace.id) || selectedPlanForWorkspace
    : null;

  // Local state for 5W2H editing
  const [local5W2H, setLocal5W2H] = useState<ActionPlan5W2H>({
    what: '',
    why: '',
    where: '',
    whenDeadline: '',
    whoResponsible: '',
    howMethod: '',
    howMuchCost: '',
  });

  // Local state for Ishikawa editing
  const [localIshikawa, setLocalIshikawa] = useState<ActionPlanRootCauseIshikawa>({
    method: '',
    machine: '',
    measurement: '',
    environment: '',
    manpower: '',
    material: '',
    primaryRootCause: '',
  });

  // Local state for 5 Whys
  const [local5Whys, setLocal5Whys] = useState<string[]>(['', '', '', '', '']);

  // Local state for Effectiveness Verification
  const [effVerifiedBy, setEffVerifiedBy] = useState('Auditor Líder IRCA');
  const [effNotes, setEffNotes] = useState('');
  const [effResult, setEffResult] = useState<boolean>(true);

  // Helper to sync modal state when plan opens
  const handleOpenPlanWorkspace = (plan: ActionPlan) => {
    setSelectedPlanForWorkspace(plan);
    setPlanWorkspaceTab('geral');
    setLocal5W2H(plan.method5W2H || {
      what: plan.correctiveAction || plan.title,
      why: 'Eliminar reincidência e garantir conformidade com o requisito auditado.',
      where: 'Planta de Produção / Área Auditada',
      whenDeadline: plan.deadline,
      whoResponsible: plan.responsible,
      howMethod: 'Revisão procedimental, treinamento e calibração de instrumentos.',
      howMuchCost: 'R$ 0,00',
    });
    setLocalIshikawa(plan.ishikawa || {
      method: '',
      machine: '',
      measurement: '',
      environment: '',
      manpower: '',
      material: '',
      primaryRootCause: plan.rootCause || '',
    });
    setLocal5Whys(plan.fiveWhys || ['', '', '', '', '']);
    if (plan.effectivenessVerification) {
      setEffVerifiedBy(plan.effectivenessVerification.verifiedBy);
      setEffNotes(plan.effectivenessVerification.notes);
      setEffResult(plan.effectivenessVerification.isEffective);
    } else {
      setEffVerifiedBy('Auditor Líder IRCA');
      setEffNotes('');
      setEffResult(true);
    }
  };

  // Check deadline alert
  const getDeadlineAlert = (deadlineStr: string, status: ActionPlanStatus) => {
    if (status === 'Concluído') return { label: 'Concluído', color: 'emerald', days: 0 };
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Atrasado por ${Math.abs(diffDays)} dias`, color: 'rose', days: diffDays };
    } else if (diffDays <= 5) {
      return { label: `Vence em ${diffDays} dias`, color: 'amber', days: diffDays };
    }
    return { label: `No prazo (${diffDays} dias)`, color: 'emerald', days: diffDays };
  };

  // Filtered Plans
  const filteredPlans = actionPlans.filter((p) => {
    const matchesStatus = filterStatus === 'Todos' ? true : p.status === filterStatus;
    const matchesPriority = priorityFilter === 'Todos' ? true : p.priority === priorityFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.responsible.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.auditCode && p.auditCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.supplierName && p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Key stats
  const totalCount = actionPlans.length;
  const abertosCount = actionPlans.filter((p) => p.status === 'Aberto' || p.status === 'Pendente').length;
  const emAndamentoCount = actionPlans.filter((p) => p.status === 'Em Andamento').length;
  const atrasadosCount = actionPlans.filter((p) => {
    if (p.status === 'Concluído') return false;
    const alert = getDeadlineAlert(p.deadline, p.status);
    return alert.days < 0 || p.status === 'Atrasado';
  }).length;
  const concluidosCount = actionPlans.filter((p) => p.status === 'Concluído').length;

  // Handle Create Plan
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.responsible) return;

    addActionPlan({
      ...formData,
      method5W2H: {
        what: formData.correctiveAction || formData.title,
        why: 'Mitigar risco operacional e atender requisitos normativos do SGQ.',
        where: 'Área Operacional',
        whenDeadline: formData.deadline,
        whoResponsible: formData.responsible,
        howMethod: 'Implementação de plano corretivo 5W2H.',
        howMuchCost: 'R$ 0,00',
      },
      fiveWhys: ['', '', '', '', ''],
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'Plano cadastrado no sistema',
          author: formData.responsible,
        },
      ],
    });

    setIsNewPlanModalOpen(false);
    setFormData({
      title: '',
      description: '',
      auditCode: '',
      supplierName: '',
      ncRequirement: 'Cláusula 10.2 - Não Conformidade e Ação Corretiva',
      responsible: 'Coordenação de Qualidade',
      deadline: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
      status: 'Aberto',
      priority: 'Alta',
      correctiveAction: '',
      rootCause: '',
      containmentAction: '',
    });
  };

  // Status Badge Helper
  const getStatusColor = (status: ActionPlanStatus) => {
    switch (status) {
      case 'Concluído':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'Em Andamento':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'Aguardando Verificação':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      case 'Aberto':
      case 'Pendente':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'Atrasado':
      case 'Ineficaz':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
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
              TRATAMENTO DE NÃO CONFORMIDADES (CAPA)
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">Ishikawa 6M · 5 Porquês · 5W2H</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Planos de Ação Corretiva & Preventiva (CAPA)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Integração automática com auditorias, contenção imediata, análise profunda de causa-raiz (Ishikawa & 5 Porquês), matriz 5W2H e verificação formal de eficácia.
          </p>
        </div>

        <button
          onClick={() => setIsNewPlanModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Plano de Ação</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          label="TOTAL DE AÇÕES"
          value={totalCount}
          subtitle="Ocorrências mapeadas"
          icon={CheckSquare}
          badge="Total"
          badgeColor="stone"
          active={filterStatus === 'Todos'}
          onClick={() => setFilterStatus('Todos')}
        />
        <StatCard
          label="ABERTOS / PENDENTES"
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
          subtitle="Implementação 5W2H"
          icon={Clock}
          badge="Em Curso"
          badgeColor="blue"
          active={filterStatus === 'Em Andamento'}
          onClick={() => setFilterStatus('Em Andamento')}
        />
        <StatCard
          label="AÇÕES ATRASADAS"
          value={atrasadosCount}
          subtitle="Prazo expirado"
          icon={AlertOctagon}
          badge="Críticos"
          badgeColor="red"
          active={filterStatus === 'Atrasado'}
          onClick={() => setFilterStatus('Atrasado')}
        />
        <StatCard
          label="CONCLUÍDAS COM EFICÁCIA"
          value={concluidosCount}
          subtitle="Eficácia comprovada"
          icon={CheckCircle2}
          badge="Concluídas"
          badgeColor="green"
          active={filterStatus === 'Concluído'}
          onClick={() => setFilterStatus('Concluído')}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border transition-colors ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {(['Todos', 'Aberto', 'Em Andamento', 'Aguardando Verificação', 'Atrasado', 'Concluído', 'Ineficaz'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="text-[11px] font-bold uppercase">Prioridade:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className={`text-xs px-2.5 py-1.5 rounded-xl border focus:outline-none focus:border-orange-500 ${
                  theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              >
                <option value="Todos">Todas</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>

            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por título, responsável, auditoria..."
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
      </div>

      {/* Plans List */}
      {filteredPlans.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Nenhum plano de ação encontrado"
          description={
            actionPlans.length === 0
              ? 'Não há planos de ação cadastrados. Registre uma nova ação corretiva ou abra a partir de uma constatação de auditoria.'
              : 'Nenhum plano corresponde aos filtros selecionados.'
          }
          actionLabel="+ Novo Plano"
          onAction={() => setIsNewPlanModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlans.map((p) => {
            const deadlineAlert = getDeadlineAlert(p.deadline, p.status);
            return (
              <div
                key={p.id}
                onClick={() => handleOpenPlanWorkspace(p)}
                className={`border rounded-2xl p-5 shadow-sm transition-all relative flex flex-col justify-between cursor-pointer group hover:scale-[1.008] ${
                  deadlineAlert.days < 0 && p.status !== 'Concluído'
                    ? 'bg-slate-900/95 border-rose-700/80 hover:border-rose-500'
                    : theme === 'light'
                    ? 'bg-white border-slate-200 hover:border-orange-500/50 hover:shadow-md'
                    : 'bg-slate-900/90 border-slate-800 hover:border-orange-500/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        p.priority === 'Alta'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                          : p.priority === 'Média'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        Prioridade {p.priority}
                      </span>
                      {p.auditCode && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-orange-400 border border-slate-700">
                          {p.auditCode}
                        </span>
                      )}
                    </div>

                    {/* Deadline Alert Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      deadlineAlert.color === 'rose'
                        ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                        : deadlineAlert.color === 'amber'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      {deadlineAlert.label}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors leading-tight">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {p.description}
                  </p>

                  {/* Vinculação de Fornecedor & Requisito */}
                  {(p.supplierName || p.ncRequirement) && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-0.5">
                      {p.supplierName && (
                        <div className="text-slate-300 font-semibold truncate">
                          Organização: <span className="text-white">{p.supplierName}</span>
                        </div>
                      )}
                      {p.ncRequirement && (
                        <div className="text-orange-400 font-mono text-[10px] truncate">
                          Requisito: {p.ncRequirement}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase">Responsável</span>
                      <span className="font-semibold text-slate-200 truncate block">
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
                  <span className="text-orange-400 font-bold group-hover:underline inline-flex items-center gap-1">
                    Tratar 5W2H & Ishikawa
                    <ArrowRight className="w-3 h-3" />
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remover o plano "${p.title}"?`)) {
                        deleteActionPlan(p.id);
                      }
                    }}
                    className="text-slate-500 hover:text-rose-400 text-[11px] font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: WORKSPACE COMPLETO DO PLANO DE AÇÃO (5W2H, ISHIKAWA, EFICÁCIA) */}
      {currentPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-200">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <CheckSquare className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-extrabold text-white leading-tight">
                      {currentPlan.title}
                    </h2>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(currentPlan.status)}`}>
                      {currentPlan.status}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      currentPlan.priority === 'Alta' ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      Prioridade {currentPlan.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentPlan.auditCode ? `Vinculado à Auditoria ${currentPlan.auditCode}` : 'Ação Avulsa'} • Resp: {currentPlan.responsible} • Prazo: {currentPlan.deadline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={currentPlan.status}
                  onChange={(e) => updateActionPlan(currentPlan.id, { status: e.target.value as ActionPlanStatus })}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-orange-500"
                >
                  <option value="Aberto">Aberto</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Aguardando Verificação">Aguardando Verificação</option>
                  <option value="Atrasado">Atrasado</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Ineficaz">Ineficaz (Reaberto)</option>
                </select>

                <button
                  onClick={() => setSelectedPlanForWorkspace(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Sub-Tabs */}
            <div className="px-5 border-b border-slate-800 bg-slate-950/70 flex items-center gap-1 overflow-x-auto scrollbar-none">
              {[
                { id: 'geral' as const, label: 'Identificação & Dados', icon: FileText },
                { id: 'contencao' as const, label: 'Contenção Imediata', icon: ShieldCheck },
                { id: 'causa-raiz' as const, label: 'Causa-Raiz (Ishikawa & 5 Porquês)', icon: HelpCircle },
                { id: '5w2h' as const, label: 'Plano 5W2H', icon: CheckSquare },
                { id: 'eficacia' as const, label: 'Verificação de Eficácia', icon: CheckCircle2 },
                { id: 'historico' as const, label: 'Histórico da Ocorrência', icon: History },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = planWorkspaceTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setPlanWorkspaceTab(tab.id)}
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

            {/* Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* 1. ABA GERAL */}
              {planWorkspaceTab === 'geral' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Descrição da Não Conformidade</span>
                      <p className="text-slate-300 leading-relaxed">{currentPlan.description}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Requisito & Organização</span>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Organização:</span>
                          <span className="text-white font-bold">{currentPlan.supplierName || 'Empresa Cadastrada'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Origem:</span>
                          <span className="text-orange-400 font-mono">{currentPlan.auditCode || 'Ação Avulsa'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Requisito:</span>
                          <span className="text-slate-300 truncate max-w-[200px]">{currentPlan.ncRequirement}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ABA CONTENÇÃO IMEDIATA */}
              {planWorkspaceTab === 'contencao' && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Ação de Contenção Imediata (Disposição Provisória)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Medida emergencial adotada para bloquear o desvio e isolar produtos ou processos sob risco antes da ação corretiva definitiva.
                  </p>

                  <textarea
                    rows={3}
                    value={currentPlan.containmentAction || ''}
                    onChange={(e) => updateActionPlan(currentPlan.id, { containmentAction: e.target.value })}
                    placeholder="Descreva a contenção (ex: Bloqueio imediato do lote, inspeção 100%, segregação física em quarentena)..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={() => alert('Ação de contenção registrada!')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
                    >
                      Salvar Contenção
                    </button>
                  </div>
                </div>
              )}

              {/* 3. ABA CAUSA-RAIZ (ISHIKAWA 6M & 5 PORQUÊS) */}
              {planWorkspaceTab === 'causa-raiz' && (
                <div className="space-y-5">
                  {/* Diagrama de Ishikawa 6M */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                        Diagrama de Ishikawa (Espinha de Peixe / 6M)
                      </h4>
                      <p className="text-xs text-slate-400">Mapeamento das causas potenciais por dimensão operacional.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {[
                        { label: '1. Método (Procedimentos)', key: 'method' },
                        { label: '2. Máquina (Equipamentos)', key: 'machine' },
                        { label: '3. Medida (Indicadores / Calibração)', key: 'measurement' },
                        { label: '4. Meio Ambiente (Condições)', key: 'environment' },
                        { label: '5. Mão de Obra (Capacitação)', key: 'manpower' },
                        { label: '6. Material (Insumos)', key: 'material' },
                      ].map((m) => (
                        <div key={m.key} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <span className="text-slate-400 font-semibold block text-[11px]">{m.label}</span>
                          <input
                            type="text"
                            value={(localIshikawa as any)[m.key] || ''}
                            onChange={(e) => setLocalIshikawa({ ...localIshikawa, [m.key]: e.target.value })}
                            placeholder="Possível causa..."
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="text-slate-400 block text-xs font-bold mb-1">Causa Raiz Primária Validada</label>
                      <input
                        type="text"
                        value={localIshikawa.primaryRootCause || ''}
                        onChange={(e) => setLocalIshikawa({ ...localIshikawa, primaryRootCause: e.target.value })}
                        placeholder="Conclusão fundamental da análise de causa..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          updateActionPlanIshikawa(currentPlan.id, localIshikawa);
                          alert('Diagrama de Ishikawa salvo com sucesso!');
                        }}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 cursor-pointer"
                      >
                        Salvar Análise Ishikawa
                      </button>
                    </div>
                  </div>

                  {/* 5 Porquês */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      Técnica dos 5 Porquês (Why-Why Analysis)
                    </h4>
                    <div className="space-y-2">
                      {local5Whys.map((why, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="w-16 font-mono font-bold text-orange-400 shrink-0">
                            {idx + 1}º Por quê?
                          </span>
                          <input
                            type="text"
                            value={why}
                            onChange={(e) => {
                              const updated = [...local5Whys];
                              updated[idx] = e.target.value;
                              setLocal5Whys(updated);
                            }}
                            placeholder={idx === 4 ? 'Causa fundamental (5º Porquê)...' : `Motivo ${idx + 1}...`}
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          updateActionPlan5Whys(currentPlan.id, local5Whys);
                          alert('5 Porquês salvos!');
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
                      >
                        Salvar 5 Porquês
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. ABA PLANO 5W2H */}
              {planWorkspaceTab === '5w2h' && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      Plano de Ação Corretiva - Metodologia 5W2H
                    </h4>
                    <p className="text-xs text-slate-400">Definição estruturada de execução, responsabilidade e custos.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">What (O que será feito?)</label>
                      <input
                        type="text"
                        value={local5W2H.what}
                        onChange={(e) => setLocal5W2H({ ...local5W2H, what: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Why (Por que será feito?)</label>
                      <input
                        type="text"
                        value={local5W2H.why}
                        onChange={(e) => setLocal5W2H({ ...local5W2H, why: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Where (Onde será feito?)</label>
                      <input
                        type="text"
                        value={local5W2H.where}
                        onChange={(e) => setLocal5W2H({ ...local5W2H, where: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">When (Quando / Prazo limite?)</label>
                      <input
                        type="date"
                        value={local5W2H.whenDeadline}
                        onChange={(e) => setLocal5W2H({ ...local5W2H, whenDeadline: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Who (Quem é o responsável?)</label>
                      <input
                        type="text"
                        value={local5W2H.whoResponsible}
                        onChange={(e) => setLocal5W2H({ ...local5W2H, whoResponsible: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">How Much (Quanto custará?)</label>
                      <input
                        type="text"
                        value={local5W2H.howMuchCost}
                        onChange={(e) => setLocal5W2H({ ...local5W2H, howMuchCost: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-slate-400 font-semibold block mb-1">How (Como será feito / Método?)</label>
                      <textarea
                        rows={2}
                        value={local5W2H.howMethod}
                        onChange={(e) => setLocal5W2H({ ...local5W2H, howMethod: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        updateActionPlan5W2H(currentPlan.id, local5W2H);
                        alert('Matriz 5W2H atualizada com sucesso!');
                      }}
                      className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 cursor-pointer"
                    >
                      Salvar Plano 5W2H
                    </button>
                  </div>
                </div>
              )}

              {/* 5. ABA VERIFICAÇÃO DE EFICÁCIA */}
              {planWorkspaceTab === 'eficacia' && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      Verificação Formal de Eficácia
                    </h4>
                    <p className="text-xs text-slate-400">
                      Avaliação se a ação corretiva eliminou a causa-raiz e impediu a reincidência do desvio.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Resultado da Verificação</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setEffResult(true)}
                          className={`flex-1 py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                            effResult
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          ✓ Ação Eficaz (Concluir Ocorrência)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEffResult(false)}
                          className={`flex-1 py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                            !effResult
                              ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          ✕ Ineficaz (Reabrir Análise de Causa)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Auditor / Verificador Responsável</label>
                      <input
                        type="text"
                        value={effVerifiedBy}
                        onChange={(e) => setEffVerifiedBy(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Evidências Objetivas da Eficácia</label>
                      <textarea
                        rows={3}
                        value={effNotes}
                        onChange={(e) => setEffNotes(e.target.value)}
                        placeholder="Comprovação de ausência de reincidência, lote teste auditado, certificado RBC anexado..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          verifyActionPlanEffectiveness(currentPlan.id, effResult, effNotes, effVerifiedBy);
                          alert(`Verificação registrada como ${effResult ? 'EFICAZ' : 'INEFICAZ'}!`);
                        }}
                        className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 cursor-pointer"
                      >
                        Registrar Parecer de Eficácia
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. ABA HISTÓRICO DA OCORRÊNCIA */}
              {planWorkspaceTab === 'historico' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Histórico Auditável da Ocorrência
                  </h4>
                  <div className="space-y-2">
                    {(currentPlan.history || [
                      {
                        timestamp: new Date().toISOString(),
                        action: 'Ação aberta e registrada no sistema',
                        author: currentPlan.responsible,
                      },
                    ]).map((h, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white block">{h.action}</span>
                          <span className="text-slate-500 text-[10px]">Por: {h.author}</span>
                        </div>
                        <span className="font-mono text-slate-400 text-[10px]">{h.timestamp.replace('T', ' ').substring(0, 16)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedPlanForWorkspace(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO PLANO DE AÇÃO */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base">Novo Plano de Ação (CAPA)</h3>
                <p className="text-xs text-slate-400">Tratamento de desvio ou não conformidade identificada.</p>
              </div>
              <button onClick={() => setIsNewPlanModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título da Ação *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Calibração de termopares e revisão do plano preventivo"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição do Desvio / Ocorrência</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhe a não conformidade encontrada..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Responsável *</label>
                  <input
                    type="text"
                    required
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prazo de Fechamento</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Inicial</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Aberto">Aberto</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 cursor-pointer"
                >
                  Cadastrar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
