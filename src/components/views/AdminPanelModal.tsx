import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Users2,
  Database,
  Save,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Download,
  X,
  Building2,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Check,
  Eye,
  EyeOff,
  Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Role, Partner, PartnershipType } from '../../types';
import { CORPORATE_LOGO_PRESETS } from '../../data/initialData';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { allUsers, setUserRole } = useAuth();
  const {
    landingContent,
    updateLandingContent,
    seedSampleData,
    clearAllData,
    suppliers,
    audits,
    certificates,
    partners,
    addPartner,
    updatePartner,
    deletePartner,
    resetPartnersToDefault,
  } = useData();

  const [activeTab, setActiveTab] = useState<'partners' | 'landing' | 'users' | 'database'>('partners');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Partner Form State
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [partnerEditingId, setPartnerEditingId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerTradeName, setPartnerTradeName] = useState('');
  const [partnerLogoUrl, setPartnerLogoUrl] = useState('');
  const [partnerCategory, setPartnerCategory] = useState('Energia & Petróleo');
  const [partnerNorm, setPartnerNorm] = useState('ISO 9001 · ISO 14001');
  const [partnerWebsiteUrl, setPartnerWebsiteUrl] = useState('');
  const [partnerType, setPartnerType] = useState<PartnershipType>('Cliente Homologado');
  const [partnerDescription, setPartnerDescription] = useState('');
  const [partnerOrder, setPartnerOrder] = useState(1);
  const [partnerIsActive, setPartnerIsActive] = useState(true);

  // Landing form state
  const [heroTitle, setHeroTitle] = useState(landingContent.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(landingContent.heroSubtitle);
  const [badgeText, setBadgeText] = useState(landingContent.badgeText);
  const [primaryCtaText, setPrimaryCtaText] = useState(landingContent.primaryCtaText);
  const [secondaryCtaText, setSecondaryCtaText] = useState(landingContent.secondaryCtaText);
  const [statsSuppliers, setStatsSuppliers] = useState(landingContent.statsSuppliers);
  const [statsAudits, setStatsAudits] = useState(landingContent.statsAudits);
  const [statsCertificates, setStatsCertificates] = useState(landingContent.statsCertificates);

  if (!isOpen) return null;

  // Helper to open edit partner mode
  const handleStartEditPartner = (p: Partner) => {
    setIsEditingPartner(true);
    setPartnerEditingId(p.id);
    setPartnerName(p.name);
    setPartnerTradeName(p.tradeName || '');
    setPartnerLogoUrl(p.logoUrl || '');
    setPartnerCategory(p.category);
    setPartnerNorm(p.norm);
    setPartnerWebsiteUrl(p.websiteUrl || '');
    setPartnerType(p.partnershipType);
    setPartnerDescription(p.description || '');
    setPartnerOrder(p.order || 1);
    setPartnerIsActive(p.isActive !== false);
  };

  const handleStartNewPartner = () => {
    setIsEditingPartner(true);
    setPartnerEditingId(null);
    setPartnerName('');
    setPartnerTradeName('');
    setPartnerLogoUrl(CORPORATE_LOGO_PRESETS[0].svg);
    setPartnerCategory('Energia & Petróleo');
    setPartnerNorm('ISO 9001 · ISO 14001');
    setPartnerWebsiteUrl('https://');
    setPartnerType('Cliente Homologado');
    setPartnerDescription('');
    setPartnerOrder(partners.length + 1);
    setPartnerIsActive(true);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('O arquivo selecionado deve ter menos de 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPartnerLogoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      alert('Por favor informe o nome da empresa.');
      return;
    }

    if (partnerEditingId) {
      await updatePartner(partnerEditingId, {
        name: partnerName.trim(),
        tradeName: partnerTradeName.trim(),
        logoUrl: partnerLogoUrl.trim(),
        category: partnerCategory.trim(),
        norm: partnerNorm.trim(),
        websiteUrl: partnerWebsiteUrl.trim(),
        partnershipType: partnerType,
        description: partnerDescription.trim(),
        order: Number(partnerOrder) || 1,
        isActive: partnerIsActive,
      });
      setFeedbackMsg(`Empresa "${partnerName}" atualizada com sucesso no banco de dados!`);
    } else {
      await addPartner({
        name: partnerName.trim(),
        tradeName: partnerTradeName.trim(),
        logoUrl: partnerLogoUrl.trim(),
        category: partnerCategory.trim(),
        norm: partnerNorm.trim(),
        websiteUrl: partnerWebsiteUrl.trim(),
        partnershipType: partnerType,
        description: partnerDescription.trim(),
        order: Number(partnerOrder) || 1,
        isActive: partnerIsActive,
      });
      setFeedbackMsg(`Nova empresa "${partnerName}" adicionada com sucesso no banco de dados!`);
    }

    setIsEditingPartner(false);
    setPartnerEditingId(null);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleDeletePartner = async (id: string, name: string) => {
    if (confirm(`Confirma a exclusão definitiva da empresa "${name}" do banco de dados?`)) {
      await deletePartner(id);
      setFeedbackMsg(`Empresa "${name}" removida do banco de dados.`);
      if (partnerEditingId === id) {
        setIsEditingPartner(false);
        setPartnerEditingId(null);
      }
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleResetDefaultPartners = async () => {
    if (confirm('Restaurar as 8 empresas corporativas padrão no banco de dados?')) {
      await resetPartnersToDefault();
      setFeedbackMsg('Empresas de referência restauradas no banco de dados!');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleSaveLanding = (e: React.FormEvent) => {
    e.preventDefault();
    updateLandingContent({
      heroTitle,
      heroSubtitle,
      badgeText,
      primaryCtaText,
      secondaryCtaText,
      statsSuppliers,
      statsAudits,
      statsCertificates,
    });
    setFeedbackMsg('Conteúdo da Landing Page atualizado instantaneamente!');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleExportJSON = () => {
    const dataToExport = {
      partners,
      suppliers,
      audits,
      certificates,
      landingContent,
      users: allUsers,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-veritas-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">
                Painel Master Admin · Nexus Veritas Certification
              </h3>
              <p className="text-xs text-slate-400">
                Gestão corporativa de empresas parceiras, conteúdo da landing e integridade do banco de dados.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Tabs */}
        <div className="bg-slate-950/50 border-b border-slate-800 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => {
              setActiveTab('partners');
              setIsEditingPartner(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'partners'
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Empresas Parceiras & Colaboradoras ({partners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'landing'
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Usuários ({allUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'database'
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Banco de Dados</span>
          </button>
        </div>

        {feedbackMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 text-xs font-semibold flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-200">
          {/* TAB 1: EMPRESAS PARCEIRAS & COLABORADORAS (Exact user request) */}
          {activeTab === 'partners' && (
            <div className="space-y-6">
              {!isEditingPartner ? (
                <>
                  {/* Top action row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        Empresas Homologadas na Seção Principal
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Estas empresas aparecem com seus respectivos logotipos, normas e escopos na página principal.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetDefaultPartners}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700"
                        title="Restaura empresas de referência como Petrobras, Embraer, Vale, WEG..."
                      >
                        Restaurar Padrões
                      </button>

                      <button
                        onClick={handleStartNewPartner}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Empresa Parceira</span>
                      </button>
                    </div>
                  </div>

                  {/* Partners List / Table */}
                  <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Logo</th>
                          <th className="py-3 px-4">Empresa / Razão Social</th>
                          <th className="py-3 px-4">Setor / Norma</th>
                          <th className="py-3 px-4">Tipo de Parceria</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {partners.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="py-3 px-4">
                              <div className="w-16 h-10 bg-slate-950 rounded-lg p-1 border border-slate-800 flex items-center justify-center">
                                {p.logoUrl ? (
                                  <img
                                    src={p.logoUrl}
                                    alt={p.name}
                                    className="max-h-8 max-w-full object-contain"
                                  />
                                ) : (
                                  <Building2 className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-white text-xs">{p.name}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                {p.tradeName || '—'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-slate-300 font-medium">{p.category}</div>
                              <div className="text-[10px] font-mono text-blue-400">{p.norm}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                                {p.partnershipType}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() =>
                                  updatePartner(p.id, { isActive: p.isActive === false ? true : false })
                                }
                                title={p.isActive !== false ? 'Clique para desativar' : 'Clique para ativar'}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                                  p.isActive !== false
                                    ? 'bg-blue-950 text-blue-300 border-blue-700'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {p.isActive !== false ? 'Ativo' : 'Oculto'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleStartEditPartner(p)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                  title="Editar dados da empresa"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePartner(p.id, p.name)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                                  title="Excluir empresa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                /* FORM ADD/EDIT PARTNER */
                <form onSubmit={handleSavePartner} className="space-y-5 bg-slate-950/40 p-6 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {partnerEditingId ? 'Editar Empresa Parceira' : 'Cadastrar Nova Empresa Parceira'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Preencha os campos abaixo para salvar no banco de dados da plataforma.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditingPartner(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* Logo Presets Quick Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Modelos de Logotipo Predefinidos (Clique para usar instantaneamente):
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {CORPORATE_LOGO_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setPartnerName(preset.name);
                            setPartnerCategory(preset.category);
                            setPartnerLogoUrl(preset.svg);
                          }}
                          className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                            partnerName === preset.name
                              ? 'bg-blue-900/50 border-blue-500 ring-2 ring-blue-500/30'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <img
                            src={preset.svg}
                            alt={preset.name}
                            className="h-6 w-full object-contain"
                          />
                          <span className="text-[10px] text-slate-300 truncate w-full text-center">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Nome Comercial / Marca *
                      </label>
                      <input
                        type="text"
                        required
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="Ex: Petrobras, Embraer..."
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Razão Social Oficial
                      </label>
                      <input
                        type="text"
                        value={partnerTradeName}
                        onChange={(e) => setPartnerTradeName(e.target.value)}
                        placeholder="Ex: Petróleo Brasileiro S.A."
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Logotipo da Empresa (Arquivo do Computador ou URL / SVG) *
                      </label>
                      {partnerLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setPartnerLogoUrl('')}
                          className="text-[11px] text-rose-400 hover:text-rose-300 underline"
                        >
                          Remover logo
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          required
                          value={partnerLogoUrl}
                          onChange={(e) => setPartnerLogoUrl(e.target.value)}
                          placeholder="https://... ou data:image/svg+xml..."
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <label className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 cursor-pointer flex items-center justify-center gap-2 transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5 text-blue-400" />
                        <span>Carregar do Computador</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {partnerLogoUrl && (
                      <div className="mt-2.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-slate-400">Pré-visualização:</span>
                        <div className="h-10 px-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center">
                          <img
                            src={partnerLogoUrl}
                            alt="Preview"
                            className="h-7 max-w-[160px] object-contain"
                          />
                        </div>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Logotipo pronto para apresentação
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Setor / Categoria *
                      </label>
                      <input
                        type="text"
                        required
                        value={partnerCategory}
                        onChange={(e) => setPartnerCategory(e.target.value)}
                        placeholder="Ex: Energia & Petróleo"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Norma(s) Acreditadas *
                      </label>
                      <input
                        type="text"
                        required
                        value={partnerNorm}
                        onChange={(e) => setPartnerNorm(e.target.value)}
                        placeholder="Ex: ISO 9001 · ISO 14001"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Tipo de Parceria *
                      </label>
                      <select
                        value={partnerType}
                        onChange={(e) => setPartnerType(e.target.value as PartnershipType)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Cliente Homologado">Cliente Homologado</option>
                        <option value="Parceiro Estratégico">Parceiro Estratégico</option>
                        <option value="Empresa Certificada">Empresa Certificada</option>
                        <option value="Aliança Tecnológica">Aliança Tecnológica</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Website Oficial
                      </label>
                      <input
                        type="text"
                        value={partnerWebsiteUrl}
                        onChange={(e) => setPartnerWebsiteUrl(e.target.value)}
                        placeholder="https://www.empresa.com.br"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-5">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-300">
                          Ordem de Exibição:
                        </label>
                        <input
                          type="number"
                          value={partnerOrder}
                          onChange={(e) => setPartnerOrder(Number(e.target.value))}
                          className="w-16 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white text-center"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                        <input
                          type="checkbox"
                          checked={partnerIsActive}
                          onChange={(e) => setPartnerIsActive(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Visível na Landing Page</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Escopo Técnico da Colaboração
                    </label>
                    <textarea
                      rows={3}
                      value={partnerDescription}
                      onChange={(e) => setPartnerDescription(e.target.value)}
                      placeholder="Descreva o escopo de certificação, fornecedores monitorados ou auditoria periódica..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingPartner(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>{partnerEditingId ? 'Salvar Alterações' : 'Salvar no Banco de Dados'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: LANDING PAGE CMS */}
          {activeTab === 'landing' && (
            <form onSubmit={handleSaveLanding} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Selo / Badge do Hero
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Título Principal do Hero (H1)
                </label>
                <textarea
                  rows={2}
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Subtítulo Descritivo
                </label>
                <textarea
                  rows={2}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Texto Botão CTA Principal
                  </label>
                  <input
                    type="text"
                    value={primaryCtaText}
                    onChange={(e) => setPrimaryCtaText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Texto Botão CTA Secundário
                  </label>
                  <input
                    type="text"
                    value={secondaryCtaText}
                    onChange={(e) => setSecondaryCtaText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Estatística 1
                  </label>
                  <input
                    type="text"
                    value={statsSuppliers}
                    onChange={(e) => setStatsSuppliers(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Estatística 2
                  </label>
                  <input
                    type="text"
                    value={statsAudits}
                    onChange={(e) => setStatsAudits(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Estatística 3
                  </label>
                  <input
                    type="text"
                    value={statsCertificates}
                    onChange={(e) => setStatsCertificates(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Publicar Alterações na Landing Page</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: USUÁRIOS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Lista de todos os usuários registrados. O usuário <strong>admin@x.com</strong> possui privilégios de Administrador Master.
              </p>

              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Usuário</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4">Papel Atual</th>
                      <th className="py-2.5 px-4 text-right">Alterar Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/60">
                        <td className="py-3 px-4 font-bold text-white">
                          {u.name}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {u.email}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.role === 'admin'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : u.role === 'auditor'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <select
                            value={u.role}
                            disabled={u.email === 'admin@x.com'}
                            onChange={(e) => setUserRole(u.id, e.target.value as Role)}
                            className="text-xs p-1 rounded-lg border border-slate-700 bg-slate-900 text-white"
                          >
                            <option value="admin">Admin</option>
                            <option value="auditor">Auditor</option>
                            <option value="empresa">Empresa</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: BANCO DE DADOS & BACKUP */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sm text-white">Dados de Demonstração Corporativa</h4>
                  <p className="text-xs text-slate-400">
                    Popule instantaneamente os módulos internos e o banco de dados com empresas, fornecedores e auditorias realistas.
                  </p>
                  <button
                    onClick={() => {
                      seedSampleData();
                      setFeedbackMsg('Dados de demonstração populados em todos os módulos!');
                      setTimeout(() => setFeedbackMsg(null), 3000);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Popular Demonstração Completa</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sm text-white">Zerar Dados Locais de Teste</h4>
                  <p className="text-xs text-slate-400">
                    Retorne todos os módulos aos estados iniciais vazios para validação de Empty States.
                  </p>
                  <button
                    onClick={() => {
                      clearAllData();
                      setFeedbackMsg('Todos os registros foram zerados para Empty States!');
                      setTimeout(() => setFeedbackMsg(null), 3000);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Zerar Módulos</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportJSON}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all shadow-sm border border-slate-700"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Exportar Backup Completo com Parceiros (JSON)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
