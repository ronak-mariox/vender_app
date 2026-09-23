import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { colors } from '../theme';
import { IconName } from '../icons/Icon';
import { api } from '../services/api';
import { formatTimeAgo } from '../utils/time';

export type OrderStatus =
  | 'new'
  | 'preparing'
  | 'quality-check'
  | 'packing'
  | 'ready-for-dispatch'
  | 'dispatched'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type OrderProduct = {
  name: string;
  price: number;
  qty: number;
};

export type DeliveryPartner = {
  name: string;
  vehicle: string;
  plate: string;
};

export type OrderStatusEvent = {
  status: OrderStatus;
  time: string;
};

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  itemsCount: number;
  location: string;
  addressLine1: string;
  addressLine2: string;
  timeLabel: string;
  amount: number;
  deliveryCharge: number;
  paymentMethod: string;
  status: OrderStatus;
  products: OrderProduct[];
  specialInstructions?: string;
  deliveryPartner?: DeliveryPartner;
  cancelReason?: string;
  failReason?: string;
  rating?: number;
  review?: string;
  statusHistory: OrderStatusEvent[];
  distanceLabel?: string;
  loyaltyLabel?: string;
  cancelledBy?: 'customer' | 'vendor';
};

export type OrderStatusMeta = {
  label: string;
  color: string;
  background: string;
  icon: IconName;
};

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  new: { label: 'New Order', color: '#1570EF', background: '#EFF8FF', icon: 'shopping-cart' },
  preparing: { label: 'Preparing', color: colors.warningDark, background: colors.warningSurface, icon: 'package' },
  'quality-check': { label: 'Quality Check', color: '#7C3AED', background: '#F5F3FF', icon: 'check-circle' },
  packing: { label: 'Packing', color: '#EA580C', background: '#FFF7ED', icon: 'layers' },
  'ready-for-dispatch': { label: 'Ready to Dispatch', color: '#0891B2', background: '#ECFEFF', icon: 'truck' },
  dispatched: { label: 'Dispatched', color: '#4338CA', background: '#EEF2FF', icon: 'truck' },
  completed: { label: 'Completed', color: colors.primary, background: colors.primarySurface, icon: 'check-circle' },
  cancelled: { label: 'Cancelled', color: colors.error, background: colors.errorSurface, icon: 'x-circle' },
  failed: { label: 'Failed', color: '#374151', background: '#F3F4F6', icon: 'alert-circle' },
};

// ---------------------------------------------------------------------------
// Backend (API) shapes
// ---------------------------------------------------------------------------

type ApiOrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

type ApiOrderItem = {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  imageUrl?: string;
  price: number;
  mrp: number;
  quantity: number;
  subtotal: number;
};

type ApiOrderAddress = {
  contactName?: string;
  contactPhone?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
};

type ApiOrderPricing = {
  itemsTotal: number;
  taxTotal: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  grandTotal: number;
};

type ApiOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  items: ApiOrderItem[];
  address: ApiOrderAddress;
  pricing: ApiOrderPricing;
  couponCode?: string;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: ApiOrderStatus;
  statusHistory: { status: ApiOrderStatus; at: string; note?: string }[];
  specialInstructions?: string;
  cancelReason?: string;
  cancelledBy?: 'customer' | 'vendor' | 'admin';
  placedAt: string;
  deliveredAt?: string;
  createdAt: string;
};

/**
 * Local-only extras that have no backend representation in this pass: the interim
 * "Quality Check" UI step (no backend call happens for it — see `startQualityCheck`),
 * a post-delivery rating/review, and an item-substitution overlay for the (rare) replace/remove
 * item flow. None of this survives a refresh from the server; it's an in-memory convenience
 * layered on top of the real order data.
 */
type OrderOverlay = {
  qualityCheckStarted?: boolean;
  productsOverride?: OrderProduct[];
  rating?: number;
  review?: string;
};

function mapHistoryStatus(status: ApiOrderStatus): OrderStatus {
  switch (status) {
    case 'placed':
      return 'new';
    case 'accepted':
      return 'preparing';
    case 'preparing':
      return 'packing';
    case 'ready_for_pickup':
      return 'ready-for-dispatch';
    case 'out_for_delivery':
      return 'dispatched';
    case 'delivered':
      return 'completed';
    case 'rejected':
      return 'cancelled';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'new';
  }
}

function isFailedQualityCheck(order: ApiOrder): boolean {
  if (order.status !== 'cancelled') return false;
  const note = order.cancelReason ?? order.statusHistory[order.statusHistory.length - 1]?.note ?? '';
  return /quality check/i.test(note);
}

function deriveStatus(order: ApiOrder, overlay?: OrderOverlay): OrderStatus {
  if (order.status === 'accepted' && overlay?.qualityCheckStarted) return 'quality-check';
  if (order.status === 'cancelled' && isFailedQualityCheck(order)) return 'failed';
  return mapHistoryStatus(order.status);
}

function formatApiTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

function buildHistory(order: ApiOrder, overlay?: OrderOverlay): OrderStatusEvent[] {
  const merged: OrderStatusEvent[] = [];
  for (const entry of order.statusHistory) {
    merged.push({ status: mapHistoryStatus(entry.status), time: formatApiTime(entry.at) });
    if (entry.status === 'accepted' && overlay?.qualityCheckStarted) {
      merged.push({ status: 'quality-check', time: formatApiTime(entry.at) });
    }
  }
  return merged;
}

function mapCancelledBy(value: ApiOrder['cancelledBy']): 'customer' | 'vendor' | undefined {
  if (value === 'customer') return 'customer';
  if (value === 'vendor' || value === 'admin') return 'vendor';
  return undefined;
}

function mapOrder(apiOrder: ApiOrder, overlay?: OrderOverlay): Order {
  const products = overlay?.productsOverride ?? apiOrder.items.map(item => ({
    name: item.name,
    price: item.price,
    qty: item.quantity,
  }));
  const itemsCount = products.reduce((sum, item) => sum + item.qty, 0);
  const amount = overlay?.productsOverride
    ? products.reduce((sum, item) => sum + item.price * item.qty, 0) + apiOrder.pricing.deliveryFee
    : apiOrder.pricing.grandTotal;

  const addressParts = [apiOrder.address.line2, apiOrder.address.city, apiOrder.address.state, apiOrder.address.pincode]
    .map(part => part?.trim())
    .filter((part): part is string => !!part);

  const status = deriveStatus(apiOrder, overlay);
  const failed = status === 'failed';

  return {
    id: apiOrder.orderNumber,
    customerName: apiOrder.customerName,
    customerPhone: apiOrder.customerPhone ?? '',
    itemsCount,
    location: apiOrder.address.city,
    addressLine1: apiOrder.address.line1,
    addressLine2: addressParts.join(', '),
    timeLabel: formatTimeAgo(new Date(apiOrder.placedAt).getTime()),
    amount,
    deliveryCharge: apiOrder.pricing.deliveryFee,
    paymentMethod: apiOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online',
    status,
    products,
    specialInstructions: apiOrder.specialInstructions,
    // There's no real driver-assignment system wired up server-side yet, so we never fabricate
    // a delivery partner — screens that need one show a "will be assigned shortly" placeholder.
    deliveryPartner: undefined,
    cancelReason: !failed ? apiOrder.cancelReason : undefined,
    failReason: failed ? apiOrder.cancelReason ?? 'Failed quality check' : undefined,
    rating: overlay?.rating,
    review: overlay?.review,
    statusHistory: buildHistory(apiOrder, overlay),
    cancelledBy: mapCancelledBy(apiOrder.cancelledBy),
  };
}

type CompleteOutcome = { rating?: number; review?: string };

type OrdersContextValue = {
  orders: Order[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
  getOrder: (orderId: string) => Order | undefined;
  ordersByStatus: (statuses: OrderStatus[]) => Order[];
  acceptOrder: (orderId: string) => Promise<void>;
  acceptAllNew: () => Promise<void>;
  rejectOrder: (orderId: string, reason?: string) => Promise<void>;
  cancelAcceptedOrder: (orderId: string, reason: string) => Promise<void>;
  startQualityCheck: (orderId: string) => void;
  passQualityCheck: (orderId: string) => Promise<void>;
  failQualityCheck: (orderId: string) => Promise<void>;
  markPacked: (orderId: string) => Promise<void>;
  handoverToPartner: (orderId: string) => Promise<void>;
  replaceOrderItem: (orderId: string, targetName: string, replacement: OrderProduct) => void;
  removeOrderItem: (orderId: string, targetName: string) => void;
  completeOrder: (orderId: string, outcome?: CompleteOutcome) => Promise<void>;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [rawOrders, setRawOrders] = useState<ApiOrder[]>([]);
  const [overlays, setOverlays] = useState<Record<string, OrderOverlay>>({});
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    const { data } = await api.get<ApiOrder[]>('/vendor/orders');
    setRawOrders(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadOrders()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadOrders]);

  const refreshOrders = useCallback(async () => {
    await loadOrders();
  }, [loadOrders]);

  const orders = useMemo(
    () => rawOrders.map(item => mapOrder(item, overlays[item.orderNumber])),
    [rawOrders, overlays],
  );

  const findRaw = useCallback((orderId: string) => rawOrders.find(item => item.orderNumber === orderId), [rawOrders]);

  const setStatus = useCallback(
    async (orderId: string, status: ApiOrderStatus, note?: string) => {
      const raw = findRaw(orderId);
      if (!raw) return;
      const { data } = await api.patch<ApiOrder>(`/vendor/orders/${raw.id}/status`, { status, note });
      setRawOrders(prev => prev.map(item => (item.id === data.id ? data : item)));
    },
    [findRaw],
  );

  const acceptOrder = useCallback((orderId: string) => setStatus(orderId, 'accepted'), [setStatus]);

  const acceptAllNew = useCallback(async () => {
    const newOrderIds = rawOrders.filter(item => item.status === 'placed').map(item => item.orderNumber);
    for (const id of newOrderIds) {
      // eslint-disable-next-line no-await-in-loop
      await setStatus(id, 'accepted');
    }
  }, [rawOrders, setStatus]);

  const rejectOrder = useCallback(
    (orderId: string, reason = 'Rejected by vendor') => setStatus(orderId, 'rejected', reason),
    [setStatus],
  );

  const cancelAcceptedOrder = useCallback(
    (orderId: string, reason: string) => setStatus(orderId, 'cancelled', reason),
    [setStatus],
  );

  const startQualityCheck = useCallback((orderId: string) => {
    // Local-only UI sub-step — the backend has no separate "quality check" state, so there's
    // nothing to persist here. This just flips a client-side overlay flag so the order shows
    // the Quality Check screen until `passQualityCheck`/`failQualityCheck` call the real API.
    setOverlays(prev => ({ ...prev, [orderId]: { ...prev[orderId], qualityCheckStarted: true } }));
  }, []);

  const passQualityCheck = useCallback((orderId: string) => setStatus(orderId, 'preparing'), [setStatus]);

  const failQualityCheck = useCallback(
    (orderId: string) => setStatus(orderId, 'cancelled', 'Failed quality check'),
    [setStatus],
  );

  const markPacked = useCallback((orderId: string) => setStatus(orderId, 'ready_for_pickup'), [setStatus]);

  const handoverToPartner = useCallback((orderId: string) => setStatus(orderId, 'out_for_delivery'), [setStatus]);

  const completeOrder = useCallback(
    async (orderId: string, outcome?: CompleteOutcome) => {
      await setStatus(orderId, 'delivered');
      if (outcome?.rating !== undefined || outcome?.review !== undefined) {
        setOverlays(prev => ({
          ...prev,
          [orderId]: { ...prev[orderId], rating: outcome?.rating, review: outcome?.review },
        }));
      }
    },
    [setStatus],
  );

  const replaceOrderItem = useCallback(
    (orderId: string, targetName: string, replacement: OrderProduct) => {
      const current = orders.find(item => item.id === orderId);
      if (!current) return;
      const nextProducts = current.products.map(item => (item.name === targetName ? replacement : item));
      setOverlays(prev => ({ ...prev, [orderId]: { ...prev[orderId], productsOverride: nextProducts } }));
    },
    [orders],
  );

  const removeOrderItem = useCallback(
    (orderId: string, targetName: string) => {
      const current = orders.find(item => item.id === orderId);
      if (!current) return;
      const nextProducts = current.products.filter(item => item.name !== targetName);
      setOverlays(prev => ({ ...prev, [orderId]: { ...prev[orderId], productsOverride: nextProducts } }));
    },
    [orders],
  );

  const getOrder = useCallback((orderId: string) => orders.find(order => order.id === orderId), [orders]);

  const ordersByStatus = useCallback(
    (statuses: OrderStatus[]) => orders.filter(order => statuses.includes(order.status)),
    [orders],
  );

  const value = useMemo(
    () => ({
      orders,
      loading,
      refreshOrders,
      getOrder,
      ordersByStatus,
      acceptOrder,
      acceptAllNew,
      rejectOrder,
      cancelAcceptedOrder,
      startQualityCheck,
      passQualityCheck,
      failQualityCheck,
      markPacked,
      handoverToPartner,
      replaceOrderItem,
      removeOrderItem,
      completeOrder,
    }),
    [
      orders,
      loading,
      refreshOrders,
      getOrder,
      ordersByStatus,
      acceptOrder,
      acceptAllNew,
      rejectOrder,
      cancelAcceptedOrder,
      startQualityCheck,
      passQualityCheck,
      failQualityCheck,
      markPacked,
      handoverToPartner,
      replaceOrderItem,
      removeOrderItem,
      completeOrder,
    ],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
