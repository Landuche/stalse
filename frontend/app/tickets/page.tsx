'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import TicketModal from '../../components/ui/TicketModal';
import Toast from '../../components/ui/Toast';
import { getStatusBadge, getPriorityBadge } from '../../utils/formatters';

interface Ticket {
  id: number;
  created_at: string;
  customer_name: string;
  channel: string;
  subject: string;
  status: string;
  priority: string;
}

interface PaginatedResponse {
  items: Ticket[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function TicketsPage() {
  const [data, setData] = useState<PaginatedResponse>({
    items: [],
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 1
  });
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchTickets = useCallback(async (pageNumber = 1, size = pageSize, searchQuery = activeSearch) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNumber.toString(),
        page_size: size.toString()
      });
      if (searchQuery) queryParams.append('search', searchQuery);

      const res = await fetch(`http://localhost:8000/tickets?${queryParams.toString()}`);
      const result: PaginatedResponse = await res.json();
      setData(result);
    } catch (err) {
      console.error('Erro ao buscar tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [activeSearch, pageSize]);

  useEffect(() => {
    fetchTickets(1, pageSize, activeSearch);
  }, [activeSearch, pageSize, fetchTickets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(search);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    fetchTickets(1, newSize, activeSearch);
  };

  // Callback chamado quando o modal salva com sucesso
  const handleModalSuccess = (updatedTicket: Ticket, message: string) => {
    // Atualiza a tabela
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === updatedTicket.id ? updatedTicket : item)),
    }));
    // Fecha o modal
    setSelectedTicketId(null);
    // Exibe o Toast
    setToastMessage(message);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lista de Tickets</h2>
          <p className="text-sm text-gray-500">
            Exibindo {data.items.length} de <strong className="text-gray-900">{data.total.toLocaleString()}</strong> tickets cadastrados.
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar cliente ou assunto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            Buscar
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">Criado em</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Canal</th>
                <th className="p-4">Assunto</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Prioridade</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Carregando dados da página {data.page}...</td></tr>
              ) : data.items.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Nenhum ticket encontrado.</td></tr>
              ) : (
                data.items.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-600 whitespace-nowrap">{new Date(t.created_at).toLocaleString('pt-BR')}</td>
                    <td className="p-4 font-medium text-gray-900">{t.customer_name}</td>
                    <td className="p-4 text-gray-600">{t.channel}</td>
                    <td className="p-4 text-gray-800 max-w-xs truncate">{t.subject}</td>
                    <td className="p-4 text-center">{getStatusBadge(t.status)}</td>
                    <td className="p-4 text-center">{getPriorityBadge(t.priority)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedTicketId(t.id)}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-xs cursor-pointer hover:underline"
                      >
                        Detalhes <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={data.page}
          totalPages={data.total_pages}
          pageSize={data.page_size}
          totalItems={data.total}
          onPageChange={(p) => fetchTickets(p, pageSize, activeSearch)}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
        />
      </div>

      <TicketModal
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onSuccess={handleModalSuccess}
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}