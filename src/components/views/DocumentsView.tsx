import React, { useState } from 'react';
import {
  FileText,
  Plus,
  FileCheck2,
  Sliders,
  Award,
  Layers,
  Search,
  Download,
  Trash2,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { EmptyState } from '../common/EmptyState';
import { CustomDocument, DocumentType } from '../../types';
import { STANDARD_NORMS } from '../../data/initialData';

export const DocumentsView: React.FC = () => {
  const { documents, addDocument, deleteDocument } = useData();

  // Abas: Checklists | Formulários | Certificados
  const [activeTab, setActiveTab] = useState<DocumentType>('checklist');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'checklist' as DocumentType,
    norm: 'ISO 9001',
    version: 'v1.0',
    description: '',
  });

  const filteredDocs = documents
    .filter((d) => d.type === activeTab)
    .filter((d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.norm.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    addDocument({
      ...formData,
      type: activeTab,
    });
    setIsModalOpen(false);
    setFormData({
      title: '',
      type: 'checklist',
      norm: 'ISO 9001',
      version: 'v1.0',
      description: '',
    });
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Documentos Personalizados
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Biblioteca de modelos, checklists multinorma, formulários CAPA e templates oficiais.
          </p>
        </div>

        {/* Botão “+ Novo modelo” */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Modelo</span>
        </button>
      </div>

      {/* Abas: Checklists | Formulários | Certificados */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'checklist'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Checklists</span>
          </button>
          <button
            onClick={() => setActiveTab('formulario')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'formulario'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Formulários</span>
          </button>
          <button
            onClick={() => setActiveTab('certificado')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'certificado'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certificados</span>
          </button>
        </div>

        {/* Search inside models */}
        <div className="relative sm:w-64 px-2 sm:px-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrar modelos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Empty state ou listagem de documentos */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={`Nenhum modelo de ${
            activeTab === 'checklist'
              ? 'Checklist'
              : activeTab === 'formulario'
              ? 'Formulário'
              : 'Certificado'
          }`}
          description={`Crie modelos padronizados para garantir que todos os auditores e clientes sigam o mesmo padrão operacional homologado.`}
          actionLabel="+ Novo modelo"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/80">
                    {doc.norm}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {doc.version}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-1">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {doc.description || 'Modelo homologado pelo Corpo Técnico Nexus Veritas.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">
                  Atualizado em {doc.updatedAt}
                </span>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="text-slate-400 hover:text-rose-400 text-[11px] transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: + Novo Modelo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-700 overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base">
                  Novo Modelo de Documento
                </h3>
                <p className="text-xs text-slate-400">
                  Padronização técnica institucional.
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
                  Título do Documento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Checklist Auditoria Interna ISO 9001:2015"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value as DocumentType)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="checklist">Checklist</option>
                    <option value="formulario">Formulário</option>
                    <option value="certificado">Certificado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Norma Associada
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
                    <option value="Multinorma">Multinorma</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Versão
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="v1.0"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição & Instruções de Preenchimento
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Orientações e escopo aplicável do modelo..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
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
                  Salvar Modelo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
