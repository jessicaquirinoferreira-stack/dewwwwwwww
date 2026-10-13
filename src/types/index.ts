export type Role = 'admin' | 'auditor' | 'empresa';

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

export type SupplierStatus = 'Em Avaliação' | 'Qualificado' | 'Homologado' | 'Bloqueado';

export interface Supplier {
  id: string;
  tradeName: string;
  corporateName: string;
  cnpj: string;
  contactEmail: string;
  phone: string;
  category: string;
  iqfScore: number; // 0 - 100
  status: SupplierStatus;
  primaryNorm: string;
  city: string;
  state: string;
  country: string;
  createdAt: string;
  auditNotes?: string;
}

export type AuditType = '1ª Parte (Interna)' | '2ª Parte (Fornecedor)' | '3ª Parte (Certificação)';
export type AuditStatus = 'Em Andamento' | 'Concluída' | 'Certificada' | 'Planejada';

export interface Audit {
  id: string;
  code: string;
  supplierOrClientId: string;
  clientName: string;
  clientAddress: string;
  auditType: AuditType;
  norm: string;
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
  checklistItems?: {
    id: string;
    requirement: string;
    conformity: 'Conforme' | 'Não Conforme' | 'Oportunidade de Melhoria';
    evidence?: string;
  }[];
}

export type ActionPlanStatus = 'Aberto' | 'Em Andamento' | 'Atrasado' | 'Concluído';

export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  auditId?: string;
  auditCode?: string;
  responsible: string;
  deadline: string;
  status: ActionPlanStatus;
  priority: 'Alta' | 'Média' | 'Baixa';
  correctiveAction: string;
  rootCause?: string;
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

export type CertificateStatus = 'Aprovado' | 'Pendente' | 'Vencido' | 'Revogado';

export interface Certificate {
  id: string;
  auditId?: string;
  certificateNumber: string;
  recipientName: string;
  clientAddress: string;
  cnpjOrCpf: string;
  norm: string;
  scope: string;
  issueDate: string;
  expiryDate: string;
  status: CertificateStatus;
  qrCodeUrl: string;
  leadAuditor: string;
  technicalManager: string;
  technicalManagerSignature: string;
}

export type DocumentType = 'checklist' | 'formulario' | 'certificado';

export interface CustomDocument {
  id: string;
  title: string;
  type: DocumentType;
  norm: string;
  version: string;
  updatedAt: string;
  description: string;
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
