import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Clock,
  User,
  Calendar,
  ExternalLink,
  Sparkles,
  X,
  Share2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { EmptyState } from '../common/EmptyState';
import { TechnicalArticle } from '../../types';

export const MagazineView: React.FC = () => {
  const { articles, addArticle } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<TechnicalArticle | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    author: 'Corpo Técnico Nexus Veritas',
    summary: '',
    content: '',
    normTag: 'Gestão da Qualidade',
    readTime: '5 min de leitura',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    addArticle(formData);
    setIsModalOpen(false);
    setFormData({
      title: '',
      author: 'Corpo Técnico Nexus Veritas',
      summary: '',
      content: '',
      normTag: 'Gestão da Qualidade',
      readTime: '5 min de leitura',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-serif-luxury tracking-tight">
            Revista Nexus Veritas
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl font-sans">
            Publicações científicas, papers técnicos e artigos sobre auditoria, ESG e conformidade.
          </p>
        </div>

        {/* Botões “Ver Revista” + “+ Novo artigo” */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (articles.length > 0) setSelectedArticle(articles[0]);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-all"
          >
            <BookOpen className="w-4 h-4 text-[#0F1D38]" />
            <span>Ver Revista</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1D38] hover:bg-slate-900 text-amber-300 border border-slate-700 text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo artigo</span>
          </button>
        </div>
      </div>

      {/* Articles Content or Empty State */}
      {articles.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum artigo publicado"
          description="A Revista Técnica Nexus Veritas publica estudos sobre o estado da arte em compliance, ISO e governança de suprimentos. Publique o primeiro artigo da edição."
          actionLabel="+ Novo artigo"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art) => (
            <article
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                    {art.normTag}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{art.readTime}</span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] font-serif-luxury group-hover:text-[#0F1D38] transition-colors leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-[11px]">{art.author}</span>
                </div>
                <span className="text-[10px]">{art.date}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal: Leitor do Artigo Completo */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest font-sans">
                Revista Nexus Veritas · {selectedArticle.normTag}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-[#1E293B] leading-tight">
                {selectedArticle.title}
              </h1>

              <div className="flex items-center gap-4 text-xs text-stone-500 pb-4 border-b border-stone-100">
                <span>Por <strong>{selectedArticle.author}</strong></span>
                <span>·</span>
                <span>{selectedArticle.date}</span>
                <span>·</span>
                <span>{selectedArticle.readTime}</span>
              </div>

              <p className="text-sm font-semibold text-stone-700 italic bg-orange-50/50 p-4 rounded-xl border border-orange-100 leading-relaxed">
                "{selectedArticle.summary}"
              </p>

              <div className="text-sm text-stone-700 leading-relaxed space-y-3 font-sans">
                {selectedArticle.content ? (
                  selectedArticle.content.split('\n\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))
                ) : (
                  <p>Conteúdo integral disponível sob custódia do comitê editorial da Nexus Veritas.</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold"
              >
                Fechar Artigo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: + Novo Artigo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#1E293B] font-serif-luxury text-lg">
                  Publicar Novo Artigo Técnico
                </h3>
                <p className="text-xs text-stone-500">
                  Submissão editorial para a Revista Nexus Veritas.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                  Título do Artigo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Metodologia de Cálculo do IQF em Auditorias de Segunda Parte"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#1E293B] focus:border-[#0F1D38]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                    Autor
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#1E293B] focus:border-[#0F1D38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                    Tema / Tag
                  </label>
                  <input
                    type="text"
                    value={formData.normTag}
                    onChange={(e) => setFormData({ ...formData, normTag: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#1E293B] focus:border-[#0F1D38]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                  Resumo Executivo (Abstract)
                </label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Síntese das principais conclusões..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#1E293B] focus:border-[#0F1D38]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                  Conteúdo do Artigo
                </label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Desenvolvimento teórico, evidências e referências normativas..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#1E293B] focus:border-[#0F1D38]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0F1D38] hover:bg-slate-900 text-amber-300 border border-slate-700 text-xs font-bold shadow-sm transition-all"
                >
                  Publicar Artigo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
