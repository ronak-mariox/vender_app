import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { ORDER_STATUS_META, VENDOR_CANCELLABLE_STATUSES } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from '../order-flow/FlowStatusScreen';
import { FlexButton } from '../order-flow/FlexButton';
import { formatMoney, useOrder } from '../orders/orderHelpers';
import { OrderLoadState } from '../orders/OrderLoadState';

type Props = NativeStackScreenProps<AuthStackParamList, 'VendorCancelOrder'>;

const IMPACT_POINTS = [
  'The customer will be notified that you cancelled',
  'Cancellations count towards your store cancellation analytics',
  'The order cannot be re-accepted after cancellation',
];

export function VendorCancelOrderScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { order, loading, error, retry } = useOrder(orderId);
  if (!order) {
    return (
      <OrderLoadState
        title="Cancel Order"
        loading={loading}
        error={error}
        onBack={() => navigation.goBack()}
        onRetry={retry}
      />
    );
  }
  const cancellable = VENDOR_CANCELLABLE_STATUSES.includes(order.status);

  return (
    <FlowStatusScreen
      headerTitle="Cancel Order"
      onBack={() => navigation.goBack()}
      icon="x-circle"
      iconColor={colors.error}
      iconBg={colors.errorSurface}
      iconRingColor={colors.errorBorder}
      heading="Cancel This Order?"
      subtitle={
        cancellable
          ? 'Cancelling an accepted order affects the customer experience.'
          : `This order is "${ORDER_STATUS_META[order.status].label}" and can no longer be cancelled by the store.`
      }
      footer={
        <View style={styles.footerRow}>
          <FlexButton
            label="Keep Order"
            onPress={() => navigation.goBack()}
            background={colors.primarySurface}
            textColor={colors.primary}
            borderColor={colors.primaryBorder}
            flex={1}
          />
          <FlexButton
            label="Select Reason →"
            onPress={() => navigation.replace('CancellationReason', { orderId })}
            disabled={!cancellable}
            background={cancellable ? colors.error : colors.textTertiary}
            textColor={colors.white}
            flex={1.9}
          />
        </View>
      }
    >
      <View style={styles.impactCard}>
        <Text style={styles.impactTitle}>Impact of cancelling now:</Text>
        {IMPACT_POINTS.map((point, index) => (
          <View key={point} style={[styles.impactRow, index > 0 && styles.impactRowSpacing]}>
            <Icon name="alert-triangle" size={12} color={colors.error} />
            <Text style={styles.impactText}>{point}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order</Text>
          <Text style={styles.summaryValueMono}>{order.orderNumber}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order Total</Text>
          <Text style={styles.summaryValueError}>{formatMoney(order.amount)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment</Text>
          <Text style={styles.summaryValueMono}>{order.paymentMethod}</Text>
        </View>
      </View>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  impactCard: {
    width: '100%',
    backgroundColor: colors.errorSurface,
    borderWidth: 1.5,
    borderColor: colors.errorBorder,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  impactTitle: {
    ...typography.captionBold,
    color: colors.error,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  impactRowSpacing: {
    paddingTop: spacing.sm,
  },
  impactText: {
    ...typography.caption,
    color: '#B91C1C',
    flex: 1,
    paddingTop: 1,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryValueMono: {
    fontFamily: 'Courier',
    fontWeight: '700',
    fontSize: 12,
    color: colors.textPrimary,
  },
  summaryValueError: {
    ...typography.bodySemibold,
    color: colors.error,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
