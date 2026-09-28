import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { NotificationHero } from './NotificationHero';
import { DetailCard, DetailRow } from './DetailCard';
import { useNotifications } from '../../context/NotificationsContext';
import { getNotificationMeta } from './notificationMeta';
import { useNotificationOrder } from './useNotificationOrder';
import { formatMoney, openOrder } from '../orders/orderHelpers';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PaymentNotification'>;

export function PaymentNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification } = useNotifications();
  const notification = getNotification(notificationId);
  const { order, loading, error } = useNotificationOrder(notification?.orderId);

  if (!notification) {
    return (
      <ScreenContainer backgroundColor={colors.white}>
        <NavHeader title="Payment Update" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Notification not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const meta = getNotificationMeta(notification.category);

  return (
    <ScreenContainer backgroundColor={colors.white} scrollable>
      <NavHeader title="Payment Update" onBack={() => navigation.goBack()} />
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
          <DetailCard title="Payment Details">
            <DetailRow label="Order" value={order.orderNumber} />
            <DetailRow label="Items Total" value={formatMoney(order.itemsTotal)} />
            <DetailRow label="Order Total" value={formatMoney(order.amount)} bold divider />
            <DetailRow label="Payment Method" value={order.paymentMethod} />
            <DetailRow label="Payment Status" value={order.paymentStatus} />
          </DetailCard>
        ) : loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <Text style={styles.notFoundText}>{error}</Text>
        ) : null}

        <View style={styles.footer}>
          <Button
            label={order ? 'View Order Details' : 'View Payments'}
            onPress={() => (order ? openOrder(navigation, order) : navigation.navigate('PaymentsOverview'))}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  footer: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
