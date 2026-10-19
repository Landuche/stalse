'use client';

import { useState, useEffect } from 'react';
import { BarChart3, CheckCircle2, AlertTriangle, Layers, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, TrendingUp, RefreshCw, Calendar } from 'lucide-react';

interface Metrics {
  total_tickets: number;
  closed_tickets: number;
  high_priority_tickets: number;
  tickets_per_day: Record<string, number>;
  top_categories: Record<string, number>;
}

const ITEMS_PER_PAGE = 8; 

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dayPage, setDayPage] = useState(1);
  const [jumpInput, setJumpInput] = useState('');

  const fetchMetrics = () => {
    setLoading(true);
    fetch('http://localhost:8000/metrics')
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch((err) => console.error('Erro ao carregar métricas:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="animate-spin text-indigo-600" size={32} />
        <p className="text-sm text-gray-500 font-medium">Processando métricas...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
        <p className="font-medium">Erro ao carregar métricas.</p>
      </div>
    );
  }

  const closedRate = metrics.total_tickets > 0 
    ? ((metrics.closed_tickets / metrics.total_tickets) * 100).toFixed(1) 
    : '0';

  const highPriorityRate = metrics.total_tickets > 0 
    ? ((metrics.high_priority_tickets / metrics.total_tickets) * 100).toFixed(1) 
    : '0';

  // Paginação dos dias
  const daysEntries = Object.entries(metrics.tickets_per_day || {}).sort(([a], [b]) => b.localeCompare(a));
  const totalDayPages = Math.ceil(daysEntries.length / ITEMS_PER_PAGE) || 1;
  const paginatedDays = daysEntries.slice((dayPage - 1) * ITEMS_PER_PAGE, dayPage * ITEMS_PER_PAGE);

  // Manipulador para pular para uma página especifica via input
  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalDayPages) {
      setDayPage(pageNum);
      setJumpInput('');
    }
  };

  // Top categorias ordenadas por maior valor
  const topCategoriesEntries = Object.entries(metrics.top_categories || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const maxCategoryCount = topCategoriesEntries.length > 0 ? topCategoriesEntries[0][1] : 1;

  return (
    <div className="space-y-8 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        </div>
        <button
          onClick={fetchMetrics}
          className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-xs transition"
        >
          <RefreshCw size={14} /> Atualizar Dados
        </button>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total de Chamados</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">{metrics.total_tickets.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <BarChart3 size={28} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <TrendingUp size={14} className="text-indigo-600" /> Total de dados no banco
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Tickets Fechados</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">{metrics.closed_tickets.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={28} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <span>{closedRate}%</span> da taxa total resolvida
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Prioridade Alta</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">{metrics.high_priority_tickets.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle size={28} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
            <span>{highPriorityRate}%</span> requerem atenção
          </div>
        </div>
      </div>

      {/* Grid de Tabelas e Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chamados por Dia */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
                <Calendar size={18} className="text-indigo-600" /> Volume de Chamados por Dia
              </h3>
              <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-full">
                {daysEntries.length} dias mapeados
              </span>
            </div>

            <div className="space-y-2.5 min-h-[340px]">
              {paginatedDays.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">Nenhum registro diário encontrado.</p>
              ) : (
                paginatedDays.map(([date, count]) => (
                  <div key={date} className="flex items-center justify-between text-sm p-3 rounded-xl bg-gray-50/70 hover:bg-gray-50 transition border border-gray-100">
                    <span className="text-gray-700 font-medium">{date}</span>
                    <span className="font-bold text-gray-900 bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-2xs">
                      {count} <span className="text-xs text-gray-400 font-normal">tickets</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Paginação */}
          {totalDayPages > 1 && (
            <div className="pt-4 mt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  Página <strong className="text-gray-900">{dayPage}</strong> de <strong className="text-gray-900">{totalDayPages}</strong>
                </span>
                
                {/* saltar para uma página especifica */}
                <form onSubmit={handleJumpPage} className="flex items-center gap-1 ml-2">
                  <input
                    type="number"
                    min="1"
                    max={totalDayPages}
                    placeholder="Ir p/"
                    value={jumpInput}
                    onChange={(e) => setJumpInput(e.target.value)}
                    className="w-14 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center font-medium"
                    title="Digite o número da página e pressione Enter"
                  />
                </form>
              </div>

              <div className="flex items-center gap-1">
                {/* Ir para o Inicio */}
                <button
                  onClick={() => setDayPage(1)}
                  disabled={dayPage === 1}
                  className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                  title="Primeira Página"
                >
                  <ChevronsLeft size={16} />
                </button>
                {/* Anterior */}
                <button
                  onClick={() => setDayPage((p) => Math.max(p - 1, 1))}
                  disabled={dayPage === 1}
                  className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                  title="Anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                {/* Próxima */}
                <button
                  onClick={() => setDayPage((p) => Math.min(p + 1, totalDayPages))}
                  disabled={dayPage === totalDayPages}
                  className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                  title="Próxima"
                >
                  <ChevronRight size={16} />
                </button>
                {/* Ir para o Fim */}
                <button
                  onClick={() => setDayPage(totalDayPages)}
                  disabled={dayPage === totalDayPages}
                  className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                  title="Última Página"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Categorias */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
                <Layers size={18} className="text-indigo-600" /> Top Categorias / Assuntos
              </h3>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full">
                Top 5
              </span>
            </div>

            <div className="space-y-4 min-h-[340px]">
              {topCategoriesEntries.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">Nenhuma categoria encontrada.</p>
              ) : (
                topCategoriesEntries.map(([cat, count]) => {
                  const percentage = Math.round((count / maxCategoryCount) * 100);
                  return (
                    <div key={cat} className="space-y-1.5 bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-800 font-medium truncate max-w-[280px]" title={cat}>{cat}</span>
                        <span className="font-bold text-indigo-600 text-xs bg-indigo-50 px-2.5 py-1 rounded-md">
                          {count} tickets
                        </span>
                      </div>
                      {/* Barra de Progresso Visual */}
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}