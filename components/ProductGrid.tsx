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
  isLowStockFilterActive?: boolean;
  onResetLowStockFilter?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddNew,
  onEdit,
  onDelete,
  onSelectVariant,
  onOpenImagePreview,
  onAddVariant,
  isLowStockFilterActive = false,
  onResetLowStockFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'default' | 'units-desc' | 'name-asc'>('default');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  // Reset to first page when filtering, searching, or low-stock filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchQuery, selectedCategory, sortBy, isLowStockFilterActive]);

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
      // Low Stock filter
      if (isLowStockFilterActive && p.totalAlerts === 0) {
        return false;
      }

      if (q) {
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSubtitle = (p.subtitle || '').toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesSku = (p.sku || '').toLowerCase().includes(q);
        const matchesAnyVariant = p.variants.some(v => v.colorName.toLowerCase().includes(q));
        if (!matchesName && !matchesSubtitle && !matchesCategory && !matchesSku && !matchesAnyVariant) {
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
  }, [products, deferredSearchQuery, selectedCategory, sortBy, isLowStockFilterActive]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Generate responsive windowed page numbers (e.g., [1, 2, 3, 4, 5])
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set<number>([1, totalPages]);
    for (let offset = -1; offset <= 1; offset++) {
      const p = currentPage + offset;
      if (p > 1 && p < totalPages) {
        pages.add(p);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('default');
    setCurrentPage(1);
    onResetLowStockFilter?.();
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || sortBy !== 'default' || isLowStockFilterActive;

  return (
    <div className="space-y-3">
      {/* Search & Action Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search designs or shades..."
            className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:border-slate-900 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="Clear search"
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
            className="appearance-none bg-white border border-slate-200 rounded-xl pl-2 sm:pl-2.5 pr-5 sm:pr-6 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-900 cursor-pointer"
          >
            <option value="default">Newest</option>
            <option value="name-asc">A-Z</option>
            <option value="units-desc">Units ↓</option>
          </select>
          <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`tap-press h-9 px-2 sm:px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition shrink-0 ${
            showFilterDrawer || selectedCategory !== 'All'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          aria-label="Filter"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filter</span>
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

      {/* Active Search & Filter Feedback Pill */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isLowStockFilterActive && (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-md text-[10px] border border-amber-200">
                Low Stock Only
                <button
                  onClick={onResetLowStockFilter}
                  className="hover:text-amber-950 p-0.5 text-amber-700"
                  title="Remove low stock filter"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            <span>
              {searchQuery ? (
                <>Results for <strong className="text-slate-800">&quot;{searchQuery}&quot;</strong> ({filteredProducts.length})</>
              ) : selectedCategory !== 'All' ? (
                <>Filtered by <strong className="text-slate-800">{selectedCategory}</strong> ({filteredProducts.length})</>
              ) : isLowStockFilterActive ? (
                <>Showing <strong className="text-slate-800">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'item' : 'items'} needing restock</>
              ) : null}
            </span>
          </div>
          <button
            onClick={clearAllFilters}
            className="text-slate-500 hover:text-slate-900 font-medium underline shrink-0 ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Product Color Cards List */}
      {currentProducts.length > 0 ? (
        <div className="space-y-4">
          {currentProducts.map((product) => (
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

          {/* Minimal Pagination Toolbar */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 font-medium text-[11px] sm:text-xs">
                Showing <strong className="text-slate-900">{startIndex + 1}–{Math.min(endIndex, filteredProducts.length)}</strong> of <strong className="text-slate-900">{filteredProducts.length}</strong>
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-xs transition"
                >
                  Prev
                </button>

                <div className="flex items-center gap-1 px-0.5">
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-xs font-semibold transition ${
                        currentPage === page
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-xs transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
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
