import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, InfoBanner, NavHeader, ScreenContainer } from '../../components';
import { DetailCard } from './DetailCard';
import { NotificationHero } from './NotificationHero';
import { NOTIFICATION_CATEGORY_META } from './notificationMeta';
import { useNotifications } from '../../context/NotificationsContext';
import { useOrders, type OrderProduct } from '../../context/OrdersContext';
import { colors, fontFamilies, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'NewOrderNotification'>;

const FALLBACK_ITEMS: OrderProduct[] = [
  { name: 'Tata Salt 1kg', price: 24, qty: 2 },
  { name: 'Amul Milk 500ml', price: 28, qty: 3 },
  { name: 'Fortune Sunflower Oil 1L', price: 140, qty: 1 },
];
const FALLBACK_TOTAL = 428;
const FALLBACK_ADDRESS = 'Rajesh Kumar, 14B Lal Bahadur Nagar, Hyderabad, Telangana – 500032';

export function NewOrderNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification, dismissNotification } = useNotifications();
  const { getOrder } = useOrders();

  const notification = getNotification(notificationId);
  const order = notification?.orderId ? getOrder(notification.orderId) : undefined;

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

  const meta = NOTIFICATION_CATEGORY_META[notification.category];
  const items = order && order.products.length > 0 ? order.products : FALLBACK_ITEMS;
  const total = order ? order.amount : FALLBACK_TOTAL;
  const address = order
    ? `${order.customerName}, ${order.addressLine1}, ${order.addressLine2}`
    : FALLBACK_ADDRESS;

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
        <DetailCard title="Order Items">
          {items.map((item, index) => (
            <View key={`${item.name}-${index}`} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemValue}>
                ₹{item.price} × {item.qty}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </DetailCard>

        <DetailCard title="Delivery Address">
          <Text style={styles.addressText}>{address}</Text>
        </DetailCard>

        <InfoBanner variant="warning" message="⏱ Orders auto-expire in 15 min if not accepted." />

        <View style={styles.footerRow}>
          <View style={styles.footerButton}>
            <Button
              label="View Order"
              onPress={() => {
                if (notification.orderId) {
                  navigation.navigate('NewOrderReceived', { orderId: notification.orderId });
                } else {
                  Alert.alert('Order unavailable', 'This notification is not linked to an order.');
                }
              }}
            />
          </View>
          <View style={styles.footerButton}>
            <Button
              label="Dismiss"
              variant="outline"
              onPress={() => {
                dismissNotification(notificationId);
                navigation.goBack();
              }}
            />
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
