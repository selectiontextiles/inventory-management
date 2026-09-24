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
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 cursor-pointer bg-slate-50 group shrink-0"
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
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100/80">
                <Tag className="w-5 h-5 text-slate-400/80 mb-0.5" />
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400">No Photo</span>
              </div>
            )}
            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/25 flex items-center justify-center transition opacity-0 group-hover:opacity-100">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Product Title, Subtitle, and Inline Alerts Badge */}
          <div className="flex-1 min-w-0 pr-6">
            {/* Full Product Title with 100% visibility - Bigger for middle-aged users */}
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h2>

            {/* Subtitle / Fabric Tag */}
            {product.subtitle && (
              <div className="flex items-start gap-1.5 text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-tight">{product.subtitle}</span>
              </div>
            )}

            {/* Meta Row: Alerts Pill & Total Units */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {product.totalAlerts > 0 ? (
                <span className="inline-flex items-center gap-1 font-mono text-xs sm:text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{product.totalAlerts} out of stock</span>
                </span>
              ) : (
                <span className="inline-flex items-center font-mono text-xs sm:text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Healthy stock
                </span>
              )}

              <span className="text-xs sm:text-xs font-bold text-slate-500">
                • {product.totalUnits} total units
              </span>
            </div>
          </div>

          {/* Options Menu */}
          <div className="absolute top-0 right-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              aria-label="Product options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsMenuOpen(false)} 
                />
                <div
                  className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 text-xs sm:text-sm font-medium animate-in fade-in zoom-in-95 duration-100"
                >
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onAddVariant(product);
                    }}
                    className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Plus className="w-4 h-4 text-slate-600" />
                    <span>Add Color/Shade</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEdit(product);
                    }}
                    className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                    <span>Edit Details</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (confirm(`Delete ${product.name}?`)) {
                        onDelete(product.id);
                      }
                    }}
                    className="w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 border-t border-slate-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
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
              className="px-4 sm:px-5 py-3.5 hover:bg-slate-50/90 transition-colors cursor-pointer group active:bg-slate-100"
            >
              {/* Top line of variant: Radio Circle + Shade Name + Total Units */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Color Swatch (Only if color hex exists) */}
                  {variant.colorHex ? (
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 inline-block shadow-xs"
                      style={{ backgroundColor: variant.colorHex }}
                    />
                  ) : null}

                  {/* Color / Shade Name - Generous Font Size */}
                  <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate">
                    {variant.colorName}
                  </span>
                </div>

                {/* Total Units */}
                <div className="shrink-0 text-right">
                  <span className="font-extrabold text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded text-xs sm:text-sm font-mono tracking-tight num-tabular border border-teal-200/60">
                    {variant.totalUnits} units
                  </span>
                </div>
              </div>

              {/* Bottom line: High-Contrast, Stacked Size Badges for maximum legibility */}
              <div className="pt-2.5 flex items-center gap-2 sm:gap-2.5 flex-wrap">
                {(product.sizes && product.sizes.length > 0 ? product.sizes : STANDARD_SIZES).map((sz) => {
                  const q = variant.sizes[sz] ?? 0;
                  const isZero = q === 0;

                  return (
                    <div 
                      key={sz}
                      className={`inline-flex flex-col items-center justify-center min-w-[52px] sm:min-w-[58px] px-2.5 py-1.5 rounded-xl border text-center transition-colors ${
                        isZero 
                          ? 'bg-slate-50 border-slate-200 text-slate-400' 
                          : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      }`}
                    >
                      <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-tight leading-none ${isZero ? 'text-slate-400' : 'text-slate-300'}`}>
                        Size {sz}
                      </span>
                      <span className={`text-base sm:text-lg font-black font-mono num-tabular leading-tight mt-1 ${isZero ? 'text-slate-400' : 'text-white'}`}>
                        {q}
                      </span>
                    </div>
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
