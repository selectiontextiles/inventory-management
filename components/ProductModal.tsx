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

const DEFAULT_CATEGORIES = [
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
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<{ id?: string; colorName: string; sizes: Record<string, number> }[]>([
    { colorName: 'Shade No.01', sizes: { '36': 0, '38': 0, '40': 0, '42': 0, '44': 0 } },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const allCategories = React.useMemo(() => {
    const list = [...DEFAULT_CATEGORIES];
    customCategories.forEach(c => {
      if (!list.includes(c)) list.push(c);
    });
    if (category && !list.includes(category)) {
      list.push(category);
    }
    return list;
  }, [customCategories, category]);

  const handleConfirmNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (!customCategories.includes(trimmed)) {
      setCustomCategories(prev => [...prev, trimmed]);
    }
    setCategory(trimmed);
    setNewCategoryInput('');
    setIsAddingCustomCategory(false);
  };

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSubtitle(productToEdit.subtitle || '');
      setCategory(productToEdit.category || 'Ethnic Sets');
      setImageUrl(productToEdit.imageUrl || '');
      setVariants(
        productToEdit.variants.map(v => ({
          id: v.id,
          colorName: v.colorName,
          sizes: { ...v.sizes },
        }))
      );
    } else {
      setName('');
      setSubtitle('');
      setCategory('Ethnic Sets');
      setImageUrl('');
      setVariants([
        { colorName: 'Shade No.01', sizes: { '36': 0, '38': 0, '40': 0, '42': 0, '44': 0 } },
      ]);
    }
    setIsAddingCustomCategory(false);
    setNewCategoryInput('');
    setErrorMessage('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddVariantRow = () => {
    const nextNum = variants.length + 1;
    setVariants(prev => [
      ...prev,
      {
        colorName: `Shade No.${nextNum.toString().padStart(2, '0')}`,
        sizes: { '36': 0, '38': 0, '40': 0, '42': 0, '44': 0 },
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
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] border border-slate-200 animate-in fade-in slide-in-from-bottom-3 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
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

        {/* Scrollable Form Body */}
        <form 
          id="product-form"
          onSubmit={handleSubmit} 
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        >
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition"
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Category & Compact Photo Upload Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category Dropdown with inline custom add */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Category
                </label>
                {!isAddingCustomCategory && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomCategory(true)}
                    className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-0.5 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Category</span>
                  </button>
                )}
              </div>

              {isAddingCustomCategory ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
                  <input
                    type="text"
                    autoFocus
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConfirmNewCategory();
                      }
                      if (e.key === 'Escape') {
                        setIsAddingCustomCategory(false);
                        setNewCategoryInput('');
                      }
                    }}
                    placeholder="Type category..."
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 rounded-xl text-base sm:text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmNewCategory}
                    disabled={!newCategoryInput.trim()}
                    className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 transition shrink-0"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCustomCategory(false);
                      setNewCategoryInput('');
                    }}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition shrink-0"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setIsAddingCustomCategory(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white cursor-pointer transition"
                >
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__add_new__" className="font-semibold text-slate-900">
                    + Add New Category...
                  </option>
                </select>
              )}
            </div>

            {/* Streamlined Photo Upload */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Reference Photo
              </label>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2.5 h-[42px]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative w-7 h-7 rounded-lg bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center border border-slate-300/60">
                    {imageUrl ? (
                      <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-600 truncate">
                    {imageUrl ? 'Photo uploaded' : 'No photo'}
                  </span>
                </div>

                <label className="tap-press cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shrink-0">
                  <Upload className="w-3 h-3 text-slate-500" />
                  <span>{isUploading ? 'Uploading...' : imageUrl ? 'Change' : 'Upload'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageFileChange} 
                    className="hidden" 
                    disabled={isUploading} 
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Color / Shade Variants Matrix List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Color / Shade Variants & Sizes (36 — 44)
              </label>
              <button
                type="button"
                onClick={handleAddVariantRow}
                className="tap-press text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Shade Row</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, varIdx) => {
                return (
                  <div 
                    key={varIdx} 
                    className="p-3.5 sm:p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3 shadow-xs"
                  >
                    {/* Shade Header with Number Badge and Delete Action */}
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-md shrink-0">
                          Shade {varIdx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          value={variant.colorName}
                          onChange={(e) => handleVariantNameChange(varIdx, e.target.value)}
                          placeholder="e.g. Royal Blue / Shade No.01"
                          className="flex-1 min-w-0 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-base sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-900 transition"
                        />
                      </div>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(varIdx)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shrink-0"
                          title="Remove shade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Touch-Friendly 5-Column Size Inputs (36, 38, 40, 42, 44) */}
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {STANDARD_SIZES.map((sz) => {
                        const qty = variant.sizes[sz] ?? 0;
                        return (
                          <div 
                            key={sz} 
                            className="bg-white rounded-xl p-2 border border-slate-200 text-center shadow-xs flex flex-col justify-between items-center"
                          >
                            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              {sz}
                            </span>
                            <input
                              type="number"
                              min="0"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={qty === 0 ? '' : qty}
                              placeholder="0"
                              onChange={(e) => handleVariantSizeChange(varIdx, sz, e.target.value)}
                              className="w-full h-8 sm:h-9 text-center font-mono font-extrabold text-base sm:text-sm text-slate-900 bg-slate-50/60 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 focus:bg-white transition num-tabular placeholder:text-slate-300"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Sticky Action Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-white/95 backdrop-blur-sm flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="tap-press px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSaving}
            className="tap-press px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>{productToEdit ? 'Save Changes' : 'Create Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
