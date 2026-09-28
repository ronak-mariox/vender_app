import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { InfoBanner } from '../../components';
import { Icon } from '../../icons/Icon';
import { ORDER_STATUS_META, VENDOR_CANCELLABLE_STATUSES } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlexButton } from './FlexButton';
import { formatMoney, openOrder, useOrder, useOrderAction } from '../orders/orderHelpers';
import { OrderLoadState } from '../orders/OrderLoadState';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductPicking'>;

export function ProductPickingScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { order, loading, error, retry } = useOrder(orderId);
  const { perform, busy } = useOrderAction(navigation);
  // Local-only packing aid; the backend has no per-item picking state.
  const [picked, setPicked] = useState<Record<string, boolean>>({});

  if (!order) {
    return (
      <OrderLoadState
        title="Prepare Order"
        loading={loading}
        error={error}
        onBack={() => navigation.goBack()}
        onRetry={retry}
      />
    );
  }

  const keyOf = (index: number) => `${order.products[index].productId}-${order.products[index].variantId}-${index}`;
  const total = order.products.length;
  const checkedCount = order.products.filter((_, index) => picked[keyOf(index)]).length;
  const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
  const isAccepted = order.status === 'accepted';
  const isPreparing = order.status === 'preparing';
  const canCancel = VENDOR_CANCELLABLE_STATUSES.includes(order.status);
  const allPicked = total > 0 && checkedCount === total;

  function toggle(index: number) {
    if (!isPreparing) return;
    const key = keyOf(index);
    setPicked(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconButton}>
            <Icon name="arrow-left" size={18} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.textColumn}>
            <Text style={styles.title}>{isAccepted ? 'Order Accepted' : 'Prepare Order'}</Text>
            <Text style={styles.subtitle}>
              {order.orderNumber} · {checkedCount} of {total} items picked
            </Text>
          </View>
          {canCancel ? (
            <Pressable
              hitSlop={8}
              style={styles.iconButton}
              onPress={() => navigation.navigate('VendorCancelOrder', { orderId })}
              accessibilityLabel="Cancel order"
            >
              <Icon name="x-circle" size={16} color={colors.error} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Picking progress</Text>
          <Text style={styles.progressFraction}>
            {checkedCount} / {total}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isAccepted ? (
          <InfoBanner variant="info" message="Tap “Start Preparing” when you begin packing this order." bordered />
        ) : null}
        {!isAccepted && !isPreparing ? (
          <InfoBanner
            variant="warning"
            message={`This order is now "${ORDER_STATUS_META[order.status].label}".`}
            bordered
          />
        ) : null}
        {order.specialInstructions ? (
          <InfoBanner variant="warning" message={`Note: ${order.specialInstructions}`} bordered />
        ) : null}

        <View style={styles.listCard}>
          {order.products.map((product, index) => {
            const isPicked = !!picked[keyOf(index)];
            return (
              <Pressable
                key={keyOf(index)}
                onPress={() => toggle(index)}
                disabled={!isPreparing}
                style={[styles.row, isPicked && styles.rowPicked]}
              >
                <View style={[styles.checkbox, isPicked && styles.checkboxPicked]}>
                  {isPicked ? <Icon name="check" size={14} color={colors.primary} strokeWidth={3} /> : null}
                </View>
                <View style={styles.textColumn}>
                  <Text style={styles.name} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.meta}>
                    Qty: {product.qty}
                    {product.variantLabel ? ` · ${product.variantLabel}` : ''}
                  </Text>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={styles.price}>{formatMoney(product.subtotal)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isAccepted ? (
          <FlexButton
            label={busy ? 'Updating…' : 'Start Preparing →'}
            onPress={() => perform('preparing', orderId)}
            background={colors.primary}
            textColor={colors.white}
            flex={1}
            disabled={busy}
          />
        ) : isPreparing ? (
          <FlexButton
            label={busy ? 'Updating…' : allPicked ? 'Mark Ready for Pickup →' : 'Pick all items to continue'}
            onPress={() => perform('ready', orderId)}
            background={allPicked ? colors.primary : colors.textTertiary}
            textColor={colors.white}
            flex={1}
            disabled={busy || !allPicked}
          />
        ) : (
          <FlexButton
            label="View Order"
            onPress={() => {
              navigation.goBack();
              openOrder(navigation, order);
            }}
            background={colors.primary}
            textColor={colors.white}
            flex={1}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  progressFraction: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  track: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  listCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  rowPicked: {
    backgroundColor: '#F0FDF4',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxPicked: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  textColumn: {
    flex: 1,
    gap: 1,
  },
  name: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  priceColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  price: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
