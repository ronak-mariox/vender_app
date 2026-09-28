import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getApiErrorMessage, unwrapList } from '../services/api';
import { useVendorAuth } from './VendorAuthContext';

export type ProductStatus =
  | 'active'
  | 'low-stock'
  | 'out-of-stock'
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'inactive'
  | 'uploading'
  | 'error';

export type ProductVariantSummary = {
  id: string;
  size: string;
  mrp: number;
  sellingPrice: number;
  isPrimary: boolean;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  mrp: number;
  sellingPrice: number;
  /** Total units across all variants. */
  stock: number;
  reorderLevel: number;
  maxStock: number;
  status: ProductStatus;
  sku: string;
  barcode?: string;
  hsnCode?: string;
  gstRate?: string;
  packSize?: string;
  countryOfOrigin?: string;
  description?: string;
  galleryCount?: number;
  images?: string[];
  variants?: ProductVariantSummary[];
  rejectionReason?: string;
  createdAt?: number;
  updatedAt?: number;
};

export type CatalogSort = 'newest' | 'oldest' | 'name' | 'price-asc' | 'price-desc' | 'stock-asc';

export type CatalogFilters = {
  sort: CatalogSort;
  statuses: ProductStatus[];
  categoryIds: string[];
};

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = { sort: 'newest', statuses: [], categoryIds: [] };

export const CATALOG_SORT_LABELS: Record<CatalogSort, string> = {
  newest: 'Newest First',
  oldest: 'Oldest First',
  name: 'Name A–Z',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'stock-asc': 'Stock: Low to High',
};

export function applyCatalogFilters(products: Product[], filters: CatalogFilters): Product[] {
  const filtered = products.filter(
    product =>
      (filters.statuses.length === 0 || filters.statuses.includes(product.status)) &&
      (filters.categoryIds.length === 0 || filters.categoryIds.includes(product.categoryId)),
  );
  const sorted = [...filtered];
  switch (filters.sort) {
    case 'oldest':
      sorted.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'price-asc':
      sorted.sort((a, b) => a.sellingPrice - b.sellingPrice);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.sellingPrice - a.sellingPrice);
      break;
    case 'stock-asc':
      sorted.sort((a, b) => a.stock - b.stock);
      break;
    default:
      sorted.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }
  return sorted;
}

/**
 * Determines what unit/variant input the add-product flow shows for a category —
 * weight_volume for grocery-style g/kg/ml, attribute for discrete options like
 * clothing sizes or storage capacities, none for items sold as a single piece.
 * Configured admin-side per category.
 */
export type CategoryVariantConfig = {
  kind: 'weight_volume' | 'attribute' | 'none';
  label: string;
  units?: string[];
  options?: string[];
  /** The vendor may type a value that isn't in `options`. */
  allowCustom?: boolean;
};

type VariantConfigFields = {
  variantConfig?: CategoryVariantConfig;
  /** Every variant type allowed here; the vendor picks one per product. */
  variantConfigs?: CategoryVariantConfig[];
};

/** A category as returned by `GET /vendor/categories`. */
export type VendorCategory = VariantConfigFields & {
  id: string;
  name: string;
  subcategories: ({ id: string; name: string } & VariantConfigFields)[];
};

function ownVariantConfigs(source?: VariantConfigFields): CategoryVariantConfig[] {
  if (source?.variantConfigs?.length) return source.variantConfigs;
  return source?.variantConfig ? [source.variantConfig] : [];
}

/** A subcategory's own variant types override its category's; an empty result means "use the default pack-size input". */
export function resolveVariantConfigs(category?: VendorCategory, subcategoryId?: string): CategoryVariantConfig[] {
  const subcategory = category?.subcategories.find(sub => sub.id === subcategoryId);
  const own = ownVariantConfigs(subcategory);
  return own.length > 0 ? own : ownVariantConfigs(category);
}

// ---------------------------------------------------------------------------
// Backend (API) shapes — these mirror the vendor products/categories contract.
// ---------------------------------------------------------------------------

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  showOnHome: boolean;
  subcategories: {
    id: string;
    name: string;
    imageUrl?: string;
    isActive: boolean;
    variantConfig?: CategoryVariantConfig;
    variantConfigs?: CategoryVariantConfig[];
  }[];
  variantConfig?: CategoryVariantConfig;
  variantConfigs?: CategoryVariantConfig[];
};

type ApiVariant = {
  id: string;
  label: string;
  mrp: number;
  price: number;
  stock: number;
  sku?: string;
  isPrimary?: boolean;
};

type ApiProduct = {
  id: string;
  vendorId: string;
  categoryId: string;
  subcategoryId?: string;
  name: string;
  description?: string;
  brand?: string;
  unit?: string;
  images: string[];
  variants: ApiVariant[];
  tags: string[];
  taxRate: number;
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'rejected';
  rejectionReason?: string;
  isAvailable: boolean;
  sku?: string;
  barcode?: string;
  hsnCode?: string;
  countryOfOrigin?: string;
  reorderLevel?: number;
  maxStock?: number;
  createdAt: string;
  updatedAt: string;
};

/** Input shape accepted by `addProduct`, closely mirroring the `POST /vendor/products` body. */
export type CreateProductInput = {
  categoryId: string;
  subcategoryId?: string;
  name: string;
  description?: string;
  brand?: string;
  unit?: string;
  images?: string[];
  variants: {
    id?: string;
    label: string;
    mrp: number;
    price: number;
    stock: number;
    sku?: string;
    isPrimary?: boolean;
  }[];
  tags?: string[];
  taxRate?: number;
  sku?: string;
  barcode?: string;
  hsnCode?: string;
  countryOfOrigin?: string;
  reorderLevel?: number;
  maxStock?: number;
};

function primaryVariant(variants: ApiVariant[]): ApiVariant | undefined {
  return variants.find(variant => variant.isPrimary) ?? variants[0];
}

/**
 * Derives the local display status from the backend product status + current stock.
 * Backend `status` is admin-controlled (pending/active/rejected) and `isAvailable` is the
 * vendor's own pause/activate toggle. `low-stock`/`out-of-stock` don't exist server-side —
 * they're derived here from the real stock level of an active, available product.
 */
function deriveStatus(apiProduct: ApiProduct, stock: number): ProductStatus {
  if (apiProduct.status === 'rejected') return 'rejected';
  if (apiProduct.status === 'pending') return 'pending';
  if (apiProduct.status === 'inactive' || !apiProduct.isAvailable) return 'inactive';
  if (stock <= 0) return 'out-of-stock';
  if (stock <= (apiProduct.reorderLevel ?? 0)) return 'low-stock';
  return 'active';
}

function mapProduct(apiProduct: ApiProduct, categories: ApiCategory[]): Product {
  const variant = primaryVariant(apiProduct.variants);
  const category = categories.find(item => item.id === apiProduct.categoryId);
  const subcategory = category?.subcategories.find(item => item.id === apiProduct.subcategoryId);
  const stock = apiProduct.variants.reduce((sum, item) => sum + (item.stock ?? 0), 0);

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    brand: apiProduct.brand ?? '',
    categoryId: apiProduct.categoryId,
    categoryName: category?.name ?? '',
    subcategoryId: apiProduct.subcategoryId ?? '',
    subcategoryName: subcategory?.name ?? '',
    mrp: variant?.mrp ?? 0,
    sellingPrice: variant?.price ?? 0,
    stock,
    reorderLevel: apiProduct.reorderLevel ?? 0,
    maxStock: apiProduct.maxStock ?? 0,
    status: deriveStatus(apiProduct, stock),
    sku: apiProduct.sku ?? '',
    barcode: apiProduct.barcode,
    hsnCode: apiProduct.hsnCode,
    gstRate: apiProduct.taxRate != null ? String(apiProduct.taxRate) : undefined,
    packSize: variant?.label || apiProduct.unit || undefined,
    countryOfOrigin: apiProduct.countryOfOrigin,
    description: apiProduct.description,
    galleryCount: apiProduct.images?.length ?? 0,
    images: apiProduct.images ?? [],
    variants: apiProduct.variants.map(item => ({
      id: item.id,
      size: item.label,
      mrp: item.mrp,
      sellingPrice: item.price,
      isPrimary: !!item.isPrimary,
      stock: item.stock,
    })),
    rejectionReason: apiProduct.rejectionReason,
    createdAt: apiProduct.createdAt ? new Date(apiProduct.createdAt).getTime() : undefined,
    updatedAt: apiProduct.updatedAt ? new Date(apiProduct.updatedAt).getTime() : undefined,
  };
}

/**
 * Builds the full backend `variants` array to send on a PATCH, applying a partial local patch
 * (mrp/sellingPrice/variants) on top of the product's current backend variants so fields we
 * aren't touching (like per-variant stock, which the local patch shape doesn't carry) survive.
 */
function mergeVariantsForPatch(raw: ApiProduct, patch: Partial<Product>): ApiVariant[] | undefined {
  if (patch.variants) {
    return patch.variants.map(local => {
      const existing = raw.variants.find(v => v.id === local.id);
      return {
        id: local.id,
        label: local.size,
        mrp: local.mrp,
        price: local.sellingPrice,
        stock: existing?.stock ?? 0,
        sku: existing?.sku,
        isPrimary: local.isPrimary,
      };
    });
  }

  if (patch.mrp !== undefined || patch.sellingPrice !== undefined) {
    const current = primaryVariant(raw.variants);
    if (!current) return undefined;
    return raw.variants.map(variant =>
      variant.id === current.id
        ? {
            ...variant,
            mrp: patch.mrp !== undefined ? patch.mrp : variant.mrp,
            price: patch.sellingPrice !== undefined ? patch.sellingPrice : variant.price,
          }
        : variant,
    );
  }

  return undefined;
}

type ProductCatalogContextValue = {
  products: Product[];
  categories: VendorCategory[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  catalogFilters: CatalogFilters;
  setCatalogFilters: (filters: CatalogFilters) => void;
  addProduct: (input: CreateProductInput) => Promise<Product>;
  setProductStatus: (id: string, status: ProductStatus) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>;
};

const ProductCatalogContext = createContext<ProductCatalogContextValue | null>(null);

export function ProductCatalogProvider({ children }: { children: React.ReactNode }) {
  const { vendor } = useVendorAuth();
  const vendorId = vendor?.id ?? null;
  const [rawProducts, setRawProducts] = useState<ApiProduct[]>([]);
  const [rawCategories, setRawCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogFilters, setCatalogFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);

  const loadAll = useCallback(async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      api.get('/vendor/products'),
      api.get('/vendor/categories'),
    ]);
    setRawProducts(unwrapList<ApiProduct>(productsRes.data));
    setRawCategories(unwrapList<ApiCategory>(categoriesRes.data));
    setError(null);
  }, []);

  useEffect(() => {
    if (!vendorId) {
      setRawProducts([]);
      setRawCategories([]);
      setError(null);
      setLoading(false);
      setCatalogFilters(DEFAULT_CATALOG_FILTERS);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadAll()
      .catch(err => {
        if (!cancelled) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vendorId, loadAll]);

  const refreshProducts = useCallback(async () => {
    try {
      await loadAll();
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    }
  }, [loadAll]);

  const products = useMemo(
    () => rawProducts.map(item => mapProduct(item, rawCategories)),
    [rawProducts, rawCategories],
  );

  const categories = useMemo<VendorCategory[]>(
    () =>
      rawCategories.map(category => ({
        id: category.id,
        name: category.name,
        subcategories: category.subcategories.map(sub => ({
          id: sub.id,
          name: sub.name,
          variantConfig: sub.variantConfig,
          variantConfigs: sub.variantConfigs,
        })),
        variantConfig: category.variantConfig,
        variantConfigs: category.variantConfigs,
      })),
    [rawCategories],
  );

  const addProduct = useCallback(
    async (input: CreateProductInput) => {
      const { data } = await api.post<ApiProduct>('/vendor/products', input);
      setRawProducts(prev => [data, ...prev]);
      return mapProduct(data, rawCategories);
    },
    [rawCategories],
  );

  const updateProduct = useCallback(
    async (id: string, patch: Partial<Product>) => {
      const raw = rawProducts.find(item => item.id === id);
      if (!raw) return;

      const body: Record<string, unknown> = {};
      if (patch.name !== undefined) body.name = patch.name;
      if (patch.brand !== undefined) body.brand = patch.brand;
      if (patch.categoryId !== undefined) body.categoryId = patch.categoryId;
      if (patch.subcategoryId !== undefined) body.subcategoryId = patch.subcategoryId;
      if (patch.description !== undefined) body.description = patch.description;
      if (patch.hsnCode !== undefined) body.hsnCode = patch.hsnCode;
      if (patch.barcode !== undefined) body.barcode = patch.barcode;
      if (patch.sku !== undefined) body.sku = patch.sku;
      if (patch.countryOfOrigin !== undefined) body.countryOfOrigin = patch.countryOfOrigin;
      if (patch.packSize !== undefined) body.unit = patch.packSize;
      if (patch.gstRate !== undefined) body.taxRate = parseFloat(patch.gstRate) || 0;
      if (patch.reorderLevel !== undefined) body.reorderLevel = patch.reorderLevel;
      if (patch.maxStock !== undefined) body.maxStock = patch.maxStock;
      if (patch.images !== undefined) body.images = patch.images;

      const mergedVariants = mergeVariantsForPatch(raw, patch);
      if (mergedVariants) body.variants = mergedVariants;

      if (Object.keys(body).length === 0) {
        // Nothing backend-relevant changed (e.g. a local-only field like `galleryCount`) — there's
        // no server model for it in this pass, so there's nothing to persist.
        return;
      }

      const { data } = await api.patch<ApiProduct>(`/vendor/products/${id}`, body);
      setRawProducts(prev => prev.map(item => (item.id === id ? data : item)));
    },
    [rawProducts],
  );

  const removeProduct = useCallback(async (id: string) => {
    await api.delete(`/vendor/products/${id}`);
    setRawProducts(prev => prev.filter(item => item.id !== id));
  }, []);

  const setProductStatus = useCallback(async (id: string, status: ProductStatus) => {
    // Vendors can't set the admin-controlled `status` enum directly — the only self-service
    // control they have is the availability (pause/activate) toggle.
    const { data } = await api.patch<ApiProduct>(`/vendor/products/${id}/availability`, {
      isAvailable: status !== 'inactive',
    });
    setRawProducts(prev => prev.map(item => (item.id === id ? data : item)));
  }, []);

  const value = useMemo(
    () => ({
      products,
      categories,
      loading,
      error,
      refreshProducts,
      catalogFilters,
      setCatalogFilters,
      addProduct,
      setProductStatus,
      removeProduct,
      updateProduct,
    }),
    [
      products,
      categories,
      loading,
      error,
      refreshProducts,
      catalogFilters,
      addProduct,
      setProductStatus,
      removeProduct,
      updateProduct,
    ],
  );

  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
}

export function useProductCatalog() {
  const context = useContext(ProductCatalogContext);
  if (!context) {
    throw new Error('useProductCatalog must be used within a ProductCatalogProvider');
  }
  return context;
}
