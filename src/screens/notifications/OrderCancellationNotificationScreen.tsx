import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, InfoBanner, NavHeader, ScreenContainer } from '../../components';
import { DetailCard, DetailRow } from './DetailCard';
import { NotificationHero } from './NotificationHero';
import { NOTIFICATION_CATEGORY_META } from './notificationMeta';
import { useNotifications } from '../../context/NotificationsContext';
import { useOrders } from '../../context/OrdersContext';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrderCancellationNotification'>;

const FALLBACK_REASON = 'Changed mind.';
const FALLBACK_VALUE = '₹312';
const FALLBACK_CANCELLED_BY = 'Customer';

function formatCancelledBy(value: 'customer' | 'vendor') {
  return value === 'customer' ? 'Customer' : 'Vendor (You)';
}

export function OrderCancellationNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification, dismissNotification } = useNotifications();
  const { getOrder } = useOrders();

  const notification = getNotification(notificationId);
  const order = notification?.orderId ? getOrder(notification.orderId) : undefined;

  if (!notification) {
    return (
      <ScreenContainer backgroundColor={colors.white}>
        <NavHeader title="Order Cancelled" onBack={() => navigation.goBack()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Notification not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const meta = NOTIFICATION_CATEGORY_META[notification.category];
  const reason = order?.cancelReason ?? FALLBACK_REASON;
  const value = order ? `₹${order.amount}` : FALLBACK_VALUE;
  const cancelledBy = order?.cancelledBy ? formatCancelledBy(order.cancelledBy) : FALLBACK_CANCELLED_BY;

  return (
    <ScreenContainer backgroundColor={colors.white} scrollable>
      <NavHeader title="Order Cancelled" onBack={() => navigation.goBack()} />
      <NotificationHero
        icon={meta.icon}
        iconColor={meta.iconColor}
        iconBg={meta.iconBg}
        title={notification.title}
        subtitle={notification.subtitle}
        timeLabel={notification.timeLabel}
      />
      <View style={styles.content}>
        <DetailCard>
          <DetailRow label="Cancellation Reason" value={reason} />
          <DetailRow label="Order Value" value={value} />
          <DetailRow label="Cancelled by" value={cancelledBy} />
        </DetailCard>

        <InfoBanner
          variant="success"
          title="No Impact on Your Account"
          message="Your acceptance rate is not affected by customer-initiated cancellations."
        />

        <InfoBanner variant="neutral" message="Stock has been automatically restored to inventory." />

        <Button
          label="View Order Details"
          variant="outline"
          onPress={() => {
            if (notification.orderId) {
              navigation.navigate('CancelledOrderDetails', { orderId: notification.orderId });
            } else {
              Alert.alert('Order unavailable', 'This notification is not linked to an order.');
            }
          }}
        />
        <Button
          label="Dismiss"
          variant="text"
          onPress={() => {
            dismissNotification(notificationId);
            navigation.goBack();
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
});
