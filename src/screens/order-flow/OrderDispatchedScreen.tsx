import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { FlexButton } from './FlexButton';

const DISPATCH_ACCENT = '#4338CA';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrderDispatched'>;

export function OrderDispatchedScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder, completeOrder } = useOrders();
  const order = getOrder(orderId);
  const [completing, setCompleting] = useState(false);
  if (!order) return null;

  async function handleSimulateDelivery() {
    if (completing) return;
    setCompleting(true);
    try {
      await completeOrder(orderId, { rating: 5, review: 'Excellent service!' });
      navigation.replace('OrderDelivered', { orderId });
    } catch (err) {
      Alert.alert('Could not complete order', getApiErrorMessage(err));
    } finally {
      setCompleting(false);
    }
  }

  return (
    <FlowStatusScreen
      icon="truck"
      iconColor="#4338CA"
      iconBg="#EEF2FF"
      iconRingColor="#C7D2FE"
      heading="Order Dispatched!"
      headingSize={24}
      headingWeight="extrabold"
      subtitle={`${order.id} is on its way to ${order.customerName}. Estimated delivery: 11:55 AM.`}
      footer={
        <View style={styles.footerColumn}>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="View All Orders"
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'OrdersList' }] })}
              background={colors.primary}
              textColor={colors.white}
              flex={1}
            />
          </View>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="Back to Dashboard"
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] })}
              background={colors.white}
              textColor={colors.textSecondary}
              borderColor={colors.border}
              flex={1}
            />
          </View>
          <Pressable onPress={handleSimulateDelivery} hitSlop={8} style={styles.demoLinkWrapper} disabled={completing}>
            <Text style={styles.demoLink}>{completing ? 'Updating…' : 'Simulate Delivery (Demo) →'}</Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.detailCard}>
        <View style={styles.detailHeaderRow}>
          <Icon name="bike" size={16} color={DISPATCH_ACCENT} />
          <Text style={styles.detailHeader}>Delivery partner en route</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ETA</Text>
          <Text style={styles.value}>11:55 AM · ~33 min</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Distance</Text>
          <Text style={styles.value}>{(order.distanceLabel ?? '3.0 km away').replace(/\s*away$/, '')} to customer</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>Order</Text>
          <Text style={styles.value}>
            {order.id} · ₹{order.amount}
          </Text>
        </View>
      </View>

      <Text style={styles.note}>You will be notified once the order is delivered. No further action needed.</Text>
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
  demoLinkWrapper: {
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  demoLink: {
    ...typography.tiny,
    color: colors.textTertiary,
  },
});
