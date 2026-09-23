import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'ReadyForDispatchConfirm'>;

export function ReadyForDispatchConfirmScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder, markPacked } = useOrders();
  const order = getOrder(orderId);
  const [confirming, setConfirming] = useState(false);
  if (!order) return null;

  async function handleConfirm() {
    if (confirming) return;
    setConfirming(true);
    try {
      await markPacked(orderId);
      navigation.replace('DispatchQueue', { orderId });
    } catch (err) {
      Alert.alert('Could not update order', getApiErrorMessage(err));
    } finally {
      setConfirming(false);
    }
  }

  return (
    <FlowStatusScreen
      headerTitle="Ready for Dispatch"
      onBack={() => navigation.goBack()}
      icon="truck"
      iconColor="#0891B2"
      iconBg="#ECFEFF"
      iconRingColor="#A5F3FC"
      heading="Mark Ready for Dispatch?"
      subtitle="Once marked ready, the system will assign a delivery partner automatically."
      footer={
        <FlexButton
          label={confirming ? 'Updating…' : 'Mark Ready for Dispatch'}
          onPress={handleConfirm}
          background="#0891B2"
          textColor={colors.white}
          flex={1}
          disabled={confirming}
        />
      }
    >
      <View style={styles.detailCard}>
        <View style={[styles.row, styles.rowDivider]}>
          <Text style={styles.label}>Order</Text>
          <Text style={styles.value}>{order.id}</Text>
        </View>
        <View style={[styles.row, styles.rowDivider]}>
          <Text style={styles.label}>Customer</Text>
          <Text style={styles.value}>
            {order.customerName}, {order.location.split(',').pop()?.trim() ?? order.location}
          </Text>
        </View>
        <View style={[styles.row, styles.rowDivider]}>
          <Text style={styles.label}>Items</Text>
          <Text style={styles.value}>
            {order.products.length} items · ₹{order.amount}
          </Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>Expected delivery</Text>
          <Text style={styles.value}>By 12:00 PM today</Text>
        </View>
      </View>

      <View style={styles.noteRow}>
        <Icon name="info" size={13} color={colors.textSecondary} />
        <Text style={styles.noteText}>
          Delivery partner assignment is managed by the system. Keep the order at your counter.
        </Text>
      </View>
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
  noteText: {
    ...typography.tiny,
    color: colors.textSecondary,
    flex: 1,
  },
});
