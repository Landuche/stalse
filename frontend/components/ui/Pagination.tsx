'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  loading?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
  loading = false,
}: PaginationProps) {
  // Lógica para calcular os números de páginas visíveis
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Lado Esquerdo: Info + Seletor de Itens por Página */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600">
        <span>
          Página <strong className="text-gray-900">{page}</strong> de{' '}
          <strong className="text-gray-900">{totalPages}</strong> ({totalItems.toLocaleString()} registros)
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Exibir:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={loading}
              className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} por pág.
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Lado Direito: Botões da Paginação */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1 || loading}
          className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Primeira página"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || loading}
          className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {getVisiblePages().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={loading}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
              page === p
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Próxima página"
        >
          <ChevronRight size={16} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || loading}
          className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Última página"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}