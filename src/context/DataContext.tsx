import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Supplier,
  SupplierStatus,
  SupplierStatusHistoryEntry,
  SupplierDocumentGED,
  SupplierRiskAssessment,
  SupplierIQFBreakdown,
  SupplierShareToken,
  CriticalityLevel,
  Audit,
  AuditType,
  AuditStatus,
  AuditChecklistItem,
  AuditTechnicalApproval,
  AuditFindingSeverity,
  ActionPlan,
  ActionPlanStatus,
  ActionPlan5W2H,
  ActionPlanRootCauseIshikawa,
  MetricIndicator,
  Certificate,
  CertificateStatus,
  CertificateType,
  CustomDocument,
  WorkflowDocumentStatus,
  CalendarEvent,
  ProfessionalAuditor,
  Course,
  TechnicalArticle,
  TechnicalTicket,
  LandingContent,
  Partner,
  AuditLogEntry
} from '../types';
import {
  DEFAULT_LANDING_CONTENT,
  SAMPLE_PROFESSIONALS,
  DEFAULT_PARTNERS,
  INITIAL_DEMO_SUPPLIERS,
  INITIAL_DEMO_AUDITS,
  INITIAL_DEMO_ACTION_PLANS,
  INITIAL_DEMO_CERTIFICATES,
  INITIAL_DEMO_DOCUMENTS
} from '../data/initialData';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  calculateAuditComplianceScore,
  calculateISO31000Risk,
  calculateSupplierIQF,
  validateSupplierStatusTransition
} from '../utils/isoMath';

interface DataContextType {
  // 1. Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, updated: Partial<Supplier>) => void;
  deleteSupplier: (id: string, justification?: string, decidedBy?: string) => Promise<void>;
  changeSupplierStatus: (
    supplierId: string,
    newStatus: SupplierStatus,
    justification: string,
    decidedBy?: string
  ) => { success: boolean; message?: string };
  addSupplierDocumentGED: (supplierId: string, doc: Omit<SupplierDocumentGED, 'id' | 'uploadedAt'>) => void;
  deleteSupplierDocumentGED: (supplierId: string, docId: string) => void;
  generateSupplierShareToken: (supplierId: string, sharedWithEmail: string, role: 'fornecedor' | 'cliente' | 'consultor') => string;
  revokeSupplierShareToken: (supplierId: string, tokenId: string) => void;
  recalculateSupplierIQF: (supplierId: string, quality: number, delivery: number, complianceOrEsg: number, auditOrDoc?: number) => void;
  updateSupplierRisk: (supplierId: string, risk: SupplierRiskAssessment) => void;

  // 2. Audits
  audits: Audit[];
  addAudit: (audit: Omit<Audit, 'id'>) => void;
  updateAudit: (id: string, updated: Partial<Audit>) => void;
  deleteAudit: (id: string) => void;
  createActionPlanFromAuditNC: (auditId: string, item: AuditChecklistItem, responsible: string, deadline: string, priority?: 'Alta' | 'Média' | 'Baixa') => void;
  submitAuditTechnicalApproval: (auditId: string, approval: AuditTechnicalApproval) => void;

  // 3. Action Plans
  actionPlans: ActionPlan[];
  addActionPlan: (plan: Omit<ActionPlan, 'id'>) => void;
  updateActionPlan: (id: string, updated: Partial<ActionPlan>) => void;
  deleteActionPlan: (id: string) => void;
  updateActionPlan5W2H: (id: string, data: ActionPlan5W2H) => void;
  updateActionPlanIshikawa: (id: string, data: ActionPlanRootCauseIshikawa) => void;
  updateActionPlan5Whys: (id: string, whys: string[]) => void;
  verifyActionPlanEffectiveness: (id: string, isEffective: boolean, notes: string, verifiedBy: string) => void;

  // 4. Indicators
  indicators: MetricIndicator[];
  addIndicator: (ind: Omit<MetricIndicator, 'id' | 'lastUpdated'>) => void;
  deleteIndicator: (id: string) => void;

  // 5. Certificates
  certificates: Certificate[];
  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  updateCertificate: (id: string, updated: Partial<Certificate>) => void;
  deleteCertificate: (id: string) => void;
  updateCertificateLifecycle: (id: string, newStatus: CertificateStatus, justification: string, responsible: string) => void;

  // 6. Documents
  documents: CustomDocument[];
  addDocument: (doc: Omit<CustomDocument, 'id' | 'updatedAt'>) => void;
  updateDocument: (id: string, updated: Partial<CustomDocument>) => void;
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

  // 15. Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

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
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const s = getStored('suppliers', INITIAL_DEMO_SUPPLIERS);
    return s && s.length > 0 ? s : INITIAL_DEMO_SUPPLIERS;
  });
  const [audits, setAudits] = useState<Audit[]>(() => {
    const s = getStored('audits', INITIAL_DEMO_AUDITS);
    return s && s.length > 0 ? s : INITIAL_DEMO_AUDITS;
  });
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>(() => {
    const s = getStored('action_plans', INITIAL_DEMO_ACTION_PLANS);
    return s && s.length > 0 ? s : INITIAL_DEMO_ACTION_PLANS;
  });
  const [indicators, setIndicators] = useState<MetricIndicator[]>(() => getStored('indicators', []));
  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const s = getStored('certificates', INITIAL_DEMO_CERTIFICATES);
    return s && s.length > 0 ? s : INITIAL_DEMO_CERTIFICATES;
  });
  const [documents, setDocuments] = useState<CustomDocument[]>(() => {
    const s = getStored('documents', INITIAL_DEMO_DOCUMENTS);
    return s && s.length > 0 ? s : INITIAL_DEMO_DOCUMENTS;
  });
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
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => getStored('audit_logs', []));

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
  useEffect(() => saveStored('audit_logs', auditLogs), [auditLogs]);

  const addAuditLog = async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 150)]);
    try {
      await setDoc(doc(db, 'audit_logs', newLog.id), newLog);
    } catch (e) {
      console.warn('Firestore addAuditLog note:', e);
    }
  };

  // Helper recursivo para sanitizar dados e remover campos undefined antes do envio ao Firestore
  const cleanForFirestore = <T,>(data: T): T => {
    if (data === null || data === undefined) return null as unknown as T;
    if (Array.isArray(data)) {
      return data.map((item) => cleanForFirestore(item)) as unknown as T;
    }
    if (typeof data === 'object') {
      const res: Record<string, any> = {};
      for (const [k, v] of Object.entries(data as Record<string, any>)) {
        if (v !== undefined) {
          res[k] = cleanForFirestore(v);
        }
      }
      return res as T;
    }
    return data;
  };

  // Synchronize All Core Collections in Real-Time with Firestore
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    // 1. Partners
    try {
      unsubs.push(
        onSnapshot(
          collection(db, 'partners'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: Partner[] = [];
              snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as Partner));
              list.sort((a, b) => (a.order || 0) - (b.order || 0));
              setPartners(list);
            } else {
              DEFAULT_PARTNERS.forEach(async (p) => {
                try {
                  await setDoc(doc(db, 'partners', p.id), cleanForFirestore(p));
                } catch {}
              });
              setPartners(DEFAULT_PARTNERS);
            }
          },
          (err) => console.warn('Firestore onSnapshot partners note:', err)
        )
      );
    } catch {}

    // 2. Suppliers
    try {
      unsubs.push(
        onSnapshot(
          collection(db, 'suppliers'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: Supplier[] = [];
              snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as Supplier));
              setSuppliers(list);
            } else {
              INITIAL_DEMO_SUPPLIERS.forEach(async (s) => {
                try {
                  await setDoc(doc(db, 'suppliers', s.id), cleanForFirestore(s));
                } catch {}
              });
            }
          },
          (err) => console.warn('Firestore onSnapshot suppliers note:', err)
        )
      );
    } catch {}

    // 3. Audits
    try {
      unsubs.push(
        onSnapshot(
          collection(db, 'audits'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: Audit[] = [];
              snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as Audit));
              setAudits(list);
            } else {
              INITIAL_DEMO_AUDITS.forEach(async (a) => {
                try {
                  await setDoc(doc(db, 'audits', a.id), cleanForFirestore(a));
                } catch {}
              });
            }
          },
          (err) => console.warn('Firestore onSnapshot audits note:', err)
        )
      );
    } catch {}

    // 4. Certificates
    try {
      unsubs.push(
        onSnapshot(
          collection(db, 'certificates'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: Certificate[] = [];
              snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as Certificate));
              setCertificates(list);
            } else {
              INITIAL_DEMO_CERTIFICATES.forEach(async (c) => {
                try {
                  await setDoc(doc(db, 'certificates', c.id), cleanForFirestore(c));
                } catch {}
              });
            }
          },
          (err) => console.warn('Firestore onSnapshot certificates note:', err)
        )
      );
    } catch {}

    // 5. Action Plans
    try {
      unsubs.push(
        onSnapshot(
          collection(db, 'action_plans'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: ActionPlan[] = [];
              snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as ActionPlan));
              setActionPlans(list);
            } else {
              INITIAL_DEMO_ACTION_PLANS.forEach(async (p) => {
                try {
                  await setDoc(doc(db, 'action_plans', p.id), cleanForFirestore(p));
                } catch {}
              });
            }
          },
          (err) => console.warn('Firestore onSnapshot action_plans note:', err)
        )
      );
    } catch {}

    // 6. Documents SGQ
    try {
      unsubs.push(
        onSnapshot(
          collection(db, 'documents'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: CustomDocument[] = [];
              snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as CustomDocument));
              setDocuments(list);
            } else {
              INITIAL_DEMO_DOCUMENTS.forEach(async (docItem) => {
                try {
                  await setDoc(doc(db, 'documents', docItem.id), cleanForFirestore(docItem));
                } catch {}
              });
            }
          },
          (err) => console.warn('Firestore onSnapshot documents note:', err)
        )
      );
    } catch {}

    // 7. Indicators
    try {
      unsubs.push(
        onSnapshot(
          collection(db, 'indicators'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: MetricIndicator[] = [];
              snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as MetricIndicator));
              setIndicators(list);
            }
          },
          (err) => console.warn('Firestore onSnapshot indicators note:', err)
        )
      );
    } catch {}

    // 8. Events
    try {
      unsubs.push(
        onSnapshot(
          collection(db, 'events'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: CalendarEvent[] = [];
              snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as CalendarEvent));
              setEvents(list);
            }
          },
          (err) => console.warn('Firestore onSnapshot events note:', err)
        )
      );
    } catch {}

    // 9. Professionals
    try {
      unsubs.push(
        onSnapshot(
          collection(db, 'professionals'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: ProfessionalAuditor[] = [];
              snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as ProfessionalAuditor));
              setProfessionals(list);
            } else {
              SAMPLE_PROFESSIONALS.forEach(async (p) => {
                try {
                  await setDoc(doc(db, 'professionals', p.id), cleanForFirestore(p));
                } catch {}
              });
            }
          },
          (err) => console.warn('Firestore onSnapshot professionals note:', err)
        )
      );
    } catch {}

    // 10. Courses (Academy)
    try {
      unsubs.push(
        onSnapshot(
          collection(db, 'courses'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: Course[] = [];
              snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as Course));
              setCourses(list);
            }
          },
          (err) => console.warn('Firestore onSnapshot courses note:', err)
        )
      );
    } catch {}

    // 11. Articles (Magazine)
    try {
      unsubs.push(
        onSnapshot(
          collection(db, 'articles'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: TechnicalArticle[] = [];
              snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as TechnicalArticle));
              setArticles(list);
            }
          },
          (err) => console.warn('Firestore onSnapshot articles note:', err)
        )
      );
    } catch {}

    // 12. Support Tickets
    try {
      unsubs.push(
        onSnapshot(
          collection(db, 'support_tickets'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: TechnicalTicket[] = [];
              snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as TechnicalTicket));
              setTickets(list);
            }
          },
          (err) => console.warn('Firestore onSnapshot support_tickets note:', err)
        )
      );
    } catch {}

    // 13. Audit Logs (LGPD Real-time)
    try {
      unsubs.push(
        onSnapshot(
          collection(db, 'audit_logs'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: AuditLogEntry[] = [];
              snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as AuditLogEntry));
              list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              setAuditLogs(list.slice(0, 150));
            }
          },
          (err) => console.warn('Firestore onSnapshot audit_logs note:', err)
        )
      );
    } catch {}

    // 14. Landing CMS
    try {
      unsubs.push(
        onSnapshot(
          doc(db, 'landing_content', 'main'),
          (snap) => {
            if (snap.exists()) {
              setLandingContent((prev) => ({ ...prev, ...snap.data() }));
            }
          },
          (err) => console.warn('Firestore onSnapshot landing_content note:', err)
        )
      );
    } catch {}

    return () => {
      unsubs.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
    };
  }, []);

  // Suppliers CRUD with Real-Time Firestore Sync
  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    try {
      await setDoc(doc(db, 'suppliers', newSupplier.id), cleanForFirestore(newSupplier));
    } catch (e) {
      console.warn('Firestore addSupplier notice:', e);
    }
  };

  const updateSupplier = async (id: string, updated: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    try {
      await updateDoc(doc(db, 'suppliers', id), cleanForFirestore(updated));
    } catch (e) {
      console.warn('Firestore updateSupplier notice:', e);
    }
  };

  const changeSupplierStatus = (
    supplierId: string,
    newStatus: SupplierStatus,
    justification: string,
    decidedBy?: string
  ): { success: boolean; message?: string } => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return { success: false, message: 'Fornecedor não encontrado.' };

    const validation = validateSupplierStatusTransition(newStatus, justification);
    if (!validation.isValid) {
      return { success: false, message: validation.errorMessage };
    }

    const historyEntry: SupplierStatusHistoryEntry = {
      id: `sh-${Date.now()}`,
      previousStatus: supplier.status,
      newStatus,
      justification: justification.trim(),
      decidedBy: decidedBy || 'Gestor do Sistema',
      createdAt: new Date().toISOString(),
    };

    const lifecycleStatus =
      newStatus === 'Cancelado'
        ? 'cancelado'
        : newStatus === 'Suspenso' || newStatus === 'Bloqueado'
        ? 'suspenso'
        : newStatus === 'Homologado' || newStatus === 'Qualificado'
        ? 'ativo'
        : 'homologacao';

    const updatedHistory = [historyEntry, ...(supplier.statusHistory || [])];

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          return {
            ...s,
            status: newStatus,
            lifecycleStatus,
            statusHistory: updatedHistory,
          };
        }
        return s;
      })
    );

    // Sync to Firestore
    try {
      updateDoc(doc(db, 'suppliers', supplierId), cleanForFirestore({
        status: newStatus,
        lifecycleStatus,
        statusHistory: updatedHistory,
      }));
    } catch (e) {
      console.warn('Firestore changeSupplierStatus notice:', e);
    }

    addAuditLog({
      userEmail: 'qualidade@nexusveritas.com',
      userName: decidedBy || 'Gestor de Fornecedores',
      action: `STATUS_FORNECEDOR: ${newStatus}`,
      module: 'FORNECEDORES',
      targetId: supplierId,
      targetName: supplier.corporateName || supplier.tradeName,
      details: `Transição de ${supplier.status} para ${newStatus}. Justificativa: ${justification.trim()}`,
    });

    return { success: true };
  };

  const deleteSupplier = async (id: string, justification?: string, decidedBy?: string) => {
    const supplier = suppliers.find((s) => s.id === id);
    if (!supplier) return;

    const hasAudits = audits.some(
      (a) => a.supplierOrClientId === id || a.clientName.toLowerCase() === supplier.tradeName.toLowerCase()
    );
    const hasCerts = certificates.some(
      (c) => c.recipientName.toLowerCase() === supplier.tradeName.toLowerCase()
    );
    const hasPlans = actionPlans.some(
      (p) => p.supplierId === id || p.supplierName?.toLowerCase() === supplier.tradeName.toLowerCase()
    );

    // Prompt Mestre Seção 6: Proibição de DELETE físico em fornecedores com histórico vinculado
    if (hasAudits || hasCerts || hasPlans) {
      const defaultJustification =
        justification && justification.trim().length >= 20
          ? justification.trim()
          : 'Inativação lógica mandatória por vínculo com histórico de auditorias e certificados emitidos (ISO/LGPD).';

      changeSupplierStatus(id, 'Cancelado', defaultJustification, decidedBy || 'Administrador Master');
      return;
    }

    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'suppliers', id));
    } catch (e) {
      console.warn('Firestore deleteSupplier notice:', e);
    }

    addAuditLog({
      userEmail: 'admin@nexusveritas.com',
      userName: decidedBy || 'Administrador Master',
      action: 'EXCLUSAO_FORNECEDOR',
      module: 'FORNECEDORES',
      targetId: id,
      targetName: supplier.tradeName,
      details: `Fornecedor sem histórico excluído do cadastro.`,
    });
  };

  // Suppliers GED & Risk & IQF with Firestore Sync
  const addSupplierDocumentGED = (supplierId: string, docData: Omit<SupplierDocumentGED, 'id' | 'uploadedAt'>) => {
    const newDoc: SupplierDocumentGED = {
      ...docData,
      id: `ged-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    
    let updatedDocs: SupplierDocumentGED[] = [];
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const docs = s.documentsGED || [];
          updatedDocs = [newDoc, ...docs];
          return { ...s, documentsGED: updatedDocs };
        }
        return s;
      })
    );

    try {
      const currentSupplier = suppliers.find((s) => s.id === supplierId);
      const allDocs = [newDoc, ...(currentSupplier?.documentsGED || [])];
      updateDoc(doc(db, 'suppliers', supplierId), cleanForFirestore({ documentsGED: allDocs }));
    } catch (e) {
      console.warn('Firestore addSupplierDocumentGED notice:', e);
    }

    addAuditLog({
      userEmail: 'qualidade@nexusveritas.com',
      userName: 'Gestor da Qualidade',
      action: 'UPLOAD_GED',
      module: 'FORNECEDORES',
      targetId: supplierId,
      targetName: docData.title,
      details: `Documento GED "${docData.title}" (${docData.category}) adicionado ao fornecedor.`,
    });
  };

  const deleteSupplierDocumentGED = (supplierId: string, docId: string) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const filtered = (s.documentsGED || []).filter((d) => d.id !== docId);
          try {
            updateDoc(doc(db, 'suppliers', supplierId), cleanForFirestore({ documentsGED: filtered }));
          } catch {}
          return { ...s, documentsGED: filtered };
        }
        return s;
      })
    );
  };

  const generateSupplierShareToken = (
    supplierId: string,
    sharedWithEmail: string,
    role: 'fornecedor' | 'cliente' | 'consultor'
  ): string => {
    const token = `NX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newToken: SupplierShareToken = {
      id: `tok-${Date.now()}`,
      token,
      sharedWithEmail,
      sharedWithRole: role,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      active: true,
    };
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const tokens = [newToken, ...(s.shareTokens || [])];
          try {
            updateDoc(doc(db, 'suppliers', supplierId), cleanForFirestore({ shareTokens: tokens }));
          } catch {}
          return { ...s, shareTokens: tokens };
        }
        return s;
      })
    );
    addAuditLog({
      userEmail: 'gestor@nexusveritas.com',
      userName: 'Administrador',
      action: 'COMPARTILHAMENTO_TOKEN',
      module: 'FORNECEDORES',
      targetId: supplierId,
      targetName: sharedWithEmail,
      details: `Token ${token} emitido para ${sharedWithEmail} (${role}).`,
    });
    return token;
  };

  const revokeSupplierShareToken = (supplierId: string, tokenId: string) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const tokens = (s.shareTokens || []).map((t) => (t.id === tokenId ? { ...t, active: false } : t));
          try {
            updateDoc(doc(db, 'suppliers', supplierId), cleanForFirestore({ shareTokens: tokens }));
          } catch {}
          return {
            ...s,
            shareTokens: tokens,
          };
        }
        return s;
      })
    );
  };

  const recalculateSupplierIQF = (
    supplierId: string,
    quality: number,
    delivery: number,
    complianceOrEsg: number,
    auditOrDoc?: number
  ) => {
    const esg = typeof auditOrDoc === 'number' ? complianceOrEsg : 85;
    const docComp = typeof auditOrDoc === 'number' ? auditOrDoc : complianceOrEsg;
    const iqfResult = calculateSupplierIQF(quality, delivery, esg, docComp);

    let updatedBreakdown: SupplierIQFBreakdown;

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          updatedBreakdown = {
            qualityScore: quality,
            deliveryScore: delivery,
            esgScore: esg,
            complianceScore: docComp,
            auditScore: s.iqfBreakdown?.auditScore || quality,
            calculatedIQF: iqfResult.calculatedIQF,
            category: iqfResult.category,
            lastCalculated: new Date().toISOString().split('T')[0],
          };

          try {
            updateDoc(doc(db, 'suppliers', supplierId), cleanForFirestore({
              iqfScore: iqfResult.calculatedIQF,
              iqfBreakdown: updatedBreakdown,
              status: iqfResult.recommendedStatus,
            }));
          } catch {}

          return {
            ...s,
            iqfScore: iqfResult.calculatedIQF,
            iqfBreakdown: updatedBreakdown,
            status: iqfResult.recommendedStatus,
          };
        }
        return s;
      })
    );

    addAuditLog({
      userEmail: 'sistema@nexusveritas.com',
      userName: 'Motor IQF ISO',
      action: 'CALCULO_IQF',
      module: 'FORNECEDORES',
      targetId: supplierId,
      targetName: `IQF ${iqfResult.calculatedIQF} (${iqfResult.category})`,
      details: `Fórmula ponderada (40/25/20/15): Q=${quality}, P=${delivery}, ESG=${esg}, Doc=${docComp} -> IQF=${iqfResult.calculatedIQF} [${iqfResult.category}]`,
    });
  };

  const updateSupplierRisk = (supplierId: string, risk: SupplierRiskAssessment) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === supplierId ? { ...s, riskAssessment: risk } : s))
    );
    try {
      updateDoc(doc(db, 'suppliers', supplierId), cleanForFirestore({ riskAssessment: risk }));
    } catch {}
  };

  // Audits CRUD with Full Firestore Persistence
  const addAudit = async (auditData: Omit<Audit, 'id'>) => {
    let conformityScore = auditData.conformityScore;
    let nonConformitiesCount = auditData.nonConformitiesCount;

    if (auditData.checklistItems && auditData.checklistItems.length > 0) {
      const scoreRes = calculateAuditComplianceScore(auditData.checklistItems);
      conformityScore = scoreRes.score;
      nonConformitiesCount = scoreRes.nonConformitiesCount;
    }

    const newAudit: Audit = {
      ...auditData,
      conformityScore,
      nonConformitiesCount,
      id: `aud-${Date.now()}`,
    };
    setAudits((prev) => [newAudit, ...prev]);

    try {
      await setDoc(doc(db, 'audits', newAudit.id), cleanForFirestore(newAudit));
    } catch (e) {
      console.warn('Firestore addAudit notice:', e);
    }

    addAuditLog({
      userEmail: 'auditor@nexusveritas.com',
      userName: auditData.leadAuditor || 'Auditor Líder',
      action: 'NOVA_AUDITORIA',
      module: 'AUDITORIAS',
      targetId: newAudit.id,
      targetName: auditData.code,
      details: `Auditoria ${auditData.code} criada para ${auditData.clientName} (${auditData.norm}). Score: ${conformityScore}%`,
    });
  };

  const updateAudit = async (id: string, updated: Partial<Audit>) => {
    let finalAudit: Audit | null = null;
    setAudits((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          let updatedConformity = updated.conformityScore ?? a.conformityScore;
          let updatedNCs = updated.nonConformitiesCount ?? a.nonConformitiesCount;

          if (updated.checklistItems) {
            const scoreRes = calculateAuditComplianceScore(updated.checklistItems);
            updatedConformity = scoreRes.score;
            updatedNCs = scoreRes.nonConformitiesCount;
          }

          finalAudit = {
            ...a,
            ...updated,
            conformityScore: updatedConformity,
            nonConformitiesCount: updatedNCs,
          };
          return finalAudit;
        }
        return a;
      })
    );

    try {
      await updateDoc(doc(db, 'audits', id), cleanForFirestore(updated));
    } catch (e) {
      console.warn('Firestore updateAudit notice:', e);
    }
  };

  const deleteAudit = async (id: string) => {
    setAudits((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteDoc(doc(db, 'audits', id));
    } catch (e) {
      console.warn('Firestore deleteAudit notice:', e);
    }
  };

  const createActionPlanFromAuditNC = async (
    auditId: string,
    item: AuditChecklistItem,
    responsible: string,
    deadline: string,
    priority: 'Alta' | 'Média' | 'Baixa' = 'Alta'
  ) => {
    const audit = audits.find((a) => a.id === auditId);
    const newPlan: ActionPlan = {
      id: `plan-${Date.now()}`,
      title: `Tratamento de NC: ${item.requirement}`,
      description: `Não conformidade na auditoria ${audit?.code || ''} (${audit?.clientName || ''}): ${item.evidence || item.processOrArea}`,
      auditId,
      auditCode: audit?.code,
      supplierId: audit?.supplierOrClientId,
      supplierName: audit?.clientName,
      ncRequirement: item.requirement,
      responsible,
      deadline,
      status: 'Pendente',
      priority,
      correctiveAction: 'Ação corretiva a detalhar via 5W2H.',
      rootCause: 'Análise de causa raiz (Ishikawa / 5 Porquês) pendente.',
      method5W2H: {
        what: `Eliminar desvio: ${item.requirement}`,
        why: 'Atender aos requisitos normativos de certificação',
        where: item.processOrArea || 'Planta Operacional',
        whenDeadline: deadline,
        whoResponsible: responsible,
        howMethod: 'Revisão de procedimento, análise de falha e treinamento',
        howMuchCost: 'R$ 0,00',
      },
      fiveWhys: ['', '', '', '', ''],
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'Ação aberta automaticamente pela constatação de auditoria',
          author: audit?.leadAuditor || 'Auditor Líder',
        },
      ],
    };
    setActionPlans((prev) => [newPlan, ...prev]);

    setAudits((prev) =>
      prev.map((a) => {
        if (a.id === auditId) {
          const items = (a.checklistItems || []).map((chk) =>
            chk.id === item.id ? { ...chk, actionPlanCreated: true, actionPlanId: newPlan.id } : chk
          );
          try {
            updateDoc(doc(db, 'audits', auditId), cleanForFirestore({ checklistItems: items }));
          } catch {}
          return { ...a, checklistItems: items };
        }
        return a;
      })
    );

    try {
      await setDoc(doc(db, 'action_plans', newPlan.id), cleanForFirestore(newPlan));
    } catch (e) {
      console.warn('Firestore createActionPlanFromAuditNC notice:', e);
    }

    addAuditLog({
      userEmail: 'auditor@nexusveritas.com',
      userName: audit?.leadAuditor || 'Auditor Líder',
      action: 'ABERTURA_PLANO_NC',
      module: 'PLANOS_DE_ACAO',
      targetId: newPlan.id,
      targetName: newPlan.title,
      details: `Plano de Ação gerado a partir do item ${item.requirement} da auditoria ${audit?.code}.`,
    });
  };

  const submitAuditTechnicalApproval = async (auditId: string, approval: AuditTechnicalApproval) => {
    const newStatus: AuditStatus = approval.decision === 'Aprovado' ? 'Aprovada' : 'Em Análise Técnica';
    setAudits((prev) =>
      prev.map((a) => {
        if (a.id === auditId) {
          return { ...a, status: newStatus, technicalApproval: approval };
        }
        return a;
      })
    );
    try {
      await updateDoc(doc(db, 'audits', auditId), cleanForFirestore({
        status: newStatus,
        technicalApproval: approval,
      }));
    } catch (e) {
      console.warn('Firestore submitAuditTechnicalApproval notice:', e);
    }
    addAuditLog({
      userEmail: approval.approvedBy,
      userName: approval.approvedBy,
      action: 'APROVACAO_TECNICA',
      module: 'AUDITORIAS',
      targetId: auditId,
      targetName: approval.decision,
      details: `Parecer Técnico emitido: ${approval.decision}. Parecer: ${approval.comments}`,
    });
  };

  // Action Plans CRUD with Full Firestore Persistence
  const addActionPlan = async (planData: Omit<ActionPlan, 'id'>) => {
    const newPlan: ActionPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'Plano de ação cadastrado manualmente',
          author: planData.responsible || 'Coordenador',
        },
      ],
    };
    setActionPlans((prev) => [newPlan, ...prev]);
    try {
      await setDoc(doc(db, 'action_plans', newPlan.id), cleanForFirestore(newPlan));
    } catch (e) {
      console.warn('Firestore addActionPlan notice:', e);
    }
  };

  const updateActionPlan = async (id: string, updated: Partial<ActionPlan>) => {
    setActionPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    try {
      await updateDoc(doc(db, 'action_plans', id), cleanForFirestore(updated));
    } catch (e) {
      console.warn('Firestore updateActionPlan notice:', e);
    }
  };

  const deleteActionPlan = async (id: string) => {
    setActionPlans((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'action_plans', id));
    } catch (e) {
      console.warn('Firestore deleteActionPlan notice:', e);
    }
  };

  const updateActionPlan5W2H = async (id: string, data: ActionPlan5W2H) => {
    let updatedPlan: ActionPlan | null = null;
    setActionPlans((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const hist = p.history || [];
          updatedPlan = {
            ...p,
            method5W2H: data,
            deadline: data.whenDeadline || p.deadline,
            responsible: data.whoResponsible || p.responsible,
            status: p.status === 'Pendente' ? 'Em Andamento' : p.status,
            history: [
              ...hist,
              {
                timestamp: new Date().toISOString(),
                action: 'Matriz 5W2H atualizada',
                author: data.whoResponsible || 'Responsável',
              },
            ],
          };
          return updatedPlan;
        }
        return p;
      })
    );

    if (updatedPlan) {
      try {
        await updateDoc(doc(db, 'action_plans', id), cleanForFirestore(updatedPlan));
      } catch (e) {
        console.warn('Firestore updateActionPlan5W2H notice:', e);
      }
    }
  };

  const updateActionPlanIshikawa = async (id: string, data: ActionPlanRootCauseIshikawa) => {
    setActionPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ishikawa: data, rootCause: data.primaryRootCause || p.rootCause } : p))
    );
    try {
      await updateDoc(doc(db, 'action_plans', id), cleanForFirestore({
        ishikawa: data,
        rootCause: data.primaryRootCause,
      }));
    } catch (e) {
      console.warn('Firestore updateActionPlanIshikawa notice:', e);
    }
  };

  const updateActionPlan5Whys = async (id: string, whys: string[]) => {
    setActionPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, fiveWhys: whys } : p))
    );
    try {
      await updateDoc(doc(db, 'action_plans', id), cleanForFirestore({ fiveWhys: whys }));
    } catch (e) {
      console.warn('Firestore updateActionPlan5Whys notice:', e);
    }
  };

  const verifyActionPlanEffectiveness = async (
    id: string,
    isEffective: boolean,
    notes: string,
    verifiedBy: string
  ) => {
    let updatedPlan: ActionPlan | null = null;
    setActionPlans((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStatus: ActionPlanStatus = isEffective ? 'Concluído' : 'Ineficaz';
          const hist = p.history || [];
          updatedPlan = {
            ...p,
            status: newStatus,
            effectivenessVerification: {
              verifiedBy,
              verificationDate: new Date().toISOString().split('T')[0],
              isEffective,
              notes,
            },
            history: [
              ...hist,
              {
                timestamp: new Date().toISOString(),
                action: `Verificação de Eficácia: ${isEffective ? 'EFICAZ' : 'INEFICAZ (Ciclo reiniciado)'}`,
                author: verifiedBy,
              },
            ],
          };
          return updatedPlan;
        }
        return p;
      })
    );

    if (updatedPlan) {
      try {
        await updateDoc(doc(db, 'action_plans', id), cleanForFirestore(updatedPlan));
      } catch (e) {
        console.warn('Firestore verifyActionPlanEffectiveness notice:', e);
      }
    }

    addAuditLog({
      userEmail: verifiedBy,
      userName: verifiedBy,
      action: 'VERIFICACAO_EFICACIA',
      module: 'PLANOS_DE_ACAO',
      targetId: id,
      targetName: isEffective ? 'Eficaz' : 'Ineficaz',
      details: `Parecer de eficácia registrado: ${isEffective ? 'Conforme' : 'Não eficaz'}. Notas: ${notes}`,
    });
  };

  // Indicators CRUD with Full Firestore Persistence
  const addIndicator = async (indData: Omit<MetricIndicator, 'id' | 'lastUpdated'>) => {
    const newInd: MetricIndicator = {
      ...indData,
      id: `ind-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setIndicators((prev) => [newInd, ...prev]);
    try {
      await setDoc(doc(db, 'indicators', newInd.id), cleanForFirestore(newInd));
    } catch (e) {
      console.warn('Firestore addIndicator notice:', e);
    }
  };

  const deleteIndicator = async (id: string) => {
    setIndicators((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteDoc(doc(db, 'indicators', id));
    } catch (e) {
      console.warn('Firestore deleteIndicator notice:', e);
    }
  };

  // Certificates CRUD with Full Firestore Persistence
  const addCertificate = async (certData: Omit<Certificate, 'id'>) => {
    const newCert: Certificate = {
      ...certData,
      id: `cert-${Date.now()}`,
    };
    setCertificates((prev) => [newCert, ...prev]);
    try {
      await setDoc(doc(db, 'certificates', newCert.id), cleanForFirestore(newCert));
    } catch (e) {
      console.warn('Firestore addCertificate notice:', e);
    }
    addAuditLog({
      userEmail: certData.technicalManager || 'gerente@nexusveritas.com',
      userName: certData.technicalManager || 'Gerente Técnico',
      action: 'EMISSAO_CERTIFICADO',
      module: 'CERTIFICADOS',
      targetId: newCert.id,
      targetName: certData.certificateNumber,
      details: `Certificado ${certData.certificateNumber} emitido para ${certData.recipientName} (${certData.norm}).`,
    });
  };

  const updateCertificate = async (id: string, updated: Partial<Certificate>) => {
    setCertificates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    try {
      await updateDoc(doc(db, 'certificates', id), cleanForFirestore(updated));
    } catch (e) {
      console.warn('Firestore updateCertificate notice:', e);
    }
  };

  const deleteCertificate = async (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'certificates', id));
    } catch (e) {
      console.warn('Firestore deleteCertificate notice:', e);
    }
  };

  const updateCertificateLifecycle = async (
    id: string,
    newStatus: CertificateStatus,
    justification: string,
    responsible: string
  ) => {
    let updatedHistory: any[] = [];
    setCertificates((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const hist = c.statusHistory || [];
          updatedHistory = [
            ...hist,
            {
              status: newStatus,
              date: new Date().toISOString().split('T')[0],
              justification,
              responsible,
            },
          ];
          return {
            ...c,
            status: newStatus,
            statusHistory: updatedHistory,
          };
        }
        return c;
      })
    );

    try {
      await updateDoc(doc(db, 'certificates', id), cleanForFirestore({
        status: newStatus,
        statusHistory: updatedHistory,
      }));
    } catch (e) {
      console.warn('Firestore updateCertificateLifecycle notice:', e);
    }

    addAuditLog({
      userEmail: responsible,
      userName: responsible,
      action: 'ALTERACAO_STATUS_CERTIFICADO',
      module: 'CERTIFICADOS',
      targetId: id,
      targetName: newStatus,
      details: `Status alterado para "${newStatus}". Justificativa: ${justification}`,
    });
  };

  // Documents CRUD with Full Firestore Persistence
  const addDocument = async (docData: Omit<CustomDocument, 'id' | 'updatedAt'>) => {
    const newDoc: CustomDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setDocuments((prev) => [newDoc, ...prev]);
    try {
      await setDoc(doc(db, 'documents', newDoc.id), cleanForFirestore(newDoc));
    } catch (e) {
      console.warn('Firestore addDocument notice:', e);
    }
  };

  const updateDocument = async (id: string, updated: Partial<CustomDocument>) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
    try {
      await updateDoc(doc(db, 'documents', id), cleanForFirestore(updated));
    } catch (e) {
      console.warn('Firestore updateDocument notice:', e);
    }
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (e) {
      console.warn('Firestore deleteDocument notice:', e);
    }
  };

  // Events CRUD with Full Firestore Persistence
  const addEvent = async (evtData: Omit<CalendarEvent, 'id'>) => {
    const newEvt: CalendarEvent = {
      ...evtData,
      id: `evt-${Date.now()}`,
    };
    setEvents((prev) => [newEvt, ...prev]);
    try {
      await setDoc(doc(db, 'events', newEvt.id), cleanForFirestore(newEvt));
    } catch (e) {
      console.warn('Firestore addEvent notice:', e);
    }
  };

  const deleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (e) {
      console.warn('Firestore deleteEvent notice:', e);
    }
  };

  // Professionals with Full Firestore Persistence
  const addProfessional = async (profData: Omit<ProfessionalAuditor, 'id' | 'rating' | 'reviewsCount'>) => {
    const newProf: ProfessionalAuditor = {
      ...profData,
      id: `prof-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
    };
    setProfessionals((prev) => [newProf, ...prev]);
    try {
      await setDoc(doc(db, 'professionals', newProf.id), cleanForFirestore(newProf));
    } catch (e) {
      console.warn('Firestore addProfessional notice:', e);
    }
  };

  // Mapbox
  const setMapboxToken = (token: string) => {
    setMapboxTokenState(token);
  };

  const setIsMapActive = (active: boolean) => {
    setIsMapActiveState(active);
  };

  // Academy with Full Firestore Persistence
  const addCourse = async (courseData: Omit<Course, 'id' | 'enrolled' | 'progress'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      enrolled: false,
      progress: 0,
    };
    setCourses((prev) => [newCourse, ...prev]);
    try {
      await setDoc(doc(db, 'courses', newCourse.id), cleanForFirestore(newCourse));
    } catch (e) {
      console.warn('Firestore addCourse notice:', e);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, enrolled: true, progress: 10 } : c))
    );
    try {
      await updateDoc(doc(db, 'courses', courseId), cleanForFirestore({ enrolled: true, progress: 10 }));
    } catch (e) {
      console.warn('Firestore enrollInCourse notice:', e);
    }
  };

  // Magazine with Full Firestore Persistence
  const addArticle = async (artData: Omit<TechnicalArticle, 'id' | 'date'>) => {
    const newArt: TechnicalArticle = {
      ...artData,
      id: `art-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
    };
    setArticles((prev) => [newArt, ...prev]);
    try {
      await setDoc(doc(db, 'articles', newArt.id), cleanForFirestore(newArt));
    } catch (e) {
      console.warn('Firestore addArticle notice:', e);
    }
  };

  // Technical Support with Full Firestore Persistence
  const addTicket = async (ticketData: Omit<TechnicalTicket, 'id' | 'createdAt' | 'status' | 'messages'>) => {
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
    try {
      await setDoc(doc(db, 'support_tickets', newTicket.id), cleanForFirestore(newTicket));
    } catch (e) {
      console.warn('Firestore addTicket notice:', e);
    }
  };

  const addTicketMessage = async (ticketId: string, text: string, sender: string, isStaff: boolean) => {
    let updatedMessages: any[] = [];
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          updatedMessages = [
            ...t.messages,
            {
              sender,
              text,
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              isStaff,
            },
          ];
          return {
            ...t,
            status: isStaff ? 'Respondido' : 'Em Análise',
            messages: updatedMessages,
          };
        }
        return t;
      })
    );

    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), cleanForFirestore({
        status: isStaff ? 'Respondido' : 'Em Análise',
        messages: updatedMessages,
      }));
    } catch (e) {
      console.warn('Firestore addTicketMessage notice:', e);
    }
  };

  // Landing CMS with Firestore Persistence
  const updateLandingContent = async (newContent: Partial<LandingContent>) => {
    const merged = { ...landingContent, ...newContent };
    setLandingContent(merged);
    try {
      await setDoc(doc(db, 'landing_content', 'main'), cleanForFirestore(merged), { merge: true });
    } catch (e) {
      console.warn('Firestore updateLandingContent notice:', e);
    }
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
      await setDoc(doc(db, 'partners', newPartner.id), cleanForFirestore(newPartner));
    } catch (error) {
      console.warn('Firestore addPartner save notice:', error);
    }
  };

  const updatePartner = async (id: string, updated: Partial<Partner>) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p)).sort((a, b) => (a.order || 0) - (b.order || 0))
    );
    try {
      await updateDoc(doc(db, 'partners', id), cleanForFirestore(updated));
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
        await setDoc(doc(db, 'partners', p.id), cleanForFirestore(p));
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
        criticality: 'Alta',
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
        criticality: 'Média',
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
        criticality: 'Alta',
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
        criticality: 'Alta',
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
        criticality: 'Alta',
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
        certificateType: 'Acreditado Internacionalmente (ISO/IEC 17021-1)',
        accreditationBody: 'CGCRE / INMETRO - Acreditação OHC-0021 / IAF MLA',
        recipientName: 'BioNutri Alimentos da Terra S.A.',
        clientAddress: 'Rodovia dos Bandeirantes, Km 42 - Campinas - SP',
        cnpjOrCpf: '23.456.789/0001-01',
        norm: 'FSSC 22000 (Versão 6.0)',
        scope: 'Produção, beneficiamento e envase asséptico de ingredientes alimentares e farináceos industriais.',
        issueDate: '2026-09-20',
        expiryDate: '2029-09-19',
        status: 'Vigente',
        qrCodeUrl: 'https://nexusveritas.org/verify/NVC-BR-2026-9001-8841',
        leadAuditor: 'Dra. Beatriz Fontana (IRCA-993201)',
        technicalManager: 'Bruno Alvarenga',
        technicalManagerSignature: 'Bruno Alvarenga - Gerente Técnico Sênior (CRC/IRCA)',
        sha256Hash: 'a89f3b987c4892cbe7198fba901235cb18e1920acbe0912fa87239102c81bf20',
        revisionNumber: 'Rev. 00',
      },
    ];

    const demoDocs: CustomDocument[] = [
      {
        id: 'doc-1',
        title: 'Checklist Padrão Nexus ISO 9001:2015 - Cláusulas 4 a 10',
        code: 'CHK-SGQ-001',
        type: 'checklist',
        norm: 'ISO 9001',
        version: 'v4.2',
        updatedAt: '2026-10-01',
        status: 'Publicado',
        isObsolete: false,
        description: 'Roteiro oficial de auditoria para avaliação completa do sistema de gestão da qualidade.',
      },
      {
        id: 'doc-2',
        title: 'Formulário RNC 5W2H - Relatório de Não Conformidade & Ação Corretiva',
        code: 'FRM-CAPA-002',
        type: 'formulario',
        norm: 'Multinorma',
        version: 'v2.0',
        updatedAt: '2026-09-20',
        status: 'Publicado',
        isObsolete: false,
        description: 'Modelo institucional de investigação de causa-raiz e plano de contenção imediata.',
      },
      {
        id: 'doc-3',
        title: 'Template de Certificado Oficial de Acreditação Internacional Nexus',
        code: 'TMP-CERT-003',
        type: 'certificado',
        norm: 'Global',
        version: 'v3.5',
        updatedAt: '2026-09-10',
        status: 'Publicado',
        isObsolete: false,
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
        changeSupplierStatus,
        addSupplierDocumentGED,
        deleteSupplierDocumentGED,
        generateSupplierShareToken,
        revokeSupplierShareToken,
        recalculateSupplierIQF,
        updateSupplierRisk,

        audits,
        addAudit,
        updateAudit,
        deleteAudit,
        createActionPlanFromAuditNC,
        submitAuditTechnicalApproval,

        actionPlans,
        addActionPlan,
        updateActionPlan,
        deleteActionPlan,
        updateActionPlan5W2H,
        updateActionPlanIshikawa,
        updateActionPlan5Whys,
        verifyActionPlanEffectiveness,

        indicators,
        addIndicator,
        deleteIndicator,

        certificates,
        addCertificate,
        updateCertificate,
        deleteCertificate,
        updateCertificateLifecycle,

        documents,
        addDocument,
        updateDocument,
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

        auditLogs,
        addAuditLog,

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
