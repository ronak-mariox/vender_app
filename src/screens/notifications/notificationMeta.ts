import { IconName } from '../../icons/Icon';
import { NotificationCategory } from '../../context/NotificationsContext';
import { AuthStackParamList } from '../../navigation/types';

export type NotificationCategoryMeta = {
  icon: IconName;
  iconColor: string;
  iconBg: string;
  accentColor: string;
  label: string;
  route: keyof AuthStackParamList;
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
  settlement: {
    icon: 'landmark',
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
    accentColor: '#7C3AED',
    label: 'Settlement',
    route: 'SettlementNotification',
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
  'store-status': {
    icon: 'home',
    iconColor: '#1CA672',
    iconBg: '#E8F5EF',
    accentColor: '#1CA672',
    label: 'Store Status',
    route: 'StoreStatusNotification',
  },
  'system-alert': {
    icon: 'alert-circle',
    iconColor: '#D92D20',
    iconBg: '#FEF3F2',
    accentColor: '#D92D20',
    label: 'System Alert',
    route: 'SystemAlertNotification',
  },
  announcement: {
    icon: 'flag',
    iconColor: '#D97706',
    iconBg: '#FFFBEB',
    accentColor: '#D97706',
    label: 'Announcement',
    route: 'AnnouncementNotification',
  },
};
