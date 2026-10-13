import React, { useState } from 'react';
import {
  Users2,
  Search,
  MapPin,
  Star,
  CheckCircle2,
  MessageSquare,
  FileCheck2,
  Filter,
  Navigation,
  Plus,
  X,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ProfessionalAuditor } from '../../types';
import { STANDARD_NORMS } from '../../data/initialData';

export const NetworkView: React.FC = () => {
  const { professionals, addProfessional } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUF, setSelectedUF] = useState<string>('Todas');
  const [selectedNorm, setSelectedNorm] = useState<string>('Todas');
  const [isGeoActive, setIsGeoActive] = useState(false);
  const [userLocationName, setUserLocationName] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactSuccessMsg, setContactSuccessMsg] = useState<string | null>(null);

  // Form State for registering as an auditor in the network
  const [formData, setFormData] = useState({
    name: '',
    roleTitle: 'Auditor Líder IRCA',
    specialties: ['ISO 9001', 'ISO 14001'],
    city: 'São Paulo',
    state: 'SP',
    hourlyRate: 350,
    available: true,
    email: 'auditor@exemplo.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });

  const handleActivateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsGeoActive(true);
          setUserLocationName('Localização do Navegador Conectada');
          setContactSuccessMsg('Geolocalização ativada! Auditores mais próximos ordenados.');
          setTimeout(() => setContactSuccessMsg(null), 3000);
        },
        () => {
          setIsGeoActive(!isGeoActive);
          setUserLocationName(isGeoActive ? null : 'Região Sudeste');
        }
      );
    } else {
      setIsGeoActive(!isGeoActive);
    }
  };

  const filteredProfessionals = professionals.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesUF = selectedUF === 'Todas' ? true : p.state === selectedUF;
    const matchesNorm =
      selectedNorm === 'Todas' ? true : p.specialties.includes(selectedNorm);

    return matchesSearch && matchesUF && matchesNorm;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addProfessional(formData);
    setIsModalOpen(false);
  };

  const handleContact = (name: string) => {
    setContactSuccessMsg(`Solicitação de contato enviada para ${name}!`);
    setTimeout(() => setContactSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Rede Profissional de Auditores
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Encontre e contrate auditores líderes credenciados para missões de 1ª, 2ª e 3ª partes.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleActivateLocation}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-xs transition-all ${
              isGeoActive
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Navigation
              className={`w-4 h-4 ${isGeoActive ? 'text-emerald-400 fill-emerald-400' : 'text-slate-400'}`}
            />
            <span>{isGeoActive ? 'Localização ativa (Online)' : 'Localização ativa'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cadastrar Perito</span>
          </button>
        </div>
      </div>

      {contactSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{contactSuccessMsg}</span>
        </div>
      )}

      {/* Busca + filtros (tipo e UF) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por auditor, especialidade, credencial IRCA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Filtro UF */}
            <select
              value={selectedUF}
              onChange={(e) => setSelectedUF(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Todas">Todas as UFs</option>
              <option value="SP">São Paulo (SP)</option>
              <option value="RJ">Rio de Janeiro (RJ)</option>
              <option value="PR">Paraná (PR)</option>
              <option value="MG">Minas Gerais (MG)</option>
              <option value="RS">Rio Grande do Sul (RS)</option>
              <option value="SC">Santa Catarina (SC)</option>
              <option value="BA">Bahia (BA)</option>
            </select>

            {/* Filtro Especialidade / Norma */}
            <select
              value={selectedNorm}
              onChange={(e) => setSelectedNorm(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Todas">Todas as Normas</option>
              {STANDARD_NORMS.map((n) => (
                <option key={n.code} value={n.code}>
                  {n.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards de profissionais com avatar, especialidade, cidade, valor/hora, botões de contato */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProfessionals.map((prof) => (
          <div
            key={prof.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-3.5 mb-3">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-blue-950 border border-blue-800 overflow-hidden shrink-0 shadow-xs">
                  <img
                    src={prof.avatarUrl}
                    alt={prof.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white truncate leading-tight">
                      {prof.name}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      <span>{prof.rating}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {prof.roleTitle}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>
                      {prof.city} - {prof.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Especialidades tags */}
              <div className="flex flex-wrap gap-1.5 my-3">
                {prof.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-0.5 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-800/80 text-[10px] font-semibold"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* Valor / Hora */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Honorários Estimados:</span>
                <span className="font-extrabold text-white text-sm font-mono">
                  R$ {prof.hourlyRate} <span className="text-[11px] font-normal text-slate-400">/ hora</span>
                </span>
              </div>
            </div>

            {/* Botões de contato */}
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleContact(prof.name)}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Mensagem</span>
              </button>

              <button
                onClick={() => handleContact(prof.name)}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Solicitar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Cadastrar Perito */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-700 overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base">
                  Cadastrar Auditor na Rede
                </h3>
                <p className="text-xs text-slate-400">Credenciamento oficial para missões.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Dr. Paulo Silveira"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título Profissional
                </label>
                <input
                  type="text"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor / Hora (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    E-mail de Contato
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
