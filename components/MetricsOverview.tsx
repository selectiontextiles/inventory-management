'use client';

import React, { useMemo } from 'react';
import { Product } from '@/lib/types';

interface MetricsOverviewProps {
  products: Product[];
  activeFilter?: 'all' | 'low-stock';
  onFilterChange?: (filter: 'all' | 'low-stock') => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = React.memo(({
  products,
  activeFilter = 'all',
  onFilterChange,
}) => {
  const { totalProducts, totalUnits, totalAlerts } = useMemo(() => {
    let units = 0;
    let alerts = 0;
    for (let i = 0; i < products.length; i++) {
      units += products[i].totalUnits;
      alerts += products[i].totalAlerts;
    }
    return {
      totalProducts: products.length,
      totalUnits: units,
      totalAlerts: alerts,
    };
  }, [products]);

  const handleLowStockClick = () => {
    if (!onFilterChange) return;
    onFilterChange(activeFilter === 'low-stock' ? 'all' : 'low-stock');
  };

  const handleAllClick = () => {
    if (!onFilterChange) return;
    onFilterChange('all');
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {/* Total Sets */}
      <div 
        onClick={handleAllClick}
        className={`bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl border transition cursor-pointer ${
          activeFilter === 'all' 
            ? 'border-slate-400 shadow-xs' 
            : 'border-slate-200 opacity-90 hover:opacity-100'
        }`}
        title="Show all products"
      >
        <div className="text-[11px] sm:text-xs uppercase font-bold text-slate-500 tracking-wider">
          Total Sets
        </div>
        <div className="text-base sm:text-lg font-black text-slate-900 num-tabular tracking-tight mt-0.5">
          {totalProducts} <span className="text-xs font-semibold text-slate-400 hidden xs:inline">sets</span>
        </div>
      </div>

      {/* Total Stock */}
      <div 
        onClick={handleAllClick}
        className="bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-slate-200 transition cursor-pointer hover:border-slate-300"
        title="Show all products"
      >
        <div className="text-[11px] sm:text-xs uppercase font-bold text-slate-500 tracking-wider">
          Total Stock
        </div>
        <div className="text-base sm:text-lg font-black text-slate-900 num-tabular tracking-tight mt-0.5">
          {totalUnits} <span className="text-xs font-semibold text-slate-400">pcs</span>
        </div>
      </div>

      {/* Low Stock (Interactive Filter Card) */}
      <div 
        onClick={handleLowStockClick}
        className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl border transition-all cursor-pointer tap-press select-none ${
          activeFilter === 'low-stock'
            ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/30'
            : 'bg-white border-amber-200/90 hover:border-amber-400 hover:bg-amber-50/40'
        }`}
        title={activeFilter === 'low-stock' ? 'Click to show all' : 'Click to filter low stock items'}
      >
        <div className={`text-[11px] sm:text-xs uppercase font-bold tracking-wider ${
          activeFilter === 'low-stock' ? 'text-amber-100' : 'text-amber-800'
        }`}>
          Low Stock {activeFilter === 'low-stock' && '✓'}
        </div>
        <div className={`text-base sm:text-lg font-black num-tabular tracking-tight mt-0.5 ${
          activeFilter === 'low-stock' ? 'text-white' : 'text-amber-950'
        }`}>
          {totalAlerts} <span className={`text-xs font-semibold ${
            activeFilter === 'low-stock' ? 'text-amber-100' : 'text-slate-400'
          }`}>items</span>
        </div>
      </div>
    </div>
  );
});

MetricsOverview.displayName = 'MetricsOverview';

