import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { FlexButton } from './FlexButton';
import { driverLabel, formatMoney, statusEventTime, useOrder } from '../orders/orderHelpers';
import { OrderLoadState } from '../orders/OrderLoadState';

const DISPATCH_ACCENT = '#4338CA';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrderDispatched'>;

export function OrderDispatchedScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { order, loading, error, retry } = useOrder(orderId);

  if (!order) {
    return (
      <OrderLoadState
        title="Out for Delivery"
        loading={loading}
        error={error}
        onBack={() => navigation.goBack()}
        onRetry={retry}
      />
    );
  }

  const delivered = order.status === 'delivered';
  const pickedUpAt = statusEventTime(order, 'out_for_delivery');
  const partner = driverLabel(order);
  const phone = order.driver?.phone;

  return (
    <FlowStatusScreen
      icon="truck"
      iconColor="#4338CA"
      iconBg="#EEF2FF"
      iconRingColor="#C7D2FE"
      heading={delivered ? 'Order Delivered' : 'Out for Delivery'}
      headingSize={24}
      headingWeight="extrabold"
      subtitle={
        delivered
          ? `${order.orderNumber} has been delivered to ${order.customerName}.`
          : `${order.orderNumber} is on its way to ${order.customerName}.`
      }
      footer={
        <View style={styles.footerColumn}>
          {delivered ? (
            <View style={styles.fullWidthRow}>
              <FlexButton
                label="View Delivery Summary"
                onPress={() => navigation.replace('OrderDelivered', { orderId })}
                background={colors.primary}
                textColor={colors.white}
                flex={1}
              />
            </View>
          ) : null}
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="Order Details"
              onPress={() => navigation.navigate('OrderDetails', { orderId })}
              background={delivered ? colors.white : colors.primary}
              textColor={delivered ? colors.textSecondary : colors.white}
              borderColor={delivered ? colors.border : undefined}
              flex={1}
            />
          </View>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="Back to Dashboard"
              onPress={() => navigation.popToTop()}
              background={colors.white}
              textColor={colors.textSecondary}
              borderColor={colors.border}
              flex={1}
            />
          </View>
        </View>
      }
    >
      <View style={styles.detailCard}>
        <View style={styles.detailHeaderRow}>
          <Icon name="bike" size={16} color={DISPATCH_ACCENT} />
          <Text style={styles.detailHeader}>{partner || 'Delivery partner'}</Text>
          {phone ? (
            <Pressable hitSlop={8} onPress={() => Linking.openURL(`tel:${phone}`)} style={styles.callButton}>
              <Icon name="phone" size={14} color={DISPATCH_ACCENT} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Picked up</Text>
          <Text style={styles.value}>{pickedUpAt || '—'}</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>Order</Text>
          <Text style={styles.value}>
            {order.orderNumber} · {formatMoney(order.amount)}
          </Text>
        </View>
      </View>

      <Text style={styles.note}>The delivery partner updates this order. No further action is needed from you.</Text>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  detailCard: {
    width: '100%',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  detailHeader: {
    ...typography.labelSemibold,
    color: DISPATCH_ACCENT,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#C7D2FE',
  },
  rowLast: {
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  label: {
    ...typography.caption,
    color: DISPATCH_ACCENT,
    opacity: 0.7,
  },
  value: {
    ...typography.captionSemibold,
    color: DISPATCH_ACCENT,
  },
  note: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.md,
  },
  footerColumn: {
    gap: spacing.sm,
  },
  fullWidthRow: {
    flexDirection: 'row',
  },
  callButton: {
    marginLeft: 'auto',
    padding: spacing.xs,
    borderRadius: radii.md,
  },
});
