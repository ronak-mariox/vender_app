import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { InfoBanner } from '../../components';
import { useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { FlexButton } from '../order-flow/FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'CancelledOrderDetails'>;

export function CancelledOrderDetailsScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  const cancelledByCustomer = order.cancelledBy !== 'vendor';
  const cancelledAt = order.statusHistory[order.statusHistory.length - 1]?.time ?? '';
  const pickingStarted = order.statusHistory.some(event => event.status === 'preparing');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Order Cancelled</Text>
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Icon name="x-circle" size={20} color={colors.error} />
        </View>
        <View style={styles.bannerTextColumn}>
          <Text style={styles.bannerTitle}>
            {cancelledByCustomer ? 'Customer' : 'You'} cancelled {order.id}
          </Text>
          <Text style={styles.bannerSubtitle}>
            {cancelledAt} · {pickingStarted ? 'After preparation started' : 'Before preparation started'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Cancellation Details</Text>
          <DetailRow label="Order ID" value={`ORD-2026-${order.id.replace('ORD-', '')}`} />
          <DetailRow label="Customer" value={order.customerName} />
          <DetailRow label="Cancelled by" value={cancelledByCustomer ? 'Customer' : 'You (Vendor)'} />
          <DetailRow label="Reason" value={order.cancelReason ?? '—'} />
          <DetailRow label="Refund" value={`₹${order.amount} → UPI within 3 days`} />
          <DetailRow label="Cancelled at" value={cancelledAt} last />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Cancelled Items</Text>
          {order.products.map((product, index) => (
            <View
              key={`${product.name}-${index}`}
              style={[styles.itemRow, index < order.products.length - 1 && styles.itemRowDivider]}
            >
              <Icon name="x" size={13} color={colors.textTertiary} />
              <Text style={styles.itemText}>
                {product.name} ×{product.qty}
              </Text>
            </View>
          ))}
        </View>

        {!pickingStarted ? (
          <InfoBanner
            variant="warning"
            message="No items were picked yet — no inventory action needed. Your stock remains unchanged."
          />
        ) : null}

        {cancelledByCustomer ? (
          <InfoBanner
            variant="success"
            message="Customer-initiated cancellation does not affect your acceptance rate or store rating."
          />
        ) : (
          <InfoBanner
            variant="neutral"
            message="This cancellation counts toward your store's cancellation rate."
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <FlexButton
          label="View Details"
          onPress={() => navigation.navigate('OrderDetails', { orderId })}
          background={colors.surface}
          textColor={colors.textSecondary}
          borderColor={colors.border}
          flex={1}
        />
        <FlexButton
          label="Back to Orders"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'OrdersList' }] })}
          background={colors.primary}
          textColor={colors.white}
          flex={1.9}
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
