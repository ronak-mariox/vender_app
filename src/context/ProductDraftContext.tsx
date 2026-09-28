import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CreateProductInput, Product, useProductCatalog } from './ProductCatalogContext';

export type BasicInfoData = {
  name: string;
  brand: string;
  countryOfOrigin: string;
};

export type ImagesData = {
  /** Uploaded image URLs (relative backend paths), main image first. */
  images: string[];
};

export type CategoryData = {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
};

export type DescriptionData = {
  description: string;
};

export type ProductVariant = {
  id: string;
  size: string;
  mrp: string;
  sellingPrice: string;
  stock: string;
  isPrimary: boolean;
};

export type PackSizeData = {
  netWeight: string;
  unit: string;
  /** True when prices/stock are captured per variant (attribute categories, or multiple sizes). */
  variantsEnabled: boolean;
  variants: ProductVariant[];
  /** Label of the admin-configured variant type the vendor picked (e.g. "Storage"). */
  variantTypeLabel?: string;
  /** Sold as one piece — no size, unit or options. */
  singleItem?: boolean;
};

export type PricingData = {
  mrp: string;
  sellingPrice: string;
};

export type TaxData = {
  gstRate: string;
  hsnCode: string;
};

export type IdentifiersData = {
  sku: string;
  barcode: string;
};

export type StockData = {
  opening: string;
  reorderLevel: string;
  maxStock: string;
};

type ProductDraft = {
  basicInfo?: BasicInfoData;
  images: ImagesData;
  category?: CategoryData;
  description?: DescriptionData;
  packSize?: PackSizeData;
  pricing?: PricingData;
  tax?: TaxData;
  identifiers?: IdentifiersData;
  stock?: StockData;
};

const INITIAL_DRAFT: ProductDraft = {
  images: { images: [] },
};

export const ADD_PRODUCT_TOTAL_STEPS = 9;

export const SINGLE_ITEM_LABEL = '1 pc';

export function packSizeLabel(packSize?: PackSizeData): string {
  if (packSize?.singleItem) return SINGLE_ITEM_LABEL;
  if (!packSize || !packSize.netWeight) return '';
  return `${packSize.netWeight}${packSize.unit}`;
}

export function usesVariantPricing(packSize?: PackSizeData): boolean {
  return !!packSize?.variantsEnabled && packSize.variants.length > 0;
}

type ProductDraftContextValue = {
  draft: ProductDraft;
  /** MRP/selling price to display: the single price, or the primary variant's when priced per variant. */
  effectivePricing: PricingData | undefined;
  updateBasicInfo: (value: BasicInfoData) => void;
  updateImages: (value: ImagesData) => void;
  updateCategory: (value: CategoryData) => void;
  updateDescription: (value: DescriptionData) => void;
  updatePackSize: (value: PackSizeData) => void;
  updatePricing: (value: Partial<PricingData>) => void;
  updateTax: (value: TaxData) => void;
  updateIdentifiers: (value: Partial<IdentifiersData>) => void;
  updateStock: (value: StockData) => void;
  resetDraft: () => void;
  publishDraft: () => Promise<Product>;
};

const ProductDraftContext = createContext<ProductDraftContextValue | null>(null);

export function ProductDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<ProductDraft>(INITIAL_DRAFT);
  const { addProduct } = useProductCatalog();

  const updateBasicInfo = useCallback((value: BasicInfoData) => {
    setDraft(prev => ({ ...prev, basicInfo: value }));
  }, []);
  const updateImages = useCallback((value: ImagesData) => {
    setDraft(prev => ({ ...prev, images: value }));
  }, []);
  const updateCategory = useCallback((value: CategoryData) => {
    setDraft(prev => ({ ...prev, category: value }));
  }, []);
  const updateDescription = useCallback((value: DescriptionData) => {
    setDraft(prev => ({ ...prev, description: value }));
  }, []);
  const updatePackSize = useCallback((value: PackSizeData) => {
    setDraft(prev => ({ ...prev, packSize: value }));
  }, []);
  const updatePricing = useCallback((value: Partial<PricingData>) => {
    setDraft(prev => ({
      ...prev,
      pricing: { mrp: '', sellingPrice: '', ...prev.pricing, ...value },
    }));
  }, []);
  const updateTax = useCallback((value: TaxData) => {
    setDraft(prev => ({ ...prev, tax: value }));
  }, []);
  const updateIdentifiers = useCallback((value: Partial<IdentifiersData>) => {
    setDraft(prev => ({
      ...prev,
      identifiers: { sku: '', barcode: '', ...prev.identifiers, ...value },
    }));
  }, []);
  const updateStock = useCallback((value: StockData) => {
    setDraft(prev => ({ ...prev, stock: value }));
  }, []);
  const resetDraft = useCallback(() => {
    setDraft(INITIAL_DRAFT);
  }, []);

  const effectivePricing = useMemo<PricingData | undefined>(() => {
    if (usesVariantPricing(draft.packSize)) {
      const variants = draft.packSize?.variants ?? [];
      const primary = variants.find(v => v.isPrimary) ?? variants[0];
      return primary ? { mrp: primary.mrp, sellingPrice: primary.sellingPrice } : undefined;
    }
    return draft.pricing;
  }, [draft.pricing, draft.packSize]);

  const publishDraft = useCallback(async () => {
    const perVariant = usesVariantPricing(draft.packSize);
    const variants: CreateProductInput['variants'] = perVariant
      ? (draft.packSize?.variants ?? []).map(variant => ({
          label: variant.size.trim(),
          mrp: parseFloat(variant.mrp) || 0,
          price: parseFloat(variant.sellingPrice) || 0,
          stock: parseInt(variant.stock, 10) || 0,
          isPrimary: variant.isPrimary,
        }))
      : [
          {
            label: packSizeLabel(draft.packSize) || 'Default',
            mrp: parseFloat(draft.pricing?.mrp ?? '') || 0,
            price: parseFloat(draft.pricing?.sellingPrice ?? '') || 0,
            stock: parseInt(draft.stock?.opening ?? '', 10) || 0,
            isPrimary: true,
          },
        ];
    if (perVariant && !variants.some(variant => variant.isPrimary)) {
      variants[0].isPrimary = true;
    }

    const reorderLevel = parseInt(draft.stock?.reorderLevel ?? '', 10);
    const maxStock = parseInt(draft.stock?.maxStock ?? '', 10);

    const input: CreateProductInput = {
      categoryId: draft.category?.categoryId ?? '',
      subcategoryId: draft.category?.subcategoryId || undefined,
      name: draft.basicInfo?.name ?? '',
      description: draft.description?.description || undefined,
      brand: draft.basicInfo?.brand || undefined,
      unit: draft.packSize?.unit || undefined,
      images: draft.images.images,
      variants,
      taxRate: parseFloat(draft.tax?.gstRate ?? '') || 0,
      sku: draft.identifiers?.sku || undefined,
      barcode: draft.identifiers?.barcode || undefined,
      hsnCode: draft.tax?.hsnCode || undefined,
      countryOfOrigin: draft.basicInfo?.countryOfOrigin || undefined,
      reorderLevel: Number.isNaN(reorderLevel) ? undefined : reorderLevel,
      maxStock: Number.isNaN(maxStock) ? undefined : maxStock,
    };

    return addProduct(input);
  }, [draft, addProduct]);

  const value = useMemo(
    () => ({
      draft,
      effectivePricing,
      updateBasicInfo,
      updateImages,
      updateCategory,
      updateDescription,
      updatePackSize,
      updatePricing,
      updateTax,
      updateIdentifiers,
      updateStock,
      resetDraft,
      publishDraft,
    }),
    [
      draft,
      effectivePricing,
      updateBasicInfo,
      updateImages,
      updateCategory,
      updateDescription,
      updatePackSize,
      updatePricing,
      updateTax,
      updateIdentifiers,
      updateStock,
      resetDraft,
      publishDraft,
    ],
  );

  return <ProductDraftContext.Provider value={value}>{children}</ProductDraftContext.Provider>;
}

export function useProductDraft() {
  const context = useContext(ProductDraftContext);
  if (!context) {
    throw new Error('useProductDraft must be used within a ProductDraftProvider');
  }
  return context;
}
