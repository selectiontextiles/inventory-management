'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, History, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface HeaderProps {
  onAddNew: () => void;
  onOpenHistory: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalProducts: number;
}

export const Header: React.FC<HeaderProps> = ({
  onAddNew,
  onOpenHistory,
  onRefresh,
  isLoading,
  totalProducts,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand identity with Selection Textiles Logo */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm shrink-0">
            <Image
              src="/logo.png"
              alt="Selection Textiles Logo"
              fill
              className="object-contain p-0.5"
              priority
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate">
                Selection Textiles
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 font-medium">
              <span>{totalProducts} Designs</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {isSupabaseConfigured ? 'Live' : 'Demo'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Sync Inventory"
            aria-label="Sync Inventory"
            className="tap-press w-8 h-8 sm:w-auto sm:h-9 sm:px-3 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center justify-center gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-slate-900' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={onOpenHistory}
            title="Activity Logs"
            aria-label="Activity Logs"
            className="tap-press w-8 h-8 sm:w-auto sm:h-9 sm:px-3 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center justify-center gap-1.5 text-xs font-medium"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Logs</span>
          </button>

          <button
            onClick={onAddNew}
            className="tap-press h-8 sm:h-9 px-3 sm:px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs sm:text-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>New Product</span>
          </button>
        </div>
      </div>
    </header>
  );
};
