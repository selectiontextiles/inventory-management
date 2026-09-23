'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export interface ToastData {
  id?: string;
  message: string;
  title?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const type = toast.type || 'success';

  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
    error: <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />,
  };

  const badgeColorMap = {
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    error: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    info: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed top-4 right-4 sm:top-5 sm:right-6 z-[100] max-w-sm w-[calc(100vw-2rem)] sm:w-auto pointer-events-auto select-none"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
        <div className="shrink-0">
          {iconMap[type]}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          {toast.title && (
            <p className="text-xs font-bold text-slate-100 tracking-tight leading-snug">
              {toast.title}
            </p>
          )}
          <p className="text-xs font-medium text-slate-300 leading-snug break-words">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-200 p-1 -mr-1 rounded-lg hover:bg-slate-800 transition shrink-0"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
