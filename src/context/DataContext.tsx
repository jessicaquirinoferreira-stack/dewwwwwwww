import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Supplier,
  Audit,
  ActionPlan,
  MetricIndicator,
  Certificate,
  CustomDocument,
  CalendarEvent,
  ProfessionalAuditor,
  Course,
  TechnicalArticle,
  TechnicalTicket,
  LandingContent,
  Partner
} from '../types';
import { DEFAULT_LANDING_CONTENT, SAMPLE_PROFESSIONALS, DEFAULT_PARTNERS } from '../data/initialData';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

interface DataContextType {
  // 1. Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, updated: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // 2. Audits
  audits: Audit[];
  addAudit: (audit: Omit<Audit, 'id'>) => void;
  updateAudit: (id: string, updated: Partial<Audit>) => void;
  deleteAudit: (id: string) => void;

  // 3. Action Plans
  actionPlans: ActionPlan[];
  addActionPlan: (plan: Omit<ActionPlan, 'id'>) => void;
  updateActionPlan: (id: string, updated: Partial<ActionPlan>) => void;
  deleteActionPlan: (id: string) => void;

  // 4. Indicators
  indicators: MetricIndicator[];
  addIndicator: (ind: Omit<MetricIndicator, 'id' | 'lastUpdated'>) => void;
  deleteIndicator: (id: string) => void;

  // 5. Certificates
  certificates: Certificate[];
  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  updateCertificate: (id: string, updated: Partial<Certificate>) => void;
  deleteCertificate: (id: string) => void;

  // 6. Documents
  documents: CustomDocument[];
  addDocument: (doc: Omit<CustomDocument, 'id' | 'updatedAt'>) => void;
  deleteDocument: (id: string) => void;

  // 7. Schedule Events
  events: CalendarEvent[];
  addEvent: (evt: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;

  // 8. Professionals
  professionals: ProfessionalAuditor[];
  addProfessional: (prof: Omit<ProfessionalAuditor, 'id' | 'rating' | 'reviewsCount'>) => void;

  // 9. Mapbox Token
  mapboxToken: string;
  setMapboxToken: (token: string) => void;
  isMapActive: boolean;
  setIsMapActive: (active: boolean) => void;

  // 10. Academy
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'enrolled' | 'progress'>) => void;
  enrollInCourse: (courseId: string) => void;

  // 11. Magazine
  articles: TechnicalArticle[];
  addArticle: (art: Omit<TechnicalArticle, 'id' | 'date'>) => void;

  // 12. Support
  tickets: TechnicalTicket[];
  addTicket: (ticket: Omit<TechnicalTicket, 'id' | 'createdAt' | 'status' | 'messages'>) => void;
  addTicketMessage: (ticketId: string, text: string, sender: string, isStaff: boolean) => void;

  // 13. Landing Content (Admin editable)
  landingContent: LandingContent;
  updateLandingContent: (newContent: Partial<LandingContent>) => void;

  // 14. Partners (Empresas Colaboradoras & Parceiros)
  partners: Partner[];
  addPartner: (partner: Omit<Partner, 'id' | 'createdAt'>) => Promise<void>;
  updatePartner: (id: string, updated: Partial<Partner>) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  resetPartnersToDefault: () => Promise<void>;

  // Utility
  seedSampleData: () => void;
  clearAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper for local storage parsing
const getStored = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(`nexus_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const saveStored = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(`nexus_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // All initial states start zeroed (empty states) as strictly required
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStored('suppliers', []));
  const [audits, setAudits] = useState<Audit[]>(() => getStored('audits', []));
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>(() => getStored('action_plans', []));
  const [indicators, setIndicators] = useState<MetricIndicator[]>(() => getStored('indicators', []));
  const [certificates, setCertificates] = useState<Certificate[]>(() => getStored('certificates', []));
  const [documents, setDocuments] = useState<CustomDocument[]>(() => getStored('documents', []));
  const [events, setEvents] = useState<CalendarEvent[]>(() => getStored('events', []));
  const [professionals, setProfessionals] = useState<ProfessionalAuditor[]>(() => getStored('professionals', SAMPLE_PROFESSIONALS));
  const [mapboxToken, setMapboxTokenState] = useState<string>(() => getStored('mapbox_token', ''));
  const [isMapActive, setIsMapActiveState] = useState<boolean>(() => getStored('map_active', false));
  const [courses, setCourses] = useState<Course[]>(() => getStored('courses', []));
  const [articles, setArticles] = useState<TechnicalArticle[]>(() => getStored('articles', []));
  const [tickets, setTickets] = useState<TechnicalTicket[]>(() => getStored('tickets', []));
  const [landingContent, setLandingContent] = useState<LandingContent>(() => {
    const stored = getStored('landing_content', DEFAULT_LANDING_CONTENT);
    return {
      ...stored,
      badgeText:
        stored.badgeText && stored.badgeText.toLowerCase().includes('conectando')
          ? stored.badgeText
          : 'Conectando confiança à conformidade',
      heroTitle:
        stored.heroTitle && stored.heroTitle.startsWith('Excelência em Certificação')
          ? stored.heroTitle
          : 'Excelência em Certificação, Auditorias & Qualificação de Cadeias Críticas',
      heroSubtitle:
        stored.heroSubtitle && stored.heroSubtitle.startsWith('Conectamos corporações globais')
          ? stored.heroSubtitle
          : 'Conectamos corporações globais, auditores líderes IRCA e fornecedores estratégicos com o mais elevado rigor técnico, rastreabilidade digital e integridade de conformidade.',
    };
  });
  const [partners, setPartners] = useState<Partner[]>(() => getStored('partners', DEFAULT_PARTNERS));

  // Sync states to local storage
  useEffect(() => saveStored('suppliers', suppliers), [suppliers]);
  useEffect(() => saveStored('audits', audits), [audits]);
  useEffect(() => saveStored('action_plans', actionPlans), [actionPlans]);
  useEffect(() => saveStored('indicators', indicators), [indicators]);
  useEffect(() => saveStored('certificates', certificates), [certificates]);
  useEffect(() => saveStored('documents', documents), [documents]);
  useEffect(() => saveStored('events', events), [events]);
  useEffect(() => saveStored('professionals', professionals), [professionals]);
  useEffect(() => saveStored('mapbox_token', mapboxToken), [mapboxToken]);
  useEffect(() => saveStored('map_active', isMapActive), [isMapActive]);
  useEffect(() => saveStored('courses', courses), [courses]);
  useEffect(() => saveStored('articles', articles), [articles]);
  useEffect(() => saveStored('tickets', tickets), [tickets]);
  useEffect(() => saveStored('landing_content', landingContent), [landingContent]);
  useEffect(() => saveStored('partners', partners), [partners]);

  // Synchronize Partners in real-time with Firestore database
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const colRef = collection(db, 'partners');
      unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Partner[] = [];
            snapshot.forEach((d) => {
              list.push({ ...d.data(), id: d.id } as Partner);
            });
            list.sort((a, b) => (a.order || 0) - (b.order || 0));
            setPartners(list);
          } else {
            // First run: seed Firestore with DEFAULT_PARTNERS
            DEFAULT_PARTNERS.forEach(async (p) => {
              try {
                await setDoc(doc(db, 'partners', p.id), p);
              } catch (e) {
                console.warn('Auto-seed partner doc note:', e);
              }
            });
            setPartners(DEFAULT_PARTNERS);
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot partners notice:', error);
        }
      );
    } catch (e) {
      console.warn('Firestore listener setup note:', e);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Suppliers CRUD with Firestore sync
  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    try {
      await setDoc(doc(db, 'suppliers', newSupplier.id), newSupplier);
    } catch (e) {
      console.warn('Firestore addSupplier notice:', e);
    }
  };

  const updateSupplier = async (id: string, updated: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    try {
      await updateDoc(doc(db, 'suppliers', id), updated);
    } catch (e) {
      console.warn('Firestore updateSupplier notice:', e);
    }
  };

  const deleteSupplier = async (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'suppliers', id));
    } catch (e) {
      console.warn('Firestore deleteSupplier notice:', e);
    }
  };

  // Audits CRUD
  const addAudit = (auditData: Omit<Audit, 'id'>) => {
    const newAudit: Audit = {
      ...auditData,
      id: `aud-${Date.now()}`,
    };
    setAudits((prev) => [newAudit, ...prev]);
  };

  const updateAudit = (id: string, updated: Partial<Audit>) => {
    setAudits((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
  };

  const deleteAudit = (id: string) => {
    setAudits((prev) => prev.filter((a) => a.id !== id));
  };

  // Action Plans CRUD
  const addActionPlan = (planData: Omit<ActionPlan, 'id'>) => {
    const newPlan: ActionPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
    };
    setActionPlans((prev) => [newPlan, ...prev]);
  };

  const updateActionPlan = (id: string, updated: Partial<ActionPlan>) => {
    setActionPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deleteActionPlan = (id: string) => {
    setActionPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // Indicators CRUD
  const addIndicator = (indData: Omit<MetricIndicator, 'id' | 'lastUpdated'>) => {
    const newInd: MetricIndicator = {
      ...indData,
      id: `ind-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setIndicators((prev) => [newInd, ...prev]);
  };

  const deleteIndicator = (id: string) => {
    setIndicators((prev) => prev.filter((i) => i.id !== id));
  };

  // Certificates CRUD
  const addCertificate = (certData: Omit<Certificate, 'id'>) => {
    const newCert: Certificate = {
      ...certData,
      id: `cert-${Date.now()}`,
    };
    setCertificates((prev) => [newCert, ...prev]);
  };

  const updateCertificate = (id: string, updated: Partial<Certificate>) => {
    setCertificates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  };

  // Documents CRUD
  const addDocument = (docData: Omit<CustomDocument, 'id' | 'updatedAt'>) => {
    const newDoc: CustomDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Events CRUD
  const addEvent = (evtData: Omit<CalendarEvent, 'id'>) => {
    const newEvt: CalendarEvent = {
      ...evtData,
      id: `evt-${Date.now()}`,
    };
    setEvents((prev) => [newEvt, ...prev]);
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Professionals
  const addProfessional = (profData: Omit<ProfessionalAuditor, 'id' | 'rating' | 'reviewsCount'>) => {
    const newProf: ProfessionalAuditor = {
      ...profData,
      id: `prof-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
    };
    setProfessionals((prev) => [newProf, ...prev]);
  };

  // Mapbox
  const setMapboxToken = (token: string) => {
    setMapboxTokenState(token);
  };

  const setIsMapActive = (active: boolean) => {
    setIsMapActiveState(active);
  };

  // Academy
  const addCourse = (courseData: Omit<Course, 'id' | 'enrolled' | 'progress'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      enrolled: false,
      progress: 0,
    };
    setCourses((prev) => [newCourse, ...prev]);
  };

  const enrollInCourse = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, enrolled: true, progress: 10 } : c))
    );
  };

  // Magazine
  const addArticle = (artData: Omit<TechnicalArticle, 'id' | 'date'>) => {
    const newArt: TechnicalArticle = {
      ...artData,
      id: `art-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
    };
    setArticles((prev) => [newArt, ...prev]);
  };

  // Technical Support
  const addTicket = (ticketData: Omit<TechnicalTicket, 'id' | 'createdAt' | 'status' | 'messages'>) => {
    const newTicket: TechnicalTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Aberto',
      messages: [
        {
          sender: 'Solicitante',
          text: `Solicitação aberta a respeito da norma ${ticketData.norm}: ${ticketData.subject}`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isStaff: false,
        },
      ],
    };
    setTickets((prev) => [newTicket, ...prev]);
  };

  const addTicketMessage = (ticketId: string, text: string, sender: string, isStaff: boolean) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: isStaff ? 'Respondido' : 'Em Análise',
            messages: [
              ...t.messages,
              {
                sender,
                text,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                isStaff,
              },
            ],
          };
        }
        return t;
      })
    );
  };

  // Landing CMS
  const updateLandingContent = (newContent: Partial<LandingContent>) => {
    setLandingContent((prev) => ({ ...prev, ...newContent }));
  };

  // Partners CRUD with Firestore Database Persistence
  const addPartner = async (partnerData: Omit<Partner, 'id' | 'createdAt'>) => {
    const newPartner: Partner = {
      ...partnerData,
      id: `partner-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPartners((prev) => [...prev, newPartner].sort((a, b) => (a.order || 0) - (b.order || 0)));
    try {
      await setDoc(doc(db, 'partners', newPartner.id), newPartner);
    } catch (error) {
      console.warn('Firestore addPartner save notice:', error);
    }
  };

  const updatePartner = async (id: string, updated: Partial<Partner>) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p)).sort((a, b) => (a.order || 0) - (b.order || 0))
    );
    try {
      await updateDoc(doc(db, 'partners', id), updated);
    } catch (error) {
      console.warn('Firestore updatePartner save notice:', error);
    }
  };

  const deletePartner = async (id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'partners', id));
    } catch (error) {
      console.warn('Firestore deletePartner save notice:', error);
    }
  };

  const resetPartnersToDefault = async () => {
    setPartners(DEFAULT_PARTNERS);
    for (const p of DEFAULT_PARTNERS) {
      try {
        await setDoc(doc(db, 'partners', p.id), p);
      } catch (e) {
        console.warn('Firestore reset partner notice:', e);
      }
    }
  };

  // Quick Seed Demo Data (Optional action for demonstrations)
  const seedSampleData = () => {
    const demoSuppliers: Supplier[] = [
      {
        id: 'sup-1',
        tradeName: 'Aço Forte Industrial S.A.',
        corporateName: 'Aço Forte Mineração e Conformação Ltda',
        cnpj: '12.345.678/0001-90',
        contactEmail: 'qualidade@acoforte.com.br',
        phone: '(11) 3456-7890',
        category: 'Matéria-Prima Pesada',
        iqfScore: 94,
        status: 'Homologado',
        primaryNorm: 'ISO 9001',
        city: 'Volta Redonda',
        state: 'RJ',
        country: 'Brasil',
        createdAt: '2026-08-14',
      },
      {
        id: 'sup-2',
        tradeName: 'BioNutri Alimentos & Grãos',
        corporateName: 'BioNutri Alimentos da Terra S.A.',
        cnpj: '23.456.789/0001-01',
        contactEmail: 'auditoria@bionutri.com.br',
        phone: '(19) 3888-1212',
        category: 'Ingredientes e Embalagens',
        iqfScore: 88,
        status: 'Qualificado',
        primaryNorm: 'FSSC 22000',
        city: 'Campinas',
        state: 'SP',
        country: 'Brasil',
        createdAt: '2026-09-02',
      },
      {
        id: 'sup-3',
        tradeName: 'TecnoPolymers Soluções',
        corporateName: 'TecnoPolymers Injeção Técnica Ltda',
        cnpj: '34.567.890/0001-12',
        contactEmail: 'compliance@tecnopolymers.com.br',
        phone: '(41) 3211-9900',
        category: 'Componentes Automotivos',
        iqfScore: 64, // Critical < 70
        status: 'Em Avaliação',
        primaryNorm: 'IATF 16949',
        city: 'São José dos Pinhais',
        state: 'PR',
        country: 'Brasil',
        createdAt: '2026-09-28',
      },
      {
        id: 'sup-4',
        tradeName: 'CyberShield Data Centers',
        corporateName: 'CyberShield Cloud Infrastructure S.A.',
        cnpj: '45.678.901/0001-23',
        contactEmail: 'dpo@cybershield.com.br',
        phone: '(11) 4004-9090',
        category: 'Tecnologia & Nuvem',
        iqfScore: 98,
        status: 'Homologado',
        primaryNorm: 'ISO 27001',
        city: 'Barueri',
        state: 'SP',
        country: 'Brasil',
        createdAt: '2026-10-01',
      },
      {
        id: 'sup-5',
        tradeName: 'LogExpress Cargas Especiais',
        corporateName: 'LogExpress Transportes Rodoviários S.A.',
        cnpj: '56.789.012/0001-34',
        contactEmail: 'seguranca@logexpress.com.br',
        phone: '(31) 3322-1100',
        category: 'Logística Crítica',
        iqfScore: 58, // Blocked / Critical
        status: 'Bloqueado',
        primaryNorm: 'ISO 45001',
        city: 'Betim',
        state: 'MG',
        country: 'Brasil',
        createdAt: '2026-07-19',
      },
    ];

    const demoAudits: Audit[] = [
      {
        id: 'aud-1',
        code: 'AUD-2026-089',
        supplierOrClientId: 'sup-1',
        clientName: 'Aço Forte Industrial S.A.',
        clientAddress: 'Av. Industrial, 1500 - Distrito Industrial, Contagem - MG',
        auditType: '2ª Parte (Fornecedor)',
        norm: 'ISO 9001',
        scope: 'Projeto, fabricação e usinagem de componentes estruturais de aço para a indústria mecânica.',
        leadAuditor: 'Dra. Carolina Mendes',
        auditTeam: 'Dra. Carolina Mendes, Eng. Roberto Albuquerque',
        technicalManager: 'Bruno Alvarenga',
        startDate: '2026-10-02',
        endDate: '2026-10-04',
        validityDate: '2029-10-04',
        status: 'Concluída',
        conformityScore: 96,
        nonConformitiesCount: 1,
      },
      {
        id: 'aud-2',
        code: 'AUD-2026-092',
        supplierOrClientId: 'sup-4',
        clientName: 'CyberShield Data Centers',
        clientAddress: 'Rua da Tecnologia, 400 - Alphaville, Barueri - SP',
        auditType: '3ª Parte (Certificação)',
        norm: 'ISO 27001',
        scope: 'Gestão de segurança da informação e infraestrutura de servidores em nuvem corporativa.',
        leadAuditor: 'Marcelo P. Guimarães',
        auditTeam: 'Marcelo P. Guimarães',
        technicalManager: 'Tatiane Farias',
        startDate: '2026-10-08',
        endDate: '2026-10-12',
        validityDate: '2029-10-12',
        status: 'Em Andamento',
        conformityScore: 99,
        nonConformitiesCount: 0,
      },
      {
        id: 'aud-3',
        code: 'AUD-2026-095',
        supplierOrClientId: 'sup-2',
        clientName: 'BioNutri Alimentos & Grãos',
        clientAddress: 'Rodovia dos Bandeirantes, Km 42 - Campinas - SP',
        auditType: '3ª Parte (Certificação)',
        norm: 'FSSC 22000',
        scope: 'Processamento, beneficiamento e envase de alimentos e grãos orgânicos.',
        leadAuditor: 'Dra. Beatriz Fontana',
        auditTeam: 'Dra. Beatriz Fontana, Dra. Carolina Mendes',
        technicalManager: 'Bruno Alvarenga',
        startDate: '2026-09-15',
        endDate: '2026-09-18',
        validityDate: '2029-09-18',
        status: 'Certificada',
        conformityScore: 94,
        nonConformitiesCount: 2,
      },
    ];

    const demoPlans: ActionPlan[] = [
      {
        id: 'plan-1',
        title: 'Calibração dos termopares da Linha 3',
        description: 'Constatado desvio no registro diário de calibração do setor de tratamento térmico.',
        auditCode: 'AUD-2026-089',
        responsible: 'Eng. Mauro Silva (Aço Forte)',
        deadline: '2026-10-25',
        status: 'Em Andamento',
        priority: 'Alta',
        correctiveAction: 'Substituição das sondas e revisão do cronograma preventivo com laboratório acreditado RBC.',
      },
      {
        id: 'plan-2',
        title: 'Adequação da barreira física na expedição de matérias-primas',
        description: 'Risco de contaminação cruzada por fluxo reverso de empilhadeiras.',
        auditCode: 'AUD-2026-095',
        responsible: 'Mariana Duarte (BioNutri)',
        deadline: '2026-10-18',
        status: 'Aberto',
        priority: 'Média',
        correctiveAction: 'Instalação de divisória modular sanitária e novo layout aprovado pelo comitê APPCC.',
      },
    ];

    const demoIndicators: MetricIndicator[] = [
      {
        id: 'ind-1',
        name: 'Índice de Qualificação de Fornecedores (IQF Médio Global)',
        target: 85,
        currentValue: 88.4,
        unit: 'Pontos',
        category: 'Qualidade',
        trend: 'up',
        lastUpdated: '2026-10-07',
      },
      {
        id: 'ind-2',
        name: 'Taxa de Fechamento de Não Conformidades (CAPA no Prazo)',
        target: 95,
        currentValue: 92.1,
        unit: '%',
        category: 'Compliance',
        trend: 'stable',
        lastUpdated: '2026-10-06',
      },
      {
        id: 'ind-3',
        name: 'Emissões de Escopo 1 e 2 Monitoradas na Cadeia',
        target: 100,
        currentValue: 81.0,
        unit: '%',
        category: 'ESG',
        trend: 'up',
        lastUpdated: '2026-10-05',
      },
    ];

    const demoCertificates: Certificate[] = [
      {
        id: 'cert-1',
        auditId: 'aud-3',
        certificateNumber: 'NVC-BR-2026-9001-8841',
        recipientName: 'BioNutri Alimentos da Terra S.A.',
        clientAddress: 'Rodovia dos Bandeirantes, Km 42 - Campinas - SP',
        cnpjOrCpf: '23.456.789/0001-01',
        norm: 'FSSC 22000 (Versão 6.0)',
        scope: 'Produção, beneficiamento e envase asséptico de ingredientes alimentares e farináceos industriais.',
        issueDate: '2026-09-20',
        expiryDate: '2029-09-19',
        status: 'Aprovado',
        qrCodeUrl: 'https://nexusveritas.org/verify/NVC-BR-2026-9001-8841',
        leadAuditor: 'Dra. Beatriz Fontana (IRCA-993201)',
        technicalManager: 'Bruno Alvarenga',
        technicalManagerSignature: 'Bruno Alvarenga - Gerente Técnico Sênior (CRC/IRCA)',
      },
    ];

    const demoDocs: CustomDocument[] = [
      {
        id: 'doc-1',
        title: 'Checklist Padrão Nexus ISO 9001:2015 - Cláusulas 4 a 10',
        type: 'checklist',
        norm: 'ISO 9001',
        version: 'v4.2',
        updatedAt: '2026-10-01',
        description: 'Roteiro oficial de auditoria para avaliação completa do sistema de gestão da qualidade.',
      },
      {
        id: 'doc-2',
        title: 'Formulário RNC 5W2H - Relatório de Não Conformidade & Ação Corretiva',
        type: 'formulario',
        norm: 'Multinorma',
        version: 'v2.0',
        updatedAt: '2026-09-20',
        description: 'Modelo institucional de investigação de causa-raiz e plano de contenção imediata.',
      },
      {
        id: 'doc-3',
        title: 'Template de Certificado Oficial de Acreditação Internacional Nexus',
        type: 'certificado',
        norm: 'Global',
        version: 'v3.5',
        updatedAt: '2026-09-10',
        description: 'Modelo vetorial com marca d’água de segurança, chave hash SHA-256 e selo de conformidade.',
      },
    ];

    const demoEvents: CalendarEvent[] = [
      {
        id: 'evt-1',
        title: 'Auditoria de Certificação ISO 27001 - CyberShield',
        type: 'Auditoria',
        date: '2026-10-12',
        time: '09:00 - 17:00',
        responsible: 'Marcelo P. Guimarães',
        status: 'Confirmada',
        location: 'São Paulo - Sede CyberShield',
      },
      {
        id: 'evt-2',
        title: 'Reunião de Encerramento e Apresentação do IQF - TecnoPolymers',
        type: 'Follow-up',
        date: '2026-10-16',
        time: '14:30 - 16:00',
        responsible: 'Dra. Carolina Mendes',
        status: 'Agendada',
        location: 'Videoconferência Nexus Veritas',
      },
    ];

    const demoCourses: Course[] = [
      {
        id: 'c-1',
        title: 'Auditor Líder ISO 9001:2015 Reconhecido IRCA',
        category: 'Sistemas de Gestão',
        norm: 'ISO 9001',
        hours: 40,
        instructorName: 'Dra. Carolina Mendes',
        enrolled: true,
        progress: 35,
        description: 'Formação executiva completa para condução de auditorias de 1ª, 2ª e 3ª partes com excelência.',
      },
      {
        id: 'c-2',
        title: 'Transição e Requisitos Avançados FSSC 22000 Versão 6',
        category: 'Segurança de Alimentos',
        norm: 'FSSC 22000',
        hours: 24,
        instructorName: 'Dra. Beatriz Fontana',
        enrolled: false,
        progress: 0,
        description: 'Atualização para auditores e gestores da cadeia alimentícia com foco na cultura de food defense.',
      },
      {
        id: 'c-3',
        title: 'Avaliação de Fornecedores & Cálculo de IQF Automatizado',
        category: 'Cadeia de Suprimentos',
        norm: 'Multinorma',
        hours: 16,
        instructorName: 'Eng. Roberto Albuquerque',
        enrolled: false,
        progress: 0,
        description: 'Metodologia prática para homologação, matriz de risco e mitigação de vulnerabilidades industriais.',
      },
    ];

    const demoArticles: TechnicalArticle[] = [
      {
        id: 'art-1',
        title: 'Como o IQF Preditivo Transforma a Gestão de Riscos na Cadeia de Suprimentos',
        author: 'Corpo Técnico Nexus Veritas',
        date: '02/10/2026',
        normTag: 'Gestão da Cadeia',
        readTime: '6 min de leitura',
        summary: 'A migração do modelo reativo para auditorias de 2ª parte orientadas por dados em tempo real.',
        content: 'No cenário industrial contemporâneo, a conformidade não pode mais ser um retrato estático verificado anualmente. A metodologia do Índice de Qualificação de Fornecedores (IQF) desenvolvida pela Nexus Veritas integra monitoramento de indicadores contínuos, registros de auditorias e inteligência regulatória para antecipar desvios antes que atinjam o consumidor final...',
      },
      {
        id: 'art-2',
        title: 'Integração de Critérios ESG em Auditorias de Terceira Parte',
        author: 'Dra. Carolina Mendes',
        date: '25/09/2026',
        normTag: 'ESG & Sustentabilidade',
        readTime: '8 min de leitura',
        summary: 'Metodologia para conciliar métricas ambientais, trabalhistas e de governança às normas ISO.',
        content: 'Auditar sustentabilidade exige evidências verificáveis. A convergência das normas ISO 14001 e ISO 45001 com frameworks globais como GRI e SASB permite que organizações demonstrem credibilidade perante investidores internacionais...',
      },
    ];

    const demoTickets: TechnicalTicket[] = [
      {
        id: 'tkt-1',
        subject: 'Interpretação da cláusula 8.4 da ISO 9001 para serviços em nuvem terceirizados',
        norm: 'ISO 9001',
        priority: 'Média',
        status: 'Respondido',
        createdAt: '05/10/2026 14:20',
        messages: [
          {
            sender: 'Auditor Roberto',
            text: 'Gostaria de uma orientação oficial do comitê sobre como classificar um provedor de SaaS sem certificação ISO 27001 que hospeda dados operacionais.',
            timestamp: '14:20',
            isStaff: false,
          },
          {
            sender: 'Eng. Gestor Nexus (Corpo Técnico)',
            text: 'Olá Roberto. Conforme diretriz Nexus DT-2026/04, aplica-se o controle de risco do item 8.4.2 com avaliação de controles compensatórios e matriz de impacto crítico.',
            timestamp: '15:10',
            isStaff: true,
          },
        ],
      },
    ];

    setSuppliers(demoSuppliers);
    setAudits(demoAudits);
    setActionPlans(demoPlans);
    setIndicators(demoIndicators);
    setCertificates(demoCertificates);
    setDocuments(demoDocs);
    setEvents(demoEvents);
    setCourses(demoCourses);
    setArticles(demoArticles);
    setTickets(demoTickets);
  };

  // Clear all data to exact zeroed empty states
  const clearAllData = () => {
    setSuppliers([]);
    setAudits([]);
    setActionPlans([]);
    setIndicators([]);
    setCertificates([]);
    setDocuments([]);
    setEvents([]);
    setCourses([]);
    setArticles([]);
    setTickets([]);
  };

  return (
    <DataContext.Provider
      value={{
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,

        audits,
        addAudit,
        updateAudit,
        deleteAudit,

        actionPlans,
        addActionPlan,
        updateActionPlan,
        deleteActionPlan,

        indicators,
        addIndicator,
        deleteIndicator,

        certificates,
        addCertificate,
        updateCertificate,
        deleteCertificate,

        documents,
        addDocument,
        deleteDocument,

        events,
        addEvent,
        deleteEvent,

        professionals,
        addProfessional,

        mapboxToken,
        setMapboxToken,
        isMapActive,
        setIsMapActive,

        courses,
        addCourse,
        enrollInCourse,

        articles,
        addArticle,

        tickets,
        addTicket,
        addTicketMessage,

        landingContent,
        updateLandingContent,

        partners,
        addPartner,
        updatePartner,
        deletePartner,
        resetPartnersToDefault,

        seedSampleData,
        clearAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
