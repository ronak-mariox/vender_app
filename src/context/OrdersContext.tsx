import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { colors } from '../theme';
import { IconName } from '../icons/Icon';
import { api, getApiErrorMessage, unwrapList } from '../services/api';
import { formatTimeAgo } from '../utils/time';
import { useVendorAuth } from './VendorAuthContext';
import { currentRoute, navigationRef } from '../navigation/navigationRef';

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export type OrderProduct = {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  imageUrl?: string;
  price: number;
  mrp: number;
  qty: number;
  subtotal: number;
};

export type OrderDriver = {
  id: string;
  name?: string;
  phone?: string;
  vehicle?: string;
  plate?: string;
};

export type OrderStatusEvent = {
  status: OrderStatus;
  at: string;
  note?: string;
};

export type Order = {
  /** Mongo id — use for every API call and navigation param. */
  id: string;
  /** Human-readable order number — display only. */
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  itemsCount: number;
  location: string;
  addressLine1: string;
  addressLine2: string;
  contactName?: string;
  contactPhone?: string;
  placedAt: string;
  timeLabel: string;
  amount: number;
  itemsTotal: number;
  taxTotal: number;
  deliveryCharge: number;
  platformFee: number;
  discount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: OrderStatus;
  products: OrderProduct[];
  specialInstructions?: string;
  driverId?: string;
  driver?: OrderDriver;
  cancelReason?: string;
  cancelledBy?: 'customer' | 'vendor' | 'admin' | 'driver';
  rating?: number;
  review?: string;
  statusHistory: OrderStatusEvent[];
  deliveredAt?: string;
  updatedAt: string;
};

export type OrderStatusMeta = {
  label: string;
  color: string;
  background: string;
  icon: IconName;
};

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  placed: { label: 'New Order', color: '#1570EF', background: '#EFF8FF', icon: 'shopping-cart' },
  accepted: { label: 'Accepted', color: colors.warningDark, background: colors.warningSurface, icon: 'check-circle' },
  preparing: { label: 'Preparing', color: '#EA580C', background: '#FFF7ED', icon: 'package' },
  ready_for_pickup: { label: 'Ready for Pickup', color: '#0891B2', background: '#ECFEFF', icon: 'truck' },
  out_for_delivery: { label: 'Out for Delivery', color: '#4338CA', background: '#EEF2FF', icon: 'truck' },
  delivered: { label: 'Delivered', color: colors.primary, background: colors.primarySurface, icon: 'check-circle' },
  cancelled: { label: 'Cancelled', color: colors.error, background: colors.errorSurface, icon: 'x-circle' },
  rejected: { label: 'Rejected', color: '#374151', background: '#F3F4F6', icon: 'x-circle' },
};

/** Statuses the vendor still has work to do on (or is waiting on a driver for). */
export const ACTIVE_ORDER_STATUSES: OrderStatus[] = ['placed', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery'];

/** Vendor-side transitions — mirrors backend `lib/orderStatus.ts`. */
export const VENDOR_CANCELLABLE_STATUSES: OrderStatus[] = ['accepted', 'preparing', 'ready_for_pickup'];

// ---------------------------------------------------------------------------
// Backend (API) shapes
// ---------------------------------------------------------------------------

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

type ApiDriverSummary = {
  id?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  vehicleType?: string;
  vehicleNumber?: string;
};

type ApiRating = number | { stars?: number; rating?: number; reviewText?: string; review?: string } | null;

type ApiOrder = {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  driverId?: string | null;
  driver?: ApiDriverSummary | null;
  items: ApiOrderItem[];
  address: ApiOrderAddress;
  pricing: ApiOrderPricing;
  couponCode?: string;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: string; note?: string }[];
  specialInstructions?: string;
  cancelReason?: string;
  cancelledBy?: 'customer' | 'vendor' | 'admin' | 'driver';
  placedAt: string;
  deliveredAt?: string;
  vendorRating?: number;
  rating?: ApiRating;
  createdAt: string;
  updatedAt: string;
};

function mapDriver(apiOrder: ApiOrder): OrderDriver | undefined {
  const driverId = apiOrder.driverId ?? apiOrder.driver?.id;
  if (!driverId) return undefined;
  const summary = apiOrder.driver ?? undefined;
  return {
    id: String(driverId),
    name: summary?.name ?? summary?.fullName,
    phone: summary?.phone,
    vehicle: summary?.vehicleType,
    plate: summary?.vehicleNumber,
  };
}

function mapRating(value: ApiRating | undefined): { rating?: number; review?: string } {
  if (value == null) return {};
  if (typeof value === 'number') return { rating: value };
  const stars = value.stars ?? value.rating;
  return { rating: typeof stars === 'number' ? stars : undefined, review: value.reviewText ?? value.review };
}

function mapOrder(apiOrder: ApiOrder): Order {
  const products: OrderProduct[] = (apiOrder.items ?? []).map(item => ({
    productId: item.productId,
    variantId: item.variantId,
    name: item.name,
    variantLabel: item.variantLabel,
    imageUrl: item.imageUrl,
    price: item.price,
    mrp: item.mrp,
    qty: item.quantity,
    subtotal: item.subtotal,
  }));
  const itemsCount = products.reduce((sum, item) => sum + item.qty, 0);
  const address = apiOrder.address ?? ({} as ApiOrderAddress);
  const addressParts = [address.line2, address.landmark, address.city, address.state, address.pincode]
    .map(part => part?.trim())
    .filter((part): part is string => !!part);
  const pricing = apiOrder.pricing ?? ({} as ApiOrderPricing);
  const placedAt = apiOrder.placedAt ?? apiOrder.createdAt;

  return {
    id: apiOrder.id,
    orderNumber: apiOrder.orderNumber,
    customerName: apiOrder.customerName ?? 'Customer',
    customerPhone: apiOrder.customerPhone ?? '',
    itemsCount,
    location: address.city ?? '',
    addressLine1: address.line1 ?? '',
    addressLine2: addressParts.join(', '),
    contactName: address.contactName,
    contactPhone: address.contactPhone,
    placedAt,
    timeLabel: formatTimeAgo(new Date(placedAt).getTime()),
    amount: pricing.grandTotal ?? 0,
    itemsTotal: pricing.itemsTotal ?? 0,
    taxTotal: pricing.taxTotal ?? 0,
    deliveryCharge: pricing.deliveryFee ?? 0,
    platformFee: pricing.platformFee ?? 0,
    discount: pricing.discount ?? 0,
    paymentMethod: apiOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online',
    paymentStatus: apiOrder.paymentStatus,
    status: apiOrder.status,
    products,
    specialInstructions: apiOrder.specialInstructions,
    driverId: apiOrder.driverId ? String(apiOrder.driverId) : undefined,
    driver: mapDriver(apiOrder),
    cancelReason: apiOrder.cancelReason,
    cancelledBy: apiOrder.cancelledBy,
    ...mapRating(apiOrder.rating ?? apiOrder.vendorRating),
    statusHistory: (apiOrder.statusHistory ?? []).map(event => ({ status: event.status, at: event.at, note: event.note })),
    deliveredAt: apiOrder.deliveredAt,
    updatedAt: apiOrder.updatedAt ?? apiOrder.createdAt,
  };
}

const POLL_INTERVAL_MS = 10000;

type OrdersContextValue = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  /** Fetches a single order by Mongo id from the backend and merges it into the list. */
  fetchOrder: (orderId: string) => Promise<Order | undefined>;
  getOrder: (orderId: string) => Order | undefined;
  ordersByStatus: (statuses: OrderStatus[]) => Order[];
  /** True while a status PATCH is in flight for this order — disable action buttons. */
  isOrderPending: (orderId: string) => boolean;
  acceptOrder: (orderId: string) => Promise<void>;
  acceptAllNew: () => Promise<void>;
  rejectOrder: (orderId: string, note: string) => Promise<void>;
  startPreparing: (orderId: string) => Promise<void>;
  markReady: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string, note: string) => Promise<void>;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { vendor } = useVendorAuth();
  const vendorId = vendor?.id ?? null;
  const vendorActive = vendor?.status === 'active';
  const [rawOrders, setRawOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Record<string, true>>({});
  // null until the first successful load — existing "placed" orders at cold start
  // must not trigger the new-order screen.
  const seenPlacedIds = useRef<Set<string> | null>(null);

  const announceNewOrders = useCallback(
    (orders: ApiOrder[]) => {
      const placed = orders.filter(order => order.status === 'placed');
      if (!seenPlacedIds.current) {
        seenPlacedIds.current = new Set(placed.map(order => order.id));
        return;
      }
      const fresh = placed.filter(order => !seenPlacedIds.current!.has(order.id));
      placed.forEach(order => seenPlacedIds.current!.add(order.id));
      if (fresh.length === 0 || !vendorActive || !navigationRef.isReady()) return;
      const newest = fresh[0];
      const route = currentRoute();
      const alreadyShowing =
        route?.name === 'NewOrderReceived' && (route.params as { orderId?: string } | undefined)?.orderId === newest.id;
      if (!alreadyShowing) navigationRef.navigate('NewOrderReceived', { orderId: newest.id });
    },
    [vendorActive],
  );

  const loadOrders = useCallback(async () => {
    const { data } = await api.get('/vendor/orders');
    const list = unwrapList<ApiOrder>(data);
    setRawOrders(list);
    setError(null);
    announceNewOrders(list);
  }, [announceNewOrders]);

  useEffect(() => {
    if (!vendorId) {
      setRawOrders([]);
      setPendingIds({});
      setError(null);
      setLoading(false);
      seenPlacedIds.current = null;
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadOrders()
      .catch(err => {
        if (!cancelled) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vendorId, loadOrders]);

  // Poll while a vendor is logged in and the app is in the foreground.
  useEffect(() => {
    if (!vendorId) return undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      loadOrders().catch(() => undefined);
    };
    const start = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(tick, POLL_INTERVAL_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    if (AppState.currentState === 'active') start();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        tick();
        start();
      } else {
        stop();
      }
    });
    return () => {
      stop();
      subscription.remove();
    };
  }, [vendorId, loadOrders]);

  const refreshOrders = useCallback(async () => {
    try {
      await loadOrders();
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    }
  }, [loadOrders]);

  const mergeRaw = useCallback((incoming: ApiOrder) => {
    setRawOrders(prev => {
      const exists = prev.some(item => item.id === incoming.id);
      return exists ? prev.map(item => (item.id === incoming.id ? incoming : item)) : [incoming, ...prev];
    });
  }, []);

  const fetchOrder = useCallback(
    async (orderId: string) => {
      const { data } = await api.get<ApiOrder>(`/vendor/orders/${orderId}`);
      mergeRaw(data);
      return mapOrder(data);
    },
    [mergeRaw],
  );

  const orders = useMemo(() => rawOrders.map(mapOrder), [rawOrders]);

  const setStatus = useCallback(
    async (orderId: string, status: OrderStatus, note?: string) => {
      setPendingIds(prev => ({ ...prev, [orderId]: true }));
      try {
        const { data } = await api.patch<ApiOrder>(`/vendor/orders/${orderId}/status`, note ? { status, note } : { status });
        mergeRaw(data);
      } finally {
        setPendingIds(prev => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
      }
    },
    [mergeRaw],
  );

  const acceptOrder = useCallback((orderId: string) => setStatus(orderId, 'accepted'), [setStatus]);

  const acceptAllNew = useCallback(async () => {
    const newOrderIds = rawOrders.filter(item => item.status === 'placed').map(item => item.id);
    for (const id of newOrderIds) {
      // eslint-disable-next-line no-await-in-loop
      await setStatus(id, 'accepted');
    }
  }, [rawOrders, setStatus]);

  const rejectOrder = useCallback((orderId: string, note: string) => setStatus(orderId, 'rejected', note), [setStatus]);
  const startPreparing = useCallback((orderId: string) => setStatus(orderId, 'preparing'), [setStatus]);
  const markReady = useCallback((orderId: string) => setStatus(orderId, 'ready_for_pickup'), [setStatus]);
  const cancelOrder = useCallback((orderId: string, note: string) => setStatus(orderId, 'cancelled', note), [setStatus]);

  const getOrder = useCallback((orderId: string) => orders.find(order => order.id === orderId), [orders]);

  const ordersByStatus = useCallback(
    (statuses: OrderStatus[]) => orders.filter(order => statuses.includes(order.status)),
    [orders],
  );

  const isOrderPending = useCallback((orderId: string) => Boolean(pendingIds[orderId]), [pendingIds]);

  const value = useMemo(
    () => ({
      orders,
      loading,
      error,
      refreshOrders,
      fetchOrder,
      getOrder,
      ordersByStatus,
      isOrderPending,
      acceptOrder,
      acceptAllNew,
      rejectOrder,
      startPreparing,
      markReady,
      cancelOrder,
    }),
    [
      orders,
      loading,
      error,
      refreshOrders,
      fetchOrder,
      getOrder,
      ordersByStatus,
      isOrderPending,
      acceptOrder,
      acceptAllNew,
      rejectOrder,
      startPreparing,
      markReady,
      cancelOrder,
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
