import { LandingContent, User, ProfessionalAuditor, Partner } from '../types';

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  badgeText: 'Conectando confiança à conformidade',
  heroTitle: 'Excelência em Certificação, Auditorias & Qualificação de Cadeias Críticas',
  heroSubtitle: 'Conectamos corporações globais, auditores líderes IRCA e fornecedores estratégicos com o mais elevado rigor técnico, rastreabilidade digital e integridade de conformidade.',
  primaryCtaText: 'Acessar Plataforma Corporativa',
  secondaryCtaText: 'Credenciamento de Empresas',
  statsSuppliers: '+18.400 Empresas Monitoradas',
  statsAudits: '+9.250 Ciclos Auditados',
  statsCertificates: '99.9% Integridade & Acurácia',
  statsSatisfaction: 'ISO · ESG · IATF · FSSC',
};

export const CORPORATE_LOGO_PRESETS = [
  {
    name: 'Petrobras',
    category: 'Energia & Petróleo',
    svg: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
        <rect width="240" height="70" rx="10" fill="#004A26"/>
        <circle cx="36" cy="35" r="18" fill="#FBB900"/>
        <path d="M28 35h16M36 27v16" stroke="#004A26" stroke-width="3" stroke-linecap="round"/>
        <text x="64" y="42" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff" letter-spacing="1">PETROBRAS</text>
      </svg>
    `),
  },
  {
    name: 'Embraer',
    category: 'Aeroespacial & Defesa',
    svg: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
        <rect width="240" height="70" rx="10" fill="#002244"/>
        <path d="M22 42 L38 24 L48 24 L36 42 Z" fill="#00A3E0"/>
        <path d="M34 42 L46 29 L54 29 L44 42 Z" fill="#ffffff"/>
        <text x="68" y="42" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff" letter-spacing="1.5">EMBRAER</text>
      </svg>
    `),
  },
  {
    name: 'Vale',
    category: 'Mineração & Metais',
    svg: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
        <rect width="240" height="70" rx="10" fill="#0E3D34"/>
        <path d="M26 28 C34 22, 42 26, 42 36 C42 46, 32 48, 26 42 Z" fill="#D39828"/>
        <path d="M36 30 C42 26, 48 30, 48 38 C48 46, 40 48, 36 44 Z" fill="#008060"/>
        <text x="64" y="42" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="17" font-weight="800" fill="#ffffff" letter-spacing="2">VALE</text>
      </svg>
    `),
  },
  {
    name: 'WEG',
    category: 'Automação & Energia',
    svg: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
        <rect width="240" height="70" rx="10" fill="#005B94"/>
        <rect x="20" y="22" width="26" height="26" rx="4" fill="#ffffff"/>
        <text x="33" y="40" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="900" fill="#005B94" text-anchor="middle">W</text>
        <text x="60" y="42" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="18" font-weight="900" fill="#ffffff" letter-spacing="2">WEG</text>
      </svg>
    `),
  },
  {
    name: 'Gerdau',
    category: 'Siderurgia & Aço',
    svg: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
        <rect width="240" height="70" rx="10" fill="#0D2C54"/>
        <path d="M24 24 L44 24 L34 46 Z" fill="#1E88E5"/>
        <path d="M30 24 L50 24 L40 46 Z" fill="#ffffff" opacity="0.8"/>
        <text x="64" y="42" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff" letter-spacing="1.5">GERDAU</text>
      </svg>
    `),
  },
  {
    name: 'Suzano',
    category: 'Bioeconomia & Papel',
    svg: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
        <rect width="240" height="70" rx="10" fill="#0B4B32"/>
        <circle cx="34" cy="35" r="14" fill="#2ECC71"/>
        <circle cx="44" cy="31" r="10" fill="#A8E6CF"/>
        <text x="66" y="42" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff" letter-spacing="1">SUZANO</text>
      </svg>
    `),
  },
  {
    name: 'Ambev',
    category: 'Bens de Consumo & Alimentos',
    svg: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
        <rect width="240" height="70" rx="10" fill="#141E30"/>
        <rect x="22" y="24" width="22" height="22" rx="4" fill="#D4AF37"/>
        <text x="33" y="40" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="900" fill="#141E30" text-anchor="middle">A</text>
        <text x="56" y="42" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff" letter-spacing="1.5">AMBEV</text>
      </svg>
    `),
  },
  {
    name: 'Siemens Energy',
    category: 'Transição Energética',
    svg: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
        <rect width="240" height="70" rx="10" fill="#003B46"/>
        <path d="M22 35h14M36 27l8 8-8 8" stroke="#00A896" stroke-width="3" stroke-linecap="round" fill="none"/>
        <text x="56" y="38" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" letter-spacing="1">SIEMENS</text>
        <text x="56" y="50" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="600" fill="#00A896" letter-spacing="0.5">ENERGY</text>
      </svg>
    `),
  },
];

export const DEFAULT_PARTNERS: Partner[] = [
  {
    id: 'partner-1',
    name: 'Petrobras',
    tradeName: 'Petróleo Brasileiro S.A.',
    logoUrl: CORPORATE_LOGO_PRESETS[0].svg,
    category: 'Energia & Óleo e Gás',
    norm: 'ISO 9001 · ISO 14001 · ISO 45001',
    websiteUrl: 'https://www.petrobras.com.br',
    partnershipType: 'Cliente Homologado',
    description: 'Gestão contínua do IQF para mais de 1.200 fornecedores na cadeia de exploração offshore e refino com monitoramento em tempo real.',
    order: 1,
    isActive: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'partner-2',
    name: 'Embraer S.A.',
    tradeName: 'Empresa Brasileira de Aeronáutica S.A.',
    logoUrl: CORPORATE_LOGO_PRESETS[1].svg,
    category: 'Aeroespacial & Defesa',
    norm: 'AS 9100 · ISO 27001 · ISO 9001',
    websiteUrl: 'https://www.embraer.com.br',
    partnershipType: 'Empresa Certificada',
    description: 'Auditorias de conformidade crítica e rastreabilidade de componentes de precisão com protocolo criptografado de certificação.',
    order: 2,
    isActive: true,
    createdAt: '2026-02-10',
  },
  {
    id: 'partner-3',
    name: 'Vale S.A.',
    tradeName: 'Vale Mineração & Logística S.A.',
    logoUrl: CORPORATE_LOGO_PRESETS[2].svg,
    category: 'Mineração & Metais',
    norm: 'ISO 14001 · ESG Global · ISO 45001',
    websiteUrl: 'https://www.vale.com',
    partnershipType: 'Parceiro Estratégico',
    description: 'Avaliação de integridade socioambiental e segurança de barragens na cadeia de suprimentos minerais com painel ESG.',
    order: 3,
    isActive: true,
    createdAt: '2026-02-22',
  },
  {
    id: 'partner-4',
    name: 'WEG Equipamentos',
    tradeName: 'WEG Equipamentos Elétricos S.A.',
    logoUrl: CORPORATE_LOGO_PRESETS[3].svg,
    category: 'Automação & Elétrica',
    norm: 'ISO 9001 · ISO 50001 · IATF 16949',
    websiteUrl: 'https://www.weg.net',
    partnershipType: 'Empresa Certificada',
    description: 'Qualificação industrial automatizada de mais de 800 sistemistas globais com checklists em conformidade internacional.',
    order: 4,
    isActive: true,
    createdAt: '2026-03-05',
  },
  {
    id: 'partner-5',
    name: 'Gerdau S.A.',
    tradeName: 'Gerdau Aços Longos e Especiais S.A.',
    logoUrl: CORPORATE_LOGO_PRESETS[4].svg,
    category: 'Siderurgia & Metalurgia',
    norm: 'ISO 9001 · IATF 16949 · ISO 14001',
    websiteUrl: 'https://www.gerdau.com',
    partnershipType: 'Cliente Homologado',
    description: 'Auditorias periódicas de 2ª parte em plantas e distribuidores com geração instantânea de relatórios de não-conformidade CAPA.',
    order: 5,
    isActive: true,
    createdAt: '2026-03-12',
  },
  {
    id: 'partner-6',
    name: 'Suzano Papel & Celulose',
    tradeName: 'Suzano S.A.',
    logoUrl: CORPORATE_LOGO_PRESETS[5].svg,
    category: 'Bioeconomia & Papel',
    norm: 'FSC · ISO 14001 · ISO 9001',
    websiteUrl: 'https://www.suzano.com.br',
    partnershipType: 'Parceiro Estratégico',
    description: 'Rastreabilidade de cadeia florestal e certificação de sustentabilidade de matérias-primas renováveis com auditoria digital.',
    order: 6,
    isActive: true,
    createdAt: '2026-03-20',
  },
  {
    id: 'partner-7',
    name: 'Ambev Brasil',
    tradeName: 'Companhia de Bebidas das Américas - Ambev',
    logoUrl: CORPORATE_LOGO_PRESETS[6].svg,
    category: 'Bens de Consumo & Alimentos',
    norm: 'FSSC 22000 · APPCC/HACCP · ISO 9001',
    websiteUrl: 'https://www.ambev.com.br',
    partnershipType: 'Empresa Certificada',
    description: 'Conformidade sanitária e controle de qualidade de embalagens, leveduras e malte com emissão de selos digitais de conformidade.',
    order: 7,
    isActive: true,
    createdAt: '2026-04-01',
  },
  {
    id: 'partner-8',
    name: 'Siemens Energy',
    tradeName: 'Siemens Energy Brasil Ltda',
    logoUrl: CORPORATE_LOGO_PRESETS[7].svg,
    category: 'Tecnologia & Infraestrutura',
    norm: 'ISO 27001 · ISO 9001 · ISO 45001',
    websiteUrl: 'https://www.siemens-energy.com',
    partnershipType: 'Aliança Tecnológica',
    description: 'Integração de padrões de cibersegurança e integridade de infraestrutura crítica em turbinas e redes de alta tensão.',
    order: 8,
    isActive: true,
    createdAt: '2026-04-14',
  },
];

export const DEFAULT_ADMIN_USER: User = {
  id: 'admin-01',
  name: 'Administrador Master',
  email: 'admin@x.com',
  role: 'admin',
  phone: '+55 (11) 98765-4321',
  jobTitle: 'Gestor Geral da Certificadora',
  professionalId: 'AUD-BR-001/IRCA',
  specialties: [
    'ISO 9001',
    'ISO 14001',
    'ISO 45001',
    'ISO 27001',
    'FSSC 22000',
    'IATF 16949',
    'ESG',
    'LGPD',
    'GMP',
    'BRC'
  ],
  city: 'São Paulo',
  state: 'SP',
  latitude: -23.5505,
  longitude: -46.6333,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export const STANDARD_NORMS = [
  { code: 'ISO 9001', name: 'Gestão da Qualidade', icon: 'ShieldCheck' },
  { code: 'ISO 14001', name: 'Gestão Ambiental', icon: 'Leaf' },
  { code: 'ISO 45001', name: 'Saúde e Segurança Ocupacional', icon: 'HeartPulse' },
  { code: 'ISO 27001', name: 'Segurança da Informação', icon: 'Lock' },
  { code: 'FSSC 22000', name: 'Segurança de Alimentos', icon: 'Utensils' },
  { code: 'IATF 16949', name: 'Qualidade Automotiva', icon: 'Car' },
  { code: 'ESG', name: 'Environmental, Social & Governance', icon: 'Globe' },
  { code: 'LGPD', name: 'Proteção de Dados & Privacidade', icon: 'FileKey' },
  { code: 'GMP', name: 'Boas Práticas de Fabricação', icon: 'CheckSquare' },
  { code: 'BRC', name: 'Padrão Global de Segurança', icon: 'Award' },
];

// Sample professionals available in network directory (can be viewed in Rede Profissional)
export const SAMPLE_PROFESSIONALS: ProfessionalAuditor[] = [
  {
    id: 'prof-1',
    name: 'Dra. Carolina Mendes',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    roleTitle: 'Auditora Líder Master (Lead Auditor IRCA)',
    specialties: ['ISO 9001', 'ISO 14001', 'ESG', 'FSSC 22000'],
    city: 'São Paulo',
    state: 'SP',
    hourlyRate: 380,
    available: true,
    ircaNumber: 'IRCA-604218',
    rating: 4.98,
    reviewsCount: 47,
    email: 'carolina.mendes@auditoria.com',
  },
  {
    id: 'prof-2',
    name: 'Eng. Roberto Albuquerque',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    roleTitle: 'Especialista em IATF 16949 & VDA 6.3',
    specialties: ['IATF 16949', 'ISO 45001', 'GMP'],
    city: 'Curitiba',
    state: 'PR',
    hourlyRate: 420,
    available: true,
    ircaNumber: 'IRCA-512993',
    rating: 4.95,
    reviewsCount: 39,
    email: 'roberto.albuquerque@iatf-audits.com',
  },
  {
    id: 'prof-3',
    name: 'Marcelo P. Guimarães',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    roleTitle: 'Auditor de Segurança da Informação & LGPD',
    specialties: ['ISO 27001', 'LGPD'],
    city: 'Rio de Janeiro',
    state: 'RJ',
    hourlyRate: 350,
    available: false,
    ircaNumber: 'IRCA-781104',
    rating: 4.91,
    reviewsCount: 28,
    email: 'marcelo.guimaraes@cybersec-audit.com',
  },
  {
    id: 'prof-4',
    name: 'Dra. Beatriz Fontana',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    roleTitle: 'Auditora Agroalimentar & BRCGS',
    specialties: ['BRC', 'FSSC 22000', 'GMP'],
    city: 'Belo Horizonte',
    state: 'MG',
    hourlyRate: 360,
    available: true,
    ircaNumber: 'IRCA-993201',
    rating: 5.0,
    reviewsCount: 52,
    email: 'beatriz.fontana@foodsafety.com',
  }
];
