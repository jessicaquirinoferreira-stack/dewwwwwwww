import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Award,
  Users2,
  History,
  Lock,
  Eye,
  Search,
  Check,
  X,
  FileSpreadsheet,
  Download,
  Printer,
  Plus,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StatCard } from '../common/StatCard';
import {
  Audit,
  Certificate,
  CustomDocument,
  WorkflowDocumentStatus,
  CertificateStatus,
  Role
} from '../../types';

type TechnicalTab = 'certificados' | 'relatorios' | 'documentos' | 'usuarios' | 'log-auditoria';

interface TechnicalApprovalsViewProps {
  onNavigateToTab?: (tab: string) => void;
}

export const TechnicalApprovalsView: React.FC<TechnicalApprovalsViewProps> = ({ onNavigateToTab }) => {
  const { theme } = useTheme();
  const { user, allUsers, setUserRole } = useAuth();
  const {
    audits,
    submitAuditTechnicalApproval,
    certificates,
    updateCertificateLifecycle,
    documents,
    addDocument,
    updateDocument,
    auditLogs,
    addAuditLog,
    courses,
    enrollInCourse
  } = useData();

  const [activeTab, setActiveTab] = useState<TechnicalTab>('certificados');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForEval, setSelectedItemForEval] = useState<{ id: string; title: string; type: string; parecer: string } | null>(null);
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<{ id: string; title: string; subtitle: string; status: string; parecer: string } | null>(null);
  const [evaluationComment, setEvaluationComment] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleEvaluationAction = (decision: 'Solicitar correção' | 'Rejeitar' | 'Aprovar') => {
    if (!selectedItemForEval) return;
    
    addAuditLog({
      userEmail: user?.email || 'admin@nexusveritas.com',
      userName: user?.name || 'Corpo Técnico',
      action: `Avaliação Técnica: ${decision}`,
      module: 'Painel Administrativo',
      targetId: selectedItemForEval.id,
      targetName: selectedItemForEval.title,
      details: `Parecer: ${evaluationComment || decision} | Decisão: ${decision}`
    });

    triggerToast(`Item "${selectedItemForEval.title}" avaliado como: ${decision}.`);
    setSelectedItemForEval(null);
    setEvaluationComment('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-950/90 text-emerald-200 border border-emerald-500/40 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header matching screenshot 1 & 2 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-white tracking-tight">Painel administrativo</h1>
        <p className="text-xs text-slate-400">
          Aprovações, controle de usuários e rastreabilidade (LGPD).
        </p>
      </div>

      {/* Banner matching screenshot 1 & 2 */}
      <div className="p-4 rounded-2xl bg-amber-950/15 border border-amber-900/30 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <ShieldCheck className="w-4 h-4" />
          Corpo técnico — fluxo de aprovação
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Todo certificado, relatório e documento precisa de avaliação antes do download ser liberado. Cada decisão fica registrada no log de auditoria (rastreabilidade LGPD).
        </p>
      </div>

      {/* Tabs matching screenshots: Certificados, Relatórios, Documentos, Usuários, Log de auditoria */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('certificados')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'certificados'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          Certificados
        </button>
        <button
          onClick={() => setActiveTab('relatorios')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'relatorios'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          Relatórios
        </button>
        <button
          onClick={() => setActiveTab('documentos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'documentos'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          Documentos
        </button>
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'usuarios'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          Usuários
        </button>
        <button
          onClick={() => setActiveTab('log-auditoria')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'log-auditoria'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          Log de auditoria
        </button>
      </div>

      {/* TAB 1: CERTIFICADOS (Matching card design from screenshots 1 & 2) */}
      {activeTab === 'certificados' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {/* Sample items exactly as in screenshots */}
            {[
              {
                id: 'cert-1',
                title: 'NV-2026-72480',
                subtitle: 'Tecnaut Indústria e Comércio de Metais • 1ª parte - Auditoria de Fornecedor',
                status: 'Em correção',
                parecer: 'solicito correção no item 8.3',
                statusColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              },
              {
                id: 'cert-2',
                title: 'NV-2026-69108',
                subtitle: 'RDX INDUSTRIA • Interna — ISO 9001 (Gestão da Qualidade...)',
                status: 'Aprovado',
                parecer: '.',
                statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              },
              {
                id: 'cert-3',
                title: 'NV-2026-56161',
                subtitle: 'Usi - Seven usinagem • 1ª parte — Auditoria de Fornecedor',
                status: 'Pendente',
                parecer: '.',
                statusColor: 'bg-slate-800 text-slate-300 border-slate-700'
              },
              {
                id: 'cert-4',
                title: 'Auditoria de Fornecedor',
                subtitle: 'Tecnaut Indústria e Comércio de Metais • 1ª parte — Auditoria...',
                status: 'Aprovado',
                parecer: '.',
                statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              },
              {
                id: 'cert-5',
                title: 'AD. Metalúrgica',
                subtitle: 'Tecnaut Indústria e Comércio de Metais • Interna — ISO 9...',
                status: 'Em correção',
                parecer: 'NÃO APROVADO',
                statusColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }
            ].map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{item.subtitle}</p>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono text-slate-300">
                  Parecer: {item.parecer}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setSelectedPreviewItem(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-orange-400" />
                    Pré-visualizar
                  </button>
                  <button
                    onClick={() => setSelectedItemForEval({ id: item.id, title: item.title, type: 'Certificado / Auditoria', parecer: item.parecer })}
                    className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer"
                  >
                    Avaliar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RELATÓRIOS */}
      {activeTab === 'relatorios' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Relatórios Executivos de Auditoria & Pareceres Técnicos
              </h3>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-orange-400" />
                Imprimir
              </button>
            </div>

            <div className="space-y-3">
              {audits.map((a) => (
                <div key={a.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="font-mono text-orange-400">{a.code}</span>
                      <span>{a.clientName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Norma: {a.norm} • Auditor: {a.leadAuditor} • Conformidade: {a.conformityScore}%
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItemForEval({ id: a.id, title: a.clientName, type: 'Relatório', parecer: a.scope })}
                    className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg text-xs font-bold border border-orange-500/40 cursor-pointer"
                  >
                    Avaliar Relatório
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENTOS */}
      {activeTab === 'documentos' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Controle Documental do SGQ
              </h3>
            </div>

            <div className="space-y-3">
              {documents.map((d) => (
                <div key={d.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white">{d.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {d.code} • Rev {d.version} • Status: {d.status}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItemForEval({ id: d.id, title: d.title, type: 'Documento SGQ', parecer: d.description })}
                    className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg text-xs font-bold border border-orange-500/40 cursor-pointer"
                  >
                    Avaliar Documento
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: USUÁRIOS */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Gestão de Usuários & Permissões (RBAC)
            </h3>
            <div className="space-y-2">
              {allUsers.map((u) => (
                <div key={u.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{u.email} • Papel: {u.role}</div>
                  </div>
                  <select
                    value={u.role}
                    onChange={(e) => {
                      setUserRole(u.id, e.target.value as Role);
                      triggerToast(`Papel de ${u.name} atualizado.`);
                    }}
                    className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                  >
                    <option value="admin">Admin</option>
                    <option value="auditor">Auditor</option>
                    <option value="empresa">Empresa</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LOG DE AUDITORIA */}
      {activeTab === 'log-auditoria' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Trilha de Auditoria Imutável (LGPD)
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold text-orange-400">{log.action}</span>
                    <span className="font-mono text-[10px]">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                  <div className="text-[10px] font-mono text-slate-500">
                    Usuário: {log.userName} ({log.userEmail})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: AVALIAÇÃO TÉCNICA (Matching Screenshot 4 exactly)
      ========================================================================= */}
      {selectedItemForEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Avaliação técnica</h3>
              <button
                onClick={() => setSelectedItemForEval(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider">
                  {selectedItemForEval.type}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{selectedItemForEval.title}</h4>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Parecer técnico / motivo
                </label>
                <textarea
                  rows={4}
                  value={evaluationComment}
                  onChange={(e) => setEvaluationComment(e.target.value)}
                  placeholder="..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* 3 exact buttons as shown in Screenshot 4 */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleEvaluationAction('Solicitar correção')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Solicitar correção
                </button>
                <button
                  type="button"
                  onClick={() => handleEvaluationAction('Rejeitar')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-600/20"
                >
                  <X className="w-3.5 h-3.5" />
                  Rejeitar
                </button>
                <button
                  type="button"
                  onClick={() => handleEvaluationAction('Aprovar')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  Aprovar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRÉ-VISUALIZAÇÃO OFICIAL DO CERTIFICADO / DOCUMENTO */}
      {selectedPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Pré-visualização Oficial de Auditoria</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Nexus Veritas Certification • Registro Criptografado SHA-256</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPreviewItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-orange-400 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30">
                    {selectedPreviewItem.title}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {selectedPreviewItem.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedPreviewItem.subtitle}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Norma Técnica ISO 9001:2015 / IQF Fornecedores • Validação Internacional IAF MLA.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-300">
                  <span className="text-slate-500 block text-[10px] mb-0.5">Parecer Técnico Registrado:</span>
                  {selectedPreviewItem.parecer}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Assinatura Digital: Bruno Alvarenga (IRCA)</span>
                  <span className="text-emerald-400">SHA-256: 9F8E...3A21</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-orange-400" />
                  Imprimir / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPreviewItem(null)}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Fechar Pré-visualização
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
