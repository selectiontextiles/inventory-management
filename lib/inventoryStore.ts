import { Product, ColorVariant, ProductFormData, StockHistoryItem, STANDARD_SIZES } from './types';
import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY = 'selection_textiles_products_v2';
const LOCAL_STORAGE_HISTORY_KEY = 'selection_textiles_history_v2';

// 5MB maximum file upload size
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Seed sample textile inventory matching user's exact structure
export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'ST-001',
    name: 'Uathayam 2in1 Sets',
    subtitle: 'Divine Fixit Full Shirt Dhoti Set',
    category: 'Ethnic Sets',
    totalUnits: 81,
    totalAlerts: 16,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        id: 'var-01',
        colorName: 'T.Blue / Sh No.02',
        colorHex: '#38bdf8',
        imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80',
        sizes: { '36': 1, '38': 2, '40': 3, '42': 2, '44': 3 },
        totalUnits: 11,
      },
      {
        id: 'var-02',
        colorName: 'Orange / Sh No.03',
        colorHex: '#fb923c',
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
        sizes: { '36': 1, '38': 1, '40': 0, '42': 1, '44': 2 },
        totalUnits: 5,
      },
      {
        id: 'var-03',
        colorName: 'Green / Shade No. 04',
        colorHex: '#4ade80',
        sizes: { '36': 3, '38': 5, '40': 1, '42': 2, '44': 1 },
        totalUnits: 12,
      },
      {
        id: 'var-04',
        colorName: 'Meroon / Shade No. 6',
        colorHex: '#881337',
        sizes: { '36': 3, '38': 2, '40': 1, '42': 2, '44': 2 },
        totalUnits: 10,
      },
      {
        id: 'var-05',
        colorName: 'Mastard / Shade No.09',
        colorHex: '#facc15',
        sizes: { '36': 2, '38': 3, '40': 2, '42': 3, '44': 2 },
        totalUnits: 12,
      },
      {
        id: 'var-06',
        colorName: 'Pink / Shade No.10',
        colorHex: '#f472b6',
        sizes: { '36': 2, '38': 2, '40': 3, '42': 2, '44': 2 },
        totalUnits: 11,
      },
      {
        id: 'var-07',
        colorName: 'Silver / Shade No.11',
        colorHex: '#94a3b8',
        sizes: { '36': 0, '38': 3, '40': 1, '42': 2, '44': 0 },
        totalUnits: 6,
      },
      {
        id: 'var-08',
        colorName: 'Purple / Shade No.14',
        colorHex: '#a855f7',
        sizes: { '36': 1, '38': 1, '40': 2, '42': 2, '44': 1 },
        totalUnits: 7,
      },
      {
        id: 'var-09',
        colorName: 'Sea Blue / Shade No.16',
        colorHex: '#0284c7',
        sizes: { '36': 1, '38': 2, '40': 2, '42': 1, '44': 1 },
        totalUnits: 7,
      },
    ],
  },
  {
    id: 'prod-002',
    sku: 'ST-002',
    name: 'Selection Linen Classic Shirts',
    subtitle: 'Pure French Normandy Linen 60 Lea',
    category: 'Linen',
    totalUnits: 45,
    totalAlerts: 4,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        id: 'var-10',
        colorName: 'Sand Beige / Shade No.01',
        colorHex: '#d6c7b2',
        imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
        sizes: { '36': 3, '38': 5, '40': 6, '42': 2, '44': 1 },
        totalUnits: 17,
      },
      {
        id: 'var-11',
        colorName: 'Olive Sage / Shade No.05',
        colorHex: '#65a30d',
        sizes: { '36': 2, '38': 4, '40': 5, '42': 3, '44': 1 },
        totalUnits: 15,
      },
      {
        id: 'var-12',
        colorName: 'Optic White / Shade No.08',
        colorHex: '#ffffff',
        sizes: { '36': 1, '38': 3, '40': 4, '42': 3, '44': 2 },
        totalUnits: 13,
      },
    ],
  }
];

export function calculateProductTotals(variants: ColorVariant[], productSizes: string[] = STANDARD_SIZES) {
  let totalUnits = 0;
  let totalAlerts = 0;
  const activeSizes = productSizes && productSizes.length > 0 ? productSizes : STANDARD_SIZES;

  variants.forEach(v => {
    let varTotal = 0;
    activeSizes.forEach(sz => {
      const q = v.sizes[sz] || 0;
      varTotal += q;
      if (q === 0) totalAlerts += 1;
    });
    v.totalUnits = varTotal;
    totalUnits += varTotal;
  });

  return { totalUnits, totalAlerts };
}

function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return SEED_PRODUCTS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
    return SEED_PRODUCTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return SEED_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
}

function getLocalHistory(): StockHistoryItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalHistory(item: StockHistoryItem) {
  if (typeof window === 'undefined') return;
  const current = getLocalHistory();
  localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify([item, ...current.slice(0, 49)]));
}

function generateNextSku(existing: Product[]): string {
  let max = 0;
  existing.forEach(p => {
    const m = (p.sku || '').match(/(\d+)/);
    if (m) {
      const v = parseInt(m[1], 10);
      if (v > max) max = v;
    }
  });
  return `ST-${(max + 1).toString().padStart(3, '0')}`;
}

// ============================================================================
// Data Operations (Batch Queries & High Performance)
// ============================================================================

export async function fetchAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabase) {
    return getLocalProducts();
  }

  try {
    // 1 single roundtrip query with nested foreign key join (Postgres / Supabase best practice)
    const { data: prodData, error: prodErr } = await supabase
      .from('products')
      .select(`
        id,
        sku,
        name,
        subtitle,
        category,
        sizes,
        created_at,
        updated_at,
        product_variants (
          id,
          color_name,
          color_hex,
          image_url,
          size_36,
          size_38,
          size_40,
          size_42,
          size_44,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (prodErr) {
      console.warn('Supabase fetch failed, falling back to local cache:', prodErr);
      return getLocalProducts();
    }

    if (!prodData || prodData.length === 0) {
      return [];
    }

    return prodData.map((p: any) => {
      const rawVariants = Array.isArray(p.product_variants) ? p.product_variants : [];
      // Sort variants deterministically by creation time
      rawVariants.sort((a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

      const productSizes: string[] = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : STANDARD_SIZES;

      const variants: ColorVariant[] = rawVariants.map((row: any) => {
        const cleanSizes: Record<string, number> = {
          '36': Math.max(0, row.size_36 || 0),
          '38': Math.max(0, row.size_38 || 0),
          '40': Math.max(0, row.size_40 || 0),
          '42': Math.max(0, row.size_42 || 0),
          '44': Math.max(0, row.size_44 || 0),
        };
        const totalUnits = productSizes.reduce((sum, sz) => sum + (cleanSizes[sz] || 0), 0);

        return {
          id: row.id,
          colorName: row.color_name,
          colorHex: row.color_hex || '',
          imageUrl: row.image_url || '',
          sizes: cleanSizes,
          totalUnits,
        };
      });

      const { totalUnits, totalAlerts } = calculateProductTotals(variants, productSizes);

      return {
        id: p.id,
        sku: p.sku || `ST-${p.id.slice(0, 4)}`,
        name: p.name,
        subtitle: p.subtitle || '',
        category: p.category || 'General',
        sizes: productSizes,
        variants,
        totalUnits,
        totalAlerts,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    });
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to local store:', err);
    return getLocalProducts();
  }
}

/**
 * Server-side range-paginated fetch for high-volume catalogs (1000+ products)
 */
export async function fetchProductsPaginated(page: number = 1, pageSize: number = 20): Promise<{ products: Product[]; total: number }> {
  if (!isSupabaseConfigured || !supabase) {
    const local = getLocalProducts();
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    return {
      products: local.slice(from, to),
      total: local.length,
    };
  }

  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: prodData, count, error: prodErr } = await supabase
      .from('products')
      .select(`
        id,
        sku,
        name,
        subtitle,
        category,
        sizes,
        created_at,
        updated_at,
        product_variants (
          id,
          color_name,
          color_hex,
          image_url,
          size_36,
          size_38,
          size_40,
          size_42,
          size_44,
          created_at
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (prodErr || !prodData) {
      const local = getLocalProducts();
      return { products: local.slice(from, from + pageSize), total: local.length };
    }

    const products = prodData.map((p: any) => {
      const rawVariants = Array.isArray(p.product_variants) ? p.product_variants : [];
      rawVariants.sort((a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

      const productSizes: string[] = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : STANDARD_SIZES;

      const variants: ColorVariant[] = rawVariants.map((row: any) => {
        const cleanSizes: Record<string, number> = {
          '36': Math.max(0, row.size_36 || 0),
          '38': Math.max(0, row.size_38 || 0),
          '40': Math.max(0, row.size_40 || 0),
          '42': Math.max(0, row.size_42 || 0),
          '44': Math.max(0, row.size_44 || 0),
        };
        const totalUnits = productSizes.reduce((sum, sz) => sum + (cleanSizes[sz] || 0), 0);
        return {
          id: row.id,
          colorName: row.color_name,
          colorHex: row.color_hex || '',
          imageUrl: row.image_url || '',
          sizes: cleanSizes,
          totalUnits,
        };
      });

      const { totalUnits, totalAlerts } = calculateProductTotals(variants, productSizes);

      return {
        id: p.id,
        sku: p.sku || `ST-${p.id.slice(0, 4)}`,
        name: p.name,
        subtitle: p.subtitle || '',
        category: p.category || 'General',
        sizes: productSizes,
        variants,
        totalUnits,
        totalAlerts,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    });

    return { products, total: count || products.length };
  } catch (err) {
    const local = getLocalProducts();
    const from = (page - 1) * pageSize;
    return { products: local.slice(from, from + pageSize), total: local.length };
  }
}

export async function saveProduct(formData: ProductFormData, existingId?: string): Promise<Product> {
  const local = getLocalProducts();
  const now = new Date().toISOString();
  const productSizes: string[] = Array.isArray(formData.sizes) && formData.sizes.length > 0 ? formData.sizes : STANDARD_SIZES;

  // Validate and sanitize variants
  const processedVariants: ColorVariant[] = formData.variants.map((v, idx) => {
    const cleanSizes: Record<string, number> = {
      '36': Math.max(0, Number(v.sizes['36']) || 0),
      '38': Math.max(0, Number(v.sizes['38']) || 0),
      '40': Math.max(0, Number(v.sizes['40']) || 0),
      '42': Math.max(0, Number(v.sizes['42']) || 0),
      '44': Math.max(0, Number(v.sizes['44']) || 0),
    };
    // Include custom sizes if any
    Object.keys(v.sizes).forEach(sz => {
      cleanSizes[sz] = Math.max(0, Number(v.sizes[sz]) || 0);
    });

    const totalUnits = productSizes.reduce((sum, sz) => sum + (cleanSizes[sz] || 0), 0);

    return {
      id: v.id || `var-${Date.now()}-${idx}`,
      colorName: v.colorName.trim() || `Shade No.${idx + 1}`,
      imageUrl: v.imageUrl?.trim() || '',
      sizes: cleanSizes,
      totalUnits,
    };
  });

  const { totalUnits, totalAlerts } = calculateProductTotals(processedVariants, productSizes);

  if (!isSupabaseConfigured || !supabase) {
    if (existingId) {
      const updated = local.map(p => {
        if (p.id === existingId) {
          return {
            ...p,
            name: formData.name.trim(),
            subtitle: formData.subtitle?.trim() || '',
            category: formData.category.trim(),
            sizes: productSizes,
            variants: processedVariants,
            totalUnits,
            totalAlerts,
            updatedAt: now,
          };
        }
        return p;
      });
      saveLocalProducts(updated);
      return updated.find(p => p.id === existingId)!;
    } else {
      const nextSku = generateNextSku(local);
      const newProd: Product = {
        id: `prod-${Math.random().toString(36).substring(2, 9)}`,
        sku: nextSku,
        name: formData.name.trim(),
        subtitle: formData.subtitle?.trim() || '',
        category: formData.category.trim(),
        sizes: productSizes,
        variants: processedVariants,
        totalUnits,
        totalAlerts,
        createdAt: now,
        updatedAt: now,
      };
      saveLocalProducts([newProd, ...local]);
      return newProd;
    }
  }

  // Supabase save with Non-Destructive Upsert (Preserves stock history foreign keys)
  try {
    let productId = existingId;
    if (existingId) {
      await supabase.from('products').update({
        name: formData.name.trim(),
        subtitle: formData.subtitle?.trim() || '',
        category: formData.category.trim(),
        sizes: productSizes,
        updated_at: now,
      }).eq('id', existingId);

      const keptVariantIds: string[] = [];

      for (const v of processedVariants) {
        if (v.id && !v.id.startsWith('var-')) {
          keptVariantIds.push(v.id);
          await supabase.from('product_variants').update({
            color_name: v.colorName,
            image_url: v.imageUrl || '',
            size_36: v.sizes['36'] || 0,
            size_38: v.sizes['38'] || 0,
            size_40: v.sizes['40'] || 0,
            size_42: v.sizes['42'] || 0,
            size_44: v.sizes['44'] || 0,
            updated_at: now,
          }).eq('id', v.id);
        } else {
          const { data: insRow } = await supabase.from('product_variants').insert({
            product_id: existingId,
            color_name: v.colorName,
            image_url: v.imageUrl || '',
            size_36: v.sizes['36'] || 0,
            size_38: v.sizes['38'] || 0,
            size_40: v.sizes['40'] || 0,
            size_42: v.sizes['42'] || 0,
            size_44: v.sizes['44'] || 0,
          }).select('id').single();
          if (insRow) keptVariantIds.push(insRow.id);
        }
      }

      // Delete only variants removed by the user
      if (keptVariantIds.length > 0) {
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', existingId)
          .not('id', 'in', `(${keptVariantIds.join(',')})`);
      }
    } else {
      const allCurrent = await fetchAllProducts();
      const nextSku = generateNextSku(allCurrent);

      const { data: newRow, error: insErr } = await supabase.from('products').insert({
        sku: nextSku,
        name: formData.name.trim(),
        subtitle: formData.subtitle?.trim() || '',
        category: formData.category.trim(),
        sizes: productSizes,
      }).select('id').single();

      if (insErr) throw insErr;
      productId = newRow.id;

      if (productId && processedVariants.length > 0) {
        const variantRows = processedVariants.map(v => ({
          product_id: productId,
          color_name: v.colorName,
          image_url: v.imageUrl || '',
          size_36: v.sizes['36'] || 0,
          size_38: v.sizes['38'] || 0,
          size_40: v.sizes['40'] || 0,
          size_42: v.sizes['42'] || 0,
          size_44: v.sizes['44'] || 0,
        }));

        await supabase.from('product_variants').insert(variantRows);
      }
    }

    const all = await fetchAllProducts();
    return all.find(p => p.id === productId) || saveProduct(formData, existingId);
  } catch (err) {
    console.error('Supabase save error, writing locally:', err);
    return saveProduct(formData, existingId);
  }
}

export async function adjustVariantStockQuantity(
  productId: string,
  variantId: string,
  size: string,
  delta: number,
  reason: string = 'Manual Adjustment'
): Promise<Product | null> {
  const sizeCol = `size_${size}` as 'size_36' | 'size_38' | 'size_40' | 'size_42' | 'size_44';

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Fetch current variant row from Supabase
      const { data: varData, error: varErr } = await supabase
        .from('product_variants')
        .select(`
          id,
          product_id,
          color_name,
          color_hex,
          image_url,
          size_36,
          size_38,
          size_40,
          size_42,
          size_44
        `)
        .eq('id', variantId)
        .single();

      if (varErr || !varData) {
        console.error('Supabase fetch variant error:', varErr);
        throw varErr || new Error('Variant not found');
      }

      const currentQty = Number((varData as any)[sizeCol]) || 0;
      const nextQty = Math.max(0, currentQty + delta);
      const actualDelta = nextQty - currentQty;

      // 2. Direct single-query update on product_variants
      const { error: updateErr } = await supabase
        .from('product_variants')
        .update({ [sizeCol]: nextQty, updated_at: new Date().toISOString() })
        .eq('id', variantId);

      if (updateErr) {
        console.error('Supabase update variant error:', updateErr);
        throw updateErr;
      }

      // 3. Insert into stock_history table
      if (actualDelta !== 0) {
        await supabase.from('stock_history').insert({
          product_id: varData.product_id,
          variant_id: variantId,
          size,
          change_amount: actualDelta,
          resulting_quantity: nextQty,
          reason,
        });
      }

      // 4. Return updated product from Supabase
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select(`
          id,
          sku,
          name,
          subtitle,
          category,
          sizes,
          created_at,
          updated_at,
          product_variants (
            id,
            color_name,
            color_hex,
            image_url,
            size_36,
            size_38,
            size_40,
            size_42,
            size_44
          )
        `)
        .eq('id', varData.product_id)
        .single();

      if (prodErr || !prodData) {
        console.warn('Supabase fetch updated product failed:', prodErr);
        return null;
      }

      const productSizes: string[] = Array.isArray(prodData.sizes) && prodData.sizes.length > 0 ? prodData.sizes : STANDARD_SIZES;

      const rawVariants = Array.isArray(prodData.product_variants) ? prodData.product_variants : [];
      const variants: ColorVariant[] = rawVariants.map((row: any) => {
        const cleanSizes: Record<string, number> = {
          '36': Math.max(0, row.size_36 || 0),
          '38': Math.max(0, row.size_38 || 0),
          '40': Math.max(0, row.size_40 || 0),
          '42': Math.max(0, row.size_42 || 0),
          '44': Math.max(0, row.size_44 || 0),
        };
        const totalUnits = productSizes.reduce((sum, sz) => sum + (cleanSizes[sz] || 0), 0);
        return {
          id: row.id,
          colorName: row.color_name,
          colorHex: row.color_hex || '',
          imageUrl: row.image_url || '',
          sizes: cleanSizes,
          totalUnits,
        };
      });

      const { totalUnits, totalAlerts } = calculateProductTotals(variants, productSizes);

      return {
        id: prodData.id,
        sku: prodData.sku || `ST-${prodData.id.slice(0, 4)}`,
        name: prodData.name,
        subtitle: prodData.subtitle || '',
        category: prodData.category || 'General',
        sizes: productSizes,
        variants,
        totalUnits,
        totalAlerts,
        createdAt: prodData.created_at,
        updatedAt: prodData.updated_at,
      };
    } catch (err) {
      console.error('Supabase adjust stock failed:', err);
    }
  }

  // Fallback for offline / local mode
  const local = getLocalProducts();
  const product = local.find(p => p.id === productId);
  if (!product) return null;

  const updatedVariants = product.variants.map(v => {
    if (v.id === variantId) {
      const cur = v.sizes[size] || 0;
      const nextQty = Math.max(0, cur + delta);
      const nextSizes = { ...v.sizes, [size]: nextQty };
      const totalUnits = Object.values(nextSizes).reduce((a, b) => a + b, 0);
      return {
        ...v,
        sizes: nextSizes,
        totalUnits,
      };
    }
    return v;
  });

  const productSizes = product.sizes && product.sizes.length > 0 ? product.sizes : STANDARD_SIZES;
  const { totalUnits, totalAlerts } = calculateProductTotals(updatedVariants, productSizes);

  const updatedProduct: Product = {
    ...product,
    sizes: productSizes,
    variants: updatedVariants,
    totalUnits,
    totalAlerts,
    updatedAt: new Date().toISOString(),
  };

  const updatedList = local.map(p => p.id === productId ? updatedProduct : p);
  saveLocalProducts(updatedList);

  const matchedVar = product.variants.find(v => v.id === variantId);
  saveLocalHistory({
    id: 'hist-' + Math.random().toString(36).substring(2, 9),
    productId: product.id,
    productName: product.name,
    variantName: matchedVar?.colorName || 'Variant',
    size,
    changeAmount: delta,
    resultingQuantity: (matchedVar?.sizes[size] || 0) + delta,
    reason,
    createdAt: new Date().toISOString(),
  });

  return updatedProduct;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    const local = getLocalProducts();
    saveLocalProducts(local.filter(p => p.id !== productId));
    return true;
  }

  try {
    await supabase.from('products').delete().eq('id', productId);
    return true;
  } catch (err) {
    console.error('Failed to delete on Supabase:', err);
    return false;
  }
}

/**
 * Compresses user images client-side into lightweight WebP format (~50KB-80KB)
 * Drastically reduces Supabase storage footprint and egress bandwidth consumption.
 */
export async function compressImageToWebP(file: File, maxDimension = 1080, quality = 0.82): Promise<Blob> {
  // If not in browser environment, return original
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new (window as any).Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export async function uploadProductImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('File size exceeds the 5MB limit.');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
  }

  // Compress image client-side to lightweight WebP (~50KB)
  const compressedBlob = await compressImageToWebP(file);
  const compressedFile = new File([compressedBlob], `photo.webp`, { type: 'image/webp' });

  if (isSupabaseConfigured && supabase) {
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
      const filePath = `products/${fileName}`;

      // 1 year immutable browser caching (31536000s) to guarantee zero repeat egress
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedFile, { 
          cacheControl: '31536000', 
          contentType: 'image/webp',
          upsert: true 
        });

      if (!uploadError) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        if (data?.publicUrl) return data.publicUrl;
      }
    } catch (err) {
      console.warn('Storage upload error, using local fallback:', err);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(compressedFile);
  });
}

export async function getStockHistoryAsync(): Promise<StockHistoryItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    return getLocalHistory();
  }

  try {
    const { data, error } = await supabase
      .from('stock_history')
      .select(`
        id,
        product_id,
        variant_id,
        size,
        change_amount,
        resulting_quantity,
        reason,
        created_at,
        products (name),
        product_variants (color_name)
      `)
      .order('created_at', { ascending: false })
      .limit(150);

    if (error || !data) return getLocalHistory();

    return data.map((row: any) => ({
      id: row.id,
      productId: row.product_id,
      productName: row.products?.name || 'Product',
      variantName: row.product_variants?.color_name || 'Variant',
      size: row.size,
      changeAmount: row.change_amount,
      resultingQuantity: row.resulting_quantity,
      reason: row.reason,
      createdAt: row.created_at,
    }));
  } catch {
    return getLocalHistory();
  }
}

export function getStockHistory(): StockHistoryItem[] {
  return getLocalHistory();
}
