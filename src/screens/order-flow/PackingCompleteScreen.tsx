import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'PackingComplete'>;

export function PackingCompleteScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  return (
    <FlowStatusScreen
      icon="package"
      iconColor="#EA580C"
      iconBg="#FFF7ED"
      iconRingColor="#FED7AA"
      heading="Packing Complete!"
      subtitle={`All ${order.products.length} items are packed and ready. Mark the order ready for dispatch.`}
      footer={
        <FlexButton
          label="Mark Ready for Dispatch →"
          onPress={() => navigation.replace('ReadyForDispatchConfirm', { orderId })}
          background="#0891B2"
          textColor={colors.white}
          flex={1}
        />
      }
    >
      <View style={styles.statCard}>
        <View style={[styles.statRow, styles.statRowDivider]}>
          <Text style={styles.statLabel}>Items packed</Text>
          <Text style={styles.statValue}>
            {order.products.length} of {order.products.length}
          </Text>
        </View>
        <View style={[styles.statRow, styles.statRowDivider]}>
          <Text style={styles.statLabel}>Packing time</Text>
          <Text style={styles.statValue}>6 min 42 sec</Text>
        </View>
        <View style={[styles.statRow, styles.statRowLast]}>
          <Text style={styles.statLabel}>Order total</Text>
          <Text style={styles.statValue}>₹{order.amount}</Text>
        </View>
      </View>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  statCard: {
    width: '100%',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  statRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#FED7AA',
  },
  statRowLast: {
    paddingBottom: 0,
  },
  statLabel: {
    ...typography.caption,
    color: '#C2410C',
  },
  statValue: {
    ...typography.captionSemibold,
    color: '#C2410C',
  },
});
