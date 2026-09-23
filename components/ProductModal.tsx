'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Check, Image as ImageIcon, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Product, ProductFormData, STANDARD_SIZES } from '@/lib/types';
import { uploadProductImage } from '@/lib/inventoryStore';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ProductFormData, existingId?: string) => Promise<void>;
  productToEdit?: Product | null;
}

const CATEGORIES = [
  'Ethnic Sets',
  'Cotton',
  'Linen',
  'Denim',
  'Silk & Ethnic',
  'Suiting',
  'Wool Blend',
  'Other',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Ethnic Sets');
  const [price, setPrice] = useState<number | string>(1850);
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<{ colorName: string; sizes: Record<string, number> }[]>([
    { colorName: 'T.Blue / Sh No.02', sizes: { '36': 1, '38': 2, '40': 3, '42': 2, '44': 3 } },
    { colorName: 'Orange / Sh No.03', sizes: { '36': 1, '38': 1, '40': 0, '42': 1, '44': 2 } },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSubtitle(productToEdit.subtitle || '');
      setCategory(productToEdit.category || 'Ethnic Sets');
      setPrice(productToEdit.price || 0);
      setImageUrl(productToEdit.imageUrl || '');
      setVariants(
        productToEdit.variants.map(v => ({
          colorName: v.colorName,
          sizes: { ...v.sizes },
        }))
      );
    } else {
      setName('');
      setSubtitle('');
      setCategory('Ethnic Sets');
      setPrice(1850);
      setImageUrl('');
      setVariants([
        { colorName: 'T.Blue / Sh No.02', sizes: { '36': 1, '38': 2, '40': 3, '42': 2, '44': 3 } },
        { colorName: 'Orange / Sh No.03', sizes: { '36': 1, '38': 1, '40': 0, '42': 1, '44': 2 } },
        { colorName: 'Green / Shade No. 04', sizes: { '36': 3, '38': 5, '40': 1, '42': 2, '44': 1 } },
      ]);
    }
    setErrorMessage('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddVariantRow = () => {
    const nextNum = variants.length + 1;
    setVariants(prev => [
      ...prev,
      {
        colorName: `Shade No.${nextNum.toString().padStart(2, '0')}`,
        sizes: { '36': 2, '38': 2, '40': 2, '42': 2, '44': 2 },
      },
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantNameChange = (index: number, val: string) => {
    setVariants(prev => {
      const copy = [...prev];
      copy[index].colorName = val;
      return copy;
    });
  };

  const handleVariantSizeChange = (varIndex: number, size: string, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setVariants(prev => {
      const copy = [...prev];
      copy[varIndex].sizes[size] = num;
      return copy;
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadProductImage(file);
      setImageUrl(url);
    } catch {
      setErrorMessage('Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }
    if (variants.length === 0) {
      setErrorMessage('Please add at least one color/shade variant.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name,
        subtitle,
        category,
        price: Number(price) || 0,
        imageUrl,
        variants,
      }, productToEdit ? productToEdit.id : undefined);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {productToEdit ? 'Edit Product & Color Shades' : 'Add New Textile Product'}
            </h2>
            <p className="text-xs text-slate-500">
              Configure product details, color shades, and size inventory
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Product Name & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Product / Brand Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Uathayam 2in1 Sets"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Subtitle / Description
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Divine Fixit Full Shirt Dhoti Set"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Category & Image Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                {imageUrl ? (
                  <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                ) : (
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <label className="tap-press cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700">
                  <Upload className="w-3 h-3" />
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" disabled={isUploading} />
                </label>
              </div>
            </div>
          </div>

        {/* Color / Shade Variants Matrix List */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Color / Shade Variants & Sizes (36 — 44)
              </label>
              <button
                type="button"
                onClick={handleAddVariantRow}
                className="tap-press text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Color Row</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, varIdx) => {
                return (
                  <div key={varIdx} className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          value={variant.colorName}
                          onChange={(e) => handleVariantNameChange(varIdx, e.target.value)}
                          placeholder="e.g. Sand Beige / Shade No.01"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-900 shadow-sm"
                        />
                      </div>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(varIdx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Remove color"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Sizes inputs (36, 38, 40, 42, 44) */}
                    <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                      {STANDARD_SIZES.map((sz) => {
                        const qty = variant.sizes[sz] ?? 0;
                        return (
                          <div 
                            key={sz} 
                            className="bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200/90 text-center shadow-sm flex flex-col justify-between"
                          >
                            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              {sz}
                            </span>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleVariantSizeChange(varIdx, sz, String(Math.max(0, qty - 1)))}
                                className="w-6 h-7 sm:w-7 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition select-none"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={qty}
                                onChange={(e) => handleVariantSizeChange(varIdx, sz, e.target.value)}
                                className="w-10 sm:w-12 h-7 sm:h-8 text-center font-mono font-black num-tabular text-slate-900 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleVariantSizeChange(varIdx, sz, String(qty + 1))}
                                className="w-6 h-7 sm:w-7 sm:h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center text-xs font-bold transition select-none"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="tap-press px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="tap-press px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{productToEdit ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
