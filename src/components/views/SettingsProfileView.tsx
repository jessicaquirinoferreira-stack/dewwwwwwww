import React, { useState } from 'react';
import {
  User as UserIcon,
  Phone,
  Briefcase,
  Award,
  MapPin,
  Compass,
  FileText,
  Save,
  CheckCircle2,
  UploadCloud,
  Navigation,
  ExternalLink,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { STANDARD_NORMS } from '../../data/initialData';
import { FileUploadModal } from '../common/FileUploadModal';

interface SettingsProfileViewProps {
  onOpenDocuments: () => void;
}

export const SettingsProfileView: React.FC<SettingsProfileViewProps> = ({
  onOpenDocuments,
}) => {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [professionalId, setProfessionalId] = useState(user?.professionalId || '');
  const [specialties, setSpecialties] = useState<string[]>(user?.specialties || ['ISO 9001']);
  const [city, setCity] = useState(user?.city || 'São Paulo');
  const [state, setState] = useState(user?.state || 'SP');
  const [latitude, setLatitude] = useState<number | undefined>(user?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(user?.longitude);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);

  const availableNorms = [
    'ISO 9001',
    'ISO 14001',
    'ISO 45001',
    'ISO 27001',
    'FSSC 22000',
    'IATF 16949',
    'ESG',
    'LGPD',
    'GMP',
    'BRC',
  ];

  const toggleSpecialty = (norm: string) => {
    if (specialties.includes(norm)) {
      setSpecialties(specialties.filter((s) => s !== norm));
    } else {
      setSpecialties([...specialties, norm]);
    }
  };

  // Botão “Usar minha localização atual”
  const handleUseCurrentLocation = () => {
    setGeoLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(Number(position.coords.latitude.toFixed(4)));
          setLongitude(Number(position.coords.longitude.toFixed(4)));
          setGeoLocating(false);
          setSuccessMessage('Coordenadas capturadas via GPS com sucesso!');
          setTimeout(() => setSuccessMessage(null), 3000);
        },
        () => {
          setLatitude(-23.5505);
          setLongitude(-46.6333);
          setGeoLocating(false);
          setSuccessMessage('Coordenadas aproximadas atribuídas.');
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      );
    } else {
      setLatitude(-23.5505);
      setLongitude(-46.6333);
      setGeoLocating(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      jobTitle,
      professionalId,
      specialties,
      city,
      state,
      latitude,
      longitude,
    });
    setSuccessMessage('Alterações salvas com sucesso no seu perfil corporativo!');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Configurações & Perfil Profissional
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gerenciamento cadastral, especialidades normativas, credenciamentos e localização.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-800 text-xs font-semibold transition-all shadow-xs self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Plataforma</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar & Header Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-blue-950 border-2 border-blue-600/70 flex items-center justify-center overflow-hidden text-blue-300 font-extrabold text-xl shadow-md">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                name.slice(0, 2).toUpperCase() || 'NV'
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="absolute -bottom-1 -right-1 p-2 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-500 transition-colors"
              title="Trocar foto de perfil"
            >
              <UploadCloud className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">
              {name || 'Auditor Nexus Veritas'}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/80 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {user?.role === 'admin'
                  ? 'Administrador Master'
                  : user?.role === 'auditor'
                  ? 'Auditor Líder Certificado'
                  : 'Representante Corporativo'}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Card “Dados pessoais e profissionais” */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <UserIcon className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Dados Pessoais e Profissionais
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+55 (11) 98765-4321"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Cargo / Função
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex: Auditor Líder ISO 9001"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Registro Profissional (IRCA / CREA / CRA)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={professionalId}
                  onChange={(e) => setProfessionalId(e.target.value)}
                  placeholder="Ex: IRCA-BR-88492"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Card “Especialidades normativas” */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">
                Especialidades Normativas
              </h2>
            </div>
            <span className="text-xs font-bold text-blue-400 font-mono">
              {specialties.length} selecionadas
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Selecione as normas em que você possui competência técnica comprovada para condução de auditorias e emissão de pareceres:
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {availableNorms.map((norm) => {
              const selected = specialties.includes(norm);
              return (
                <button
                  key={norm}
                  type="button"
                  onClick={() => toggleSpecialty(norm)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {norm}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Card “Localização geográfica” com botão “Usar minha localização atual” */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">
                Localização Geográfica & Plotagem no Mapa
              </h2>
            </div>

            {/* Botão “Usar minha localização atual” */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={geoLocating}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800/80 text-xs font-bold transition-all"
            >
              <Navigation className="w-4 h-4 text-blue-400" />
              <span>{geoLocating ? 'Obtendo GPS...' : 'Usar minha localização atual'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Defina sua base operacional para exibição nos clusters do Mapa Mundial e atribuição de auditorias presenciais por proximidade.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Cidade</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Estado (UF)</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={latitude ?? ''}
                onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="-23.5505"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={longitude ?? ''}
                onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="-46.6333"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. Card “Modelos de documentos” com botão “Gerenciar” */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Modelos de Documentos
              </h3>
              <p className="text-xs text-slate-400">
                Acesse e customize os templates institucionais de checklists, relatórios RNC e certificados.
              </p>
            </div>
          </div>

          {/* Botão “Gerenciar” */}
          <button
            type="button"
            onClick={onOpenDocuments}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shrink-0"
          >
            Gerenciar Modelos
          </button>
        </div>

        {/* Botão “Salvar alterações” */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-sm transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>

      {/* File Upload Modal (Vercel Blob) */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Atualizar Foto de Perfil"
        category="avatar"
        onFileUploaded={(url) => {
          updateProfile({ avatarUrl: url });
          setSuccessMessage('Foto de perfil atualizada no Vercel Blob!');
        }}
      />
    </div>
  );
};
