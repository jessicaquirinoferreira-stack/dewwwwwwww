import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { HeaderBar } from './components/common/HeaderBar';

// Views
import { LandingPage } from './components/views/LandingPage';
import { AuthModal } from './components/views/AuthModal';
import { DashboardView } from './components/views/DashboardView';
import { SuppliersView } from './components/views/SuppliersView';
import { WorldMapView } from './components/views/WorldMapView';
import { AuditsView } from './components/views/AuditsView';
import { ActionPlansView } from './components/views/ActionPlansView';
import { IndicatorsView } from './components/views/IndicatorsView';
import { CertificatesView } from './components/views/CertificatesView';
import { DocumentsView } from './components/views/DocumentsView';
import { ScheduleView } from './components/views/ScheduleView';
import { NetworkView } from './components/views/NetworkView';
import { AcademyView } from './components/views/AcademyView';
import { MagazineView } from './components/views/MagazineView';
import { TechnicalSupportView } from './components/views/TechnicalSupportView';
import { TechnicalApprovalsView } from './components/views/TechnicalApprovalsView';
import { SettingsProfileView } from './components/views/SettingsProfileView';
import { AdminPanelModal } from './components/views/AdminPanelModal';
import { VerifyIndexRoute } from './routes/verify.index';

function AppContent() {
  const { user } = useAuth();
  const { theme } = useTheme();

  // Navigation & View Mode
  const [currentTab, setCurrentTab] = useState<NavigationTab>('painel');
  const [isViewingLanding, setIsViewingLanding] = useState(!user);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Automatically return to landing page upon logout (or if unauthenticated)
  React.useEffect(() => {
    if (!user) {
      setIsViewingLanding(true);
      setCurrentTab('painel');
    }
  }, [user]);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleEnterPlatform = () => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
    } else {
      setIsViewingLanding(false);
    }
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    setIsViewingLanding(false);
  };

  const getModuleCategoryAndTitle = (tab: NavigationTab): { category: string; title: string } => {
    switch (tab) {
      case 'painel':
        return { category: 'PRINCIPAL', title: 'Painel Geral de Conformidade' };
      case 'fornecedores':
        return { category: 'PRINCIPAL', title: 'Portal de Fornecedores' };
      case 'mapa-mundial':
        return { category: 'PRINCIPAL', title: 'Mapa Mundial de Fornecedores' };
      case 'auditorias':
        return { category: 'PRINCIPAL', title: 'Auditorias de Conformidade' };
      case 'agenda':
        return { category: 'GESTÃO', title: 'Agenda de Auditorias' };
      case 'planos-de-acao':
        return { category: 'GESTÃO', title: 'Planos de Ação (CAPA)' };
      case 'indicadores':
        return { category: 'GESTÃO', title: 'Indicadores de Desempenho' };
      case 'certificados':
        return { category: 'GESTÃO', title: 'Certificados & Acreditação' };
      case 'analise-tecnica-aprovacoes':
        return { category: 'GESTÃO', title: 'Análise Técnica & Aprovações' };
      case 'documentos':
        return { category: 'GESTÃO', title: 'Documentos Personalizados & SGQ' };
      case 'rede-profissional':
        return { category: 'GESTÃO', title: 'Rede Profissional de Auditores' };
      case 'revista':
        return { category: 'GESTÃO', title: 'Revista Técnica Nexus Veritas' };
      case 'meus-cursos':
        return { category: 'ACADEMY', title: 'Meus Cursos em Andamento' };
      case 'catalogo-academy':
        return { category: 'ACADEMY', title: 'Catálogo de Cursos Nexus' };
      case 'area-do-instrutor':
        return { category: 'ACADEMY', title: 'Área do Instrutor' };
      case 'fala-com-corpo-tecnico':
        return { category: 'SUPORTE', title: 'Fala com o Corpo Técnico' };
      case 'configuracoes-perfil':
        return { category: 'SISTEMA', title: 'Configurações de Perfil' };
      default:
        return { category: 'PRINCIPAL', title: 'Módulo Nexus Veritas' };
    }
  };

  // Check if URL is /verify or contains /verify/
  const isVerifyRoute = window.location.pathname.includes('/verify') || window.location.search.includes('verify=');

  if (isVerifyRoute) {
    return (
      <VerifyIndexRoute
        onBackToHome={() => {
          window.history.replaceState({}, '', '/');
          window.location.reload();
        }}
        onEnterPlatform={() => {
          window.history.replaceState({}, '', '/');
          window.location.reload();
        }}
      />
    );
  }

  // If user explicitly views Landing Page
  if (isViewingLanding) {
    return (
      <>
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onEnterPlatform={handleEnterPlatform}
        />

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          initialMode={authModalMode}
        />

        <AdminPanelModal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
        />
      </>
    );
  }

  const { category, title } = getModuleCategoryAndTitle(currentTab);

  return (
    <div
      className={`flex h-screen ${
        theme === 'light' ? 'bg-slate-100 text-slate-800' : 'bg-[#0B132B] text-slate-100'
      } overflow-hidden antialiased transition-colors duration-200`}
    >
      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onOpenSettings={() => setCurrentTab('configuracoes-perfil')}
          onOpenAdmin={() => setAdminModalOpen(true)}
          onOpenLanding={() => setIsViewingLanding(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto pb-20 md:pb-6">
        {/* Sticky Header Bar with required Bolinha Laranja + NEXUS · MÓDULO ATIVO */}
        <HeaderBar
          moduleTitle={title}
          moduleCategory={category}
          onOpenSettings={() => setCurrentTab('configuracoes-perfil')}
          onOpenAdmin={() => setAdminModalOpen(true)}
        />

        {/* View Routing */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {currentTab === 'painel' && (
            <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />
          )}

          {currentTab === 'fornecedores' && (
            <SuppliersView onOpenMap={() => setCurrentTab('mapa-mundial')} />
          )}

          {currentTab === 'mapa-mundial' && <WorldMapView />}

          {currentTab === 'auditorias' && (
            <AuditsView
              onOpenDocuments={() => setCurrentTab('documentos')}
              onOpenSuppliers={() => setCurrentTab('fornecedores')}
            />
          )}

          {currentTab === 'agenda' && <ScheduleView />}

          {currentTab === 'planos-de-acao' && <ActionPlansView />}

          {currentTab === 'indicadores' && <IndicatorsView />}

          {currentTab === 'certificados' && (
            <CertificatesView
              onOpenDocuments={() => setCurrentTab('documentos')}
              onOpenAudits={() => setCurrentTab('auditorias')}
            />
          )}

          {currentTab === 'analise-tecnica-aprovacoes' && (
            <TechnicalApprovalsView
              onNavigateToTab={(tab) => setCurrentTab(tab as NavigationTab)}
            />
          )}

          {currentTab === 'documentos' && <DocumentsView />}

          {currentTab === 'rede-profissional' && <NetworkView />}

          {currentTab === 'revista' && <MagazineView />}

          {(currentTab === 'meus-cursos' ||
            currentTab === 'catalogo-academy' ||
            currentTab === 'area-do-instrutor') && (
            <AcademyView initialSubTab={currentTab} />
          )}

          {currentTab === 'fala-com-corpo-tecnico' && <TechnicalSupportView />}

          {currentTab === 'configuracoes-perfil' && (
            <SettingsProfileView
              onOpenDocuments={() => setCurrentTab('documentos')}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation & Drawer */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenSettings={() => setCurrentTab('configuracoes-perfil')}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenLanding={() => setIsViewingLanding(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Master Admin Modal */}
      <AdminPanelModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
