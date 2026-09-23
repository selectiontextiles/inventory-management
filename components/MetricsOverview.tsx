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
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      {/* Total Sets */}
      <div 
        onClick={handleAllClick}
        className={`bg-white px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-xl border transition cursor-pointer ${
          activeFilter === 'all' 
            ? 'border-slate-300 shadow-xs' 
            : 'border-slate-200 opacity-80 hover:opacity-100'
        }`}
        title="Show all products"
      >
        <div className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Total Sets
        </div>
        <div className="text-sm sm:text-base font-bold text-slate-900 num-tabular tracking-tight">
          {totalProducts} <span className="text-[10px] font-normal text-slate-400 hidden xs:inline">designs</span>
        </div>
      </div>

      {/* Total Stock */}
      <div 
        onClick={handleAllClick}
        className="bg-white px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-xl border border-slate-200 transition cursor-pointer hover:border-slate-300"
        title="Show all products"
      >
        <div className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Total Stock
        </div>
        <div className="text-sm sm:text-base font-bold text-slate-900 num-tabular tracking-tight">
          {totalUnits} <span className="text-[10px] font-normal text-slate-400">pcs</span>
        </div>
      </div>

      {/* Low Stock (Interactive Filter Card) */}
      <div 
        onClick={handleLowStockClick}
        className={`px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-xl border transition-all cursor-pointer tap-press select-none ${
          activeFilter === 'low-stock'
            ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/30'
            : 'bg-white border-amber-200/80 hover:border-amber-400 hover:bg-amber-50/40'
        }`}
        title={activeFilter === 'low-stock' ? 'Click to show all' : 'Click to filter low stock items'}
      >
        <div className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider ${
          activeFilter === 'low-stock' ? 'text-amber-100' : 'text-amber-700'
        }`}>
          Low Stock {activeFilter === 'low-stock' && '✓'}
        </div>
        <div className={`text-sm sm:text-base font-extrabold num-tabular tracking-tight ${
          activeFilter === 'low-stock' ? 'text-white' : 'text-amber-950'
        }`}>
          {totalAlerts} <span className={`text-[10px] font-normal ${
            activeFilter === 'low-stock' ? 'text-amber-100' : 'text-slate-400'
          }`}>items</span>
        </div>
      </div>
    </div>
  );
});

MetricsOverview.displayName = 'MetricsOverview';

