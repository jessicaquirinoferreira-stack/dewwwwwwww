import React, { useState } from 'react';
import {
  GraduationCap,
  Layers,
  UserCheck,
  Search,
  BookOpen,
  Clock,
  Award,
  PlayCircle,
  Plus,
  CheckCircle2,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { EmptyState } from '../common/EmptyState';
import { Course } from '../../types';
import { STANDARD_NORMS } from '../../data/initialData';

interface AcademyViewProps {
  initialSubTab?: 'meus-cursos' | 'catalogo-academy' | 'area-do-instrutor';
}

export const AcademyView: React.FC<AcademyViewProps> = ({
  initialSubTab = 'catalogo-academy',
}) => {
  const { courses, addCourse, enrollInCourse } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'meus-cursos' | 'catalogo-academy' | 'area-do-instrutor'>(
    initialSubTab
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for creating new course
  const [formData, setFormData] = useState({
    title: '',
    category: 'Sistemas de Gestão',
    norm: 'ISO 9001',
    hours: 24,
    instructorName: 'Auditor Master Nexus',
    description: '',
  });

  const enrolledCourses = courses.filter((c) => c.enrolled);

  const filteredCatalog = courses.filter((c) => {
    return (
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.norm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    addCourse(formData);
    setIsModalOpen(false);
    setFormData({
      title: '',
      category: 'Sistemas de Gestão',
      norm: 'ISO 9001',
      hours: 24,
      instructorName: 'Auditor Master Nexus',
      description: '',
    });
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Nexus Academy
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl font-sans">
            Capacitação técnica executiva, formação de Auditores Líderes IRCA e atualização multinorma.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Publicar Curso</span>
        </button>
      </div>

      {/* Sub Tabs: Meus cursos | Catálogo Academy | Área do instrutor */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl overflow-x-auto flex-nowrap scrollbar-none">
          <button
            onClick={() => setActiveSubTab('catalogo-academy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'catalogo-academy'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Catálogo Academy</span>
          </button>

          <button
            onClick={() => setActiveSubTab('meus-cursos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'meus-cursos'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Meus Cursos ({enrolledCourses.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('area-do-instrutor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeSubTab === 'area-do-instrutor'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Área do Instrutor</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-64 px-2 sm:px-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por curso, norma..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Tab: Catálogo Academy */}
      {activeSubTab === 'catalogo-academy' && (
        <>
          {filteredCatalog.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="Nenhum curso publicado ainda"
              description="O catálogo acadêmico da Nexus está em atualização. Novos módulos de formação executiva e treinamentos IRCA serão disponibilizados em breve."
              actionLabel="+ Publicar novo curso"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCatalog.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xs hover:border-blue-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                        {course.norm}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {course.hours}h
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{course.category}</p>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                      <span>Instrutor: </span>
                      <strong className="text-slate-200">{course.instructorName}</strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    {course.enrolled ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Matriculado ({course.progress}%)
                      </span>
                    ) : (
                      <button
                        onClick={() => enrollInCourse(course.id)}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        Matricular-se no Curso
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Meus Cursos */}
      {activeSubTab === 'meus-cursos' && (
        <>
          {enrolledCourses.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Você ainda não está matriculado"
              description="Acesse o Catálogo da Nexus Academy para explorar formações de Auditor Líder e normas internacionais e iniciar seus estudos."
              actionLabel="Explorar Catálogo Academy"
              onAction={() => setActiveSubTab('catalogo-academy')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xs hover:border-blue-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Em Andamento
                    </span>
                    <h3 className="text-base font-bold text-white mt-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{course.category}</p>

                    <div className="my-4 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Progresso</span>
                        <span className="font-bold text-blue-400">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700">
                    <PlayCircle className="w-4 h-4 text-blue-400" />
                    <span>Continuar Aulas</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Área do Instrutor */}
      {activeSubTab === 'area-do-instrutor' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                Área do Instrutor & Especialista
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Gerencie seus conteúdos didáticos, turmas e certificações emitidas.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all"
            >
              Criar Novo Treinamento
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <GraduationCap className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">Painel do Instrutor Autorizado Nexus</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Você possui permissão para cadastrar cursos técnicos, trilhas de auditoria e emitir certificados para os alunos matriculados.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              + Publicar Novo Módulo de Ensino
            </button>
          </div>
        </div>
      )}

      {/* Modal: Publicar Novo Curso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Publicar Novo Curso / Academy</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título do Curso</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Auditor Líder ISO 14001:2015"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Norma / Padrão</label>
                  <select
                    value={formData.norm}
                    onChange={(e) => setFormData({ ...formData, norm: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-blue-500 outline-none"
                  >
                    {STANDARD_NORMS.map((n) => (
                      <option key={n.code} value={n.code}>
                        {n.code} - {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Carga Horária (h)</label>
                  <input
                    type="number"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Instrutor Responsável</label>
                  <input
                    type="text"
                    value={formData.instructorName}
                    onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição e Ementa</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes dos módulos, requisitos e objetivos de aprendizagem..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs"
                >
                  Salvar e Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
