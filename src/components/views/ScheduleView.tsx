import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  ListFilter,
  CheckCircle2,
  CalendarDays,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatCard } from '../common/StatCard';
import { EmptyState } from '../common/EmptyState';
import { CalendarEvent } from '../../types';

export const ScheduleView: React.FC = () => {
  const { events, addEvent, deleteEvent } = useData();

  // Toggle Mês / Lista
  const [viewMode, setViewMode] = useState<'mes' | 'lista'>('mes');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'Auditoria' as 'Auditoria' | 'Reunião de Abertura' | 'Follow-up' | 'Treinamento',
    date: '2026-10-15',
    time: '09:00 - 12:00',
    responsible: 'Auditor Líder Nexus',
    status: 'Confirmada' as 'Agendada' | 'Confirmada' | 'Realizada',
    location: 'Sede da Organização',
  });

  // Event stats
  const totalCount = events.length;
  const confirmadasCount = events.filter((e) => e.status === 'Confirmada').length;
  const agendadasCount = events.filter((e) => e.status === 'Agendada').length;
  const realizadasCount = events.filter((e) => e.status === 'Realizada').length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    addEvent(formData);
    setIsModalOpen(false);
    setFormData({
      title: '',
      type: 'Auditoria',
      date: '2026-10-15',
      time: '09:00 - 12:00',
      responsible: 'Auditor Líder Nexus',
      status: 'Confirmada',
      location: 'Sede da Organização',
    });
  };

  // Calendar calculations for October 2026
  const daysInMonth = 31;
  const firstDayIndex = new Date(2026, 9, 1).getDay(); // 4 = Thursday (Sunday=0)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getEventsForDay = (day: number) => {
    const formattedDate = `2026-10-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.date === formattedDate);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Agenda de Auditorias & Eventos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Cronograma executivo de missões em campo, reuniões de abertura e auditorias de certificação.
          </p>
        </div>

        {/* Botão “+ Novo evento” */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Evento</span>
          </button>
        </div>
      </div>

      {/* Cards de estatísticas de eventos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="TOTAL EVENTOS"
          value={totalCount}
          subtitle="Cronograma geral"
          icon={CalendarIcon}
          badge="Out/2026"
          badgeColor="stone"
        />
        <StatCard
          label="CONFIRMADAS"
          value={confirmadasCount}
          subtitle="Missões aprovadas"
          icon={CheckCircle2}
          badge="Prontas"
          badgeColor="green"
        />
        <StatCard
          label="AGENDADAS"
          value={agendadasCount}
          subtitle="Aguardando confirmação"
          icon={Clock}
          badge="Pendentes"
          badgeColor="yellow"
        />
        <StatCard
          label="REALIZADAS"
          value={realizadasCount}
          subtitle="Eventos concluídos"
          icon={CheckCircle2}
          badge="Histórico"
          badgeColor="blue"
        />
      </div>

      {/* Toggle Mês / Lista & Navigation Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/80 text-blue-400 flex items-center justify-center font-bold">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Outubro de 2026
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              31 dias · Mês corrente de auditorias ativas
            </span>
          </div>
        </div>

        {/* Toggle Mês / Lista */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('mes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'mes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => setViewMode('lista')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'lista'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      {/* Calendar Grid or List */}
      {viewMode === 'mes' ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-xs py-2 border-b border-slate-800">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 sm:h-28 bg-slate-950/40 rounded-xl" />
            ))}

            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday = day === 8; // Local date 2026-10-08

              return (
                <div
                  key={day}
                  className={`h-20 sm:h-28 rounded-xl p-1.5 border transition-all flex flex-col justify-between overflow-hidden ${
                    isToday
                      ? 'border-blue-500 bg-blue-950/40 shadow-xs'
                      : 'border-slate-800/80 hover:border-slate-700 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-mono text-[11px]'
                          : 'text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 hidden sm:block" />
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-16 scrollbar-none">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="text-[10px] p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium truncate cursor-pointer transition-colors border border-slate-800"
                        title={`${evt.title} (${evt.time})`}
                      >
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="Nenhum evento agendado"
          description="Não há auditorias ou reuniões marcadas para o mês selecionado. Agende sua primeira atividade no botão abaixo."
          actionLabel="+ Novo evento"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold uppercase leading-none">
                    {new Date(evt.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                  </span>
                  <span className="text-base font-extrabold leading-tight">
                    {evt.date.split('-')[2]}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{evt.title}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        evt.status === 'Confirmada'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                          : evt.status === 'Agendada'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {evt.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {evt.responsible}
                    </span>
                    {evt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {evt.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end sm:border-l border-slate-800 sm:pl-4">
                <button
                  onClick={() => deleteEvent(evt.id)}
                  className="text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: + Novo Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-700 overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base">
                  Novo Evento na Agenda
                </h3>
                <p className="text-xs text-slate-400">
                  Auditorias em campo, fechamentos e treinamentos.
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
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Auditoria de Certificação ISO 9001"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Auditoria">Auditoria</option>
                    <option value="Reunião de Abertura">Reunião de Abertura</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Treinamento">Treinamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Agendada">Agendada</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Realizada">Realizada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Horário
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="09:00 - 17:00"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Responsável
                </label>
                <input
                  type="text"
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Local / Link
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Presencial ou Link Google Meet"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
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
                  Agendar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
