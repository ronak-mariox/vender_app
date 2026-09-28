import type { Offer } from '../../context/OffersContext';
import type { Product, VendorCategory } from '../../context/ProductCatalogContext';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatOfferDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatOfferTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
}

export function formatOfferDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return `${formatOfferDate(iso)}, ${formatOfferTime(iso)}`;
}

export function offerDurationLabel(startDate: string | null | undefined, endDate: string | null | undefined): string {
  if (!startDate || !endDate) return 'Not set';
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const range = `${formatOfferDate(startDate)} – ${formatOfferDate(endDate)}`;
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return range;
  const days = Math.max(1, Math.round((end - start) / 86_400_000) + 1);
  return `${range} · ${days} day${days === 1 ? '' : 's'}`;
}

export function offerTypeLabel(offer: Pick<Offer, 'discountType' | 'discountValue'>) {
  return offer.discountType === 'percentage'
    ? `${offer.discountValue}% Percentage Discount`
    : `₹${offer.discountValue} Fixed Amount Off`;
}

export function offerDiscountLabel(offer: Pick<Offer, 'discountType' | 'discountValue'>) {
  return offer.discountType === 'percentage' ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`;
}

type ScopeSource = Pick<Offer, 'scope' | 'productIds' | 'categoryIds'>;

/** Human label for what an offer applies to, resolved against the vendor's real catalog. */
export function offerScopeLabel(offer: ScopeSource, products: Product[], categories: VendorCategory[]): string {
  if (offer.scope === 'entire-store') return 'Entire Store';
  const parts: string[] = [];
  if (offer.productIds.length > 0) {
    if (offer.productIds.length === 1) {
      const product = products.find(item => item.id === offer.productIds[0]);
      parts.push(product?.name ?? '1 product');
    } else {
      parts.push(`${offer.productIds.length} products`);
    }
  }
  if (offer.categoryIds.length > 0) {
    const names = offer.categoryIds
      .map(id => categories.find(category => category.id === id)?.name)
      .filter((name): name is string => Boolean(name));
    if (offer.categoryIds.length <= 2 && names.length === offer.categoryIds.length) {
      parts.push(names.join(', '));
    } else {
      parts.push(`${offer.categoryIds.length} categories`);
    }
  }
  return parts.length > 0 ? parts.join(' · ') : 'No products selected';
}

/** Number of catalog products an offer currently covers. */
export function offerEligibleProductCount(offer: ScopeSource, products: Product[]): number {
  if (offer.scope === 'entire-store') return products.length;
  const productIds = new Set(offer.productIds);
  const categoryIds = new Set(offer.categoryIds);
  const matched = products.filter(product => productIds.has(product.id) || categoryIds.has(product.categoryId)).length;
  // Selected products may not be loaded in the catalog yet; never report fewer than were picked.
  return Math.max(matched, productIds.size);
}

export function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}
