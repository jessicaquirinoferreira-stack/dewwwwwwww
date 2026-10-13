import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { Shield, Sparkles, RotateCcw, User, LogOut, Settings, Award, Sun, Moon } from 'lucide-react';

interface HeaderBarProps {
  moduleTitle: string;
  moduleCategory?: string;
  onOpenSettings?: () => void;
  onOpenAdmin?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  moduleTitle,
  moduleCategory = 'PRINCIPAL',
  onOpenSettings,
  onOpenAdmin,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const { seedSampleData, clearAllData, suppliers } = useData();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 py-3.5 transition-colors duration-200 border-b ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
          : 'bg-[#0B132B]/95 border-slate-800 text-slate-100'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Module Indicator & Title */}
        <div className="flex items-center gap-3">
          {/* Executive Active Module Indicator */}
          <div
            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border shadow-xs ${
              theme === 'light'
                ? 'bg-orange-50 border-orange-300 shadow-orange-100'
                : 'bg-orange-950/70 border-orange-500/50 shadow-orange-950/40'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span
              className={`text-[10px] font-bold tracking-wider uppercase font-sans ${
                theme === 'light' ? 'text-orange-700' : 'text-orange-400'
              }`}
            >
              NEXUS · MÓDULO ATIVO
            </span>
          </div>

          <div
            className={`hidden sm:block h-4 w-px ${
              theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'
            }`}
          />

          <div>
            <div
              className={`text-[10px] font-semibold tracking-wider uppercase ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {moduleCategory}
            </div>
            <h1
              className={`text-base sm:text-lg font-bold leading-none tracking-tight ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              {moduleTitle}
            </h1>
          </div>
        </div>

        {/* Action Controls & User Capsule */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Theme Toggle Button in HeaderBar */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs'
            }`}
            title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Tema Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline">Tema Escuro</span>
              </>
            )}
          </button>

          {/* Demo Data / Clear Data Quick Toggle */}
          <div
            className={`hidden md:flex items-center p-1 rounded-xl border text-xs ${
              theme === 'light'
                ? 'bg-slate-100 border-slate-200'
                : 'bg-slate-800/80 border-slate-700'
            }`}
          >
            {suppliers.length === 0 ? (
              <button
                onClick={seedSampleData}
                title="Preencher com registros de teste para visualizar gráficos e fluxos"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Popular Demonstração</span>
              </button>
            ) : (
              <button
                onClick={clearAllData}
                title="Zerar todos os registros e retornar aos Empty States originais"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:text-rose-600 hover:bg-slate-200'
                    : 'text-slate-400 hover:text-rose-400 hover:bg-slate-700'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Zerar (Empty States)</span>
              </button>
            )}
          </div>

          {/* Admin badge if role is admin */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-md shadow-orange-500/20 transition-all border border-orange-400/30 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-orange-100" />
              <span>Painel Master Admin</span>
            </button>
          )}

          {/* User Profile Pill */}
          <div
            className={`flex items-center gap-2 pl-2 sm:border-l ${
              theme === 'light' ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-2 p-1 sm:pr-2.5 rounded-full transition-colors text-left cursor-pointer ${
                theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-800/80'
              }`}
              title="Acessar Configurações e Perfil"
            >
              <div
                className={`w-8 h-8 rounded-full border flex items-center justify-center overflow-hidden font-bold text-xs shadow-xs ${
                  theme === 'light'
                    ? 'bg-orange-100 border-orange-300 text-orange-700'
                    : 'bg-orange-950 border-orange-500/60 text-orange-300'
                }`}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.slice(0, 2).toUpperCase() || 'NV'
                )}
              </div>
              <div className="hidden xl:block">
                <p
                  className={`text-xs font-semibold leading-tight truncate max-w-[110px] ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {user?.name || 'Visitante'}
                </p>
                <span
                  className={`text-[10px] block leading-none ${
                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {user?.role === 'admin' ? 'Administrador' : user?.role === 'auditor' ? 'Auditor Líder' : 'Empresa'}
                </span>
              </div>
            </button>

            <button
              onClick={logout}
              title="Sair da plataforma"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

