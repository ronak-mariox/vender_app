import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { FormSectionCard, StatusChip, StatusTimeline, TimelineStep, TimelineStepStatus } from '../../components';
import { Icon } from '../../icons/Icon';
import { Order, ORDER_STATUS_META, OrderStatus, useOrders } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrderDetails'>;

const STATUS_RANK: Partial<Record<OrderStatus, number>> = {
  new: 0,
  preparing: 1,
  'quality-check': 2,
  packing: 3,
  'ready-for-dispatch': 4,
  dispatched: 5,
  completed: 6,
};

const STEP_SEQUENCE: {
  label: string;
  rank: number;
  historyStatus: OrderStatus;
  instant?: boolean;
}[] = [
  { label: 'Order Placed', rank: 0, historyStatus: 'new', instant: true },
  { label: 'Order Accepted', rank: 1, historyStatus: 'preparing', instant: true },
  { label: 'Preparing', rank: 1, historyStatus: 'preparing' },
  { label: 'Quality Check', rank: 2, historyStatus: 'quality-check' },
  { label: 'Packing', rank: 3, historyStatus: 'packing' },
  { label: 'Ready for Dispatch', rank: 4, historyStatus: 'ready-for-dispatch' },
  { label: 'Dispatched', rank: 5, historyStatus: 'dispatched' },
  { label: 'Delivered', rank: 6, historyStatus: 'completed', instant: true },
];

function buildTimeline(order: Order): TimelineStep[] {
  if (order.status === 'cancelled' || order.status === 'failed') {
    const placed = order.statusHistory.find(event => event.status === 'new');
    const terminal = order.statusHistory[order.statusHistory.length - 1];
    return [
      { label: 'Order Placed', sublabel: placed?.time ?? '', status: 'done' },
      {
        label: order.status === 'cancelled' ? 'Order Cancelled' : 'Order Failed',
        sublabel: terminal?.time ?? '',
        status: 'active',
      },
    ];
  }

  const currentRank = STATUS_RANK[order.status] ?? 0;
  return STEP_SEQUENCE.map(step => {
    const historyEntry = order.statusHistory.find(event => event.status === step.historyStatus);
    let status: TimelineStepStatus;
    if (step.instant) {
      status = currentRank >= step.rank ? 'done' : 'pending';
    } else if (currentRank > step.rank) {
      status = 'done';
    } else if (currentRank === step.rank) {
      status = 'active';
    } else {
      status = 'pending';
    }
    return {
      label: step.label,
      sublabel: status === 'pending' ? '' : status === 'active' ? 'Now' : historyEntry?.time ?? '',
      status,
    };
  });
}

const CANCELLABLE_STATUSES: OrderStatus[] = ['preparing', 'quality-check', 'packing', 'ready-for-dispatch'];

export function OrderDetailsScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const {
    getOrder,
    acceptOrder,
    rejectOrder,
    startQualityCheck,
    passQualityCheck,
    failQualityCheck,
    markPacked,
    handoverToPartner,
  } = useOrders();
  const order = getOrder(orderId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function runAction(action: () => Promise<void>, failureTitle: string) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } catch (err) {
      Alert.alert(failureTitle, getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconButton}>
            <Icon name="arrow-left" size={18} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
      </SafeAreaView>
    );
  }

  const meta = ORDER_STATUS_META[order.status];
  const subtotal = order.amount - order.deliveryCharge;
  const timeline = buildTimeline(order);
  const isCancellable = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTextColumn}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Order Details</Text>
            <Text style={styles.headerOrderId}>{order.id}</Text>
          </View>
          <StatusChip label={meta.label} color={meta.color} background={meta.background} />
        </View>
        <Pressable
          style={styles.iconButton}
          onPress={() =>
            isCancellable ? setMenuOpen(true) : Alert.alert('More Options', 'Coming soon.')
          }
        >
          <Icon name="more-vertical" size={17} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.metaRow}>
          {order.timeLabel} · {order.itemsCount} items · ₹{order.amount}
        </Text>

        <FormSectionCard title="Order Timeline">
          <StatusTimeline steps={timeline} />
        </FormSectionCard>

        <FormSectionCard title={`Products (${order.itemsCount})`}>
          {order.products.map((product, index) => (
            <View
              key={`${product.name}-${index}`}
              style={[styles.productRow, index < order.products.length - 1 && styles.productRowDivider]}
            >
              <View style={styles.productIcon}>
                <Icon name="package" size={16} color={colors.textSecondary} />
              </View>
              <View style={styles.productTextColumn}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.productMeta}>
                  ₹{product.price} × {product.qty}
                </Text>
              </View>
              <Text style={styles.productTotal}>₹{product.price * product.qty}</Text>
            </View>
          ))}
        </FormSectionCard>

        <FormSectionCard title="Customer & Delivery">
          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Icon name="user" size={18} color={colors.primary} />
            </View>
            <View style={styles.customerTextColumn}>
              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.customerPhone}>{order.customerPhone}</Text>
            </View>
            <Pressable
              style={styles.callButton}
              onPress={() => Alert.alert('Call Customer', 'Coming soon.')}
            >
              <Icon name="phone" size={15} color={colors.white} />
            </Pressable>
          </View>
          <View style={styles.addressCard}>
            <Icon name="pin" size={15} color={colors.textSecondary} />
            <View style={styles.addressTextColumn}>
              <Text style={styles.addressLine}>{order.addressLine1}</Text>
              <Text style={styles.addressLine}>{order.addressLine2}</Text>
            </View>
          </View>
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
            <Text style={styles.summaryLabel}>Subtotal ({order.itemsCount} items)</Text>
            <Text style={styles.summaryValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Charge</Text>
            <Text style={styles.summaryValue}>₹{order.deliveryCharge}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Paid</Text>
            <Text style={styles.summaryTotalValue}>₹{order.amount}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Icon name="check-circle" size={12} color={colors.primary} />
            <Text style={styles.paymentText}>{order.paymentMethod}</Text>
          </View>
        </FormSectionCard>

        {order.status === 'cancelled' && order.cancelReason ? (
          <Text style={styles.reasonNote}>{order.cancelReason}</Text>
        ) : null}
        {order.status === 'failed' && order.failReason ? (
          <Text style={styles.reasonNote}>{order.failReason}</Text>
        ) : null}
      </ScrollView>

      {order.status === 'new' ? (
        <View style={styles.footer}>
          <FlexButton
            label="Reject"
            onPress={() => runAction(() => rejectOrder(order.id), 'Could not reject order')}
            background={colors.errorSurface}
            textColor={colors.error}
            borderColor={colors.errorBorder}
            flex={1}
            disabled={busy}
          />
          <FlexButton
            label="Accept"
            onPress={() => runAction(() => acceptOrder(order.id), 'Could not accept order')}
            background={colors.primary}
            textColor={colors.white}
            flex={1.2}
            disabled={busy}
          />
        </View>
      ) : null}

      {order.status === 'preparing' ? (
        <View style={styles.footer}>
          <FlexButton
            label="Start QC →"
            onPress={() => startQualityCheck(order.id)}
            background="#7C3AED"
            textColor={colors.white}
            flex={1}
            disabled={busy}
          />
        </View>
      ) : null}

      {order.status === 'quality-check' ? (
        <View style={styles.footer}>
          <FlexButton
            label="Fail QC"
            onPress={() => runAction(() => failQualityCheck(order.id), 'Could not update order')}
            background={colors.errorSurface}
            textColor={colors.error}
            borderColor={colors.errorBorder}
            flex={1}
            disabled={busy}
          />
          <FlexButton
            label="Pass QC → Packing"
            onPress={() => runAction(() => passQualityCheck(order.id), 'Could not update order')}
            background={colors.primary}
            textColor={colors.white}
            flex={2}
            disabled={busy}
          />
        </View>
      ) : null}

      {order.status === 'packing' ? (
        <View style={styles.footer}>
          <FlexButton
            label="Mark as Packed → Ready for Dispatch"
            onPress={() => runAction(() => markPacked(order.id), 'Could not update order')}
            background="#0891B2"
            textColor={colors.white}
            flex={1}
            disabled={busy}
          />
        </View>
      ) : null}

      {order.status === 'ready-for-dispatch' ? (
        <View style={styles.footer}>
          <FlexButton
            label="Handover →"
            onPress={() => runAction(() => handoverToPartner(order.id), 'Could not update order')}
            background={colors.primary}
            textColor={colors.white}
            flex={1}
            disabled={busy}
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
