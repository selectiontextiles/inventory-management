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
  const [isDirectEditing, setIsDirectEditing] = React.useState(false);
  const [inputVal, setInputVal] = React.useState('');

  if (!isOpen || !product || !variant) return null;

  const currentQty = variant.sizes[selectedSize] ?? 0;

  const handleStep = async (delta: number) => {
    if (delta < 0 && currentQty <= 0) return;
    await onAdjustVariantStock(product.id, variant.id, selectedSize, delta);
  };

  const handleDirectSave = async () => {
    const nextVal = Math.max(0, parseInt(inputVal, 10) || 0);
    const delta = nextVal - currentQty;
    if (delta !== 0) {
      await onAdjustVariantStock(product.id, variant.id, selectedSize, delta);
    }
    setIsDirectEditing(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-7 border border-slate-200 animate-in slide-in-from-bottom-3 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {product.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0"
                style={variant.colorHex ? { backgroundColor: variant.colorHex } : undefined}
              />
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg truncate max-w-[280px] sm:max-w-md">
                {variant.colorName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Size Selection Tab Strip */}
        <div className="py-4">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Select Size
          </label>
          <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
            {STANDARD_SIZES.map((sz) => {
              const isSelected = selectedSize === sz;
              const qty = variant.sizes[sz] ?? 0;
              return (
                <button
                  key={sz}
                  onClick={() => {
                    setSelectedSize(sz);
                    setIsDirectEditing(false);
                  }}
                  className={`tap-press py-2.5 sm:py-3 rounded-xl text-center border transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] sm:text-xs font-bold uppercase block opacity-70">
                    {sz}
                  </span>
                  <span className="text-sm sm:text-base font-mono font-extrabold block num-tabular mt-0.5">
                    {qty}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tactile Counter Card */}
        <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 text-center my-1 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Size {selectedSize} Stock
            </span>
          </div>

          {/* Count Display or Direct Edit Input */}
          {isDirectEditing ? (
            <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
              <input
                type="number"
                min="0"
                autoFocus
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDirectSave();
                  if (e.key === 'Escape') setIsDirectEditing(false);
                }}
                className="w-28 text-center text-3xl font-extrabold font-mono py-1 bg-white border-2 border-slate-900 rounded-xl focus:outline-none"
              />
              <button
                onClick={handleDirectSave}
                className="px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
              >
                Set
              </button>
              <button
                onClick={() => setIsDirectEditing(false)}
                className="px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div 
              onClick={() => {
                setInputVal(String(currentQty));
                setIsDirectEditing(true);
              }}
              title="Click to type exact count"
              className="group cursor-pointer inline-flex items-baseline justify-center gap-2 hover:opacity-80 transition"
            >
              <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 num-tabular tracking-tight">
                {currentQty}
              </span>
              <span className="text-sm sm:text-base font-medium text-slate-400">
                units
              </span>
              <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition underline pl-1">
                (edit)
              </span>
            </div>
          )}

          {/* Large Stepper Buttons */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 pt-1">
            <button
              onClick={() => handleStep(-1)}
              disabled={currentQty <= 0}
              className="tap-press w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-2xl shadow-sm disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 hover:border-slate-300 transition"
              aria-label="Subtract 1"
            >
              <Minus className="w-6 h-6" />
            </button>

            <button
              onClick={() => handleStep(1)}
              className="tap-press w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-md hover:bg-slate-800 hover:scale-[1.02] transition active:scale-95"
              aria-label="Add 1"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Increment Presets */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 pt-1">
            <button
              onClick={() => handleStep(-10)}
              disabled={currentQty < 10}
              className="tap-press px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold disabled:opacity-25 hover:bg-slate-100 transition"
            >
              -10
            </button>
            <button
              onClick={() => handleStep(-5)}
              disabled={currentQty < 5}
              className="tap-press px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold disabled:opacity-25 hover:bg-slate-100 transition"
            >
              -5
            </button>
            <button
              onClick={() => handleStep(5)}
              className="tap-press px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
            >
              +5
            </button>
            <button
              onClick={() => handleStep(10)}
              className="tap-press px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
            >
              +10
            </button>
          </div>
        </div>

        {/* Done Button */}
        <div className="pt-4">
          <button
            onClick={onClose}
            className="tap-press w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
