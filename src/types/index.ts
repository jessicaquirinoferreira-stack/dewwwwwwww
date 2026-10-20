export type Role = 'master' | 'admin' | 'auditor' | 'empresa' | 'instrutor' | 'colaborador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  jobTitle?: string;
  professionalId?: string; // Registro profissional ex: CREA / CRA / IRCA
  specialties: string[];
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  avatarUrl?: string;
}

export type SupplierStatus =
  | 'Homologado'
  | 'Qualificado'
  | 'Pendente'
  | 'Em Avaliação'
  | 'Suspenso'
  | 'Cancelado'
  | 'Bloqueado';

export type CriticalityLevel = 'Alta' | 'Média' | 'Baixa';

export interface SupplierDocumentGED {
  id: string;
  title: string;
  category:
    | 'Licença Ambiental'
    | 'Contrato Social'
    | 'Certificado ISO'
    | 'Alvará de Funcionamento'
    | 'Certidão Negativa de Débitos'
    | 'PPRA / PCMSO'
    | 'Outro';
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'Válido' | 'A Vencer' | 'Vencido';
  fileUrl?: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface SupplierRiskAssessment {
  operational: number; // 1-5
  regulatory: number; // 1-5
  financial: number; // 1-5
  esg: number; // 1-5
  overallRisk: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  notes?: string;
}

export interface SupplierIQFBreakdown {
  qualityScore: number; // 0-100 (peso 40%)
  deliveryScore: number; // 0-100 (peso 25%)
  esgScore?: number; // 0-100 (peso 20%)
  complianceScore: number; // 0-100 (peso 15%)
  auditScore?: number; // 0-100
  calculatedIQF: number;
  category?: 'Fornecedor Estratégico' | 'Qualificado' | 'Em Monitoramento' | 'Reprovado / Crítico';
  lastCalculated: string;
}

export interface SupplierShareToken {
  id: string;
  token: string;
  sharedWithEmail: string;
  sharedWithRole: 'fornecedor' | 'cliente' | 'consultor';
  createdAt: string;
  expiresAt: string;
  active: boolean;
}

export interface SupplierStatusHistoryEntry {
  id: string;
  previousStatus: SupplierStatus;
  newStatus: SupplierStatus;
  justification: string;
  decidedBy: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  tradeName: string;
  corporateName: string;
  cnpj: string;
  contactName?: string;
  contactEmail: string;
  phone: string;
  website?: string;
  category: string;
  scopeOfSupply?: string;
  criticality: CriticalityLevel;
  iqfScore: number; // 0 - 100
  iqfBreakdown?: SupplierIQFBreakdown;
  riskAssessment?: SupplierRiskAssessment;
  status: SupplierStatus;
  lifecycleStatus?: 'prospecto' | 'homologacao' | 'ativo' | 'suspenso' | 'cancelado';
  primaryNorm: string;
  city: string;
  state: string;
  country: string;
  createdAt: string;
  auditNotes?: string;
  documentsGED?: SupplierDocumentGED[];
  shareTokens?: SupplierShareToken[];
  statusHistory?: SupplierStatusHistoryEntry[];
}

export type AuditType = '1ª Parte (Interna)' | '2ª Parte (Fornecedor)' | '3ª Parte (Certificação)';
export type AuditStatus =
  | 'Planejada'
  | 'Em Andamento'
  | 'Relatório Emitido'
  | 'Em Análise Técnica'
  | 'Aprovada'
  | 'Concluída'
  | 'Certificada';

export type AuditFindingSeverity = 'Conforme' | 'Oportunidade de Melhoria' | 'NC Menor' | 'NC Maior' | 'Não Aplicável';

export interface AuditChecklistItem {
  id: string;
  code?: string; // Cláusula / Identificador (ex: 4.1, 5.2.1)
  requirement: string;
  processOrArea: string;
  guidance?: string; // Orientações ao auditor
  expectedEvidence?: string; // Evidências esperadas
  acceptanceCriteria?: string; // Critérios de aceitação
  conformity: AuditFindingSeverity;
  weight?: number; // Peso do requisito (padrão 1.0)
  probability?: number; // ISO 31000 Probabilidade (1 a 5)
  impact?: number; // ISO 31000 Impacto (1 a 5)
  riskScore?: number; // P x I (1 a 25)
  riskLevel?: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  evidence?: string;
  photoUrl?: string;
  actionPlanCreated?: boolean;
  actionPlanId?: string;
  isActive?: boolean; // Para inativar/desabilitar item específico
  isCustomAdded?: boolean; // Requisito personalizado adicionado pelo cliente/auditor
  order?: number;
}

export interface AuditTechnicalApproval {
  approvedBy: string;
  approvedAt: string;
  decision: 'Aprovado' | 'Ressalvas' | 'Reprovado';
  comments: string;
  signatureHash: string;
}

export interface Audit {
  id: string;
  code: string;
  supplierOrClientId: string;
  clientName: string;
  clientAddress: string;
  auditType: AuditType;
  norm: string;
  checklistTemplateId?: string; // Referência ao modelo de checklist utilizado
  checklistRevision?: string; // Revisão interna do checklist (ex: Rev. 02 - 2026/10)
  checklistNormEdition?: string; // Edição oficial da norma (ex: ABNT NBR ISO 9001:2015)
  scope: string;
  leadAuditor: string;
  auditTeam: string;
  technicalManager: string;
  startDate: string;
  endDate: string;
  validityDate: string;
  status: AuditStatus;
  conformityScore: number; // %
  nonConformitiesCount: number;
  observations?: string;
  checklistItems?: AuditChecklistItem[];
  technicalApproval?: AuditTechnicalApproval;
}

export type ActionPlanStatus =
  | 'Pendente'
  | 'Em Andamento'
  | 'Aguardando Verificação'
  | 'Concluído'
  | 'Atrasado'
  | 'Ineficaz'
  | 'Aberto';

export interface ActionPlan5W2H {
  what: string; // O que será feito?
  why: string; // Por que será feito?
  where: string; // Onde será feito?
  whenDeadline: string; // Quando será feito?
  whoResponsible: string; // Quem é o responsável?
  howMethod: string; // Como será feito?
  howMuchCost: string; // Quanto vai custar?
}

export interface ActionPlanRootCauseIshikawa {
  method: string; // Método
  machine: string; // Máquina / Equipamentos
  measurement: string; // Medida / Indicadores
  environment: string; // Meio Ambiente
  manpower: string; // Mão de Obra
  material: string; // Material / Insumos
  primaryRootCause: string;
}

export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  auditId?: string;
  auditCode?: string;
  supplierId?: string;
  supplierName?: string;
  ncRequirement?: string;
  responsible: string;
  deadline: string;
  status: ActionPlanStatus;
  priority: 'Alta' | 'Média' | 'Baixa';
  correctiveAction: string;
  rootCause?: string;
  containmentAction?: string;
  containmentResponsible?: string;
  containmentDate?: string;
  method5W2H?: ActionPlan5W2H;
  ishikawa?: ActionPlanRootCauseIshikawa;
  fiveWhys?: string[]; // 5 Porquês
  evidenceNotes?: string;
  effectivenessVerification?: {
    verifiedBy: string;
    verificationDate: string;
    isEffective: boolean;
    notes: string;
  };
  history?: {
    timestamp: string;
    action: string;
    author: string;
  }[];
}

export interface MetricIndicator {
  id: string;
  name: string;
  target: number;
  currentValue: number;
  unit: string;
  category: 'Qualidade' | 'Segurança' | 'Meio Ambiente' | 'Compliance' | 'ESG';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export type CertificateStatus =
  | 'Em Análise'
  | 'Aprovado para Emissão'
  | 'Vigente'
  | 'A Vencer'
  | 'Em Renovação'
  | 'Suspenso'
  | 'Cancelado'
  | 'Expirado'
  | 'Aprovado'
  | 'Pendente'
  | 'Vencido'
  | 'Revogado';

export type CertificateType =
  | 'Acreditado Internacionalmente (ISO/IEC 17021-1)'
  | 'Conformidade Interna / Não Acreditado';

export interface Certificate {
  id: string;
  auditId?: string;
  certificateNumber: string;
  certificateType: CertificateType;
  accreditationBody: string;
  recipientName: string;
  clientAddress: string;
  cnpjOrCpf: string;
  norm: string;
  scope: string;
  issueDate: string;
  expiryDate: string;
  recertificationDate?: string;
  maintenanceAuditDate?: string;
  status: CertificateStatus;
  qrCodeUrl: string;
  leadAuditor: string;
  technicalManager: string;
  technicalManagerSignature: string;
  sha256Hash: string;
  revisionNumber: string;
  linkedDocuments?: string[];
  statusHistory?: {
    status: CertificateStatus;
    date: string;
    justification: string;
    responsible: string;
  }[];
}

export type DocumentType = 'checklist' | 'formulario' | 'certificado' | 'procedimento' | 'manual';
export type WorkflowDocumentStatus =
  | 'Em Análise'
  | 'Em Correção'
  | 'Aprovado'
  | 'Publicado'
  | 'Obsoleto';

export interface CustomDocument {
  id: string;
  title: string;
  code?: string;
  type: DocumentType;
  norm: string;
  version: string;
  updatedAt: string;
  description: string;
  status: WorkflowDocumentStatus;
  approvedBy?: string;
  publishedAt?: string;
  isObsolete?: boolean;
  revisionHistory?: {
    revision: string;
    date: string;
    author: string;
    description: string;
  }[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  action: string;
  module: string;
  targetId: string;
  targetName: string;
  details: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'Auditoria' | 'Reunião de Abertura' | 'Follow-up' | 'Treinamento';
  date: string; // YYYY-MM-DD
  time: string;
  responsible: string;
  status: 'Agendada' | 'Confirmada' | 'Realizada';
  location: string;
}

export interface ProfessionalAuditor {
  id: string;
  name: string;
  avatarUrl: string;
  roleTitle: string;
  specialties: string[];
  city: string;
  state: string;
  hourlyRate: number;
  available: boolean;
  ircaNumber?: string;
  rating: number;
  reviewsCount: number;
  email: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  norm: string;
  hours: number;
  instructorName: string;
  enrolled: boolean;
  progress: number;
  coverImage?: string;
  description: string;
}

export interface TechnicalArticle {
  id: string;
  title: string;
  author: string;
  date: string;
  summary: string;
  content: string;
  normTag: string;
  readTime: string;
}

export interface TechnicalTicket {
  id: string;
  subject: string;
  norm: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: 'Aberto' | 'Em Análise' | 'Respondido' | 'Fechado';
  createdAt: string;
  messages: {
    sender: string;
    text: string;
    timestamp: string;
    isStaff: boolean;
  }[];
}

export interface LandingContent {
  heroTitle: string;
  heroSubtitle: string;
  badgeText: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  statsSuppliers: string;
  statsAudits: string;
  statsCertificates: string;
  statsSatisfaction: string;
}

export type PartnershipType =
  | 'Cliente Homologado'
  | 'Parceiro Estratégico'
  | 'Empresa Certificada'
  | 'Aliança Tecnológica';

export interface Partner {
  id: string;
  name: string;
  tradeName?: string;
  logoUrl?: string;
  category: string;
  norm: string;
  websiteUrl?: string;
  partnershipType: PartnershipType;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

// =========================================================================
// MÓDULO: PROCESSO MODULAR (Construtor de Avaliações Personalizadas)
// =========================================================================

export type ModularProcessCategory =
  | 'processo_produtivo'
  | 'produto'
  | 'fornecedor'
  | 'processo_especial'
  | 'inspecao_tecnica'
  | 'diagnostico_gestao'
  | 'financeiro'
  | 'mercado'
  | 'viabilidade_produto'
  | 'maturidade'
  | 'riscos_oportunidades'
  | 'desempenho_operacional'
  | 'checklist_personalizado'
  | 'outro';

export type ModularEvaluationMethod =
  | 'conformity' // Conforme / Não Conforme
  | 'three_levels' // Atende / Atende Parcialmente / Não Atende
  | 'score_5' // Pontuação de 0 a 5
  | 'percentage' // Escala percentual (0 a 100%)
  | 'maturity_levels' // Níveis de Maturidade 1 a 5
  | 'risk_levels' // Baixo / Médio / Alto / Crítico
  | 'approval' // Aprovado / Reprovado / Ressalvas
  | 'custom'; // Critérios personalizados

export type ModularProcessStatus =
  | 'Planejado'
  | 'Em Andamento'
  | 'Concluído'
  | 'Homologado'
  | 'Cancelado';

export interface ModularCriterionAttachment {
  name: string;
  url: string;
  size?: string;
  type?: string;
}

export interface ModularProcessCriterion {
  id: string;
  code?: string;
  title: string;
  categoryOrPillar: string; // Ex: Pilar Técnico, Comercial, Operacional, etc.
  description?: string;
  weight: number; // Peso ponderado (1.0 a 5.0 ou percentual)
  criticality?: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  value: any; // Valor atribuído na avaliação
  scorePercentage: number; // 0 - 100% ponderado
  statusLabel: string; // Texto legível (ex: "Conforme", "Atende", "Nível 4")
  evidenceNotes?: string;
  attachments?: ModularCriterionAttachment[];
  recommendations?: string;
  actionPlanRequired?: boolean;
  actionPlanDetails?: {
    what: string;
    who: string;
    when: string;
    how: string;
  };
}

export interface ModularCalculationRule {
  calculationType: 'weighted_average' | 'simple_sum' | 'percentage' | 'maturity_index' | 'go_no_go';
  acceptanceThreshold: number; // Limite de aceitação (ex: 80% ou 3.5)
  criticalItemOverride: boolean; // Reprovação automática se item crítico falhar
  customClassificationBrackets?: {
    min: number;
    max: number;
    label: string;
    color: string;
    description: string;
  }[];
}

export interface ModularProcess {
  id: string;
  code: string; // Ex: PROC-MOD-2026-001
  title: string; // Nome da análise
  purpose: string; // Finalidade da análise
  category: ModularProcessCategory;
  clientOrUnit: string; // Empresa ou unidade avaliada
  responsible: string; // Responsável
  date: string;
  status: ModularProcessStatus;
  evaluationMethod: ModularEvaluationMethod;
  customScaleOptions?: string[]; // Opções custom se evaluationMethod === 'custom'
  calculationRules: ModularCalculationRule;
  criteria: ModularProcessCriterion[];
  overallScore: number; // 0 a 100 ou índice geral
  classificationResult: string; // Ex: "Aprovado (92%)", "Maturidade Nível 4", "Viável"
  strongPoints?: string[];
  weakPoints?: string[];
  recommendations?: string;
  finalOpinion?: string;
  approvedBy?: string;
  isTemplate?: boolean;
  templateName?: string;
  createdAt: string;
  updatedAt: string;
}

// =========================================================================
// GESTÃO DE CHECKLISTS NORMATIVOS, MODELOS E HISTÓRICO DE REVISÕES
// =========================================================================

export interface ChecklistTemplateItem {
  id: string;
  code?: string; // ex: '4.1', '5.1.2', etc.
  requirement: string; // Título/Requisito normativo ou pergunta
  processOrArea: string; // Área/Processo aplicável
  guidance?: string; // Orientações ao auditor
  expectedEvidence?: string; // Evidências esperadas
  acceptanceCriteria?: string; // Critérios de aceitação
  weight: number; // Peso ponderado (1.0 a 5.0)
  criticality: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  isActive: boolean; // Ativo ou inativado
  order: number;
}

export interface ChecklistRevisionHistory {
  revisionNumber: string; // Ex: 'Rev. 00', 'Rev. 01', 'Rev. 02'
  date: string;
  responsible: string;
  reason: string; // Motivo da alteração / revisão
  changesSummary: string; // Resumo das alterações
}

export interface ChecklistTemplate {
  id: string;
  title: string; // Ex: 'Checklist Oficial ISO 9001:2015'
  norm: string; // Ex: 'ISO 9001'
  normEdition: string; // Ex: 'ABNT NBR ISO 9001:2015' (Edição oficial da norma)
  revisionNumber: string; // Ex: 'Rev. 02' (Revisão interna do checklist)
  type: 'padrao_nexus' | 'personalizado_empresa' | 'auditor_independente';
  scope: string; // Escopo e aplicação
  status: 'Vigente' | 'Em Revisão' | 'Obsoleto';
  ownerId?: string;
  ownerName?: string;
  companyName?: string;
  isSystemStandard: boolean; // Se é modelo oficial da plataforma Nexus Veritas
  items: ChecklistTemplateItem[];
  revisionHistory: ChecklistRevisionHistory[];
  createdAt: string;
  updatedAt: string;
}
