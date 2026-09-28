import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { DetailCard } from './DetailCard';
import { NotificationHero } from './NotificationHero';
import { getNotificationMeta } from './notificationMeta';
import { useNotificationOrder } from './useNotificationOrder';
import { useNotifications } from '../../context/NotificationsContext';
import { formatMoney, openOrder } from '../orders/orderHelpers';
import { getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'NewOrderNotification'>;

export function NewOrderNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification, dismissNotification } = useNotifications();

  const notification = getNotification(notificationId);
  const { order, loading, error } = useNotificationOrder(notification?.orderId);

  if (!notification) {
    return (
      <ScreenContainer backgroundColor={colors.white}>
        <NavHeader title="New Order" onBack={() => navigation.goBack()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Notification not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const meta = getNotificationMeta(notification.category);
  const address = order
    ? [order.contactName ?? order.customerName, order.addressLine1, order.addressLine2].filter(Boolean).join(', ')
    : '';

  function handleDismiss() {
    dismissNotification(notificationId)
      .then(() => navigation.goBack())
      .catch(err => Alert.alert('Could not dismiss', getApiErrorMessage(err, 'Please try again.')));
  }

  return (
    <ScreenContainer backgroundColor={colors.white} scrollable>
      <NavHeader title="New Order" onBack={() => navigation.goBack()} />
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
          <>
            <DetailCard title={`Order ${order.orderNumber}`}>
              {order.products.map((item, index) => (
                <View key={`${item.productId}-${item.variantId}-${index}`} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {item.name}
                    {item.variantLabel ? ` · ${item.variantLabel}` : ''}
                  </Text>
                  <Text style={styles.itemValue}>
                    {formatMoney(item.price)} × {item.qty}
                  </Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatMoney(order.amount)}</Text>
              </View>
            </DetailCard>

            {address ? (
              <DetailCard title="Delivery Address">
                <Text style={styles.addressText}>{address}</Text>
              </DetailCard>
            ) : null}
          </>
        ) : loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <Text style={styles.emptyText}>{error}</Text>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.footerButton}>
            <Button
              label="View Order"
              disabled={!order}
              onPress={() => {
                if (order) openOrder(navigation, order);
              }}
            />
          </View>
          <View style={styles.footerButton}>
            <Button label="Dismiss" variant="outline" onPress={handleDismiss} />
          </View>
        </View>
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
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textPrimary,
  },
  itemValue: {
    ...typography.label,
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  totalLabel: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  totalValue: {
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.primary,
  },
  addressText: {
    ...typography.label,
    color: colors.textSecondary,
    paddingTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
