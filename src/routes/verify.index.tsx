import React from 'react';
import { PublicCertificateValidator } from '../components/common/PublicCertificateValidator';
import { ShieldCheck, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getNexusBrandLogo } from '../constants/branding';

interface VerifyIndexRouteProps {
  initialNumber?: string;
  onBackToHome?: () => void;
  onEnterPlatform?: () => void;
}

export const VerifyIndexRoute: React.FC<VerifyIndexRouteProps> = ({
  initialNumber,
  onBackToHome,
  onEnterPlatform,
}) => {
  const { theme, toggleTheme } = useTheme();

  // Extract certificate number from URL if present (e.g. /verify/NV-2026-00001 or ?number=... or ?verify=...)
  const certFromUrl = React.useMemo(() => {
    if (initialNumber) return initialNumber;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const queryVal = searchParams.get('number') || searchParams.get('verify') || searchParams.get('cert');
      if (queryVal) return queryVal;

      const pathname = window.location.pathname;
      if (pathname.includes('/verify/')) {
        const parts = pathname.split('/verify/');
        return parts[1]?.trim() || '';
      }
    } catch {
      // ignore
    }
    return '';
  }, [initialNumber]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-slate-50 text-slate-900'
          : 'bg-[#0A0E17] text-white selection:bg-orange-500 selection:text-white'
      }`}
    >
      {/* Top Header */}
      <header
        className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl ${
          theme === 'light'
            ? 'bg-white/90 border-slate-200'
            : 'bg-[#0B0F1A]/90 border-white/[0.08]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBackToHome ? (
              <button
                type="button"
                onClick={onBackToHome}
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-orange-400" />
                <span>Voltar ao início</span>
              </button>
            ) : (
              <a
                href="/"
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-orange-400" />
                <span>Página Inicial</span>
              </a>
            )}

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <img
                src={getNexusBrandLogo(theme)}
                alt="Nexus Veritas Logo"
                className="h-7 w-auto object-contain"
              />
              <span className="font-brand text-xs sm:text-sm font-extrabold tracking-wider hidden sm:inline">
                NEXUS VERITAS <span className="text-orange-500">CERTIFICATION</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-900 border-white/[0.1] text-amber-400'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}
              title="Alternar tema claro/escuro"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {onEnterPlatform && (
              <button
                onClick={onEnterPlatform}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 hover:bg-orange-500/30 transition-all cursor-pointer"
              >
                Acessar Plataforma
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <PublicCertificateValidator initialNumber={certFromUrl} />
      </main>

      {/* Footer */}
      <footer
        className={`py-8 text-center text-xs border-t ${
          theme === 'light'
            ? 'bg-slate-100 border-slate-200 text-slate-500'
            : 'bg-[#060910] border-white/[0.08] text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Nexus Veritas Certification S.A. Portal Oficial de Consulta Pública e Acreditação.</p>
          <p className="mt-1 text-[11px] text-slate-600">
            Assinatura Digital SHA-256 e Conformidade Regulatória ISO/IEC 17021-1 & IAF MLA.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VerifyIndexRoute;
