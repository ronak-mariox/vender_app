import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useProductCatalog } from './ProductCatalogContext';
import { api } from '../services/api';

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
  newStock: number;
  reason: string;
  type?: StockEventType;
  reference?: string;
  actor?: 'You' | 'System';
};

type InventoryContextValue = {
  events: StockEvent[];
  recordStockChange: (params: RecordStockChangeParams) => Promise<{ wentOutOfStock: boolean } | undefined>;
  eventsForProduct: (productId: string) => StockEvent[];
  refreshEvents: () => Promise<void>;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { products, refreshProducts } = useProductCatalog();
  const [events, setEvents] = useState<StockEvent[]>([]);

  const refreshEvents = useCallback(async () => {
    const { data } = await api.get<RawStockEvent[]>('/vendor/products/stock-history');
    setEvents(data.map(toStockEvent));
  }, []);

  useEffect(() => {
    refreshEvents().catch(() => {});
  }, [refreshEvents]);

  const recordStockChange = useCallback(
    async ({ productId, newStock, reason, type = 'adjustment', reference }: RecordStockChangeParams) => {
      const product = products.find(item => item.id === productId);
      if (!product) return undefined;

      const primaryVariantId = product.variants?.find(variant => variant.isPrimary)?.id ?? product.variants?.[0]?.id;
      if (!primaryVariantId) return undefined;

      const clampedStock = Math.max(0, newStock);
      const wentOutOfStock = clampedStock === 0 && product.stock > 0;

      await api.patch(`/vendor/products/${productId}/stock`, {
        variantId: primaryVariantId,
        stock: clampedStock,
        reason,
        type,
        reference,
      });

      await Promise.all([refreshProducts(), refreshEvents()]);

      return { wentOutOfStock };
    },
    [products, refreshProducts, refreshEvents],
  );

  const eventsForProduct = useCallback(
    (productId: string) => events.filter(event => event.productId === productId),
    [events],
  );

  const value = useMemo(
    () => ({ events, recordStockChange, eventsForProduct, refreshEvents }),
    [events, recordStockChange, eventsForProduct, refreshEvents],
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
