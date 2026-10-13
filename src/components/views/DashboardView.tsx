import React from 'react';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Award,
  BarChart3,
  Globe2,
  Calendar,
  Users2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { NavigationTab } from '../layout/Sidebar';
import { StatCard } from '../common/StatCard';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const {
    suppliers,
    audits,
    certificates,
    events,
    actionPlans,
    partners,
  } = useData();

  const homologadosCount = suppliers.filter((s) => s.status === 'Homologado').length;
  const activeAuditsCount = audits.filter((a) => a.status === 'Em Andamento').length;
  const validCertsCount = certificates.filter((c) => c.status === 'Aprovado').length;
  const averageIQF =
    suppliers.length > 0
      ? Math.round(
          suppliers.reduce((acc, curr) => acc + curr.iqfScore, 0) / suppliers.length
        )
      : null;

  return (
    <div
      className={`space-y-6 transition-colors duration-200 ${
        theme === 'light' ? 'text-slate-800' : 'text-slate-200'
      }`}
    >
      {/* Welcome Banner */}
      <div
        className={`border rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
            : 'bg-slate-900/90 border-slate-800 text-white'
        }`}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-600/20 via-amber-600/10 to-transparent rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold mb-3 shadow-xs ${
                theme === 'light'
                  ? 'bg-orange-50 border-orange-300 text-orange-700'
                  : 'bg-orange-950/80 border-orange-500/50 text-orange-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              <span>PAINEL EXECUTIVO DE CONFORMIDADE & IQF</span>
            </div>

            <h1
              className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              Bem-vindo, {user?.name || 'Auditor Líder'}
            </h1>

            <p
              className={`text-xs sm:text-sm mt-2 font-normal leading-relaxed ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Monitore a integridade da sua cadeia de suprimentos crítica, audite requisitos normativos e emita certificações com padrão internacional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('fornecedores')}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Novo Fornecedor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('auditorias')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              Nova Auditoria
            </button>
          </div>
        </div>
      </div>

      {/* Primary 4 Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="FORNECEDORES HOMOLOGADOS"
          value={homologadosCount}
          subtitle={`De ${suppliers.length} cadastrados`}
          icon={Building2}
          badge="Cadeia"
          badgeColor="green"
          onClick={() => onNavigate('fornecedores')}
        />
        <StatCard
          label="AUDITORIAS EM ANDAMENTO"
          value={activeAuditsCount}
          subtitle="Ciclos em execução"
          icon={ClipboardCheck}
          badge="Ativas"
          badgeColor="yellow"
          onClick={() => onNavigate('auditorias')}
        />
        <StatCard
          label="CERTIFICADOS APROVADOS"
          value={validCertsCount}
          subtitle="Selo com QR Code"
          icon={Award}
          badge="Oficiais"
          badgeColor="blue"
          onClick={() => onNavigate('certificados')}
        />
        <StatCard
          label="IQF MÉDIO GLOBAL"
          value={averageIQF !== null ? `${averageIQF}/100` : '--'}
          subtitle="Índice de Qualificação"
          icon={BarChart3}
          badge="Score"
          badgeColor="orange"
          onClick={() => onNavigate('indicadores')}
        />
      </div>

      {/* Grid: Módulos de Acesso Rápido */}
      <div>
        <h2
          className={`text-base font-bold mb-3 ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}
        >
          Módulos Operacionais da Plataforma
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'fornecedores' as NavigationTab, label: 'Portal Fornecedores', icon: Building2, count: suppliers.length },
            { id: 'auditorias' as NavigationTab, label: 'Auditorias', icon: ClipboardCheck, count: audits.length },
            { id: 'planos-de-acao' as NavigationTab, label: 'Planos de Ação', icon: CheckCircle2, count: actionPlans.length },
            { id: 'agenda' as NavigationTab, label: 'Agenda 2026', icon: Calendar, count: events.length },
            { id: 'mapa-mundial' as NavigationTab, label: 'Mapa Mundial', icon: Globe2 },
            { id: 'rede-profissional' as NavigationTab, label: 'Rede de Auditores', icon: Users2 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`border rounded-2xl p-4 text-center shadow-xs transition-all group flex flex-col items-center justify-center text-left cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 hover:border-orange-500 hover:shadow-md'
                    : 'bg-slate-900/80 border-slate-800 hover:border-orange-500/50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors mb-2 border ${
                    theme === 'light'
                      ? 'bg-slate-100 border-slate-200 text-slate-600 group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:bg-orange-950 group-hover:text-orange-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs font-bold leading-tight block truncate max-w-full ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {item.label}
                </span>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] mt-0.5 ${
                      theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {item.count} registro(s)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Audits & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recentes */}
        <div
          className={`border rounded-2xl p-5 sm:p-6 shadow-xs transition-colors ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
              : 'bg-slate-900/80 border-slate-800 text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`font-bold text-base ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              Últimas Auditorias Realizadas
            </h3>
            <button
              onClick={() => onNavigate('auditorias')}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 cursor-pointer"
            >
              Ver todas →
            </button>
          </div>

          {audits.length === 0 ? (
            <div
              className={`text-center py-8 text-xs ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <ClipboardCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p>Nenhuma auditoria iniciada ainda.</p>
              <button
                onClick={() => onNavigate('auditorias')}
                className="mt-2 text-orange-500 font-semibold underline cursor-pointer"
              >
                Criar primeira auditoria
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {audits.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  onClick={() => onNavigate('auditorias')}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between ${
                    theme === 'light'
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900'
                      : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800/80 text-white'
                  }`}
                >
                  <div>
                    <span
                      className={`text-xs font-bold block ${
                        theme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {a.clientName}
                    </span>
                    <span
                      className={`text-[11px] font-mono ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {a.norm} · {a.code}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-blue-500">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximos eventos na Agenda */}
        <div
          className={`border rounded-2xl p-5 sm:p-6 shadow-xs transition-colors ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
              : 'bg-slate-900/80 border-slate-800 text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`font-bold text-base ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              Agenda de Auditorias & Ciclos
            </h3>
            <button
              onClick={() => onNavigate('agenda')}
              className="text-xs font-semibold text-blue-500 hover:text-blue-600 cursor-pointer"
            >
              Ver calendário →
            </button>
          </div>

          {events.length === 0 ? (
            <div
              className={`text-center py-8 text-xs ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p>Nenhum compromisso agendado no momento.</p>
              <button
                onClick={() => onNavigate('agenda')}
                className="mt-2 text-blue-500 font-semibold underline cursor-pointer"
              >
                Agendar evento
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {events.slice(0, 3).map((e) => (
                <div
                  key={e.id}
                  onClick={() => onNavigate('agenda')}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between ${
                    theme === 'light'
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900'
                      : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800/80 text-white'
                  }`}
                >
                  <div>
                    <span
                      className={`text-xs font-bold block ${
                        theme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {e.title}
                    </span>
                    <span
                      className={`text-[11px] ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {e.date} · {e.time}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-500">{e.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
