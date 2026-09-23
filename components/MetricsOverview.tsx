'use client';

import React, { useMemo } from 'react';
import { Product } from '@/lib/types';

interface MetricsOverviewProps {
  products: Product[];
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = React.memo(({
  products,
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

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      <div className="bg-white px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-xl border border-slate-200">
        <div className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Total Sets
        </div>
        <div className="text-sm sm:text-base font-bold text-slate-900 num-tabular tracking-tight">
          {totalProducts} <span className="text-[10px] font-normal text-slate-400 hidden xs:inline">designs</span>
        </div>
      </div>

      <div className="bg-white px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-xl border border-slate-200">
        <div className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Total Stock
        </div>
        <div className="text-sm sm:text-base font-bold text-slate-900 num-tabular tracking-tight">
          {totalUnits} <span className="text-[10px] font-normal text-slate-400">pcs</span>
        </div>
      </div>

      <div className="bg-white px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-xl border border-slate-200">
        <div className="text-[9px] sm:text-[10px] uppercase font-semibold text-amber-700 tracking-wider">
          Low Stock
        </div>
        <div className="text-sm sm:text-base font-bold text-amber-950 num-tabular tracking-tight">
          {totalAlerts} <span className="text-[10px] font-normal text-slate-400">items</span>
        </div>
      </div>
    </div>
  );
});

MetricsOverview.displayName = 'MetricsOverview';

