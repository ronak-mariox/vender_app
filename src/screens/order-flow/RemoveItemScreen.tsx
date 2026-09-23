import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'RemoveItem'>;

export function RemoveItemScreen({ navigation, route }: Props) {
  const { orderId, itemName, itemPrice, itemQty, source } = route.params;
  const { getOrder, removeOrderItem } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  const itemTotal = itemPrice * itemQty;
  const newTotal = order.amount - itemTotal;

  function handleRemove() {
    removeOrderItem(orderId, itemName);
    navigation.replace('OrderUpdated', { orderId, resolution: 'removed', itemName, itemPrice, source });
  }

  return (
    <FlowStatusScreen
      headerTitle="Remove Item"
      onBack={() => navigation.goBack()}
      backButtonShape="circle"
      iconCircleSize={80}
      icon="alert-triangle"
      iconColor={colors.warning}
      iconBg={colors.warningSurface}
      iconRingColor="#FDE68A"
      heading="Remove Item from Order?"
      subtitle="The customer will be notified and refunded for the removed item."
      footer={
        <View style={styles.footerRow}>
          <FlexButton
            label="Cancel"
            onPress={() => navigation.goBack()}
            background={colors.surface}
            textColor={colors.textSecondary}
            borderColor={colors.border}
            flex={1}
          />
          <FlexButton
            label="Remove & Notify Customer"
            onPress={handleRemove}
            background={colors.warning}
            textColor={colors.white}
            flex={1.9}
          />
        </View>
      }
    >
      <View style={styles.itemCard}>
        <Text style={styles.itemName}>{itemName}</Text>
        <Text style={styles.itemMeta}>
          ×{itemQty} · ₹{itemTotal} will be refunded to customer
        </Text>
      </View>

      <View style={styles.totalsCard}>
        <Text style={styles.totalsTitle}>Updated Order Total</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Original Total</Text>
          <Text style={styles.strikethrough}>₹{order.amount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Removed item</Text>
          <Text style={styles.negative}>−₹{itemTotal}</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.newTotalLabel}>New Total</Text>
          <Text style={styles.newTotalValue}>₹{newTotal}</Text>
        </View>
      </View>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    width: '100%',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  itemName: {
    ...typography.bodySemibold,
    color: '#C2410C',
  },
  itemMeta: {
    ...typography.caption,
    color: '#EA580C',
    paddingTop: 2,
  },
  totalsCard: {
    width: '100%',
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  totalsTitle: {
    ...typography.captionSemibold,
    color: colors.primaryDark,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  rowLast: {
    paddingTop: spacing.sm,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  strikethrough: {
    ...typography.caption,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  negative: {
    ...typography.captionSemibold,
    color: colors.error,
  },
  newTotalLabel: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
  newTotalValue: {
    ...typography.h3,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontFamilies.extrabold,
    color: colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
