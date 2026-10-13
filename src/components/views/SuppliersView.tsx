import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Globe2,
  Search,
  LayoutGrid,
  Table as TableIcon,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatCard } from '../common/StatCard';
import { EmptyState } from '../common/EmptyState';
import { Supplier, SupplierStatus } from '../../types';
import { STANDARD_NORMS } from '../../data/initialData';

interface SuppliersViewProps {
  onOpenMap: () => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ onOpenMap }) => {
  const { suppliers, addSupplier, deleteSupplier } = useData();

  const [activeFilter, setActiveFilter] = useState<'Todos' | SupplierStatus>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    tradeName: '',
    corporateName: '',
    cnpj: '',
    contactEmail: '',
    phone: '',
    category: 'Matéria-Prima & Insumos',
    iqfScore: 85,
    status: 'Em Avaliação' as SupplierStatus,
    primaryNorm: 'ISO 9001',
    city: '',
    state: 'SP',
    country: 'Brasil',
  });

  const totalCount = suppliers.length;
  const homologadosCount = suppliers.filter((s) => s.status === 'Homologado').length;
  const qualificadosCount = suppliers.filter((s) => s.status === 'Qualificado').length;
  const avaliacaoCount = suppliers.filter((s) => s.status === 'Em Avaliação').length;
  const bloqueadosCount = suppliers.filter((s) => s.status === 'Bloqueado').length;
  const criticosCount = suppliers.filter((s) => s.iqfScore < 70).length;

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesFilter =
      activeFilter === 'Todos' ? true : s.status === activeFilter;
    const matchesSearch =
      s.tradeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cnpj.includes(searchQuery) ||
      s.primaryNorm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tradeName || !formData.cnpj) return;
    addSupplier(formData);
    setIsModalOpen(false);
    setFormData({
      tradeName: '',
      corporateName: '',
      cnpj: '',
      contactEmail: '',
      phone: '',
      category: 'Matéria-Prima & Insumos',
      iqfScore: 85,
      status: 'Em Avaliação',
      primaryNorm: 'ISO 9001',
      city: '',
      state: 'SP',
      country: 'Brasil',
    });
  };

  const getStatusBadge = (status: SupplierStatus) => {
    switch (status) {
      case 'Homologado':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'Qualificado':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'Em Avaliação':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'Bloqueado':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portal de Fornecedores & Cadeia de Suprimentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Gestão do Índice de Qualificação de Fornecedores (IQF), auditorias de 2ª parte e homologação técnica de parceiros.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenMap}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold shadow-xs transition-all"
          >
            <Globe2 className="w-4 h-4 text-blue-400" />
            <span>Mapa Geográfico</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Fornecedor</span>
          </button>
        </div>
      </div>

      {/* Grid 2x3 Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          label="TOTAL"
          value={totalCount}
          subtitle="Cadeia cadastrada"
          icon={Building2}
          badge="100%"
          badgeColor="stone"
          active={activeFilter === 'Todos'}
          onClick={() => setActiveFilter('Todos')}
        />
        <StatCard
          label="HOMOLOGADOS"
          value={homologadosCount}
          subtitle="Conformidade plena"
          icon={CheckCircle2}
          badge="Aprovados"
          badgeColor="green"
          active={activeFilter === 'Homologado'}
          onClick={() => setActiveFilter('Homologado')}
        />
        <StatCard
          label="QUALIFICADOS"
          value={qualificadosCount}
          subtitle="Aptos para operação"
          icon={ShieldCheck}
          badge="Aptos"
          badgeColor="blue"
          active={activeFilter === 'Qualificado'}
          onClick={() => setActiveFilter('Qualificado')}
        />
        <StatCard
          label="EM AVALIAÇÃO"
          value={avaliacaoCount}
          subtitle="Ciclo em curso"
          icon={Clock}
          badge="Pendentes"
          badgeColor="yellow"
          active={activeFilter === 'Em Avaliação'}
          onClick={() => setActiveFilter('Em Avaliação')}
        />
        <StatCard
          label="BLOQUEADOS"
          value={bloqueadosCount}
          subtitle="Não conformidade"
          icon={XCircle}
          badge="Restrito"
          badgeColor="red"
          active={activeFilter === 'Bloqueado'}
          onClick={() => setActiveFilter('Bloqueado')}
        />
        <StatCard
          label="CRÍTICOS (IQF<70)"
          value={criticosCount}
          subtitle="Score sob risco"
          icon={AlertTriangle}
          badge="Atenção"
          badgeColor="orange"
        />
      </div>

      {/* Filter bar, Search & View Toggle */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Horizontal Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(['Todos', 'Em Avaliação', 'Qualificado', 'Homologado', 'Bloqueado'] as const).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    activeFilter === filter
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {filter}
                </button>
              )
            )}
          </div>

          {/* Search bar & View toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar fornecedor, CNPJ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Visualização em Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Visualização em Tabela"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredSuppliers.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhum fornecedor registrado"
          description={
            suppliers.length === 0
              ? 'Não há fornecedores cadastrados na base de dados. Cadastre o primeiro parceiro para iniciar a matriz de qualificação e auditorias de conformidade.'
              : 'Nenhum fornecedor corresponde aos filtros selecionados.'
          }
          actionLabel="+ Novo Fornecedor"
          onAction={() => setIsModalOpen(true)}
        />
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((s) => (
            <div
              key={s.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xs transition-all relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      s.status
                    )}`}
                  >
                    {s.status}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">IQF</span>
                    <span
                      className={`text-base font-extrabold tabular-nums ${
                        s.iqfScore >= 80
                          ? 'text-emerald-400'
                          : s.iqfScore >= 70
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {s.iqfScore}/100
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                  {s.tradeName}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{s.cnpj}</p>
                <p className="text-xs text-slate-300 mt-2 font-medium line-clamp-1">
                  {s.category}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Norma</span>
                    <span className="font-semibold text-slate-200 font-mono">{s.primaryNorm}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Localização</span>
                    <span className="font-semibold text-slate-200">
                      {s.city || 'São Paulo'} - {s.state}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[10px]">Cadastrado em {s.createdAt}</span>
                <button
                  onClick={() => deleteSupplier(s.id)}
                  className="text-slate-400 hover:text-rose-400 text-[11px] font-medium transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fornecedor</th>
                  <th className="py-3 px-4">CNPJ</th>
                  <th className="py-3 px-4">Norma</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">IQF</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {s.tradeName}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {s.city} - {s.state}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{s.cnpj}</td>
                    <td className="py-3.5 px-4 font-medium text-blue-400 font-mono">{s.primaryNorm}</td>
                    <td className="py-3.5 px-4 text-slate-300">{s.category}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold tabular-nums ${
                          s.iqfScore >= 80
                            ? 'text-emerald-400'
                            : s.iqfScore >= 70
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {s.iqfScore}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                          s.status
                        )}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => deleteSupplier(s.id)}
                        className="text-slate-400 hover:text-rose-400 font-semibold"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: + Novo Fornecedor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-700 overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-lg">
                  Cadastrar Novo Fornecedor
                </h3>
                <p className="text-xs text-slate-400">
                  Qualificação e inclusão na esteira de auditoria de conformidade.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome Fantasia *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    placeholder="Ex: Aço Forte Industrial"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Norma Primária
                  </label>
                  <select
                    value={formData.primaryNorm}
                    onChange={(e) => setFormData({ ...formData, primaryNorm: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    {STANDARD_NORMS.map((n) => (
                      <option key={n.code} value={n.code}>
                        {n.code} - {n.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Inicial
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as SupplierStatus })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Em Avaliação">Em Avaliação</option>
                    <option value="Qualificado">Qualificado</option>
                    <option value="Homologado">Homologado</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    IQF Inicial (0 - 100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.iqfScore}
                    onChange={(e) =>
                      setFormData({ ...formData, iqfScore: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ex: Curitiba"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    placeholder="PR"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
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
                  Salvar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
