'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

interface Ticket {
  id: number;
  created_at: string;
  customer_name: string;
  channel: string;
  subject: string;
  status: string;
  priority: string;
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!params.id) return;
    fetch(`http://localhost:8000/tickets/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTicket(data);
        setStatus(data.status);
        setPriority(data.priority);
      })
      .catch((err) => console.error(err));
  }, [params.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await fetch(`http://localhost:8000/tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, priority }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTicket(updated);
        setSuccessMsg('Ticket atualizado com sucesso! (Webhook disparado caso aplicável)');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!ticket) return <div className="p-6 text-center text-gray-500">Carregando detalhes...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
        <ArrowLeft size={16} /> Voltar para lista
      </button>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Ticket #{ticket.id}</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">{ticket.subject}</h2>
          <p className="text-sm text-gray-500 mt-1">Criado em {new Date(ticket.created_at).toLocaleString('pt-BR')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
          <div>
            <span className="block text-gray-500 text-xs">Cliente</span>
            <span className="font-semibold text-gray-800">{ticket.customer_name}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-xs">Canal</span>
            <span className="font-semibold text-gray-800">{ticket.channel}</span>
          </div>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="open">Aberto</option>
              <option value="in_progress">Em Andamento</option>
              <option value="closed">Fechado (Dispara Webhook)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta (Dispara Webhook)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}