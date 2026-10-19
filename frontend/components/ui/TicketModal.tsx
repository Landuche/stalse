'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle } from 'lucide-react';
import { STATUS_LABELS, PRIORITY_LABELS } from '../../utils/formatters';

interface Ticket {
  id: number;
  created_at: string;
  customer_name: string;
  channel: string;
  subject: string;
  status: string;
  priority: string;
}

interface TicketModalProps {
  ticketId: number | null;
  onClose: () => void;
  onSuccess: (updatedTicket: Ticket, msg: string) => void;
}

export default function TicketModal({
  ticketId,
  onClose,
  onSuccess,
}: TicketModalProps) {
  const [mounted, setMounted] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!ticketId) return;
    setLoading(true);
    setErrorMsg('');
    fetch(`http://localhost:8000/tickets/${ticketId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Não foi possível carregar os detalhes do ticket.');
        return res.json();
      })
      .then((data) => {
        setTicket(data);
        setStatus(data.status);
        setPriority(data.priority);
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Erro de conexão com o servidor.');
      })
      .finally(() => setLoading(false));
  }, [ticketId]);

  if (!ticketId || !mounted) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch(`http://localhost:8000/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, priority }),
      });

      if (!res.ok) {
        throw new Error('Falha ao atualizar o ticket. Tente novamente.');
      }

      const updated: Ticket = await res.json();
      onSuccess(updated, 'Ticket atualizado com sucesso!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro ao tentar salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  // Conteúdo do Modal encapsulado para ser injetado via Portal no body
  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Ticket #{ticketId}
            </span>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {loading ? 'Carregando...' : ticket?.subject}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-12 text-center text-gray-500 font-medium">
              Carregando detalhes do ticket...
            </div>
          ) : ticket ? (
            <>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm border border-gray-100">
                <div>
                  <span className="block text-gray-400 text-xs font-medium">Cliente</span>
                  <span className="font-semibold text-gray-900">{ticket.customer_name}</span>
                </div>
                <div>
                  <span className="block text-gray-400 text-xs font-medium">Canal</span>
                  <span className="font-semibold text-gray-900">{ticket.channel}</span>
                </div>
                <div className="col-span-2 border-t border-gray-200/60 pt-2.5">
                  <span className="block text-gray-400 text-xs font-medium">Criado em</span>
                  <span className="font-medium text-gray-700">
                    {new Date(ticket.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="open">{STATUS_LABELS.open}</option>
                    <option value="in_progress">{STATUS_LABELS.in_progress}</option>
                    <option value="pending">{STATUS_LABELS.pending}</option>
                    <option value="closed">{STATUS_LABELS.closed}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Prioridade
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="low">{PRIORITY_LABELS.low}</option>
                    <option value="medium">{PRIORITY_LABELS.medium}</option>
                    <option value="high">{PRIORITY_LABELS.high}</option>
                    <option value="urgent">{PRIORITY_LABELS.urgent}</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg text-sm flex items-center gap-2 transition disabled:opacity-50 shadow-xs"
                  >
                    <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="py-6 text-center text-red-500 text-sm font-medium">
              {errorMsg || 'Erro ao carregar dados do ticket.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}