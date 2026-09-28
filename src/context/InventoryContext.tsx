import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useProductCatalog } from './ProductCatalogContext';
import { api, getApiErrorMessage, unwrapList } from '../services/api';
import { useVendorAuth } from './VendorAuthContext';

export type StockEventType = 'purchase' | 'sale' | 'adjustment' | 'return' | 'damage' | 'bulk' | 'correction';

export type StockEvent = {
  id: string;
  productId: string;
  productName: string;
  type: StockEventType;
  delta: number;
  afterStock: number;
  reason: string;
  reference?: string;
  actor: 'You' | 'System';
  timestamp: number;
};

interface RawStockEvent {
  id: string;
  productId: string;
  productName: string;
  type: StockEventType;
  delta: number;
  afterStock: number;
  reason: string;
  reference?: string;
  actor: 'You' | 'System';
  createdAt: string;
}

function toStockEvent(raw: RawStockEvent): StockEvent {
  return {
    id: raw.id,
    productId: raw.productId,
    productName: raw.productName,
    type: raw.type,
    delta: raw.delta,
    afterStock: raw.afterStock,
    reason: raw.reason,
    reference: raw.reference,
    actor: raw.actor,
    timestamp: new Date(raw.createdAt).getTime(),
  };
}

type RecordStockChangeParams = {
  productId: string;
  /** Defaults to the product's primary variant. */
  variantId?: string;
  newStock: number;
  reason: string;
  type?: StockEventType;
  reference?: string;
};

type InventoryContextValue = {
  events: StockEvent[];
  eventsError: string | null;
  recordStockChange: (params: RecordStockChangeParams) => Promise<{ wentOutOfStock: boolean }>;
  eventsForProduct: (productId: string) => StockEvent[];
  fetchProductHistory: (productId: string) => Promise<StockEvent[]>;
  refreshEvents: () => Promise<void>;
  /** Category ids the inventory lists are narrowed to; empty = all categories. */
  categoryFilter: string[];
  setCategoryFilter: (ids: string[]) => void;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { products, refreshProducts } = useProductCatalog();
  const { vendor } = useVendorAuth();
  const vendorId = vendor?.id ?? null;
  const [events, setEvents] = useState<StockEvent[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  const refreshEvents = useCallback(async () => {
    try {
      const { data } = await api.get('/vendor/products/stock-history');
      setEvents(unwrapList<RawStockEvent>(data).map(toStockEvent));
      setEventsError(null);
    } catch (err) {
      setEventsError(getApiErrorMessage(err));
      throw err;
    }
  }, []);

  const fetchProductHistory = useCallback(async (productId: string) => {
    const { data } = await api.get('/vendor/products/stock-history', { params: { productId } });
    return unwrapList<RawStockEvent>(data).map(toStockEvent);
  }, []);

  useEffect(() => {
    if (!vendorId) {
      setEvents([]);
      setEventsError(null);
      setCategoryFilter([]);
      return;
    }
    refreshEvents().catch(() => undefined);
  }, [vendorId, refreshEvents]);

  const recordStockChange = useCallback(
    async ({ productId, variantId, newStock, reason, type = 'adjustment', reference }: RecordStockChangeParams) => {
      const product = products.find(item => item.id === productId);
      if (!product) throw new Error('Product not found. Pull to refresh and try again.');

      const variants = product.variants ?? [];
      const variant = variantId
        ? variants.find(item => item.id === variantId)
        : variants.find(item => item.isPrimary) ?? variants[0];
      if (!variant) throw new Error('This product has no variants to update.');

      const clampedStock = Math.max(0, Math.round(newStock));
      const wentOutOfStock = clampedStock === 0 && variant.stock > 0;

      await api.patch(`/vendor/products/${productId}/stock`, {
        variantId: variant.id,
        stock: clampedStock,
        reason: reason || undefined,
        type,
        reference: reference || undefined,
      });

      await Promise.all([refreshProducts().catch(() => undefined), refreshEvents().catch(() => undefined)]);

      return { wentOutOfStock };
    },
    [products, refreshProducts, refreshEvents],
  );

  const eventsForProduct = useCallback(
    (productId: string) => events.filter(event => event.productId === productId),
    [events],
  );

  const value = useMemo(
    () => ({
      events,
      eventsError,
      recordStockChange,
      eventsForProduct,
      fetchProductHistory,
      refreshEvents,
      categoryFilter,
      setCategoryFilter,
    }),
    [events, eventsError, recordStockChange, eventsForProduct, fetchProductHistory, refreshEvents, categoryFilter],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
