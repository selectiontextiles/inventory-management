'use client';

import React from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { Product, ColorVariant, STANDARD_SIZES } from '@/lib/types';

interface VariantStepperModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  variant: ColorVariant | null;
  onAdjustVariantStock: (productId: string, variantId: string, size: string, delta: number) => Promise<void>;
}

export const VariantStepperModal: React.FC<VariantStepperModalProps> = ({
  isOpen,
  onClose,
  product,
  variant,
  onAdjustVariantStock,
}) => {
  const [selectedSize, setSelectedSize] = React.useState<string>('38');

  if (!isOpen || !product || !variant) return null;

  const currentQty = variant.sizes[selectedSize] ?? 0;

  const handleStep = async (delta: number) => {
    if (delta < 0 && currentQty <= 0) return;
    await onAdjustVariantStock(product.id, variant.id, selectedSize, delta);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 border border-slate-200 animate-in slide-in-from-bottom-3 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              {product.name}
            </span>
            <h3 className="font-bold text-slate-900 text-base mt-0.5 truncate max-w-[240px]">
              {variant.colorName}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Size Selection Tab Strip */}
        <div className="py-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Select Size
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {STANDARD_SIZES.map((sz) => {
              const isSelected = selectedSize === sz;
              const qty = variant.sizes[sz] ?? 0;
              return (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`tap-press py-2 rounded-xl text-center border transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase block opacity-70">
                    {sz}
                  </span>
                  <span className="text-xs font-mono font-bold block num-tabular mt-0.5">
                    {qty}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Large Tactile Counter */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center my-1 space-y-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Size {selectedSize} Stock
          </div>

          <div className="text-4xl font-extrabold font-mono text-slate-900 num-tabular tracking-tight">
            {currentQty} <span className="text-sm font-normal text-slate-400">units</span>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => handleStep(-1)}
              disabled={currentQty <= 0}
              className="tap-press w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-xl shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
              aria-label="Subtract 1"
            >
              <Minus className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleStep(1)}
              className="tap-press w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-md hover:bg-slate-800"
              aria-label="Add 1"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => handleStep(-5)}
              disabled={currentQty < 5}
              className="tap-press px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold disabled:opacity-30 hover:bg-slate-100"
            >
              -5
            </button>
            <button
              onClick={() => handleStep(5)}
              className="tap-press px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              +5
            </button>
            <button
              onClick={() => handleStep(10)}
              className="tap-press px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              +10
            </button>
          </div>
        </div>

        {/* Done Button */}
        <div className="pt-3">
          <button
            onClick={onClose}
            className="tap-press w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
