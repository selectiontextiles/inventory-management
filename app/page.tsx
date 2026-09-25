'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { MetricsOverview } from '@/components/MetricsOverview';
import { ProductGrid } from '@/components/ProductGrid';
import { 
  fetchAllProducts, 
  saveProduct, 
  adjustVariantStockQuantity, 
  deleteProduct, 
  getStockHistoryAsync 
} from '@/lib/inventoryStore';
import { Product, ColorVariant, ProductFormData, StockHistoryItem } from '@/lib/types';
import { Toast, ToastData } from '@/components/Toast';

// Dynamic imports for interactive modals to minimize initial JS bundle size (Vercel best practice)
const ProductModal = dynamic(() => import('@/components/ProductModal').then(m => m.ProductModal), { ssr: false });
const AddColorVariantModal = dynamic(() => import('@/components/AddColorVariantModal').then(m => m.AddColorVariantModal), { ssr: false });
const VariantStepperModal = dynamic(() => import('@/components/VariantStepperModal').then(m => m.VariantStepperModal), { ssr: false });
const ImagePreviewModal = dynamic(() => import('@/components/ImagePreviewModal').then(m => m.ImagePreviewModal), { ssr: false });
const StockHistoryDrawer = dynamic(() => import('@/components/StockHistoryDrawer').then(m => m.StockHistoryDrawer), { ssr: false });

export default function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<StockHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metricFilter, setMetricFilter] = useState<'all' | 'low-stock'>('all');

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addingVariantProduct, setAddingVariantProduct] = useState<Product | null>(null);
  const [activeVariantState, setActiveVariantState] = useState<{
    product: Product | null;
    variant: ColorVariant | null;
  }>({ product: null, variant: null });

  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (message: string, title?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, title, type });
  };

  const loadData = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    try {
      const [prodData, histData] = await Promise.all([
        fetchAllProducts(),
        getStockHistoryAsync(),
      ]);
      setProducts(prodData);
      setHistory(histData);
      if (isManualRefresh) {
        showToast('Catalog and stock levels synced with database', 'Synced', 'info');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleAddNew = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (formData: ProductFormData, existingId?: string) => {
    const saved = await saveProduct(formData, existingId);
    showToast(
      saved.name,
      existingId ? 'Product Updated' : 'New Product Added',
      'success'
    );
    await loadData();
  };

  const handleDelete = async (id: string) => {
    const success = await deleteProduct(id);
    if (success) {
      showToast('Product removed from catalog', 'Deleted', 'info');
      await loadData();
    }
  };

  const handleSelectVariant = (product: Product, variant: ColorVariant) => {
    setActiveVariantState({ product, variant });
  };

  const handleAdjustVariantStock = async (
    productId: string,
    variantId: string,
    size: string,
    delta: number
  ) => {
    // Instant optimistic update with accurate totalUnits and totalAlerts
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        let totalUnits = 0;
        let totalAlerts = 0;
        const pSizes = p.sizes && p.sizes.length > 0 ? p.sizes : ['36', '38', '40', '42', '44'];

        const updatedVariants = p.variants.map(v => {
          if (v.id === variantId) {
            const cur = v.sizes[size] || 0;
            const nextQty = Math.max(0, cur + delta);
            const nextSizes = { ...v.sizes, [size]: nextQty };
            const varTotal = pSizes.reduce((sum, sz) => sum + (nextSizes[sz] || 0), 0);
            return { ...v, sizes: nextSizes, totalUnits: varTotal };
          }
          return v;
        });

        updatedVariants.forEach(v => {
          totalUnits += v.totalUnits;
          pSizes.forEach(sz => {
            const q = v.sizes[sz] || 0;
            if (q === 0) totalAlerts += 1;
          });
        });

        return { ...p, variants: updatedVariants, totalUnits, totalAlerts };
      }
      return p;
    }));

    // Update active modal reference
    setActiveVariantState(prev => {
      if (prev.product && prev.variant && prev.product.id === productId && prev.variant.id === variantId) {
        const cur = prev.variant.sizes[size] || 0;
        const nextQty = Math.max(0, cur + delta);
        const nextSizes = { ...prev.variant.sizes, [size]: nextQty };
        const pSizes = prev.product.sizes && prev.product.sizes.length > 0 ? prev.product.sizes : ['36', '38', '40', '42', '44'];
        const totalUnits = pSizes.reduce((sum, sz) => sum + (nextSizes[sz] || 0), 0);
        return {
          product: prev.product,
          variant: { ...prev.variant, sizes: nextSizes, totalUnits },
        };
      }
      return prev;
    });

    const result = await adjustVariantStockQuantity(productId, variantId, size, delta);
    if (result) {
      // Sync confirmed state from Supabase
      setProducts(prev => prev.map(p => p.id === result.id ? result : p));
      const hist = await getStockHistoryAsync();
      setHistory(hist);
      const v = result.variants.find(x => x.id === variantId);
      const currentSizeQty = v?.sizes[size] ?? 0;
      showToast(
        `${v?.colorName || 'Shade'} • Size ${size}: ${delta > 0 ? `+${delta}` : delta} (Current: ${currentSizeQty} pcs)`,
        'Stock Updated',
        'success'
      );
    }
  };

  const handleSaveNewVariant = async (
    productId: string,
    colorName: string,
    sizes: Record<string, number>,
    imageUrl?: string
  ) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const existingVars = prod.variants.map(v => ({
      id: v.id,
      colorName: v.colorName,
      imageUrl: v.imageUrl,
      sizes: v.sizes,
    }));

    await saveProduct({
      name: prod.name,
      subtitle: prod.subtitle,
      category: prod.category,
      sizes: prod.sizes,
      variants: [...existingVars, { colorName, imageUrl, sizes }],
    }, prod.id);

    showToast(`Added ${colorName} to ${prod.name}`, 'Shade Added', 'success');
    await loadData();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between pb-12 sm:pb-10">
      {/* Header */}
      <Header
        onAddNew={handleAddNew}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onRefresh={() => loadData(true)}
        isLoading={isLoading}
        totalProducts={products.length}
      />

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto px-3 sm:px-6 py-2 sm:py-5 space-y-2.5 sm:space-y-4">
        {/* Summary Metrics */}
        <MetricsOverview
          products={products}
          activeFilter={metricFilter}
          onFilterChange={setMetricFilter}
        />

        {/* Product Color Variants Grid */}
        <ProductGrid
          products={products}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSelectVariant={handleSelectVariant}
          onOpenImagePreview={(url, title) => setPreviewImage({ url, title })}
          onAddVariant={(prod) => setAddingVariantProduct(prod)}
          isLowStockFilterActive={metricFilter === 'low-stock'}
          onResetLowStockFilter={() => setMetricFilter('all')}
        />
      </main>

      {/* Modals */}
      <VariantStepperModal
        isOpen={Boolean(activeVariantState.product && activeVariantState.variant)}
        onClose={() => setActiveVariantState({ product: null, variant: null })}
        product={activeVariantState.product}
        variant={activeVariantState.variant}
        onAdjustVariantStock={handleAdjustVariantStock}
      />

      <AddColorVariantModal
        isOpen={Boolean(addingVariantProduct)}
        onClose={() => setAddingVariantProduct(null)}
        product={addingVariantProduct}
        onSaveVariant={handleSaveNewVariant}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
      />

      <ImagePreviewModal
        isOpen={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url || ''}
        title={previewImage?.title || ''}
      />

      <StockHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        products={products}
      />

      {/* Toast Notification Container */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Minimal Clean Footer */}
      <footer className="mt-8 border-t border-slate-200/80 py-4 text-center text-[11px] text-slate-400">
        <p>Selection Textiles • Minimal Inventory</p>
      </footer>
    </div>
  );
}
