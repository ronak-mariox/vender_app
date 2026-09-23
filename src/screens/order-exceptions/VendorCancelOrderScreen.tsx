import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from '../order-flow/FlowStatusScreen';
import { FlexButton } from '../order-flow/FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'VendorCancelOrder'>;

const IMPACT_POINTS = [
  'Customer gets a full refund',
  'Your cancellation rate increases by 1%',
  'May reduce your store visibility temporarily',
  'Order cannot be re-accepted after cancellation',
];

export function VendorCancelOrderScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  return (
    <FlowStatusScreen
      headerTitle="Cancel Order"
      onBack={() => navigation.goBack()}
      icon="x-circle"
      iconColor={colors.error}
      iconBg={colors.errorSurface}
      iconRingColor={colors.errorBorder}
      heading="Cancel This Order?"
      subtitle="Cancelling an accepted order affects your store metrics and the customer experience."
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
            onPress={() => navigation.navigate('CancellationReason', { orderId })}
            background={colors.error}
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
            <Text style={styles.impactText}>
              {index === 0 ? `${point} (₹${order.amount})` : point}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order</Text>
          <Text style={styles.summaryValueMono}>{order.id}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Customer Refund</Text>
          <Text style={styles.summaryValueError}>₹{order.amount}</Text>
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
