import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Users2,
  Globe2,
  FileCheck2,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  Lock,
  Leaf,
  HeartPulse,
  Car,
  Utensils,
  FileKey,
  CheckSquare,
  Building2,
  Search,
  Sparkles,
  X,
  ChevronRight,
  Cpu,
  Zap,
  Sun,
  Moon,
  TrendingUp,
  Menu
} from 'lucide-react';
import { STANDARD_NORMS } from '../../data/initialData';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { Partner } from '../../types';
import { NexusHero3D } from '../common/NexusHero3D';
import { getNexusBrandLogo } from '../../constants/branding';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onEnterPlatform: () => void;
}

// Hook for high-precision, smooth count-up animation with easeOutExpo
const useCounter = (end: number, duration: number = 2200, trigger: boolean = true) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo curve for buttery smooth deceleration
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setVal(Math.floor(eased * end));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [end, duration, trigger]);

  return val;
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterPlatform,
}) => {
  const { landingContent, partners } = useData();
  const { theme, toggleTheme } = useTheme();

  // Scroll state for sticky header height transition and orange progress bar
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress(totalScroll > 0 ? (currentScroll / totalScroll) * 100 : 0);
      setIsScrolled(currentScroll > 24);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3D Card Interactive Tilt State
  const [cardTilt, setCardTilt] = useState<{ rotateX: number; rotateY: number }>({ rotateX: 0, rotateY: 0 });
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 14; // tilt angle
    const rotateX = ((y / rect.height) - 0.5) * -14;
    setCardTilt({ rotateX, rotateY });
  };
  const handleCardMouseLeave = () => {
    setCardTilt({ rotateX: 0, rotateY: 0 });
  };

  // Animated Count-up Numbers
  const countSuppliers = useCounter(18400, 2400, true);
  const countTraceability = useCounter(100, 1800, true);

  // Selected partner modal state
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [searchPartner, setSearchPartner] = useState<string>('');

  // Interactive Card state for technological skills / motion
  const [activeCardTab, setActiveCardTab] = useState<'cert' | 'audit' | 'qr'>('cert');

  const normIcons: Record<string, any> = {
    'ISO 9001': ShieldCheck,
    'ISO 14001': Leaf,
    'ISO 45001': HeartPulse,
    'ISO 27001': Lock,
    'FSSC 22000': Utensils,
    'IATF 16949': Car,
    'ESG': Globe2,
    'LGPD': FileKey,
    'GMP': CheckSquare,
    'BRC': Award,
  };

  const capabilities = [
    {
      num: '01',
      title: 'Portal de Qualificação & IQF Automatizado',
      desc: 'Cálculo analítico do Índice de Qualificação de Fornecedores com ponderação dinâmica por criticidade e matriz de risco regulatório.',
      icon: Layers,
    },
    {
      num: '02',
      title: 'Auditorias de 1ª, 2ª e 3ª Partes',
      desc: 'Checklists digitais multinorma com registro instantâneo de não conformidades, relatórios fotográficos e trilha de auditoria inviolável.',
      icon: FileCheck2,
    },
    {
      num: '03',
      title: 'Certificados Digitais com Validação QR Code',
      desc: 'Emissão oficial de certificados criptograficamente rastreáveis com link público de autenticidade instantânea contra adulterações.',
      icon: Award,
    },
    {
      num: '04',
      title: 'Planos de Ação 5W2H & Metodologia CAPA',
      desc: 'Fluxo estruturado de tratamento de causa raiz, contenção e verificação de eficácia de ações corretivas com prazos contratuais.',
      icon: CheckCircle2,
    },
    {
      num: '05',
      title: 'Corpo Técnico & Auditores Líderes IRCA',
      desc: 'Corpo técnico sênior homologado para atendimento de demandas complexas em sistemas de gestão integrados em âmbito nacional.',
      icon: Users2,
    },
    {
      num: '06',
      title: 'Nexus Academy & Capacitação Executiva',
      desc: 'Capacitação contínua para gestores da qualidade, auditores internos e líderes industriais com metodologia prática de conformidade.',
      icon: ShieldCheck,
    },
  ];

  // Headline words for fluid word-by-word reveal
  const titleWords = [
    { text: 'Conformidade', highlight: false },
    { text: 'que', highlight: false },
    { text: 'gera', highlight: false },
    { text: 'confiança.', highlight: false },
    { text: 'Inteligência', highlight: true },
    { text: 'que', highlight: true },
    { text: 'impulsiona', highlight: true },
    { text: 'resultados.', highlight: true },
  ];

  // Filter partners
  const activePartners = partners.filter((p) => p.isActive !== false);

  const filteredPartners = activePartners.filter((p) => {
    const matchesSector =
      selectedSector === 'all' ||
      (selectedSector === 'energia' && (p.category.toLowerCase().includes('energia') || p.category.toLowerCase().includes('petróleo'))) ||
      (selectedSector === 'aero' && p.category.toLowerCase().includes('aero')) ||
      (selectedSector === 'mineracao' && (p.category.toLowerCase().includes('minera') || p.category.toLowerCase().includes('siderurg') || p.category.toLowerCase().includes('metal'))) ||
      (selectedSector === 'automacao' && (p.category.toLowerCase().includes('auto') || p.category.toLowerCase().includes('elétr'))) ||
      (selectedSector === 'alimentos' && (p.category.toLowerCase().includes('alimento') || p.category.toLowerCase().includes('bio') || p.category.toLowerCase().includes('papel'))) ||
      (selectedSector === 'tech' && (p.category.toLowerCase().includes('tecno') || p.category.toLowerCase().includes('infra') || p.category.toLowerCase().includes('esg')));

    const matchesSearch =
      searchPartner === '' ||
      p.name.toLowerCase().includes(searchPartner.toLowerCase()) ||
      (p.tradeName && p.tradeName.toLowerCase().includes(searchPartner.toLowerCase())) ||
      p.norm.toLowerCase().includes(searchPartner.toLowerCase()) ||
      p.category.toLowerCase().includes(searchPartner.toLowerCase());

    return matchesSector && matchesSearch;
  });

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'light' ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0A0E17] text-[#F8FAFC]'
      } selection:bg-orange-500 selection:text-white`}
    >
      {/* 1. Thin Orange Scroll Progress Bar with Gradient Glow */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[70] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 transition-all duration-75 shadow-xs shadow-orange-500/50"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Sticky Header with Height Transition, Glassmorphism, Official Logo and Theme Switcher */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 border-b ${
          isScrolled ? 'h-16 shadow-lg' : 'h-20 shadow-xs'
        } ${
          theme === 'light'
            ? 'bg-white/85 border-slate-200/90 shadow-slate-200/40'
            : 'bg-[#0A0E17]/85 border-white/[0.08] shadow-black/40'
        }`}
      >
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 h-full flex items-center justify-between gap-4">
          {/* Brand Logo & Wordmark - Anchored to the far left, away from the menu */}
          <a
            href="/"
            className="flex items-center gap-3 sm:gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg shrink-0 mr-auto lg:mr-8 xl:mr-14"
          >
            <div className="relative flex items-center justify-center overflow-visible shrink-0">
              <img
                src={getNexusBrandLogo(theme)}
                alt="Nexus Veritas Logo Oficial"
                className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                style={{ filter: theme === 'light' ? 'none' : 'drop-shadow(0 0 10px rgba(249,115,22,0.25))' }}
              />
            </div>
            <div className="shrink-0">
              <span
                className={`font-brand text-xs sm:text-base font-extrabold tracking-wider block leading-none transition-colors ${
                  theme === 'light' ? 'text-slate-900 group-hover:text-orange-600' : 'text-white group-hover:text-orange-400'
                }`}
              >
                NEXUS VERITAS
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-orange-500 tracking-[0.22em] uppercase leading-tight block mt-0.5">
                CERTIFICATION
              </span>
            </div>
          </a>

          {/* Clean Navigation Links with Subtle Underline & Hover Colors */}
          <nav
            className={`hidden xl:flex items-center gap-4 2xl:gap-6 text-xs font-medium shrink-0 ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            <a
              href="#recursos"
              className="hover:text-orange-500 transition-colors py-1 hover:underline underline-offset-4 decoration-orange-500 whitespace-nowrap"
            >
              Recursos
            </a>
            <a
              href="#parceiros"
              className="hover:text-orange-500 transition-colors py-1 hover:underline underline-offset-4 decoration-orange-500 whitespace-nowrap"
            >
              Rede & Agenda
            </a>
            <a
              href="#normas"
              className="hover:text-orange-500 transition-colors py-1 hover:underline underline-offset-4 decoration-orange-500 whitespace-nowrap"
            >
              Auditorias
            </a>
            <a
              href="#capacidades"
              className="hover:text-orange-500 transition-colors py-1 hover:underline underline-offset-4 decoration-orange-500 whitespace-nowrap"
            >
              Como funciona
            </a>
            <a
              href="#faq"
              className="hover:text-orange-500 transition-colors py-1 hover:underline underline-offset-4 decoration-orange-500 whitespace-nowrap"
            >
              FAQ
            </a>
            <button
              onClick={() => {
                window.history.pushState({}, '', '/verify');
                window.location.reload();
              }}
              className="text-orange-500 hover:text-orange-400 font-bold transition-colors py-1 hover:underline underline-offset-4 decoration-orange-500 cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Validar Certificado</span>
            </button>
            <button
              onClick={onEnterPlatform}
              className="text-orange-500 hover:text-orange-400 font-bold transition-colors py-1 hover:underline underline-offset-4 decoration-orange-500 cursor-pointer whitespace-nowrap"
            >
              Academy
            </button>
            <button
              onClick={onEnterPlatform}
              className="text-orange-500 hover:text-orange-400 font-bold transition-colors py-1 hover:underline underline-offset-4 decoration-orange-500 cursor-pointer whitespace-nowrap"
            >
              Revista
            </button>
          </nav>

          {/* Action Controls & Theme Toggle Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-xs ${
                theme === 'dark'
                  ? 'bg-[#111827]/90 text-amber-400 border-white/[0.1] hover:bg-[#1E293B] hover:border-amber-400/40'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
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

            <button
              onClick={() => onOpenAuth('login')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-700 hover:text-orange-600 hover:bg-slate-100'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              Entrar
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              className="relative group overflow-hidden px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:animate-sheen-slide pointer-events-none" />
              <span>Começar agora</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            {/* Mobile / Tablet Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`xl:hidden p-2 rounded-xl border transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Menu de Navegação"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Menu */}
        {isMobileMenuOpen && (
          <div
            className={`xl:hidden border-b px-4 py-4 space-y-2 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 ${
              theme === 'light' ? 'bg-white/95 border-slate-200 shadow-lg' : 'bg-[#0A0E17]/95 border-slate-800 shadow-2xl'
            }`}
          >
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <a
                href="#recursos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
              >
                Recursos
              </a>
              <a
                href="#parceiros"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
              >
                Rede & Agenda
              </a>
              <a
                href="#normas"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
              >
                Auditorias
              </a>
              <a
                href="#capacidades"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
              >
                Como funciona
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
              >
                FAQ
              </a>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.history.pushState({}, '', '/verify');
                  window.location.reload();
                }}
                className="p-2.5 rounded-lg text-left text-orange-500 hover:bg-orange-500/10 font-bold transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Validar Certificado</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onEnterPlatform();
                }}
                className="p-2.5 rounded-lg text-left text-orange-500 hover:bg-orange-500/10 font-bold transition-colors"
              >
                Academy
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onEnterPlatform();
                }}
                className="p-2.5 rounded-lg text-left text-orange-500 hover:bg-orange-500/10 font-bold transition-colors"
              >
                Revista
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section with Animated Mesh Gradient, Moving Dot Grid, Word Reveal, 3D Certificate Card & Stats */}
      <section
        className={`relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden transition-colors duration-300 ${
          theme === 'light'
            ? 'bg-gradient-to-b from-slate-50 via-white to-amber-50/20'
            : 'bg-mesh-gradient bg-gradient-to-b from-[#0A0E17] via-[#0D1322] to-[#0B0F1A]'
        }`}
      >
        {/* Interactive 3D WebGL Background - Nexus Quality Core & Gyroscope Orbitals */}
        <NexusHero3D />

        {/* Subtle Warm Mesh Glows (Softened for greater transparency) */}
        <div className="absolute right-0 top-1/4 w-[650px] h-[650px] bg-gradient-to-tl from-orange-600/8 via-amber-600/4 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 top-10 w-[450px] h-[450px] bg-blue-900/8 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Animated Drifting Dot Grid Pattern */}
        <div className={`absolute inset-0 pointer-events-none ${theme === 'light' ? 'opacity-10' : 'opacity-12'}`}>
          <svg className="w-full h-full animate-grid-drift" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="moving-dots" width="48" height="48" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#F97316" fillOpacity={theme === 'light' ? '0.25' : '0.18'} />
                <circle cx="26" cy="26" r="1.1" fill="#F59E0B" fillOpacity={theme === 'light' ? '0.2' : '0.15'} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#moving-dots)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Column: Headline with Word-by-Word Reveal, Subtitle, Sheen CTAs & Animated Count-up Stats */}
            <div className="lg:col-span-7 text-left">
              {/* Badge: Conectando confiança à conformidade */}
              <div className="space-y-3 mb-6">
                <div
                  className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wider backdrop-blur-md shadow-xs ${
                    theme === 'light'
                      ? 'bg-orange-50/80 border-orange-200 text-orange-700'
                      : 'bg-[#111827]/90 border-orange-500/30 text-orange-400'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  <Shield className="w-3.5 h-3.5 text-orange-500" />
                  <span>{landingContent.badgeText || 'CERTIFICAÇÃO · AUDITORIA · CONFORMIDADE'}</span>
                </div>

                {/* ISO Badges Pill Row as in reference image */}
                <div className="flex items-center gap-2 flex-wrap">
                  {['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 31000'].map((iso) => (
                    <div
                      key={iso}
                      className={`px-3.5 py-1 rounded-full text-xs font-bold tracking-wide border shadow-xs transition-all ${
                        theme === 'light'
                          ? 'bg-white border-slate-300 text-slate-700 hover:border-orange-500 hover:text-orange-600'
                          : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-orange-500 hover:text-orange-400'
                      }`}
                    >
                      {iso}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dominant Headline with Staggered Word-by-Word Blur Reveal */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.14] mb-6 flex flex-wrap items-center">
                {titleWords.map((word, idx) => (
                  <span
                    key={idx}
                    className={`inline-block mr-[0.28em] mb-1 transition-all ${
                      word.highlight
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600'
                        : theme === 'light'
                        ? 'text-slate-900'
                        : 'text-white'
                    }`}
                    style={{
                      animation: `blur-in-reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 85}ms both`,
                    }}
                  >
                    {word.text}
                  </span>
                ))}
              </h1>

              {/* Subtitle with High Contrast & Legibility */}
              <p
                className={`text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-normal ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                A Nexus Veritas integra conhecimento técnico, auditorias, sistemas de gestão e tecnologia para ajudar organizações a fortalecer seus processos, gerenciar riscos, avaliar fornecedores e evoluir continuamente.
              </p>

              {/* Action Buttons with Sliding Sheen & Arrow Micro-interaction */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="relative group overflow-hidden inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-bold shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 whitespace-nowrap cursor-pointer"
                >
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:animate-sheen-slide pointer-events-none" />
                  <span>Criar conta gratuita</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
                </button>

                <a
                  href="#recursos"
                  className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer backdrop-blur-md ${
                    theme === 'light'
                      ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs'
                      : 'bg-[#111827]/80 hover:bg-[#1E293B] text-slate-200 border border-white/[0.1] hover:border-orange-500/40 shadow-lg'
                  }`}
                >
                  <span>Ver recursos</span>
                </a>
              </div>

              {/* Stats with Animated Count-up Numbers & Luminous Sweep Line */}
              <div
                className={`mt-10 pt-6 border-t grid grid-cols-3 gap-6 text-left ${
                  theme === 'light' ? 'border-slate-200' : 'border-white/[0.08]'
                }`}
              >
                <div>
                  <div
                    className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight flex items-baseline gap-1 ${
                      theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    <span>+{countSuppliers.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className={`text-xs font-medium mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Empresas Monitoradas
                  </div>
                  {/* Subtle sweep line */}
                  <div className="relative h-0.5 w-full bg-slate-800/40 mt-2.5 overflow-hidden rounded-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-stat-sweep" />
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-orange-500 tabular-nums tracking-tight">
                    {countTraceability}%
                  </div>
                  <div className={`text-xs font-medium mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Rastreabilidade Digital
                  </div>
                  {/* Subtle sweep line */}
                  <div className="relative h-0.5 w-full bg-slate-800/40 mt-2.5 overflow-hidden rounded-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-stat-sweep" />
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 tabular-nums tracking-tight flex items-center gap-1.5">
                    <span>ISO · ESG</span>
                    <Globe2 className="w-4 h-4 text-amber-400 animate-icon-pulse inline-block" />
                  </div>
                  <div className={`text-xs font-medium mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Acreditação Global
                  </div>
                  {/* Subtle sweep line */}
                  <div className="relative h-0.5 w-full bg-slate-800/40 mt-2.5 overflow-hidden rounded-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-stat-sweep" />
                  </div>
                </div>
              </div>

              {/* Skills & Capacidades em Tempo Real Strip */}
              <div
                className={`mt-8 pt-5 border-t ${
                  theme === 'light' ? 'border-slate-200' : 'border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold tracking-wider text-orange-500 uppercase flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                    <span>SKILLS & CAPACIDADES EM TEMPO REAL</span>
                  </span>
                  <span className="text-[10px] text-emerald-500 font-mono font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>SISTEMA ATIVO</span>
                  </span>
                </div>

                {/* Animated Marquee of Tech Badges */}
                <div
                  className={`relative overflow-hidden py-1.5 rounded-xl backdrop-blur-md ${
                    theme === 'light'
                      ? 'bg-white/80 border border-slate-200 shadow-xs'
                      : 'bg-[#111827]/70 border border-white/[0.08]'
                  }`}
                >
                  <div className="animate-tech-marquee flex items-center gap-2.5 whitespace-nowrap py-1">
                    {[
                      { icon: Award, label: 'ISO 9001 · SGQ', score: '95%' },
                      { icon: Globe2, label: 'ISO 14001 · SGA', score: '90%' },
                      { icon: ShieldCheck, label: 'ISO 45001 · SSO', score: '93%' },
                      { icon: Users2, label: 'Auditor Líder IRCA', score: 'Certificado' },
                      { icon: Sparkles, label: 'QR Code Rastreável', score: 'SHA-256' },
                      { icon: Cpu, label: 'IA Evidências Digitais', score: '100% Conforme' },
                      { icon: Building2, label: 'Homologação IQF', score: 'Score 92' },
                      // Duplicate for infinite continuous flow
                      { icon: Award, label: 'ISO 9001 · SGQ', score: '95%' },
                      { icon: Globe2, label: 'ISO 14001 · SGA', score: '90%' },
                      { icon: ShieldCheck, label: 'ISO 45001 · SSO', score: '93%' },
                      { icon: Users2, label: 'Auditor Líder IRCA', score: 'Certificado' },
                      { icon: Sparkles, label: 'QR Code Rastreável', score: 'SHA-256' },
                      { icon: Cpu, label: 'IA Evidências Digitais', score: '100% Conforme' },
                      { icon: Building2, label: 'Homologação IQF', score: 'Score 92' },
                    ].map((skill, idx) => {
                      const IconComponent = skill.icon;
                      return (
                        <div
                          key={idx}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-xs hover:border-orange-400 transition-all cursor-default shrink-0 ${
                            theme === 'light'
                              ? 'bg-white border-slate-200 text-slate-800'
                              : 'bg-[#0F172A]/90 border-white/[0.08] text-slate-200 hover:border-orange-500/50'
                          }`}
                        >
                          <IconComponent className="w-3.5 h-3.5 text-orange-500" />
                          <span>{skill.label}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              theme === 'light'
                                ? 'bg-orange-50 text-orange-700'
                                : 'bg-orange-950/80 text-orange-300 border border-orange-500/30'
                            }`}
                          >
                            {skill.score}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Certificate Card with 3D Tilt, Rotating Border Beam, and Breathing Glow */}
            <div className="lg:col-span-5 relative perspective-1000">
              {/* Floating Tech Badge 1 (SHA-256) */}
              <div
                className={`absolute -top-4 -right-2 z-30 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-xl backdrop-blur-md animate-subtle-float ${
                  theme === 'light'
                    ? 'bg-white border-emerald-400 text-emerald-800 shadow-emerald-100'
                    : 'bg-[#111827]/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/60'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>QR Code Validado · SHA-256</span>
              </div>

              {/* Floating Tech Badge 2 (Audit Trace) */}
              <div
                className={`absolute -bottom-4 -left-3 z-30 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-xl backdrop-blur-md animate-tech-float-reverse ${
                  theme === 'light'
                    ? 'bg-white border-orange-400 text-orange-800 shadow-orange-100'
                    : 'bg-[#111827]/95 border-orange-500/40 text-orange-300 shadow-orange-950/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                <span>Trilha de Auditoria 100% Concluída</span>
              </div>

              {/* Interactive 3D Tilt Wrapper */}
              <div
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                style={{
                  transform: `rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="relative cursor-pointer group"
              >
                {/* Breathing Soft Orange Glow Halo */}
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-[32px] blur-2xl opacity-40 group-hover:opacity-75 transition-all duration-700 animate-breath-glow" />

                {/* Rotating Conic Border Beam Wrapper (Linear/Vercel standard) */}
                <div className="relative rounded-3xl p-[1.5px] overflow-hidden shadow-2xl">
                  <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_260deg,#F97316_310deg,#EA580C_360deg)] animate-border-beam pointer-events-none" />

                  {/* Main Card Content */}
                  <div className="relative bg-white rounded-[23px] p-6 sm:p-7 text-slate-900 overflow-hidden transform-style-3d">
                    {/* Subtle Tech Scanner Beam */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-90" />

                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-6">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30">
                          <Award className="w-6 h-6 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight truncate">
                            Certificado NVC-Q-2024-0142
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium truncate mt-0.5">
                            ABC Soluções Industriais Ltda.
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Qualificado
                      </span>
                    </div>

                    {/* 3 Metric Summary Boxes */}
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-left">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          PONTUAÇÃO
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-orange-500 leading-none">
                          92%
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-left">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          RISCO
                        </div>
                        <div className="text-base sm:text-lg font-bold text-slate-900 leading-none mt-1">
                          Baixo
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-left">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          VALIDADE
                        </div>
                        <div className="text-base sm:text-lg font-bold text-slate-900 leading-none mt-1">
                          12m
                        </div>
                      </div>
                    </div>

                    {/* 4 Compliance Progress Bars */}
                    <div className="space-y-4 mb-6 text-left">
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                          <span>Gestão da Qualidade</span>
                          <span className="font-bold text-slate-900">95%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-xs transition-all duration-1000 relative"
                            style={{ width: '95%' }}
                          >
                            <div className="absolute inset-0 bg-white/25 animate-tech-scan" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                          <span>Gestão Ambiental</span>
                          <span className="font-bold text-slate-900">90%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-xs transition-all duration-1000 relative"
                            style={{ width: '90%' }}
                          >
                            <div className="absolute inset-0 bg-white/25 animate-tech-scan" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                          <span>Saúde e Segurança</span>
                          <span className="font-bold text-slate-900">93%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-xs transition-all duration-1000 relative"
                            style={{ width: '93%' }}
                          >
                            <div className="absolute inset-0 bg-white/25 animate-tech-scan" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                          <span>Conformidade Legal</span>
                          <span className="font-bold text-slate-900">92%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-xs transition-all duration-1000 relative"
                            style={{ width: '92%' }}
                          >
                            <div className="absolute inset-0 bg-white/25 animate-tech-scan" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Triggers */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveCardTab('cert')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            activeCardTab === 'cert'
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          NVC-Q Ativo
                        </button>
                        <button
                          onClick={() => setActiveCardTab('audit')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            activeCardTab === 'audit'
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Trilha ISO
                        </button>
                        <button
                          onClick={() => setActiveCardTab('qr')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            activeCardTab === 'qr'
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          QR Code
                        </button>
                      </div>

                      <button
                        onClick={onEnterPlatform}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group/btn"
                      >
                        <span>Auditar</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: RECURSOS TECNOLÓGICOS (Cards with Stagger, Glassmorphism & Hover Glow Elevation) */}
      <section
        id="recursos"
        className={`py-24 border-y relative transition-colors duration-300 ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#0B0F1A] border-white/[0.08] text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-orange-500 tracking-widest uppercase flex items-center justify-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>RECURSOS TECNOLÓGICOS INTEGRADOS</span>
            </span>
            <h2
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-2.5 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              Gestão Multinorma com Rastreabilidade Instantânea
            </h2>
            <p className={`text-sm sm:text-base mt-3 font-normal ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Fluxos de ponta a ponta: do cadastro analítico de fornecedores à validação de certificados com assinatura digital criptografada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.num}
                  style={{ animationDelay: `${idx * 100}ms` }}
                  className={`border rounded-2xl p-7 transition-all duration-300 hover:-translate-y-2 group backdrop-blur-xl relative overflow-hidden ${
                    theme === 'light'
                      ? 'bg-slate-50/80 border-slate-200 hover:border-orange-500/70 hover:bg-white hover:shadow-2xl hover:shadow-orange-500/15'
                      : 'bg-[#111827]/75 border-white/[0.08] hover:border-orange-500/70 hover:bg-gradient-to-br hover:from-[#1E293B]/90 hover:to-[#111827]/90 hover:shadow-2xl hover:shadow-orange-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                        theme === 'light'
                          ? 'bg-orange-50 border-orange-200 text-orange-600 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/30'
                          : 'bg-[#0F172A] border-orange-500/30 text-orange-400 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/40'
                      }`}
                    >
                      <Icon className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300">
                      {c.num}
                    </span>
                  </div>
                  <h3
                    className={`text-base font-bold mb-2.5 group-hover:text-orange-500 transition-colors ${
                      theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {c.title}
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. SECTION: EMPRESAS COLABORADORAS (Grayscale to Color, Infinite Endless Marquee & Responsive Search) */}
      <section
        id="parceiros"
        className={`py-24 border-b relative transition-colors duration-300 ${
          theme === 'light'
            ? 'bg-slate-100/60 border-slate-200 text-slate-900'
            : 'bg-[#0A0E17] border-white/[0.08] text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-bold text-orange-500 tracking-widest uppercase">
                REDE CORPORATIVA & CONFORMIDADE
              </span>
              <h2
                className={`text-2xl sm:text-4xl font-extrabold tracking-tight mt-2 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                Empresas Colaboradoras & Parceiros Homologados
              </h2>
              <p className={`text-sm sm:text-base mt-2 max-w-2xl font-normal ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Corporações e indústrias que integram nossa esteira técnica de qualificação de fornecedores, auditorias periódicas e certificações acreditadas.
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar empresa, norma..."
                value={searchPartner}
                onChange={(e) => setSearchPartner(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors border ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-[#111827]/90 border-white/[0.1] text-white'
                }`}
              />
              {searchPartner && (
                <button
                  onClick={() => setSearchPartner('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Endless Smooth Marquee of Corporate Logos (Desktop and Mobile) */}
          <div className="mb-12 overflow-hidden py-4 rounded-2xl border border-white/[0.08] bg-[#111827]/50 backdrop-blur-md">
            <div className="animate-marquee-slow flex items-center gap-10 whitespace-nowrap">
              {activePartners.concat(activePartners).map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-4 py-1.5 opacity-65 hover:opacity-100 transition-all duration-300 group cursor-default"
                >
                  {p.logoUrl ? (
                    <img
                      src={p.logoUrl}
                      alt={p.name}
                      className="h-7 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <Building2 className="w-4 h-4 text-orange-400" />
                  )}
                  <span className="font-bold text-xs text-white group-hover:text-orange-400 transition-colors">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-orange-400/80 font-mono">
                    · {p.norm.split('·')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Sector Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {[
              { id: 'all', label: 'Todas as Empresas' },
              { id: 'energia', label: 'Energia & Petróleo' },
              { id: 'aero', label: 'Aeroespacial & Defesa' },
              { id: 'mineracao', label: 'Mineração & Siderurgia' },
              { id: 'automacao', label: 'Automação & Indústria' },
              { id: 'alimentos', label: 'Bioeconomia & Alimentos' },
              { id: 'tech', label: 'Tecnologia & ESG' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedSector(tab.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedSector === tab.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : theme === 'light'
                    ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                    : 'bg-[#111827]/80 text-slate-400 hover:text-slate-200 border border-white/[0.06] hover:bg-[#1E293B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Partners Grid: Grayscale logos by default, reveal full color with scale + orange shadow on hover */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                onClick={() => setSelectedPartner(partner)}
                className={`group border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col justify-between backdrop-blur-xl relative ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-500/15'
                    : 'bg-[#111827]/75 border-white/[0.08] hover:border-orange-500/60 hover:bg-[#1E293B]/80 hover:shadow-2xl hover:shadow-orange-500/20'
                }`}
              >
                <div>
                  {/* Logo Container with Grayscale-to-Color transition */}
                  <div
                    className={`w-full h-20 rounded-xl p-3 flex items-center justify-center border mb-4 transition-all duration-300 ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-200 group-hover:border-slate-300'
                        : 'bg-[#0A0E17]/90 border-white/[0.06] group-hover:border-white/[0.15]'
                    }`}
                  >
                    {partner.logoUrl ? (
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="max-h-12 max-w-[180px] object-contain grayscale opacity-65 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                        <Building2 className="w-5 h-5 text-orange-400" />
                        <span>{partner.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Company Name & Tag */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3
                      className={`font-bold text-base transition-colors truncate ${
                        theme === 'light'
                          ? 'text-slate-900 group-hover:text-orange-600'
                          : 'text-white group-hover:text-orange-400'
                      }`}
                    >
                      {partner.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                      {partner.partnershipType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 truncate mb-3">
                    {partner.category}
                  </p>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {partner.description || partner.tradeName}
                  </p>
                </div>

                {/* Footer with Norms & Detail Trigger */}
                <div
                  className={`pt-3 border-t flex items-center justify-between text-xs ${
                    theme === 'light' ? 'border-slate-100' : 'border-white/[0.06]'
                  }`}
                >
                  <div className="font-mono text-[11px] text-orange-400 font-medium truncate max-w-[170px]">
                    {partner.norm}
                  </div>
                  <span className="text-slate-400 group-hover:text-orange-400 flex items-center gap-1 font-semibold text-[11px] whitespace-nowrap">
                    Detalhes <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredPartners.length === 0 && (
            <div
              className={`p-12 text-center border rounded-2xl ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-[#111827]/40 border-white/[0.08]'
              }`}
            >
              <Building2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                Nenhuma empresa parceira encontrada para este filtro.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tente redefinir os critérios de busca ou selecione outra categoria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 6. SECTION: NORMAS HOMOLOGADAS (Cards with Hover Glow and Animated Data Flow Connection Beam) */}
      <section
        id="normas"
        className={`py-24 border-b relative transition-colors duration-300 ${
          theme === 'light'
            ? 'bg-white border-slate-200'
            : 'bg-[#0B0F1A] border-white/[0.08]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-orange-500 tracking-widest uppercase">
              ESCOPO NORMATIVO INTERNACIONAL
            </span>
            <h2
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-2.5 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              Sistemas de Gestão & Normas Homologadas
            </h2>
            <p className={`text-sm sm:text-base mt-3 font-normal ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Auditorias estruturadas com checklists nativos, relatórios conclusivos e trilha de evidências parametrizada para cada norma técnica.
            </p>
          </div>

          {/* Cards with Animated Data Flow Beam */}
          <div className="relative">
            {/* Animated Data Flow Beam across the norm cards */}
            <div className="absolute top-1/2 left-6 right-6 h-1 hidden lg:block -translate-y-7 pointer-events-none z-0">
              <svg className="w-full h-4 overflow-visible" preserveAspectRatio="none">
                <line
                  x1="0"
                  y1="8"
                  x2="100%"
                  y2="8"
                  stroke="rgba(249, 115, 22, 0.2)"
                  strokeWidth="2"
                />
                <line
                  x1="0"
                  y1="8"
                  x2="100%"
                  y2="8"
                  stroke="url(#flowGradient)"
                  strokeWidth="2.5"
                  className="animate-data-flow"
                />
                <defs>
                  <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EA580C" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#F97316" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Traveling light particle */}
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-400 blur-[1px] shadow-lg shadow-orange-500 animate-flow-particle pointer-events-none" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 relative z-10">
              {STANDARD_NORMS.map((norm) => {
                const IconComp = normIcons[norm.code] || ShieldCheck;
                return (
                  <div
                    key={norm.code}
                    className={`border rounded-2xl p-5 text-center transition-all duration-300 group flex flex-col items-center justify-center hover:-translate-y-2 shadow-sm backdrop-blur-xl ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-200 hover:border-orange-500/70 hover:bg-white hover:shadow-2xl hover:shadow-orange-500/15'
                        : 'bg-[#111827]/75 border-white/[0.08] hover:border-orange-500/70 hover:bg-[#1E293B]/90 hover:shadow-2xl hover:shadow-orange-500/25'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 mb-3 group-hover:scale-110 ${
                        theme === 'light'
                          ? 'bg-orange-50 border-orange-200 text-orange-600 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-md'
                          : 'bg-[#0F172A] border-orange-500/30 text-orange-400 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/40'
                      }`}
                    >
                      <IconComp className="w-6 h-6 stroke-[1.8] animate-icon-pulse" />
                    </div>
                    <h3
                      className={`font-bold text-sm transition-colors ${
                        theme === 'light'
                          ? 'text-slate-900 group-hover:text-orange-600'
                          : 'text-white group-hover:text-orange-400'
                      }`}
                    >
                      {norm.code}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      {norm.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Institutional Final CTA */}
      <section
        className={`py-20 border-t relative overflow-hidden transition-colors duration-300 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-orange-50 via-amber-50/50 to-orange-50 border-slate-200 text-slate-900'
            : 'bg-gradient-to-r from-orange-950/40 via-[#0A0E17] to-amber-950/40 border-white/[0.08] text-white'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 border ${
              theme === 'light'
                ? 'bg-orange-100 border-orange-300 text-orange-800'
                : 'bg-orange-950/60 border-orange-500/40 text-orange-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-orange-400" />
            <span>APRESENTAÇÃO CORPORATIVA & ACCREDITATION</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 text-balance">
            Pronto para implementar o mais alto padrão de auditoria em sua organização?
          </h2>
          <p
            className={`text-sm sm:text-base max-w-2xl mx-auto mb-8 font-normal leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Acesse o ambiente corporativo com credenciais oficiais ou inicie o credenciamento de sua empresa hoje mesmo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterPlatform}
              className="relative group overflow-hidden w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-orange-500/25 transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02]"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:animate-sheen-slide pointer-events-none" />
              <span>Acessar Módulos da Plataforma</span>
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all border whitespace-nowrap cursor-pointer ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                  : 'bg-[#111827] hover:bg-[#1E293B] text-slate-200 border-white/[0.1]'
              }`}
            >
              Portal de Auditores & Clientes
            </button>
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section
        id="faq"
        className={`py-20 border-t ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200'
            : 'bg-[#080C14] border-white/[0.08]'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-orange-500 tracking-widest uppercase">
              PERGUNTAS FREQUENTES
            </span>
            <h2
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              Dúvidas sobre o Ecossistema Nexus Veritas
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Como funciona a emissão do certificado com QR Code?',
                a: 'Após o cumprimento sequencial das etapas de auditoria e validação pelo Gerente Técnico, o certificado é gerado criptograficamente com QR Code público de autenticidade instantânea.',
              },
              {
                q: 'Qual a diferença entre a conta Auditor/Consultor e Empresa?',
                a: 'Auditores e consultores possuem acesso completo para conduzir auditorias, checklists e gerir seus clientes. Empresas contam com uma visão focada em seus próprios fornecedores, certificados e conformidade.',
              },
              {
                q: 'Como é calculada a pontuação de conformidade e risco?',
                a: 'O sistema processa as evidências e não conformidades registradas em cada norma (Qualidade, Ambiental, Saúde e Segurança, Legal) para gerar o índice de pontuação analítica e classificação de risco.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border text-left backdrop-blur-md transition-all duration-300 hover:border-orange-500/40 ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-[#111827]/60 border-white/[0.08]'
                }`}
              >
                <h4
                  className={`text-sm font-bold mb-2 ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {item.q}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Corporate Accreditation Footer (Linear / Stripe level) */}
      <footer
        className={`py-12 text-slate-400 text-xs border-t ${
          theme === 'light'
            ? 'bg-slate-100 border-slate-200 text-slate-600'
            : 'bg-[#060910] border-white/[0.08] text-slate-400'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
            <div className="flex items-center gap-3.5">
              <img
                src={getNexusBrandLogo(theme)}
                alt="Nexus Veritas Logo"
                className="h-9 w-auto object-contain"
              />
              <div>
                <span
                  className={`font-brand font-bold text-sm tracking-wider block ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  NEXUS VERITAS CERTIFICATION
                </span>
                <span className="block text-[10px] text-orange-500 uppercase tracking-widest font-semibold mt-0.5">
                  SISTEMA INTERNACIONAL DE CONFORMIDADE
                </span>
              </div>
            </div>

            <div className="text-xs text-center md:text-right font-medium text-slate-400">
              Normas Acreditadas: ISO 9001 · ISO 14001 · ISO 45001 · ISO 27001 · FSSC 22000 · IATF 16949
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 Nexus Veritas Certification S.A. Todos os direitos reservados. Conformidade ISO/IEC 17021-1.
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  window.history.pushState({}, '', '/verify');
                  window.location.reload();
                }}
                className="text-orange-400 hover:text-orange-300 font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Validar Certificado</span>
              </button>
              <span aria-hidden="true">·</span>
              <span className="hover:text-orange-500 cursor-pointer transition-colors">Termos Regulatórios</span>
              <span aria-hidden="true">·</span>
              <span className="hover:text-orange-500 cursor-pointer transition-colors">Privacidade & LGPD</span>
              <span aria-hidden="true">·</span>
              <span className="hover:text-orange-500 cursor-pointer transition-colors">Canal de Integridade</span>
            </div>
          </div>
        </div>
      </footer>

      {/* PARTNER DETAIL MODAL - IMMERSIVE CORPORATE LANDING PAGE */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`border rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-[#0B0F1A] border-white/[0.12] text-white'
            }`}
          >
            {/* Landing Page Hero Header */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-r from-orange-600/20 via-amber-600/10 to-transparent border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-3 border flex items-center justify-center shadow-xl ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#111827] border-white/[0.15]'
                  }`}
                >
                  {selectedPartner.logoUrl ? (
                    <img
                      src={selectedPartner.logoUrl}
                      alt={selectedPartner.name}
                      className="max-h-12 max-w-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-9 h-9 text-orange-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      {selectedPartner.name}
                    </h2>
                    <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full uppercase tracking-wider">
                      ✓ {selectedPartner.partnershipType}
                    </span>
                  </div>
                  <p className="text-xs text-orange-400 font-mono mt-1">
                    {selectedPartner.tradeName || selectedPartner.category} • Perfil Oficial Homologado Nexus
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {selectedPartner.websiteUrl && (
                  <a
                    href={selectedPartner.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <span>Portal Corporativo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Landing Page Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Normas Auditadas</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-orange-400 mt-0.5 block truncate">
                    {selectedPartner.norm}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status de Auditoria</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5 block">
                    Conforme (100%)
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Validade do Ciclo</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5 block">
                    Outubro / 2029
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Selo de Integridade</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 mt-0.5 block">
                    SHA-256 Verificado
                  </span>
                </div>
              </div>

              {/* Escopo de Atuação e Perfil */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  <span>Escopo de Certificação & Atuação Industrial</span>
                </h3>
                <p className="text-slate-300 leading-relaxed font-sans text-xs sm:text-sm">
                  {selectedPartner.description ||
                    'Empresa homologada com ciclo periódico de auditoria e certificação ativa sob supervisão de auditores líderes IRCA, garantindo rastreabilidade digital e conformidade com os mais rigorosos padrões internacionais.'}
                </p>
              </div>

              {/* Detalhes de Governança */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Governança & Supervisão Técnica
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li>• Auditoria líder realizada por comitê independente IRCA.</li>
                    <li>• Monitoramento contínuo de indicadores de qualidade (IQF).</li>
                    <li>• Gestão eletrônica de documentos (GED) regularizada.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Conformidade & Sustentabilidade (ESG)
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li>• Licenças ambientais e CNDs vigentes e verificadas.</li>
                    <li>• Trilha de auditoria CAPA sem pendências críticas.</li>
                    <li>• Selo de rastreabilidade digital por QR Code.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Landing Page Modal Footer */}
            <div
              className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#060910] border-white/[0.08]'
              }`}
            >
              <span className="text-xs text-slate-400 font-mono">
                Nexus Veritas Certification · Registro Oficial Homologado
              </span>
              <button
                onClick={() => setSelectedPartner(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/25 cursor-pointer transition-all"
              >
                Fechar Perfil Corporativo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
