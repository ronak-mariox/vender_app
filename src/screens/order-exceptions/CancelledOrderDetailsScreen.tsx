import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import type { Order } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { FlexButton } from '../order-flow/FlexButton';
import { formatMoney, statusEventTime, useOrder } from '../orders/orderHelpers';
import { OrderLoadState } from '../orders/OrderLoadState';

type Props = NativeStackScreenProps<AuthStackParamList, 'CancelledOrderDetails'>;

const CANCELLED_BY_LABEL: Record<NonNullable<Order['cancelledBy']>, string> = {
  customer: 'Customer',
  vendor: 'You (Store)',
  admin: 'Platform',
  driver: 'Delivery partner',
};

export function CancelledOrderDetailsScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { order, loading, error, retry } = useOrder(orderId);
  if (!order) {
    return (
      <OrderLoadState
        title="Order Cancelled"
        loading={loading}
        error={error}
        onBack={() => navigation.goBack()}
        onRetry={retry}
      />
    );
  }

  const isRejected = order.status === 'rejected';
  const byLabel = isRejected ? 'You (Store)' : order.cancelledBy ? CANCELLED_BY_LABEL[order.cancelledBy] : '—';
  const terminalEvent = [...order.statusHistory].reverse().find(event => event.status === order.status);
  const endedAt = statusEventTime(order, order.status);
  const reason = order.cancelReason ?? terminalEvent?.note ?? '—';
  const preparationStarted = order.statusHistory.some(event => event.status === 'preparing');
  const title = isRejected ? 'Order Rejected' : 'Order Cancelled';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Icon name="x-circle" size={20} color={colors.error} />
        </View>
        <View style={styles.bannerTextColumn}>
          <Text style={styles.bannerTitle}>
            {order.orderNumber} {isRejected ? 'rejected' : 'cancelled'}
          </Text>
          <Text style={styles.bannerSubtitle}>
            {[endedAt, isRejected ? null : preparationStarted ? 'After preparation started' : 'Before preparation started']
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{isRejected ? 'Rejection Details' : 'Cancellation Details'}</Text>
          <DetailRow label="Order" value={order.orderNumber} />
          <DetailRow label="Customer" value={order.customerName} />
          <DetailRow label={isRejected ? 'Rejected by' : 'Cancelled by'} value={byLabel} />
          <DetailRow label="Reason" value={reason} />
          <DetailRow label="Order total" value={formatMoney(order.amount)} />
          <DetailRow label="Payment" value={order.paymentMethod} />
          <DetailRow label={isRejected ? 'Rejected at' : 'Cancelled at'} value={endedAt || '—'} last />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Items</Text>
          {order.products.map((product, index) => (
            <View
              key={`${product.productId}-${product.variantId}-${index}`}
              style={[styles.itemRow, index < order.products.length - 1 && styles.itemRowDivider]}
            >
              <Icon name="x" size={13} color={colors.textTertiary} />
              <Text style={styles.itemText}>
                {product.name}
                {product.variantLabel ? ` · ${product.variantLabel}` : ''} ×{product.qty}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <FlexButton
          label="Back"
          onPress={() => navigation.goBack()}
          background={colors.primary}
          textColor={colors.white}
          flex={1}
        />
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowDivider]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.bodySemibold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.errorSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.errorBorder,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextColumn: {
    flex: 1,
    gap: 1,
  },
  bannerTitle: {
    ...typography.bodySemibold,
    color: colors.error,
  },
  bannerSubtitle: {
    ...typography.caption,
    color: '#B91C1C',
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  sectionLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
    paddingBottom: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  detailRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  itemRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemText: {
    ...typography.caption,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
