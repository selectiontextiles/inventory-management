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
      {/* Product Header: Clean Title, Category, Subtitle & Stock Status */}
      <div className="p-4 sm:p-5 pb-3.5">
        <div className="flex items-start justify-between gap-3 relative">
          <div className="flex-1 min-w-0 pr-8">
            {/* Line 1: Category Badge + Product Title (Inline) */}
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                {product.category || 'General'}
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug truncate">
                {product.name}
              </h2>
            </div>

            {/* Subtitle / Fabric Tag (if present) */}
            {product.subtitle && (
              <div className="flex items-start gap-1.5 text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1 leading-tight">{product.subtitle}</span>
              </div>
            )}

            {/* Line 2: Stock Status Alert Pill & Total Units */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {product.totalAlerts > 0 ? (
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{product.totalAlerts} out of stock</span>
                </span>
              ) : (
                <span className="inline-flex items-center font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Healthy stock
                </span>
              )}

              <span className="text-xs font-bold text-slate-500">
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
              className="px-4 sm:px-5 py-3 hover:bg-slate-50/90 transition-colors cursor-pointer group active:bg-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left Side: Variant Photo + Shade Name + Total Units */}
              <div className="flex items-center gap-3 min-w-0 sm:w-56 md:w-64 shrink-0">
                {/* Variant Thumbnail Photo */}
                <div
                  onClick={(e) => {
                    if (variant.imageUrl) {
                      e.stopPropagation();
                      onOpenImagePreview(variant.imageUrl, `${product.name} - ${variant.colorName}`);
                    }
                  }}
                  className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 group/img ${
                    variant.imageUrl ? 'cursor-pointer hover:border-slate-400 shadow-xs' : ''
                  }`}
                  title={variant.imageUrl ? 'Tap to preview image' : 'No photo for this shade'}
                >
                  {variant.imageUrl ? (
                    <>
                      <Image
                        src={variant.imageUrl}
                        alt={variant.colorName}
                        fill
                        sizes="(max-width: 640px) 48px, 52px"
                        className="object-cover group-hover/img:scale-105 transition duration-200"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover/img:bg-slate-900/30 flex items-center justify-center transition opacity-0 group-hover/img:opacity-100">
                        <Maximize2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100/70">
                      <Tag className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Shade Name & Units */}
                <div className="min-w-0 flex-1">
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight truncate block">
                    {variant.colorName}
                  </span>
                  <span className="inline-block mt-0.5 font-extrabold text-teal-900 bg-teal-50 px-2 py-0.5 rounded text-[11px] sm:text-xs font-mono tracking-tight border border-teal-200/60 num-tabular">
                    {variant.totalUnits} units
                  </span>
                </div>
              </div>

              {/* Right Side: High-Contrast Size Badges in Same Line */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap sm:justify-end overflow-x-auto no-scrollbar">
                {(product.sizes && product.sizes.length > 0 ? product.sizes : STANDARD_SIZES).map((sz) => {
                  const q = variant.sizes[sz] ?? 0;
                  const isZero = q === 0;

                  return (
                    <div 
                      key={sz} 
                      className={`inline-flex flex-col items-center justify-center min-w-[50px] sm:min-w-[54px] px-2 py-1.5 rounded-xl border text-center transition-colors shrink-0 ${
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
