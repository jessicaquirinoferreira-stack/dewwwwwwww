/**
 * Motor Matemático e Algorítmico ISO (Nexus Veritas)
 * Implementação das regras de negócio e fórmulas normativas oficiais:
 * - ISO 19011: Score ponderado de auditoria com multiplicadores e filtro N/A
 * - ISO 31000: Matriz de risco 5x5 (R = P x I) com faixas e prazos normativos
 * - Gestão de Fornecedores: IQF ponderado (40/25/20/15) e faixas estratégicas
 * - Governança: Validação estrita de transição de status e integridade referencial
 */

export interface AuditItemScoreInput {
  conformity: 'Conforme' | 'Oportunidade de Melhoria' | 'NC Menor' | 'NC Maior' | 'Não Aplicável' | 'Parcial';
  weight?: number;
}

export interface AuditScoreResult {
  score: number; // 0 a 100%
  totalApplicableWeight: number;
  weightedScoreSum: number;
  canCertify: boolean; // Score >= 60%
  requiresTechnicalJustification: boolean; // Score < 60%
  nonConformitiesCount: number;
  criticalFindingsCount: number;
}

/**
 * 4.1 Cálculo da Taxa de Conformidade da Auditoria (Score ISO 19011)
 * Score (%) = ( ∑ (Peso_i × Multiplicador_i) / ∑ Pesos dos Itens Aplicáveis ) × 100
 * Multiplicadores: Conforme = 1.0; Parcial / Oportunidade = 0.5; Não Conforme = 0.0.
 * Itens com status not_applicable / Não Aplicável são sumariamente removidos do numerador e do denominador.
 */
export function calculateAuditComplianceScore(items: AuditItemScoreInput[]): AuditScoreResult {
  if (!items || items.length === 0) {
    return {
      score: 100,
      totalApplicableWeight: 0,
      weightedScoreSum: 0,
      canCertify: true,
      requiresTechnicalJustification: false,
      nonConformitiesCount: 0,
      criticalFindingsCount: 0,
    };
  }

  let totalApplicableWeight = 0;
  let weightedScoreSum = 0;
  let nonConformitiesCount = 0;
  let criticalFindingsCount = 0;

  for (const item of items) {
    if (item.conformity === 'Não Aplicável') {
      continue; // Removido do numerador e denominador
    }

    const weight = typeof item.weight === 'number' && item.weight > 0 ? item.weight : 1.0;
    totalApplicableWeight += weight;

    let multiplier = 0.0;
    if (item.conformity === 'Conforme') {
      multiplier = 1.0;
    } else if (item.conformity === 'Oportunidade de Melhoria' || item.conformity === 'Parcial') {
      multiplier = 0.5;
    } else if (item.conformity === 'NC Menor') {
      multiplier = 0.0;
      nonConformitiesCount++;
    } else if (item.conformity === 'NC Maior') {
      multiplier = 0.0;
      nonConformitiesCount++;
      criticalFindingsCount++;
    }

    weightedScoreSum += weight * multiplier;
  }

  const score =
    totalApplicableWeight > 0
      ? Math.round((weightedScoreSum / totalApplicableWeight) * 100)
      : 100;

  const canCertify = score >= 60;

  return {
    score,
    totalApplicableWeight,
    weightedScoreSum,
    canCertify,
    requiresTechnicalJustification: !canCertify,
    nonConformitiesCount,
    criticalFindingsCount,
  };
}

export type ISO31000RiskLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';

export interface ISO31000RiskResult {
  probability: number; // 1 a 5
  impact: number; // 1 a 5
  riskScore: number; // 1 a 25
  level: ISO31000RiskLevel;
  actionRequired: string;
  maxResolutionDays: number;
  blocksCertification: boolean;
}

/**
 * 4.2 Matriz de Risco ISO 31000 (5×5)
 * Risco (R) = Probabilidade (P ∈ [1,5]) × Impacto (I ∈ [1,5])
 * - 1 ≤ R ≤ 4: Baixo (Aceitável sob monitoramento rotineiro)
 * - 5 ≤ R ≤ 9: Médio (Requer plano de ação em até 60 dias)
 * - 10 ≤ R ≤ 15: Alto (Contenção imediata em 24h + plano corretivo em 30 dias)
 * - 16 ≤ R ≤ 25: Crítico (Veto à emissão de certificado / bloqueio imediato)
 */
export function calculateISO31000Risk(
  probability: number,
  impact: number
): ISO31000RiskResult {
  const p = Math.max(1, Math.min(5, Math.round(probability || 1)));
  const i = Math.max(1, Math.min(5, Math.round(impact || 1)));
  const riskScore = p * i;

  let level: ISO31000RiskLevel = 'Baixo';
  let actionRequired = 'Aceitável sob monitoramento rotineiro.';
  let maxResolutionDays = 180;
  let blocksCertification = false;

  if (riskScore >= 16) {
    level = 'Crítico';
    actionRequired = 'Veto à emissão de certificado / bloqueio imediato do fornecedor. Contenção emergencial imediata.';
    maxResolutionDays = 1; // 24h
    blocksCertification = true;
  } else if (riskScore >= 10) {
    level = 'Alto';
    actionRequired = 'Contenção imediata em 24h + plano corretivo formal em até 30 dias.';
    maxResolutionDays = 30;
    blocksCertification = false;
  } else if (riskScore >= 5) {
    level = 'Médio';
    actionRequired = 'Requer abertura de plano de ação 5W2H em até 60 dias.';
    maxResolutionDays = 60;
    blocksCertification = false;
  }

  return {
    probability: p,
    impact: i,
    riskScore,
    level,
    actionRequired,
    maxResolutionDays,
    blocksCertification,
  };
}

export type IQFCategory =
  | 'Fornecedor Estratégico'
  | 'Qualificado'
  | 'Em Monitoramento'
  | 'Reprovado / Crítico';

export interface IQFCalculationResult {
  calculatedIQF: number; // 0 a 100
  qualityWeighted: number; // 40%
  deliveryWeighted: number; // 25%
  esgWeighted: number; // 20%
  complianceWeighted: number; // 15%
  category: IQFCategory;
  recommendedStatus: 'Homologado' | 'Qualificado' | 'Em Avaliação' | 'Suspenso';
  requiresActionPlan: boolean;
  notes: string;
}

/**
 * 4.3 Cálculo do Índice de Qualificação de Fornecedores (IQF)
 * IQF = (Qualidade × 0.40) + (Pontualidade/Entrega × 0.25) + (Sustentabilidade/ESG × 0.20) + (Conformidade Documental × 0.15)
 * Faixas:
 * - ≥ 85: Fornecedor Estratégico (Prioritário para contratações)
 * - 70 ≤ IQF < 85: Qualificado (Aprovado com auditorias anuais)
 * - 50 ≤ IQF < 70: Em Monitoramento (Exige auditorias semestrais e planos 5W2H)
 * - < 50: Reprovado / Crítico (Suspensão preventiva de novos pedidos)
 */
export function calculateSupplierIQF(
  quality: number,
  delivery: number,
  esg: number,
  complianceDocs: number
): IQFCalculationResult {
  const q = Math.max(0, Math.min(100, quality || 0));
  const d = Math.max(0, Math.min(100, delivery || 0));
  const e = Math.max(0, Math.min(100, esg || 0));
  const c = Math.max(0, Math.min(100, complianceDocs || 0));

  const qualityWeighted = q * 0.4;
  const deliveryWeighted = d * 0.25;
  const esgWeighted = e * 0.2;
  const complianceWeighted = c * 0.15;

  const rawIQF = qualityWeighted + deliveryWeighted + esgWeighted + complianceWeighted;
  const calculatedIQF = Math.round(rawIQF);

  let category: IQFCategory = 'Reprovado / Crítico';
  let recommendedStatus: 'Homologado' | 'Qualificado' | 'Em Avaliação' | 'Suspenso' = 'Suspenso';
  let requiresActionPlan = true;
  let notes = 'Fornecedor abaixo do índice mínimo aceitável. Suspensão preventiva recomendada.';

  if (calculatedIQF >= 85) {
    category = 'Fornecedor Estratégico';
    recommendedStatus = 'Homologado';
    requiresActionPlan = false;
    notes = 'Fornecedor de alta performance e excelência operacional. Prioritário em compras.';
  } else if (calculatedIQF >= 70) {
    category = 'Qualificado';
    recommendedStatus = 'Qualificado';
    requiresActionPlan = false;
    notes = 'Fornecedor atende aos requisitos operacionais e normativos. Auditorias anuais.';
  } else if (calculatedIQF >= 50) {
    category = 'Em Monitoramento';
    recommendedStatus = 'Em Avaliação';
    requiresActionPlan = true;
    notes = 'Desempenho limítrofe. Requer plano de ação corretivo 5W2H e auditorias semestrais.';
  }

  return {
    calculatedIQF,
    qualityWeighted: Math.round(qualityWeighted * 10) / 10,
    deliveryWeighted: Math.round(deliveryWeighted * 10) / 10,
    esgWeighted: Math.round(esgWeighted * 10) / 10,
    complianceWeighted: Math.round(complianceWeighted * 10) / 10,
    category,
    recommendedStatus,
    requiresActionPlan,
    notes,
  };
}

/**
 * 4.4 Validação de Mudança de Status do Fornecedor
 * Regras:
 * - Para Homologado / Qualificado: CNPJ válido, 100% dos documentos obrigatórios válidos, avaliação técnica >= 70
 * - Para Bloquear / Cancelar: Justificativa com no mínimo 20 caracteres obrigatória
 */
export interface StatusTransitionValidation {
  isValid: boolean;
  errorMessage?: string;
}

export function validateSupplierStatusTransition(
  targetStatus: 'Homologado' | 'Qualificado' | 'Suspenso' | 'Bloqueado' | 'Cancelado' | 'Em Avaliação' | 'Pendente',
  justification?: string,
  extraChecks?: {
    cnpjValid?: boolean;
    mandatoryDocsApproved?: boolean;
    technicalScore?: number;
  }
): StatusTransitionValidation {
  if (targetStatus === 'Bloqueado' || targetStatus === 'Cancelado' || targetStatus === 'Suspenso') {
    const text = (justification || '').trim();
    if (text.length < 20) {
      return {
        isValid: false,
        errorMessage: `A alteração para "${targetStatus}" exige justificativa formal com no mínimo 20 caracteres (atual: ${text.length} caracteres).`,
      };
    }
  }

  if (targetStatus === 'Homologado' || targetStatus === 'Qualificado') {
    if (extraChecks) {
      if (extraChecks.cnpjValid === false) {
        return {
          isValid: false,
          errorMessage: 'Não é possível homologar/qualificar fornecedor com CNPJ inválido ou irregular.',
        };
      }
      if (extraChecks.mandatoryDocsApproved === false) {
        return {
          isValid: false,
          errorMessage: 'Não é possível homologar/qualificar fornecedor com pendências na documentação obrigatória.',
        };
      }
      if (typeof extraChecks.technicalScore === 'number' && extraChecks.technicalScore < 70) {
        return {
          isValid: false,
          errorMessage: `Média de avaliação técnica insuficiente (${extraChecks.technicalScore}). Exigido mínimo de 70 pontos.`,
        };
      }
    }
  }

  return { isValid: true };
}
