import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

export type NotificationCategory =
  | 'new-order'
  | 'order-cancellation'
  | 'low-stock'
  | 'out-of-stock'
  | 'payment'
  | 'settlement'
  | 'product-approval'
  | 'kyc-status'
  | 'store-status'
  | 'system-alert'
  | 'announcement';

export type NotificationTab = 'all' | 'unread' | 'orders' | 'payments' | 'system';
export type NotificationGroup = 'Today' | 'Yesterday' | 'Earlier';

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  subtitle: string;
  timeLabel: string;
  group: NotificationGroup;
  read: boolean;
  tabs: NotificationTab[];
  orderId?: string;
  settlementId?: string;
  productName?: string;
};

const CATEGORY_TABS: Record<NotificationCategory, NotificationTab[]> = {
  'new-order': ['orders'],
  'order-cancellation': ['orders'],
  'low-stock': ['system'],
  'out-of-stock': ['system'],
  payment: ['payments'],
  settlement: ['payments'],
  'product-approval': ['system'],
  'kyc-status': ['system'],
  'store-status': ['system'],
  'system-alert': ['system'],
  announcement: ['system'],
};

interface RawNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  subtitle: string;
  isRead: boolean;
  orderId?: string;
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
    timeLabel: timeLabelOf(raw.createdAt),
    group: groupOf(raw.createdAt),
    read: raw.isRead,
    tabs: CATEGORY_TABS[raw.category] ?? ['system'],
    orderId: raw.orderId,
    productName: raw.productName,
  };
}

type NotificationsContextValue = {
  notifications: AppNotification[];
  isLoading: boolean;
  getNotification: (id: string) => AppNotification | undefined;
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  undoMarkAllAsRead: (previous: AppNotification[]) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
  refresh: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<RawNotification[]>('/vendor/notifications');
      setNotifications(data.map(toAppNotification));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const getNotification = useCallback(
    (id: string) => notifications.find((item) => item.id === id),
    [notifications],
  );

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    api.patch(`/vendor/notifications/${id}/read`).catch(() => {});
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    api.patch('/vendor/notifications/read-all').catch(() => {});
  }, []);

  const undoMarkAllAsRead = useCallback((previous: AppNotification[]) => {
    setNotifications(previous);
    const idsToRestore = previous.filter((item) => !item.read).map((item) => item.id);
    if (idsToRestore.length > 0) {
      api.patch('/vendor/notifications/mark-unread', { ids: idsToRestore }).catch(() => {});
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    api.delete(`/vendor/notifications/${id}`).catch(() => {});
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    api.delete('/vendor/notifications').catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      isLoading,
      getNotification,
      unreadCount,
      markAsRead,
      markAllAsRead,
      undoMarkAllAsRead,
      dismissNotification,
      clearAll,
      refresh,
    }),
    [notifications, isLoading, getNotification, unreadCount, markAsRead, markAllAsRead, undoMarkAllAsRead, dismissNotification, clearAll, refresh],
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
