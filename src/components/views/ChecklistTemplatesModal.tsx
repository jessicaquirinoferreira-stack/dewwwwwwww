import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Edit3,
  Trash2,
  Copy,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  X,
  Search,
  Bookmark,
  ShieldCheck,
  Check,
  Lock,
  Layers,
  FileText,
  Building2,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  Eye,
  CheckSquare
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  ChecklistTemplate,
  ChecklistTemplateItem,
  ChecklistRevisionHistory
} from '../../types';

interface ChecklistTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplateToAudit?: (template: ChecklistTemplate) => void;
}

export const ChecklistTemplatesModal: React.FC<ChecklistTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplateToAudit
}) => {
  const { theme } = useTheme();
  const { user, isAdmin } = useAuth();
  const {
    checklistTemplates,
    addChecklistTemplate,
    updateChecklistTemplate,
    deleteChecklistTemplate,
    createNewChecklistRevision
  } = useData();

  // Navigation Tabs in Library
  const [activeTab, setActiveTab] = useState<'oficiais' | 'personalizados' | 'novo'>('oficiais');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNormFilter, setSelectedNormFilter] = useState('all');

  // Selected Template for Detail / Edit / Revision
  const [activeTemplate, setActiveTemplate] = useState<ChecklistTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Revision Form State
  const [revisionForm, setRevisionForm] = useState({
    revisionNumber: '',
    reason: '',
    responsible: user?.name || 'Administrador Técnico',
    changesSummary: ''
  });

  // Item Form State (for adding/editing a requirement item)
  const [itemForm, setItemForm] = useState<ChecklistTemplateItem>({
    id: '',
    code: '',
    requirement: '',
    processOrArea: '',
    guidance: '',
    expectedEvidence: '',
    acceptanceCriteria: '',
    weight: 1.0,
    criticality: 'Alta',
    isActive: true,
    order: 1
  });

  // Filter templates
  const filteredTemplates = checklistTemplates.filter((tmpl) => {
    const isOficial = tmpl.isSystemStandard || tmpl.type === 'padrao_nexus';
    const matchesTab = activeTab === 'oficiais' ? isOficial : !isOficial;
    const matchesNorm = selectedNormFilter === 'all' || tmpl.norm === selectedNormFilter;
    const matchesSearch =
      searchQuery === '' ||
      tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.norm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tmpl.scope && tmpl.scope.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tmpl.companyName && tmpl.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesNorm && matchesSearch;
  });

  if (!isOpen) return null;

  // Permissions check
  const canEditStandardTemplates = isAdmin || user?.role === 'master';

  // Open Revision Modal
  const handleOpenRevisionModal = (template: ChecklistTemplate) => {
    setActiveTemplate(template);
    // suggest next revision number (e.g. Rev. 02 -> Rev. 03)
    const currentRevNum = parseInt(template.revisionNumber.replace(/\D/g, '')) || 0;
    const nextRev = `Rev. ${String(currentRevNum + 1).padStart(2, '0')}`;
    setRevisionForm({
      revisionNumber: nextRev,
      reason: '',
      responsible: user?.name || 'Auditor Líder',
      changesSummary: ''
    });
    setIsRevisionModalOpen(true);
  };

  // Submit New Revision
  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate || !revisionForm.revisionNumber.trim()) return;

    createNewChecklistRevision(activeTemplate.id, {
      revisionNumber: revisionForm.revisionNumber,
      reason: revisionForm.reason || 'Revisão periódica e atualização de requisitos.',
      responsible: revisionForm.responsible,
      changesSummary: revisionForm.changesSummary || 'Atualização de requisitos e critérios de conformidade.',
      newItems: activeTemplate.items
    });

    setIsRevisionModalOpen(false);
  };

  // Duplicate / Create Custom Copy for Client
  const handleCreateCustomCopy = (baseTemplate: ChecklistTemplate) => {
    const company = user?.jobTitle || 'Empresa Assinante';
    const newTemplateData: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `${baseTemplate.norm} — Personalizado (${company})`,
      norm: baseTemplate.norm,
      normEdition: baseTemplate.normEdition,
      revisionNumber: 'Rev. 01',
      type: 'personalizado_empresa',
      scope: `Modelo customizado com requisitos específicos baseado no ${baseTemplate.title}`,
      status: 'Vigente',
      isSystemStandard: false,
      ownerId: user?.id,
      ownerName: user?.name || 'Auditor / Gestor',
      companyName: company,
      items: baseTemplate.items.map((item, idx) => ({
        ...item,
        id: `it-${Date.now()}-${idx}`
      })),
      revisionHistory: [
        {
          revisionNumber: 'Rev. 01',
          date: new Date().toISOString().split('T')[0],
          responsible: user?.name || 'Auditor / Gestor',
          reason: 'Criação de modelo personalizado a partir do padrão Nexus Veritas.',
          changesSummary: 'Cópia inicial com permissão de customização interna de requisitos.'
        }
      ]
    };

    addChecklistTemplate(newTemplateData);
    setActiveTab('personalizados');
  };

  // Reorder Item (Up or Down)
  const handleMoveItem = (template: ChecklistTemplate, index: number, direction: 'up' | 'down') => {
    const newItems = [...template.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // update order property
    const reordered = newItems.map((item, i) => ({ ...item, order: i + 1 }));

    updateChecklistTemplate(template.id, { items: reordered });
    setActiveTemplate({ ...template, items: reordered });
  };

  // Toggle Item Active/Inactive
  const handleToggleItemActive = (template: ChecklistTemplate, itemId: string) => {
    const updatedItems = template.items.map((item) =>
      item.id === itemId ? { ...item, isActive: !item.isActive } : item
    );
    updateChecklistTemplate(template.id, { items: updatedItems });
    setActiveTemplate({ ...template, items: updatedItems });
  };

  // Delete Item from Template
  const handleDeleteItem = (template: ChecklistTemplate, itemId: string) => {
    if (confirm('Tem certeza que deseja excluir este requisito do checklist?')) {
      const updatedItems = template.items.filter((item) => item.id !== itemId);
      updateChecklistTemplate(template.id, { items: updatedItems });
      setActiveTemplate({ ...template, items: updatedItems });
    }
  };

  // Save Item (Add or Edit)
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate || !itemForm.requirement.trim()) return;

    let updatedItems = [...activeTemplate.items];
    if (editingItemIndex !== null) {
      // Editing existing item
      updatedItems[editingItemIndex] = { ...itemForm };
    } else {
      // Adding new item
      const newItem: ChecklistTemplateItem = {
        ...itemForm,
        id: `it-${Date.now()}-${updatedItems.length + 1}`,
        order: updatedItems.length + 1
      };
      updatedItems.push(newItem);
    }

    updateChecklistTemplate(activeTemplate.id, { items: updatedItems });
    setActiveTemplate({ ...activeTemplate, items: updatedItems });
    setIsNewItemModalOpen(false);
    setEditingItemIndex(null);
  };

  // Open Edit Item Form
  const handleOpenEditItem = (item: ChecklistTemplateItem, index: number) => {
    setItemForm({ ...item });
    setEditingItemIndex(index);
    setIsNewItemModalOpen(true);
  };

  // Open Add Item Form
  const handleOpenAddItem = () => {
    setItemForm({
      id: '',
      code: '',
      requirement: '',
      processOrArea: '',
      guidance: '',
      expectedEvidence: '',
      acceptanceCriteria: '',
      weight: 1.0,
      criticality: 'Alta',
      isActive: true,
      order: (activeTemplate?.items.length || 0) + 1
    });
    setEditingItemIndex(null);
    setIsNewItemModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-orange-400" />
                <span>BIBLIOTECA SGQ & CHECKLISTS INTELIGENTES</span>
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">Controle de Revisões & Customização</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Gestão Centralizada de Checklists & Modelos de Avaliação
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Library Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('oficiais');
                setActiveTemplate(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'oficiais'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Modelos Padronizados Nexus Veritas</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                {checklistTemplates.filter((t) => t.isSystemStandard).length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('personalizados');
                setActiveTemplate(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'personalizados'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Modelos Personalizados (Empresas & Auditores)</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                {checklistTemplates.filter((t) => !t.isSystemStandard).length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar checklist, norma..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Main Content: List & Detail View */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Panel: Checklist List (4 cols) */}
          <div className="lg:col-span-4 border-r border-slate-800 overflow-y-auto p-4 space-y-3 bg-slate-950/30">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Modelos disponíveis ({filteredTemplates.length})</span>
              <span className="text-[11px] text-orange-400 font-mono">ISO · ESG · Setoriais</span>
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Nenhum checklist encontrado nesta categoria.
              </div>
            ) : (
              filteredTemplates.map((tmpl) => {
                const isSelected = activeTemplate?.id === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setActiveTemplate(tmpl);
                      setIsEditingTemplate(false);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-slate-900 border-orange-500/80 shadow-md ring-1 ring-orange-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                        {tmpl.norm}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                        {tmpl.revisionNumber}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                      {tmpl.title}
                    </h4>

                    <div className="text-[10px] text-slate-400 mt-2 space-y-0.5">
                      <div className="truncate">
                        Edição: <strong className="text-slate-300">{tmpl.normEdition}</strong>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span>{tmpl.items.length} requisitos</span>
                        <span className="text-emerald-400 font-semibold">{tmpl.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Panel: Checklist Detail, Items & Actions (8 cols) */}
          <div className="lg:col-span-8 overflow-y-auto p-6 space-y-6">
            {!activeTemplate ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Sliders className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="text-sm font-bold text-white">Selecione um checklist ao lado</h3>
                <p className="text-xs max-w-sm mt-1">
                  Visualize os requisitos, edite cláusulas, crie revisões com rastreabilidade formal ou personalize para sua empresa.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header of Active Template */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30">
                        {activeTemplate.norm}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                        {activeTemplate.revisionNumber}
                      </span>
                      <span className="text-xs text-slate-400">
                        Edição: <strong className="text-white">{activeTemplate.normEdition}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white">
                      {activeTemplate.title}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      {activeTemplate.scope}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                      <span>Responsável: <strong className="text-slate-300">{activeTemplate.ownerName || 'Nexus Veritas'}</strong></span>
                      <span>•</span>
                      <span>Atualizado em: <strong className="text-slate-300">{activeTemplate.updatedAt.split('T')[0]}</strong></span>
                    </div>
                  </div>

                  {/* Top Action Buttons for this Template */}
                  <div className="flex flex-wrap items-center gap-2">
                    {onSelectTemplateToAudit && (
                      <button
                        onClick={() => onSelectTemplateToAudit(activeTemplate)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Usar nesta Auditoria</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenRevisionModal(activeTemplate)}
                      className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                      title="Salvar como nova versão com histórico de alterações"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Revisar Checklist</span>
                    </button>

                    <button
                      onClick={() => setIsHistoryModalOpen(true)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 flex items-center gap-1.5"
                    >
                      <History className="w-3.5 h-3.5 text-orange-400" />
                      <span>Histórico ({activeTemplate.revisionHistory?.length || 0})</span>
                    </button>

                    <button
                      onClick={() => handleCreateCustomCopy(activeTemplate)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 flex items-center gap-1.5"
                      title="Criar modelo personalizado para minha empresa a partir deste"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-400" />
                      <span>Personalizar</span>
                    </button>
                  </div>
                </div>

                {/* Items Management Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Requisitos, Perguntas e Critérios de Aceitação</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {activeTemplate.items.length} itens
                      </span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Adicione novos requisitos, reordene cláusulas e ajuste evidências esperadas.
                    </span>
                  </div>

                  <button
                    onClick={handleOpenAddItem}
                    className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Inserir Novo Requisito</span>
                  </button>
                </div>

                {/* Requirements Items Table / List */}
                <div className="space-y-3">
                  {activeTemplate.items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.isActive
                          ? 'bg-slate-950/80 border-slate-800'
                          : 'bg-slate-950/40 border-slate-850 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400">
                              {item.code || `Item ${index + 1}`}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {item.requirement}
                            </span>
                            <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                              {item.processOrArea}
                            </span>
                            {item.criticality && (
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                item.criticality === 'Crítica'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : 'bg-slate-800 text-slate-300'
                              }`}>
                                {item.criticality}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-mono">
                              Peso: {item.weight}x
                            </span>
                          </div>

                          {item.guidance && (
                            <p className="text-[11px] text-slate-300 mt-1">
                              <strong className="text-orange-400">Orientação:</strong> {item.guidance}
                            </p>
                          )}

                          {item.expectedEvidence && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              <strong className="text-slate-500">Evidência Esperada:</strong> {item.expectedEvidence}
                            </p>
                          )}

                          {item.acceptanceCriteria && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              <strong className="text-slate-500">Critério de Aceitação:</strong> {item.acceptanceCriteria}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons for this item */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Move Up */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveItem(activeTemplate, index, 'up')}
                            className="p-1 text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Subir Requisito"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            disabled={index === activeTemplate.items.length - 1}
                            onClick={() => handleMoveItem(activeTemplate, index, 'down')}
                            className="p-1 text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Descer Requisito"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Item */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditItem(item, index)}
                            className="p-1 text-slate-400 hover:text-orange-400 cursor-pointer"
                            title="Editar Requisito"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active */}
                          <button
                            type="button"
                            onClick={() => handleToggleItemActive(activeTemplate, item.id)}
                            className={`p-1 cursor-pointer ${
                              item.isActive ? 'text-emerald-400' : 'text-slate-600'
                            }`}
                            title={item.isActive ? 'Inativar Item' : 'Ativar Item'}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(activeTemplate, item.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                            title="Excluir Requisito"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL SECUNDÁRIO 1: REVISÃO DE CHECKLIST (SALVAR NOVA VERSÃO)
      ========================================================================= */}
      {isRevisionModalOpen && activeTemplate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Salvar Como Nova Revisão Oficial</h3>
              </div>
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              A emissão de uma nova revisão mantém o histórico intacto e preserva todas as auditorias anteriores que utilizaram as versões passadas.
            </p>

            <form onSubmit={handleSubmitRevision} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Número da Revisão *
                  </label>
                  <input
                    type="text"
                    required
                    value={revisionForm.revisionNumber}
                    onChange={(e) => setRevisionForm({ ...revisionForm, revisionNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                    placeholder="Ex: Rev. 03"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Responsável pela Revisão
                  </label>
                  <input
                    type="text"
                    required
                    value={revisionForm.responsible}
                    onChange={(e) => setRevisionForm({ ...revisionForm, responsible: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Motivo da Revisão / Atualização *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Atualização da norma, Inclusão de critérios ESG, etc."
                  value={revisionForm.reason}
                  onChange={(e) => setRevisionForm({ ...revisionForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Sumário das Alterações Realizadas
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva resumidamente os novos requisitos inseridos ou perguntas atualizadas..."
                  value={revisionForm.changesSummary}
                  onChange={(e) => setRevisionForm({ ...revisionForm, changesSummary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-orange-500/20"
                >
                  Confirmar Nova Revisão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL SECUNDÁRIO 2: HISTÓRICO DE REVISÕES
      ========================================================================= */}
      {isHistoryModalOpen && activeTemplate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Histórico de Revisões do Modelo</h3>
                  <p className="text-[11px] text-slate-400">{activeTemplate.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(activeTemplate.revisionHistory || []).map((rev, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
                      {rev.revisionNumber}
                    </span>
                    <span className="text-slate-500 text-[11px]">{rev.date}</span>
                  </div>
                  <div className="font-semibold text-white mt-1">
                    Motivo: {rev.reason}
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {rev.changesSummary}
                  </p>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                    Aprovado por: <strong className="text-slate-300">{rev.responsible}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL SECUNDÁRIO 3: ADICIONAR / EDITAR REQUISITO
      ========================================================================= */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingItemIndex !== null ? 'Editar Requisito' : 'Inserir Novo Requisito Normativo'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewItemModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Cláusula / Código
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 8.5.1"
                    value={itemForm.code || ''}
                    onChange={(e) => setItemForm({ ...itemForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Processo / Área Aplicável *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Manufatura / Suprimentos"
                    value={itemForm.processOrArea}
                    onChange={(e) => setItemForm({ ...itemForm, processOrArea: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Requisito / Pergunta de Auditoria *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enunciado claro do requisito normativo..."
                  value={itemForm.requirement}
                  onChange={(e) => setItemForm({ ...itemForm, requirement: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Orientação ao Auditor
                </label>
                <textarea
                  rows={2}
                  placeholder="Diretrizes e pontos focais de amostragem..."
                  value={itemForm.guidance || ''}
                  onChange={(e) => setItemForm({ ...itemForm, guidance: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Evidência Esperada
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Registros, laudos, atas..."
                    value={itemForm.expectedEvidence || ''}
                    onChange={(e) => setItemForm({ ...itemForm, expectedEvidence: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Critério de Aceitação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sem desvios toleráveis..."
                    value={itemForm.acceptanceCriteria || ''}
                    onChange={(e) => setItemForm({ ...itemForm, acceptanceCriteria: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Peso (Ponderação)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="5.0"
                    value={itemForm.weight}
                    onChange={(e) => setItemForm({ ...itemForm, weight: parseFloat(e.target.value) || 1.0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Criticidade
                  </label>
                  <select
                    value={itemForm.criticality}
                    onChange={(e) => setItemForm({ ...itemForm, criticality: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-orange-500/20"
                >
                  Salvar Requisito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
