import React from 'react';
import { CheckCircle2, Clock, AlertCircle, AlertTriangle } from 'lucide-react';

export const STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  aberto: 'Aberto',
  in_progress: 'Em Andamento',
  'in progress': 'Em Andamento',
  'em andamento': 'Em Andamento',
  pending: 'Pendente',
  pendente: 'Pendente',
  closed: 'Fechado',
  fechado: 'Fechado',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  baixa: 'Baixa',
  medium: 'Média',
  média: 'Média',
  media: 'Média',
  high: 'Alta',
  alta: 'Alta',
  urgent: 'Urgente',
  urgente: 'Urgente',
};

export const getStatusBadge = (status: string) => {
  const normalized = status?.toLowerCase() || 'open';
  const label = STATUS_LABELS[normalized] || 'Aberto';

  const baseClasses = 'inline-flex items-center justify-center gap-1.5 w-36 px-2.5 py-1 rounded-full text-xs font-semibold';

  switch (normalized) {
    case 'closed':
    case 'fechado':
      return (
        <span className={`${baseClasses} bg-emerald-100 text-emerald-700`}>
          <CheckCircle2 size={12} /> {label}
        </span>
      );
    case 'in_progress':
    case 'in progress':
    case 'em andamento':
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-700`}>
          <Clock size={12} /> {label}
        </span>
      );
    case 'pending':
    case 'pendente':
      return (
        <span className={`${baseClasses} bg-purple-100 text-purple-700`}>
          <Clock size={12} /> {label}
        </span>
      );
    case 'open':
    case 'aberto':
    default:
      return (
        <span className={`${baseClasses} bg-amber-100 text-amber-700`}>
          <AlertCircle size={12} /> {label}
        </span>
      );
  }
};

export const getPriorityBadge = (priority: string) => {
  const normalized = priority?.toLowerCase() || 'medium';
  const label = PRIORITY_LABELS[normalized] || 'Média';

  const baseClasses = 'inline-flex items-center justify-center gap-1 w-20 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide';

  switch (normalized) {
    case 'urgent':
    case 'urgente':
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800 border border-red-200 animate-pulse`}>
          <AlertTriangle size={12} /> {label}
        </span>
      );
    case 'high':
    case 'alta':
      return (
        <span className={`${baseClasses} bg-orange-100 text-orange-700`}>
          {label}
        </span>
      );
    case 'medium':
    case 'média':
    case 'media':
      return (
        <span className={`${baseClasses} bg-amber-100 text-amber-700`}>
          {label}
        </span>
      );
    case 'low':
    case 'baixa':
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-600`}>
          {label}
        </span>
      );
  }
};