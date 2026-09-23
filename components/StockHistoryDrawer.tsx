'use client';

import React from 'react';
import { X, ArrowUpRight, ArrowDownRight, Clock, Download } from 'lucide-react';
import { StockHistoryItem, Product } from '@/lib/types';

interface StockHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: StockHistoryItem[];
  products: Product[];
}

/**
 * Sanitize cell value to prevent CSV Formula Injection (CWE-1236)
 */
function sanitizeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value);
  // Neutralize formula trigger characters (=, +, -, @, \t, \r)
  const isFormula = /^[=+\-@\t\r]/.test(str);
  const safeStr = isFormula ? `'${str}` : str;
  return `"${safeStr.replace(/"/g, '""')}"`;
}

export const StockHistoryDrawer: React.FC<StockHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  products,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const PAGE_SIZE = 20;

  if (!isOpen) return null;

  const totalPages = Math.ceil(history.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentHistory = history.slice(startIndex, endIndex);

  const exportInventoryCSV = () => {
    const headers = ['Product Name', 'Subtitle', 'Category', 'Color / Shade', 'Size 36', 'Size 38', 'Size 40', 'Size 42', 'Size 44', 'Total Units'];
    const rows: string[][] = [];

    products.forEach(p => {
      p.variants.forEach(v => {
        rows.push([
          sanitizeCsvCell(p.name),
          sanitizeCsvCell(p.subtitle || ''),
          sanitizeCsvCell(p.category),
          sanitizeCsvCell(v.colorName),
          String(v.sizes['36'] || 0),
          String(v.sizes['38'] || 0),
          String(v.sizes['40'] || 0),
          String(v.sizes['42'] || 0),
          String(v.sizes['44'] || 0),
          String(v.totalUnits || 0),
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `selection-textiles-inventory-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full sm:max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Activity & Movement Ledger</h3>
              <p className="text-[11px] text-slate-500">Real-time inventory changes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CSV Export Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">Download Data Sheet:</span>
          <button
            onClick={exportInventoryCSV}
            className="tap-press inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* History Ledger List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
          {currentHistory.length > 0 ? (
            currentHistory.map((item) => {
              const isInward = item.changeAmount > 0;
              return (
                <div
                  key={item.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-900 font-medium text-xs truncate max-w-[200px]">
                      {item.productName} • <span className="text-slate-500 font-normal">{item.variantName}</span>
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        isInward
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {isInward ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      <span>{isInward ? `+${item.changeAmount}` : item.changeAmount} pcs</span>
                    </span>
                  </div>

                  <div className="text-slate-600 text-[11px] pt-0.5">
                    Size <strong className="text-slate-900">{item.size}</strong> • {item.reason}
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                    <span>Balance: <strong className="text-slate-700 num-tabular">{item.resultingQuantity}</strong> pcs</span>
                    <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              No recent stock movement logs.
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({history.length} records)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-medium text-xs hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-medium text-xs hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
