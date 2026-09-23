'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Tag, MoreVertical, Edit2, Trash2, Plus, Maximize2, AlertCircle } from 'lucide-react';
import { Product, ColorVariant, STANDARD_SIZES } from '@/lib/types';

interface ProductColorCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onSelectVariant: (product: Product, variant: ColorVariant) => void;
  onOpenImagePreview: (imageUrl: string, title: string) => void;
  onAddVariant: (product: Product) => void;
}

export const ProductColorCard: React.FC<ProductColorCardProps> = React.memo(({
  product,
  onEdit,
  onDelete,
  onSelectVariant,
  onOpenImagePreview,
  onAddVariant,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-none overflow-hidden transition hover:border-slate-300">
      {/* Product Header: Prominent Image + Full Title + Subtitle & Alert Badge */}
      <div className="p-4 sm:p-5 pb-3.5">
        <div className="flex items-start gap-3.5 relative">
          {/* Prominent Visual Reference Photo */}
          <div
            onClick={() => product.imageUrl && onOpenImagePreview(product.imageUrl, product.name)}
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200/90 cursor-pointer bg-slate-100 group shrink-0"
            title="Tap to preview image"
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 64px, 80px"
                className="object-cover group-hover:scale-105 transition duration-200"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px]">
                <span>No Photo</span>
              </div>
            )}
            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/25 flex items-center justify-center transition opacity-0 group-hover:opacity-100">
              <Maximize2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Product Title, Subtitle, and Inline Alerts Badge */}
          <div className="flex-1 min-w-0 pr-6">
            {/* Full Product Title with 100% visibility */}
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h2>

            {/* Subtitle / Fabric Tag */}
            {product.subtitle && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{product.subtitle}</span>
              </div>
            )}

            {/* Meta Row: Alerts Pill & Total Units */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {product.totalAlerts > 0 ? (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                  <AlertCircle className="w-3 h-3 text-[#b45309]" />
                  <span>{product.totalAlerts} alerts</span>
                </span>
              ) : (
                <span className="inline-flex items-center font-mono text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Healthy stock
                </span>
              )}

              <span className="text-[11px] font-semibold text-slate-400">
                • {product.totalUnits} total units
              </span>
            </div>
          </div>

          {/* Options Menu */}
          <div className="absolute top-0 right-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              aria-label="Product options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-20 text-xs font-medium"
                onMouseLeave={() => setIsMenuOpen(false)}
              >
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onAddVariant(product);
                  }}
                  className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-600" />
                  <span>Add Color/Shade</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(product);
                  }}
                  className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Details</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (confirm(`Delete ${product.name}?`)) {
                      onDelete(product.id);
                    }
                  }}
                  className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Color / Shade Variant Rows List */}
      <div className="divide-y divide-slate-100 border-t border-slate-100">
        {product.variants.map((variant) => {
          return (
            <div
              key={variant.id}
              onClick={() => onSelectVariant(product, variant)}
              className="px-4 sm:px-5 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              {/* Top line of variant: Radio Circle + Shade Name + Total Units */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Radio circle / Color Swatch */}
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-400 shrink-0 inline-block group-hover:border-slate-800 transition"
                    style={variant.colorHex ? { backgroundColor: variant.colorHex } : undefined}
                  />

                  {/* Color / Shade Name */}
                  <span className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight truncate">
                    {variant.colorName}
                  </span>
                </div>

                {/* Total Units */}
                <div className="shrink-0 text-right">
                  <span className="font-bold text-teal-900 text-xs sm:text-sm font-mono tracking-tight num-tabular">
                    {variant.totalUnits} units
                  </span>
                </div>
              </div>

              {/* Bottom line: Sizes with counts (36: 1 · 38: 2 · 40: 3 · 42: 2 · 44: 3) */}
              <div className="pl-6 pt-1 text-xs sm:text-sm text-slate-600 font-mono tracking-tight flex items-center gap-2 sm:gap-2.5 flex-wrap">
                {STANDARD_SIZES.map((sz, idx) => {
                  const q = variant.sizes[sz] ?? 0;
                  const isZero = q === 0;

                  return (
                    <React.Fragment key={sz}>
                      <span className={isZero ? 'text-slate-400' : 'text-slate-700'}>
                        <span className="font-normal text-slate-500">{sz}:</span>{' '}
                        <strong className={`font-bold ${isZero ? 'text-slate-400' : 'text-slate-900'}`}>{q}</strong>
                      </span>
                      {idx < STANDARD_SIZES.length - 1 && (
                        <span className="text-slate-300 font-sans">·</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ProductColorCard.displayName = 'ProductColorCard';
