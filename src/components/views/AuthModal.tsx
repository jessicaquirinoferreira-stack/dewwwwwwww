import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  User as UserIcon,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getNexusBrandLogo } from '../../constants/branding';
import { Role } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('auditor');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login, loginWithGoogle, register } = useAuth();
  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onSuccess?.();
          onClose();
        } else {
          setErrorMsg(res.error || 'Credenciais inválidas.');
        }
      } else {
        const res = await register(name, email, password, role);
        if (res.success) {
          onSuccess?.();
          onClose();
        } else {
          setErrorMsg(res.error || 'Erro ao registrar.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro no acesso.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      onSuccess?.();
      onClose();
    } catch (e: any) {
      setErrorMsg('Falha ao conectar com Google.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@x.com');
    setPassword('admin4321');
    setMode('login');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-700/80 overflow-hidden relative p-6 sm:p-8 text-slate-200">
        {/* Back to site link */}
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold mb-6 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Voltar ao site</span>
        </button>

        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shadow-lg shadow-orange-950/20 mb-3 p-1.5">
            <img
              src={getNexusBrandLogo(theme)}
              alt="Nexus Veritas Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="font-brand text-xs font-bold tracking-widest text-white">
            NEXUS VERITAS
          </div>
          <div className="text-[10px] font-semibold text-orange-500 tracking-[0.2em] uppercase">
            CERTIFICATION
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mt-3">
            {mode === 'login' ? 'Ambiente Corporativo' : 'Credenciamento de Conta'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Acesso oficial para auditores líderes, empresas e parceiros.'
              : 'Cadastre sua organização na rede internacional de auditoria.'}
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Botão “Continuar com Google” */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuar com Google</span>
        </button>

        {/* Divisor “OU” */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider text-[10px]">
              OU ACESSO DIRETO
            </span>
          </div>
        </div>

        {/* Form Email e Senha */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo / Razão Social
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Dra. Juliana Santos"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Perfil de Acesso
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('auditor')}
                    className={`py-2 px-3 text-xs rounded-xl font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      role === 'auditor'
                        ? 'bg-orange-500 text-white border-orange-400 shadow-sm shadow-orange-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Auditor Líder</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('empresa')}
                    className={`py-2 px-3 text-xs rounded-xl font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      role === 'empresa'
                        ? 'bg-orange-500 text-white border-orange-400 shadow-sm shadow-orange-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Empresa Cliente</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Corporativo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/30 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading
              ? 'Conectando ao sistema...'
              : mode === 'login'
              ? 'Entrar na Plataforma'
              : 'Concluir Credenciamento'}
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>Preencher credenciais Master Admin (admin@x.com)</span>
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="mt-4 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Ainda não possui credenciais?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className="text-orange-400 hover:text-orange-300 font-bold ml-1 underline"
              >
                Cadastrar agora
              </button>
            </p>
          ) : (
            <p>
              Já possui credencial homologada?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className="text-blue-400 hover:text-blue-300 font-bold ml-1 underline"
              >
                Fazer login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
