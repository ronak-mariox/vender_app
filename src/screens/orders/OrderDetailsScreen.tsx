import React, { useState } from 'react';
import { Linking, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { FormSectionCard, StatusChip, StatusTimeline, TimelineStep, TimelineStepStatus } from '../../components';
import { Icon } from '../../icons/Icon';
import {
  Order,
  ORDER_STATUS_META,
  OrderStatus,
  useOrders,
  VENDOR_CANCELLABLE_STATUSES,
} from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlexButton } from './FlexButton';
import { driverLabel, formatMoney, placedTime, statusEventTime, useOrder, useOrderAction } from './orderHelpers';
import { OrderLoadState } from './OrderLoadState';
import { ProductThumb } from '../../components/ProductThumb';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrderDetails'>;

const STEP_SEQUENCE: { label: string; status: OrderStatus }[] = [
  { label: 'Order Placed', status: 'placed' },
  { label: 'Accepted', status: 'accepted' },
  { label: 'Preparing', status: 'preparing' },
  { label: 'Ready for Pickup', status: 'ready_for_pickup' },
  { label: 'Out for Delivery', status: 'out_for_delivery' },
  { label: 'Delivered', status: 'delivered' },
];

function buildTimeline(order: Order): TimelineStep[] {
  if (order.status === 'cancelled' || order.status === 'rejected') {
    return [
      { label: 'Order Placed', sublabel: placedTime(order), status: 'done' },
      {
        label: order.status === 'cancelled' ? 'Order Cancelled' : 'Order Rejected',
        sublabel: statusEventTime(order, order.status),
        status: 'active',
      },
    ];
  }

  const currentIndex = STEP_SEQUENCE.findIndex(step => step.status === order.status);
  return STEP_SEQUENCE.map((step, index) => {
    let status: TimelineStepStatus;
    if (index < currentIndex || (index === currentIndex && order.status === 'delivered')) {
      status = 'done';
    } else if (index === currentIndex) {
      status = 'active';
    } else {
      status = 'pending';
    }
    const at = step.status === 'placed' ? placedTime(order) : statusEventTime(order, step.status);
    return { label: step.label, sublabel: status === 'pending' ? '' : at, status };
  });
}

export function OrderDetailsScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { order, loading, error, retry } = useOrder(orderId);
  const { fetchOrder } = useOrders();
  const { perform, busy } = useOrderAction(navigation);
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!order) {
    return (
      <OrderLoadState
        title="Order Details"
        loading={loading}
        error={error}
        onBack={() => navigation.goBack()}
        onRetry={retry}
      />
    );
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetchOrder(orderId);
    } catch {
      // keep showing the cached order
    } finally {
      setRefreshing(false);
    }
  }

  const meta = ORDER_STATUS_META[order.status];
  const timeline = buildTimeline(order);
  const isCancellable = VENDOR_CANCELLABLE_STATUSES.includes(order.status);
  const phone = order.contactPhone || order.customerPhone;
  const partner = driverLabel(order);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTextColumn}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Order Details</Text>
            <Text style={styles.headerOrderId}>{order.orderNumber}</Text>
          </View>
          <StatusChip label={meta.label} color={meta.color} background={meta.background} />
        </View>
        {isCancellable ? (
          <Pressable style={styles.iconButton} onPress={() => setMenuOpen(true)}>
            <Icon name="more-vertical" size={17} color={colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <Text style={styles.metaRow}>
          {placedTime(order)} · {order.itemsCount} items · {formatMoney(order.amount)}
        </Text>

        <FormSectionCard title="Order Timeline">
          <StatusTimeline steps={timeline} />
        </FormSectionCard>

        <FormSectionCard title={`Products (${order.itemsCount})`}>
          {order.products.map((product, index) => (
            <View
              key={`${product.productId}-${product.variantId}-${index}`}
              style={[styles.productRow, index < order.products.length - 1 && styles.productRowDivider]}
            >
              <ProductThumb
                imageUrl={product.imageUrl}
                style={styles.productIcon}
                iconSize={16}
                iconColor={colors.textSecondary}
              />
              <View style={styles.productTextColumn}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.productMeta}>
                  {product.variantLabel ? `${product.variantLabel} · ` : ''}
                  {formatMoney(product.price)} × {product.qty}
                </Text>
              </View>
              <Text style={styles.productTotal}>{formatMoney(product.subtotal)}</Text>
            </View>
          ))}
        </FormSectionCard>

        <FormSectionCard title="Customer & Delivery">
          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Icon name="user" size={18} color={colors.primary} />
            </View>
            <View style={styles.customerTextColumn}>
              <Text style={styles.customerName}>{order.contactName || order.customerName}</Text>
              {phone ? <Text style={styles.customerPhone}>{phone}</Text> : null}
            </View>
            {phone ? (
              <Pressable style={styles.callButton} onPress={() => Linking.openURL(`tel:${phone}`)}>
                <Icon name="phone" size={15} color={colors.white} />
              </Pressable>
            ) : null}
          </View>
          <View style={styles.addressCard}>
            <Icon name="pin" size={15} color={colors.textSecondary} />
            <View style={styles.addressTextColumn}>
              <Text style={styles.addressLine}>{order.addressLine1}</Text>
              {order.addressLine2 ? <Text style={styles.addressLine}>{order.addressLine2}</Text> : null}
            </View>
          </View>
          {order.driverId ? (
            <View style={styles.addressCard}>
              <Icon name="bike" size={15} color={colors.textSecondary} />
              <View style={styles.addressTextColumn}>
                <Text style={styles.addressLine}>{partner}</Text>
              </View>
            </View>
          ) : null}
        </FormSectionCard>

        {order.specialInstructions ? (
          <FormSectionCard title="Special Instructions">
            <View style={styles.instructionsBox}>
              <Icon name="file-text" size={15} color={colors.warningDark} />
              <Text style={styles.instructionsText}>{order.specialInstructions}</Text>
            </View>
          </FormSectionCard>
        ) : null}

        <FormSectionCard title="Order Summary">
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({order.itemsCount})</Text>
            <Text style={styles.summaryValue}>{formatMoney(order.itemsTotal)}</Text>
          </View>
          {order.taxTotal ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>{formatMoney(order.taxTotal)}</Text>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Charge</Text>
            <Text style={styles.summaryValue}>{formatMoney(order.deliveryCharge)}</Text>
          </View>
          {order.platformFee ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform Fee</Text>
              <Text style={styles.summaryValue}>{formatMoney(order.platformFee)}</Text>
            </View>
          ) : null}
          {order.discount ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>−{formatMoney(order.discount)}</Text>
            </View>
          ) : null}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Order Total</Text>
            <Text style={styles.summaryTotalValue}>{formatMoney(order.amount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Icon name="check-circle" size={12} color={colors.primary} />
            <Text style={styles.paymentText}>
              {order.paymentMethod} · {order.paymentStatus}
            </Text>
          </View>
        </FormSectionCard>

        {(order.status === 'cancelled' || order.status === 'rejected') && order.cancelReason ? (
          <Text style={styles.reasonNote}>{order.cancelReason}</Text>
        ) : null}
      </ScrollView>

      {order.status === 'placed' ? (
        <View style={styles.footer}>
          <FlexButton
            label="Reject"
            onPress={() => navigation.navigate('RejectReason', { orderId })}
            background={colors.errorSurface}
            textColor={colors.error}
            borderColor={colors.errorBorder}
            flex={1}
            disabled={busy}
          />
          <FlexButton
            label={busy ? 'Accepting…' : 'Accept'}
            onPress={() => perform('accept', orderId)}
            background={colors.primary}
            textColor={colors.white}
            flex={1.2}
            disabled={busy}
          />
        </View>
      ) : null}

      {order.status === 'accepted' || order.status === 'preparing' ? (
        <View style={styles.footer}>
          <FlexButton
            label={order.status === 'accepted' ? 'Start Preparing →' : 'Continue Packing →'}
            onPress={() => navigation.navigate('ProductPicking', { orderId })}
            background={colors.primary}
            textColor={colors.white}
            flex={1}
          />
        </View>
      ) : null}

      {order.status === 'ready_for_pickup' ? (
        <View style={styles.footer}>
          <FlexButton
            label={order.driverId ? 'Partner assigned — view' : 'Waiting for delivery partner'}
            onPress={() => navigation.navigate('ReadyForDispatchConfirm', { orderId })}
            background="#0891B2"
            textColor={colors.white}
            flex={1}
          />
        </View>
      ) : null}

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.menuSheetWrapper} onPress={event => event.stopPropagation()}>
            <SafeAreaView edges={['bottom']} style={styles.menuSheet}>
              <View style={styles.menuHandle} />
              <Pressable
                style={styles.menuOption}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('VendorCancelOrder', { orderId });
                }}
              >
                <Icon name="x-circle" size={16} color={colors.error} />
                <Text style={styles.menuOptionTextDanger}>Cancel Order</Text>
              </Pressable>
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
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
  headerTextColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  headerOrderId: {
    fontFamily: 'Courier',
    fontWeight: '700',
    fontSize: 12,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  metaRow: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  productRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  productIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTextColumn: {
    flex: 1,
    gap: 1,
  },
  productName: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  productMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  productTotal: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerTextColumn: {
    flex: 1,
    gap: 1,
  },
  customerName: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  customerPhone: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  addressTextColumn: {
    flex: 1,
    gap: 1,
  },
  addressLine: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  instructionsBox: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.warningSurface,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  instructionsText: {
    ...typography.caption,
    color: colors.warningDark,
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  summaryTotalLabel: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  summaryTotalValue: {
    ...typography.h3,
    fontSize: 18,
    color: colors.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentText: {
    ...typography.tiny,
    color: colors.primary,
  },
  reasonNote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
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
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuSheetWrapper: {
    width: '100%',
  },
  menuSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  menuHandle: {
    width: 40,
    height: 4,
    borderRadius: 9999,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  menuOptionTextDanger: {
    ...typography.labelSemibold,
    color: colors.error,
  },
});
