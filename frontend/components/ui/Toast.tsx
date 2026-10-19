'use client';

import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-800 animate-in slide-in-from-bottom-5 duration-300">
      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
      <span className="text-sm font-medium pr-2">{message}</span>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
      >
        <X size={14} />
      </button>
    </div>
  );
}