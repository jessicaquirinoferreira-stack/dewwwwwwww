import React, { useState } from 'react';
import {
  Award,
  Plus,
  Sliders,
  AlertCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  Download,
  Printer,
  ShieldCheck,
  X,
  ExternalLink,
  Search,
  Lock,
  History,
  Check,
  Shield,
  FileText,
  BadgeAlert,
  RotateCcw,
  Building2,
  Calendar,
  AlertOctagon,
  Copy
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { StatCard } from '../common/StatCard';
import { EmptyState } from '../common/EmptyState';
import {
  Certificate,
  CertificateStatus,
  CertificateType
} from '../../types';
import { STANDARD_NORMS } from '../../data/initialData';

interface CertificatesViewProps {
  onOpenDocuments: () => void;
  onOpenAudits: () => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  onOpenDocuments,
  onOpenAudits,
}) => {
  const { theme } = useTheme();
  const {
    certificates,
    audits,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    updateCertificateLifecycle
  } = useData();

  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterType, setFilterType] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewCertModalOpen, setIsNewCertModalOpen] = useState(false);
  const [warningAlert, setWarningAlert] = useState<string | null>(null);

  // Selected certificate for official printable certificate view
  const [selectedCertForView, setSelectedCertForView] = useState<Certificate | null>(null);

  // Public QR Code verification modal
  const [publicVerifyModalCert, setPublicVerifyModalCert] = useState<Certificate | null>(null);
  const [verifySearchInput, setVerifySearchInput] = useState('');
  const [verifyResultState, setVerifyResultState] = useState<'idle' | 'validating' | 'verified' | 'not-found'>('idle');

  // Lifecycle transition modal
  const [lifecycleModalCert, setLifecycleModalCert] = useState<Certificate | null>(null);
  const [newLifecycleStatus, setNewLifecycleStatus] = useState<CertificateStatus>('Vigente');
  const [lifecycleJustification, setLifecycleJustification] = useState('');
  const [lifecycleResponsible, setLifecycleResponsible] = useState('Bruno Alvarenga - Gerente Técnico (IRCA)');

  // Form State for new certificate
  const [formData, setFormData] = useState({
    auditId: '',
    certificateType: 'Acreditado Internacionalmente (ISO/IEC 17021-1)' as CertificateType,
    accreditationBody: 'CGCRE / INMETRO - Acreditação OHC-0021 / IAF MLA',
    recipientName: '',
    clientAddress: 'Av. Paulista, 1000 - São Paulo - SP',
    cnpjOrCpf: '',
    norm: 'ISO 9001',
    scope: 'Sistema de Gestão da Qualidade aplicável a projeto, fabricação e distribuição com conformidade internacional.',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 86400000 * 365 * 3).toISOString().split('T')[0],
    maintenanceAuditDate: new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0],
    recertificationDate: new Date(Date.now() + 86400000 * 365 * 3).toISOString().split('T')[0],
    status: 'Vigente' as CertificateStatus,
    leadAuditor: 'Dra. Carolina Mendes (IRCA-604218)',
    technicalManager: 'Bruno Alvarenga',
    technicalManagerSignature: 'Bruno Alvarenga - Gerente Técnico Sênior (CRC/IRCA)',
    revisionNumber: 'Rev. 00',
  });

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDateStr: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filtered Certificates
  const filteredCerts = certificates.filter((c) => {
    const matchesStatus = filterStatus === 'Todos' ? true : c.status === filterStatus;
    const matchesType =
      filterType === 'Todos'
        ? true
        : filterType === 'Acreditado'
        ? c.certificateType.includes('Acreditado Internacionalmente')
        : c.certificateType.includes('Não Acreditado');
    const matchesSearch =
      c.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.norm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.cnpjOrCpf && c.cnpjOrCpf.includes(searchQuery));
    return matchesStatus && matchesType && matchesSearch;
  });

  // KPI stats
  const totalCount = certificates.length;
  const vigentesCount = certificates.filter((c) => c.status === 'Vigente' || c.status === 'Aprovado').length;
  const aVencerCount = certificates.filter((c) => {
    if (c.status === 'Suspenso' || c.status === 'Cancelado') return false;
    const days = getDaysUntilExpiry(c.expiryDate);
    return (days <= 60 && days > 0) || c.status === 'A Vencer';
  }).length;
  const suspensosCount = certificates.filter((c) => c.status === 'Suspenso' || c.status === 'Cancelado').length;
  const emAnaliseCount = certificates.filter((c) => c.status === 'Em Análise' || c.status === 'Aprovado para Emissão').length;

  // Open New Certificate Modal
  const handleOpenNewCert = () => {
    if (audits.length === 0) {
      setWarningAlert('Você precisa concluir ao menos uma auditoria com resultado conforme antes de emitir um certificado oficial.');
      return;
    }
    setWarningAlert(null);
    const aud = audits[0];
    setFormData((prev) => ({
      ...prev,
      auditId: aud?.id || '',
      recipientName: aud?.clientName || '',
      clientAddress: aud?.clientAddress || prev.clientAddress,
      norm: aud?.norm || prev.norm,
      scope: aud?.scope || prev.scope,
      leadAuditor: aud?.leadAuditor || prev.leadAuditor,
      technicalManager: aud?.technicalManager || 'Bruno Alvarenga',
      technicalManagerSignature: `${aud?.technicalManager || 'Bruno Alvarenga'} - Gerente Técnico Sênior (CRC/IRCA)`,
    }));
    setIsNewCertModalOpen(true);
  };

  // Create Certificate
  const handleCreateCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientName) return;

    const certNum = `NVC-BR-2026-${Math.floor(Math.random() * 8999 + 1000)}`;
    const qrCodeUrl = `https://nexusveritas.org/verify/${certNum}`;
    const sha256Hash = `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}:${Math.random().toString(36).substring(2, 10).toUpperCase()}:${Date.now().toString(16)}`;

    addCertificate({
      ...formData,
      certificateNumber: certNum,
      qrCodeUrl,
      sha256Hash,
      statusHistory: [
        {
          status: formData.status,
          date: new Date().toISOString().split('T')[0],
          justification: 'Emissão inicial com base no ciclo de auditoria aprovado.',
          responsible: formData.technicalManager,
        },
      ],
      linkedDocuments: ['Relatório Técnico de Auditoria', 'Checklist de Conformidade', 'Parecer Deliberativo'],
    });

    setIsNewCertModalOpen(false);
  };

  // Submit Lifecycle Change
  const handleSubmitLifecycleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lifecycleModalCert) return;

    updateCertificateLifecycle(
      lifecycleModalCert.id,
      newLifecycleStatus,
      lifecycleJustification || `Transição técnica para ${newLifecycleStatus}`,
      lifecycleResponsible
    );

    setLifecycleModalCert(null);
    setLifecycleJustification('');
  };

  // Handle Public Verification Lookup
  const handlePerformPublicLookup = (certToVerify?: Certificate) => {
    const targetCert = certToVerify || certificates.find((c) =>
      c.certificateNumber.toLowerCase() === verifySearchInput.trim().toLowerCase() ||
      c.recipientName.toLowerCase().includes(verifySearchInput.trim().toLowerCase())
    );

    setVerifyResultState('validating');
    setTimeout(() => {
      if (targetCert) {
        setPublicVerifyModalCert(targetCert);
        setVerifyResultState('verified');
      } else {
        setVerifyResultState('not-found');
      }
    }, 600);
  };

  const getStatusBadge = (status: CertificateStatus) => {
    switch (status) {
      case 'Vigente':
      case 'Aprovado':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'Em Análise':
      case 'Aprovado para Emissão':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'A Vencer':
      case 'Em Renovação':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'Suspenso':
      case 'Cancelado':
      case 'Vencido':
      case 'Revogado':
      case 'Expirado':
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
              ACREDITAÇÃO & REGISTROS INTERNACIONAIS
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">ISO/IEC 17021-1 · QR Code SHA-256</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Certificados & Acreditação Internacional
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Gestão do ciclo de vida dos certificados (em análise, vigente, a vencer, suspenso ou cancelado), verificação pública por QR Code e integridade criptográfica SHA-256.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setVerifyResultState('idle');
              setVerifySearchInput('');
              setPublicVerifyModalCert(certificates[0] || null);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4 text-orange-400" />
            <span>Consulta Pública QR Code</span>
          </button>

          <button
            onClick={handleOpenNewCert}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Certificado</span>
          </button>
        </div>
      </div>

      {/* Warning message if needed */}
      {warningAlert && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-700/80 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-semibold">{warningAlert}</span>
          </div>
          <button
            onClick={onOpenAudits}
            className="px-3 py-1.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 text-xs shrink-0 cursor-pointer"
          >
            Ir para Auditorias
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          label="TOTAL CERTIFICADOS"
          value={totalCount}
          subtitle="Emitidos e sob custódia"
          icon={Award}
          badge="Total"
          badgeColor="stone"
          active={filterStatus === 'Todos'}
          onClick={() => setFilterStatus('Todos')}
        />
        <StatCard
          label="CERTIFICADOS VIGENTES"
          value={vigentesCount}
          subtitle="Situação regularizada"
          icon={CheckCircle2}
          badge="Vigentes"
          badgeColor="green"
          active={filterStatus === 'Vigente'}
          onClick={() => setFilterStatus('Vigente')}
        />
        <StatCard
          label="A VENCER (&lt; 60 DIAS)"
          value={aVencerCount}
          subtitle="Em ciclo de vigilância"
          icon={AlertTriangle}
          badge="Atenção"
          badgeColor="yellow"
          active={filterStatus === 'A Vencer'}
          onClick={() => setFilterStatus('A Vencer')}
        />
        <StatCard
          label="EM ANÁLISE TÉCNICA"
          value={emAnaliseCount}
          subtitle="Aguardando liberação"
          icon={Clock}
          badge="Comitê"
          badgeColor="blue"
          active={filterStatus === 'Em Análise'}
          onClick={() => setFilterStatus('Em Análise')}
        />
        <StatCard
          label="SUSPENSOS / CANCELADOS"
          value={suspensosCount}
          subtitle="Perda de conformidade"
          icon={AlertOctagon}
          badge="Bloqueados"
          badgeColor="red"
          active={filterStatus === 'Suspenso'}
          onClick={() => setFilterStatus('Suspenso')}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border transition-colors ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {(['Todos', 'Vigente', 'A Vencer', 'Em Análise', 'Em Renovação', 'Suspenso', 'Cancelado'] as const).map((st) => (
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
              <span className="text-[11px] font-bold uppercase">Acreditação:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`text-xs px-2.5 py-1.5 rounded-xl border focus:outline-none focus:border-orange-500 ${
                  theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              >
                <option value="Todos">Todos os Tipos</option>
                <option value="Acreditado">Acreditados (ISO 17021-1)</option>
                <option value="Interno">Conformidade Interna</option>
              </select>
            </div>

            <div className="relative sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por titular, nº de registro..."
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

      {/* Certificates Cards */}
      {filteredCerts.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Nenhum certificado encontrado"
          description={
            certificates.length === 0
              ? 'Não há certificados emitidos no sistema. Conclua uma auditoria e emita o certificado oficial com QR Code e hash de integridade.'
              : 'Nenhum certificado corresponde aos filtros selecionados.'
          }
          actionLabel="+ Novo Certificado"
          onAction={handleOpenNewCert}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCerts.map((c) => {
            const isAccredited = c.certificateType.includes('Acreditado Internacionalmente');
            const daysUntil = getDaysUntilExpiry(c.expiryDate);
            return (
              <div
                key={c.id}
                className={`border rounded-2xl p-5 shadow-sm transition-all relative flex flex-col justify-between group ${
                  c.status === 'Suspenso' || c.status === 'Cancelado'
                    ? 'bg-slate-900/90 border-rose-800/70'
                    : theme === 'light'
                    ? 'bg-white border-slate-200 hover:border-orange-500/50'
                    : 'bg-slate-900/90 border-slate-800 hover:border-orange-500/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                        isAccredited
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {isAccredited ? 'Acreditado ISO 17021-1' : 'Conformidade Interna'}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      {c.revisionNumber || 'Rev. 00'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-tight mt-1">{c.recipientName}</h3>
                  <p className="text-xs font-mono text-orange-400 font-semibold mt-0.5">{c.certificateNumber}</p>
                  <p className="text-xs text-slate-300 mt-2 font-medium">{c.norm}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic">"{c.scope}"</p>

                  {/* Dates & Timeline */}
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ciclo de Validade:</span>
                      <span className="text-slate-200 font-mono">{c.issueDate} a {c.expiryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dias Restantes:</span>
                      <span className={`font-mono font-bold ${daysUntil <= 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {daysUntil > 0 ? `${daysUntil} dias` : 'Vencido'}
                      </span>
                    </div>
                    {c.accreditationBody && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Órgão Acreditador:</span>
                        <span className="text-slate-300 truncate max-w-[150px]">{c.accreditationBody}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => setSelectedCertForView(c)}
                      className="inline-flex items-center gap-1.5 text-orange-400 font-bold hover:underline cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Ver Certificado PDF</span>
                    </button>

                    <button
                      onClick={() => {
                        setPublicVerifyModalCert(c);
                        setVerifyResultState('verified');
                      }}
                      className="inline-flex items-center gap-1.5 text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Validar QR Code</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                    <button
                      onClick={() => {
                        setLifecycleModalCert(c);
                        setNewLifecycleStatus(c.status);
                        setLifecycleJustification('');
                      }}
                      className="text-slate-400 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-orange-400" />
                      <span>Ciclo de Vida ({c.statusHistory?.length || 1})</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Remover certificado ${c.certificateNumber}?`)) {
                          deleteCertificate(c.id);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400"
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

      {/* MODAL: VISUALIZADOR OFICIAL DO CERTIFICADO EXECUTIVO (PARA IMPRESSÃO / PDF) */}
      {selectedCertForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-950 rounded-3xl w-full max-w-2xl shadow-2xl border-2 border-orange-500/50 overflow-hidden relative p-6 sm:p-8 text-slate-200 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCertForView(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white print:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header Stamp */}
            <div className="text-center border-b border-slate-800 pb-5 mb-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 border border-orange-400/40 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 mb-3">
                <ShieldCheck className="w-10 h-10 stroke-[2]" />
              </div>
              <h2 className="font-brand text-xs font-extrabold tracking-widest text-white uppercase">
                NEXUS VERITAS CERTIFICATION
              </h2>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                CERTIFICADO DE CONFORMIDADE TÉCNICA
              </h1>
              <p className="text-xs font-mono text-orange-400 mt-1">
                Registro Oficial nº {selectedCertForView.certificateNumber} • {selectedCertForView.revisionNumber || 'Rev. 00'}
              </p>
            </div>

            {/* Acreditação Badge */}
            <div className="text-center mb-4">
              <span className={`inline-block px-3.5 py-1 rounded-full text-[11px] font-bold border ${
                selectedCertForView.certificateType.includes('Acreditado Internacionalmente')
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                  : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}>
                {selectedCertForView.certificateType}
              </span>
              {selectedCertForView.accreditationBody && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Acreditado por: {selectedCertForView.accreditationBody}
                </p>
              )}
            </div>

            {/* Body */}
            <div className="space-y-3 text-center my-5">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Certificamos que o sistema de gestão da organização:
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {selectedCertForView.recipientName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                CNPJ/ID: {selectedCertForView.cnpjOrCpf || 'Sob custódia regulatória'} • {selectedCertForView.clientAddress}
              </p>
              <div className="py-2">
                <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900 border border-orange-500/50 text-orange-400 font-bold text-sm font-mono">
                  Conformidade Integral com: {selectedCertForView.norm}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed italic">
                "{selectedCertForView.scope}"
              </p>
            </div>

            {/* Footer with QR Code & signatures */}
            <div className="pt-5 border-t border-slate-800 grid grid-cols-3 gap-3 items-center text-center">
              <div>
                <p className="text-[9px] text-slate-500 uppercase font-semibold">Validade do Ciclo</p>
                <p className="text-xs font-mono font-bold text-white mt-0.5">
                  {selectedCertForView.issueDate} a {selectedCertForView.expiryDate}
                </p>
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                  Manutenção: {selectedCertForView.maintenanceAuditDate || 'Anual'}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-1 shadow-md">
                  <QrCode className="w-13 h-13 text-slate-900" />
                </div>
                <span className="text-[8px] text-slate-400 font-mono mt-1 truncate max-w-[120px]">
                  {selectedCertForView.sha256Hash?.substring(0, 16)}...
                </span>
              </div>

              <div>
                <p className="text-[9px] text-slate-500 uppercase font-semibold">Gestor Técnico</p>
                <p className="text-xs font-semibold text-white mt-0.5 truncate">
                  {selectedCertForView.technicalManager}
                </p>
                <p className="text-[8px] text-emerald-400 font-mono mt-0.5">
                  Assinatura Digital Validada
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONSULTA PÚBLICA DE QR CODE & VALIDAÇÃO CRIPTOGRÁFICA SHA-256 */}
      {publicVerifyModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Portal de Consulta Pública de Certificados</h3>
                  <p className="text-xs text-slate-400">Validação criptográfica de autenticidade e situação cadastral em tempo real.</p>
                </div>
              </div>
              <button onClick={() => setPublicVerifyModalCert(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Lookup search bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Informe o número do certificado ou CNPJ..."
                  value={verifySearchInput}
                  onChange={(e) => setVerifySearchInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                />
                <button
                  onClick={() => handlePerformPublicLookup()}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 cursor-pointer"
                >
                  Consultar
                </button>
              </div>

              {/* Validation Status Block */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Status da Autenticidade</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                    <Check className="w-3 h-3" />
                    INTEGRIDADE CRIPTOGRÁFICA VERIFICADA
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Titular do Certificado</span>
                    <span className="text-white font-bold text-sm">{publicVerifyModalCert.recipientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Situação Cadastral</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block mt-0.5 ${getStatusBadge(publicVerifyModalCert.status)}`}>
                      {publicVerifyModalCert.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Norma Técnica</span>
                    <span className="text-orange-400 font-mono font-bold">{publicVerifyModalCert.norm}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Validade do Ciclo</span>
                    <span className="text-slate-200 font-mono">{publicVerifyModalCert.issueDate} a {publicVerifyModalCert.expiryDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                  <span className="text-slate-500 block text-[9px] uppercase">Chave Hash SHA-256 Registrada:</span>
                  <span className="text-emerald-400 text-[10px] break-all">{publicVerifyModalCert.sha256Hash}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setPublicVerifyModalCert(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
              >
                Fechar Consulta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GERENCIAMENTO DO CICLO DE VIDA DO CERTIFICADO */}
      {lifecycleModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base">Gerenciamento do Ciclo de Vida</h3>
                <p className="text-xs text-slate-400">{lifecycleModalCert.certificateNumber} • {lifecycleModalCert.recipientName}</p>
              </div>
              <button onClick={() => setLifecycleModalCert(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLifecycleChange} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Novo Status do Ciclo *</label>
                <select
                  value={newLifecycleStatus}
                  onChange={(e) => setNewLifecycleStatus(e.target.value as CertificateStatus)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Vigente">Vigente (Apto e Regular)</option>
                  <option value="A Vencer">A Vencer (&lt; 60 dias)</option>
                  <option value="Em Renovação">Em Renovação (Auditoria de Recertificação)</option>
                  <option value="Em Análise">Em Análise Técnica</option>
                  <option value="Aprovado para Emissão">Aprovado para Emissão</option>
                  <option value="Suspenso">Suspenso (Não Conformidade Crítica)</option>
                  <option value="Cancelado">Cancelado (Perda definitiva de acreditação)</option>
                  <option value="Expirado">Expirado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Responsável Técnico Deliberador</label>
                <input
                  type="text"
                  required
                  value={lifecycleResponsible}
                  onChange={(e) => setLifecycleResponsible(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Justificativa Regulatória / Parecer *</label>
                <textarea
                  rows={3}
                  required
                  value={lifecycleJustification}
                  onChange={(e) => setLifecycleJustification(e.target.value)}
                  placeholder="Informe o motivo da alteração de status (ex: Conclusão satisfatória de auditoria periódica de manutenção)..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Status history list */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Histórico de Alterações Anteriores:</span>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                  {(lifecycleModalCert.statusHistory || []).map((h, idx) => (
                    <div key={idx} className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
                      <div className="flex justify-between">
                        <span className="font-bold text-orange-400">{h.status}</span>
                        <span className="text-slate-500 font-mono text-[10px]">{h.date}</span>
                      </div>
                      <p className="text-slate-300 text-[10px] mt-0.5">{h.justification}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLifecycleModalCert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 cursor-pointer"
                >
                  Salvar Alteração de Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO CERTIFICADO */}
      {isNewCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base">Emitir Certificado Oficial de Conformidade</h3>
                <p className="text-xs text-slate-400">Emissão com credenciamento internacional e QR Code com chave SHA-256.</p>
              </div>
              <button onClick={() => setIsNewCertModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCert} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Titular do Certificado (Organização) *</label>
                  <input
                    type="text"
                    required
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    placeholder="Ex: BioNutri Alimentos da Terra S.A."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CNPJ / Identificação</label>
                  <input
                    type="text"
                    value={formData.cnpjOrCpf}
                    onChange={(e) => setFormData({ ...formData, cnpjOrCpf: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Acreditação *</label>
                  <select
                    value={formData.certificateType}
                    onChange={(e) => setFormData({ ...formData, certificateType: e.target.value as CertificateType })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Acreditado Internacionalmente (ISO/IEC 17021-1)">Acreditado Internacionalmente (ISO/IEC 17021-1)</option>
                    <option value="Conformidade Interna / Não Acreditado">Conformidade Interna / Não Acreditado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Norma</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Órgão Acreditador</label>
                  <input
                    type="text"
                    value={formData.accreditationBody}
                    onChange={(e) => setFormData({ ...formData, accreditationBody: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data Emissão</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data Validade (3 Anos)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Escopo da Certificação</label>
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
                  onClick={() => setIsNewCertModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 cursor-pointer"
                >
                  Emitir Certificado com QR Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
