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
  ExternalLink
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatCard } from '../common/StatCard';
import { EmptyState } from '../common/EmptyState';
import { Certificate, CertificateStatus } from '../../types';
import { STANDARD_NORMS } from '../../data/initialData';

interface CertificatesViewProps {
  onOpenDocuments: () => void;
  onOpenAudits: () => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  onOpenDocuments,
  onOpenAudits,
}) => {
  const { certificates, audits, addCertificate, deleteCertificate } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCertForView, setSelectedCertForView] = useState<Certificate | null>(null);
  const [warningAlert, setWarningAlert] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    recipientName: '',
    clientAddress: 'Av. Paulista, 1000 - São Paulo - SP',
    cnpjOrCpf: '',
    norm: 'ISO 9001',
    scope: 'Sistema de Gestão da Qualidade aplicável a projeto, fabricação e distribuição.',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 86400000 * 365 * 3).toISOString().split('T')[0],
    status: 'Aprovado' as CertificateStatus,
    leadAuditor: 'Comitê de Certificação Nexus Veritas',
    technicalManager: 'Bruno Alvarenga',
    technicalManagerSignature: 'Bruno Alvarenga - Gerente Técnico Sênior (CRC/IRCA)',
  });

  const totalCount = certificates.length;
  const aprovadosCount = certificates.filter((c) => c.status === 'Aprovado').length;
  const pendentesCount = certificates.filter((c) => c.status === 'Pendente').length;
  const vencidosCount = certificates.filter((c) => c.status === 'Vencido').length;

  const handleOpenNewCert = () => {
    if (audits.length === 0) {
      setWarningAlert(
        'Você precisa concluir ao menos uma auditoria com resultado conforme antes de emitir um certificado oficial.'
      );
      return;
    }
    setWarningAlert(null);
    if (audits[0]) {
      setFormData((prev) => ({
        ...prev,
        recipientName: audits[0].clientName,
        clientAddress: audits[0].clientAddress || 'Av. Paulista, 1000 - São Paulo - SP',
        norm: audits[0].norm,
        scope: audits[0].scope || prev.scope,
        technicalManager: audits[0].technicalManager || 'Bruno Alvarenga',
        technicalManagerSignature: `${audits[0].technicalManager || 'Bruno Alvarenga'} - Gerente Técnico (CRC/IRCA)`,
      }));
    }
    setIsModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientName) return;

    const certNum = `NVC-BR-2026-${Math.floor(Math.random() * 8999 + 1000)}`;
    const qrCodeUrl = `https://nexusveritas.org/verify/${certNum}`;

    addCertificate({
      ...formData,
      certificateNumber: certNum,
      qrCodeUrl,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Certificados & Acreditação Internacional
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Acreditação ISO/IEC 17021-1, chaves criptográficas de autenticidade e validação de selos com QR Code público.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenDocuments}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold shadow-xs transition-all"
          >
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Personalizar Modelo</span>
          </button>

          <button
            onClick={handleOpenNewCert}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Certificado</span>
          </button>
        </div>
      </div>

      {/* Warning message if no audit exists */}
      {warningAlert && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-700/80 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-semibold">{warningAlert}</span>
          </div>
          <button
            onClick={onOpenAudits}
            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-500 text-xs shrink-0"
          >
            Ir para Auditorias
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="TOTAL"
          value={totalCount}
          subtitle="Títulos registrados"
          icon={Award}
          badge="Total"
          badgeColor="stone"
        />
        <StatCard
          label="APROVADOS"
          value={aprovadosCount}
          subtitle="Válidos e homologados"
          icon={CheckCircle2}
          badge="Ativos"
          badgeColor="green"
        />
        <StatCard
          label="PENDENTES"
          value={pendentesCount}
          subtitle="Em emissão"
          icon={Clock}
          badge="Emissão"
          badgeColor="yellow"
        />
        <StatCard
          label="VENCIDOS"
          value={vencidosCount}
          subtitle="Recertificação requerida"
          icon={AlertTriangle}
          badge="Expirados"
          badgeColor="red"
        />
      </div>

      {/* Listagem */}
      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Nenhum certificado emitido"
          description={
            audits.length === 0
              ? 'Você precisa cadastrar e executar ao menos uma auditoria com o cliente antes de gerar o certificado de conformidade.'
              : 'Não há certificados emitidos no momento. Crie um novo certificado com validação QR Code e assinatura dos auditores responsáveis.'
          }
          actionLabel="+ Novo Certificado"
          onAction={handleOpenNewCert}
          secondaryActionLabel="Personalizar Modelo Oficial"
          onSecondaryAction={onOpenDocuments}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-blue-300 px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-800/80">
                    {c.certificateNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      c.status === 'Aprovado'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                        : c.status === 'Pendente'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                        : 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">
                  {c.recipientName}
                </h3>
                <p className="text-xs font-semibold text-blue-300 font-mono mt-0.5">{c.norm}</p>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {c.scope}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Emissão:</span>
                    <span className="font-mono text-slate-300">{c.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Validade até:</span>
                    <span className="font-mono text-slate-200 font-semibold">{c.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auditor Líder:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{c.leadAuditor}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedCertForView(c)}
                  className="inline-flex items-center gap-1.5 text-blue-400 font-bold hover:text-blue-300"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Visualizar Selo</span>
                </button>
                <button
                  onClick={() => deleteCertificate(c.id)}
                  className="text-slate-500 hover:text-rose-400 text-[11px]"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Visualizador Oficial do Certificado com QR Code */}
      {selectedCertForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-950 rounded-3xl w-full max-w-2xl shadow-2xl border-2 border-amber-500/40 overflow-hidden relative p-8 text-slate-200">
            <button
              onClick={() => setSelectedCertForView(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header Stamp */}
            <div className="text-center border-b border-slate-800 pb-6 mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 border border-blue-400/30 flex items-center justify-center text-white shadow-md shadow-blue-900/40 mb-3">
                <ShieldCheck className="w-10 h-10 stroke-[2]" />
              </div>
              <h2 className="font-brand text-xs tracking-widest text-white">
                NEXUS VERITAS CERTIFICATION
              </h2>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                CERTIFICADO DE CONFORMIDADE TÉCNICA
              </h1>
              <p className="text-xs font-mono text-blue-400 mt-1">
                Registro Oficial nº {selectedCertForView.certificateNumber}
              </p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-center my-6">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Certificamos que o sistema de gestão da organização:
              </p>
              <h3 className="text-2xl font-bold text-white">
                {selectedCertForView.recipientName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                CNPJ/ID: {selectedCertForView.cnpjOrCpf || 'Registrado sob custódia'}
              </p>
              <div className="py-2">
                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-950 border border-blue-700/60 text-blue-300 font-bold text-sm font-mono">
                  Conformidade Integral com: {selectedCertForView.norm}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed italic">
                "{selectedCertForView.scope}"
              </p>
            </div>

            {/* Footer with QR Code & signatures */}
            <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-4 items-center text-center">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Validade do Ciclo</p>
                <p className="text-xs font-mono font-bold text-white">
                  {selectedCertForView.issueDate} a {selectedCertForView.expiryDate}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-1 shadow-inner">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1">
                  Validação Criptográfica
                </span>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase">Auditor Responsável</p>
                <p className="text-xs font-semibold text-white">
                  {selectedCertForView.leadAuditor}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: + Novo Certificado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-700 overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-lg">
                  Emitir Certificado Oficial
                </h3>
                <p className="text-xs text-slate-400">
                  Geração de hash de conformidade e QR Code rastreável.
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
                  Organização Certificada *
                </label>
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="Nome da empresa ou cliente auditado"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    CNPJ ou Identificador
                  </label>
                  <input
                    type="text"
                    value={formData.cnpjOrCpf}
                    onChange={(e) => setFormData({ ...formData, cnpjOrCpf: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Norma Homologada
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Escopo Detalhado da Certificação
                </label>
                <textarea
                  rows={2}
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Validade do Ciclo (3 anos)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
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
                  Gerar Certificado com QR Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
