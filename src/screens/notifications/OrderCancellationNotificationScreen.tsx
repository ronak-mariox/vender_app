import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { DetailCard, DetailRow } from './DetailCard';
import { NotificationHero } from './NotificationHero';
import { getNotificationMeta } from './notificationMeta';
import { useNotificationOrder } from './useNotificationOrder';
import { useNotifications } from '../../context/NotificationsContext';
import type { Order } from '../../context/OrdersContext';
import { formatMoney, openOrder } from '../orders/orderHelpers';
import { getApiErrorMessage } from '../../services/api';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrderCancellationNotification'>;

const CANCELLED_BY_LABEL: Record<NonNullable<Order['cancelledBy']>, string> = {
  customer: 'Customer',
  vendor: 'Vendor (You)',
  admin: 'Platform support',
  driver: 'Delivery partner',
};

export function OrderCancellationNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification, dismissNotification } = useNotifications();

  const notification = getNotification(notificationId);
  const { order, loading, error } = useNotificationOrder(notification?.orderId);

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

  const meta = getNotificationMeta(notification.category);

  function handleDismiss() {
    dismissNotification(notificationId)
      .then(() => navigation.goBack())
      .catch(err => Alert.alert('Could not dismiss', getApiErrorMessage(err, 'Please try again.')));
  }

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
        {order ? (
          <DetailCard>
            <DetailRow label="Order" value={order.orderNumber} />
            {order.cancelReason ? <DetailRow label="Cancellation Reason" value={order.cancelReason} /> : null}
            <DetailRow label="Order Value" value={formatMoney(order.amount)} />
            {order.cancelledBy ? (
              <DetailRow label="Cancelled by" value={CANCELLED_BY_LABEL[order.cancelledBy]} />
            ) : null}
          </DetailCard>
        ) : loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <Text style={styles.emptyText}>{error}</Text>
        ) : null}

        <Button
          label="View Order Details"
          variant="outline"
          disabled={!order}
          onPress={() => {
            if (order) openOrder(navigation, order);
          }}
        />
        <Button label="Dismiss" variant="text" onPress={handleDismiss} />
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
