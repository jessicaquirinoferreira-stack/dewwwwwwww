import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Sliders,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Search,
  FileText,
  Printer,
  Copy,
  Trash2,
  Edit3,
  Eye,
  ShieldCheck,
  Building2,
  ChevronRight,
  TrendingUp,
  Percent,
  Check,
  X,
  FileCheck2,
  Sparkles,
  Zap,
  Bookmark,
  Calendar,
  BarChart2,
  Target,
  ArrowRight,
  Upload,
  Paperclip,
  CheckSquare,
  HelpCircle,
  History
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { EmptyState } from '../common/EmptyState';
import {
  ModularProcess,
  ModularProcessCategory,
  ModularEvaluationMethod,
  ModularProcessCriterion,
  ModularCalculationRule,
  ModularProcessStatus,
  SipocItem,
  ActionPlan,
  ActionPlanStatus,
  ActionPlan5W2H,
  ActionPlanRootCauseIshikawa
} from '../../types';

interface ModularProcessViewProps {
  onNavigateToTab?: (tab: string) => void;
  onOpenAuditTab?: () => void;
}

const CATEGORY_LABELS: Record<ModularProcessCategory, string> = {
  processo_produtivo: 'Processo Produtivo',
  produto: 'Auditoria de Produto',
  fornecedor: 'Fornecedor / IQF Custom',
  processo_especial: 'Processo Especial (Soldagem/Pintura/Tratamento)',
  inspecao_tecnica: 'Inspeção Técnica',
  diagnostico_gestao: 'Diagnóstico de Gestão',
  financeiro: 'Análise Financeira & Custos',
  mercado: 'Análise de Mercado',
  viabilidade_produto: 'Estudo de Viabilidade (Gate)',
  maturidade: 'Maturidade Organizacional (1-5)',
  riscos_oportunidades: 'Riscos & Oportunidades (ISO 31000)',
  desempenho_operacional: 'Desempenho Operacional',
  checklist_personalizado: 'Checklist Personalizado',
  outro: 'Modelo Personalizado'
};

const METHOD_LABELS: Record<ModularEvaluationMethod, string> = {
  conformity: 'Conforme / Não Conforme',
  three_levels: 'Atende / Parcial / Não Atende',
  score_5: 'Escala de 0 a 5',
  percentage: 'Percentual (0 a 100%)',
  maturity_levels: 'Níveis de Maturidade (1 a 5)',
  risk_levels: 'Risco (Baixo / Médio / Alto / Crítico)',
  approval: 'Aprovado / Reprovado / Com Ressalvas',
  custom: 'Critérios Customizados'
};

export const ModularProcessView: React.FC<ModularProcessViewProps> = ({
  onNavigateToTab,
  onOpenAuditTab
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const {
    modularProcesses,
    addModularProcess,
    updateModularProcess,
    deleteModularProcess,
    duplicateModularProcess,
    saveAsModularTemplate,
    suppliers
  } = useData();

  // Filters & Search
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Active Process States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [selectedProcessForExec, setSelectedProcessForExec] = useState<ModularProcess | null>(null);
  const [execTab, setExecTab] = useState<'criteria' | 'sipoc' | 'action_plans'>('criteria');
  const [selectedProcessForReport, setSelectedProcessForReport] = useState<ModularProcess | null>(null);
  const [selectedProcessForTemplate, setSelectedProcessForTemplate] = useState<ModularProcess | null>(null);
  const [templateNameInput, setTemplateNameInput] = useState('');

  // Wizard New Process Form State (Etapas 1, 2, 3)
  const [newProcessForm, setNewProcessForm] = useState<{
    code: string;
    title: string;
    purpose: string;
    category: ModularProcessCategory;
    clientOrUnit: string;
    responsible: string;
    date: string;
    evaluationMethod: ModularEvaluationMethod;
    calculationType: 'weighted_average' | 'simple_sum' | 'percentage' | 'maturity_index' | 'go_no_go';
    acceptanceThreshold: number;
    criticalItemOverride: boolean;
    criteria: ModularProcessCriterion[];
  }>({
    code: `PROC-MOD-2026-${Math.floor(Math.random() * 899 + 100)}`,
    title: '',
    purpose: '',
    category: 'processo_especial',
    clientOrUnit: '',
    responsible: user?.name || 'Bruno Alvarenga',
    date: new Date().toISOString().split('T')[0],
    evaluationMethod: 'three_levels',
    calculationType: 'weighted_average',
    acceptanceThreshold: 80,
    criticalItemOverride: true,
    criteria: [
      {
        id: `crit-${Date.now()}-1`,
        code: 'CRIT-01',
        title: 'Qualificação técnica de operadores e procedimentos',
        categoryOrPillar: 'Pilar Técnico',
        description: 'Verificação de registros de qualificação, treinamento e atendimento a procedimentos.',
        weight: 2.0,
        criticality: 'Crítica',
        value: 'Atende',
        scorePercentage: 100,
        statusLabel: 'Atende',
        evidenceNotes: '',
      },
      {
        id: `crit-${Date.now()}-2`,
        code: 'CRIT-02',
        title: 'Calibração e controle de equipamentos e instrumentos',
        categoryOrPillar: 'Pilar Equipamentos',
        description: 'Certificados de calibração vigentes (RBC) e verificação diária de setup.',
        weight: 1.5,
        criticality: 'Alta',
        value: 'Atende',
        scorePercentage: 100,
        statusLabel: 'Atende',
        evidenceNotes: '',
      },
      {
        id: `crit-${Date.now()}-3`,
        code: 'CRIT-03',
        title: 'Controle de qualidade e ensaios do produto / processo',
        categoryOrPillar: 'Pilar Qualidade',
        description: 'Inspeção dimensional, testes laboratoriais e amostragem conforme especificação.',
        weight: 2.0,
        criticality: 'Crítica',
        value: 'Atende',
        scorePercentage: 100,
        statusLabel: 'Atende',
        evidenceNotes: '',
      }
    ]
  });

  // Filter processes
  const filteredProcesses = modularProcesses.filter((proc) => {
    const matchesCategory = selectedCategoryFilter === 'all' || proc.category === selectedCategoryFilter;
    const matchesStatus = selectedStatusFilter === 'all' || proc.status === selectedStatusFilter;
    const matchesSearch =
      searchQuery === '' ||
      proc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.clientOrUnit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.responsible.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Template processes (salvos como modelo)
  const templateProcesses = modularProcesses.filter((p) => p.isTemplate);

  // KPIs
  const totalCount = modularProcesses.length;
  const emAndamentoCount = modularProcesses.filter((p) => p.status === 'Em Andamento' || p.status === 'Planejado').length;
  const concluidosCount = modularProcesses.filter((p) => p.status === 'Concluído' || p.status === 'Homologado').length;
  const templatesCount = templateProcesses.length;
  const avgScore =
    totalCount > 0
      ? Math.round(
          modularProcesses.reduce((acc, p) => acc + (p.overallScore || 0), 0) / totalCount
        )
      : 0;

  // Add new criterion in wizard
  const handleAddCriterionInWizard = () => {
    const num = newProcessForm.criteria.length + 1;
    const newCrit: ModularProcessCriterion = {
      id: `crit-${Date.now()}-${num}`,
      code: `CRIT-${String(num).padStart(2, '0')}`,
      title: `Critério de Verificação #${num}`,
      categoryOrPillar: 'Geral',
      description: 'Descrição objetiva do critério e evidência esperada.',
      weight: 1.0,
      criticality: 'Média',
      value: newProcessForm.evaluationMethod === 'score_5' ? 5 : 'Atende',
      scorePercentage: 100,
      statusLabel: 'Atende',
      evidenceNotes: '',
    };
    setNewProcessForm((prev) => ({
      ...prev,
      criteria: [...prev.criteria, newCrit]
    }));
  };

  // Remove criterion in wizard
  const handleRemoveCriterionInWizard = (id: string) => {
    if (newProcessForm.criteria.length <= 1) return;
    setNewProcessForm((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((c) => c.id !== id)
    }));
  };

  // Save New Process from Wizard
  const handleSaveNewProcess = () => {
    if (!newProcessForm.title.trim()) {
      alert('Por favor, informe o nome da análise.');
      return;
    }

    // Calculate initial overall score based on criteria
    const totalWeight = newProcessForm.criteria.reduce((sum, c) => sum + (c.weight || 1), 0);
    const weightedSum = newProcessForm.criteria.reduce(
      (sum, c) => sum + (c.scorePercentage || 100) * (c.weight || 1),
      0
    );
    const calculatedScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 100;

    let classificationResult = 'Em Avaliação';
    if (calculatedScore >= newProcessForm.acceptanceThreshold) {
      classificationResult = `Aprovado (${calculatedScore}%)`;
    } else {
      classificationResult = `Em Correção (${calculatedScore}%)`;
    }

    addModularProcess({
      code: newProcessForm.code,
      title: newProcessForm.title,
      purpose: newProcessForm.purpose || 'Avaliação técnica personalizada.',
      category: newProcessForm.category,
      clientOrUnit: newProcessForm.clientOrUnit || 'Unidade Fabril / Corporativa',
      responsible: newProcessForm.responsible,
      date: newProcessForm.date,
      status: 'Em Andamento',
      evaluationMethod: newProcessForm.evaluationMethod,
      calculationRules: {
        calculationType: newProcessForm.calculationType,
        acceptanceThreshold: newProcessForm.acceptanceThreshold,
        criticalItemOverride: newProcessForm.criticalItemOverride,
      },
      criteria: newProcessForm.criteria,
      overallScore: calculatedScore,
      classificationResult,
      strongPoints: ['Metodologia personalizada definida com sucesso.'],
      weakPoints: [],
      recommendations: 'Proceder com a coleta de evidências e apontamento dos critérios.',
      finalOpinion: 'Processo modular iniciado e registrado no sistema Nexus Veritas.',
      isTemplate: false,
    });

    setIsWizardOpen(false);
    setWizardStep(1);
    // Reset form
    setNewProcessForm({
      code: `PROC-MOD-2026-${Math.floor(Math.random() * 899 + 100)}`,
      title: '',
      purpose: '',
      category: 'processo_especial',
      clientOrUnit: '',
      responsible: user?.name || 'Bruno Alvarenga',
      date: new Date().toISOString().split('T')[0],
      evaluationMethod: 'three_levels',
      calculationType: 'weighted_average',
      acceptanceThreshold: 80,
      criticalItemOverride: true,
      criteria: [
        {
          id: `crit-${Date.now()}-1`,
          code: 'CRIT-01',
          title: 'Qualificação técnica de operadores e procedimentos',
          categoryOrPillar: 'Pilar Técnico',
          description: 'Verificação de registros de qualificação, treinamento e atendimento a procedimentos.',
          weight: 2.0,
          criticality: 'Crítica',
          value: 'Atende',
          scorePercentage: 100,
          statusLabel: 'Atende',
          evidenceNotes: '',
        }
      ]
    });
  };

  // Load from template into wizard
  const handleLoadTemplateIntoWizard = (template: ModularProcess) => {
    setNewProcessForm({
      code: `PROC-MOD-2026-${Math.floor(Math.random() * 899 + 100)}`,
      title: template.title.replace(/^Modelo:\s*/, ''),
      purpose: template.purpose,
      category: template.category,
      clientOrUnit: template.clientOrUnit,
      responsible: user?.name || 'Bruno Alvarenga',
      date: new Date().toISOString().split('T')[0],
      evaluationMethod: template.evaluationMethod,
      calculationType: template.calculationRules.calculationType,
      acceptanceThreshold: template.calculationRules.acceptanceThreshold,
      criticalItemOverride: template.calculationRules.criticalItemOverride,
      criteria: template.criteria.map((c, i) => ({
        ...c,
        id: `crit-${Date.now()}-${i}`,
        evidenceNotes: '',
      }))
    });
    setWizardStep(2); // Jump directly to criteria step
  };

  // Update criterion during active execution (ETAPA 4)
  const handleUpdateCriterionValue = (
    criterionId: string,
    newValue: any,
    newStatusLabel: string,
    newScorePercentage: number
  ) => {
    if (!selectedProcessForExec) return;

    const updatedCriteria = selectedProcessForExec.criteria.map((c) => {
      if (c.id === criterionId) {
        return {
          ...c,
          value: newValue,
          statusLabel: newStatusLabel,
          scorePercentage: newScorePercentage,
        };
      }
      return c;
    });

    // Recalculate overall score
    const totalWeight = updatedCriteria.reduce((sum, c) => sum + (c.weight || 1), 0);
    const weightedSum = updatedCriteria.reduce(
      (sum, c) => sum + (c.scorePercentage || 0) * (c.weight || 1),
      0
    );
    const newScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

    // Check critical item override
    const hasCriticalFailure = selectedProcessForExec.calculationRules.criticalItemOverride &&
      updatedCriteria.some((c) => c.criticality === 'Crítica' && (c.scorePercentage < 50 || c.value === 'Não Conforme' || c.value === 'Não Atende' || c.value === 'Reprovado'));

    let newClassification = '';
    if (hasCriticalFailure) {
      newClassification = 'Bloqueado por Item Crítico';
    } else if (newScore >= selectedProcessForExec.calculationRules.acceptanceThreshold) {
      newClassification = `Homologado / Conforme (${newScore}%)`;
    } else {
      newClassification = `Sob Monitoramento / Revisão (${newScore}%)`;
    }

    const updatedProcess: ModularProcess = {
      ...selectedProcessForExec,
      criteria: updatedCriteria,
      overallScore: newScore,
      classificationResult: newClassification,
    };

    setSelectedProcessForExec(updatedProcess);
    updateModularProcess(selectedProcessForExec.id, {
      criteria: updatedCriteria,
      overallScore: newScore,
      classificationResult: newClassification,
    });
  };

  // Update evidence or notes during execution
  const handleUpdateCriterionNotes = (criterionId: string, notes: string) => {
    if (!selectedProcessForExec) return;
    const updatedCriteria = selectedProcessForExec.criteria.map((c) =>
      c.id === criterionId ? { ...c, evidenceNotes: notes } : c
    );
    setSelectedProcessForExec((prev) => prev ? { ...prev, criteria: updatedCriteria } : null);
    updateModularProcess(selectedProcessForExec.id, { criteria: updatedCriteria });
  };

  // Add new requirement / question in execution mode
  const handleAddCriterionInExecution = () => {
    if (!selectedProcessForExec) return;
    const num = selectedProcessForExec.criteria.length + 1;
    const newCrit: ModularProcessCriterion = {
      id: `crit-exec-${Date.now()}-${num}`,
      code: `REQ-${String(num).padStart(2, '0')}`,
      title: 'Novo Requisito / Pergunta Adicionada',
      categoryOrPillar: 'Geral',
      description: 'Descrição do requisito inserido durante a auditoria/diagnóstico.',
      weight: 1.0,
      criticality: 'Média',
      value: selectedProcessForExec.evaluationMethod === 'score_5' ? 5 : 'Atende',
      scorePercentage: 100,
      statusLabel: 'Atende',
      evidenceNotes: '',
      attachments: [],
    };
    const updatedCriteria = [...selectedProcessForExec.criteria, newCrit];
    
    // Recalculate score
    const totalWeight = updatedCriteria.reduce((sum, c) => sum + (c.weight || 1), 0);
    const weightedSum = updatedCriteria.reduce(
      (sum, c) => sum + (c.scorePercentage || 0) * (c.weight || 1),
      0
    );
    const newScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;
    
    const updatedProcess: ModularProcess = {
      ...selectedProcessForExec,
      criteria: updatedCriteria,
      overallScore: newScore,
    };
    setSelectedProcessForExec(updatedProcess);
    updateModularProcess(selectedProcessForExec.id, {
      criteria: updatedCriteria,
      overallScore: newScore,
    });
  };

  // Edit specific criterion properties in execution mode (100% modularly editable)
  const handleEditCriterionField = (criterionId: string, field: keyof ModularProcessCriterion, value: any) => {
    if (!selectedProcessForExec) return;
    const updatedCriteria = selectedProcessForExec.criteria.map((c) => {
      if (c.id === criterionId) {
        return { ...c, [field]: value };
      }
      return c;
    });
    setSelectedProcessForExec(prev => prev ? { ...prev, criteria: updatedCriteria } : null);
    updateModularProcess(selectedProcessForExec.id, { criteria: updatedCriteria });
  };

  // Attach evidence simulation to criterion
  const handleAttachEvidenceToCriterion = (criterionId: string) => {
    if (!selectedProcessForExec) return;
    const fileName = prompt('Informe o nome ou referência do documento/evidência a anexar (ex: Laudo_Tecnico_Rev2.pdf, Relatorio_Calibracao.pdf):');
    if (!fileName || !fileName.trim()) return;

    const newAttachment = {
      name: fileName.trim(),
      url: '#',
      size: `${Math.floor(Math.random() * 240 + 120)} KB`,
      type: 'PDF / Documento Técnico'
    };

    const updatedCriteria = selectedProcessForExec.criteria.map((c) => {
      if (c.id === criterionId) {
        const currentAttachments = c.attachments || [];
        return {
          ...c,
          attachments: [...currentAttachments, newAttachment],
          evidenceNotes: c.evidenceNotes ? `${c.evidenceNotes} | Evidência anexada: ${fileName.trim()}` : `Evidência anexada: ${fileName.trim()}`
        };
      }
      return c;
    });

    setSelectedProcessForExec(prev => prev ? { ...prev, criteria: updatedCriteria } : null);
    updateModularProcess(selectedProcessForExec.id, { criteria: updatedCriteria });
    alert(`Evidência "${fileName.trim()}" anexada com sucesso ao critério!`);
  };

  // Remove criterion in execution mode
  const handleRemoveCriterionInExecution = (criterionId: string) => {
    if (!selectedProcessForExec) return;
    if (selectedProcessForExec.criteria.length <= 1) {
      alert('O processo deve conter pelo menos um critério.');
      return;
    }
    const updatedCriteria = selectedProcessForExec.criteria.filter(c => c.id !== criterionId);
    
    // Recalculate score
    const totalWeight = updatedCriteria.reduce((sum, c) => sum + (c.weight || 1), 0);
    const weightedSum = updatedCriteria.reduce(
      (sum, c) => sum + (c.scorePercentage || 0) * (c.weight || 1),
      0
    );
    const newScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

    const updatedProcess: ModularProcess = {
      ...selectedProcessForExec,
      criteria: updatedCriteria,
      overallScore: newScore,
    };
    setSelectedProcessForExec(updatedProcess);
    updateModularProcess(selectedProcessForExec.id, {
      criteria: updatedCriteria,
      overallScore: newScore,
    });
  };

  // SIPOC handlers (Unlimited & Fully Editable)
  const handleAddSipocItem = () => {
    if (!selectedProcessForExec) return;
    const currentSipoc = selectedProcessForExec.sipocItems || [];
    const newItem: SipocItem = {
      id: `sipoc-${Date.now()}-${currentSipoc.length + 1}`,
      processName: 'Nova Etapa / Processo SIPOC',
      suppliers: 'Fornecedores internos / externos',
      inputs: 'Entradas (Matéria-prima, dados, requisição)',
      processSteps: 'Passo 1 -> Passo 2 -> Passo 3',
      outputs: 'Saída (Produto, relatório, serviço)',
      customers: 'Clientes (Usuário final, próxima etapa)',
      requirements: 'Especificações técnicas ou critérios de aceitação',
    };
    const updatedSipoc = [...currentSipoc, newItem];
    setSelectedProcessForExec(prev => prev ? { ...prev, sipocItems: updatedSipoc } : null);
    updateModularProcess(selectedProcessForExec.id, { sipocItems: updatedSipoc });
  };

  const handleUpdateSipocItem = (sipocId: string, field: keyof SipocItem, value: string) => {
    if (!selectedProcessForExec) return;
    const currentSipoc = selectedProcessForExec.sipocItems || [];
    const updatedSipoc = currentSipoc.map(item => item.id === sipocId ? { ...item, [field]: value } : item);
    setSelectedProcessForExec(prev => prev ? { ...prev, sipocItems: updatedSipoc } : null);
    updateModularProcess(selectedProcessForExec.id, { sipocItems: updatedSipoc });
  };

  const handleRemoveSipocItem = (sipocId: string) => {
    if (!selectedProcessForExec) return;
    const currentSipoc = selectedProcessForExec.sipocItems || [];
    const updatedSipoc = currentSipoc.filter(item => item.id !== sipocId);
    setSelectedProcessForExec(prev => prev ? { ...prev, sipocItems: updatedSipoc } : null);
    updateModularProcess(selectedProcessForExec.id, { sipocItems: updatedSipoc });
  };

  // Action Plan handlers & state for Modular Process execution modal (5W2H, Ishikawa, etc.)
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [planWorkspaceTab, setPlanWorkspaceTab] = useState<'geral' | 'contencao' | 'causa-raiz' | '5w2h' | 'eficacia'>('geral');

  const handleAddActionPlan = () => {
    if (!selectedProcessForExec) return;
    const currentPlans = selectedProcessForExec.actionPlans || [];
    const newPlan: ActionPlan = {
      id: `ap-${Date.now()}-${currentPlans.length + 1}`,
      title: `Plano de Ação / NC #${currentPlans.length + 1}`,
      description: 'Descrição detalhada do desvio ou oportunidade identificada durante a avaliação modular.',
      responsible: selectedProcessForExec.responsible || 'Responsável Técnico',
      deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'Aberto',
      priority: 'Alta',
      correctiveAction: 'Definir ação corretiva...',
      ncRequirement: 'Requisito do Processo Modular',
      method5W2H: {
        what: 'Implementar correção no processo',
        why: 'Eliminar causa raiz identificada',
        where: selectedProcessForExec.clientOrUnit,
        whenDeadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        whoResponsible: selectedProcessForExec.responsible,
        howMethod: 'Padronização de procedimento e treinamento',
        howMuchCost: 'R$ 0,00',
      },
      ishikawa: {
        method: '',
        machine: '',
        measurement: '',
        environment: '',
        manpower: '',
        material: '',
        primaryRootCause: '',
      },
      fiveWhys: ['', '', '', '', ''],
    };
    const updatedPlans = [...currentPlans, newPlan];
    setSelectedProcessForExec(prev => prev ? { ...prev, actionPlans: updatedPlans } : null);
    updateModularProcess(selectedProcessForExec.id, { actionPlans: updatedPlans });
    setActivePlanId(newPlan.id);
  };

  const handleUpdateActionPlan = (planId: string, updates: Partial<ActionPlan>) => {
    if (!selectedProcessForExec) return;
    const currentPlans = selectedProcessForExec.actionPlans || [];
    const updatedPlans = currentPlans.map(p => p.id === planId ? { ...p, ...updates } : p);
    setSelectedProcessForExec(prev => prev ? { ...prev, actionPlans: updatedPlans } : null);
    updateModularProcess(selectedProcessForExec.id, { actionPlans: updatedPlans });
  };

  const handleRemoveActionPlan = (planId: string) => {
    if (!selectedProcessForExec) return;
    const currentPlans = selectedProcessForExec.actionPlans || [];
    const updatedPlans = currentPlans.filter(p => p.id !== planId);
    setSelectedProcessForExec(prev => prev ? { ...prev, actionPlans: updatedPlans } : null);
    updateModularProcess(selectedProcessForExec.id, { actionPlans: updatedPlans });
    if (activePlanId === planId) {
      setActivePlanId(updatedPlans[0]?.id || null);
    }
  };

  return (
    <div className={`space-y-6 transition-colors duration-200 pb-16 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-orange-400" />
              <span>AVALIAÇÕES & METODOLOGIAS PERSONALIZADAS</span>
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">Construtor Livre de Processos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span>Processo Modular & Metodologias Ágeis</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Ambiente flexível de criação e execução de avaliações: auditorias de processos e produtos, verificações técnicas, diagnósticos de gestão, análises financeiras e estudos de viabilidade com critérios, pesos e relatórios customizados.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenAuditTab && (
            <button
              onClick={onOpenAuditTab}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span>Ver Auditorias Normativas ISO</span>
            </button>
          )}

          <button
            onClick={() => {
              setWizardStep(1);
              setIsWizardOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Processo Modular</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          label="TOTAL DE PROCESSOS"
          value={totalCount}
          subtitle="Análises cadastradas"
          icon={Layers}
          badge="Total"
          badgeColor="stone"
          active={selectedStatusFilter === 'all'}
          onClick={() => setSelectedStatusFilter('all')}
        />
        <StatCard
          label="EM ANDAMENTO"
          value={emAndamentoCount}
          subtitle="Coleta de evidências"
          icon={Clock}
          badge="Ativos"
          badgeColor="yellow"
          active={selectedStatusFilter === 'Em Andamento'}
          onClick={() => setSelectedStatusFilter('Em Andamento')}
        />
        <StatCard
          label="CONCLUÍDOS / HOMOLOGADOS"
          value={concluidosCount}
          subtitle="Relatórios emitidos"
          icon={CheckCircle2}
          badge="Concluídos"
          badgeColor="green"
          active={selectedStatusFilter === 'Homologado'}
          onClick={() => setSelectedStatusFilter('Homologado')}
        />
        <StatCard
          label="MÉDIA DE DESEMPENHO"
          value={`${avgScore}%`}
          subtitle="Score ponderado geral"
          icon={TrendingUp}
          badge="Consolidado"
          badgeColor={avgScore >= 80 ? 'green' : 'yellow'}
        />
        <StatCard
          label="BIBLIOTECA DE MODELOS"
          value={templatesCount}
          subtitle="Modelos reutilizáveis"
          icon={Bookmark}
          badge="Templates"
          badgeColor="blue"
        />
      </div>

      {/* Templates Quick Carousel / Banner */}
      {templateProcesses.length > 0 && (
        <div className={`p-4 rounded-2xl border transition-colors ${
          theme === 'light' ? 'bg-orange-50/60 border-orange-200' : 'bg-slate-900/60 border-orange-500/20'
        }`}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Modelos de Referência Disponíveis (Templates Reutilizáveis)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Clique em um modelo para iniciar a avaliação pré-configurada</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {templateProcesses.slice(0, 3).map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleLoadTemplateIntoWizard(tmpl)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                  theme === 'light'
                    ? 'bg-white hover:border-orange-500 border-slate-200 shadow-xs'
                    : 'bg-slate-950/80 hover:border-orange-500/60 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-orange-400 mb-1">
                    <span>{CATEGORY_LABELS[tmpl.category]}</span>
                    <span>{tmpl.criteria.length} critérios</span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                    {tmpl.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {tmpl.purpose}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <span className="font-mono">{METHOD_LABELS[tmpl.evaluationMethod]}</span>
                  <span className="text-orange-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <span>Usar Modelo</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border transition-colors ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Todos os Processos' },
              { id: 'processo_especial', label: 'Processos Especiais' },
              { id: 'maturidade', label: 'Maturidade de Gestão' },
              { id: 'viabilidade_produto', label: 'Viabilidade de Produto' },
              { id: 'processo_produtivo', label: 'Processo Produtivo' },
              { id: 'fornecedor', label: 'Fornecedor Custom' },
              { id: 'financeiro', label: 'Financeiro' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, código, unidade..."
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

      {/* Grid of Modular Processes */}
      {filteredProcesses.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Nenhum processo modular encontrado"
          description={
            modularProcesses.length === 0
              ? 'Crie seu primeiro processo modular de avaliação com metodologia e critérios customizados.'
              : 'Nenhum processo corresponde aos filtros selecionados.'
          }
          actionLabel="+ Novo Processo Modular"
          onAction={() => {
            setWizardStep(1);
            setIsWizardOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProcesses.map((proc) => {
            return (
              <div
                key={proc.id}
                className={`border rounded-2xl p-5 shadow-sm transition-all relative flex flex-col justify-between group ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 hover:border-orange-500/50'
                    : 'bg-slate-900/90 border-slate-800 hover:border-orange-500/50'
                }`}
              >
                <div>
                  {/* Top Bar: Code, Category, Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-orange-400 px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/30">
                        {proc.code}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {CATEGORY_LABELS[proc.category] || proc.category}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      proc.status === 'Homologado'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : proc.status === 'Concluído'
                        ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                        : 'bg-amber-950/80 text-amber-300 border-amber-800'
                    }`}>
                      {proc.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-tight mt-1">{proc.title}</h3>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>{proc.clientOrUnit}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 italic">"{proc.purpose}"</p>

                  {/* Criteria & Score Overview */}
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Régua Avaliativa:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[160px]">
                        {METHOD_LABELS[proc.evaluationMethod]}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Resultado Atual:</span>
                      <span className="font-bold text-orange-400 font-mono">
                        {proc.classificationResult}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Pontuação Global:</span>
                      <span className="font-bold text-emerald-400 font-mono text-xs">
                        {proc.overallScore}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(proc.overallScore, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => setSelectedProcessForExec(proc)}
                      className="inline-flex items-center gap-1.5 text-orange-400 font-bold hover:underline cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Executar Avaliação ({proc.criteria.length})</span>
                    </button>

                    <button
                      onClick={() => setSelectedProcessForReport(proc)}
                      className="inline-flex items-center gap-1.5 text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Ver Relatório</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => duplicateModularProcess(proc.id)}
                        className="hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                        title="Duplicar Processo"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Duplicar</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProcessForTemplate(proc);
                          setTemplateNameInput(`Modelo: ${proc.title}`);
                        }}
                        className="hover:text-orange-400 flex items-center gap-1 cursor-pointer"
                        title="Salvar como Modelo"
                      >
                        <Bookmark className="w-3 h-3 text-orange-400" />
                        <span>Salvar Modelo</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Excluir o processo modular "${proc.title}"?`)) {
                          deleteModularProcess(proc.id);
                        }
                      }}
                      className="hover:text-rose-400 cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: CONSTRUTOR EM ETAPAS (WIZARD ETAPAS 1, 2 e 3)
      ========================================================================= */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header & Stepper */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                  <Zap className="w-4 h-4" />
                  <span>Construtor de Processo Modular • Etapa {wizardStep} de 3</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">
                  {wizardStep === 1 && 'Etapa 1 — Identificação & Finalidade da Análise'}
                  {wizardStep === 2 && 'Etapa 2 — Metodologia & Critérios de Avaliação'}
                  {wizardStep === 3 && 'Etapa 3 — Regras de Cálculo, Pesos & Classificação'}
                </h3>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 text-xs">
              <button
                onClick={() => setWizardStep(1)}
                className={`py-3 px-4 font-bold text-center border-b-2 transition-all ${
                  wizardStep === 1
                    ? 'border-orange-500 text-white bg-orange-500/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                1. Dados Gerais
              </button>
              <button
                onClick={() => setWizardStep(2)}
                className={`py-3 px-4 font-bold text-center border-b-2 transition-all ${
                  wizardStep === 2
                    ? 'border-orange-500 text-white bg-orange-500/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                2. Metodologia & Critérios
              </button>
              <button
                onClick={() => setWizardStep(3)}
                className={`py-3 px-4 font-bold text-center border-b-2 transition-all ${
                  wizardStep === 3
                    ? 'border-orange-500 text-white bg-orange-500/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                3. Regras de Cálculo
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-200">
              {/* STEP 1: IDENTIFICAÇÃO GERAL */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Código do Processo
                      </label>
                      <input
                        type="text"
                        value={newProcessForm.code}
                        onChange={(e) => setNewProcessForm({ ...newProcessForm, code: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Categoria da Análise / Processo
                      </label>
                      <select
                        value={newProcessForm.category}
                        onChange={(e) => setNewProcessForm({ ...newProcessForm, category: e.target.value as ModularProcessCategory })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Nome da Análise / Título do Processo *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Auditoria do Processo de Soldagem / Estudo de Viabilidade / Diagnóstico..."
                      value={newProcessForm.title}
                      onChange={(e) => setNewProcessForm({ ...newProcessForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Finalidade & Objetivo da Análise
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Descreva a finalidade, escopo, requisitos de engenharia ou diretriz estratégica..."
                      value={newProcessForm.purpose}
                      onChange={(e) => setNewProcessForm({ ...newProcessForm, purpose: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Empresa ou Unidade Avaliada
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Fábrica Matriz, Fornecedor X..."
                        value={newProcessForm.clientOrUnit}
                        onChange={(e) => setNewProcessForm({ ...newProcessForm, clientOrUnit: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Responsável / Auditor / Especialista
                      </label>
                      <input
                        type="text"
                        value={newProcessForm.responsible}
                        onChange={(e) => setNewProcessForm({ ...newProcessForm, responsible: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Data da Análise
                      </label>
                      <input
                        type="date"
                        value={newProcessForm.date}
                        onChange={(e) => setNewProcessForm({ ...newProcessForm, date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: METODOLOGIA E CRITÉRIOS */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider block">
                        Régua de Avaliação Metodológica
                      </span>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Defina como os critérios serão pontuados e classificados:
                      </p>
                    </div>

                    <select
                      value={newProcessForm.evaluationMethod}
                      onChange={(e) => setNewProcessForm({ ...newProcessForm, evaluationMethod: e.target.value as ModularEvaluationMethod })}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold text-xs"
                    >
                      {Object.entries(METHOD_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Criteria List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Critérios & Tópicos de Verificação ({newProcessForm.criteria.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddCriterionInWizard}
                        className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Critério</span>
                      </button>
                    </div>

                    {newProcessForm.criteria.map((c, idx) => (
                      <div
                        key={c.id}
                        className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 font-mono font-bold rounded text-[10px]">
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={c.title}
                              onChange={(e) => {
                                const updated = newProcessForm.criteria.map((item) =>
                                  item.id === c.id ? { ...item, title: e.target.value } : item
                                );
                                setNewProcessForm({ ...newProcessForm, criteria: updated });
                              }}
                              placeholder="Nome do critério / pergunta..."
                              className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold sm:w-80"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={c.categoryOrPillar}
                              onChange={(e) => {
                                const updated = newProcessForm.criteria.map((item) =>
                                  item.id === c.id ? { ...item, categoryOrPillar: e.target.value } : item
                                );
                                setNewProcessForm({ ...newProcessForm, criteria: updated });
                              }}
                              placeholder="Pilar / Tópico..."
                              className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-[11px] w-28"
                            />

                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-500">Peso:</span>
                              <input
                                type="number"
                                step="0.5"
                                min="0.5"
                                max="10"
                                value={c.weight}
                                onChange={(e) => {
                                  const updated = newProcessForm.criteria.map((item) =>
                                    item.id === c.id ? { ...item, weight: parseFloat(e.target.value) || 1 } : item
                                  );
                                  setNewProcessForm({ ...newProcessForm, criteria: updated });
                                }}
                                className="w-14 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-center text-white"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveCriterionInWizard(c.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                              title="Remover critério"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={c.description}
                            onChange={(e) => {
                              const updated = newProcessForm.criteria.map((item) =>
                                item.id === c.id ? { ...item, description: e.target.value } : item
                              );
                              setNewProcessForm({ ...newProcessForm, criteria: updated });
                            }}
                            placeholder="Descrição detalhada do requisito e evidências esperadas..."
                            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: REGRAS DE CÁLCULO E CLASSIFICAÇÃO */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                        Fórmula de Cálculo do Resultado Geral
                      </h4>
                      <p className="text-xs text-slate-400">
                        O sistema Nexus Veritas calculará os resultados consolidados conforme as regras definidas:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Tipo de Fórmula
                        </label>
                        <select
                          value={newProcessForm.calculationType}
                          onChange={(e) => setNewProcessForm({ ...newProcessForm, calculationType: e.target.value as any })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold"
                        >
                          <option value="weighted_average">Média Ponderada por Pesos (Padrão Industrial)</option>
                          <option value="simple_sum">Soma Simples de Pontuação</option>
                          <option value="percentage">Escala Percentual Pura (0 a 100%)</option>
                          <option value="maturity_index">Índice de Maturidade (Escala 1 a 5)</option>
                          <option value="go_no_go">Regra Go / No-Go (Viabilidade de Projeto)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Limite Mínimo de Aceitação (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newProcessForm.acceptanceThreshold}
                          onChange={(e) => setNewProcessForm({ ...newProcessForm, acceptanceThreshold: parseInt(e.target.value) || 80 })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="critical-override"
                        checked={newProcessForm.criticalItemOverride}
                        onChange={(e) => setNewProcessForm({ ...newProcessForm, criticalItemOverride: e.target.checked })}
                        className="rounded accent-orange-500 w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="critical-override" className="text-xs text-slate-300 cursor-pointer">
                        <strong className="text-white">Trava de Itens Críticos:</strong> Se qualquer critério marcado como "Crítico" for reprovado, o processo geral não poderá ser homologado independentemente da média final.
                      </label>
                    </div>
                  </div>

                  {/* Summary of new process */}
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Resumo da Nova Metodologia</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Processo <strong>{newProcessForm.title || '(Sem título)'}</strong> ({newProcessForm.code}) estruturado com <strong>{newProcessForm.criteria.length} critérios</strong> sob a régua <strong>{METHOD_LABELS[newProcessForm.evaluationMethod]}</strong> e limite de aprovação de <strong>{newProcessForm.acceptanceThreshold}%</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Nav */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Voltar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              )}

              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((prev) => (prev + 1) as any)}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/20"
                >
                  <span>Avançar para Etapa {wizardStep + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveNewProcess}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/25"
                >
                  <Check className="w-4 h-4" />
                  <span>Criar & Iniciar Processo Modular</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EXECUÇÃO DA AVALIAÇÃO INTERATIVA (ETAPA 4)
      ========================================================================= */}
      {selectedProcessForExec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30">
                    {selectedProcessForExec.code}
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedProcessForExec.clientOrUnit}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedProcessForExec.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Score Atual</span>
                  <span className="text-base font-mono font-bold text-emerald-400">
                    {selectedProcessForExec.overallScore}%
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProcessForExec(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tab Bar: Critérios vs SIPOC */}
            <div className="px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setExecTab('criteria')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  execTab === 'criteria'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Critérios & Requisitos ({selectedProcessForExec.criteria.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setExecTab('sipoc')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  execTab === 'sipoc'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Mapeamento SIPOC / DMAIC ({selectedProcessForExec.sipocItems?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setExecTab('action_plans')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  execTab === 'action_plans'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Planos de Ação & NCs ({selectedProcessForExec.actionPlans?.length || 0})</span>
              </button>
            </div>

            {/* Tab 1: Criteria & Questions Evaluation */}
            {execTab === 'criteria' && (
              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-slate-300">
                    Régua: <strong>{METHOD_LABELS[selectedProcessForExec.evaluationMethod]}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {selectedProcessForExec.classificationResult}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddCriterionInExecution}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer shadow-sm shadow-orange-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Incluir Requisito / Pergunta</span>
                    </button>
                  </div>
                </div>

                {selectedProcessForExec.criteria.map((c, idx) => (
                <div
                  key={c.id}
                  className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3 relative group"
                >
                  {/* Top row: Code, Editable Title & Criticality & Delete */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-orange-400 font-bold px-2 py-0.5 bg-orange-500/10 rounded border border-orange-500/30">
                          {c.code || `REQ-${idx + 1}`}
                        </span>
                        
                        <input
                          type="text"
                          value={c.title}
                          onChange={(e) => handleEditCriterionField(c.id, 'title', e.target.value)}
                          placeholder="Título do critério ou pergunta..."
                          className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs flex-1 min-w-[200px]"
                        />

                        <select
                          value={c.criticality || 'Média'}
                          onChange={(e) => handleEditCriterionField(c.id, 'criticality', e.target.value)}
                          className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-[11px]"
                        >
                          <option value="Baixa">Baixa</option>
                          <option value="Média">Média</option>
                          <option value="Alta">Alta</option>
                          <option value="Crítica">Crítica</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveCriterionInExecution(c.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          title="Remover Requisito"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Description & Pillar edit */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={c.description || ''}
                          onChange={(e) => handleEditCriterionField(c.id, 'description', e.target.value)}
                          placeholder="Descrição detalhada do requisito ou diretriz..."
                          className="md:col-span-2 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-xs"
                        />
                        <input
                          type="text"
                          value={c.categoryOrPillar || ''}
                          onChange={(e) => handleEditCriterionField(c.id, 'categoryOrPillar', e.target.value)}
                          placeholder="Pilar / Área (ex: Técnico, Qualidade)"
                          className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    {/* Dynamic Rating Selector based on evaluationMethod */}
                    <div className="shrink-0 pt-1 md:pt-0">
                      {selectedProcessForExec.evaluationMethod === 'three_levels' && (
                        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                          <button
                            type="button"
                            onClick={() => handleUpdateCriterionValue(c.id, 'Atende', 'Atende', 100)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              c.value === 'Atende' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Atende (100)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateCriterionValue(c.id, 'Atende Parcialmente', 'Atende Parcialmente', 65)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              c.value === 'Atende Parcialmente' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Parcial (65)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateCriterionValue(c.id, 'Não Atende', 'Não Atende', 0)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              c.value === 'Não Atende' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Não Atende (0)
                          </button>
                        </div>
                      )}

                      {selectedProcessForExec.evaluationMethod === 'conformity' && (
                        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
                          <button
                            type="button"
                            onClick={() => handleUpdateCriterionValue(c.id, 'Conforme', 'Conforme', 100)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              c.value === 'Conforme' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Conforme
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateCriterionValue(c.id, 'Não Conforme', 'Não Conforme', 0)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              c.value === 'Não Conforme' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Não Conforme
                          </button>
                        </div>
                      )}

                      {selectedProcessForExec.evaluationMethod === 'score_5' && (
                        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => handleUpdateCriterionValue(c.id, score, `Nota ${score}`, score * 20)}
                              className={`w-6 h-6 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                                c.value === score ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedProcessForExec.evaluationMethod === 'maturity_levels' && (
                        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => handleUpdateCriterionValue(c.id, level, `Nível ${level}`, level * 20)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                c.value === level ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Nív {level}
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedProcessForExec.evaluationMethod === 'approval' && (
                        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                          <button
                            type="button"
                            onClick={() => handleUpdateCriterionValue(c.id, 'Aprovado', 'Aprovado', 100)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              c.value === 'Aprovado' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Aprovado
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateCriterionValue(c.id, 'Ressalvas', 'Ressalvas', 70)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              c.value === 'Ressalvas' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Ressalvas
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateCriterionValue(c.id, 'Reprovado', 'Reprovado', 0)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              c.value === 'Reprovado' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Reprovado
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Evidence Notes & Attach Evidence Tool */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Observações técnicas ou evidência objetiva..."
                        value={c.evidenceNotes || ''}
                        onChange={(e) => handleUpdateCriterionNotes(c.id, e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAttachEvidenceToCriterion(c.id)}
                      className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      title="Anexar documento ou evidência"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Anexar Evidência {c.attachments && c.attachments.length > 0 ? `(${c.attachments.length})` : ''}</span>
                    </button>
                  </div>

                  {/* Attached Files List */}
                  {c.attachments && c.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {c.attachments.map((att, attIdx) => (
                        <span key={attIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/30 text-[10px] font-mono">
                          <FileText className="w-3 h-3" />
                          <span>{att.name}</span>
                          <span className="text-slate-400">({att.size})</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            )}

            {/* Tab 2: SIPOC Tool (Six Sigma / DMAIC High-Level Mapping) */}
            {execTab === 'sipoc' && (
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-200">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-orange-400" />
                        <span>Mapeamento de Processo SIPOC (Six Sigma / DMAIC)</span>
                      </h4>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Mapeie fornecedores (S), entradas (I), processo (P), saídas (O) e clientes (C). 100% editável e sem limite de processos.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSipocItem}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/20 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Processo SIPOC</span>
                    </button>
                  </div>
                </div>

                {(!selectedProcessForExec.sipocItems || selectedProcessForExec.sipocItems.length === 0) ? (
                  <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">Nenhum processo SIPOC mapeado ainda.</p>
                    <p className="text-slate-500 text-[11px] mt-1">Clique no botão acima para criar o seu primeiro mapeamento SIPOC.</p>
                    <button
                      type="button"
                      onClick={handleAddSipocItem}
                      className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Criar Primeiro SIPOC</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedProcessForExec.sipocItems.map((sipoc, sIdx) => (
                      <div key={sipoc.id} className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-4 relative group">
                        {/* Top bar of sipoc item */}
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="font-mono text-orange-400 font-bold px-2.5 py-1 bg-orange-500/10 rounded-lg border border-orange-500/30">
                              SIPOC #{sIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={sipoc.processName}
                              onChange={(e) => handleUpdateSipocItem(sipoc.id, 'processName', e.target.value)}
                              placeholder="Nome da Etapa ou Processo..."
                              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs flex-1 max-w-md"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveSipocItem(sipoc.id)}
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                            title="Remover este processo SIPOC"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* 5 SIPOC Columns Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          {/* Suppliers */}
                          <div className="space-y-1.5 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">
                              S - Fornecedores
                            </label>
                            <textarea
                              rows={3}
                              value={sipoc.suppliers}
                              onChange={(e) => handleUpdateSipocItem(sipoc.id, 'suppliers', e.target.value)}
                              placeholder="Quem fornece as entradas..."
                              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-orange-500 resize-y"
                            />
                          </div>

                          {/* Inputs */}
                          <div className="space-y-1.5 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                              I - Entradas
                            </label>
                            <textarea
                              rows={3}
                              value={sipoc.inputs}
                              onChange={(e) => handleUpdateSipocItem(sipoc.id, 'inputs', e.target.value)}
                              placeholder="Materiais, dados, insumos..."
                              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-orange-500 resize-y"
                            />
                          </div>

                          {/* Process */}
                          <div className="space-y-1.5 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                              P - Processo (Etapas)
                            </label>
                            <textarea
                              rows={3}
                              value={sipoc.processSteps}
                              onChange={(e) => handleUpdateSipocItem(sipoc.id, 'processSteps', e.target.value)}
                              placeholder="Passos de alta nível..."
                              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-orange-500 resize-y"
                            />
                          </div>

                          {/* Outputs */}
                          <div className="space-y-1.5 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                              O - Saídas
                            </label>
                            <textarea
                              rows={3}
                              value={sipoc.outputs}
                              onChange={(e) => handleUpdateSipocItem(sipoc.id, 'outputs', e.target.value)}
                              placeholder="Produto, serviço, relatório..."
                              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-orange-500 resize-y"
                            />
                          </div>

                          {/* Customers */}
                          <div className="space-y-1.5 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                              C - Clientes
                            </label>
                            <textarea
                              rows={3}
                              value={sipoc.customers}
                              onChange={(e) => handleUpdateSipocItem(sipoc.id, 'customers', e.target.value)}
                              placeholder="Quem recebe a saída..."
                              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-orange-500 resize-y"
                            />
                          </div>
                        </div>

                        {/* Requirements & Notes */}
                        <div className="pt-2 border-t border-slate-800/80">
                          <input
                            type="text"
                            value={sipoc.requirements || ''}
                            onChange={(e) => handleUpdateSipocItem(sipoc.id, 'requirements', e.target.value)}
                            placeholder="Requisitos críticos de qualidade ou especificações das saídas..."
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Action Plans & NCs (5W2H, Ishikawa, Contenção, Eficácia) */}
            {execTab === 'action_plans' && (
              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-slate-300">
                    Gerenciamento de Planos de Ação e Não Conformidades (Formato Padrão ISO / Qualidade)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddActionPlan}
                    className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Plano de Ação / NC</span>
                  </button>
                </div>

                {(!selectedProcessForExec.actionPlans || selectedProcessForExec.actionPlans.length === 0) ? (
                  <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-3">
                    <CheckSquare className="w-10 h-10 text-orange-400 mx-auto opacity-60" />
                    <p className="text-sm font-bold text-white">Nenhum Plano de Ação ou NC cadastrado neste processo</p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Crie planos de ação estruturados com Metodologia 5W2H, Diagrama de Ishikawa (6M), 5 Porquês e Verificação de Eficácia.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddActionPlan}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md shadow-orange-500/25"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Criar Primeiro Plano de Ação</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Action Plan selector */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {selectedProcessForExec.actionPlans.map((plan) => {
                        const isSelected = (activePlanId || selectedProcessForExec.actionPlans![0].id) === plan.id;
                        return (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => setActivePlanId(plan.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            <span>{plan.title}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                              plan.status === 'Concluído' ? 'bg-emerald-950 text-emerald-300' : 'bg-orange-950 text-orange-300'
                            }`}>
                              {plan.status}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Plan Workspace */}
                    {(() => {
                      const currentPlan = selectedProcessForExec.actionPlans.find(p => p.id === (activePlanId || selectedProcessForExec.actionPlans![0].id)) || selectedProcessForExec.actionPlans[0];
                      if (!currentPlan) return null;

                      return (
                        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-5">
                          {/* Top Plan Header & Status */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                            <div className="space-y-1 flex-1">
                              <input
                                type="text"
                                value={currentPlan.title}
                                onChange={(e) => handleUpdateActionPlan(currentPlan.id, { title: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                              />
                              <p className="text-[11px] text-slate-400">
                                Responsável: <input type="text" value={currentPlan.responsible} onChange={(e) => handleUpdateActionPlan(currentPlan.id, { responsible: e.target.value })} className="bg-slate-900 border border-slate-700 rounded px-1 text-white inline-block w-32" /> • Prazo: <input type="date" value={currentPlan.deadline} onChange={(e) => handleUpdateActionPlan(currentPlan.id, { deadline: e.target.value })} className="bg-slate-900 border border-slate-700 rounded px-1 text-white inline-block font-mono" />
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={currentPlan.status}
                                onChange={(e) => handleUpdateActionPlan(currentPlan.id, { status: e.target.value as ActionPlanStatus })}
                                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-orange-500"
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
                                type="button"
                                onClick={() => handleRemoveActionPlan(currentPlan.id)}
                                className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                title="Excluir este plano de ação"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Sub-Tabs for Action Plan */}
                          <div className="border-b border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-none bg-slate-900/50 rounded-xl p-1">
                            {[
                              { id: 'geral' as const, label: 'Identificação & Dados', icon: FileText },
                              { id: 'contencao' as const, label: 'Contenção Imediata', icon: ShieldCheck },
                              { id: 'causa-raiz' as const, label: 'Causa-Raiz (Ishikawa & 5 Porquês)', icon: HelpCircle },
                              { id: '5w2h' as const, label: 'Plano 5W2H', icon: CheckSquare },
                              { id: 'eficacia' as const, label: 'Verificação de Eficácia', icon: CheckCircle2 },
                            ].map((tab) => {
                              const Icon = tab.icon;
                              const isActive = planWorkspaceTab === tab.id;
                              return (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setPlanWorkspaceTab(tab.id)}
                                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-orange-500 text-white shadow'
                                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                  }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                  <span>{tab.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Sub-Tab Content */}
                          <div className="space-y-4 pt-2">
                            {planWorkspaceTab === 'geral' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                                  <label className="text-[10px] text-slate-400 uppercase font-semibold block">Descrição da Não Conformidade / Desvio</label>
                                  <textarea
                                    rows={3}
                                    value={currentPlan.description}
                                    onChange={(e) => handleUpdateActionPlan(currentPlan.id, { description: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-orange-500"
                                  />
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                                  <label className="text-[10px] text-slate-400 uppercase font-semibold block">Requisito & Contexto</label>
                                  <input
                                    type="text"
                                    value={currentPlan.ncRequirement || ''}
                                    onChange={(e) => handleUpdateActionPlan(currentPlan.id, { ncRequirement: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-orange-500 mb-2"
                                  />
                                  <div className="flex justify-between text-xs text-slate-400">
                                    <span>Prioridade:</span>
                                    <select
                                      value={currentPlan.priority}
                                      onChange={(e) => handleUpdateActionPlan(currentPlan.id, { priority: e.target.value as any })}
                                      className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-white"
                                    >
                                      <option value="Baixa">Baixa</option>
                                      <option value="Média">Média</option>
                                      <option value="Alta">Alta</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}

                            {planWorkspaceTab === 'contencao' && (
                              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                                  Ação de Contenção Imediata (Disposição Provisória)
                                </h4>
                                <p className="text-xs text-slate-400">Medida emergencial adotada para bloquear o desvio e isolar riscos.</p>
                                <textarea
                                  rows={3}
                                  value={currentPlan.containmentAction || ''}
                                  onChange={(e) => handleUpdateActionPlan(currentPlan.id, { containmentAction: e.target.value })}
                                  placeholder="Descreva a contenção (ex: Bloqueio imediato do lote, inspeção 100%)..."
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-orange-500"
                                />
                              </div>
                            )}

                            {planWorkspaceTab === 'causa-raiz' && (
                              <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                                    Diagrama de Ishikawa (Espinha de Peixe / 6M)
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {[
                                      { label: '1. Método', key: 'method' },
                                      { label: '2. Máquina', key: 'machine' },
                                      { label: '3. Medida', key: 'measurement' },
                                      { label: '4. Meio Ambiente', key: 'environment' },
                                      { label: '5. Mão de Obra', key: 'manpower' },
                                      { label: '6. Material', key: 'material' },
                                    ].map((m) => (
                                      <div key={m.key} className="space-y-1 p-2 bg-slate-950 rounded-lg border border-slate-800">
                                        <span className="text-[11px] text-slate-400 font-semibold">{m.label}</span>
                                        <input
                                          type="text"
                                          value={(currentPlan.ishikawa as any)?.[m.key] || ''}
                                          onChange={(e) => handleUpdateActionPlan(currentPlan.id, {
                                            ishikawa: {
                                              ...(currentPlan.ishikawa || { method: '', machine: '', measurement: '', environment: '', manpower: '', material: '', primaryRootCause: '' }),
                                              [m.key]: e.target.value
                                            }
                                          })}
                                          placeholder="Causa potencial..."
                                          className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <div>
                                    <label className="text-slate-400 block text-xs font-bold mb-1">Causa Raiz Primária Validada</label>
                                    <input
                                      type="text"
                                      value={currentPlan.ishikawa?.primaryRootCause || ''}
                                      onChange={(e) => handleUpdateActionPlan(currentPlan.id, {
                                        ishikawa: {
                                          ...(currentPlan.ishikawa || { method: '', machine: '', measurement: '', environment: '', manpower: '', material: '', primaryRootCause: '' }),
                                          primaryRootCause: e.target.value
                                        }
                                      })}
                                      placeholder="Conclusão fundamental da análise..."
                                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                                    />
                                  </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                                    Técnica dos 5 Porquês (Why-Why Analysis)
                                  </h4>
                                  <div className="space-y-2">
                                    {[0, 1, 2, 3, 4].map((idx) => (
                                      <div key={idx} className="flex items-center gap-2">
                                        <span className="w-16 font-mono font-bold text-orange-400 text-xs">
                                          {idx + 1}º Por quê?
                                        </span>
                                        <input
                                          type="text"
                                          value={currentPlan.fiveWhys?.[idx] || ''}
                                          onChange={(e) => {
                                            const updated = [...(currentPlan.fiveWhys || ['', '', '', '', ''])];
                                            updated[idx] = e.target.value;
                                            handleUpdateActionPlan(currentPlan.id, { fiveWhys: updated });
                                          }}
                                          placeholder={idx === 4 ? 'Causa fundamental (5º Porquê)...' : `Motivo ${idx + 1}...`}
                                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {planWorkspaceTab === '5w2h' && (
                              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                                  Plano de Ação Corretiva - Metodologia 5W2H
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <label className="text-slate-400 font-semibold block mb-1">What (O que será feito?)</label>
                                    <input
                                      type="text"
                                      value={currentPlan.method5W2H?.what || ''}
                                      onChange={(e) => handleUpdateActionPlan(currentPlan.id, {
                                        method5W2H: { ...(currentPlan.method5W2H || { what: '', why: '', where: '', whenDeadline: '', whoResponsible: '', howMethod: '', howMuchCost: '' }), what: e.target.value }
                                      })}
                                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-400 font-semibold block mb-1">Why (Por que será feito?)</label>
                                    <input
                                      type="text"
                                      value={currentPlan.method5W2H?.why || ''}
                                      onChange={(e) => handleUpdateActionPlan(currentPlan.id, {
                                        method5W2H: { ...(currentPlan.method5W2H || { what: '', why: '', where: '', whenDeadline: '', whoResponsible: '', howMethod: '', howMuchCost: '' }), why: e.target.value }
                                      })}
                                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-400 font-semibold block mb-1">Where (Onde será feito?)</label>
                                    <input
                                      type="text"
                                      value={currentPlan.method5W2H?.where || ''}
                                      onChange={(e) => handleUpdateActionPlan(currentPlan.id, {
                                        method5W2H: { ...(currentPlan.method5W2H || { what: '', why: '', where: '', whenDeadline: '', whoResponsible: '', howMethod: '', howMuchCost: '' }), where: e.target.value }
                                      })}
                                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-400 font-semibold block mb-1">When (Quando / Prazo?)</label>
                                    <input
                                      type="date"
                                      value={currentPlan.method5W2H?.whenDeadline || currentPlan.deadline}
                                      onChange={(e) => handleUpdateActionPlan(currentPlan.id, {
                                        method5W2H: { ...(currentPlan.method5W2H || { what: '', why: '', where: '', whenDeadline: '', whoResponsible: '', howMethod: '', howMuchCost: '' }), whenDeadline: e.target.value }
                                      })}
                                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-400 font-semibold block mb-1">Who (Quem é o responsável?)</label>
                                    <input
                                      type="text"
                                      value={currentPlan.method5W2H?.whoResponsible || currentPlan.responsible}
                                      onChange={(e) => handleUpdateActionPlan(currentPlan.id, {
                                        method5W2H: { ...(currentPlan.method5W2H || { what: '', why: '', where: '', whenDeadline: '', whoResponsible: '', howMethod: '', howMuchCost: '' }), whoResponsible: e.target.value }
                                      })}
                                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-400 font-semibold block mb-1">How Much (Custo estimado?)</label>
                                    <input
                                      type="text"
                                      value={currentPlan.method5W2H?.howMuchCost || ''}
                                      onChange={(e) => handleUpdateActionPlan(currentPlan.id, {
                                        method5W2H: { ...(currentPlan.method5W2H || { what: '', why: '', where: '', whenDeadline: '', whoResponsible: '', howMethod: '', howMuchCost: '' }), howMuchCost: e.target.value }
                                      })}
                                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <label className="text-slate-400 font-semibold block mb-1">How (Como será feito / Método?)</label>
                                    <textarea
                                      rows={2}
                                      value={currentPlan.method5W2H?.howMethod || ''}
                                      onChange={(e) => handleUpdateActionPlan(currentPlan.id, {
                                        method5W2H: { ...(currentPlan.method5W2H || { what: '', why: '', where: '', whenDeadline: '', whoResponsible: '', howMethod: '', howMuchCost: '' }), howMethod: e.target.value }
                                      })}
                                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {planWorkspaceTab === 'eficacia' && (
                              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                                  Verificação Formal de Eficácia
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-4">
                                    <label className="text-slate-400">Ação foi eficaz?</label>
                                    <select
                                      value={currentPlan.effectivenessVerification?.isEffective ? 'Sim' : 'Não'}
                                      onChange={(e) => handleUpdateActionPlan(currentPlan.id, {
                                        effectivenessVerification: {
                                          verifiedBy: currentPlan.responsible,
                                          verificationDate: new Date().toISOString().split('T')[0],
                                          isEffective: e.target.value === 'Sim',
                                          notes: currentPlan.effectivenessVerification?.notes || '',
                                        }
                                      })}
                                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                                    >
                                      <option value="Sim">Sim (Eficaz)</option>
                                      <option value="Não">Não (Ineficaz / Reabrir)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-slate-400 block mb-1">Observações da Verificação</label>
                                    <textarea
                                      rows={3}
                                      value={currentPlan.effectivenessVerification?.notes || ''}
                                      onChange={(e) => handleUpdateActionPlan(currentPlan.id, {
                                        effectivenessVerification: {
                                          verifiedBy: currentPlan.responsible,
                                          verificationDate: new Date().toISOString().split('T')[0],
                                          isEffective: currentPlan.effectivenessVerification?.isEffective ?? true,
                                          notes: e.target.value,
                                        }
                                      })}
                                      placeholder="Descreva as evidências verificadas..."
                                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedProcessForReport(selectedProcessForExec);
                  setSelectedProcessForExec(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-orange-400" />
                <span>Gerar Relatório Oficial</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProcessForExec(null)}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-orange-500/20"
              >
                Concluir & Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: RELATÓRIO EXECUTIVO PERSONALIZADO (ETAPA 5)
      ========================================================================= */}
      {selectedProcessForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Relatório Técnico do Processo Modular</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Nexus Veritas Certification • Relatório Criptografado SHA-256</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 text-orange-400" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedProcessForReport(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Document Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-200 bg-slate-900 print:bg-white print:text-black">
              {/* Document Letterhead */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white uppercase tracking-wider">
                      NEXUS VERITAS CERTIFICATION
                    </h2>
                    <span className="text-[11px] text-orange-400 font-mono font-bold block">
                      DIAGNÓSTICO & AVALIAÇÃO DE PROCESSO MODULAR
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Rastreabilidade Digital • Validação Técnica Integrada
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-slate-400 space-y-0.5">
                  <div>REGISTRO: <strong className="text-white">{selectedProcessForReport.code}</strong></div>
                  <div>DATA: <strong className="text-white">{selectedProcessForReport.date}</strong></div>
                  <div>STATUS: <strong className="text-emerald-400">{selectedProcessForReport.status}</strong></div>
                </div>
              </div>

              {/* Identification Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Objeto / Empresa Avaliada</span>
                  <div className="text-sm font-bold text-white mt-1">{selectedProcessForReport.clientOrUnit}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{selectedProcessForReport.title}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Responsável Técnico / Auditor</span>
                  <div className="text-sm font-bold text-white mt-1">{selectedProcessForReport.responsible}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Metodologia: {METHOD_LABELS[selectedProcessForReport.evaluationMethod]}</div>
                </div>
              </div>

              {/* Purpose & Scope */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-orange-400 block tracking-wider">
                  Objetivo & Escopo da Avaliação
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedProcessForReport.purpose}
                </p>
              </div>

              {/* Results & Score Highlights */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-orange-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider block">
                    Classificação & Parecer Geral
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {selectedProcessForReport.classificationResult}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Fórmula de cálculo: {selectedProcessForReport.calculationRules.calculationType} • Limite: {selectedProcessForReport.calculationRules.acceptanceThreshold}%
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Score Consolidado</span>
                  <span className="text-3xl font-mono font-black text-emerald-400">
                    {selectedProcessForReport.overallScore}%
                  </span>
                </div>
              </div>

              {/* Detailed Criteria Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Detalhamento dos Critérios e Evidências Objetivas
                </h4>
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                        <th className="p-3">Código / Critério</th>
                        <th className="p-3">Pilar</th>
                        <th className="p-3">Peso</th>
                        <th className="p-3">Resultado</th>
                        <th className="p-3">Evidências Registradas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {selectedProcessForReport.criteria.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-950/40">
                          <td className="p-3 font-semibold text-white">
                            <div>{c.title}</div>
                            <span className="text-[10px] text-slate-500 font-mono">{c.code}</span>
                          </td>
                          <td className="p-3 text-slate-400">{c.categoryOrPillar}</td>
                          <td className="p-3 font-mono text-slate-300">{c.weight}x</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-orange-400 border border-slate-700">
                              {c.statusLabel} ({c.scorePercentage}%)
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 text-[11px] max-w-xs">
                            {c.evidenceNotes || 'Nenhuma ressalva registrada.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strong Points & Recommendations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Pontos Fortes Constatados</span>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    {(selectedProcessForReport.strongPoints || ['Atendimento pleno aos requisitos de qualificação técnica.']).map((sp, i) => (
                      <li key={i}>{sp}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Oportunidades & Recomendações</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedProcessForReport.recommendations || 'Manter o monitoramento contínuo dos parâmetros estabelecidos.'}
                  </p>
                </div>
              </div>

              {/* Signature & QR Stamp */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6">
                <div>
                  <div className="text-xs font-mono text-slate-400">
                    Assinado digitalmente por:
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {selectedProcessForReport.approvedBy || selectedProcessForReport.responsible}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                    HASH SHA-256: 7F2B...89D1 · Validação Pública Ativa
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold font-mono">
                    NEXUS-VERITAS-VALIDATED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: SALVAR COMO MODELO (TEMPLATE)
      ========================================================================= */}
      {selectedProcessForTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                <Bookmark className="w-4 h-4" />
                <span>Salvar na Biblioteca de Modelos</span>
              </div>
              <button
                onClick={() => setSelectedProcessForTemplate(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Este modelo ficará disponível na biblioteca para que você ou outros auditores da sua organização possam iniciar novas avaliações com estes critérios e metodologia com um clique.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Nome do Modelo
              </label>
              <input
                type="text"
                value={templateNameInput}
                onChange={(e) => setTemplateNameInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedProcessForTemplate(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  saveAsModularTemplate(selectedProcessForTemplate.id, templateNameInput);
                  setSelectedProcessForTemplate(null);
                  alert('Modelo salvo com sucesso na biblioteca de processos!');
                }}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-orange-500/20"
              >
                Salvar Modelo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
