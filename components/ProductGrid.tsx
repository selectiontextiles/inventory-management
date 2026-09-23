'use client';

import React, { useState, useMemo, useDeferredValue } from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Box, Plus } from 'lucide-react';
import { Product, ColorVariant } from '@/lib/types';
import { ProductColorCard } from './ProductColorCard';

interface ProductGridProps {
  products: Product[];
  onAddNew: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onSelectVariant: (product: Product, variant: ColorVariant) => void;
  onOpenImagePreview: (imageUrl: string, title: string) => void;
  onAddVariant: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddNew,
  onEdit,
  onDelete,
  onSelectVariant,
  onOpenImagePreview,
  onAddVariant,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'default' | 'units-desc' | 'name-asc'>('default');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < products.length; i++) {
      if (products[i].category) set.add(products[i].category);
    }
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = deferredSearchQuery.toLowerCase().trim();

    return products.filter((p) => {
      if (q) {
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSubtitle = (p.subtitle || '').toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesAnyVariant = p.variants.some(v => v.colorName.toLowerCase().includes(q));
        if (!matchesName && !matchesSubtitle && !matchesCategory && !matchesAnyVariant) {
          return false;
        }
      }

      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'units-desc') return b.totalUnits - a.totalUnits;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, deferredSearchQuery, selectedCategory, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('default');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || sortBy !== 'default';

  return (
    <div className="space-y-3">
      {/* Search & Action Bar */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or shades..."
            className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:border-slate-900 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="appearance-none bg-white border border-slate-200 rounded-xl pl-2.5 pr-6 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-900 cursor-pointer"
          >
            <option value="default">Newest</option>
            <option value="name-asc">Name A-Z</option>
            <option value="units-desc">Units ↓</option>
          </select>
          <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`tap-press h-9 px-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
            showFilterDrawer || selectedCategory !== 'All'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          aria-label="Filter"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Filter</span>
          {selectedCategory !== 'All' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        </button>
      </div>

      {/* Expandable Category Chips */}
      {showFilterDrawer && (
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar animate-in fade-in duration-100">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 pr-1 shrink-0">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`tap-press h-6 px-2.5 rounded-md text-[11px] font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto text-[11px] text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-0.5 pr-1 shrink-0"
            >
              <span>Reset</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Product Color Cards List */}
      {filteredProducts.length > 0 ? (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <ProductColorCard
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelectVariant={onSelectVariant}
              onOpenImagePreview={onOpenImagePreview}
              onAddVariant={onAddVariant}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <Box className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">No products found</h4>
          <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 mb-3">
            No matching textile products with current filter.
          </p>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="tap-press px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={onAddNew}
              className="tap-press px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
