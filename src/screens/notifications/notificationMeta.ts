import { IconName } from '../../icons/Icon';
import { NotificationCategory } from '../../context/NotificationsContext';

/** Every notification detail route takes the same `{ notificationId }` param. */
export type NotificationDetailRoute =
  | 'NewOrderNotification'
  | 'OrderCancellationNotification'
  | 'LowStockNotification'
  | 'OutOfStockNotification'
  | 'PaymentNotification'
  | 'ProductApprovalNotification'
  | 'KYCStatusNotification'
  | 'NotificationDetail';

export type NotificationCategoryMeta = {
  icon: IconName;
  iconColor: string;
  iconBg: string;
  accentColor: string;
  label: string;
  route: NotificationDetailRoute;
};

export const NOTIFICATION_CATEGORY_META: Record<NotificationCategory, NotificationCategoryMeta> = {
  'new-order': {
    icon: 'package',
    iconColor: '#1570EF',
    iconBg: '#EFF8FF',
    accentColor: '#1570EF',
    label: 'New Order',
    route: 'NewOrderNotification',
  },
  'order-cancellation': {
    icon: 'x-circle',
    iconColor: '#D92D20',
    iconBg: '#FEF3F2',
    accentColor: '#D92D20',
    label: 'Order Cancelled',
    route: 'OrderCancellationNotification',
  },
  'low-stock': {
    icon: 'alert-triangle',
    iconColor: '#F79009',
    iconBg: '#FFFAEB',
    accentColor: '#F79009',
    label: 'Low Stock',
    route: 'LowStockNotification',
  },
  'out-of-stock': {
    icon: 'alert-triangle',
    iconColor: '#374151',
    iconBg: '#F3F4F6',
    accentColor: '#374151',
    label: 'Out of Stock',
    route: 'OutOfStockNotification',
  },
  payment: {
    icon: 'credit-card',
    iconColor: '#1570EF',
    iconBg: '#EFF8FF',
    accentColor: '#1570EF',
    label: 'Payment',
    route: 'PaymentNotification',
  },
  'product-approval': {
    icon: 'check-circle',
    iconColor: '#1CA672',
    iconBg: '#E8F5EF',
    accentColor: '#1CA672',
    label: 'Product Approval',
    route: 'ProductApprovalNotification',
  },
  'kyc-status': {
    icon: 'shield-check',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF',
    accentColor: '#0891B2',
    label: 'KYC Status',
    route: 'KYCStatusNotification',
  },
};

export const DEFAULT_NOTIFICATION_META: NotificationCategoryMeta = {
  icon: 'bell',
  iconColor: '#374151',
  iconBg: '#F3F4F6',
  accentColor: '#374151',
  label: 'Notification',
  route: 'NotificationDetail',
};

function isKnownCategory(category: string): category is NotificationCategory {
  return Object.prototype.hasOwnProperty.call(NOTIFICATION_CATEGORY_META, category);
}

/** Safe for any server category — unknown ones fall back to the generic detail screen. */
export function getNotificationMeta(category: string): NotificationCategoryMeta {
  return isKnownCategory(category) ? NOTIFICATION_CATEGORY_META[category] : DEFAULT_NOTIFICATION_META;
}
