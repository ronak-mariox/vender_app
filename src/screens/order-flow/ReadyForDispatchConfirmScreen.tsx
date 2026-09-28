import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { ORDER_STATUS_META, VENDOR_CANCELLABLE_STATUSES } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { FlexButton } from './FlexButton';
import { formatMoney, statusEventTime, useOrder } from '../orders/orderHelpers';
import { OrderLoadState } from '../orders/OrderLoadState';

type Props = NativeStackScreenProps<AuthStackParamList, 'ReadyForDispatchConfirm'>;

export function ReadyForDispatchConfirmScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { order, loading, error, retry } = useOrder(orderId);

  if (!order) {
    return (
      <OrderLoadState
        title="Ready for Pickup"
        loading={loading}
        error={error}
        onBack={() => navigation.goBack()}
        onRetry={retry}
      />
    );
  }

  const isReady = order.status === 'ready_for_pickup';
  const hasPartner = !!order.driverId;
  const canCancel = VENDOR_CANCELLABLE_STATUSES.includes(order.status);
  const heading = !isReady
    ? ORDER_STATUS_META[order.status].label
    : hasPartner
      ? 'Delivery Partner Assigned'
      : 'Waiting for Delivery Partner';
  const subtitle = !isReady
    ? `${order.orderNumber} has moved on from “Ready for Pickup”.`
    : hasPartner
      ? 'Hand the packed order to the partner when they arrive.'
      : 'The order is packed. A delivery partner will be assigned automatically — keep it at your counter.';
  const driver = order.driver;

  return (
    <FlowStatusScreen
      headerTitle="Ready for Pickup"
      onBack={() => navigation.goBack()}
      icon={hasPartner ? 'bike' : 'truck'}
      iconColor="#0891B2"
      iconBg="#ECFEFF"
      iconRingColor="#A5F3FC"
      heading={heading}
      subtitle={subtitle}
      footer={
        <View style={styles.footerColumn}>
          <View style={styles.footerRow}>
            <FlexButton
              label="Back to Dashboard"
              onPress={() => navigation.popToTop()}
              background={colors.white}
              textColor={colors.textSecondary}
              borderColor={colors.border}
              flex={1}
            />
            <FlexButton
              label={order.status === 'out_for_delivery' ? 'Track Order' : 'Order Details'}
              onPress={() =>
                order.status === 'out_for_delivery'
                  ? navigation.replace('OrderDispatched', { orderId })
                  : navigation.navigate('OrderDetails', { orderId })
              }
              background="#0891B2"
              textColor={colors.white}
              flex={1}
            />
          </View>
          {canCancel ? (
            <Pressable hitSlop={8} onPress={() => navigation.navigate('VendorCancelOrder', { orderId })}>
              <Text style={styles.cancelLink}>Cancel order</Text>
            </Pressable>
          ) : null}
        </View>
      }
    >
      <View style={styles.detailCard}>
        <View style={[styles.row, styles.rowDivider]}>
          <Text style={styles.label}>Order</Text>
          <Text style={styles.value}>{order.orderNumber}</Text>
        </View>
        <View style={[styles.row, styles.rowDivider]}>
          <Text style={styles.label}>Customer</Text>
          <Text style={styles.value}>{order.customerName}</Text>
        </View>
        <View style={[styles.row, styles.rowDivider]}>
          <Text style={styles.label}>Items</Text>
          <Text style={styles.value}>
            {order.itemsCount} items · {formatMoney(order.amount)}
          </Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>Marked ready</Text>
          <Text style={styles.value}>{statusEventTime(order, 'ready_for_pickup') || '—'}</Text>
        </View>
      </View>

      {hasPartner ? (
        <View style={styles.noteRow}>
          <Icon name="user" size={13} color={colors.textSecondary} />
          <View style={styles.partnerColumn}>
            <Text style={styles.partnerName}>{driver?.name ?? 'Delivery partner'}</Text>
            {driver?.vehicle || driver?.plate ? (
              <Text style={styles.noteText}>{[driver?.vehicle, driver?.plate].filter(Boolean).join(' · ')}</Text>
            ) : null}
          </View>
          {driver?.phone ? (
            <Pressable hitSlop={8} onPress={() => Linking.openURL(`tel:${driver.phone}`)}>
              <Icon name="phone" size={16} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={styles.noteRow}>
          <Icon name="info" size={13} color={colors.textSecondary} />
          <Text style={styles.noteText}>
            Delivery partner assignment is managed by the platform. This screen updates automatically.
          </Text>
        </View>
      )}
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  detailCard: {
    width: '100%',
    backgroundColor: '#ECFEFF',
    borderWidth: 1,
    borderColor: '#A5F3FC',
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#A5F3FC',
  },
  rowLast: {
    paddingBottom: 0,
  },
  label: {
    ...typography.caption,
    color: '#0E7490',
  },
  value: {
    ...typography.captionSemibold,
    color: '#0E7490',
  },
  noteRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  footerColumn: {
    gap: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelLink: {
    ...typography.captionSemibold,
    color: colors.error,
    textAlign: 'center',
  },
  partnerColumn: {
    flex: 1,
    gap: 2,
  },
  partnerName: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  noteText: {
    ...typography.tiny,
    color: colors.textSecondary,
    flex: 1,
  },
});
