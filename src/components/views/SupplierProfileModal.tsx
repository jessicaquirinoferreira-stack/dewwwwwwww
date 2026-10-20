import React, { useState } from 'react';
import {
  Building2,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Upload,
  Trash2,
  Save,
  Award,
  BarChart3,
  ListChecks,
  History,
  Settings,
  FileCheck,
  Calendar,
  User,
  Phone,
  Mail,
  Globe,
  MapPin,
  Check,
  Plus,
  Edit3
} from 'lucide-react';
import { Supplier, SupplierStatus, CriticalityLevel, SupplierDocumentGED, Audit, AuditChecklistItem, AuditFindingSeverity } from '../../types';
import { useData } from '../../context/DataContext';
import { STANDARD_NORMS } from '../../data/initialData';

interface SupplierProfileModalProps {
  supplierId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SupplierProfileModal: React.FC<SupplierProfileModalProps> = ({
  supplierId,
  isOpen,
  onClose
}) => {
  const {
    suppliers,
    updateSupplier,
    changeSupplierStatus,
    addSupplierDocumentGED,
    deleteSupplierDocumentGED,
    recalculateSupplierIQF,
    updateSupplierRisk,
    audits,
    actionPlans,
    addAudit,
    updateAudit
  } = useData();

  const supplier = suppliers.find((s) => s.id === supplierId);

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'registration'
    | 'ged'
    | 'homologation'
    | 'audits'
    | 'performance'
    | 'ncs'
    | 'management'
    | 'history'
  >('overview');

  // Edit form state for Cadastro
  const [formData, setFormData] = useState({
    tradeName: supplier?.tradeName || '',
    corporateName: supplier?.corporateName || '',
    cnpj: supplier?.cnpj || '',
    contactName: supplier?.contactName || '',
    contactEmail: supplier?.contactEmail || '',
    phone: supplier?.phone || '',
    website: supplier?.website || '',
    category: supplier?.category || '',
    scopeOfSupply: supplier?.scopeOfSupply || '',
    criticality: supplier?.criticality || 'Média',
    primaryNorm: supplier?.primaryNorm || 'ISO 9001',
    city: supplier?.city || '',
    state: supplier?.state || '',
    country: supplier?.country || 'Brasil',
  });

  // Sync formData when supplier changes
  React.useEffect(() => {
    if (supplier) {
      setFormData({
        tradeName: supplier.tradeName || '',
        corporateName: supplier.corporateName || '',
        cnpj: supplier.cnpj || '',
        contactName: supplier.contactName || '',
        contactEmail: supplier.contactEmail || '',
        phone: supplier.phone || '',
        website: supplier.website || '',
        category: supplier.category || '',
        scopeOfSupply: supplier.scopeOfSupply || '',
        criticality: supplier.criticality || 'Média',
        primaryNorm: supplier.primaryNorm || 'ISO 9001',
        city: supplier.city || '',
        state: supplier.state || '',
        country: supplier.country || 'Brasil',
      });
    }
  }, [supplier]);

  // Status change state
  const [newStatus, setNewStatus] = useState<SupplierStatus>(supplier?.status || 'Em Avaliação');
  const [statusJustification, setStatusJustification] = useState('');

  // GED upload state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<SupplierDocumentGED['category']>('Certificado ISO');
  const [docValidity, setDocValidity] = useState('2027-12-31');

  // IQF calculator state
  const [iqfQuality, setIqfQuality] = useState(supplier?.iqfBreakdown?.qualityScore || 90);
  const [iqfDelivery, setIqfDelivery] = useState(supplier?.iqfBreakdown?.deliveryScore || 85);
  const [iqfCompliance, setIqfCompliance] = useState(supplier?.iqfBreakdown?.complianceScore || 88);
  const [iqfAudit, setIqfAudit] = useState(supplier?.iqfBreakdown?.auditScore || 92);

  // Selected audit for editing
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  if (!isOpen || !supplier) return null;

  const supplierAudits = audits.filter(
    (a) =>
      a.supplierOrClientId === supplier.id ||
      a.clientName.toLowerCase().includes(supplier.tradeName.toLowerCase())
  );

  const activeEditAudit = supplierAudits.find(a => a.id === selectedAuditId) || supplierAudits[0];

  const supplierActionPlans = actionPlans.filter(
    (ap) =>
      ap.supplierId === supplier.id ||
      ap.supplierName?.toLowerCase().includes(supplier.tradeName.toLowerCase()) ||
      ap.responsible?.toLowerCase().includes(supplier.tradeName.toLowerCase())
  );

  const handleSaveRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupplier(supplier.id, formData);
    alert('Dados cadastrais atualizados com sucesso!');
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusJustification.trim()) {
      alert('Informe a justificativa para a alteração de status.');
      return;
    }
    const res = changeSupplierStatus(supplier.id, newStatus, statusJustification, 'Administrador');
    if (res.success) {
      alert('Status alterado com sucesso!');
      setStatusJustification('');
    } else {
      alert(res.message || 'Erro ao alterar status.');
    }
  };

  const handleAddDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;
    addSupplierDocumentGED(supplier.id, {
      title: docTitle,
      category: docCategory,
      documentNumber: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: '2026-01-01',
      expiryDate: docValidity,
      fileUrl: '#',
      fileSize: '2.4 MB',
      status: 'Válido'
    });
    setDocTitle('');
    setIsDocModalOpen(false);
  };

  const handleUpdateIQF = () => {
    recalculateSupplierIQF(supplier.id, iqfQuality, iqfDelivery, iqfCompliance, iqfAudit);
    alert('Índice de Qualificação de Fornecedores (IQF) recalculado com sucesso!');
  };

  const handleCreateAuditForSupplier = () => {
    addAudit({
      code: `AUD-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierOrClientId: supplier.id,
      clientName: supplier.tradeName,
      clientAddress: `${supplier.city}, ${supplier.state}`,
      auditType: '2ª Parte (Fornecedor)',
      norm: supplier.primaryNorm || 'ISO 9001',
      checklistRevision: 'Rev. 01',
      checklistNormEdition: `${supplier.primaryNorm || 'ISO 9001'}:2015`,
      scope: 'Homologação e Qualificação de Fornecedor',
      leadAuditor: 'Dra. Carolina Mendes (IRCA-604218)',
      auditTeam: 'Equipe SGF Nexus Veritas',
      technicalManager: 'Eng. Roberto Vasconcelos',
      startDate: '2026-03-01',
      endDate: '2026-03-03',
      validityDate: '2027-03-03',
      status: 'Em Andamento',
      conformityScore: 85,
      nonConformitiesCount: 1,
      checklistItems: [
        {
          id: `chk-${Date.now()}-1`,
          code: 'Cláusula 4.1',
          processOrArea: 'PLANEJAMENTO ESTRATÉGICO',
          requirement: 'Compreensão da organização e de seu contexto',
          guidance: 'Verificar análise SWOT e partes interessadas.',
          expectedEvidence: 'Matriz SWOT atualizada.',
          conformity: 'Conforme'
        },
        {
          id: `chk-${Date.now()}-2`,
          code: 'Cláusula 5.1',
          processOrArea: 'LIDERANÇA',
          requirement: 'Liderança e comprometimento da alta gestão',
          guidance: 'Avaliar política da qualidade e reuniões de análise crítica.',
          expectedEvidence: 'Atas de análise crítica assinadas.',
          conformity: 'Conforme'
        }
      ]
    });
    alert('Nova auditoria criada com sucesso!');
  };

  const getStatusBadge = (st: SupplierStatus) => {
    switch (st) {
      case 'Homologado':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Qualificado':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Em Avaliação':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Bloqueado':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl w-full max-w-6xl h-[92vh] shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">{supplier.tradeName}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(supplier.status)}`}>
                  {supplier.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">CNPJ: {supplier.cnpj} | Categoria: {supplier.category} | Norma: {supplier.primaryNorm}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-6 border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Building2 },
            { id: 'registration', label: 'Cadastro', icon: User },
            { id: 'ged', label: 'GED', icon: FileText },
            { id: 'homologation', label: 'Homologação', icon: ShieldCheck },
            { id: 'audits', label: 'Auditorias', icon: Award },
            { id: 'performance', label: 'Desempenho (IQF)', icon: BarChart3 },
            { id: 'ncs', label: 'NC & Planos', icon: ListChecks },
            { id: 'management', label: 'Controles Gerenciais', icon: Settings },
            { id: 'history', label: 'Histórico', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-orange-500 text-orange-400 bg-orange-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/50">

          {/* 1. VISÃO GERAL */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Status Atual</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(supplier.status)}`}>
                    {supplier.status}
                  </span>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Índice IQF</span>
                  <span className="text-2xl font-black font-mono text-white">{supplier.iqfScore || 90} <span className="text-xs text-slate-400">/ 100</span></span>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Criticidade</span>
                  <span className="text-sm font-bold text-amber-400">{supplier.criticality}</span>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Norma Principal</span>
                  <span className="text-sm font-bold text-orange-400">{supplier.primaryNorm}</span>
                </div>
              </div>

              {/* Status Change Box */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Alteração de Ciclo de Vida & Status do Fornecedor</h3>
                <form onSubmit={handleStatusSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Novo Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as SupplierStatus)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="Homologado">Homologado</option>
                      <option value="Qualificado">Qualificado</option>
                      <option value="Em Avaliação">Em Avaliação</option>
                      <option value="Bloqueado">Bloqueado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Justificativa Técnica obrigatória</label>
                    <input
                      type="text"
                      required
                      value={statusJustification}
                      onChange={(e) => setStatusJustification(e.target.value)}
                      placeholder="Ex: Auditoria de 2ª parte aprovada com sucesso"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Atualizar Status
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 2. CADASTRO */}
          {activeTab === 'registration' && (
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Dados Cadastrais & Escopo de Fornecimento</h3>
                <p className="text-xs text-slate-400">Edite as informações da empresa, contatos e requisitos normativos associados.</p>
              </div>

              <form onSubmit={handleSaveRegistration} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Razão Social</label>
                  <input
                    type="text"
                    value={formData.corporateName}
                    onChange={(e) => setFormData({ ...formData, corporateName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Contato</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Norma Principal</label>
                  <select
                    value={formData.primaryNorm}
                    onChange={(e) => setFormData({ ...formData, primaryNorm: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    {STANDARD_NORMS.map(n => (
                      <option key={n.code} value={n.code}>{n.code} - {n.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Criticidade</label>
                  <select
                    value={formData.criticality}
                    onChange={(e) => setFormData({ ...formData, criticality: e.target.value as CriticalityLevel })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Escopo de Fornecimento</label>
                  <textarea
                    rows={3}
                    value={formData.scopeOfSupply}
                    onChange={(e) => setFormData({ ...formData, scopeOfSupply: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Salvar Alterações Cadastrais
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. GED */}
          {activeTab === 'ged' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white">Gestão Eletrônica de Documentos (GED)</h3>
                  <p className="text-xs text-slate-400">Armazenamento, controle de validade e anexos do fornecedor.</p>
                </div>
                <button
                  onClick={() => setIsDocModalOpen(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  <span>Enviar Documento</span>
                </button>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Documento</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Validade</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {(!supplier.documentsGED || supplier.documentsGED.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          Nenhum documento cadastrado no GED deste fornecedor.
                        </td>
                      </tr>
                    ) : (
                      supplier.documentsGED.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-900/50">
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-400" />
                            <span>{doc.title}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">{doc.category}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">{doc.expiryDate}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {doc.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => deleteSupplierDocumentGED(supplier.id, doc.id)}
                              className="text-slate-400 hover:text-rose-400 p-1 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Upload Modal inside GED */}
              {isDocModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <div className="bg-slate-900 rounded-2xl w-full max-w-md p-6 border border-slate-700 shadow-2xl">
                    <h4 className="text-sm font-bold text-white mb-2">Enviar Novo Documento</h4>
                    <form onSubmit={handleAddDocSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Documento *</label>
                        <input
                          type="text"
                          required
                          value={docTitle}
                          onChange={(e) => setDocTitle(e.target.value)}
                          placeholder="Ex: Certificado ISO 9001:2015"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                        <select
                          value={docCategory}
                          onChange={(e) => setDocCategory(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                        >
                          <option value="Certificado ISO">Certificado ISO</option>
                          <option value="Licença Ambiental">Licença Ambiental</option>
                          <option value="Contrato Social">Contrato Social</option>
                          <option value="Alvará de Funcionamento">Alvará de Funcionamento</option>
                          <option value="Certidão Negativa de Débitos">Certidão Negativa de Débitos</option>
                          <option value="PPRA / PCMSO">PPRA / PCMSO</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Data de Validade</label>
                        <input
                          type="date"
                          value={docValidity}
                          onChange={(e) => setDocValidity(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsDocModalOpen(false)}
                          className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold"
                        >
                          Salvar Arquivo
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. HOMOLOGAÇÃO & QUALIFICAÇÃO */}
          {activeTab === 'homologation' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Critérios de Homologação e Qualificação Técnica</h3>
                    <p className="text-xs text-slate-400">Verificação de requisitos normativos, auditoria de 2ª parte e liberação para fornecimento.</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(supplier.status)}`}>
                    Status: {supplier.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-2">
                      <CheckCircle2 className="w-4 h-4" /> Documentação Legal & CNPJ
                    </div>
                    <p className="text-xs text-slate-400">Certidões negativas, contrato social e regularidade fiscal validados.</p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-2">
                      <CheckCircle2 className="w-4 h-4" /> Capacidade Técnica & ISO
                    </div>
                    <p className="text-xs text-slate-400">Escopo de fornecimento validado pela norma {supplier.primaryNorm}.</p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-2">
                      <ShieldCheck className="w-4 h-4" /> Auditoria de 2ª Parte
                    </div>
                    <p className="text-xs text-slate-400">{supplierAudits.length > 0 ? 'Auditoria realizada com sucesso.' : 'Pendente agendamento de auditoria.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. AUDITORIAS (100% EDITABLE FIELDS & NORM REVISIONS AS REQUESTED) */}
          {activeTab === 'audits' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Auditorias de 2ª Parte & Revisão Normativa</h3>
                  <p className="text-xs text-slate-400">Todos os campos, normas, revisões de checklist e requisitos são totalmente editáveis.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCreateAuditForSupplier}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Criar Nova Auditoria
                  </button>
                </div>
              </div>

              {supplierAudits.length === 0 ? (
                <div className="bg-slate-950 p-12 rounded-3xl border border-slate-800 text-center space-y-4">
                  <p className="text-slate-400 text-xs">Nenhuma auditoria cadastrada para este fornecedor.</p>
                  <button
                    onClick={handleCreateAuditForSupplier}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold"
                  >
                    Iniciar Auditoria de 2ª Parte
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Select Audit Tabs if multiple */}
                  {supplierAudits.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {supplierAudits.map(aud => (
                        <button
                          key={aud.id}
                          onClick={() => setSelectedAuditId(aud.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            (activeEditAudit?.id === aud.id)
                              ? 'bg-orange-500/10 text-orange-400 border-orange-500/40'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {aud.code} ({aud.norm})
                        </button>
                      ))}
                    </div>
                  )}

                  {activeEditAudit && (
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
                      {/* Top Normative Header Editor */}
                      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-mono text-xs font-bold border border-orange-500/40">
                              {activeEditAudit.norm}
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-mono text-xs font-bold border border-blue-500/40">
                              {activeEditAudit.checklistRevision || 'Rev. 01'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const revNum = prompt('Informe a nova revisão do checklist (ex: Rev. 03):', activeEditAudit.checklistRevision || 'Rev. 02');
                                if (revNum) {
                                  updateAudit(activeEditAudit.id, { checklistRevision: revNum });
                                  alert('Revisão atualizada com sucesso!');
                                }
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-orange-400" /> Revisar Versão
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Norma / Referência</label>
                            <input
                              type="text"
                              value={activeEditAudit.norm}
                              onChange={(e) => updateAudit(activeEditAudit.id, { norm: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Edição Oficial da Norma</label>
                            <input
                              type="text"
                              value={activeEditAudit.checklistNormEdition || ''}
                              onChange={(e) => updateAudit(activeEditAudit.id, { checklistNormEdition: e.target.value })}
                              placeholder="Ex: ISO 9001:2015"
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Código da Auditoria</label>
                            <input
                              type="text"
                              value={activeEditAudit.code}
                              onChange={(e) => updateAudit(activeEditAudit.id, { code: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status da Auditoria</label>
                            <select
                              value={activeEditAudit.status}
                              onChange={(e) => updateAudit(activeEditAudit.id, { status: e.target.value as any })}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                            >
                              <option value="Planejada">Planejada</option>
                              <option value="Em Andamento">Em Andamento</option>
                              <option value="Relatório Emitido">Relatório Emitido</option>
                              <option value="Aprovada">Aprovada</option>
                              <option value="Concluída">Concluída</option>
                            </select>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 italic">
                          * Nota Metodológica: A edição oficial da norma e o checklist são totalmente editáveis para acompanhar revisões normativas (ABNT/ISO/IAF), mantendo histórico e rastreabilidade íntegros.
                        </p>
                      </div>

                      {/* Checklist Requirements Header & Add Button */}
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <h4 className="text-sm font-bold text-white">Checklist Normativo & Critérios Operacionais ({activeEditAudit.checklistItems?.length || 0} Requisitos)</h4>
                          <p className="text-xs text-slate-400">Edite cada cláusula, processo, evidência e classificação de constatação.</p>
                        </div>
                        <button
                          onClick={() => {
                            const newReq = prompt('Informe o título do novo requisito / cláusula (ex: Cláusula 6.1 - Ações para abordar riscos):');
                            if (newReq) {
                              const updatedChecklist = [
                                ...(activeEditAudit.checklistItems || []),
                                {
                                  id: `chk-${Date.now()}`,
                                  code: `Cláusula ${Math.floor(4 + Math.random() * 5)}.${Math.floor(1 + Math.random() * 5)}`,
                                  processOrArea: 'GESTÃO DA QUALIDADE',
                                  requirement: newReq,
                                  guidance: 'Critério inserido manualmente para revisão normativa.',
                                  expectedEvidence: 'Evidência objetiva a ser validada em campo.',
                                  conformity: 'Conforme' as AuditFindingSeverity
                                }
                              ];
                              updateAudit(activeEditAudit.id, { checklistItems: updatedChecklist });
                            }
                          }}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                        >
                          <Plus className="w-4 h-4" /> Inserir Requisito
                        </button>
                      </div>

                      {/* Checklist Items List */}
                      <div className="space-y-4">
                        {(!activeEditAudit.checklistItems || activeEditAudit.checklistItems.length === 0) ? (
                          <div className="p-8 text-center text-slate-500 text-xs bg-slate-900 rounded-2xl border border-slate-800">
                            Nenhum requisito cadastrado no checklist desta auditoria.
                          </div>
                        ) : (
                          activeEditAudit.checklistItems.map((item: AuditChecklistItem, idx: number) => (
                            <div key={item.id || idx} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Processo / Área</label>
                                  <input
                                    type="text"
                                    value={item.processOrArea || ''}
                                    onChange={(e) => {
                                      const updated = [...(activeEditAudit.checklistItems || [])];
                                      updated[idx] = { ...item, processOrArea: e.target.value };
                                      updateAudit(activeEditAudit.id, { checklistItems: updated });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white uppercase font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Cláusula / Código</label>
                                  <input
                                    type="text"
                                    value={item.code || ''}
                                    onChange={(e) => {
                                      const updated = [...(activeEditAudit.checklistItems || [])];
                                      updated[idx] = { ...item, code: e.target.value };
                                      updateAudit(activeEditAudit.id, { checklistItems: updated });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                                  />
                                </div>
                                <div className="flex items-end justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      const updated = (activeEditAudit.checklistItems || []).filter((_: AuditChecklistItem, i: number) => i !== idx);
                                      updateAudit(activeEditAudit.id, { checklistItems: updated });
                                    }}
                                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs transition-all flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Remover
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Requisito / Descrição da Cláusula</label>
                                <textarea
                                  rows={2}
                                  value={item.requirement || ''}
                                  onChange={(e) => {
                                    const updated = [...(activeEditAudit.checklistItems || [])];
                                    updated[idx] = { ...item, requirement: e.target.value };
                                    updateAudit(activeEditAudit.id, { checklistItems: updated });
                                  }}
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Evidência Objetiva Registrada / Amostra Analisada</label>
                                <input
                                  type="text"
                                  value={item.expectedEvidence || item.evidence || ''}
                                  onChange={(e) => {
                                    const updated = [...(activeEditAudit.checklistItems || [])];
                                    updated[idx] = { ...item, expectedEvidence: e.target.value };
                                    updateAudit(activeEditAudit.id, { checklistItems: updated });
                                  }}
                                  placeholder="Ex: Matriz SWOT e análise de partes interessadas atualizada no comitê anual."
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                                />
                              </div>

                              <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                                <span className="text-[11px] font-semibold text-slate-400">Classificação da Constatação:</span>
                                <div className="flex gap-1.5 flex-wrap">
                                  {(['Conforme', 'Oportunidade de Melhoria', 'NC Menor', 'NC Maior', 'Não Aplicável'] as AuditFindingSeverity[]).map((sev) => {
                                    const isSelected = item.conformity === sev;
                                    return (
                                      <button
                                        key={sev}
                                        onClick={() => {
                                          const updated = [...(activeEditAudit.checklistItems || [])];
                                          updated[idx] = { ...item, conformity: sev };
                                          updateAudit(activeEditAudit.id, { checklistItems: updated });
                                        }}
                                        className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                                          isSelected
                                            ? sev === 'Conforme'
                                              ? 'bg-emerald-500 text-white border-emerald-600 shadow'
                                              : sev === 'Oportunidade de Melhoria'
                                              ? 'bg-blue-500 text-white border-blue-600 shadow'
                                              : 'bg-orange-500 text-white border-orange-600 shadow'
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                                        }`}
                                      >
                                        {sev}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 6. AVALIAÇÃO DE DESEMPENHO (IQF BREAKDOWN) */}
          {activeTab === 'performance' && (
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Avaliação de Desempenho e Cálculo do IQF</h3>
                <p className="text-xs text-slate-400">Ajuste os pilares de avaliação para recalcular o Índice de Qualificação de Fornecedores.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Qualidade do Produto/Serviço (Peso 40%)</span>
                      <span className="text-orange-400 font-mono">{iqfQuality} pts</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={iqfQuality}
                      onChange={(e) => setIqfQuality(Number(e.target.value))}
                      className="w-full accent-orange-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Pontualidade de Entrega (Peso 25%)</span>
                      <span className="text-orange-400 font-mono">{iqfDelivery} pts</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={iqfDelivery}
                      onChange={(e) => setIqfDelivery(Number(e.target.value))}
                      className="w-full accent-orange-600"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Conformidade Regulatória & ESG (Peso 20%)</span>
                      <span className="text-orange-400 font-mono">{iqfCompliance} pts</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={iqfCompliance}
                      onChange={(e) => setIqfCompliance(Number(e.target.value))}
                      className="w-full accent-orange-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Documentação & Atendimento Técnico (Peso 15%)</span>
                      <span className="text-orange-400 font-mono">{iqfAudit} pts</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={iqfAudit}
                      onChange={(e) => setIqfAudit(Number(e.target.value))}
                      className="w-full accent-orange-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">IQF Resultante Calculado:</span>
                  <span className="text-xl font-black text-white ml-2 font-mono">
                    {Math.round(iqfQuality * 0.4 + iqfDelivery * 0.25 + iqfCompliance * 0.2 + iqfAudit * 0.15)} / 100
                  </span>
                </div>
                <button
                  onClick={handleUpdateIQF}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  Salvar e Recalcular IQF
                </button>
              </div>
            </div>
          )}

          {/* 7. NC E PLANOS DE AÇÃO */}
          {activeTab === 'ncs' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-white">Não Conformidades & Planos de Ação</h3>
                <p className="text-xs text-slate-400">Acompanhamento de tratativas de melhoria e correção para o fornecedor.</p>
              </div>

              <div className="space-y-3">
                {supplierActionPlans.length === 0 ? (
                  <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-slate-500">
                    Nenhum plano de ação registrado para este fornecedor.
                  </div>
                ) : (
                  supplierActionPlans.map((ap) => (
                    <div key={ap.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white">{ap.title}</span>
                        <p className="text-xs text-slate-400 mt-0.5">Prazo: {ap.deadline} | Responsável: {ap.responsible}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {ap.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 8. CONTROLES GERENCIAIS */}
          {activeTab === 'management' && (
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Controles Gerenciais & Matriz de Risco (ISO 31000)</h3>
                <p className="text-xs text-slate-400">Configuração de criticidade, anotações de auditoria e liberação gerencial.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Anotações Internas de Auditoria</h4>
                  <textarea
                    rows={4}
                    defaultValue={supplier.auditNotes || 'Nenhuma observação restrita cadastrada.'}
                    onBlur={(e) => updateSupplier(supplier.id, { auditNotes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <p className="text-[10px] text-slate-500">As alterações são salvas automaticamente ao clicar fora da caixa.</p>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Parâmetros de Risco da Cadeia</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Nível de Risco Operacional:</span>
                      <span className="font-bold text-emerald-400">Controlado</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Auditoria Externa Obrigatória:</span>
                      <span className="font-bold text-orange-400">Anual (2ª Parte)</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Compliance Anticorrupção:</span>
                      <span className="font-bold text-emerald-400">Verificado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. HISTÓRICO */}
          {activeTab === 'history' && (
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Histórico de Alterações de Status & Ciclo de Vida</h3>
                <p className="text-xs text-slate-400">Registro de todas as transições de homologação e pareceres de auditores.</p>
              </div>

              <div className="space-y-3 mt-4">
                {(!supplier.statusHistory || supplier.statusHistory.length === 0) ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    Nenhum registro de histórico adicional. Status inicial cadastrado em {supplier.createdAt}.
                  </div>
                ) : (
                  supplier.statusHistory.map((h) => (
                    <div key={h.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-start justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{h.previousStatus} ➔ {h.newStatus}</span>
                          <span className="text-[10px] text-slate-400">Por {h.decidedBy}</span>
                        </div>
                        <p className="text-slate-300 mt-1 italic">"{h.justification}"</p>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">{h.createdAt}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            Fechar Painel Técnico
          </button>
        </div>

      </div>
    </div>
  );
};
