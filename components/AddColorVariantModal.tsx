'use client';

import React, { useState } from 'react';
import { X, Check, Plus } from 'lucide-react';
import { Product, STANDARD_SIZES } from '@/lib/types';

interface AddColorVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSaveVariant: (productId: string, colorName: string, sizes: Record<string, number>) => Promise<void>;
}

export const AddColorVariantModal: React.FC<AddColorVariantModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaveVariant,
}) => {
  const [colorName, setColorName] = useState('');
  const [sizes, setSizes] = useState<Record<string, number>>({
    '36': 0, '38': 0, '40': 0, '42': 0, '44': 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleSizeChange = (sz: string, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setSizes(prev => ({ ...prev, [sz]: num }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveVariant(product.id, colorName.trim(), sizes);
      setColorName('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Add Color / Shade</h3>
            <p className="text-xs text-slate-500">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-3 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Color / Shade Name *
            </label>
            <input
              type="text"
              required
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="e.g. Royal Blue / Shade No. 18"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Initial Sizes (36 — 44)
            </label>
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {STANDARD_SIZES.map(sz => {
                const qty = sizes[sz] ?? 0;
                return (
                  <div key={sz} className="bg-slate-50 rounded-xl p-2 sm:p-2.5 border border-slate-200 text-center shadow-sm flex flex-col justify-between">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {sz}
                    </span>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSizeChange(sz, String(Math.max(0, qty - 1)))}
                        className="w-6 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold transition select-none"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        onChange={(e) => handleSizeChange(sz, e.target.value)}
                        className="w-10 sm:w-12 h-7 text-center font-mono font-black num-tabular text-slate-900 text-sm sm:text-base bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleSizeChange(sz, String(qty + 1))}
                        className="w-6 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center text-xs font-bold transition select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add Shade</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
