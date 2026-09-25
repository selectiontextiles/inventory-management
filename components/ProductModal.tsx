'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Check, Image as ImageIcon, AlertCircle, Plus, Minus, Trash2 } from 'lucide-react';
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
  const [productSizes, setProductSizes] = useState<string[]>(['36', '38', '40', '42', '44']);
  const [availableSizesPool, setAvailableSizesPool] = useState<string[]>(['36', '38', '40', '42', '44']);
  const [isAddingCustomSize, setIsAddingCustomSize] = useState(false);
  const [newCustomSizeInput, setNewCustomSizeInput] = useState('');
  const [variants, setVariants] = useState<{ id?: string; colorName: string; imageUrl?: string; sizes: Record<string, number> }[]>([
    { colorName: 'Shade No.01', sizes: { '36': 0, '38': 0, '40': 0, '42': 0, '44': 0 } },
  ]);
  const [uploadingVarIdx, setUploadingVarIdx] = useState<number | null>(null);
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

  const allAvailableSizes = React.useMemo(() => {
    const set = new Set([...STANDARD_SIZES, ...availableSizesPool, ...productSizes]);
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [availableSizesPool, productSizes]);

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

  const handleConfirmNewCustomSize = () => {
    const trimmed = newCustomSizeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!availableSizesPool.includes(trimmed)) {
      setAvailableSizesPool(prev => [...prev, trimmed]);
    }
    if (!productSizes.includes(trimmed)) {
      setProductSizes(prev => {
        const next = [...prev, trimmed];
        return next.sort((a, b) => {
          const numA = parseInt(a, 10);
          const numB = parseInt(b, 10);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.localeCompare(b);
        });
      });
    }
    setNewCustomSizeInput('');
    setIsAddingCustomSize(false);
  };

  const handleToggleSize = (sz: string) => {
    if (productSizes.includes(sz)) {
      if (productSizes.length <= 1) {
        setErrorMessage('A product must have at least one active size.');
        return;
      }
      setProductSizes(prev => prev.filter(s => s !== sz));
    } else {
      setErrorMessage('');
      setProductSizes(prev => {
        const next = [...prev, sz];
        return next.sort((a, b) => {
          const numA = parseInt(a, 10);
          const numB = parseInt(b, 10);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.localeCompare(b);
        });
      });
    }
  };

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSubtitle(productToEdit.subtitle || '');
      setCategory(productToEdit.category || 'Ethnic Sets');
      const editSizes = productToEdit.sizes && productToEdit.sizes.length > 0 
        ? productToEdit.sizes 
        : ['36', '38', '40', '42', '44'];
      setProductSizes(editSizes);
      setAvailableSizesPool(prev => Array.from(new Set([...prev, ...editSizes])));
      setVariants(
        productToEdit.variants.map(v => ({
          id: v.id,
          colorName: v.colorName,
          imageUrl: v.imageUrl || '',
          sizes: { ...v.sizes },
        }))
      );
    } else {
      setName('');
      setSubtitle('');
      setCategory('Ethnic Sets');
      setProductSizes(['36', '38', '40', '42', '44']);
      setVariants([
        { colorName: 'Shade No.01', sizes: { '36': 0, '38': 0, '40': 0, '42': 0, '44': 0 } },
      ]);
    }
    setIsAddingCustomCategory(false);
    setIsAddingCustomSize(false);
    setNewCategoryInput('');
    setNewCustomSizeInput('');
    setErrorMessage('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddVariantRow = () => {
    const nextNum = variants.length + 1;
    const initialSizes: Record<string, number> = {};
    productSizes.forEach(sz => {
      initialSizes[sz] = 0;
    });
    setVariants(prev => [
      ...prev,
      {
        colorName: `Shade No.${nextNum.toString().padStart(2, '0')}`,
        imageUrl: '',
        sizes: initialSizes,
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

  const handleVariantImageChange = async (varIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVarIdx(varIndex);
    try {
      const url = await uploadProductImage(file);
      setVariants(prev => {
        const copy = [...prev];
        copy[varIndex] = { ...copy[varIndex], imageUrl: url };
        return copy;
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Image upload failed.');
    } finally {
      setUploadingVarIdx(null);
    }
  };

  const handleRemoveVariantImage = (varIndex: number) => {
    setVariants(prev => {
      const copy = [...prev];
      copy[varIndex] = { ...copy[varIndex], imageUrl: '' };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }
    if (productSizes.length === 0) {
      setErrorMessage('Please select at least one size for this product.');
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
        sizes: productSizes,
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

          {/* Product Name & Category Row */}
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

          {/* Product Sizes Configuration at Product Level */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
                  Product Sizes ({productSizes.length} active)
                </label>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  Tap to enable/disable sizes for this product
                </p>
              </div>

              {!isAddingCustomSize && (
                <button
                  type="button"
                  onClick={() => setIsAddingCustomSize(true)}
                  className="tap-press text-xs font-bold text-slate-800 hover:text-slate-950 bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition shrink-0 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Custom Size</span>
                </button>
              )}
            </div>

            {/* Size Toggle Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {allAvailableSizes.map((sz) => {
                const isSelected = productSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleToggleSize(sz)}
                    className={`tap-press px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Size {sz}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}

              {isAddingCustomSize && (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
                  <input
                    type="text"
                    autoFocus
                    value={newCustomSizeInput}
                    onChange={(e) => setNewCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConfirmNewCustomSize();
                      }
                      if (e.key === 'Escape') {
                        setIsAddingCustomSize(false);
                        setNewCustomSizeInput('');
                      }
                    }}
                    placeholder="e.g. 46, XL"
                    className="w-24 px-3 py-1.5 bg-white border-2 border-slate-900 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmNewCustomSize}
                    disabled={!newCustomSizeInput.trim()}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-40 transition"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCustomSize(false);
                      setNewCustomSizeInput('');
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Color / Shade Variants Matrix List */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider block">
                  Color / Shade Variants
                </label>
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Configuring stock for {productSizes.map(s => `Size ${s}`).join(', ')}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddVariantRow}
                className="tap-press text-xs sm:text-sm font-bold text-slate-900 hover:underline flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Shade Row</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {variants.map((variant, varIdx) => {
                return (
                  <div 
                    key={varIdx} 
                    className="p-3.5 sm:p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3.5 shadow-xs"
                  >
                    {/* Shade Header with Number Badge and Delete Action */}
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-700 bg-slate-200/90 px-2.5 py-1 rounded-lg shrink-0">
                          Shade {varIdx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          value={variant.colorName}
                          onChange={(e) => handleVariantNameChange(varIdx, e.target.value)}
                          placeholder="e.g. Royal Blue / Shade No.01"
                          className="flex-1 min-w-0 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-base sm:text-base font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition"
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

                    {/* Shade Photo Upload Strip */}
                    <div className="p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {variant.imageUrl ? (
                            <Image src={variant.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-600 truncate">
                          {variant.imageUrl ? 'Photo attached' : 'No photo'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="tap-press cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition">
                          <Upload className="w-3 h-3 text-slate-500" />
                          <span>{uploadingVarIdx === varIdx ? 'Uploading...' : variant.imageUrl ? 'Change' : 'Upload Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleVariantImageChange(varIdx, e)}
                            className="hidden"
                            disabled={uploadingVarIdx === varIdx}
                          />
                        </label>
                        {variant.imageUrl && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantImage(varIdx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                            title="Remove photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Touch-Friendly Vertical Stacked Size Steppers (Product Specific Sizes) */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2.5">
                      {productSizes.map((sz) => {
                        const qty = variant.sizes[sz] ?? 0;
                        return (
                          <div 
                            key={sz} 
                            className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center overflow-hidden transition focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900"
                          >
                            {/* Size Header Label */}
                            <div className="w-full bg-slate-100 border-b border-slate-200 py-1 text-center select-none">
                              <span className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider block">
                                {sz}
                              </span>
                            </div>

                            {/* + Button (Top) */}
                            <button
                              type="button"
                              onClick={() => handleVariantSizeChange(varIdx, sz, String(qty + 1))}
                              className="w-full h-8 sm:h-9 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition select-none"
                              title={`Increase size ${sz}`}
                              aria-label={`Increase size ${sz}`}
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                            </button>

                            {/* Direct Quantity Input (Middle) */}
                            <input
                              type="number"
                              min="0"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={qty === 0 ? '' : qty}
                              placeholder="0"
                              onChange={(e) => handleVariantSizeChange(varIdx, sz, e.target.value)}
                              className="w-full h-8 sm:h-9 text-center font-mono font-black text-base sm:text-lg text-slate-900 bg-slate-50/70 border-y border-slate-200/80 focus:outline-none focus:bg-white transition num-tabular placeholder:text-slate-300"
                            />

                            {/* - Button (Bottom) */}
                            <button
                              type="button"
                              onClick={() => handleVariantSizeChange(varIdx, sz, String(Math.max(0, qty - 1)))}
                              disabled={qty <= 0}
                              className="w-full h-8 sm:h-9 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition select-none"
                              title={`Decrease size ${sz}`}
                              aria-label={`Decrease size ${sz}`}
                            >
                              <Minus className="w-4 h-4 stroke-[2.5]" />
                            </button>
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
        <div className="px-5 py-3.5 sm:py-4 border-t border-slate-200 bg-white/95 backdrop-blur-sm flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="tap-press px-4 py-2.5 sm:px-5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSaving}
            className="tap-press px-5 py-2.5 sm:px-6 sm:py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isSaving ? 'Saving...' : productToEdit ? 'Save Changes' : 'Create Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
