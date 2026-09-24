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
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider block">
              {product.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {variant.colorHex ? (
                <span
                  className="w-4 h-4 rounded-full border border-slate-300 inline-block shrink-0 shadow-xs"
                  style={{ backgroundColor: variant.colorHex }}
                />
              ) : null}
              <h3 className="font-black text-slate-900 text-lg sm:text-xl truncate max-w-[280px] sm:max-w-md">
                {variant.colorName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Size Selection Tab Strip */}
        <div className="py-4">
          <label className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
            Select Size
          </label>
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
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
                  className={`tap-press py-3 sm:py-3.5 rounded-xl text-center border transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className={`text-xs sm:text-sm font-extrabold uppercase block ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                    Size {sz}
                  </span>
                  <span className="text-base sm:text-xl font-mono font-black block num-tabular mt-1">
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
            <span className="text-sm sm:text-base font-bold text-slate-700 uppercase tracking-wider">
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
                className="w-32 text-center text-4xl sm:text-5xl font-black font-mono py-2 bg-white border-2 border-slate-900 rounded-xl focus:outline-none"
              />
              <button
                onClick={handleDirectSave}
                className="px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl"
              >
                Set
              </button>
              <button
                onClick={() => setIsDirectEditing(false)}
                className="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl"
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
              <span className="text-5xl sm:text-6xl font-black font-mono text-slate-900 num-tabular tracking-tight">
                {currentQty}
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-400">
                units
              </span>
              <span className="text-xs text-slate-500 opacity-75 group-hover:opacity-100 transition underline pl-1">
                (edit)
              </span>
            </div>
          )}

          {/* Large Stepper Buttons */}
          <div className="flex items-center justify-center gap-5 sm:gap-7 pt-1">
            <button
              onClick={() => handleStep(-1)}
              disabled={currentQty <= 0}
              className="tap-press w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-slate-200 text-slate-800 flex items-center justify-center font-bold text-3xl shadow-sm disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 hover:border-slate-300 transition"
              aria-label="Subtract 1"
            >
              <Minus className="w-7 h-7 stroke-[3]" />
            </button>

            <button
              onClick={() => handleStep(1)}
              className="tap-press w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-3xl shadow-md hover:bg-slate-800 hover:scale-[1.02] transition active:scale-95"
              aria-label="Add 1"
            >
              <Plus className="w-7 h-7 stroke-[3]" />
            </button>
          </div>

          {/* Quick Increment Presets */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-1">
            <button
              onClick={() => handleStep(-10)}
              disabled={currentQty < 10}
              className="tap-press px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold disabled:opacity-25 hover:bg-slate-100 transition"
            >
              -10
            </button>
            <button
              onClick={() => handleStep(-5)}
              disabled={currentQty < 5}
              className="tap-press px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold disabled:opacity-25 hover:bg-slate-100 transition"
            >
              -5
            </button>
            <button
              onClick={() => handleStep(5)}
              className="tap-press px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold hover:bg-slate-100 transition"
            >
              +5
            </button>
            <button
              onClick={() => handleStep(10)}
              className="tap-press px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold hover:bg-slate-100 transition"
            >
              +10
            </button>
          </div>
        </div>

        {/* Done Button */}
        <div className="pt-4">
          <button
            onClick={onClose}
            className="tap-press w-full py-3.5 sm:py-4 bg-slate-900 hover:bg-slate-800 text-white text-sm sm:text-base font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
