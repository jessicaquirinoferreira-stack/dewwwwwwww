import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Building2,
  Calendar,
  Lock,
  ArrowRight,
  RefreshCw,
  FileText,
  BadgeAlert
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { Certificate } from '../../types';

interface PublicCertificateValidatorProps {
  initialNumber?: string;
  onViewCertificateModal?: (cert: Certificate) => void;
  className?: string;
}

export const PublicCertificateValidator: React.FC<PublicCertificateValidatorProps> = ({
  initialNumber = '',
  onViewCertificateModal,
  className = '',
}) => {
  const { certificates } = useData();
  const { theme } = useTheme();

  const [inputNumber, setInputNumber] = useState(initialNumber);
  const [hasValidated, setHasValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [foundCert, setFoundCert] = useState<Certificate | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [selectedCertForModal, setSelectedCertForModal] = useState<Certificate | null>(null);
  const [validationProtocol, setValidationProtocol] = useState('');
  const [validationTimestamp, setValidationTimestamp] = useState('');

  // Normalize search helper
  const normalize = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const executeValidation = (numToValidate: string) => {
    const query = numToValidate.trim();
    if (!query) return;

    setIsValidating(true);
    setHasValidated(false);

    setTimeout(() => {
      const normalizedQuery = normalize(query);

      // Search certificate by number, or recipient CNPJ or trade name
      const result = certificates.find((c) => {
        const normCertNum = normalize(c.certificateNumber);
        if (normCertNum === normalizedQuery) return true;
        if (c.certificateNumber.toLowerCase().includes(query.toLowerCase())) return true;
        // Also support lookup without prefixes or dashes
        if (normalizedQuery.length >= 4 && normCertNum.includes(normalizedQuery)) return true;
        return false;
      });

      setFoundCert(result || null);
      setValidationProtocol(`NV-VAL-${Date.now().toString().slice(-6)}`);
      setValidationTimestamp(
        new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setIsValidating(false);
      setHasValidated(true);

      // Update URL hash / query smoothly without page refresh
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('verify', query);
        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        // ignore
      }
    }, 400);
  };

  // Prefill and auto-validate if initialNumber is passed
  useEffect(() => {
    if (initialNumber) {
      setInputNumber(initialNumber);
      executeValidation(initialNumber);
    }
  }, [initialNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeValidation(inputNumber);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleClear = () => {
    setInputNumber('');
    setHasValidated(false);
    setFoundCert(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('verify');
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      // ignore
    }
  };

  // Quick preset test samples
  const sampleSuggestions = [
    { label: 'NV-2026-00001', name: 'Aço Forte Industrial (ISO 9001 · Vigente)' },
    { label: 'NVC-BR-2026-FSSC-8841', name: 'BioNutri Alimentos (FSSC 22000 · Vigente)' },
    { label: 'NV-2026-08421', name: 'CyberShield Data Centers (ISO 27001 · Vigente)' },
    { label: 'NV-2026-00045', name: 'LogExpress (ISO 45001 · Suspenso)' },
  ];

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* 1. Header with Badge & Title matching reference screenshot */}
      <div className="mb-6 text-left">
        <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-500 uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0 stroke-[2.5]" />
          <span>VALIDAÇÃO PÚBLICA</span>
        </div>

        <h2
          className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}
        >
          Validar certificado
        </h2>

        <p
          className={`mt-2 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}
        >
          Digite o número impresso no certificado para confirmar se ele é autêntico, se está vigente e quais são
          os dados da empresa certificada.
        </p>
      </div>

      {/* 2. Main Search Card matching user interface */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 shadow-sm ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-slate-100'
            : 'bg-[#111827]/90 border-white/[0.08] backdrop-blur-md shadow-black/20'
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <label
            htmlFor="cert-input-number"
            className={`block text-xs sm:text-sm font-semibold ${
              theme === 'light' ? 'text-slate-800' : 'text-slate-200'
            }`}
          >
            Número do certificado
          </label>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <input
                id="cert-input-number"
                type="text"
                value={inputNumber}
                onChange={(e) => setInputNumber(e.target.value.toUpperCase())}
                placeholder="Ex.: NV-2026-00001"
                className={`w-full px-4 py-3 text-xs sm:text-sm font-mono tracking-wide rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                    : 'bg-[#0A0E17] border-slate-700/80 text-white placeholder-slate-500 focus:border-orange-500'
                }`}
              />
              {inputNumber && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded cursor-pointer"
                  title="Limpar campo"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isValidating || !inputNumber.trim()}
              className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] active:scale-[0.98] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validando...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Validar</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Suggestion Chips for quick 1-click test of real certificates */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 font-semibold mr-1">Sugestões para testar:</span>
          {sampleSuggestions.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setInputNumber(item.label);
                executeValidation(item.label);
              }}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all border cursor-pointer ${
                inputNumber === item.label
                  ? 'bg-orange-500 text-white border-orange-500'
                  : theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:text-orange-400'
              }`}
              title={item.name}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setInputNumber('NV-9999-INEXISTENTE');
              executeValidation('NV-9999-INEXISTENTE');
            }}
            className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-200 text-[10px] underline underline-offset-2 cursor-pointer"
          >
            Testar número inexistente
          </button>
        </div>
      </div>

      {/* 3. Informational Cards Grid (matching screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Card 1: Pelo QR Code */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            theme === 'light'
              ? 'bg-white border-slate-200'
              : 'bg-[#111827]/80 border-white/[0.08]'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shrink-0">
              <QrCode className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3
                className={`text-sm sm:text-base font-bold ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                Pelo QR Code
              </h3>
              <p
                className={`mt-1 text-xs sm:text-sm leading-relaxed ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Aponte a câmera do celular para o QR Code no canto do certificado em PDF. A validação abre
                automaticamente.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: O que é exibido */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            theme === 'light'
              ? 'bg-white border-slate-200'
              : 'bg-[#111827]/80 border-white/[0.08]'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3
                className={`text-sm sm:text-base font-bold ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                O que é exibido
              </h3>
              <p
                className={`mt-1 text-xs sm:text-sm leading-relaxed ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Situação (vigente, vencido ou pendente), empresa, CNPJ, norma, escopo, data de emissão e
                validade.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. VALIDATION RESULT AREA */}
      {hasValidated && (
        <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {foundCert ? (
            /* FOUND CERTIFICATE RESULT CARD */
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden text-left ${
                foundCert.status === 'Vigente'
                  ? theme === 'light'
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : 'bg-gradient-to-b from-[#0D1F17] via-[#0B1512] to-[#0A0E17] border-emerald-500/50'
                  : foundCert.status === 'Suspenso' || foundCert.status === 'Cancelado'
                  ? theme === 'light'
                    ? 'bg-rose-50 border-rose-300'
                    : 'bg-gradient-to-b from-[#251014] to-[#0A0E17] border-rose-500/50'
                  : theme === 'light'
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-gradient-to-b from-[#221808] to-[#0A0E17] border-amber-500/50'
              }`}
            >
              {/* Header Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      foundCert.status === 'Vigente'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : foundCert.status === 'Suspenso'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {foundCert.status === 'Vigente' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          foundCert.status === 'Vigente'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : foundCert.status === 'Suspenso'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {foundCert.status === 'Vigente'
                          ? '✓ Certificado Autêntico & Vigente'
                          : foundCert.status === 'Suspenso'
                          ? '⚠ Certificado Suspenso'
                          : `Status: ${foundCert.status}`}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {foundCert.certificateType.includes('Acreditado') ? 'Acreditado IAF/CGCRE' : 'Conformidade Interna'}
                      </span>
                    </div>

                    <h3
                      className={`text-lg sm:text-xl font-black mt-1 ${
                        theme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {foundCert.recipientName}
                    </h3>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <div className="text-[11px] text-slate-400 font-mono">Protocolo de Validação</div>
                  <div className="font-mono font-bold text-orange-400">{validationProtocol}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{validationTimestamp}</div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Número do Certificado
                    </span>
                    <span className="font-mono text-sm font-bold text-orange-400">
                      {foundCert.certificateNumber}
                    </span>
                    <span className="ml-2 text-[10px] font-mono text-slate-400">
                      ({foundCert.revisionNumber || 'Rev. 00'})
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      CNPJ / Identificação Fiscal
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-200">
                      {foundCert.cnpjOrCpf}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Norma Certificada
                    </span>
                    <span className="text-sm font-bold text-white font-mono">
                      {foundCert.norm}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Endereço da Unidade
                    </span>
                    <span className="text-xs text-slate-300">
                      {foundCert.clientAddress}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Data de Emissão
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-200">
                        {foundCert.issueDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Validade Jurídica
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {foundCert.expiryDate}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Órgão Acreditador
                    </span>
                    <span className="text-xs text-slate-300">
                      {foundCert.accreditationBody}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Auditor Líder & Responsável Técnico
                    </span>
                    <div className="text-xs text-slate-200">{foundCert.leadAuditor}</div>
                    <div className="text-[11px] text-slate-400">{foundCert.technicalManagerSignature}</div>
                  </div>
                </div>
              </div>

              {/* Scope Box */}
              <div
                className={`p-3.5 rounded-xl border text-xs ${
                  theme === 'light'
                    ? 'bg-white/80 border-slate-200'
                    : 'bg-[#0A0E17]/80 border-white/[0.08]'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Escopo Homologado de Certificação
                </span>
                <p className="text-slate-200 leading-relaxed font-sans">{foundCert.scope}</p>
              </div>

              {/* Cryptographic SHA-256 Seal Box */}
              <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="text-[10px] text-slate-400 font-mono">Assinatura SHA-256:</span>
                  <span className="font-mono text-[11px] text-slate-300 truncate max-w-xs sm:max-w-md">
                    {foundCert.sha256Hash}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyHash(foundCert.sha256Hash)}
                  className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-orange-400 hover:text-orange-300 cursor-pointer self-start sm:self-auto"
                >
                  {copiedHash ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar Chave</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCertForModal(foundCert)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Visualizar Certificado Oficial
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    Imprimir Comprovante
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  Consultar outro certificado
                </button>
              </div>
            </div>
          ) : (
            /* CERTIFICADO NÃO ENCONTRADO (Matching prompt requirement) */
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-lg text-left ${
                theme === 'light'
                  ? 'bg-rose-50/80 border-rose-200 text-slate-900'
                  : 'bg-gradient-to-b from-slate-900/90 to-[#0A0E17] border-rose-500/30 text-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <XCircle className="w-7 h-7" />
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Registro Não Localizado
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold">
                    Certificado não encontrado
                  </h3>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    O número de certificado <strong className="text-orange-400 font-mono">"{inputNumber}"</strong> não consta
                    na base nacional da Nexus Veritas Certification. Verifique se o código foi digitado corretamente no formato{' '}
                    <span className="font-mono font-semibold text-white">NV-2026-XXXXX</span> ou escaneie o QR Code impresso no
                    documento físico/PDF.
                  </p>

                  <div className="pt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInputNumber('NV-2026-00001');
                        executeValidation('NV-2026-00001');
                      }}
                      className="px-3.5 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                    >
                      Testar com certificado real: NV-2026-00001
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Limpar busca
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. MODAL: FULL OFFICIAL CERTIFICATE VIEWER FOR PDF/PRINT */}
      {selectedCertForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0B1120] text-slate-100 border border-amber-500/40 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            {/* Modal Top Bar */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Visualização Oficial do Certificado de Conformidade
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCertForModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Certificate Decorative Body */}
            <div className="p-8 overflow-y-auto space-y-6 bg-gradient-to-b from-[#0F172A] to-[#0A0E17] border-4 border-double border-amber-600/30 m-4 rounded-2xl text-center relative">
              <div className="absolute top-4 left-4 text-[9px] font-mono text-slate-500">
                REGISTRO: {selectedCertForModal.certificateNumber}
              </div>
              <div className="absolute top-4 right-4 text-[9px] font-mono text-emerald-400 font-bold border border-emerald-500/30 px-2 py-0.5 rounded">
                SITUAÇÃO: {selectedCertForModal.status.toUpperCase()}
              </div>

              {/* Header Crest */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 flex items-center justify-center mb-2 shadow-lg shadow-orange-500/20">
                  <ShieldCheck className="w-9 h-9 text-amber-400" />
                </div>
                <h2 className="text-xl font-black tracking-widest text-white uppercase font-brand">
                  NEXUS VERITAS CERTIFICATION
                </h2>
                <span className="text-[10px] tracking-[0.25em] text-orange-400 uppercase font-bold">
                  SISTEMA INTERNACIONAL DE ACREDITAÇÃO DE CONFORMIDADE
                </span>
              </div>

              <div className="py-2">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                  Certifica formalmente que a organização:
                </span>
                <h1 className="text-2xl font-black text-white mt-1">
                  {selectedCertForModal.recipientName}
                </h1>
                <p className="text-xs font-mono text-slate-300 mt-0.5">
                  CNPJ: {selectedCertForModal.cnpjOrCpf} • {selectedCertForModal.clientAddress}
                </p>
              </div>

              <div className="max-w-xl mx-auto p-4 rounded-xl bg-black/40 border border-slate-800 text-xs">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
                  Atende integralmente aos requisitos da Norma:
                </span>
                <div className="text-base font-extrabold text-white font-mono">
                  {selectedCertForModal.norm}
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed italic">
                  "{selectedCertForModal.scope}"
                </p>
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto text-xs py-2">
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Emissão</span>
                  <strong className="text-slate-200 font-mono">{selectedCertForModal.issueDate}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Manutenção</span>
                  <strong className="text-slate-200 font-mono">{selectedCertForModal.maintenanceAuditDate || 'Anual'}</strong>
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/40">
                  <span className="text-[9px] text-emerald-400 uppercase block font-semibold">Validade</span>
                  <strong className="text-emerald-300 font-mono">{selectedCertForModal.expiryDate}</strong>
                </div>
              </div>

              {/* Signatures & Accreditation */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800 text-xs max-w-md mx-auto">
                <div>
                  <div className="font-mono text-xs font-semibold text-slate-200 border-b border-slate-700 pb-1">
                    {selectedCertForModal.leadAuditor}
                  </div>
                  <span className="text-[10px] text-slate-500">Auditor Líder Registrado</span>
                </div>
                <div>
                  <div className="font-mono text-xs font-semibold text-slate-200 border-b border-slate-700 pb-1">
                    {selectedCertForModal.technicalManager}
                  </div>
                  <span className="text-[10px] text-slate-500">Diretoria Técnica Certificadora</span>
                </div>
              </div>

              {/* Hash and validation token */}
              <div className="text-[9px] font-mono text-slate-500 pt-2">
                Assinatura Digital SHA-256: {selectedCertForModal.sha256Hash}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
