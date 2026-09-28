import { useState } from 'react';
import { Product, ProductVariantSummary, useProductCatalog } from '../../context/ProductCatalogContext';
import { primaryVariantId } from '../inventory/VariantPicker';

/** Selected-variant state for pricing editors, plus a save that patches only that variant's prices. */
export function usePricingVariant(product: Product | undefined) {
  const { updateProduct } = useProductCatalog();
  const [variantId, setVariantId] = useState<string | null>(primaryVariantId(product?.variants));
  const variants: ProductVariantSummary[] = product?.variants ?? [];
  const variant = variants.find(item => item.id === variantId);

  async function saveVariantPrice(patch: { mrp?: number; sellingPrice?: number }) {
    if (!product || !variant) throw new Error('This product has no variant to price.');
    await updateProduct(product.id, {
      variants: variants.map(item => (item.id === variant.id ? { ...item, ...patch } : item)),
    });
  }

  return { variants, variant, variantId, setVariantId, saveVariantPrice };
}
