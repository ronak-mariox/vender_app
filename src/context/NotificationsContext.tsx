import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getApiErrorMessage, unwrapList } from '../services/api';
import { useVendorAuth } from './VendorAuthContext';

/** Categories the backend actually emits (see backend `notifyVendor(` callsites). */
export type NotificationCategory =
  | 'new-order'
  | 'order-cancellation'
  | 'low-stock'
  | 'out-of-stock'
  | 'payment'
  | 'product-approval'
  | 'kyc-status';

export type NotificationTab = 'all' | 'unread' | 'orders' | 'payments' | 'system';
export type NotificationGroup = 'Today' | 'Yesterday' | 'Earlier';

export type AppNotification = {
  id: string;
  /** Raw server value — may be a category this app has no bespoke screen for. */
  category: string;
  title: string;
  subtitle: string;
  createdAt: string;
  timeLabel: string;
  group: NotificationGroup;
  read: boolean;
  tabs: NotificationTab[];
  /** Mongo order id — use for navigation and API calls. */
  orderId?: string;
  /** Human-readable order number — display only. */
  orderNumber?: string;
  productId?: string;
  productName?: string;
};

const CATEGORY_TABS: Record<string, NotificationTab[]> = {
  'new-order': ['orders'],
  'order-cancellation': ['orders'],
  payment: ['payments'],
  settlement: ['payments'],
};

interface RawNotification {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  isRead: boolean;
  orderId?: string;
  orderNumber?: string;
  productId?: string;
  productName?: string;
  createdAt: string;
}

function timeLabelOf(iso: string): string {
  const then = new Date(iso).getTime();
  const minutes = Math.floor((Date.now() - then) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function groupOf(iso: string): NotificationGroup {
  const date = new Date(iso);
  const now = new Date();
  if (isSameCalendarDay(date, now)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameCalendarDay(date, yesterday)) return 'Yesterday';
  return 'Earlier';
}

function toAppNotification(raw: RawNotification): AppNotification {
  return {
    id: raw.id,
    category: raw.category,
    title: raw.title,
    subtitle: raw.subtitle,
    createdAt: raw.createdAt,
    timeLabel: timeLabelOf(raw.createdAt),
    group: groupOf(raw.createdAt),
    read: raw.isRead,
    tabs: CATEGORY_TABS[raw.category] ?? ['system'],
    orderId: raw.orderId,
    orderNumber: raw.orderNumber,
    productId: raw.productId,
    productName: raw.productName,
  };
}

type NotificationsContextValue = {
  notifications: AppNotification[];
  isLoading: boolean;
  error: string | null;
  getNotification: (id: string) => AppNotification | undefined;
  /** Server-side unread total (the list itself is capped at 100 rows). */
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  /** Resolves with the ids that were actually flipped to read, for undo. */
  markAllAsRead: () => Promise<string[]>;
  undoMarkAllAsRead: (ids: string[]) => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { vendor } = useVendorAuth();
  const vendorId = vendor?.id ?? null;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/vendor/notifications'),
        api.get<{ count: number }>('/vendor/notifications/unread-count'),
      ]);
      setNotifications(unwrapList<RawNotification>(listRes.data).map(toAppNotification));
      setUnreadCount(Number(countRes.data?.count) || 0);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load notifications.'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!vendorId) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      return;
    }
    refresh().catch(() => {});
  }, [vendorId, refresh]);

  const getNotification = useCallback(
    (id: string) => notifications.find((item) => item.id === id),
    [notifications],
  );

  const setReadFlag = useCallback((ids: string[], read: boolean) => {
    setNotifications((prev) => prev.map((item) => (ids.includes(item.id) ? { ...item, read } : item)));
  }, []);

  const markAsRead = useCallback(
    async (id: string) => {
      const target = notifications.find((item) => item.id === id);
      if (!target || target.read) return;
      setReadFlag([id], true);
      setUnreadCount((count) => Math.max(0, count - 1));
      try {
        await api.patch(`/vendor/notifications/${id}/read`);
      } catch {
        setReadFlag([id], false);
        setUnreadCount((count) => count + 1);
      }
    },
    [notifications, setReadFlag],
  );

  const markAllAsRead = useCallback(async () => {
    const ids = notifications.filter((item) => !item.read).map((item) => item.id);
    const previousCount = unreadCount;
    if (ids.length === 0 && previousCount === 0) return [];
    setReadFlag(ids, true);
    setUnreadCount(0);
    try {
      await api.patch('/vendor/notifications/read-all');
      return ids;
    } catch (err) {
      setReadFlag(ids, false);
      setUnreadCount(previousCount);
      throw err;
    }
  }, [notifications, unreadCount, setReadFlag]);

  const undoMarkAllAsRead = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      setReadFlag(ids, false);
      setUnreadCount((count) => count + ids.length);
      try {
        await api.patch('/vendor/notifications/mark-unread', { ids });
      } catch (err) {
        setReadFlag(ids, true);
        setUnreadCount((count) => Math.max(0, count - ids.length));
        throw err;
      }
    },
    [setReadFlag],
  );

  const dismissNotification = useCallback(
    async (id: string) => {
      const target = notifications.find((item) => item.id === id);
      if (!target) return;
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      if (!target.read) setUnreadCount((count) => Math.max(0, count - 1));
      try {
        await api.delete(`/vendor/notifications/${id}`);
      } catch (err) {
        refresh().catch(() => {});
        throw err;
      }
    },
    [notifications, refresh],
  );

  const clearAll = useCallback(async () => {
    const previous = notifications;
    const previousCount = unreadCount;
    setNotifications([]);
    setUnreadCount(0);
    try {
      await api.delete('/vendor/notifications');
    } catch (err) {
      setNotifications(previous);
      setUnreadCount(previousCount);
      throw err;
    }
  }, [notifications, unreadCount]);

  const value = useMemo(
    () => ({
      notifications,
      isLoading,
      error,
      getNotification,
      unreadCount,
      markAsRead,
      markAllAsRead,
      undoMarkAllAsRead,
      dismissNotification,
      clearAll,
      refresh,
    }),
    [
      notifications,
      isLoading,
      error,
      getNotification,
      unreadCount,
      markAsRead,
      markAllAsRead,
      undoMarkAllAsRead,
      dismissNotification,
      clearAll,
      refresh,
    ],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
