import React, { useState } from 'react';
import {
  HeadphonesIcon,
  Plus,
  Send,
  MessageSquare,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../common/EmptyState';
import { TechnicalTicket } from '../../types';
import { STANDARD_NORMS } from '../../data/initialData';

export const TechnicalSupportView: React.FC = () => {
  const { tickets, addTicket, addTicketMessage } = useData();
  const { user } = useAuth();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    tickets[0]?.id || null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    norm: 'ISO 9001',
    priority: 'Média' as 'Baixa' | 'Média' | 'Alta' | 'Urgente',
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject) return;
    addTicket(formData);
    setIsModalOpen(false);
    setFormData({
      subject: '',
      norm: 'ISO 9001',
      priority: 'Média',
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedTicket) return;
    addTicketMessage(
      selectedTicket.id,
      chatInput.trim(),
      user?.name || 'Solicitante',
      false
    );
    setChatInput('');

    // Simulated quick response from technical committee
    setTimeout(() => {
      addTicketMessage(
        selectedTicket.id,
        'Recebido pelo plantão do Corpo Técnico. Nossa equipe técnica está analisando os apontamentos conforme a norma indicada.',
        'Eng. Plantonista Nexus Veritas',
        true
      );
    }, 1500);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Fala com o Corpo Técnico
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Canal consultivo oficial para interpretação normativa, impasses técnicos e pareceres de certificação.
          </p>
        </div>

        {/* Botão “+ Nova solicitação” */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nova Consulta</span>
        </button>
      </div>

      {/* Main Content: Lista de solicitações + área de conversa OR Empty state */}
      {tickets.length === 0 ? (
        <EmptyState
          icon={HeadphonesIcon}
          title="Nenhuma solicitação aberta"
          description="Você não possui consultas técnicas em andamento com o corpo de engenheiros e auditores master da Nexus Veritas."
          actionLabel="+ Nova consulta"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
          {/* Coluna Esquerda: Lista de solicitações */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-950/50">
            <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Consultas Técnicas ({tickets.length})
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                + Nova
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-950/50 border-l-4 border-blue-500'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/80">
                        {t.norm}
                      </span>
                      <span
                        className={`font-semibold ${
                          t.status === 'Respondido'
                            ? 'text-emerald-400'
                            : t.status === 'Em Análise'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-white line-clamp-1 mt-1">
                      {t.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>Prioridade {t.priority}</span>
                      <span>{t.createdAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna Direita: Área de conversa */}
          <div className="lg:col-span-7 flex flex-col bg-slate-900/60">
            {selectedTicket ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">
                        {selectedTicket.subject}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60">
                        {selectedTicket.norm}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Aberto em {selectedTicket.createdAt} · Prioridade {selectedTicket.priority}
                    </p>
                  </div>
                </div>

                {/* Messages Thread */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
                  {selectedTicket.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        msg.isStaff ? 'items-start' : 'items-end'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                        {msg.isStaff && (
                          <ShieldCheck className="w-3 h-3 text-blue-400 inline" />
                        )}
                        <span className="font-semibold">{msg.sender}</span>
                        <span>·</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed shadow-xs ${
                          msg.isStaff
                            ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-xs'
                            : 'bg-blue-600 text-white rounded-tr-xs shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Digite sua dúvida ou parecer técnico..."
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xs"
                    title="Enviar mensagem"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-xs">
                Selecione uma solicitação ao lado para visualizar a conversa.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: + Nova Solicitação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-700 overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-white text-base">
                  Nova Consulta ao Corpo Técnico
                </h3>
                <p className="text-xs text-slate-400">
                  Parecer emitido pelo comitê de certificação.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assunto / Questão Técnica *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ex: Interpretação da cláusula 8.4 para fornecedor internacional"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Norma em Questão
                  </label>
                  <select
                    value={formData.norm}
                    onChange={(e) => setFormData({ ...formData, norm: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {STANDARD_NORMS.map((n) => (
                      <option key={n.code} value={n.code}>
                        {n.code}
                      </option>
                    ))}
                    <option value="Geral">Diretriz Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Criticidade / Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente (Em Auditoria)</option>
                  </select>
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
                  Abrir Consulta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
