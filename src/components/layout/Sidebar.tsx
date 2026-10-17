import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Globe2,
  ClipboardCheck,
  Calendar,
  CheckSquare,
  BarChart3,
  Award,
  FileText,
  Users2,
  BookOpen,
  GraduationCap,
  Layers,
  UserCheck,
  HeadphonesIcon,
  ShieldCheck,
  Settings,
  Sparkles,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export type NavigationTab =
  | 'painel'
  | 'fornecedores'
  | 'mapa-mundial'
  | 'auditorias'
  | 'agenda'
  | 'planos-de-acao'
  | 'indicadores'
  | 'certificados'
  | 'analise-tecnica-aprovacoes'
  | 'documentos'
  | 'rede-profissional'
  | 'revista'
  | 'meus-cursos'
  | 'catalogo-academy'
  | 'area-do-instrutor'
  | 'fala-com-corpo-tecnico'
  | 'configuracoes-perfil'
  | 'admin-panel';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onOpenLanding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  onOpenAdmin,
  onOpenLanding,
}) => {
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();

  const userRole = user?.role || 'empresa';

  const sections = [
    {
      label: 'PRINCIPAL',
      items: [
        { id: 'painel' as NavigationTab, label: 'Painel', icon: LayoutDashboard, roles: ['master', 'admin', 'auditor', 'empresa', 'colaborador'] },
        { id: 'fornecedores' as NavigationTab, label: 'Fornecedores', icon: Building2, roles: ['master', 'admin', 'auditor', 'empresa'] },
        { id: 'mapa-mundial' as NavigationTab, label: 'Mapa Mundial', icon: Globe2, roles: ['master', 'admin', 'auditor'] },
        { id: 'auditorias' as NavigationTab, label: 'Auditorias', icon: ClipboardCheck, roles: ['master', 'admin', 'auditor', 'empresa'] },
      ].filter((item) => item.roles.includes(userRole)),
    },
    {
      label: 'GESTÃO',
      items: [
        { id: 'agenda' as NavigationTab, label: 'Agenda', icon: Calendar, roles: ['master', 'admin', 'auditor', 'empresa', 'colaborador'] },
        { id: 'planos-de-acao' as NavigationTab, label: 'Planos de ação', icon: CheckSquare, roles: ['master', 'admin', 'auditor', 'empresa', 'colaborador'] },
        { id: 'indicadores' as NavigationTab, label: 'Indicadores', icon: BarChart3, roles: ['master', 'admin', 'auditor', 'empresa'] },
        { id: 'certificados' as NavigationTab, label: 'Certificados', icon: Award, roles: ['master', 'admin', 'auditor', 'empresa'] },
        { id: 'analise-tecnica-aprovacoes' as NavigationTab, label: 'Análise Técnica', icon: ShieldCheck, roles: ['master', 'admin', 'auditor'] },
        { id: 'documentos' as NavigationTab, label: 'Documentos SGQ', icon: FileText, roles: ['master', 'admin', 'auditor', 'empresa', 'colaborador'] },
        { id: 'rede-profissional' as NavigationTab, label: 'Rede profissional', icon: Users2, roles: ['master', 'admin', 'auditor', 'empresa'] },
        { id: 'revista' as NavigationTab, label: 'Revista', icon: BookOpen, roles: ['master', 'admin', 'auditor', 'empresa'] },
      ].filter((item) => item.roles.includes(userRole)),
    },
    {
      label: 'ACADEMY',
      items: [
        { id: 'meus-cursos' as NavigationTab, label: 'Meus cursos', icon: GraduationCap, roles: ['master', 'admin', 'auditor', 'empresa', 'instrutor'] },
        { id: 'catalogo-academy' as NavigationTab, label: 'Catálogo Academy', icon: Layers, roles: ['master', 'admin', 'auditor', 'empresa', 'instrutor'] },
        { id: 'area-do-instrutor' as NavigationTab, label: 'Área do instrutor', icon: UserCheck, roles: ['master', 'admin', 'instrutor'] },
      ].filter((item) => item.roles.includes(userRole)),
    },
    {
      label: 'SUPORTE',
      items: [
        { id: 'fala-com-corpo-tecnico' as NavigationTab, label: 'Fala com Corpo Técnico', icon: HeadphonesIcon, roles: ['master', 'admin', 'auditor', 'empresa', 'colaborador'] },
      ].filter((item) => item.roles.includes(userRole)),
    },
  ].filter((sec) => sec.items.length > 0);

  return (
    <aside
      className={`w-64 flex flex-col h-screen shrink-0 sticky top-0 z-40 select-none shadow-sm transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-white border-r border-slate-200 text-slate-800'
          : 'bg-[#0B132B] border-r border-slate-800 text-slate-200'
      }`}
    >
      {/* Brand Logo Header */}
      <div
        className={`p-5 flex items-center justify-between border-b transition-colors ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800/80'
        }`}
      >
        <button
          onClick={onOpenLanding}
          className="flex items-center gap-3 text-left group cursor-pointer"
          title="Ver Landing Page da Nexus Veritas"
        >
          {/* Official Logo with transparent background */}
          <div className="w-12 h-12 rounded-xl bg-transparent flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden p-0.5">
            <img
              src="https://i.postimg.cc/zvWspM3H/Chat-GPT-Image-8-de-out-de-2026-18-07-55.png"
              alt="Nexus Veritas Logo"
              className="w-full h-full object-contain drop-shadow"
            />
          </div>

          <div>
            <div
              className={`font-brand text-[13px] font-extrabold leading-none tracking-wider ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              NEXUS VERITAS
            </div>
            <div className="text-[9px] font-bold text-orange-500 tracking-[0.18em] uppercase leading-tight mt-0.5">
              CERTIFICATION
            </div>
          </div>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
        {sections.map((section) => (
          <div key={section.label}>
            <div
              className={`px-3 mb-2 text-[10px] font-bold tracking-wider uppercase font-sans ${
                theme === 'light' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {section.label}
            </div>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold shadow-md shadow-orange-500/25'
                        : theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive
                          ? 'text-white'
                          : theme === 'light'
                          ? 'text-slate-400 group-hover:text-slate-700'
                          : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Master Admin Section if user is admin */}
        {isAdmin && (
          <div
            className={`pt-2 border-t ${
              theme === 'light' ? 'border-slate-200' : 'border-slate-800/80'
            }`}
          >
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-orange-500 uppercase font-sans">
              ADMINISTRAÇÃO
            </div>
            <button
              onClick={onOpenAdmin}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'admin-panel'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : theme === 'light'
                  ? 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                  : 'text-slate-300 hover:bg-slate-800/80 border border-slate-700/60'
              }`}
            >
              <Shield className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Painel Master Admin</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer User Profile (Exact requirement: avatar circular + nome do usuário + email legível) */}
      <div
        className={`p-3 border-t transition-colors ${
          theme === 'light' ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800/80 bg-slate-950/50'
        }`}
      >
        <div
          onClick={onOpenSettings}
          className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer group ${
            theme === 'light'
              ? 'hover:bg-slate-100/80 border-transparent hover:border-slate-200'
              : 'hover:bg-slate-800/60 border-transparent hover:border-slate-700/80'
          }`}
          title="Clique para editar seu perfil e configurações"
        >
          {/* Avatar circular */}
          <div
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden shrink-0 font-bold text-xs shadow-xs ${
              theme === 'light'
                ? 'bg-orange-100 border-orange-400 text-orange-700'
                : 'bg-orange-950 border-orange-500/60 text-orange-300'
            }`}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.slice(0, 2).toUpperCase() || 'NV'
            )}
          </div>

          {/* Nome do usuário + email legível */}
          <div className="flex-1 min-w-0">
            <div
              className={`text-xs font-bold truncate leading-tight transition-colors ${
                theme === 'light'
                  ? 'text-slate-900 group-hover:text-orange-600'
                  : 'text-white group-hover:text-orange-400'
              }`}
            >
              {user?.name || 'Visitante Nexus'}
            </div>
            <div
              className={`text-[11px] truncate leading-tight select-all font-mono ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {user?.email || 'contato@nexusveritas.com'}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            className={`p-1 rounded-lg shrink-0 transition-colors ${
              theme === 'light'
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                : 'text-slate-500 hover:text-white hover:bg-slate-800'
            }`}
            title="Configurações"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
