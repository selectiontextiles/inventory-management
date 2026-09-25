export type StandardSize = '36' | '38' | '40' | '42' | '44';

export const STANDARD_SIZES: StandardSize[] = ['36', '38', '40', '42', '44'];

export interface ColorVariant {
  id: string;
  colorName: string; // e.g. "T.Blue / Sh No.02", "Orange / Sh No.03"
  colorHex?: string; // Optional hex for swatch preview
  imageUrl?: string; // Image for this specific color/shade variant
  sizes: Record<string, number>; // { '36': 1, '38': 2, '40': 3, '42': 2, '44': 3 }
  totalUnits: number;
}

export interface Product {
  id: string;
  sku: string; // Internal auto-increment
  name: string; // e.g. "Uathayam 2in1 Sets"
  subtitle?: string; // e.g. "Divine Fixit Full Shirt Dhoti Set"
  category: string;
  sizes?: string[]; // Product-specific sizes, e.g. ['36', '38', '40'] or ['38', '40', '42', '44']
  variants: ColorVariant[];
  totalUnits: number;
  totalAlerts: number; // Count of depleted or low stock size variants
  createdAt: string;
  updatedAt: string;
}

export interface StockHistoryItem {
  id: string;
  productId: string;
  productName: string;
  variantName: string;
  size: string;
  changeAmount: number;
  resultingQuantity: number;
  reason: string;
  createdAt: string;
}

export interface ProductFormData {
  name: string;
  subtitle?: string;
  category: string;
  sizes?: string[];
  variants: {
    id?: string;
    colorName: string;
    imageUrl?: string;
    sizes: Record<string, number>;
  }[];
}
