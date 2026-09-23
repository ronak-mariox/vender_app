import { Product, ProductStatus } from '../context/ProductCatalogContext';

export type InventoryCategory = 'in-stock' | 'low-stock' | 'out-of-stock' | 'unavailable';

export function inventoryCategory(status: ProductStatus): InventoryCategory {
  if (status === 'active') return 'in-stock';
  if (status === 'low-stock') return 'low-stock';
  if (status === 'out-of-stock') return 'out-of-stock';
  return 'unavailable';
}

export function isInventoryCategory(product: Product, category: InventoryCategory): boolean {
  return inventoryCategory(product.status) === category;
}

export const STOCK_REASONS = [
  'New Stock Purchase',
  'Return from Customer',
  'Manual Count Correction',
  'Damage / Expiry Removal',
  'Transfer from Branch',
  'Other',
];

export const UNAVAILABLE_REASON_LABEL: Record<string, { label: string; tone: 'neutral' | 'warning' | 'error' }> = {
  inactive: { label: 'Inactive (manual)', tone: 'neutral' },
  pending: { label: 'Pending Approval', tone: 'warning' },
  rejected: { label: 'Rejected by admin', tone: 'error' },
  draft: { label: 'Draft — incomplete', tone: 'neutral' },
  approved: { label: 'Approved — awaiting sync', tone: 'neutral' },
  uploading: { label: 'Uploading', tone: 'neutral' },
  error: { label: 'Error — needs review', tone: 'error' },
};
